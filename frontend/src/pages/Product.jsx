import  { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { assets } from '../assets/assets';
import {RelatedProducts} from '../components/index';
import { useSelector, useDispatch } from 'react-redux';
import { fetchProductById } from '../store/shopSlice';
import { addToCart } from '../store/cartSlice';
import { toast } from 'react-toastify';

const Product = () => {

  const { productId } = useParams();
  const [productData, setProductData] = useState(false);
  const [image, setImage] = useState('')

  const isAuth = useSelector((state) => state.user.isAuthenticated)

  const dispatch = useDispatch()
  const products = useSelector((state) => state.shop.products)
  const currency =  '₹'


  useEffect(() => {
    if (productId){
      dispatch(fetchProductById(productId));
    }
  },[productId, dispatch])


  useEffect(() => {
    if (products?.length > 0 && productId) {
      const product = products.find((item) => item._id === productId);
      if (product && product._id !== productData?._id) {
        setProductData(product);
        setImage(product.images?.[0]?.url || ''); // Only update if it's a new product
      }
    }
  }, [products, productId, productData?._id]);

  const handleAddToCart = () => {
    console.log('Adding product to cart:', {
      productId: productData._id,
      productName: productData.name,
      price: productData.price
    })
    dispatch(addToCart(productData._id))
    toast("Item added to cart" )
    console.log('Cart action dispatched successfully')
  }

  return productData ? (
    <div className='border-t-2 pt-10 transition-opacity ease-in duration-500 opacity-100'>
      {/*----------- Product Data-------------- */}
      <div className='flex gap-12 sm:gap-12 flex-col sm:flex-row'>

        {/*---------- Product Images------------- */}
        <div className='flex-1 flex flex-col-reverse gap-3 sm:flex-row'>
          <div className='flex sm:flex-col overflow-x-auto sm:overflow-y-scroll justify-between sm:justify-normal sm:w-[18.7%] w-full'>
              {Array.isArray(productData.images) ?
               ( productData.images.map((item,index)=>(
                  <img
                    onClick={()=>setImage(item)}
                    src={item}
                    key={index}
                    className='w-[24%] sm:w-full sm:mb-3 flex-shrink-0 cursor-pointer'
                    alt=""
                  />
                ))) : null
              }
          </div>
          <div className='w-full sm:w-[80%]'>
              <img className='w-full h-auto' src={image} alt="" />
          </div>
        </div>

        {/* -------- Product Info ---------- */}
        <div className='flex-1'>
          <h1 className='font-medium text-2xl mt-2'>{productData.name}</h1>
          <div className=' flex items-center gap-1 mt-2'>
              <img src={assets.star_icon} alt="" className="w-3 5" />
              <img src={assets.star_icon} alt="" className="w-3 5" />
              <img src={assets.star_icon} alt="" className="w-3 5" />
              <img src={assets.star_icon} alt="" className="w-3 5" />
              <img src={assets.star_dull_icon} alt="" className="w-3 5" />
              {/* <p className='pl-2'>(122)</p> */}
          </div>

          <p className='mt-5 text-3xl font-medium'>{currency} {}  {productData.price}</p>
          <p className='mt-5 text-gray-500 md:w-4/5'>{productData.description}</p>

          <button onClick={isAuth ? handleAddToCart : ()=>(toast("please log in")) } className='bg-black text-white px-8 py-3 text-sm active:bg-gray-700'>ADD TO CART</button>
          <hr className='mt-8 sm:w-4/5' />
          <div className='text-sm text-gray-500 mt-5 flex flex-col gap-1'>
              <p>100% Original product.</p>
              <p>Cash on delivery is available on this product.</p>
              <p>Easy return and exchange policy within 7 days.</p>
          </div>
        </div>
      </div>

      {/* ---------- Description & Review Section ------------- */}
      <div className='mt-20'>
        <div className='flex'>
          <b className='border px-5 py-3 text-sm'>Description</b>
        </div>
        <div className='flex flex-col gap-4 border px-6 py-6 text-sm text-gray-500'>
          {/* <p>An e-commerce website is an online platform that facilitates the buying and selling of products or services over the internet. It serves as a virtual marketplace where businesses and individuals can showcase their products, interact with customers, and conduct transactions without the need for a physical presence. E-commerce websites have gained immense popularity due to their convenience, accessibility, and the global reach they offer.</p>
          <p>E-commerce websites typically display products or services along with detailed descriptions, images, prices, and any available variations (e.g., sizes, colors). Each product usually has its own dedicated page with relevant information.</p> */}
          {productData.description}
        </div>
      </div>

      {/* --------- display related products ---------- */}

      <RelatedProducts category={productData.category} />

    </div>
  ) : <div className=' opacity-0'></div>
}

export default Product
