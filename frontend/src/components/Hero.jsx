import {NavLink} from 'react-router-dom'
import { assets } from '../assets/assets'

const Hero = () => {
  return (
    <div className='flex flex-col sm:flex-row border-none lg:mt-10'>
      {/* Hero Left Side */}
      <div className='w-full sm:w-1/2 flex items-center justify-center py-5 sm:py-0'>
            <div className='text-[#414141]'>
                <div className='flex items-center '>
                    <p className='w-8 md:w-11 h-[2px] '></p>
                    <p className='italianno-regular font-medium text-sm sm:text-lg md:text-2xl lg:text-3xl xl:text-4xl '>Everything Your Pet Needs, All in One Place!</p>
                </div>
                <NavLink to='/collection' className='cursor-pointer'>
                <h1 className='prata-regular text-3xl sm:py-3  lg:text-5xl leading-relaxed text-center'>Shop Now</h1>
                </NavLink>
                <div className='flex items-center gap-2'>
                    <p className='italianno-regular font-medium text-sm sm:text-lg md:text-2xl lg:text-3xl xl:text-4xl p-2'>Explore our wide range of pet supplies, toys, and treats</p>
                </div>
            </div>
      </div>
      {/* Hero Right Side */}
      <img className='w-full sm:w-1/2' src={assets.hero_img} alt="" />
    </div>
  )
}

export default Hero
