import React, { useEffect } from 'react'
import { useOrderStore } from '../stores/useOrderStore'
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion'
import { ChevronLeft } from 'lucide-react';

const OrderDetails = () => {
    const { fetchOrderById, deleteOrder, toggleCompleteStatus, orders } = useOrderStore();
    const { orderId } = useParams();
    const navigate = useNavigate();

    
    
    const statuses = ["pending", "delivered", "cancelled"]
    
    useEffect(() => {
        async function fetchData(){
        if (orderId) { await fetchOrderById(orderId); }
        if(orders === null) navigate('/secret-dashboard');
        }
        fetchData();
    }, [orderId, fetchOrderById])
    console.log("Order is", orders)

    const handleDeleteOrder = async (orderId) => {
        if (window.confirm("Are you sure you want to delete this order?")) {
            await deleteOrder(orderId);
            navigate('/secret-dashboard/');
        }
    }

    return (
        <div className='min-h-screen relative overflow-hidden'>
            <div className='relative z-10 container mx-auto px-4 py-10'>
                <motion.h1
                    className='text-4xl font-bold mb-5 text-orange-400 text-center'
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    Order Details
                </motion.h1>
            </div>
            <motion.div
                className="bg-gray-800 shadow-lg rounded-2xl overflow-hidden max-w-4xl mx-auto px-8 py-6 mt-6 text-white"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
            >
                <div className="space-y-4">
                    <div>
                        <span className="text-gray-400 font-medium">Order ID:</span>
                        <span className="ml-2 text-orange-400">{orders?._id}</span>
                    </div>
                    <div>
                        <span className="text-gray-400 font-medium">Order Date:</span>
                        <span className="ml-2">{new Date(orders?.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className='flex items-center space-x-4'>
                        <span className="text-gray-400 font-medium">Status:</span>
                        <select
                                    id='category'
                                    name='category'
                                    value={orders.status}
                                    onChange={(e) => toggleCompleteStatus(orders._id, e.target.value)}
                                    className='mt-2 px-4 py-2 rounded-xl bg-gray-800 text-white 
             border border-gray-600 focus:outline-none focus:ring-1
             focus:ring-orange-500 focus:border-orange-500 
             transition duration-150 ease-in-out shadow-sm'
                                    required
                                >
                                    <option value=''>Select a category</option>
                                    {statuses.map((status) => (
                                        <option key={status} value={status}>
                                            {status.charAt(0).toUpperCase() + status.slice(1)}
                                        </option>
                                    ))}
                                </select>
                    </div>
                </div>

                <div className="border-t border-gray-700 my-6"></div>

                <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-orange-300 mb-2">User Details</h3>
                    <p><span className="text-gray-400 font-medium">Email:</span> <span className="ml-1">{orders?.user?.email}</span></p>
                    <p><span className="text-gray-400 font-medium">Contact:</span> <span className="ml-1">{orders?.phoneNumber}</span></p>
                    <p><span className="text-gray-400 font-medium">Delivery Address:</span> <span className="ml-1">{orders?.fullAddress}</span></p>
                </div>

                <div className="border-t border-gray-700 my-6"></div>

                <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-orange-300 mb-2">Payment Info</h3>
                    <p><span className="text-gray-400 font-medium">Amount:</span> <span className="ml-1">Rs {orders?.totalAmount}</span></p>
                    <p><span className="text-gray-400 font-medium">Method:</span> <span className="ml-1 capitalize">{orders?.paymentMethod}</span></p>
                    <p><span className="text-gray-400 font-medium">Payment Completed:</span> <span className="ml-1">{orders?.isPaymentCompleted ? "Yes" : "No"}</span></p>
                </div>

                <div className="mt-8 flex justify-between items-center">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center bg-gray-400 hover:bg-gray-300 text-black py-2 px-4 rounded-lg font-semibold transition duration-200 shadow-sm"
                    >
                        <ChevronLeft className='size-4 mt-1' />
                        Back
                    </button>
                    <button
                        onClick={() => handleDeleteOrder(orders._id)}
                        className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg font-semibold transition duration-200 shadow-sm"
                    >
                        Delete Order
                    </button>
                </div>
            </motion.div>

        </div>
    )
}

export default OrderDetails