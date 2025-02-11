import  {  useEffect, useState } from 'react'
import { toast } from 'react-toastify';
import { Link, useNavigate } from 'react-router-dom';
import {checkAuthStatus, loginUser} from '../store/userSlice'
import { useDispatch } from 'react-redux';

const Login = () => {

  const navigate = useNavigate()
  const dispatch = useDispatch()

  const [password,setPasword] = useState('')
  const [email,setEmail] = useState('')

  const onSubmitHandler = async (event) => {
      event.preventDefault();
      try {

            dispatch(loginUser(email, password));
            toast.success("Login successful")
            navigate("/")

      } catch (error) {
        console.log(error)
        toast.error(error.message)
      }
  }

  useEffect(()=>{
    dispatch(checkAuthStatus())
  },[dispatch])

  return (
    <form onSubmit={onSubmitHandler} className='flex flex-col items-center w-[90%] sm:max-w-96 m-auto mt-14 gap-4 text-gray-800'>
        <div className='inline-flex items-center gap-2 mb-2 mt-10'>
            <p className='prata-regular text-3xl'>Login</p>
            <hr className='border-none h-[1.5px] w-8 bg-gray-800' />
        </div>

          <input
            onChange={(e)=>setEmail(e.target.value)}
            value={email}
            type="email"
            className='w-full px-3 py-2 border border-gray-800' placeholder='Email'
            required
          />

          <input
            onChange={(e)=>setPasword(e.target.value)}
            value={password}
            type="password" className='w-full px-3 py-2 border border-gray-800'
            placeholder='Password'
            required
          />


        <div className='w-full flex justify-between text-sm mt-[-8px]'>
            <p className=' cursor-pointer'>Forgot your password?</p>
            <Link
              to='/signup'
              className='cursor-pointer'
            >
              Create Account
            </Link>
        </div>
        <button className='bg-black text-white font-light px-8 py-2 mt-4'>Sign In</button>
    </form>
  )
}

export default Login
