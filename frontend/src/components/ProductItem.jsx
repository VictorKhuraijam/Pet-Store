import { useSelector } from 'react-redux'
import {Link} from 'react-router-dom'

const ProductItem = ({id,image,name,price}) => {

  const currency = useSelector((state) => state.shop.currency) || '₹';

  return (
    <Link onClick={()=>scrollTo(0,0)} className='text-gray-700 cursor-pointer' to={`/product/${id}`}>
      <div className=' overflow-hidden w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center'>
        <img className='hover:scale-110 transition ease-in-out  w-full h-full object-contain' src={image[0]} alt="" />
      </div>
      <p className='pt-3 pb-1 text-sm'>{name}</p>
      <p className=' text-sm font-medium'>{currency}{price}</p>
    </Link>
  )
}

export default ProductItem
