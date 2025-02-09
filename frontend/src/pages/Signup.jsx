import { useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { Link, useNavigate } from 'react-router-dom'
import { backendUrl } from '../store/consts'
import {checkAuthStatus} from '../store/userSlice'


const Signup = () => {
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    otp: ''
  })

  const [isOtpSent, setIsOtpSent] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

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
        toast.success("Registration successful!")
        checkAuthStatus()
        navigate("/")
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to verify OTP")
    } finally {
      setIsLoading(false)
    }
  }

  const resendOTP = async () => {
    setIsLoading(true)
    try {
      const response = await axios.post(
        `${backendUrl}/users/resend-otp`,
        { email: formData.email },
        { withCredentials: true }
      )

      if (response.data.success) {
        toast.success("New OTP sent to your email!")
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to resend OTP")
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

          <input
            name="password"
            onChange={handleChange}
            value={formData.password}
            type="password"
            className="w-full px-3 py-2 border border-gray-800"
            placeholder="Password"
            required
          />

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
            <span className="font-medium">{formData.email}</span>
          </p>

          <input
            name="otp"
            onChange={handleChange}
            value={formData.otp}
            type="text"
            className="w-full px-3 py-2 border border-gray-800"
            placeholder="Enter OTP"
            required
          />

          <button
            type="submit"
            disabled={isLoading}
            className="bg-black rounded-xl text-white font-light px-8 py-2 disabled:bg-gray-400"
          >
            {isLoading ? "Verifying..." : "Verify & Register"}
          </button>

          <button
            type="button"
            onClick={resendOTP}
            disabled={isLoading}
            className="text-sm text-gray-600 underline"
          >
            Didn&apos;t receive the code? Resend
          </button>
        </div>
      )}
    </form>
  )
}

export default Signup
