import  {  useEffect, useState } from 'react'
import { toast } from 'react-toastify';
import { Link, useNavigate } from 'react-router-dom';
import {checkAuthStatus, loginUser} from '../store/userSlice'
import { useDispatch } from 'react-redux';
import { Eye, EyeOff} from 'lucide-react'

const Login = () => {

  const navigate = useNavigate()
  const dispatch = useDispatch()

  const [password,setPasword] = useState('')
  const [passwordVisible, setPasswordVisible] = useState(false)
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
            className='w-full px-3 py-2 rounded-lg border border-gray-800' placeholder='Email'
            required
          />

          {/* <input
            onChange={(e)=>setPasword(e.target.value)}
            value={password}
            type="password" className='w-full px-3 py-2 border border-gray-800'
            placeholder='Password'
            required
          /> */}

          <div className="relative m-auto w-full">
            <input
              name="password"
              onChange={(e)=>setPasword(e.target.value)}
              value={password}
              type={passwordVisible ? "text" : "password"}
              className="w-full rounded-lg px-3 py-2 border border-gray-800 pr-10"
              placeholder="Enter password"
              required
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2"
              onClick={() => setPasswordVisible(!passwordVisible)}
            >
              {passwordVisible ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>


        <div className='w-full flex justify-between text-sm mt-[-8px]'>
            <Link
              to='/forgot-password'
              className='cursor-pointer'
            >
              Forgot your password?
            </Link>

            <Link
              to='/signup'
              className='cursor-pointer'
            >
              Create Account
            </Link>
        </div>
        <button className='bg-gray-400 text-black text-xl rounded-lg font-light px-8 py-2 mt-4'>Sign In</button>
    </form>
  )
}

export default Login
