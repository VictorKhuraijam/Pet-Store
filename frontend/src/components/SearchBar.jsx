import { useEffect } from "react"
import {useSelector, useDispatch} from 'react-redux'
import {useLocation} from 'react-router-dom'
import { setSearch, setShowSearch } from "../store/shopSlice"
import {assets} from '../assets/assets.js'

function SearchBar() {

  const location = useLocation()
  const dispatch = useDispatch()

  const showSearch = useSelector((state) => state.shop.showSearch)
  const search = useSelector((state) => state.shop.search)

  useEffect(() => {
    if(location.pathname.includes('collection')){
      dispatch(setShowSearch(true))
    }else {
      dispatch(setShowSearch(false))
    }
  }, [location, dispatch])

  const handleSearchChange = (e) => {
    // Dispatch the search query to Redux
    dispatch(setSearch(e.target.value));
  };

  const handleCloseSearch = () => {
    // Hide the search bar
    dispatch(setShowSearch(false));
  };

  



  return showSearch  ? (
    <div className='border-t border-b bg-gray-50 text-center'>
      <div className='inline-flex items-center justify-center border border-gray-400 px-5 py-2 my-5 mx-3 rounded-full w-3/4 sm:w-1/2'>
        <input
           value={search}
           onChange={handleSearchChange}
           className='flex-1 outline-none bg-inherit text-sm'
           type="text"
           placeholder='Search'
        />
        <img className='w-4' src={assets.search_icon} alt="" />
      </div>
      <img onClick={handleCloseSearch} className='inline w-3 cursor-pointer' src={assets.cross_icon} alt="" />
    </div>
  ) : null
}

export default SearchBar
