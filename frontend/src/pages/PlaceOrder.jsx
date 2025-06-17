import { useState } from 'react'
import {Title, CartTotal} from '../components/index'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import {selectCartAmount, clearCart} from '../store/cartSlice'
import {backendUrl} from '../store/consts'

const PlaceOrder = () => {

    const navigate = useNavigate();
    const dispatch = useDispatch()

    const isAuth = useSelector((state) => state.user.isAuthenticated)
    const products = useSelector((state) => state.shop.products)
    const cartItems = useSelector((state) => state.cart.items)
    const CartAmount = useSelector(selectCartAmount)

    const delivery_fee = 40

     // State for Delivery Method
    const [deliveryType, setDeliveryType] = useState('DELIVERY');
    const [loading, setLoading] = useState(false)
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
        // console.log("Cart Items:", cartItems);
        // console.log("Cart Items Type:", typeof cartItems);
        // console.log("Cart Items Instance Check:", Array.isArray(cartItems));
        setLoading(true)

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
            // console.log("Ordered response:", orderResponse)
            if(orderResponse.data.success){
                dispatch(clearCart())
                navigate('/profile')
            }

        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }finally{
            setLoading(false)
        }
    }

    if(!isAuth){
        return (
            <div className="text-center text-xl mt-10">
              <p>Please log in </p>
              <button
                onClick={() => navigate("/login")}
                className="mt-4 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-700-600 transition"
              >
                Login
              </button>
            </div>
          );
    }


    return (
        <form onSubmit={onSubmitHandler} className='px-4 flex flex-col sm:flex-row justify-between gap-4 pt-5 sm:pt-14 min-h-[80vh] border-t'>
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
                    type="tel"
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

                {/* ------------- Right Side ------------------ */}
            <div className='mt-8'>

                <div className='mt-8 min-w-75'>
                    <CartTotal deliveryMethod={deliveryType}/>
                </div>

                <div className='w-full text-end mt-8'>
                        <button type='submit' className='bg-black text-white px-16 py-3 text-sm rounded'>{loading ? "PLACING ORDER..." : "PLACE ORDER"}</button>
                </div>
                </div>
            </div>



        </form>
    )
}

export default PlaceOrder
