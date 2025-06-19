import { useEffect, useRef, useState } from 'react'
import { useCartStore } from '../stores/useCartStore';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRightToLine, MoveRight } from 'lucide-react';
import axios from '../lib/axios';
import origAxios from "axios";
import { toast } from 'react-hot-toast';

const OrderSummary = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [searchedAddress, setSearchedAddress] = useState("")
  const [results, setResults] = useState([]);
  const [streetAddress, setStreetAddress] = useState("")
  const { total, cart } = useCartStore();
  const formattedTotal = total.toFixed(2);
  const provinceAddressRef = useRef(null);

  useEffect(() => {
    const fetchAddressSuggestions = setTimeout(() => {
      if (searchedAddress.trim() === "") {
        setResults([]);
        return;
      }
      handleAddressSearch();
    }, 200);
    return () => clearTimeout(fetchAddressSuggestions)
  }, [searchedAddress])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (provinceAddressRef.current && !provinceAddressRef.current.contains(e.target)) {
        setResults([]);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);


  const handleAddressSearch = async () => {
    try {
      const response = await origAxios.get(`https://api.geoapify.com/v1/geocode/autocomplete?text=${searchedAddress}&apiKey=${import.meta.env.VITE_GEOAPIFY_API_KEY}`);
      setResults(response.data.features);
    } catch (error) {
      toast.error("Error fetching address, please try again later");
      console.error("Error fetching address:", error);
    }
  }

  const handleAddressSelect = (place) => {
    setSearchedAddress(place);
    setResults([]);
  }

  const handlePaymentwithEsewa = async () => {
    try {
      const response = await axios.post("/payments/initialize-esewa", {
        products: cart,
        phoneNumber,
        fullAddress: `${searchedAddress}, ${streetAddress}`,
        paymentMethod: "esewa"
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
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "An error occurred, please try again later");
    }
  }

  const handlePaymentWithCOD = async () => {
    try {
      const response = await axios.post("/payments/initialize-esewa", {
        products: cart,
        phoneNumber,
        fullAddress: `${searchedAddress}, ${streetAddress}`,
        paymentMethod: "cod"
      })
      if (response.data.redirectUrl) {
        window.location.href = response.data.redirectUrl;
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
            <label htmlFor='contact' className='mb-2 block text-sm font-medium text-gray-300'>
              Phone Number
            </label>
            <input
              type='text'
              id='contact'
              className='block w-full rounded-lg border border-gray-600 bg-gray-700 
            p-2.5 text-sm text-white placeholder-gray-400 focus:border-orange-500 
            focus:ring-orange-500 outline-none'
              placeholder='Enter phone Number here'
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
            />
          </div>
          <div ref={provinceAddressRef}>
            <label htmlFor='province-address' className='mb-2 block text-sm font-medium text-gray-300'>
              State/Province Address
            </label>
            <input
              type='text'
              id='province-address'
              className='block w-full rounded-lg border border-gray-600 bg-gray-700 
            p-2.5 text-sm text-white placeholder-gray-400 focus:border-orange-500 
            focus:ring-orange-500 outline-none'
              placeholder='Enter state/province Address here'
              value={searchedAddress}
              onChange={(e) => setSearchedAddress(e.target.value)}
              required
            />

            {results.length > 0 && (<ul className="mt-4 space-y-2 max-h-60 overflow-y-auto bg-gray-900 p-4 rounded-2xl shadow-lg border border-gray-700">
              {Array.isArray(results) && results.map(place => (
                <li
                  key={place.properties.place_id}
                  className="text-orange-400 hover:text-white hover:bg-orange-600 transition-colors px-4 py-2 rounded-lg cursor-pointer"
                  onClick={() => handleAddressSelect(place.properties.formatted)}
                >
                  {place.properties.formatted}
                </li>
              ))}
            </ul>)}

          </div>
          <div>
            <label htmlFor='street-address' className='mb-2 block text-sm font-medium text-gray-300'>
              Street Address
            </label>
            <input
              type='text'
              id='street-address'
              className='block w-full rounded-lg border border-gray-600 bg-gray-700 
            p-2.5 text-sm text-white placeholder-gray-400 focus:border-orange-500 
            focus:ring-orange-500 outline-none'
              placeholder='Enter street Address here'
              value={streetAddress}
              onChange={(e) => setStreetAddress(e.target.value)}
              required
            />
          </div>

          <dl className='flex items-center justify-between gap-4 border-t border-gray-600 pt-2'>
            <dt className='text-base font-bold text-white'>Total</dt>
            <dd className='text-base font-bold text-orange-400'>Rs.{formattedTotal}</dd>
          </dl>
        </div>

        <motion.button
          className='flex w-full items-center justify-between rounded-lg bg-orange-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-700 focus:outline-none focus:ring-4 focus:ring-orange-300'
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handlePaymentwithEsewa}
        >
          Continue With Esewa
          <ArrowRightToLine size={22} />
        </motion.button>

        <motion.button
          className='flex w-full items-center justify-between rounded-lg bg-orange-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-700 focus:outline-none focus:ring-4 focus:ring-orange-300'
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handlePaymentWithCOD}
        >
          Continue With COD
          <ArrowRightToLine size={22} />
        </motion.button>

        <div className='flex items-center justify-center gap-2'>
          <span className='text-sm font-normal text-gray-400'>or</span>
          <Link
            to='/'
            className='inline-flex items-center gap-2 text-sm font-semibold text-orange-400 underline hover:text-orange-300 hover:no-underline'
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