import Order from "../models/order.model.js";

export const getOrderById = async (req, res) => {
    try {
        const { orderId } = req.params;
        if (!orderId) {
            return res.status(400).json({ success: false, message: "Order ID is required" });
        }
        const order = await Order.findById(orderId).populate("user", "name email").populate("products.product", "title image category")
        return res.status(200).json({ success: true, order });
    } catch (error) {
        console.log(`Error in getting order by ID: ${error.message}`);
        res.status(500).json({ success: false, message: "Error in getting order by ID" });
    }
}

export const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find({}).populate("user", "name email").populate("products.product", "title image category")
        return res.status(200).json({success:true, orders})
    } catch (error) {
        console.log(`Error in getting all order: ${error.message}`);
        res.status(500).json({ success: false, message: "Error in getting all order" });
    }
}

export const deleteOrder = async(req, res) => {
    try {
        const {orderId} = req.params;
        if (!orderId) {
            return res.status(400).json({ success: false, message: "Order ID is required" });
        }
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }
        await Order.findByIdAndDelete(orderId);
        return res.status(200).json({ success: true, message: "Order deleted successfully" });
    } catch (error) {
        console.log(`Error in deleting order: ${error.message}`);
        res.status(500).json({ success: false, message: "Error in deleting order" });
    }
}

export const changeOrderStatus = async(req, res) => {
    try {
        const { orderId } = req.params;
        const { status } = req.body;
        if (!orderId || !status) {
            return res.status(400).json({ success: false, message: "Order ID and status are required" });
        }
        const validstatuses = ["pending", "delivered", "cancelled"]
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }
        if (!validstatuses.includes(status)) {
            return res.status(400).json({ success: false, message: "Invalid status" });
        }
        order.status = status;
        await Order.findByIdAndUpdate(orderId, order, { new: true });
        return res.status(200).json({ success: true, message: "Order status changed successfully", order });
    } catch (error) {
        console.log(`Error in changing order status: ${error.message}`);
        res.status(500).json({ success: false, message: "Error in changing order status" });
        
    }
}