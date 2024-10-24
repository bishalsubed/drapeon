import Product from "../models/product.model.js";

export const addToCart = async (req, res) => {
    try {
        const { productId } = req.body;
        const user = req.user;
        const existingItem = await user.cartItems.find((item)=> item.id === productId )
        if(existingItem){
            existingItem.quantity += 1;
            await user.save();
        }else{
            user.cartItems.push(productId)
        }
        await user.save();
        return res.status(200).json({ success: true, message: "Product added to cart", user })  
    } catch (error) {
        console.log(`Error in adding to cart ${error.message}`)
        res.status(500).json({ success: false, message: "Error adding to cart" })
    }
}

export const deleteAllFromCart = async (req, res) => {
    try {
        const {productId} = req.body;
        const user = req.user;
        if(!productId){
            user.cartItems = [];
        }else{
            user.cartItems = user.cartItems.filter(item => item.id !== productId);
        }
        await user.save();
        res.status(200).json({ success: true, message: "All products deleted from cart", user })
    } catch (error) {
        console.log(`Error in deleting all from cart ${error.message}`)
        res.status(500).json({ success: false, message: "Error deleting all from cart" })
    }
}

export const getCartProducts = async (req, res) => {
    try {
        const products = await Product.find({_id:{$in:req.user.cartItems}})
        const cartItems =  products.map(product => {
            const item = req.user.cartItems.find(cartItem => cartItem.id === product.id);
            return {...product.toJSON(),quantity:item.quantity}
        })
        res.status(200).json({ success: true, cartItems })
    } catch (error) {
        console.log(`Error in getting cart products ${error.message}`)
        res.status(500).json({ success: false, message: "Error getting cart products" })
    }
}

export const updateQuantity = async (req, res) => {
    try {
        const {id: productId} = req.params;
        const {quantity} = req.body;
        const user = req.user;
        const existingItem =  await user.cartItems.find((item)=> item.id === productId )
        if(existingItem){
            if(existingItem.quantity === 0){
                user.cartItems = user.cartItems.filter(item => item.id !== productId);
                await user.save();  
                res.status(200).json({ success: true, user })
                
            }else{
                existingItem.quantity = quantity;
                await user.save();
                res.status(200).json({ success: true, user })
            }
        }else{
            res.status(404).json({ success: false, message: "Product not found in cart" })
        }
    } catch (error) {
        console.log(`Error in updating quantity ${error.message}`)
        res.status(500).json({ success: false, message: "Error updating quantity" })
    }
}
