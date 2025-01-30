import { useState } from 'react'
import {Title, CartTotal} from '../components/index'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import {selectCartAmount, clearCart} from '../store/cartSlice'

const PlaceOrder = () => {

    const navigate = useNavigate();
    const dispatch = useDispatch()

    const products = useSelector((state) => state.shop.products)
    const cartItems = useSelector((state) => state.cart.items)
    const CartAmount = useSelector(selectCartAmount)

    const delivery_fee = 40
    const backendUrl = import.meta.env.VITE_BACKEND_URL;

     // State for Delivery Method
  const [deliveryType, setDeliveryType] = useState('DELIVERY'); // Default to Home Delivery


    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        street: '',
        phone: ''
    })

    const onChangeHandler = (event) => {
        const {name, value} = event.target
        setFormData(data => ({ ...data, [name]: value }))
    }

    const onSubmitHandler = async (event) => {
        event.preventDefault()
        console.log("Cart Items:", cartItems);
        console.log("Cart Items Type:", typeof cartItems);
        console.log("Cart Items Instance Check:", Array.isArray(cartItems));

        try {

            const orderItems = Object.entries(cartItems).map(([id, quantity]) => {
                const itemInfo = products.find((product) => product._id === id);
                return itemInfo ? { ...itemInfo, quantity } : null;
              }).filter(Boolean); // Removes null values if product is not found


            const totalAmount = deliveryType === 'home-delivery' ? CartAmount + delivery_fee : CartAmount;

            let orderData = {
                address: formData,
                items: orderItems,
                amount: totalAmount,
                deliveryType,
            }

            const orderResponse = await axios.post(
                `${backendUrl}/orders/placeOrder`,
                orderData,
                { withCredentials: true }
            )
            if(orderResponse.data.success){
                dispatch(clearCart())
                navigate('/orders')
            }

        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }


    return (
        <form onSubmit={onSubmitHandler} className='flex flex-col sm:flex-row justify-between gap-4 pt-5 sm:pt-14 min-h-[80vh] border-t'>
            {/* ------------- Left Side ---------------- */}
            <div className='flex flex-col gap-4 w-full sm:max-w-[480px]'>

                <div className='text-xl sm:text-2xl my-3'>
                    <Title text1={'DELIVERY'} text2={'INFORMATION'} />
                </div>
                <div className='flex gap-3'>
                    <input
                        required
                        onChange={onChangeHandler}
                        name='firstName'
                        value={formData.firstName}
                        className='border border-gray-300 rounded py-1.5 px-3.5 w-full'
                        type="text"
                        placeholder='First name'
                    />
                    <input
                        required
                        onChange={onChangeHandler}
                        name='lastName'
                        value={formData.lastName}
                        className='border border-gray-300 rounded py-1.5 px-3.5 w-full'
                        type="text"
                        placeholder='Last name'
                     />
                </div>
                <input
                    required
                    onChange={onChangeHandler}
                    name='email'
                    value={formData.email}
                    className='border border-gray-300 rounded py-1.5 px-3.5 w-full'
                    type="email"
                    placeholder='Email address'
                />
                <input
                    required
                    onChange={onChangeHandler}
                    name='street'
                    value={formData.street}
                    className='border border-gray-300 rounded py-1.5 px-3.5 w-full'
                    type="text"
                    placeholder='Street'
                />

                <input
                    required
                    onChange={onChangeHandler}
                    name='phone'
                    value={formData.phone}
                    className='border border-gray-300 rounded py-1.5 px-3.5 w-full'
                    type="number"
                    placeholder='Phone'
                />
            </div>

            {/* Delivery Method Selection */}
            <div className='flex flex-col mt-4'>
                <label className='font-semibold'>Delivery Method:</label>
                <div className='flex gap-4'>
                    <label className='flex items-center gap-2'>
                    <input
                        type="radio"
                        value="home-delivery"
                        checked={deliveryType === 'DELIVERY'}
                        onChange={() => setDeliveryType('DELIVERY')}
                    />
                    Home Delivery
                    </label>
                    <label className='flex items-center gap-2'>
                    <input
                        type="radio"
                        value="store-pickup"
                        checked={deliveryType === 'PICKUP'}
                        onChange={() => setDeliveryType('PICKUP')}
                    />
                    Store Pickup
                    </label>
                </div>
            </div>


            {/* ------------- Right Side ------------------ */}
            <div className='mt-8'>

                <div className='mt-8 min-w-75'>
                    <CartTotal deliveryMethod={deliveryType}/>
                </div>

                <div className='w-full text-end mt-8'>
                        <button type='submit' className='bg-black text-white px-16 py-3 text-sm'>PLACE ORDER</button>
                </div>
            </div>
        </form>
    )
}

export default PlaceOrder
