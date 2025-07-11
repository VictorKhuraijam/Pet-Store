import  {useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux';
import {ProductItem, Title} from './index';
import { fetchProducts } from '../store/shopSlice';

const RelatedProducts = ({category}) => {

    const dispatch = useDispatch()
    const products = useSelector((state) => state.shop.products)
    const [related,setRelated] = useState([]);

    useEffect(()=>{
        dispatch(fetchProducts())
        if (products.length > 0) {

          if (Array.isArray(products) && category) {
            const relatedProducts = products.filter((item) => item.category === category);
            setRelated(relatedProducts);
          }

        }

    },[products,category,dispatch])

  return (
    <div className='my-24'>
      <div className=' text-center text-3xl py-2'>
        <Title text1={'RELATED'} text2={"PRODUCTS"} />
      </div>

      <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 gap-y-6'>
        {related.map((item,index)=>(
            <ProductItem key={index} id={item._id} name={item.name} price={item.price} image={item.images[0].url}/>
        ))}
      </div>
    </div>
  )
}

export default RelatedProducts
