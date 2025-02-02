
import {assets} from '../assets/assets'
import { useContext } from 'react'
import AuthContext from '../context/AuthContext'

const Navbar = () => {

const {logoutAdmin} = useContext(AuthContext)
  return (
    <div className='flex items-center py-2 px-[4%] justify-between'>
        <img className='w-[max(10%,80px)]' src={assets.logo} alt="" />
        <button onClick={()=>(logoutAdmin())} className='bg-gray-600 text-white px-5 py-2 sm:px-7 sm:py-2 rounded-full text-xs sm:text-sm'>Logout</button>
    </div>
  )
}

export default Navbar
