import { useEffect, useState } from 'react'
import {Title, CartTotal} from '../components/index';
import { useNavigate } from "react-router-dom";
import { assets } from '../assets/assets';
import { useSelector, useDispatch } from 'react-redux';
import {updateQuantity} from '../store/cartSlice'

const Cart = () => {

  const navigate = useNavigate()
  const dispatch = useDispatch()
  const currency =  '₹'

  const products = useSelector((state) => state.shop.products)
  const cartItems = useSelector((state) => state.cart.items)

  const [cartData, setCartData] = useState([]);

  useEffect(() => {

    if (products.length > 0) {
      const tempData = [];
      for (const itemId in cartItems) {

          if (cartItems[itemId] > 0) {
            tempData.push({
              _id: itemId,
              quantity: cartItems[itemId]
            })
          }
      }
      console.log('Updated cart data:', tempData);
      setCartData(tempData);
    }
  }, [cartItems, products, dispatch])

  const handleQuantityChange = (itemId, value) => {

    const newQuantity = Math.max(1, parseInt(value) || 1);
      dispatch(updateQuantity({ itemId, newQuantity }))

  }

  const handleRemoveItem = (itemId) => {

    console.log ('Removing item:', itemId);
    dispatch(updateQuantity( itemId, 0 ))
  }


  return  (
    <div className='border-t pt-14'>

      <div className=' text-2xl mb-3'>
        <Title text1={'YOUR'} text2={'CART'} />
      </div>


      {
        cartData.length > 0 ? (
          <>
              <div>
        {
          cartData.map((item, index) => {

            const productData = products.find((product) => product._id === item._id);

            if (!productData) return null

            return (
              <div key={index} className='py-4 border-t border-b text-gray-700 grid grid-cols-[4fr_0.5fr_0.5fr] sm:grid-cols-[4fr_2fr_0.5fr] items-center gap-4'>
                <div className=' flex items-start gap-6'>
                  <img className='w-16 sm:w-20' src={productData.images[0].url} alt="" />
                  <div>
                    <p className='text-xs sm:text-lg font-medium'>{productData.name}</p>
                    <div className='flex items-center gap-5 mt-2'>
                      <p>{currency}{productData.price}</p>

                    </div>
                  </div>
                </div>
                {/* <input
                  //  onChange={(e) => {
                  //   const value = e.target.value
                  //   if (value && parseInt(value) > 0) {
                  //     handleQuantityChange(item._id, parseInt(value))
                  //   }
                  //   //  e.target.value === '' || e.target.value === '0' ? null : handleQuantityChange(item._id, Number(e.target.value))
                  // }}
                  onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                  className='border max-w-10 sm:max-w-20 px-1 sm:px-2 py-1'
                  type="number"
                  min={1}
                  value={item.quantity}
                /> */}
                  <input
                type="number"
                min="1"
                value={item.quantity}
                onChange={(e) => handleQuantityChange(item._id, e.target.value)}
                className='border max-w-10 sm:max-w-20 px-1 sm:px-2 py-1'
                readOnly
                onKeyDown={(e) => {
                  // Only allow up and down arrow keys
                  if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    handleQuantityChange(item._id, item.quantity + 1);
                  } else if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    handleQuantityChange(item._id, item.quantity - 1);
                  }
                }}
              />
                <img
                  onClick={() => handleRemoveItem(item._id)}
                  // onClick={() => updateQuantity(item._id, item.size, 0)}
                  className='w-4 mr-4 sm:w-5 cursor-pointer'
                  src={assets.bin_icon}
                  alt="Remove item" />
              </div>
            )

          })
        }
      </div>

      <div className='flex justify-end my-20'>
          <div className='w-full sm:w-[450px]'>
            <CartTotal />
            <div className=' w-full text-end'>
              <button onClick={() => navigate('/place-order')} className='bg-black text-white text-sm my-8 px-8 py-3'>PROCEED TO CHECKOUT</button>
            </div>
          </div>
      </div>
          </>
        ) :  (
          <div className="flex flex-col items-center justify-center py-20">
          <p className="text-xl text-gray-600 mb-6">Your cart is empty</p>
          <button
            onClick={() => navigate('/collection')}
            className="bg-black text-white px-6 py-2 hover:bg-gray-800 transition-colors"
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
