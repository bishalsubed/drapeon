import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Info, Trash } from 'lucide-react'
import { useOrderStore } from '../stores/useOrderStore'
import { Link } from 'react-router-dom'

const SalesTab = () => {
    const { fetchAllOrders, toggleCompleteStatus, orders, deleteOrder } = useOrderStore()
    const statuses = ['pending', 'delivered', 'cancelled']

    useEffect(() => {
        fetchAllOrders()
    }, [deleteOrder, toggleCompleteStatus])

    const STATUS_COLORS = {
        pending: 'bg-yellow-400 text-black',
        cancelled: 'bg-red-600 text-white',
        delivered: 'bg-green-500 text-white',
    }

    return (
        <motion.div
            className="bg-gray-900 rounded-2xl shadow-xl overflow-x-auto border border-gray-800 max-w-7xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
        >
            {orders.length > 0 ? (
                <table className="min-w-full divide-y divide-gray-800">
                    <thead className="bg-gray-800 sticky top-0 z-10">
                        <tr>
                            {[
                                'Order ID',
                                'Contact',
                                'Fee',
                                'Destination',
                                'Email',
                                'Status',
                                'Actions',
                            ].map((heading) => (
                                <th
                                    key={heading}
                                    className="px-6 py-4 text-left text-xs font-semibold tracking-wider text-gray-400 uppercase"
                                >
                                    {heading}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800 bg-gray-900">
                        {orders.map((order) => (
                            <tr
                                key={order._id}
                                className="hover:bg-gray-800/70 transition duration-200"
                            >
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <p className="text-sm text-gray-300">{order._id.slice(0, 8)}</p>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <p className="text-sm font-medium text-white">
                                        {order.phoneNumber}
                                    </p>
                                    <p className="text-xs text-gray-400 font-semibold">
                                        {order?.user?.name}
                                    </p>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <p className="text-sm text-orange-300 font-medium">
                                        Rs. {order.totalAmount}
                                    </p>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <p className="text-sm text-gray-300">{order.fullAddress}</p>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <p className="text-sm text-gray-300">{order.user.email}</p>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span
                                        className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${STATUS_COLORS[order.status]}`}
                                    >
                                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center gap-4">
                                        <Link to={`/secret-dashboard/order/${order._id}`}>
                                            <button className="p-2 rounded-full bg-gray-700 hover:bg-orange-600 transition text-white">
                                                <Info className="w-4 h-4" />
                                            </button>
                                        </Link>
                                        <button
                                            onClick={() => deleteOrder(order._id)}
                                            className="p-2 rounded-full bg-gray-700 hover:bg-red-600 transition text-white"
                                        >
                                            <Trash className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p className="text-center text-gray-400 font-semibold p-8">No Orders Found</p>
            )}
        </motion.div>
    )
}

export default SalesTab
