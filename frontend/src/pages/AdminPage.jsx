import { NavLink, Outlet } from 'react-router-dom'
import { BarChart, PlusCircle, ShoppingBasket, SquareChartGantt } from 'lucide-react';
import { useEffect } from "react";
import { motion } from "framer-motion";
import { useProductStore } from '../stores/useProductStore';

const tabs = [
    { id: "create", label: "Create Product", icon: PlusCircle },
    { id: "products", label: "Products", icon: ShoppingBasket },
    { id: "analytics", label: "Analytics", icon: BarChart },
    { id: "orders", label: "Orders", icon: SquareChartGantt },
];


const AdminPage = () => {
    const { fetchAllProducts } = useProductStore();

    useEffect(() => {
        fetchAllProducts();
    }, [fetchAllProducts])

    return (
        <div className='min-h-screen relative overflow-hidden'>
            <div className='relative z-10 container mx-auto px-4 py-16'>
                <motion.h1
                    className='text-4xl font-bold mb-8 text-orange-400 text-center'
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    Admin Dashboard
                </motion.h1>
            </div>
            <div className='flex justify-center mb-8'>
                {tabs.map((tab) => (
                    <NavLink
                        key={tab.id}
                        to={`${tab.id}`}
                        className={({ isActive }) =>
                            `flex items-center px-4 py-2 mx-2 rounded-md transition-colors
                    ${isActive ? 'bg-orange-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`
                        }
                    >
                        <tab.icon className='mr-2 h-5 w-5' />
                        {tab.label}
                    </NavLink>
                ))}
            </div>
            
            <Outlet />
        </div>
    )
}

export default AdminPage