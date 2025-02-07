import { useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { Link, useNavigate } from 'react-router-dom'

const Signup = () => {
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const onSubmitHandler = async (event) => {
    event.preventDefault()
    try {
      const response = await axios.post(
        import.meta.env.VITE_BACKEND_URL + '/user/register',
        { name, email, password },
        { withCredentials: true }
      )

      if (response.data.success) {
        toast.success("Account created successfully!")
        navigate("/login")
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    }
  }

  return (
    <form onSubmit={onSubmitHandler} className='flex flex-col items-center w-[90%] sm:max-w-96 m-auto mt-14 gap-4 text-gray-800'>
      <div className='inline-flex items-center gap-2 mb-2 mt-10'>
        <p className='prata-regular text-3xl'>Sign Up</p>
        <hr className='border-none h-[1.5px] w-8 bg-gray-800' />
      </div>

      <input
        onChange={(e) => setName(e.target.value)}
        value={name}
        type="text"
        className='w-full px-3 py-2 border border-gray-800'
        placeholder='Name'
        required
      />

      <input
        onChange={(e) => setEmail(e.target.value)}
        value={email}
        type="email"
        className='w-full px-3 py-2 border border-gray-800'
        placeholder='Email'
        required
      />

      <input
        onChange={(e) => setPassword(e.target.value)}
        value={password}
        type="password"
        className='w-full px-3 py-2 border border-gray-800'
        placeholder='Password'
        required
      />

      <div className='w-full flex justify-end text-sm mt-[-8px]'>
        <Link to="/login" className='cursor-pointer'>Already have an account? Login</Link>
      </div>

      <button className='bg-black rounded-xl text-white font-light px-8 py-2 mt-4'>
        Sign Up
      </button>
    </form>
  )
}

export default Signup
