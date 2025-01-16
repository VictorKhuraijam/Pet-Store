import { useSelector } from 'react-redux';
import {selectCartAmount} from '../store/cartSlice'
import {Title} from './index';

const CartTotal = () => {

    // const {currency,delivery_fee,getCartAmount} = useContext(ShopContext);
    const currency = '₹';
    const cartTotal = useSelector(selectCartAmount)
    const shippingCost = 40 // Example shipping cost
    const total = cartTotal + shippingCost

  return (
    <div className='w-full'>
      <div className='text-2xl'>
        <Title text1={'CART'} text2={'TOTALS'} />
      </div>

      <div className='flex flex-col gap-2 mt-2 text-sm'>
            <div className='flex justify-between'>
                <p>Subtotal</p>
                <p>{currency} {cartTotal}.00</p>
            </div>
            <hr />
            <div className='flex justify-between'>
                <p>Shipping Fee</p>
                <p>{currency} {shippingCost}.00</p>
            </div>
            <hr />
            <div className='flex justify-between'>
                <b>Total</b>
                <b>{currency} {total}.00</b>
            </div>
      </div>
    </div>
  )
}

export default CartTotal
