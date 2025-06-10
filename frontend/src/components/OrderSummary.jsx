import React, { useState } from 'react'
import { useCartStore } from '../stores/useCartStore';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { MoveRight } from 'lucide-react';
import axios from '../lib/axios';
import { toast } from 'react-hot-toast';

const OrderSummary = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [fullAddress, setFullAddress] = useState("");
  const { total, cart } = useCartStore();
  const formattedTotal = total.toFixed(2);

  const handlePayment = async () => {
    try {
      const response = await axios.post("/payments/initialize-esewa", {
        products: cart,
        phoneNumber,
        fullAddress
      })
      const data = response.data;
      if (data.success) {
        const form = document.createElement("form");
        form.action = "https://rc-epay.esewa.com.np/api/epay/main/v2/form";
        form.method = "POST";

        Object.keys(data.paymentData).forEach(key => {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = key;
          input.value = data.paymentData[key];
          form.appendChild(input);
        });

        document.body.appendChild(form);
        form.submit();
      } else {
        toast.error(data.response?.data?.message || "An error occurred, please try again later");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "An error occurred, please try again later");
    }
  }
  return (
    <motion.div
      className='space-y-4 rounded-lg border border-gray-700 bg-gray-800 p-4 shadow-sm sm:p-6'
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <p className='text-xl font-semibold text-orange-400'>Order summary</p>

      <div className='space-y-4'>
          <div className='space-y-4'>
            <div>
              <label htmlFor='voucher' className='mb-2 block text-sm font-medium text-gray-300'>
                Phone Number
              </label>
              <input
                type='text'
                id='voucher'
                className='block w-full rounded-lg border border-gray-600 bg-gray-700 
            p-2.5 text-sm text-white placeholder-gray-400 focus:border-orange-500 
            focus:ring-orange-500 outline-none'
                placeholder='Enter phone Number here'
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor='voucher' className='mb-2 block text-sm font-medium text-gray-300'>
                Address
              </label>
              <input
                type='text'
                id='voucher'
                className='block w-full rounded-lg border border-gray-600 bg-gray-700 
            p-2.5 text-sm text-white placeholder-gray-400 focus:border-orange-500 
            focus:ring-orange-500 outline-none'
                placeholder='Enter full Addresss here'
                value={fullAddress}
                onChange={(e) => setFullAddress(e.target.value)}
                required
              />
            </div>

            <dl className='flex items-center justify-between gap-4 border-t border-gray-600 pt-2'>
              <dt className='text-base font-bold text-white'>Total</dt>
              <dd className='text-base font-bold text-orange-400'>Rs.{formattedTotal}</dd>
            </dl>
          </div>

          <motion.button
            className='flex w-full items-center justify-center rounded-lg bg-orange-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-orange-700 focus:outline-none focus:ring-4 focus:ring-orange-300'
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handlePayment}
          >
            Proceed to Checkout
          </motion.button>

          <div className='flex items-center justify-center gap-2'>
            <span className='text-sm font-normal text-gray-400'>or</span>
            <Link
              to='/'
              className='inline-flex items-center gap-2 text-sm font-medium text-orange-400 underline hover:text-orange-300 hover:no-underline'
            >
              Continue Shopping
              <MoveRight size={16} />
            </Link>
          </div>
        </div>
    </motion.div>
  )
}

export default OrderSummary