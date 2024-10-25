import { getEsewaPaymentHash, verifyEsewaPayment } from "../lib/esewa.js";
import Order from "../models/order.model.js";
import Payment from "../models/payment.model.js";
import dotenv from "dotenv";
dotenv.config();

export const initializeEsewa = async (req, res) => {
    try {
        const { products } = req.body;

        if (!Array.isArray(products) || products.length === 0) {
            return res.status(400).json({ error: "Invalid or empty products array" });
        }

        const totalAmount = products.reduce((sum, product) => sum + product.price, 0);


        // Create a record for the purchase
        const purchasedItemData = await Order.create({
            user: req.user._id,
            products: products.map((product) => ({
                product: product._id,
                quantity: product.quantity,
                price: product.price,
            })),
            paymentMethod: "esewa",
            totalAmount: totalAmount,
        });

        // Initiate payment with eSewa
        const paymentInitiate = await getEsewaPaymentHash({
            amount: totalAmount,
            transaction_uuid: purchasedItemData._id,
        });

        let paymentData = {
            amount: totalAmount,
            failure_url: "http://localhost:5173/purchase-cancel",
            product_delivery_charge: "0",
            product_service_charge: "0",
            product_code: process.env.ESEWA_PRODUCT_CODE,
            signature: paymentInitiate.signature,
            signed_field_names: paymentInitiate.signed_field_names,
            success_url: "http://localhost:5173/purchase-success",
            tax_amount: "0",
            total_amount: totalAmount,
            transaction_uuid: purchasedItemData._id,
        };


        res.status(200).json({
            success: true,
            purchasedItemData,
            paymentData,
        });

    } catch (error) {
        console.error(`Error in initializing eSewa payment: ${error.message}`);
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
};

export const completePayment = async (req, res) => {
    const { data } = req.query; // Data received from eSewa's redirect

    try {
        // Verify payment with eSewa
        const paymentInfo = await verifyEsewaPayment(data);

        // Find the purchased item using the transaction UUID
        const purchasedItemData = await Order.findById(
            paymentInfo.response.transaction_uuid
        );

        if (!purchasedItemData) {
            return res.status(500).json({
                success: false,
                message: "Purchase not found",
            });
        }
        
        const existingPayment = await Payment.findOne({ transactionId: paymentInfo.decodedData.transaction_code });
        if (existingPayment) {
            return res.status(409).json({
                success: false,
                message: "Payment has already been processed.",
                paymentData: existingPayment, // Optionally return the existing payment data
            });
        }

        // Create a new payment record in the database
        const paymentData = await Payment.create({
            transactionId: paymentInfo.decodedData.transaction_code,
            orderId: paymentInfo.response.transaction_uuid,
            amount: purchasedItemData.totalAmount,
            dataFromVerificationReq: paymentInfo,
            apiQueryFromUser: req.query,
            paymentGateway: "esewa",
            status: "success",
        });

        // Update the purchased item status to 'completed'
        await Order.findByIdAndUpdate(
            paymentInfo.response.transaction_uuid,
            { $set: { status: "completed" } }
        );

        // Respond with success message
        res.json({
            success: true,
            message: "Payment successful",
            paymentData,
        });
    } catch (error) {
        console.error(`Error in completing eSewa payment: ${error.message}`);
        res.status(500).json({
            success: false,
            message: "An error occurred during payment verification",
            error: error.message,
        });
    }
};