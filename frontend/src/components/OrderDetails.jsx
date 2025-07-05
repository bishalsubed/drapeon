import { useEffect } from 'react'
import { useOrderStore } from '../stores/useOrderStore'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ChevronLeft } from 'lucide-react'

const OrderDetails = () => {
    const { fetchOrderById, deleteOrder, toggleCompleteStatus, order } = useOrderStore()
    const { orderId } = useParams()
    const navigate = useNavigate()

    const statuses = ['pending', 'delivered', 'cancelled']

    useEffect(() => {
        fetchOrderById(orderId)
    }, [orderId])

    if (!order) return <p className="text-center text-gray-300 mt-10">Order not found.</p>

    const handleDeleteOrder = async (orderId) => {
        if (window.confirm('Are you sure you want to delete this order?')) {
            await deleteOrder(orderId)
            navigate('/secret-dashboard/')
        }
    }

    return (
        <div className="min-h-screen bg-transparent relative overflow-hidden text-white px-4 py-3">
            <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-5xl mx-auto space-y-10 pt-20"
            >
                <h1 className="text-center text-4xl font-extrabold text-orange-400 drop-shadow-lg">
                    Order Details
                </h1>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-gray-800 bg-opacity-70 rounded-3xl p-8 shadow-lg border border-gray-700 space-y-6 backdrop-blur-sm">
                        <div className="space-y-3 text-gray-300">
                            <p>
                                <span className="text-orange-400 font-semibold">Order ID:</span> {order._id}
                            </p>
                            <p>
                                <span className="text-orange-400 font-semibold">Date:</span>{' '}
                                {new Date(order.createdAt).toLocaleDateString()}
                            </p>
                            <div className="mt-4">
                                <label htmlFor={`status-${orderId}`} className="text-orange-400 font-semibold">
                                    Status:{' '}
                                </label>
                                <select
                                    value={order.status}
                                    disabled={order.status === 'delivered'}
                                    onChange={(e) => toggleCompleteStatus(order._id, e.target.value)}
                                    className="w-1/2 px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                                >
                                    <option value="" disabled hidden>
                                        Select status
                                    </option>
                                    {statuses.map((status) => (
                                        <option key={status} value={status} className="capitalize">
                                            {status.charAt(0).toUpperCase() + status.slice(1)}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2 text-gray-300">
                            <p className="text-orange-400 font-semibold text-lg">User Info</p>
                            <p>Email: {order.user?.email}</p>
                            <p>Phone: {order.phoneNumber}</p>
                            <p>Address: {order.fullAddress}</p>
                        </div>

                        <div className="space-y-2 text-gray-300">
                            <p className="text-orange-400 font-semibold text-lg">Payment</p>
                            <p>Amount: Rs {order.totalAmount}</p>
                            <p>Method: {order.paymentMethod}</p>
                            <p>Completed: {order.isPaymentCompleted ? 'Yes' : 'No'}</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {order.products?.map((item) => (
                            <div
                                key={item._id}
                                className="flex flex-col md:flex-row items-start gap-6 bg-gray-800 bg-opacity-70 rounded-2xl p-5 border border-gray-700 shadow-md backdrop-blur-sm"
                            >
                                <img
                                    src={item.product?.image}
                                    alt={item.product?.title}
                                    className="w-full md:w-32 h-32 object-cover rounded-xl"
                                />
                                <div className="flex-1 space-y-1 text-gray-300">
                                    <Link
                                        to={`/category/${item.product?.category}`}
                                        className="text-white font-semibold text-lg hover:text-orange-400 transition"
                                    >
                                        {item.product?.title}
                                    </Link>
                                    <p>Category: {item.product?.category}</p>
                                    <p>Quantity: {item.quantity}</p>
                                    <p className="text-orange-400 font-bold text-xl">Rs. {item.price}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex justify-between pt-4 border-t border-gray-700">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white text-sm px-5 py-3 rounded-2xl transition"
                    >
                        <ChevronLeft className="w-5 h-5" />
                        Back
                    </button>
                    <button
                        onClick={() => handleDeleteOrder(order._id)}
                        className="bg-red-600 hover:bg-red-700 text-white text-sm px-5 py-3 rounded-2xl transition"
                    >
                        Delete Order
                    </button>
                </div>
            </motion.div>
        </div>
    )
}

export default OrderDetails
