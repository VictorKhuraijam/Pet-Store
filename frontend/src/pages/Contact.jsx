import {Title} from '../components/index'
import { assets } from '../assets/assets'

const Contact = () => {
  return (
    <div className='px-4'>

      <div className='text-center text-2xl pt-10 border-t'>
          <Title text1={'CONTACT'} text2={'US'} />
      </div>

      <div className='my-10 flex flex-col justify-center md:flex-row gap-10 mb-28'>
        <img className='w-full md:max-w-[480px] rounded' src={assets.contact_us} alt="" />
        <div className='flex flex-col justify-center items-start gap-6'>
          <p className='font-semibold text-xl text-gray-600'>Our Store</p>
          <p className=' text-gray-500'>Sangaiprou Mamang Leikai, Ghari <br />  Imphal-795140 , Manipur, INDIA</p>
          <p className=' text-gray-500'>Tel: (123) 456-7890 <br /> Email: RoyaleREx@petstore.com</p>

        </div>
      </div>


    </div>
  )
}

export default Contact
