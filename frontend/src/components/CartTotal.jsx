import { useSelector } from 'react-redux';
import {selectCartAmount} from '../store/cartSlice'
import {Title} from './index';

const CartTotal = ({deliveryMethod}) => {

    // const {currency,delivery_fee,getCartAmount} = useContext(ShopContext);
    const currency = '₹';
    const cartTotal = useSelector(selectCartAmount)
    const shippingCost = 40 // Example shipping cost
    const total =  deliveryMethod === 'DELIVERY' ? cartTotal + shippingCost : cartTotal;

  return (
    <div className='w-full'>
      <div className='text-2xl'>
        <Title text1={'CART'} text2={'TOTALS'} />
      </div>

      <div className='flex flex-col flex-wrap gap-2 mt-2 text-sm sm:max-w-[420px]'>
            <div className='flex justify-between flex-wrap '>
                <p className="min-w-0">Subtotal</p>
                <p className="text-right min-w-0">{currency} {cartTotal}.00</p>
            </div>
            <hr />
             {/* Show shipping fee only if delivery method is 'home-delivery' */}
        {deliveryMethod === 'DELIVERY' && (
          <>
            <div className='flex justify-between'>
              <p>Shipping Fee</p>
              <p>{currency} {shippingCost}.00</p>
            </div>
            <hr />
          </>
        )}
            <div className='flex justify-between'>
                <b>Total</b>
                <b>{currency} {total}.00</b>
            </div>
      </div>
    </div>
  )
}

export default CartTotal
