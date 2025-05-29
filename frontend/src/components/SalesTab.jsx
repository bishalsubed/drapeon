import React, { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Info, Trash } from 'lucide-react'
import { useOrderStore } from '../stores/useOrderStore'
import { Link } from 'react-router-dom'

const SalesTab = () => {
    const { fetchAllOrders, toggleCompleteStatus, deleteOrder, orders } = useOrderStore();
    const statuses = ["pending", "delivered", "cancelled"]

    useEffect(() => {
        async function fetchData() {
            await fetchAllOrders();
        }
        fetchData();
    }, [fetchAllOrders, toggleCompleteStatus, deleteOrder]);
    console.log("Orders are", orders)


    return (
        <motion.div
            className='bg-gray-800 shadow-lg rounded-lg overflow-hidden max-w-5xl mx-auto'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}>
            {orders.length >0 ?
                (<table className=' min-w-full divide-y divide-gray-700'>
                <thead className='bg-gray-700'>
                    <tr>
                        <th
                            scope='col'
                            className='px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider'
                        >
                            Order Id
                        </th>
                        <th
                            scope='col'
                            className='px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider'
                        >
                            Contact
                        </th>
                        <th
                            scope='col'
                            className='px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider'
                        >
                            Fee
                        </th>
                        <th
                            scope='col'
                            className='px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider'
                        >
                            Destination
                        </th>
                        <th
                            scope='col'
                            className='px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider'
                        >
                            Email
                        </th>

                        <th
                            scope='col'
                            className='px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider'
                        >
                            Status
                        </th>
                        <th
                            scope='col'
                            className='px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider'
                        >
                            Actions
                        </th>
                    </tr>
                </thead>

                <tbody className='bg-gray-800 divide-y divide-gray-700'>
                    {Array.isArray(orders) && orders?.map((order) => (
                        <tr key={order._id} className='hover:bg-gray-700'>
                            <td className='px-6 py-4 whitespace-nowrap'>
                                <div className='text-sm text-gray-300'>{order._id.slice(0, 8)}</div>
                            </td>
                            <td className='px-6 py-4 whitespace-nowrap'>
                                <div className='text-sm font-medium text-white'>{order.phoneNumber}</div>
                                <p className="text-sm text-gray-400 font-semibold">{order?.user?.name}</p>
                            </td>
                            <td className='px-6 py-4 whitespace-nowrap'>
                                <div className='text-sm text-gray-300'>Rs.{order.totalAmount}</div>
                            </td>
                            <td className='px-6 py-4 whitespace-nowrap'>
                                <div className='text-sm text-gray-300'>{order.fullAddress}</div>
                            </td>
                            <td className='px-6 py-4 whitespace-nowrap'>
                                <div className='text-sm text-gray-300'>{order.user.email}</div>
                            </td>
                            <td className='px-6 py-4 whitespace-nowrap'>
                                <select
                                    id='category'
                                    name='category'
                                    value={order.status}
                                    onChange={(e) => toggleCompleteStatus(order._id, e.target.value)}
                                    className='w-full mt-2 px-4 py-2 rounded-xl bg-gray-800 text-white 
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
                            </td>
                            <td className='px-6 py-4 whitespace-nowrap text-sm font-medium'>
                                <div className="flex justify-center items-center gap-4">
                                    <Link to={`/secret-dashboard/order/${order._id}`}><button
                                        className='text-orange-100 hover:text-orange-300'
                                    >
                                        <Info className='h-5 w-5 mt-2' />
                                    </button></Link>
                                    <button
                                        onClick={() => deleteOrder(order._id)}
                                        className='text-red-400 hover:text-red-300'
                                    >
                                        <Trash className='h-5 w-5' />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>): (<p className='text-center text-gray-400 font-semibold p-8'>No Orders Found</p>)}
        </motion.div>
    )
}

export default SalesTab