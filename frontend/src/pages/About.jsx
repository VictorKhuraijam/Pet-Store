import { Title }from '../components/index'
import { assets } from '../assets/assets'

const About = () => {
  return (
    <div className='px-4'>

      <div className='text-2xl text-center pt-8 border-t'>
          <Title text1={'ABOUT'} text2={'US'} />
      </div>

      <div className='my-10 flex flex-col md:flex-row gap-16'>
          <img className='w-full md:max-w-[450px] object-cover' src={assets.about_img} alt="" />
          <div className='flex flex-col justify-center gap-6 md:w-2/4 text-gray-600'>
            <p>Royal Rex was founded with a deep love for animals and a mission to make pet care simple, accessible, and enjoyable. Our journey began with the idea of creating a trusted online destination where pet owners within the <b>Imphal Valley</b> can find everything they need to keep their furry, feathered, and scaly friends happy and healthy.</p>

            <p>Since our inception, we’ve been committed to curating a wide selection of high-quality pet products, from nutritious food and comfortable bedding to fun toys and essential grooming supplies. We partner with trusted brands and suppliers to ensure that every product meets the highest standards of safety and care.</p>

            <b className='text-gray-800'>Our Mission</b>

            <p>At Royal Rex, our mission is to provide pet owners with a convenient and reliable shopping experience while prioritizing the well-being of their beloved companions. We strive to offer excellent service, valuable resources, and top-tier products, making pet parenting a joyful and rewarding journey.</p>
          </div>
      </div>

      <div className=' text-xl py-4'>
          <Title text1={'WHY'} text2={'CHOOSE US'} />
      </div>

      <div className='flex flex-col md:flex-row text-sm mb-20'>
          <div className='border px-10 md:px-16 py-8 sm:py-20 flex flex-col gap-5'>
            <b>Quality Assurance:</b>
            <p className=' text-gray-600'>We meticulously select and vet each product to ensure it meets our stringent quality standards.</p>
          </div>
          <div className='border px-10 md:px-16 py-8 sm:py-20 flex flex-col gap-5'>
            <b>Convenience:</b>
            <p className=' text-gray-600'>With our user-friendly interface and hassle-free ordering process, shopping has never been easier.</p>
          </div>
          <div className='border px-10 md:px-16 py-8 sm:py-20 flex flex-col gap-5'>
            <b>Exceptional Customer Service:</b>
            <p className=' text-gray-600'>Our store is dedicated  to assist you the way possible, ensuring your satisfaction is our top priority.</p>
          </div>
      </div>



    </div>
  )
}

export default About
