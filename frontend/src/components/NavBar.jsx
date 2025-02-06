import { Link, NavLink } from "react-router-dom";
import { assets } from "../assets/assets";
import {  useState, useEffect, useRef } from "react";
import {checkAuthStatus, logoutUser, resetUser} from '../store/userSlice'
import { getCartCount} from '../store/cartSlice'
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";

function Navbar() {
    const location  = useLocation()
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const menuRef = useRef(null)
    const cartCount = useSelector(getCartCount) || 0;
    const isAuthenticated = useSelector((state) => state.user.isAuthenticated);
    const user = useSelector((state) => state.user.user);

    const [visible, setVisible] = useState(false)

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
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    useEffect(() => {
        dispatch(checkAuthStatus());
      }, [dispatch]);


    const logout = async() => {

        try {
            dispatch(logoutUser())
            dispatch(resetUser())
            navigate('/login')
        } catch (error) {
            console.error("Error during logout:", error)
        }
    }

    {`cursor-pointer hover:text-black  ${isActive('/profile')}`}


  return (
    <div className=' flex items-center justify-between py-5 font-medium  '>

      <Link to='/'><img src={assets.logo} className='w-36' alt="" /></Link>

      <ul className='hidden sm:flex gap-5 text-sm text-gray-500'>

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
                {isAuthenticated ? (
                        <div
                            className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-sm cursor-pointer"
                            // onClick={() => navigate('/profile')}
                        >
                            {getInitials(user?.username)}
                        </div>
                    ) : (
                        <img
                            onClick={() => navigate('/login')}
                            className='w-5 cursor-pointer'
                            src={assets.profile_icon}
                            alt=""
                        />
                    )}
                {/* Dropdown Menu */}
                {isAuthenticated &&
                <div className='group-hover:block hidden absolute right-0 pt-4'>
                    <div className='flex flex-col gap-2 w-36 py-3 px-5  bg-slate-100 text-gray-500 rounded'>
                        <p onClick={()=>navigate('/profile')}
                        className={`cursor-pointer hover:text-black  ${isActive('/profile')}`} >My Profile</p>
                        {/* <p onClick={()=>navigate('/orders')} className={`cursor-pointer hover:text-black  ${isActive('/orders')}`}>Orders</p> */}
                        <p onClick={logout} className='cursor-pointer hover:text-black'>Logout</p>
                    </div>
                </div>}
            </div>
            {isAuthenticated && (
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
            <img onClick={()=>setVisible(true)} src={assets.menu_icon} className='w-5 cursor-pointer sm:hidden' alt="" />
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

        {/* Sidebar menu for small screens */}
            {visible && (
            <div
                ref={menuRef}
                className="absolute right-2 top-12 bg-slate-100 shadow-lg rounded-lg w-48">
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
                    className={`py-2 px-4  hover:bg-gray-100 rounded ${isActive('/')}`}
                    to="/"
                >
                    HOME
                </NavLink>
                <NavLink
                    onClick={() => setVisible(false)}
                    className={`py-2 px-4 hover:bg-gray-100 rounded ${isActive('/collection')}`}
                    to="/collection"
                >
                    REX COLLECTION
                </NavLink>
                <NavLink
                    onClick={() => setVisible(false)}
                    className={`py-2 px-4 hover:bg-gray-100 rounded ${isActive('/about')}`}
                    to="/about"
                >
                    ABOUT
                </NavLink>
                <NavLink
                    onClick={() => setVisible(false)}
                    className={`py-2 px-4 hover:bg-gray-100 rounded ${isActive('/co')}`}
                    to="/contact"
                >
                    CONTACT US
                </NavLink>
                </div>
            </div>
            )}


    </div>
  )
}

export default Navbar
