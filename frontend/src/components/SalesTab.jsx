import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Info, Search, Trash } from 'lucide-react'
import { useOrderStore } from '../stores/useOrderStore'
import { Link } from 'react-router-dom'

const SalesTab = () => {
    const { fetchAllOrders, orders, deleteOrder, getOrderViaSearch } = useOrderStore()
    const [filter, setFilter] = useState('all')
    const [searchedNumber, setSearchedNumber] = useState("")

    useEffect(() => {
        fetchAllOrders()
    }, [deleteOrder])

    const statusColors = {
        pending: 'bg-yellow-400 text-black',
        cancelled: 'bg-red-600 text-white',
        delivered: 'bg-green-500 text-white',
    }

    const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter)


    return (
        <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="rounded-3xl border border-gray-800/80 bg-gray-900/60 shadow-2xl backdrop-blur-xl overflow-x-auto max-w-7xl mx-auto"
        >
            <div className="flex items-center justify-between gap-4 px-6 py-4 sticky top-0 z-30 bg-gray-900/80 backdrop-blur-lg">
                <h2 className="text-lg font-semibold text-white">Sales Overview</h2>
                <div className='flex items-center justify-between gap-4'>
                    <div className='relative'>
                        <input
                            type='text'
                            className='w-56 px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-base text-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500'
                            placeholder='Enter Order Id'
                            onChange={(e) => setSearchedNumber(e.target.value)}
                        />
                        <Search onClick={()=>{getOrderViaSearch(searchedNumber)}} className='absolute size-[20px] right-3 top-[10px] text-gray-400 cursor-pointer hover:text-orange-500 hover:scale-105 transition duration-100 ease-in-out' />
                    </div>
                    <label htmlFor="filter" className="sr-only">Filter Orders</label>
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                        <option value="all">All</option>
                        <option value="pending">Pending</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>
            </div>

            {filtered.length ? (
                <table className="min-w-full divide-y divide-gray-800">
                    <thead className="bg-gray-800/70 backdrop-blur-md sticky top-14 z-20">
                        <tr>
                            {[
                                'Order ID',
                                'Contact',
                                'Fee',
                                'Destination',
                                'Email',
                                'Status',
                                'Actions',
                            ].map((h) => (
                                <th
                                    key={h}
                                    className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400"
                                >
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                        {filtered.map((o, i) => (
                            <tr
                                key={o._id}
                                className={`group ${i % 2 ? 'bg-gray-900/40' : ''} hover:bg-gray-800/60 transition`}
                            >
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="text-sm text-gray-300">{o._id.slice(0, 8)}</span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <p className="text-sm font-medium text-white">{o.phoneNumber}</p>
                                    <p className="text-xs text-gray-400">{o.user?.name}</p>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="text-sm text-orange-300 font-semibold">
                                        Rs.&nbsp;{o.totalAmount}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="text-sm text-gray-300">{o.fullAddress}</span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="text-sm text-gray-300">{o.user.email}</span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span
                                        className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${statusColors[o.status]}`}
                                    >
                                        {o.status[0].toUpperCase() + o.status.slice(1)}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center gap-3">
                                        <Link to={`/secret-dashboard/order/${o._id}`}>
                                            <button className="p-2 rounded-full bg-gray-700 hover:bg-orange-600 transition">
                                                <Info className="w-4 h-4 text-white" />
                                            </button>
                                        </Link>
                                        <button
                                            onClick={() => deleteOrder(o._id)}
                                            className="p-2 rounded-full bg-gray-700 hover:bg-red-600 transition"
                                        >
                                            <Trash className="w-4 h-4 text-white" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p className="text-center text-gray-400 font-semibold p-10">No Orders Found</p>
            )}
        </motion.div>
    )
}

export default SalesTab
