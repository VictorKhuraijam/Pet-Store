import { assets } from '../assets/assets'
import {NavLink} from 'react-router-dom'

const Footer = () => {
  return (
    <div>

          <div className='px-4 flex flex-col sm:grid lg:grid-cols-[1fr_2fr_1fr_1fr]  gap-10 my-10 mt-40 text-sm'>

          {/* Logo Section */}
          <div>
            <NavLink to='/' className='cursor-pointer inline-block'>
            <img src={assets.logo} className='mb-5 w-32' alt="Royal Rex Logo" />
            </NavLink>
          </div>

          {/* Description Section */}
          <div>
            <p className='w-full md:w-2/3 text-gray-600'>
              At Royal Rex, we are passionate about providing top-quality pet products and exceptional service to pet owners.
              Our mission is to ensure the happiness and well-being of your furry, feathered, and scaly companions by offering
              carefully curated supplies, nutritious food, and comfortable accessories. Your pet’s health and satisfaction are
              our top priorities, and we are committed to making pet care effortless and enjoyable for you.
            </p>
          </div>

          {/* Company Section */}
          <div>
            <p className='text-xl font-medium mb-5'>COMPANY</p>
            <ul className='flex flex-col gap-1 text-gray-600'>
              <NavLink to='/' className='cursor-pointer  hover:underline transition duration-300' >Home</NavLink>
              <NavLink to='/about' className='cursor-pointer  hover:underline transition duration-300 '>About us</NavLink>
              <NavLink to='/delivery' className='cursor-pointer  hover:underline transition duration-300 '>Delivery</NavLink>
              <NavLink to='/contact' className='cursor-pointer hover:underline focus:outline-none active:bg-transparent transition duration-300 '>Contact Us</NavLink>
            </ul>
          </div>

          {/* Get In Touch Section */}
          <div>
            <p className='text-xl font-medium mb-5'>GET IN TOUCH</p>
            <ul className='flex flex-col gap-1 text-gray-600'>
              <li>+1-212-456-7890</li>
              <li>contact@royalrex.com</li>
            </ul>
          </div>

          </div>


    </div>
  )
}

export default Footer
