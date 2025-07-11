import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Lock, UserPlus, LogOut, LogIn, ShoppingCart, Package } from 'lucide-react'
import { useUserStore } from '../stores/useUserStore'
import { useCartStore } from '../stores/useCartStore'
import toast from 'react-hot-toast'
import axios from '../lib/axios'

const Navbar = () => {
    const { user, logout } = useUserStore();
    const { cart } = useCartStore();
    const isLoggedIn = !!user;
    const isAdmin = user?.role === "admin";
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        if (!isLoggedIn) return;

        const fetchOrders = async () => {
            try {
                const res = await axios.get(`/orders/of-user`);
                setOrders(res.data?.orders || []);
            } catch (error) {
                console.error("Failed to fetch orders:", error.message);
                toast.error("Failed to load orders");
            }
        };

        fetchOrders();
    }, [isLoggedIn]);

    return (
        <header className='fixed top-0 left-0 w-full bg-gray-900 bg-opacity-90 backdrop-blur-md shadow-lg z-40 transition-all duration-300 border-b border-orange-800'>
            <div className="container mx-auto px-4 py-3">
                <div className='flex flex-wrap justify-between items-center'>
                    <Link to='/' className='text-2xl font-bold text-orange-400 flex items-center space-x-2'>
                        Drapeon
                    </Link>

                    <nav className="flex flex-wrap items-center gap-4">
                        <Link
                            to="/"
                            className='text-gray-300 hover:text-orange-400 transition duration-300 ease-in-out'
                        >
                            Home
                        </Link>

                        {isLoggedIn && (
                            <>
                                <Link
                                    to="/cart"
                                    className='relative group text-gray-300 hover:text-orange-400 transition duration-300 ease-in-out'
                                >
                                    <ShoppingCart className='inline-block mr-1' size={20} />
                                    <span className='hidden sm:inline'>Cart</span>
                                    {cart.length > 0 && (
                                        <span className='absolute -top-2 -left-2 bg-orange-500 text-white rounded-full px-2 py-0.5 text-xs'>
                                            {cart.length}
                                        </span>
                                    )}
                                </Link>

                                <Link
                                    to="/my-orders"
                                    className='relative group bg-orange-700 hover:bg-orange-600 text-white px-3 py-1 rounded-md font-medium flex items-center transition duration-300 ease-in-out'
                                >
                                    <Package className='inline-block mr-1' size={20} />
                                    <span className='hidden sm:inline'>My Orders</span>
                                    {orders.length > 0 && (
                                        <span className='absolute -top-2 -left-2 bg-orange-500 text-white rounded-full px-2 py-0.5 text-xs'>
                                            {orders.length}
                                        </span>
                                    )}
                                </Link>
                            </>
                        )}

                        {isAdmin && (
                            <Link
                                to="/secret-dashboard"
                                className='bg-orange-700 hover:bg-orange-600 text-white px-3 py-1 rounded-md font-medium flex items-center transition duration-300 ease-in-out'
                            >
                                <Lock className='inline-block mr-1' size={18} />
                                <span className='hidden sm:inline'>Dashboard</span>
                            </Link>
                        )}

                        {isLoggedIn ? (
                            <button
                                onClick={logout}
                                className='bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-md flex items-center transition duration-300 ease-in-out'
                            >
                                <LogOut size={18} />
                                <span className='hidden sm:inline ml-2'>Log Out</span>
                            </button>
                        ) : (
                            <>
                                <Link
                                    to="/signup"
                                    className='bg-orange-600 hover:bg-orange-700 text-white py-2 px-4 rounded-md flex items-center transition duration-300 ease-in-out'
                                >
                                    <UserPlus className='mr-2' size={18} />
                                    Sign Up
                                </Link>
                                <Link
                                    to="/login"
                                    className='bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-md flex items-center transition duration-300 ease-in-out'
                                >
                                    <LogIn className='mr-2' size={18} />
                                    Login
                                </Link>
                            </>
                        )}
                    </nav>
                </div>
            </div>
        </header>
    )
}

export default Navbar;
