import  {useEffect, useState } from 'react'
import {Title, ProductItem} from './index';
// import { fetchProducts } from '../store/shopSlice';
import { useSelector} from 'react-redux';

const LatestCollection = () => {

    // const dispatch = useDispatch();
    const products = useSelector((state) => state.shop.products)
    const [latestProducts,setLatestProducts] = useState([]);

    // useEffect(() => {
    //   dispatch(fetchProducts())
    // },[dispatch])

    useEffect(()=>{
        setLatestProducts(products);
        // console.log("The latest products",latestProducts)
    },[products])

  return (
    <div className='my-10 px-4'>
      <div className='text-center py-8 text-3xl'>
          <Title text1={'LATEST'} text2={'REX COLLECTIONS'} />
          <p className='w-3/4 m-auto text-xs sm:text-sm md:text-base text-gray-600'>
          Discover the Latest Collection in Our Online Pet Store – Premium Products for Your Beloved Pets!
          </p>
      </div>

      {/* Rendering Products */}
      <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 gap-y-6'>
        {
          latestProducts.map((item,index)=>(
            <ProductItem
              key={index}
              id={item._id}
              image={item.images[0].url}
              name={item.name}
              price={item.price}
            />
          ))
        }
      </div>
    </div>
  )
}

export default LatestCollection
