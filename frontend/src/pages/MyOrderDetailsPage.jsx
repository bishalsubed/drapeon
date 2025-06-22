import { motion } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";
import { useOrderStore } from "../stores/useOrderStore";
import { useEffect } from "react";
import { cn } from "../lib/utils";

const MyOrderDetailsPage = () => {

    const { fetchOrderById, order } = useOrderStore();
    const { id } = useParams();
    const navigate = useNavigate();


    useEffect(() => {
        fetchOrderById(id);
    }, [id]);

    const statusColor = {
        pending: "bg-yellow-100 text-yellow-800",
        delivered: "bg-green-100 text-green-800",
        cancelled: "bg-red-100 text-red-800",
    };

    if (!order) return <p className="text-white text-center mt-10">Order not found.</p>;


    return (
        <motion.div
            className="max-w-5xl mx-auto mt-10 px-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
        >
            <button
                className="flex items-center text-sm text-orange-400 hover:text-orange-300 transition mb-6 font-medium"
                onClick={() => navigate(-1)}
            >
                <span className="mr-1 text-lg">←</span> Back to Orders
            </button>

            <div className="bg-gray-800 p-6 rounded-2xl shadow-xl space-y-6 text-gray-100">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <h3 className="text-2xl font-semibold text-white">
                        Order #{order._id.slice(0, 8)}
                    </h3>
                    <span
                        className={cn(
                            "text-sm px-3 py-1 rounded-full font-medium capitalize",
                            statusColor[order.status] || "bg-gray-700 text-gray-300"
                        )}
                    >
                        {order.status}
                    </span>
                </div>

                <div className="grid sm:grid-cols-2 gap-4 text-sm text-gray-300">
                    <div>
                        <p><strong>Placed on:</strong> {new Date(order.createdAt).toLocaleString()}</p>
                        <p><strong>Payment:</strong> {order.paymentMethod} ({order.isPaymentCompleted ? "Completed" : "Pending"})</p>
                        <p><strong>Total Amount:</strong> Rs. {order.totalAmount}</p>
                    </div>
                    <div>
                        <p><strong>Customer:</strong> {order.user?.name}</p>
                        <p><strong>Phone:</strong> {order.phoneNumber}</p>
                        <p><strong>Address:</strong> {order.fullAddress}</p>
                    </div>
                </div>

                <div>
                    <h4 className="text-lg font-semibold text-white mb-3">Products</h4>
                    <div className="divide-y divide-gray-700">
                        {order.products.map((item) => (
                            <div key={item._id} className="py-4 flex items-center gap-4">
                                <img
                                    src={item.product.image}
                                    alt={item.product.title}
                                    className="w-16 h-16 object-cover rounded-lg border border-gray-700"
                                />
                                <div className="flex-1">
                                    <p className="font-medium text-white">{item.product.title}</p>
                                    <p className="text-sm text-gray-400">
                                        Qty: {item.quantity} × Rs.{item.price}
                                    </p>
                                </div>
                                <div className="font-semibold text-gray-200">
                                    Rs.{item.quantity * item.price}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex justify-between items-center mt-4">
                    <div />
                    <div className="text-lg font-bold text-white">
                        Total: Rs. {order.totalAmount}
                    </div>
                </div>

                {order.status === "pending" && (
                    <div className="text-right">
                        <button className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-lg transition text-sm font-medium">
                            Cancel Order
                        </button>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default MyOrderDetailsPage;
