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

    forgotPassword: async (email) => {
        set({ loading: true, message: null });
        try {
            const response = await axios.post(`/auth/forgot-password`, { email })
            set({ message: response.data.message, loading: false })
        } catch (error) {
            set({ error: error.response.data.message || "Error sending forgot password request", loading: false, })
            throw error
        }
    },
    resetPassword: async (token, password) => {
        set({ loading: true, message: null });
        try {
            const response = await axios.post(`/auth/reset-password/${token}`, { password })
            set({ message: response.data.message, loading: false })
        } catch (error) {
            set({ error: error.response.data.message || "Error sending forgot password request", loading: false, })
            throw error
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

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });

    failedQueue = [];
};


axios.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                return new Promise(function (resolve, reject) {
                    failedQueue.push({ resolve, reject });
                }).then((token) => {
                    originalRequest.headers["Authorization"] = `Bearer ${token}`;
                    return axios(originalRequest);
                })
                    .catch((err) => Promise.reject(err));
            }
            originalRequest._retry = true;
            isRefreshing = true;
            try {
                const data = await useUserStore.getState().refreshToken();
                const newAccessToken = data?.accessToken;
                processQueue(null, newAccessToken);
                originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
                return axios(originalRequest);
            } catch (error) {
                processQueue(error, null);
                useUserStore.getState().logout();
                return Promise.reject(error);
            } finally {
                isRefreshing = false;
            }
        }
        return Promise.reject(error);
    }
)