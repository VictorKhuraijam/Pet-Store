import { ToastContainer } from "react-toastify"
import {Footer, NavBar} from './components/index.js'
import { Routes, Route } from "react-router-dom"
import {About, Cart, Collection, Contact, ForgotPassword, Home, Login, Orders, PlaceOrder, Product, Profile} from './pages/index.js'
import Signup from "./pages/Signup.jsx"


export const App = () => {


  return (
    <div className="px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw]">
      <ToastContainer />
      <NavBar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/collection" element={<Collection />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/product/:productId" element={<Product />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/place-order" element={<PlaceOrder />} />

      </Routes>
      <Footer />
    </div>
  )
}
