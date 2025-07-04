import { useEffect } from 'react'
import { useOrderStore } from '../stores/useOrderStore';
import { Link } from "react-router-dom"
import { motion } from "framer-motion";
import { cn } from "../lib/utils";
const MyOrdersPage = () => {

    const { getUserOrders, orders, toggleCompleteStatus } = useOrderStore();

    useEffect(() => {
        getUserOrders();
    }, [])

    const statusStyles = {
        pending: "bg-yellow-600/20 text-yellow-400",
        delivered: "bg-green-600/20 text-green-400",
        cancelled: "bg-red-600/20 text-red-400",
    };

    const isOrderOlderThan24Hours = (createdAt) => {
        const orderedDate = new Date(createdAt);
        const currentDate = new Date();
        const timeDifference = currentDate - orderedDate;
        return timeDifference > 24 * 60 * 60 * 1000;
    }


    return (
        <motion.div
            className="max-w-5xl mx-auto mt-10 space-y-6 px-4 py-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            <h2 className="text-3xl font-bold text-white mb-2">Your Orders</h2>

            {orders?.length === 0 ? (
                <p className="text-gray-400 text-sm">You have no orders yet.</p>
            ) : (
                orders.map((order) => (
                    <motion.div
                        key={order._id}
                        className="bg-gray-800 rounded-2xl shadow-md hover:shadow-lg transition p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                        whileHover={{ scale: 1.01 }}
                    >
                        <div className="space-y-2">
                            <p className="text-white font-semibold text-lg">
                                Order #{order._id.slice(0, 8)}
                            </p>
                            <p className="text-gray-400 text-sm">
                                Placed on: {new Date(order.createdAt).toLocaleDateString()}
                            </p>
                            <div className="text-gray-400 text-sm">
                                Items: {order.products.reduce((accumulator, currentValue) => accumulator + currentValue.product.title + ", ", "",)}
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                                <span
                                    className={cn(
                                        "text-xs px-2 py-0.5 rounded-full font-medium capitalize",
                                        statusStyles[order.status] || "bg-gray-700 text-gray-300"
                                    )}
                                >
                                    {order.status}
                                </span>
                                <span className="text-sm text-gray-300">
                                    • Rs. {order.totalAmount}
                                </span>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 text-sm font-medium">
                            <Link to={`/my-order/${order._id}`}>
                                <button className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg transition">
                                    View Details
                                </button>
                            </Link>
                            {order.status === "pending" && (
                                <button className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-lg transition text-sm font-medium disabled:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50" disabled={isOrderOlderThan24Hours(order.createdAt)} onClick={() => toggleCompleteStatus(order._id, "cancelled")}>
                                    Cancel
                                </button>
                            )}
                        </div>
                    </motion.div>
                ))
            )}
        </motion.div>
    )
}

export default MyOrdersPage