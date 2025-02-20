import {useEffect, useState } from 'react'
import {ProductItem, Title} from './index';
import { useSelector} from 'react-redux';
// import { fetchProducts } from '../store/shopSlice';

const BestSeller = () => {

    // const dispatch = useDispatch()
    const products = useSelector((state)=> state.shop.products)

    const [bestSeller,setBestSeller] = useState([]);

    // useEffect(() => {
    //   dispatch(fetchProducts())
    // },[dispatch])
    {/*
      since both bestseller and latest collection is used in the home page the useEffect is loaded twice unnecessarily and when error occurs the error message is displayed twice
       */}

    useEffect(()=>{
        const bestProduct = products.filter((item)=>(item.bestseller));
        setBestSeller(bestProduct)
    },[products])

  return (
    <div className='my-10 px-4'>
      <div className='text-center text-3xl py-8'>
        <Title text1={'BEST'} text2={'SELLERS'}/>
        <p className='w-3/4 m-auto text-xs sm:text-sm md:text-base text-gray-600'>
        Explore our most loved pet products, chosen by pet owners who want the best for their furry friends. From nutritious treats to toys, these favorites are guaranteed to bring joy to your pets!

        </p>
      </div>

      <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 gap-y-6'>
        {
            bestSeller.map((item,index)=>(
                <ProductItem
                  key={index}
                  id={item._id}
                  name={item.name}
                  image={item.images[0].url}
                  price={item.price} />
            ))
        }
      </div>
    </div>
  )
}

export default BestSeller
