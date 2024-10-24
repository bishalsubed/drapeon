import { create } from "zustand";
import toast from "react-hot-toast";
import axios from "../lib/axios";

export const useCartStore = create((set, get) => ({
    cart: [],
    coupon: null,
    total: 0,
    subTotal: 0,
    loading: false,
    isCouponApplied: false,

    getMyCoupon: async () => {
        try {
            const response = await axios.get("/coupons");
            set({ coupon: response.data });
        } catch (error) {
            console.error("Error fetching coupon:", error);
        }
    },
    applyCoupon: async (code) => {
        try {
            const response = await axios.post("/coupons/validate", { code });
            set({ coupon: response.data, isCouponApplied: true });
            get().calculateTotals();
            toast.success("Coupon applied successfully");
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to apply coupon");
        }
    },
    removeCoupon: () => {
        set({ coupon: null, isCouponApplied: false });
        get().calculateTotals();
        toast.success("Coupon removed");
    },

    getCartItems: async () => {
        set({ loading: true })
        try {
            const res = await axios.get("/cart")
            set({ cart: res.data.cartItems })
            get().calculateTotals()
        } catch (error) {
            set({ cart: [] })
            console.log("Error in getting cart item", error.message)
            toast.error(error.message)
        } finally {
            set({ loading: false })
        }
    },

    addItemToCart: async (product) => {
        set({ loading: true })
        try {
            await axios.post("/cart", { productId: product._id });
            toast.success("Product added to cart");

            set((prevState) => {
                const existingItem = prevState.cart.find((item) => item._id === product._id);
                const newCart = existingItem
                    ? prevState.cart.map((item) =>
                        item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item
                    )
                    : [...prevState.cart, { ...product, quantity: 1 }];
                return { cart: newCart };
            });
            get().calculateTotals();
        } catch (error) {
            set({ cart: [] })
            console.log("Error in adding item to cart", error.message)
            toast.error(error.message)
        } finally {
            set({ loading: false })
        }
    },

    clearCart: async () => {
        set({ cart: [], subTotal: 0, total: 0, coupon: null })
    },

    removeFromCart: async (productId) => {
        set({ loading: true })
        try {
            await axios.delete(`/cart`, { data: { productId } });
            set((prevState) => ({ cart: prevState.cart.filter((item) => item._id !== productId) }));
            get().calculateTotals();
        } catch (error) {
            console.log("Error in removing item from cart", error.message)
            toast.error(error.message)
        } finally {
            set({ loading: false })
        }
    },

    updateQuantity: async (productId, quantity) => {
        set({ loading: true })
        try {
            if (quantity === 0) {
                get().removeFromCart(productId)
                return;
            }
            await axios.put(`/cart/${productId}`, { quantity })
            set((prevState) => ({ cart: prevState.cart.map((item) => (item._id === productId ? { ...item, quantity } : item)) }))
            get().calculateTotals()
        } catch (error) {
            console.log("Error in updating quantity", error.message)
            toast.error(error.message)
        } finally {
            set({ loading: false })
        }
    },

    calculateTotals: () => {
        const { cart, coupon } = get();
        const subTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
        let total = subTotal;
        if (coupon) {
            const discount = (subTotal * coupon.discountPercentage) / 100;
            total = subTotal - discount;
        }
        set({ total, subTotal })
    }
}));