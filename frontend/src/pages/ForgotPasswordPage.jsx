import { motion } from "framer-motion";
import { useState } from "react";
import { useUserStore } from "../stores/useUserStore";
import { ArrowLeft, Loader, Mail } from "lucide-react";
import { Link } from "react-router-dom";

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState("");
    const [isSubmitted, setIsSubmitted] = useState(false);

    const { loading, forgotPassword } =useUserStore();

    const handleSubmit = async (e) => {
        e.preventDefault();
        await forgotPassword(email);
        setIsSubmitted(true);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className='max-w-md w-full mx-auto my-20 bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden'
        >
            <div className='p-8'>
                <h2 className='text-3xl font-bold mb-6 text-center bg-gradient-to-r from-orange-400 to-orange-500 text-transparent bg-clip-text'>
                    Forgot Password
                </h2>

                {!isSubmitted ? (
                    <form onSubmit={handleSubmit}>
                        <p className='text-gray-300 mb-6 text-center'>
                            Enter your email address and we'll send you a link to reset your password.
                        </p>
                        
                        <div className='relative mb-6'>
                            <div className='absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none'>
                                <Mail className="size-5 text-orange-500" />
                            </div>
                            <input  type='email' placeholder='Email Address'  className='w-full pl-10 pr-3 py-2 bg-gray-800 bg-opacity-50 rounded-lg border border-gray-700 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500 text-white placeholder-gray-400 transition duration-200' 
                            value={email}  onChange={(e) => setEmail(e.target.value)} required
                            />
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className='w-full py-3 px-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold rounded-lg shadow-lg hover:from-orange-600 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition duration-200'
                            type='submit'
                        >
                            {loading ? <Loader className='size-6 animate-spin mx-auto' /> : "Send Reset Link"}
                        </motion.button>
                    </form>
                ) : (
                    <div className='text-center'>
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            className='w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4'
                        >
                            <Mail className='h-8 w-8 text-white' />
                        </motion.div>
                        <p className='text-gray-300 mb-6'>
                            If an account exists for {email}, you will receive a password reset link shortly.
                        </p>
                    </div>
                )}
            </div>

            <div className='px-8 py-4 bg-gray-900 bg-opacity-50 flex justify-center'>
                <Link to={"/login"} className='text-sm text-orange-400 hover:underline flex items-center'>
                    <ArrowLeft className='h-4 w-4 mr-2' /> Back to Login
                </Link>
            </div>
        </motion.div>
    );
};
export default ForgotPasswordPage;