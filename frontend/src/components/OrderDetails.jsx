import React, { useEffect } from 'react'
import { useOrderStore } from '../stores/useOrderStore'
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion'
import { ChevronLeft } from 'lucide-react';

const OrderDetails = () => {
    const { fetchOrderById, deleteOrder, toggleCompleteStatus, orders } = useOrderStore();
    const { orderId } = useParams();
    const navigate = useNavigate();



    const statuses = ["pending", "delivered", "cancelled"]

    useEffect(() => {
        async function fetchData() {
            if (orderId) { await fetchOrderById(orderId); }
            if (orders === null) navigate('/secret-dashboard');
        }
        fetchData();
    }, [orderId, fetchOrderById])

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
                    <h3 className="text-lg font-semibold text-orange-300 mb-2">Product Details</h3>
                    {orders?.products?.map((item) => {
                        return <div key={item._id} className='rounded-lg border p-3 shadow-sm border-gray-700 bg-gray-800 md:p-5'>
                            <div className='space-y-4 md:flex md:items-center md:justify-between md:gap-5 md:space-y-0'>
                                <div className='shrink-0 md:order-1'>
                                    <img className='h-20 md:h-32 rounded object-cover' src={item.product?.image} />
                                </div>
                                <div className='flex items-center justify-between md:order-3 md:justify-end'>
                                    <div className='flex items-center gap-2'>
                                        <p>{item.quantity}</p>
                                    </div>

                                    <div className='text-end md:order-4 md:w-32'>
                                        <p className='text-base font-bold text-orange-400'>Rs.{item.price}</p>
                                    </div>
                                </div>

                                <div className='w-full min-w-0 flex-1 space-y-4 md:order-2 md:max-w-md'>
                                    <Link to={`/category/${item.product?.category}`} className='text-base font-semibold text-white hover:text-orange-400 hover:underline'>
                                        {(item.product?.title).toUpperCase()}
                                    </Link>
                                    <p className='text-sm text-gray-400'>Category: {item.product?.category}</p>

                                </div>
                            </div>
                        </div>
                    })}
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