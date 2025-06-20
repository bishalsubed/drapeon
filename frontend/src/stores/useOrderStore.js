import { create } from "zustand";
import toast from "react-hot-toast";
import axios from "../lib/axios";

export const useOrderStore = create((set) => ({
    orders: [],
    loading: false,
    error: null,

    setorders: (orders) => set({ orders }),

    fetchAllOrders: async () => {
        set({ loading: true })
        try {
            const res = await axios.get("/orders")
            set({ orders: res.data.orders })
        } catch (error) {
            console.log(`Error in fetching orders ${error.message}`)
            toast.error(error.message)
        } finally {
            set({ loading: false })
        }
    },

    fetchOrderById: async (orderId) => {
        set({ loading: true })
        try {
            const res = await axios.get(`/orders/${orderId}`)
            set({ orders: res.data.order })
        } catch (error) {
            console.log(`Error in fetching orders by category ${error.message}`)
            toast.error(error.message)
        } finally {
            set({ loading: false })
        }
    },

    toggleCompleteStatus: async (orderId, status) => {
        set({ loading: true });
        try {
            await axios.patch(`/orders/${orderId}`, { status })
            set((prevOrder) => ({
                orders: prevOrder.orders.map((order) => {
                    return order._id === orderId ? { ...order, status } : order
                })
            }))
            toast.success("Order status updated successfully")
        } catch (error) {
            console.log(`Error in toggling featured product ${error.message}`)
            toast.error(error.message)
        } finally {
            set({ loading: false })
        }
    },

    deleteOrder: async (orderId) => {
        set({ loading: true });
        try {
            await axios.delete(`/orders/${orderId}`)
            set((prevOrders) => ({
                orders: prevOrders.orders.filter((order) => order._id !== orderId)
            })
            )
            toast.success("Credential deleted successfully!");
        } catch (error) {
            console.log(`Error in deleting order ${error.message}`)
            toast.error(error.message)
        } finally {
            set({ loading: false })
        }
    },

    getUserOrders: async () => {
        set({ loading: true });
        try {
            const res = await axios.get(`/orders/of-user`)
            set({ orders: res.data.orders })
        } catch (error) {
            console.log(`Error in deleting order ${error.message}`)
            toast.error(error.message)
        } finally {
            set({ loading: false })
        }
    },
}))