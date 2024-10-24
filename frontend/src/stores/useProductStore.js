import { create } from "zustand";
import toast from "react-hot-toast";
import axios from "../lib/axios";

export const useProductStore = create((set) => ({
    products: [],
    loading: false,
    error: null,

    setProducts: (products) => set({ products }),

    
    createProduct: async (productData) => {
        set({ loading: true })
        try {
            const res = await axios.post('/products', productData)
            set((prevProduct) => ({ products: [...prevProduct.products, res.data] }))
            toast.success('Product created successfully')
        } catch (error) {
            console.log(`Error in creating product ${error.message}`)
            toast.error(error.message)
        } finally {
            set({ loading: false })
        }
    },
    
    fetchAllProducts: async () => {
        set({ loading: true })
        try {
            const res = await axios.get("/products")
            set({ products: res.data.products })
        } catch (error) {
            console.log(`Error in fetching products ${error.message}`)
            toast.error(error.message)
        }finally{
            set({ loading: false })
        }
    },

    fetchProductsByCategory: async (category) => {
        set({ loading: true })
        try {
            const res = await axios.get(`/products/category/${category}`)
            set({ products: res.data.products })
        } catch (error) {
            console.log(`Error in fetching products by category ${error.message}`)
            toast.error(error.message)
        }finally{
            set({loading:false})
        }
    },
    
    toggleFeaturedProduct: async (productId) => {
        set({ loading: true });
        try {
            const res  = await axios.patch(`/products/${productId}`)
            set((prevProducts)=> ({
                products: prevProducts.products.map((product) =>
					product._id === productId ? { ...product, isFeatured: res.data.isFeatured } : product
				),
            }))
        } catch (error) {
            console.log(`Error in toggling featured product ${error.message}`)
            toast.error(error.message)
        }finally{
            set({ loading: false })
        }
    },
    
    deleteProduct: async (productId) => {
        set({ loading: true });
        try {
            const res  = await axios.delete(`/products/${productId}`)
            set((prevProduct)=> ({
                products: prevProduct.products.filter((product)=> {
                    product.id !== productId    
                })
            }))
        } catch (error) {
            console.log(`Error in deleting product ${error.message}`)
            toast.error(error.message)
        }finally{
            set({ loading: false })
        }
    }, 

    fetchFeaturedProducts: async () => {
		set({ loading: true });
		try {
			const response = await axios.get("/products/featured");
			set({ products: response.data, loading: false });
		} catch (error) {
			set({ error: "Failed to fetch products", loading: false });
			console.log("Error fetching featured products:", error);
		}
	},

}))