import { useState, useEffect, useContext } from 'react'
import AuthContext from '../context/AuthContext'
import { toast } from 'react-toastify'
import {useNavigate} from 'react-router-dom'
import { Eye, EyeOff} from 'lucide-react'

const Login = () => {

    const [email,setEmail] = useState('')
    const [password,setPassword] = useState('')
    const [passwordVisible, setPasswordVisible] = useState(false)
    const navigate = useNavigate()
    const {loginAdmin, isAuthenticated} = useContext(AuthContext)

    useEffect(() => {
        if(isAuthenticated){
            navigate('/add')
        }
    },[isAuthenticated, navigate])

    const onSubmitHandler = async (e) => {
        e.preventDefault();
            if (!email || !password) {
                toast.error("Please fill in all fields")
                return
            }

        try {
            await loginAdmin(email, password)

        } catch (error) {
            // console.log(error);
            toast.error(error.message)
        }
    }

  return (
    <div className='min-h-screen flex items-center justify-center w-full'>
        <div className='bg-white shadow-md rounded-lg px-8 py-6 max-w-md'>
            <h1 className='text-2xl font-bold mb-4'>Admin Panel</h1>
            <form onSubmit={onSubmitHandler}>
                <div className='mb-3 min-w-72'>
                    <p className='text-sm font-medium text-gray-700 mb-2'>Email Address</p>
                    <input onChange={(e)=>setEmail(e.target.value)} value={email} className='rounded-md w-full px-3 py-2 border border-gray-300 outline-none' type="email" placeholder='your@email.com' required />
                </div>
                {/* <div className='mb-3 min-w-72'>
                    <p className='text-sm font-medium text-gray-700 mb-2'>Password</p>
                    <input onChange={(e)=>setPassword(e.target.value)} value={password} className='rounded-md w-full px-3 py-2 border border-gray-300 outline-none' type="password" placeholder='Enter your password' required />
                </div> */}

                <div className="relative m-auto w-full">
                    <p className='text-sm font-medium text-gray-700 mb-2'>Password</p>
                    <input
                    name="password"
                    onChange={(e)=>setPassword(e.target.value)}
                    value={password}
                    type={passwordVisible ? "text" : "password"}
                    className="w-full rounded-lg px-3 py-2 border border-gray-300 pr-10 focus:outline-none"
                    placeholder="Enter password"
                    required
                    />
                    <button
                    type="button"
                    className="absolute right-3 top-5/7 transform -translate-y-1/2"
                    onClick={() => setPasswordVisible(!passwordVisible)}
                    >
                    {passwordVisible ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                </div>

                <button className='mt-2 w-full py-2 px-4 rounded-md text-white bg-black' type="submit"> Login </button>
            </form>
        </div>
    </div>

 )
}

export default Login
