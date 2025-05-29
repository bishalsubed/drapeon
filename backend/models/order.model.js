import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
	{
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		phoneNumber: {
			type: String,
			required: true,
			minlength: 10,
			maxlength: 10,
			validate: {
				validator: function (v) {
					return v.length === 10;
				},
				message: props => `${props.value} must be exactly 10 characters!`
			}
		},
		fullAddress: {
			type: String,
			required: true,
		},
		products: [
			{
				product: {
					type: mongoose.Schema.Types.ObjectId,
					ref: "Product",
					required: true,
				},
				quantity: {
					type: Number,
					required: true,
					min: 1,
				},
				price: {
					type: Number,
					required: true,
					min: 0,
				},
			},
		],
		totalAmount: {
			type: Number,
			required: true,
			min: 0,
		},
		paymentMethod: {
			type: String,
			enum: ["esewa", "cod"],
			required: true
		},
		isPaymentCompleted: {
			type: Boolean,
			default: false
		},
		paymentInfo: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "payment"
		},
		status: {
			type: String,
			enum: ["pending", "delivered", "cancelled"],
			default: "pending"
		}
	},
	{ timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);

export default Order;