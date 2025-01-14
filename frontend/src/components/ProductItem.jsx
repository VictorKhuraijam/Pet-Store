import { useSelector } from 'react-redux'
import {Link} from 'react-router-dom'

const ProductItem = ({id,image,name,price}) => {

  const currency = useSelector((state) => state.shop.currency) || '₹';

  return (
    <Link onClick={()=>scrollTo(0,0)} className='text-gray-700 cursor-pointer' to={`/product/${id}`}>
      <div className=' overflow-hidden w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center'>
        <img className='hover:scale-110 transition ease-in-out  w-full h-full object-contain' src={image[0]} alt="" />
      </div>
      <div className='flex pt-3 pb-1 justify-between items-start'>
        <p className='prata-regular text-sm leading-tight max-w-[70%] break-words'>{name}</p>
        <p className='text-sm font-medium whitespace-nowrap'>
          {currency} {price}</p>
      </div>
    </Link>
  )
}

export default ProductItem
