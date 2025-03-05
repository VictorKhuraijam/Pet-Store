
import { NavLink } from 'react-router-dom'
import { assets } from '../assets/assets'

const Sidebar = () => {
  return (
    <div className='w-[18%] min-h-screen border-r-2'>
        <div className='flex flex-col gap-4 pt-6 pl-[20%] text-[15px]'>

        {[
          { to: "/status", icon: assets.shop_icon, label: "Store Status" },
          { to: "/add", icon: assets.add_icon, label: "Add Items" },
          { to: "/list", icon: assets.order_icon, label: "List Items" },
          { to: "/orders", icon: assets.order_icon, label: "Orders" },
        ].map(({ to, icon, label }) => (
          <NavLink
            key={to}
            className="group relative flex items-center gap-3 border border-gray-300 border-r-0 px-3 py-2 rounded-l"
            to={to}
          >
            <img className="w-5 h-5" src={icon} alt="" />

              {/* Normal Text for Medium & Large Screens */}
              <p className="hidden md:block">{label}</p>

            {/* Tooltip - Only visible on small devices */}
            <span className="absolute left-1/2 -top-8 transform -translate-x-1/2 w-max px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 sm:max-md:block md:hidden">
              {label}
            </span>
          </NavLink>
        ))}

            {/* <NavLink className='group flex items-center gap-3 border border-gray-300 border-r-0 px-3 py-2 rounded-l ' to="/status">
                <img className='w-5 h-5' src={assets.shop_icon} alt="" />
                <p className='hidden md:block group-hover:block'>Store Status</p>

            </NavLink>

            <NavLink className='group flex items-center gap-3 border border-gray-300 border-r-0 px-3 py-2 rounded-l ' to="/add">
                <img className='w-5 h-5' src={assets.add_icon} alt="" />
                <p className='hidden md:block group-hover:block'>Add Items</p>
            </NavLink>

            <NavLink className='group flex items-center gap-3 border border-gray-300 border-r-0 px-3 py-2 rounded-l' to="/list">
                <img className='w-5 h-5' src={assets.order_icon} alt="" />
                <p className='hidden md:block group-hover:block'>List Items</p>
            </NavLink>

            <NavLink className='group flex items-center gap-3 border border-gray-300 border-r-0 px-3 py-2 rounded-l' to="/orders">
                <img className='w-5 h-5' src={assets.order_icon} alt="" />
                <p className='hidden md:block group-hover:block'>Orders</p>
            </NavLink> */}

        </div>

    </div>
  )
}

export default Sidebar
