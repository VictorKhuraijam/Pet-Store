import {useEffect, useState } from 'react'
import { assets } from '../assets/assets';
import {ProductItem, SearchBar, Title} from '../components/index';
import { fetchProducts, setSearch } from '../store/shopSlice';
import { useSelector, useDispatch } from 'react-redux';


const Collection = () => {

  const dispatch = useDispatch()
  const products = useSelector((state) => state.shop.products)
  const search =  useSelector((state) => state.shop.search)
  const showSearch = useSelector((state) => state.shop.showSearch)

  const [showFilter,setShowFilter] = useState(false);
  const [filterProducts,setFilterProducts] = useState([]);
  const [category,setCategory] = useState([]);
  const [type,setType] = useState([]);
  const [sortType,setSortType] = useState('relavent')

  const toggleCategory = (e) => {

    if (category.includes(e.target.value)) {
        setCategory(prev=> prev.filter(item => item !== e.target.value))
    }
    else{
      setCategory(prev => [...prev,e.target.value])
    }

  }

  const toggleType = (e) => {

    if (type.includes(e.target.value)) {
      setType(prev=> prev.filter(item => item !== e.target.value))
    }
    else{
      setType(prev => [...prev,e.target.value])
    }
  }

  const applyFilter = () => {

    let productsCopy = products;

    if (search) {
      productsCopy = productsCopy.filter(item => item.type.toLowerCase().includes(search.toLowerCase()) || item.category.toLowerCase().includes(search.toLowerCase()) )
    }

    if (category.length > 0) {
      productsCopy = productsCopy.filter(item => category.includes(item.category));
    }

    if (type.length > 0 ) {
      productsCopy = productsCopy.filter(item => type.includes(item.type))
    }

    setFilterProducts(productsCopy)

  }

  const sortProduct = () => {

    let fpCopy = filterProducts;

    switch (sortType) {
      case 'low-high':
        setFilterProducts(fpCopy.sort((a,b)=>(a.price - b.price)));
        break;

      case 'high-low':
        setFilterProducts(fpCopy.sort((a,b)=>(b.price - a.price)));
        break;

      default:
        applyFilter();
        break;
    }

  }

  const handleSearchChange = (e) => {
    dispatch(setSearch(e.target.value));
  };

  useEffect(()=>{
    if (products.length === 0) {
      dispatch(fetchProducts());
    }
  },[dispatch, products.length])

  useEffect(() => {
    applyFilter();
  }, [category, type, products, search, showSearch]);

  useEffect(()=>{
    sortProduct();
  },[sortType])

  return (
    <>
    <SearchBar
       search={search}
       onSearchChange={handleSearchChange}
    />

    <div className='flex flex-col sm:flex-row gap-1 sm:gap-10  '>

      {/* Filter Options */}
      <div className='min-w-60'>
        <p
          className='my-2 text-xl flex items-center  gap-2'>
           <span
            onClick={()=>setShowFilter(!showFilter)}
            className='cursor-pointer inline-block'
           > FILTERS
           </span>
          <img className={`h-3 sm:hidden ${showFilter ? 'rotate-90' : ''}`} src={assets.dropdown_icon} alt="" />
        </p>
        {/* Category Filter */}
        <div className={`border border-gray-300 pl-5 py-3 mt-6 ${showFilter ? '' :'hidden'} sm:block`}>
          <p className='mb-3 text-sm font-medium'>CATEGORIES</p>
          <div className='flex flex-col gap-2 text-sm font-light text-gray-700'>
            <p className='flex gap-2'>
              <input className='w-3' type="checkbox" value={'Dog'} onChange={toggleCategory}/> Dog
            </p>
            <p className='flex gap-2'>
              <input className='w-3' type="checkbox" value={'Cat'} onChange={toggleCategory}/> Cat
            </p>

          </div>
        </div>
        {/* SubCategory Filter */}
        <div className={`border border-gray-300 pl-5 py-3 my-5 ${showFilter ? '' :'hidden'} sm:block`}>
          <p className='mb-3 text-sm font-medium'>TYPE</p>
          <div className='flex flex-col gap-2 text-sm font-light text-gray-700'>
            <p className='flex gap-2'>
              <input className='w-3' type="checkbox" value={'Food'} onChange={toggleType}/> Food
            </p>
            <p className='flex gap-2'>
              <input className='w-3' type="checkbox" value={'Toy'} onChange={toggleType}/> Toys
            </p>
            <p className='flex gap-2'>
              <input className='w-3' type="checkbox" value={'Accessories'} onChange={toggleType}/> Accessories
            </p>
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
             filterProducts.map((item,index)=>(
              <ProductItem
                key={index}
                name={item.name}
                id={item._id}
                price={item.price}
                image={item.images[0].url} />
              ))

          }

        </div>
      </div>

    </div>
    </>
  )
}

export default Collection
