import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
    {
        transactionId: {
            type: String,
            unique: true
        },
        orderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Order",
            required: true,
        },
        amount: {
            type: Number,
            required: true
        },
        dataFromVerificationReq: {
            type: Object
        },
        apiQueryFromUser: {
            type: Object
        },
        paymentGateway: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            enum: ["success", "pending", "failed"],
            default: "pending",
        },
        paymentDate: {
            type: Date,
            default: Date.now
        },
    },
    { timestamps: true }
);
const Payment = mongoose.model("payment", paymentSchema);
export default Payment;