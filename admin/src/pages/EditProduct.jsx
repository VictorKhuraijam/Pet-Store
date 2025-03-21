import { useState, useContext, useEffect } from 'react'
import { assets } from '../assets/assets'
import axios from 'axios'
import { toast } from 'react-toastify'
import AuthContext from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

const EditProduct = () => {
  const { backendUrl } = useContext(AuthContext)
  const navigate = useNavigate()

  const [image1, setImage1] = useState(false)
  const [image2, setImage2] = useState(false)
  const [image3, setImage3] = useState(false)
  const [image4, setImage4] = useState(false)

  const [originalImages, setOriginalImages] = useState([])
  const [productId, setProductId] = useState("")
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState("")
  const [category, setCategory] = useState("")
  const [type, setType] = useState("Food")
  const [bestseller, setBestseller] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    // Get stored product data from localStorage
    const productData = localStorage.getItem('editProduct')

    if (!productData) {
      toast.error("No product selected for editing")
      navigate('/admin/list')
      return
    }

    try {
      const product = JSON.parse(productData)
      setProductId(product._id)
      setName(product.name)
      setDescription(product.description)
      setPrice(product.price.toString())
      setCategory(product.category)
      setType(product.type || "Food")
      setBestseller(product.bestseller || false)

      // Store original images
      if (product.images && product.images.length) {
        setOriginalImages(product.images)
      }

    } catch (error) {
      console.error("Error parsing product data:", error)
      toast.error("Error loading product data")
      navigate('/admin/list')
    }
  }, [navigate])

  const onSubmitHandler = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const formData = new FormData()

      formData.append("name", name)
      formData.append("description", description)
      formData.append("price", Number(price))
      formData.append("category", category)
      formData.append("type", type)
      formData.append("bestseller", bestseller.toString())

      // Append new images if selected
      image1 && formData.append("image1", image1)
      image2 && formData.append("image2", image2)
      image3 && formData.append("image3", image3)
      image4 && formData.append("image4", image4)

      // Add original image IDs to retain them
      originalImages.forEach((img, index) => {
        formData.append(`originalImage${index + 1}`, img._id || img.public_id || "")
      })

      const response = await axios.put(
        `${backendUrl}/products/update/${productId}`,
        formData,
        { withCredentials: true }
      )

      if (response.data.success) {
        toast.success(response.data.message)
        // Clear localStorage and navigate back to list
        localStorage.removeItem('editProduct')
        navigate('/admin/list')
      } else {
        toast.error(response.data.message)
      }

    } catch (error) {
      console.log(error)
      toast.error(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const cancelEdit = () => {
    localStorage.removeItem('editProduct')
    navigate('/admin/list')
  }

  return (
    <form onSubmit={onSubmitHandler} className='flex flex-col w-full items-start gap-3'>
      <h2 className='text-xl font-bold mb-4'>Edit Product</h2>

      <div>
        <p className='mb-2'>Product Images</p>
        <div className='flex gap-2'>
          {originalImages.map((img, index) => (
            <div key={index} className='relative'>
              <img
                className='w-20 h-20 object-cover'
                src={img.url}
                alt={`Product image ${index + 1}`}
              />
            </div>
          ))}
        </div>

        <p className='mt-4 mb-2'>Upload New Images (optional)</p>
        <div className='flex gap-2'>
          <label htmlFor="image1">
            <img className='w-20 cursor-pointer' src={!image1 ? assets.upload_area : URL.createObjectURL(image1)} alt="" />
            <input onChange={(e) => setImage1(e.target.files[0])} type="file" id="image1" hidden />
          </label>
          <label htmlFor="image2">
            <img className='w-20 cursor-pointer' src={!image2 ? assets.upload_area : URL.createObjectURL(image2)} alt="" />
            <input onChange={(e) => setImage2(e.target.files[0])} type="file" id="image2" hidden />
          </label>
          <label htmlFor="image3">
            <img className='w-20 cursor-pointer' src={!image3 ? assets.upload_area : URL.createObjectURL(image3)} alt="" />
            <input onChange={(e) => setImage3(e.target.files[0])} type="file" id="image3" hidden />
          </label>
          <label htmlFor="image4">
            <img className='w-20 cursor-pointer' src={!image4 ? assets.upload_area : URL.createObjectURL(image4)} alt="" />
            <input onChange={(e) => setImage4(e.target.files[0])} type="file" id="image4" hidden />
          </label>
        </div>
      </div>

      <div className='w-full'>
        <p className='mb-2'>Product name</p>
        <input
          onChange={(e) => setName(e.target.value)}
          value={name}
          className='w-full max-w-[500px] px-3 py-2'
          type="text"
          placeholder='Type here'
          required
        />
      </div>

      <div className='w-full'>
        <p className='mb-2'>Product description</p>
        <textarea
          onChange={(e) => setDescription(e.target.value)}
          value={description}
          className='w-full max-w-[500px] px-3 py-2'
          type="text"
          placeholder='Write content here'
          required
        />
      </div>

      <div className='flex flex-col sm:flex-row gap-2 w-full sm:gap-8'>
        <div>
          <p className='mb-2'>Product category</p>
          <input
            onChange={(e) => setCategory(e.target.value)}
            value={category}
            className='w-full max-w-[500px] px-3 py-2'
            type="text"
            placeholder='Type here'
            required
          />
        </div>

        <div>
          <p className='mb-2'>Type</p>
          <select
            onChange={(e) => setType(e.target.value)}
            value={type}
            className='w-full px-3 py-2'
          >
            <option value="Food">Food</option>
            <option value="Toy">Toy</option>
            <option value="Accessories">Accessories</option>
          </select>
        </div>

        <div>
          <p className='mb-2'>Product Price</p>
          <input
            onChange={(e) => setPrice(e.target.value)}
            value={price}
            className='w-full px-3 py-2 sm:w-[120px]'
            type="Number"
            placeholder=''
          />
        </div>
      </div>

      <div className='flex gap-2 mt-2'>
        <input
          onChange={() => setBestseller(prev => !prev)}
          checked={bestseller}
          type="checkbox"
          id='bestseller'
        />
        <label className='cursor-pointer' htmlFor="bestseller">Add to bestseller</label>
      </div>

      <div className='flex gap-4'>
        <button
          type="submit"
          className='w-28 py-3 mt-4 bg-black text-white disabled:bg-gray-600'
          disabled={isSubmitting}
        >
          {isSubmitting ? "UPDATING..." : "UPDATE"}
        </button>

        <button
          type="button"
          onClick={cancelEdit}
          className='w-28 py-3 mt-4 bg-gray-300 text-black'
        >
          CANCEL
        </button>
      </div>
    </form>
  )
}

export default EditProduct
