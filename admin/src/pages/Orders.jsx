import  {useState, useEffect, useContext } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import AuthContext from '../context/AuthContext'

const Orders = () => {


  const {backendUrl, isAuthenticated, currency} = useContext(AuthContext)

  const [orders, setOrders] = useState([])
  const [orderUpdates, setOrderUpdates] = useState({});


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
  console.log("Orders recieved :", orders)

  const handleStatusChange = (orderId, newStatus) => {
    setOrderUpdates((prev) => ({
      ...prev,
      [orderId]: { ...prev[orderId], status: newStatus },
    }));
  };

  const handlePaymentChange = (orderId, newPayment) => {
    setOrderUpdates((prev) => ({
      ...prev,
      [orderId]: { ...prev[orderId], payment: newPayment },
    }));
  };


  const handleUpdate = async (orderId) => {
    if (!orderUpdates[orderId]) {
      toast.error("No changes made!");
      return;
    }

    try {
      const response = await axios.post(
        `${backendUrl}/orders/status`,
        {
          orderId,
          status: orderUpdates[orderId]?.status || orders.find(order => order._id === orderId)?.status,
          payment: orderUpdates[orderId]?.payment || orders.find(order => order._id === orderId)?.payment,
        },
        { withCredentials: true }
      );

      if (response.data.success) {
        toast.success("Order updated successfully!");
        await fetchAllOrders(); // Refresh orders after update
        setOrderUpdates((prev) => ({ ...prev, [orderId]: {} })); // Clear the updated state for that order
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    }
  };


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
              <img className='w-12' src={order.orderItems[0].image.url} alt="" />
              <div>
                <div>
                  {order.orderItems.map((item, index) => (

                      <p className='py-0.5' key={index}> {item.name }: <span className='ml-3'>{item.quantity}</span>  </p>

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
                <p>Payment : { order.payment === 'NOT_PAID' ? 'NOT_PAID' : 'PAID' }</p>
                <p>Date : {new Date(order.createdAt).toLocaleDateString()}</p>
              </div>
              <p className='text-sm sm:text-[15px]'>
                {currency}{order.orderPrice}
              </p>

              {/* Status and Payment Dropdowns */}
              <div className="flex flex-col gap-2">
                <select
                  onChange={(event) => handleStatusChange(order._id, event.target.value)}
                  value={orderUpdates[order._id]?.status || order.status}
                  className="p-2 font-semibold border border-gray-300 rounded"
                >
                  <option value="PENDING">PENDING</option>
                  <option value="CANCELLED">CANCELLED</option>
                  <option value="DELIVERED">DELIVERED</option>
                  <option value="PACKED">PACKED</option>
                  <option value="OUT FOR DELIVERY">OUT FOR DELIVERY</option>
                </select>

                <select
                  onChange={(event) => handlePaymentChange(order._id, event.target.value)}
                  value={orderUpdates[order._id]?.payment || order.payment}
                  className="p-2 font-semibold border border-gray-300 rounded"
                >
                  <option value="NOT_PAID">NOT PAID</option>
                  <option value="PAID">PAID</option>
                </select>

                {/* Update Button */}
                {(orderUpdates[order._id]?.payment || order.payment === "PAID") && (orderUpdates[order._id]?.status || order.status === 'DELIVERED') ? "" : <button
                    onClick={() => handleUpdate(order._id)}
                    className="bg-blue-500 text-white font-semibold px-4 py-2 rounded hover:bg-blue-600 transition"
                  >
                    Update
                  </button> }

                </div>
            </div>
          ))
        }
      </div>
    </div>
  )
}

export default Orders
