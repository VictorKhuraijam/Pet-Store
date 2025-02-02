import {  useEffect, useState } from 'react'
import Title from '../components/Title';
import axios from 'axios';
import {useSelector} from 'react-redux'
import { useNavigate } from 'react-router-dom';


const Orders = () => {


  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  // const { backendUrl, token , currency} = useContext(ShopContext);
  const isAuth = useSelector((state) => state.user.isAuthenticated)
  const currency = useSelector((state) => state.shop.currency)
  const navigate = useNavigate()

  const [orderData,setorderData] = useState([])

  const loadOrderData = async () => {
    try {
      if (!isAuth) {
        return null
      }

      const response = await axios.get(
        `${backendUrl}/orders/userOrders`,
      { withCredentials: true})
      console.log("order response",response.data)

      if (response.data.success) {
        const allOrdersItem = [];
        response.data.data.orders.forEach((order) => {
          order.orderItems.forEach((item) => {
            item['status'] = order.status;
            item['deliveryType'] = order.deliveryType;
            item['payment'] = order.payment;
            item['createdAt'] = order.createdAt;
            allOrdersItem.push(item);
          });
        });
        setorderData(allOrdersItem.reverse())
        console.log("Ordered data is:",orderData)
      }

    } catch (error) {

    console.error(error.message);
    }
  }

  useEffect(()=>{
    loadOrderData()
  },[isAuth])

  return isAuth ? (
    <div className='border-t pt-16'>

        <div className='text-2xl'>
            <Title text1={'MY'} text2={'ORDERS'}/>
        </div>

        <div>
            {
             orderData.length > 0 ? (orderData.map((item,index) => (
                <div key={index} className='py-4 border-t border-b text-gray-700 flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
                    <div className='flex items-start gap-6 text-sm'>
                        <img className='w-16 sm:w-20' src={item.productId.images[0].url || null} alt="" />
                        <div>
                          <p className='sm:text-base font-medium'>{item.name}</p>
                          <div className='flex items-center gap-3 mt-1 text-base text-gray-700'>
                            <p>{currency}{item.productId.price}</p>
                            <p>Quantity: {item.quantity}</p>
                          </div>
                          <p className='mt-1'>Date: <span className=' text-gray-400'>{new Date(item.createdAt).toDateString()}</span></p>
                          <p className='mt-1'>Payment: <span className=' text-gray-400'>{item.payment}</span></p>
                          <p className='mt-1'>Delivery type: <span className=' text-gray-400'>{item.deliveryType }</span></p>
                        </div>
                    </div>
                    <div className='md:w-1/2 flex justify-between'>
                        <div className='border px-4 py-2 text-sm font-medium rounded-xl'>Status</div>
                        <div className='flex items-center gap-2'>
                            <p className='min-w-2 h-2 rounded-full bg-green-500'></p>
                            <p className='text-sm md:text-base'>{item.status}</p>
                        </div>

                    </div>
                </div>
              ))) :
              <div className="flex flex-col items-center justify-center py-20">
          <p className="text-xl text-gray-600 mb-6">Your cart is empty</p>
          <button
            onClick={() => navigate('/collection')}
            className="bg-black text-white px-6 py-2 hover:bg-gray-800 transition-colors"
          >
            SHOP NOW
          </button>
        </div>
            }
        </div>
    </div>
  ):
  (
    <div className='text-center mt-10 '>
      <h3 className='prata-regular'>Login to order</h3>
      <button
        onClick={() => (navigate('/login'))}
        className='border rounded-2xl bg-gray-300 px-4 mt-4 py-2'
        >
        Login
      </button>
    </div>
  )
}

export default Orders
