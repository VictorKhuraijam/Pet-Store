import { Link, NavLink } from "react-router-dom";
import { assets } from "../assets/assets";
import { useState, useEffect, useRef } from "react";
import {  logoutUser, resetUser} from '../store/userSlice'
import {   getCartCount} from '../store/cartSlice'
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";

function Navbar() {
    const location  = useLocation()
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const menuRef = useRef(null)
    const profileRef = useRef(null)

    const cartCount = useSelector(getCartCount) || 0;
    const isAuthenticated = useSelector((state) => state.user.isAuthenticated);
    const user = useSelector((state) => state.user.user);
    const loading = useSelector((state) => state.user.loading);

    const [visible, setVisible] = useState(false)
    const [dropdownVisible, setDropdownVisible] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false)

    const getInitials = (username) => {
        if (!username) return "";
        return username
            .split(" ")
            .map(word => word[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    const isActive = (path) => location.pathname === path ? "text-black font-semibold" : "text-gray-500";

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setVisible(false);
            }
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setDropdownVisible(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // useEffect(() => {
    //     const checkAuth = async () => {
    //       const success = await dispatch(checkAuthStatus());

    //       if (!success) {
    //         //as after refresh token expiry there was a need for double refresh to clear out the user data i.e. delay
    //         dispatch(resetUser());
    //         dispatch(clearCart())
    //       }
    //     };

    //     checkAuth();
    //   }, [dispatch]);


    const logout = async() => {

        try {
            setIsLoggingOut(true)
            await dispatch(logoutUser())
            await dispatch(resetUser())
            {/*
                The warning from VS Code is technically correct - the dispatch function itself doesn't return a Promise that meaningfully affects the operation. However, the await is inadvertently helping by creating those microtask delays that allow for better state synchronization. It's a side effect rather than the intended use of await.
                 */}
            navigate('/')
        } catch (error) {
            console.error("Error during logout:", error)
        } finally {
            setIsLoggingOut(false)
        }
    }

    const renderAuthButton = () => {
        if (isLoggingOut) {
            return null; // Don't render anything during logout transition
        }

    return (
        <div ref={profileRef} className="relative">
            <div
                onClick={() => isAuthenticated ? setDropdownVisible(!dropdownVisible) : navigate('/login') }
                className=" cursor-pointer ">
                {isAuthenticated && user?.username ?
                <div className="bg-gray-200 text-gray-700 w-8 h-8 rounded-full flex items-center justify-center text-sm cursor-pointer">
                    {getInitials(user.username)}
                </div> :
                    <img className='w-5' src={assets.profile_icon} alt="Profile" />}
            </div>
            {isAuthenticated && dropdownVisible && (
                <div className='absolute right-0 mt-2 w-36 bg-white shadow-lg rounded-lg p-2 text-gray-500'>
                    <p onClick={() => { navigate('/profile'); setDropdownVisible(false); }}
                       className='cursor-pointer hover:text-black py-1 px-3'>My Profile</p>
                    <p onClick={logout} className='cursor-pointer hover:text-black py-1 px-3'>Logout</p>
                </div>
            )}
        </div>
      );
    };


  return (
    <div className='px-4 lg:px-6 flex items-center justify-between py-5 font-medium '>

      <Link to='/'><img src={assets.logo} className='w-12 rounded mix-blend-multiply' alt="" /></Link>

      <ul className='hidden sm:flex gap-5  text-gray-500'>

        <NavLink
            to='/'
            className={`flex flex-col items-center gap-1  ${isActive('/')}`}>
            <p>HOME</p>
            {/* <hr className='w-2/4 border-none h-[1.5px] bg-gray-700 hidden' /> */}
        </NavLink>
        <NavLink
            to='/collection'
            className={`flex flex-col items-center gap-1 ${isActive('/collection')}`}>
            <p>REX COLLECTION</p>
            {/* <hr className='w-2/4 border-none h-[1.5px] bg-gray-700 hidden' /> */}
        </NavLink>
        <NavLink
            to='/about'
            className={`flex flex-col items-center gap-1 ${isActive('/about')}`}>
            <p>ABOUT</p>
            {/* <hr className='w-2/4 border-none h-[1.5px] bg-gray-700 hidden' /> */}
        </NavLink>
        <NavLink
            to='/contact'
            className={`flex flex-col items-center gap-1 ${isActive('/contact')}`}>
            <p>CONTACT US</p>
            {/* <hr className='w-2/4 border-none h-[1.5px] bg-gray-700 hidden' /> */}
        </NavLink>

      </ul>

      <div className='flex items-center gap-4 lg:gap-6'>

               <div className='group relative'>
                    {renderAuthButton()}

                    {/* {isAuthenticated && !isLoggingOut && dropdownVisible && (
                        <div className=' absolute right-0 pt-4'>
                            <div className='flex flex-col gap-2 w-36 py-3 px-5 bg-slate-100 text-gray-500 rounded'>
                                <p onClick={() => navigate('/profile')}
                                    className={`cursor-pointer hover:text-black ${isActive('/profile')}`}>
                                    My Profile
                                </p>
                                <p onClick={logout} className='cursor-pointer hover:text-black'>
                                    Logout
                                </p>
                            </div>
                        </div>
                    )} */}
                </div>


                {!loading  && isAuthenticated === true && !isLoggingOut &&  (
                    <div>
                        <Link to='/cart' className='relative'>
                            <img src={assets.cart_icon} className='w-5 min-w-5' alt="" />
                            {cartCount > 0 && (
                                <p className='absolute right-[-5px] bottom-[-5px] w-4 text-center leading-4 bg-black text-white aspect-square rounded-full text-[8px]'>
                                    {cartCount}
                                </p>
                            )}
                        </Link>
                    </div>
                )}

                {/* <img
                    ref={menuRef}
                    onClick={() => setVisible(!visible)}
                    src={assets.menu_icon}
                    className='w-5 cursor-pointer sm:hidden'
                    alt="menu_icon"
                /> */}

                <div ref={menuRef} className="relative">
                <img

                    onClick={() => setVisible(!visible)}
                    src={assets.menu_icon}
                    className='w-5 cursor-pointer sm:hidden'
                    alt="menu_icon"
                />

            {visible && (
            <div
                // ref={menuRef}
                className="absolute right-2 top-10 bg-slate-100 shadow-lg rounded-lg w-48">
                <div className="flex flex-col items-center text-gray-600 p-3">
                {/* <p
                    onClick={() => setVisible(false)}
                    className="flex items-center gap-4 cursor-pointer pb-2 border-b"
                >
                    <img className="h-4 rotate-180" src={assets.dropdown_icon} alt="" />
                    Back
                </p> */}
                <NavLink
                    onClick={() => setVisible(false)}
                    className={`py-2 px-4 w-full text-center hover:bg-gray-300 rounded ${isActive('/')}`}
                    to="/"
                >
                    HOME
                </NavLink>
                <NavLink
                    onClick={() => setVisible(false)}
                    className={`py-2 px-4 w-full text-center hover:bg-gray-300 rounded ${isActive('/collection')}`}
                    to="/collection"
                >
                    REX COLLECTION
                </NavLink>
                <NavLink
                    onClick={() => setVisible(false)}
                    className={`py-2 px-4 w-full text-center hover:bg-gray-300 rounded ${isActive('/about')}`}
                    to="/about"
                >
                    ABOUT
                </NavLink>
                <NavLink
                    onClick={() => setVisible(false)}
                    className={`py-2 px-4 w-full text-center hover:bg-gray-300 rounded ${isActive('/co')}`}
                    to="/contact"
                >
                    CONTACT US
                </NavLink>
                </div>
            </div>
            )}
                </div>

            </div>

        {/* Sidebar menu for small screens
        <div className={`absolute top-0 right-0 bottom-0 overflow-hidden bg-white transition-all ${visible ? 'w-full' : 'w-0'}`}>
                <div className='flex flex-col text-gray-600'>
                    <div onClick={()=>setVisible(false)} className='flex items-center gap-4 p-3 cursor-pointer'>
                        <img className='h-4 rotate-180' src={assets.dropdown_icon} alt="" />
                        <p>Back</p>
                    </div>
                    <NavLink onClick={()=>setVisible(false)} className='py-2 pl-6 border' to='/'>HOME</NavLink>
                    <NavLink onClick={()=>setVisible(false)} className='py-2 pl-6 border' to='/collection'>REX COLLECTION</NavLink>
                    <NavLink onClick={()=>setVisible(false)} className='py-2 pl-6 border' to='/about'>ABOUT</NavLink>
                    <NavLink onClick={()=>setVisible(false)} className='py-2 pl-6 border' to='/contact'>CONTACT US</NavLink>
                </div>
        </div> */}





    </div>
  )
}

export default Navbar
