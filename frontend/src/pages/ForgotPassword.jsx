import { useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'
import { backendUrl } from '../store/consts'
import { Eye, EyeOff} from 'lucide-react'

const ForgotPassword = () => {
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    otp: ''
  })

  const [isOtpSent, setIsOtpSent] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [passwordVisible, setPasswordVisible] = useState(false)
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false)



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
        `${backendUrl}/users/forgot-password`,
        {
          email: formData.email,
        },
        { withCredentials: true }
      )

      if (response.data.success) {
        setIsOtpSent(true)
        toast.success("OTP sent to your email!")
      }
    } catch (error) {
      console.error(error)
      toast.error("Failed to send OTP")
    } finally {
      setIsLoading(false)
    }
  }

  const verifyOTPAndChangePassword = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    // Check if passwords match
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match")
      setIsLoading(false)
      return
    }

    try {
      const response = await axios.post(
        `${backendUrl}/users/change-forgot-password`,
        {
          email: formData.email,
          otp: formData.otp,
          password: formData.password
        },
        { withCredentials: true }
      )

      if (response.data.success) {

        toast.success("Password changed successful!")
        navigate("/login")
      }
    } catch (error) {
      console.error(error)
      toast.error( " OTP is incorrect. Please try again")
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
          type: "password-reset"
        },
        { withCredentials: true }
      )

      if (response.data.success) {
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
      onSubmit={isOtpSent ? verifyOTPAndChangePassword : sendOTP}
      className="flex flex-col items-center w-[90%] sm:max-w-96 m-auto mt-14 gap-4 text-gray-800"
    >
      <div className="inline-flex items-center gap-2 mb-2 mt-10">
        <p className="prata-regular text-2xl">Reset Password</p>
        <hr className="border-none h-[1.5px] w-8 bg-gray-800" />
      </div>

      {!isOtpSent ? (
        <>
          <div>
            Enter your registered email address
          </div>

          <input
            name="email"
            onChange={handleChange}
            value={formData.email}
            type="email"
            className="w-full px-3 py-2 border rounded border-gray-800"
            placeholder="Email"
            required
          />

          <button
            type="submit"
            disabled={isLoading}
            className="bg-gray-400 text-gray-700 rounded-xl font-light px-8 py-2 mt-4 disabled:bg-gray-400"
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
            className="w-[250px] m-auto rounded-lg px-3 py-2 border border-gray-800"
            placeholder="Enter OTP"
            required
          />

           <div className="relative w-[250px] m-auto">
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

          <div className="relative w-[250px] m-auto">
            <input
              name="confirmPassword"
              onChange={handleChange}
              value={formData.confirmPassword}
              type={confirmPasswordVisible ? "text" : "password"}
              className="w-full rounded-lg px-3 py-2 border border-gray-800 pr-10"
              placeholder="Confirm password"
              required
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2"
              onClick={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
            >
              {confirmPasswordVisible ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="bg-gray-400 text-gray-900 rounded-xl font-light px-8 py-2 disabled:bg-gray-400"
          >
            {isLoading ? "Processing..." : "Change Password"}
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

export default ForgotPassword
