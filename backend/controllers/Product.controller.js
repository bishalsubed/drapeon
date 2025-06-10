import cloudinary from "../lib/cloudinary.js";
import Product from "../models/product.model.js"

export const getAllProducts = async (req, res) => {
    try {
        const products = await Product.find({});
        return res.status(200).json({ success: true, products })
    } catch (error) {
        console.log(`Error in getting all products ${error.message}`)
        return res.status(500).json({ success: false, message: "Error getting all  products" })
    }
}

export const getFeaturedProducts = async (req, res) => {
    try {
        let featuredProducts = await Product.find({ isFeatured: true }).lean();
        if (!featuredProducts) {
            return res.status(500).json({ success: false, message: "Error getting featured products" })
        }
        return res.status(200).json({ success: true, products: featuredProducts })
    }
    catch (error) {
        console.log(`Error in getting featured products ${error.message}`)
        return res.status(500).json({ success: false, message: "Error getting featured products" })
    }
}

export const createProduct = async (req, res) => {
    try {
        const { title, description, price, image, category } = req.body;
        let cloudinaryResponse = null;
        if (image) {
            cloudinaryResponse = await cloudinary.uploader.upload(image, { folder: "products" });
        }
        const product = await Product.create({
            title,
            description,
            price,
            image: cloudinaryResponse?.secure_url ? cloudinaryResponse.secure_url : "",
            category,
        })
        await product.save();
        res.status(201).json({ success: true, message: "Product created successfully", product })
    } catch (error) {
        console.log(`Error in creating product ${error.message}`)
        res.status(500).json({ success: false, message: "Error creating product" })
    }
}


export const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" })
        }
        if (product.image) {
            const publicId = product.image.split("/").pop().split(".")[0]
            try {
                await cloudinary.uploader.destroy(`products/${publicId}`)
                console.log("Image deleted frim cloudinary")
            } catch (error) {
                console.log("Error is deleting image from cloudinary", error.message)
            }
        }
        await Product.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: "Product deleted successfully" })
    } catch (error) {
        console.log(`Error in deleting product ${error.message}`)
        res.status(500).json({ success: false, message: "Error deleting product" })
    }
}

export const getRecommendedProducts = async (req, res) => {
    try {
        const products = await Product.aggregate([
            { $sample: { size: 3 } },
            {
                $project: {
                    _id: 1,
                    title: 1,
                    description: 1,
                    price: 1,
                    image: 1
                }
            }
        ])
        return res.status(200).json({ success: true, products })
    } catch (error) {
        console.log(`Error in getting recommended products ${error.message}`)
        return res.status(500).json({ success: false, message: "Error getting recommended products" })
    }
}
export const getProductsByCategory = async (req, res) => {
    const category = req.params.category;
    try {
        const products = await Product.find({ category }).lean();
        return res.status(200).json({ success: true, products })
    } catch (error) {
        console.log(`Error in getting products by category ${error.message}`)
        return res.status(500).json({ success: false, message: "Error getting products by category" })
    }
}


export const toggleFeaturedProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
        if (product) {
            product.isFeatured = !product.isFeatured
            const upadatedProduct = await product.save()
            return res.status(200).json({ success: true, product: upadatedProduct })
        }
        return res.status(400).json({ success: false, message: "No products found" })
    } catch (error) {
        console.log(`Error in toggling featured product ${error.message}`)
        return res.status(500).json({ success: false, message: "Error toggling featured product" })
    }
}










