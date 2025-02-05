import  {useState, useEffect, useContext } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { assets } from '../assets/assets'
import AuthContext from '../context/AuthContext'

const Orders = () => {


  const {backendUrl, isAuthenticated, currency} = useContext(AuthContext)

  const [orders, setOrders] = useState([])

  const fetchAllOrders = async () => {

    if (!isAuthenticated) {
      return null;
    }

    try {

      const response = await axios.get(
        `${backendUrl}/orders/list`,

         { withCredentials: true }
        )
      if (response.data.success) {
        setOrders(response.data.data.orders.reverse())
      } else {
        toast.error(response.data.message)
      }

    } catch (error) {
      toast.error(error.message)
    }


  }

  const statusHandler = async ( event, orderId ) => {
    try {
      const response = await axios.post(
        `${backendUrl}/order/status` ,
         {orderId, status: event.target.value},
         {withCredentials: true}
        )
      if (response.data.success) {
        await fetchAllOrders()
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    }
  }

  useEffect(() => {
    fetchAllOrders();
  }, [])

  return (
    <div>
      <h3>Order Page</h3>
      <div>
        {
          orders.map((order, index) => (
            <div className='grid grid-cols-1 sm:grid-cols-[0.5fr_2fr_1fr] lg:grid-cols-[0.5fr_2fr_1fr_1fr_1fr] gap-3 items-start border-2 border-gray-200 p-5 md:p-8 my-3 md:my-4 text-xs sm:text-sm text-gray-700' key={index}>
              <img className='w-12' src={assets.parcel_icon} alt="" />
              <div>
                <div>
                  {order.orderItems.map((item, index) => (

                      <p className='py-0.5' key={index}> {item.productId} x {item.quantity}  </p>

                  ))}
                </div>
                <p className='mt-3 mb-2 font-medium'>{order.address.firstName + " " + order.address.lastName}</p>
                <div>
                  <p>{order.address.street + ","}</p>

                </div>
                <p>{order.address.phone}</p>
              </div>

              <div>
                <p className='text-sm sm:text-[15px]'>Items : {order.orderItems.length}</p>
                <p className='mt-3'>Method : {order.deliveryType}</p>
                <p>Payment : { order.payment === 'NOT_PAID' ? 'Pending' : 'Done' }</p>
                <p>Date : {new Date(order.date).toLocaleDateString()}</p>
              </div>
              <p className='text-sm sm:text-[15px]'>
                {currency}{order.orderPrice}
              </p>

              <select
                onChange={(event)=>statusHandler(event,order._id)} value={order.status}
                className='p-2 font-semibold border border-gray-300 rounded'>
                <option value="PENDING">Pending</option>
                <option value="Order Placed">Order Placed</option>
                <option value="Packing">Packing</option>
                <option value="Shipped">Shipped</option>
                <option value="Out for delivery">Out for delivery</option>
                <option value="Delivered">Delivered</option>
              </select>
            </div>
          ))
        }
      </div>
    </div>
  )
}

export default Orders
