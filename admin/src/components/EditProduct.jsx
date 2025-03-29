import { useState, useContext, useEffect } from 'react'
import { assets } from '../assets/assets'
import axios from 'axios'
import { toast } from 'react-toastify'
import AuthContext from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { X } from 'lucide-react'

const EditProduct = () => {
  const { backendUrl, editProduct, setEditProduct } = useContext(AuthContext)
  const navigate = useNavigate()

  const [images, setImages] = useState([null, null, null, null])
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
    if (!editProduct) {
      // toast.error("No product selected for editing")
      navigate('/list')
      return
    }

    try {
      setProductId(editProduct._id)
      setName(editProduct.name)
      setDescription(editProduct.description)
      setPrice(editProduct.price.toString())
      setCategory(editProduct.category)
      setType(editProduct.type || "Food")
      setBestseller(editProduct.bestseller || false)

      if (editProduct.images && editProduct.images.length) {
        setOriginalImages(editProduct.images)
      }
    } catch (error) {
      console.error("Error parsing product data:", error)
      toast.error("Error loading product data")
      navigate('/list')
    }
  }, [navigate, editProduct])

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

      // Append new images if selected, keeping original if not replaced
      images.forEach((image, index) => {
        if (image) {
          formData.append(`image${index + 1}`, image)
        } else if (originalImages[index]) {
          formData.append(`originalImage${index + 1}`, originalImages[index].url)
        }
      })

      const response = await axios.post(
        `${backendUrl}/products/update/${productId}`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          withCredentials: true
        }
      )

      if (response.data.success) {
        toast.success(response.data.message)
        setEditProduct(null)
        navigate('/admin/list')
      } else {
        toast.error(response.data.message)
      }

    } catch (error) {
      console.error(error)
      toast.error(error.response?.data?.message || "Update failed")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleImageChange = (index, file) => {
    const newImages = [...images]
    newImages[index] = file
    setImages(newImages)
  }

  const handleImageDelete = (index) => {
    // Remove image from either new images or original images
    if (images[index]) {
      const newImages = [...images]
      newImages[index] = null
      setImages(newImages)
    } else if (originalImages[index]) {
      const newOriginalImages = [...originalImages]
      newOriginalImages.splice(index, 1)
      setOriginalImages(newOriginalImages)
    }
  }

  const cancelEdit = () => {
    setEditProduct(null)
    navigate('/list')
  }

  return (
    <form onSubmit={onSubmitHandler} className='flex flex-col w-full items-start gap-3'>
      <h2 className='text-xl font-bold mb-4'>Edit Product</h2>

      <div>
        <p className='mb-2'>Product Images</p>
        <div className='flex gap-2'>
        {[0, 1, 2, 3].map((index) => (
            <div key={index} className='relative'>
              <label htmlFor={`image${index + 1}`} className='relative'>
                <img
                  className='w-20 h-20 object-contain cursor-pointer'
                  src={
                    images[index]
                      ? URL.createObjectURL(images[index])
                      : (originalImages[index]?.url || assets.upload_area)
                  }
                  alt={`Product image ${index + 1}`}
                />
                <input
                  onChange={(e) => handleImageChange(index, e.target.files[0])}
                  type="file"
                  id={`image${index + 1}`}
                  hidden
                />
              </label>
              {(images[index] || originalImages[index]) && (
                <button
                  type="button"
                  onClick={() => handleImageDelete(index)}
                  className='absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 hover:bg-red-600'
                >
                  <X size={16} />
                </button>
              )}
            </div>
          ))}
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
          className='w-full max-w-[500px] px-3 py-2 h-[200px]'
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
          className='w-28 py-3 mt-4 bg-black rounded text-white disabled:bg-gray-600'
          disabled={isSubmitting}
        >
          {isSubmitting ? "UPDATING..." : "UPDATE"}
        </button>

        <button
          type="button"
          onClick={cancelEdit}
          className='w-28 py-3 mt-4 rounded bg-gray-300 text-black'
        >
          CANCEL
        </button>
      </div>
    </form>
  )
}

export default EditProduct
