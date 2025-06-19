import { getEsewaPaymentHash, verifyEsewaPayment } from "../lib/esewa.js";
import Order from "../models/order.model.js";
import Payment from "../models/payment.model.js";
import dotenv from "dotenv";
dotenv.config();

export const initializeEsewa = async (req, res) => {
    try {
        const { products, phoneNumber, fullAddress, paymentMethod } = req.body;

        if (!Array.isArray(products) || products.length === 0) {
            return res.status(400).json({ message: "Invalid or empty products array" });
        }
        if (!phoneNumber || !fullAddress) {
            return res.status(400).json({ message: "Invalid or empty address or phone number" });
        }

        const totalAmount = products.reduce((sum, product) => sum + product.price * product.quantity, 0);

        const purchasedItemData = await Order.create({
            user: req.user._id,
            phoneNumber: phoneNumber,
            fullAddress: fullAddress,
            products: products.map((product) => ({
                product: product._id,
                quantity: product.quantity,
                price: product.price,
            })),
            paymentMethod: paymentMethod,
            totalAmount: totalAmount,
            status: "pending",
        });
        if (paymentMethod === "esewa") {
            try {
                const paymentInitiate = await getEsewaPaymentHash({
                    amount: totalAmount,
                    transaction_uuid: purchasedItemData._id,
                });

                let paymentData = {
                    amount: totalAmount,
                    failure_url: `${process.env.CLIENT_URL}/purchase-cancel/${purchasedItemData._id}`,
                    product_delivery_charge: "0",
                    product_service_charge: "0",
                    product_code: process.env.ESEWA_PRODUCT_CODE,
                    signature: paymentInitiate.signature,
                    signed_field_names: paymentInitiate.signed_field_names,
                    success_url: `${process.env.CLIENT_URL}/purchase-success`,
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
                console.error(`Error in processing eSewa payment: ${error.message}`);
                return res.status(500).json({
                    success: false,
                    message: "An error occurred while processing the payment",
                    error: error.message,
                });
            }
        }
        else if (paymentMethod === "cod") {
            try {
                const essestialPurchasedItemData={
                    orderId: purchasedItemData._id,
                    totalAmount: purchasedItemData.totalAmount,
                    paymentMethod: purchasedItemData.paymentMethod,
                }
                const jsonString = JSON.stringify(essestialPurchasedItemData);

                const base64Data = Buffer.from(jsonString).toString('base64');

                const redirectUrl = `http://localhost:5173/purchase-success?encodedData=${encodeURIComponent(base64Data)}`;
                res.status(200).json({ redirectUrl });
            } catch (error) {
                console.error(`Error in processing COD payment: ${error.message}`);
                return res.status(500).json({
                    success: false,
                    message: "An error occurred while processing the payment",
                    error: error.message,
                });
            }
        } else {
            return res.status(400).json({
                success: false,
                message: "Invalid payment method",
            });
        }
    } catch (error) {
        console.error(`Error in initializing eSewa payment: ${error.message}`);
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
};

export const completePayment = async (req, res) => {
    const { data } = req.query;

    try {
        const paymentInfo = await verifyEsewaPayment(data);

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
                paymentData: existingPayment,
            });
        }

        const paymentData = await Payment.create({
            transactionId: paymentInfo.decodedData.transaction_code,
            orderId: paymentInfo.response.transaction_uuid,
            amount: purchasedItemData.totalAmount,
            dataFromVerificationReq: paymentInfo,
            apiQueryFromUser: req.query,
            paymentGateway: "esewa",
            status: "success",
        });

        await Order.findByIdAndUpdate(
            paymentInfo.response.transaction_uuid,
            {
                $set: {
                    isPaymentCompleted: true,
                    paymentInfo: paymentData._id,
                }
            }
        );

        res.json({
            success: true,
            message: "Payment successful",
            paymentData,
            purchasedItemData
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


export const failedPayment = async (req, res) => {
    try {
        const { id } = req.params;

        const purchasedItemData = await Order.findById(
            id
        );

        if (!purchasedItemData) {
            return res.status(500).json({
                success: false,
                message: "Purchase not found",
            });
        }
        await Order.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: "Payment failed, order has been deleted",
            orderId: id,
        })
    } catch (error) {
        console.error(`Error in handling failed payment: ${error.message}`);
        res.status(500).json({
            success: false,
            message: "An error occurred while processing the failed payment",
            error: error.message,
        });
    }
}