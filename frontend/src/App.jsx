import { ToastContainer } from "react-toastify"
import {Footer, NavBar, StoreStatus} from './components/index.js'
import { Routes, Route } from "react-router-dom"
import {About, Cart, Collection, Contact, ForgotPassword, Home, Login, Orders, PlaceOrder, Product, Profile} from './pages/index.js'
import Signup from "./pages/Signup.jsx"
import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { checkAuthStatus, resetUser, setAuth } from './store/userSlice.js'
import { clearCart, fetchCart } from "./store/cartSlice.js"

export const App = () => {
  const loading = useSelector(state => state.user.loading)

  const dispatch = useDispatch()

  useEffect(() => {
          const checkAuth = async () => {
            const success = await dispatch(checkAuthStatus());

            if (!success) {
              //as after refresh token expiry there was a need for double refresh to clear out the user data i.e. delay
              dispatch(resetUser());
              dispatch(clearCart())
            } else {

                    dispatch(setAuth(true));
                    dispatch(fetchCart())
            }
          };

          checkAuth();
        }, [dispatch]);


  return loading ? "" : (
    <div
    // className=" px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw]"
    >
      <ToastContainer />
      <NavBar />
      <StoreStatus />

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
