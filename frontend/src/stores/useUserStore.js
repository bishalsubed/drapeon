import { create } from "zustand";
import axios from "../lib/axios";
import { toast } from "react-hot-toast";

export const useUserStore = create((set, get) => ({
    user: null,
    loading: false,
    checkingAuth: true,

    signUp: async ({ name, email, password, confirmPassword }) => {
        set({ loading: true });

        if (password !== confirmPassword) {
            set({ loading: false });
            return toast.error("Passwords do not match");
        }

        try {
            const response = await axios.post("/auth/signup", { name, email, password });
            set({ user: response.data.user });
            toast.success("Signup successful!");

        } catch (error) {
            toast.error(error.response?.data?.message || "An error occurred, please try again later");

        } finally {
            set({ loading: false });
        }
    },

    login: async (email, password) => {
        set({ loading: true });


        try {
            const response = await axios.post("/auth/login", { email, password });
            set({ user: response.data.user });
            toast.success("Login successful!");

        } catch (error) {
            console.log(error.response.data.message)
            toast.error(error.response?.data?.message || "An error occurred, please try again later");

        } finally {
            set({ loading: false });
        }
    },
    logout: async () => {
        set({ loading: true });

        try {
            const response = await axios.post("/auth/logout");
            set({ user: null });
            toast.success("Logout successful!");

        } catch (error) {
            console.log(error.response.data.message)
            toast.error(error.response?.data?.message || "An error occurred, please try again later");

        } finally {
            set({ loading: false });
        }
    },

    checkAuth: async () => {
        set({ loading: true });
        set({ checkingAuth: true });
        try {
            const response = await axios.get("/auth/profile");
            set({ user: response.data.user, checkingAuth: false });
        } catch (error) {
            set({ user: null, checkingAuth: false });
        } finally {
            set({ loading: false });
        }
    },
    refreshToken: async () => {
        // Prevent multiple simultaneous refresh attempts
        if (get().checkingAuth) return;

        set({ checkingAuth: true });
        try {
            const response = await axios.post("/auth/refresh-token");
            set({ checkingAuth: false });
            return response.data;
        } catch (error) {
            set({ user: null, checkingAuth: false });
            throw error;
        }
    },
}));

let refreshPromise = null;

axios.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                // If a refresh is already in progress, wait for it to complete
                if (refreshPromise) {
                    await refreshPromise;
                    return axios(originalRequest);
                }

                // Start a new refresh process
                refreshPromise = useUserStore.getState().refreshToken();
                await refreshPromise;

                return axios(originalRequest);
            } catch (refreshError) {
                // If refresh fails, log the user out and notify them
                useUserStore.getState().logout();
                toast.error("Session expired. Please log in again.");
                return Promise.reject(refreshError);
            } finally {
                refreshPromise = null; // Ensure this is always reset
            }
        }
        return Promise.reject(error);
    }
);
