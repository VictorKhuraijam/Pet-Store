import {useCallback, useEffect, useMemo, useState } from 'react'
import { assets } from '../assets/assets';
import {Pagination, ProductItem, SearchBar, Title} from '../components/index';
import { fetchProducts} from '../store/shopSlice';
import { useSelector, useDispatch } from 'react-redux';


const Collection = () => {

  const dispatch = useDispatch()
  const products = useSelector((state) => state.shop.products)

  const [search, setSearch] = useState([]);
  const [showFilter,setShowFilter] = useState(false);
  const [category,setCategory] = useState([]);
  const [type,setType] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(10); // Display 10 products per page

  const filteredProducts = useMemo(() => {
    let productsCopy = search.length > 0 ? search : [...products];

    if (category.length > 0) {
      productsCopy = productsCopy.filter((item) => category.includes(item.category));
    }

    if (type.length > 0) {
      productsCopy = productsCopy.filter((item) => type.includes(item.type));
    }

    return productsCopy

  },[category,type, products, search])

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [filteredProducts])


  const toggleCategory = (e) =>{
    setCategory(prev => prev.includes(e) ? prev.filter(c => c !== e) : [...prev, e])
}

  const toggleType = (e) => {
    setType(prev => prev.includes(e) ? prev.filter(t => t !== e) : [...prev, e])
  }


  const categories = products.reduce((acc, item) =>
      acc.includes(item.category) ? acc : [...acc, item.category], []
  );

  const types = products.reduce((acc, item) =>
      acc.includes(item.type) ? acc : [...acc, item.type], []
  );


  const handleSearchResults = useCallback((filteredResults) => {
    setSearch(filteredResults);
  },[]);

  useEffect(()=>{
    if (products.length === 0) {
      dispatch(fetchProducts());
    }
  },[dispatch, products.length])



  // useEffect(() => {
  //   let productsCopy = search.length > 0 ? search : [...products];

  //   if (category.length > 0) {
  //     productsCopy = productsCopy.filter((item) => category.includes(item.category));
  //   }

  //   if (type.length > 0) {
  //     productsCopy = productsCopy.filter((item) => type.includes(item.type));
  //   }

  //   setFilterProducts(productsCopy);
  // }, [category, type, products, search]);




  return (
    <>
    <SearchBar
         onSearchResults={handleSearchResults}
    />

    <div className='px-4 flex flex-col sm:flex-row gap-1 sm:gap-10  '>

      {/* Filter Button for Small Screens */}
        <button
          onClick={() => setShowFilter(!showFilter)}
          className="sm:hidden bg-gray-400 text-gray-700 px-4 py-2 rounded-md flex items-center gap-2 w-[100px]"
        >
          <span>FILTERS</span>
          <img
            className={`h-3 transition-transform ${showFilter ? "rotate-90" : ""}`}
            src={assets.dropdown_icon}
            alt="Toggle Filters"
          />
        </button>

        <div className={`min-w-60 ${showFilter ? "block" : "hidden"} sm:block`}>
        {/* Category Filter */}

        {categories.length > 0 && (
            <div className={`border border-gray-300 pl-5 py-3 mt-6 ${showFilter ? '' : 'hidden'} sm:block`}>
              <p className='mb-3 text-sm font-medium'>CATEGORIES</p>
              <div className='flex flex-col gap-2 text-sm font-light text-gray-700'>
                {categories.map((item) => (
                  <p key={item} className='flex gap-2'>
                    <input
                      className='w-3'
                      type='checkbox'
                      value={item}
                      onChange={(e) => toggleCategory(e.target.value)}
                    />{' '}
                    {item}
                  </p>
                ))}
                </div>
            </div>
          )}

        {/* SubCategory Filter */}
        <div className={`border border-gray-300 pl-5 py-3 my-5 ${showFilter ? '' :'hidden'} sm:block`}>
          <p className='mb-3 text-sm font-medium'>TYPE</p>
          <div className='flex flex-col gap-2 text-sm font-light text-gray-700'>
            {/* <p className='flex gap-2'>
              <input className='w-3' type="checkbox" value={'Food'} onChange={(e) => toggleType(e.target.value)}/> Food
            </p>
            <p className='flex gap-2'>
              <input className='w-3' type="checkbox" value={'Toy'} onChange={(e) => toggleType(e.target.value)}/> Toys
            </p>
            <p className='flex gap-2'>
              <input className='w-3' type="checkbox" value={'Accessories'} onChange={(e) => toggleType(e.target.value)}/> Accessories
            </p> */}

              {types.map((type) => (
                  <p key={type} className='flex gap-2'>
                    <input
                      className='w-3'
                      type='checkbox'
                      value={type}
                      onChange={(e) => toggleType(e.target.value)}
                    />{' '}
                    {type}
                  </p>
                ))}
          </div>
        </div>
      </div>

      {/* Right Side */}
      <div className='flex-1'>

        <div className='flex justify-between text-base sm:text-2xl mb-4'>
            <Title text1={'ALL'} text2={'COLLECTIONS'} />
            {/* Porduct Sort */}
            {/* <select onChange={(e)=>setSortType(e.target.value)} className='border-2 border-gray-300 text-sm px-2'>
              <option value="relavent">Sort by: Relavent</option>
              <option value="low-high">Sort by: Low to High</option>
              <option value="high-low">Sort by: High to Low</option>
            </select> */}
        </div>

        {/* Map Products */}
        <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 gap-y-6'>
          {
             currentProducts.map((item,index)=>(
              <ProductItem
                key={index}
                name={item.name}
                id={item._id}
                price={item.price}
                image={item.images[0].url} />
              ))
          }
        </div>

          {/* Pagination controls */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        paginate={paginate}
      />

      </div>

    </div>
    </>
  )
}

export default Collection
