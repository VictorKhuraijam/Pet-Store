import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import {assets} from '../assets/assets.js'

function SearchBar({ onFilteredProductsChange }) {

  const [search, setSearch] = useState('')
  const products = useSelector((state) => state.shop.products)

  useEffect(() => {
    // Filter products whenever search term changes
    const filteredProducts = products.filter((product) => {
      const searchTerm = search.toLowerCase();
      return (
        product.name.toLowerCase().includes(searchTerm) ||
        product.category.toLowerCase().includes(searchTerm) ||
        product.description.toLowerCase().includes(searchTerm)
      );
    });

    // Pass filtered products up to parent component
    onFilteredProductsChange(filteredProducts);
  },[search, products, onFilteredProductsChange])

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  return  (
    <div className=' text-center'>
      <div className='inline-flex items-center justify-center border border-gray-400 px-5 py-2 my-5 mx-3 rounded-full w-3/4 sm:w-1/2'>
        <input
           value={search}
           onChange={handleSearchChange}
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
