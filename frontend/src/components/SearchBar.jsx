
import {assets} from '../assets/assets.js'

function SearchBar({ search, onSearchChange }) {


  return  (
    <div className=' text-center'>
      <div className='inline-flex items-center justify-center border border-gray-400 px-5 py-2 my-5 mx-3 rounded-full w-3/4 sm:w-1/2'>
        <input
           value={search}
           onChange={onSearchChange}
           className='flex-1 outline-none bg-inherit text-sm sm:px-'
           type="text"
           placeholder='Search'
        />
        <img className='w-4 ' src={assets.search_icon} alt="" />
      </div>
    </div>
  )
}

export default SearchBar
