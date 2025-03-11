import { useEffect, useState } from 'react'
import {Title, CartTotal} from '../components/index';
import { useNavigate } from "react-router-dom";
import { assets } from '../assets/assets';
import { useSelector, useDispatch } from 'react-redux';
import {updateQuantity} from '../store/cartSlice'
import { fetchProducts } from '../store/shopSlice';

const Cart = () => {

  const navigate = useNavigate()
  const dispatch = useDispatch()
  const currency =  '₹'

  const products = useSelector((state) => state.shop.products)
  const cartItems = useSelector((state) => state.cart.items)

  const [cartData, setCartData] = useState([]);

  useEffect(() => {

      dispatch(fetchProducts())

      const tempData = [];
      for (const itemId in cartItems) {

          if (cartItems[itemId] > 0) {
            tempData.push({
              _id: itemId,
              quantity: cartItems[itemId]
            })
          }

      setCartData(tempData);
    }


  }, [cartItems, products, dispatch])

  const handleQuantityChange = (itemId, value) => {

    const newQuantity = Math.max(1, parseInt(value) || 1);
    console.log('Dispatching updateQuantity with:', itemId, newQuantity);
      dispatch(updateQuantity( itemId, newQuantity ))

      setCartData(prevData => prevData.map(item =>
        item._id === itemId ? { ...item, quantity: newQuantity } : item
      ));

  }

  const handleRemoveItem = (itemId) => {

    console.log ('Removing item:', itemId);
    dispatch(updateQuantity( itemId,  0 ))

    setCartData(prevData => prevData.filter(item => item._id !== itemId));
  }

  if (products.length === 0) return <p>Loading...</p>;



  return  (
    <div className='border-t pt-14 px-4'>

      <div className=' text-2xl mb-3'>
        <Title text1={'YOUR'} text2={'CART'} />
      </div>

      {
        cartData.length > 0 ? (
          <>
              <div>
                {
                  cartData.map((item) => {

                    const productData = products.find((product) => product._id === item._id);
                    console.log("product data is :", productData)

                    if (!productData) return null

                    return (
                      <div key={item._id} className='py-4 border-t border-b text-gray-700 grid grid-cols-[4fr_0.5fr_0.5fr] sm:grid-cols-[4fr_2fr_0.5fr] items-center gap-4'>
                        <div className=' flex items-start gap-6'>
                          <img className='w-16 sm:w-20' src={productData.images[0].url} alt="" />
                          <div className='mt-5 '>
                            <p className='text-xs sm:text-lg font-medium'>{productData.name}</p>
                            <div className='flex items-center gap-5 mt-2'>
                              <p>{currency}{productData.price}</p>

                            </div>
                          </div>
                        </div>

                        <div className='flex items-center  sm:max-w-10 px-1 sm:px-2 py-1 text-center'>
                          <button
                            onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className="px-2 py-1 bg-gray-200 text-gray-700 disabled:opacity-50"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => handleQuantityChange(item._id, e.target.value)}
                            className='w-10 text-center border-none'
                          />
                          <button
                            onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                            className="px-2 py-1 bg-gray-200 text-gray-700"
                          >
                            +
                          </button>
                        </div>

                        <img
                          onClick={() => handleRemoveItem(item._id)}
                          className='w-4 mr-4 sm:w-5 cursor-pointer m-2 hover:bg-gray-300 hover:rounded'
                          src={assets.bin_icon}
                          alt="Remove item"
                        />
                      </div>
                    )

                  })
                }
      </div>

      <div className='flex justify-end my-20'>
          <div className='w-full sm:w-[450px]'>
            <CartTotal />
            <div className=' w-full text-end'>
            <button onClick={() => navigate('/place-order')} className='bg-black text-white text-sm my-8 px-8 py-3 rounded'>PROCEED TO CHECKOUT</button>
          </div>
          </div>
      </div>
          </>
        ) :  (
          <div className="flex flex-col items-center justify-center py-20">
          <p className="text-xl text-gray-600 mb-6">Your cart is empty</p>
          <button
            onClick={() => navigate('/collection')}
            className="bg-black text-white px-6 py-2 rounded  hover:bg-gray-800 transition-colors"
          >
            SHOP NOW
          </button>
        </div>
        )
      }





    </div>
  )
}

export default Cart
