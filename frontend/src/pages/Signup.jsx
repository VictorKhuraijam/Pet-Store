import { useState, useEffect } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { Link, useNavigate } from 'react-router-dom'
import { backendUrl } from '../store/consts'
import { useDispatch } from 'react-redux'
import {setUser, setAuth} from '../store/userSlice'
import { Eye, EyeOff } from 'lucide-react'

const Signup = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    otp: ''
  })

  const [passwordVisible, setPasswordVisible] = useState(false)

  const [isOtpSent, setIsOtpSent] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [timeLeft, setTimeLeft] = useState(120)
  const [showResend, setShowResend] = useState(false)

  useEffect(() => {
    if (!isOtpSent || timeLeft <= 0) return

    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer)
          setShowResend(true)
          return 0
        }
        return prevTime - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isOtpSent, timeLeft])

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const sendOTP = async (e) => {

    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await axios.post(
        `${backendUrl}/users/register`,
        {
          username: formData.name,
          email: formData.email,
          password: formData.password
        },
        { withCredentials: true }
      )

      if (response.data.success) {
        setIsOtpSent(true)
        setTimeLeft(120)
        setShowResend(false)
        toast.success("OTP sent to your email!")
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send OTP")
    } finally {
      setIsLoading(false)
    }
  }

  const verifyOTPAndRegister = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await axios.post(
        `${backendUrl}/users/verify-otp`,
        {
          email: formData.email,
          otp: formData.otp
        },
        { withCredentials: true }
      )

      if (response.data.success) {
         dispatch(setUser(response.data.data.user));
         dispatch(setAuth(true));
        toast.success("Registration successful!")
        navigate("/")
      }
    } catch (error) {
      console.error(error)
      toast.error( error.response?.data?.message || "OTP is incorrect. Please try again")
    } finally {
      setIsLoading(false)
    }
  }

  const resendOTP = async () => {
    setIsLoading(true)
    try {
      const response = await axios.post(
        `${backendUrl}/users/resend-otp`,
        {
          email: formData.email,
          type: "registration"
        },
        { withCredentials: true }
      )

      if (response.data.success) {
        setTimeLeft(120)
        setShowResend(false)
        toast.success("New OTP sent to your email!")
      }
    } catch (error) {
      console.error(error)
      toast.error("Failed to resend OTP")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form
      onSubmit={isOtpSent ? verifyOTPAndRegister : sendOTP}
      className="flex flex-col items-center w-[90%] sm:max-w-96 m-auto mt-14 gap-4 text-gray-800"
    >
      <div className="inline-flex items-center gap-2 mb-2 mt-10">
        <p className="prata-regular text-3xl">Sign Up</p>
        <hr className="border-none h-[1.5px] w-8 bg-gray-800" />
      </div>

      {!isOtpSent ? (
        <>
          <input
            name="name"
            onChange={handleChange}
            value={formData.name}
            type="text"
            className="w-full px-3 py-2 border border-gray-800"
            placeholder="Name"
            required
          />

          <input
            name="email"
            onChange={handleChange}
            value={formData.email}
            type="email"
            className="w-full px-3 py-2 border border-gray-800"
            placeholder="Email"
            required
          />

          <div className="relative m-auto w-full">
            <input
              name="password"
              onChange={handleChange}
              value={formData.password}
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

          

          <div className="w-full flex justify-end text-sm mt-[-8px]">
            <Link to="/login" className="cursor-pointer">
              Already have an account? Login
            </Link>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="bg-black rounded-xl text-white font-light px-8 py-2 mt-4 disabled:bg-gray-400"
          >
            {isLoading ? "Sending OTP..." : "Send Verification Code"}
          </button>
        </>
      ) : (
        <div className="w-full flex flex-col gap-4">
          <p className="text-center text-sm">
            We&apos;ve sent a verification code to <br/>
            <span className="font-medium">{formData.email}</span><br/>
            with a validity for 10 minutes
          </p>

          <input
            name="otp"
            onChange={handleChange}
            value={formData.otp}
            type="text"
            className="w-[250px] m-auto rounded-lg px-3 py-2 border border-gray-800"
            placeholder="Enter OTP"
            required
          />

          <div className="text-center text-sm font-medium">
            {timeLeft === 0 ? "" : `(Resend OTP in: ${formatTime(timeLeft)})`}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-[250px] m-auto bg-black rounded-xl text-white font-light px-8 py-2 disabled:bg-gray-400"
          >
            {isLoading ? "Verifying..." : "Verify & Register"}
          </button>

          { showResend && (
            <button
            type="button"
            onClick={resendOTP}
            disabled={isLoading}
            className="text-sm text-gray-600 underline"
          >
            Didn&apos;t receive the code? Resend
          </button>
          )}
        </div>
      )}
    </form>
  )
}

export default Signup
