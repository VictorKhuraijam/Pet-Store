import axios from 'axios'
import  { useContext, useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import AuthContext from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

const List = () => {

  const {backendUrl, currency, setEditProduct} = useContext(AuthContext)

  const [list, setList] = useState([])
  const [isDeletingId, setIsDeletingId] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const navigate = useNavigate();

  const fetchList = async () => {
    try {

      const response = await axios.get(
        `${backendUrl}/products/list`,
        {withCredentials: true}
      )
      if (response.data.success) {
        setList(response.data.data.products.reverse());
        // console.log("List of products :", list)
      }
      else {
        toast.error(response.data.message)
      }

    } catch (error) {
      // console.log(error)
      toast.error(error.message)
    }
  }

  const handleDeleteClick = (product) => {
    setProductToDelete(product);
    setShowConfirmDialog(true);
  }

  const confirmDelete = async () => {
    if (!productToDelete) return

    const id = productToDelete._id
    setIsDeletingId(id)
    setShowConfirmDialog(false)

    try {

      const response = await axios.delete(
        `${backendUrl}/products/delete/${id}`,
        {withCredentials: true })

      if (response.data.success) {
        toast.success(response.data.message)
        await fetchList();
      } else {
        toast.error(response.data.message)
      }

    } catch (error) {
      // console.log(error)
      toast.error(error.message)
    } finally{
      setIsDeletingId(null)
      setProductToDelete(null)
    }
  }

  const cancelDelete = () => {
    setShowConfirmDialog(false);
    setProductToDelete(null);
  }

  const handleEdit = (product) => {
    setEditProduct(product);
    navigate(`/edit-product/${product._id}`)
  }

  // useEffect(() => {
  //   console.log("Updated product list:", list);
  // }, [list]);


  useEffect(() => {
    fetchList()
  }, [])

  return (
    <>

      <div className={`relative z-10 ${showConfirmDialog ? "opacity-30": ""}`}>
        <p className='mb-2'>All Products List</p>
        <div className='flex flex-col gap-2'>

          {/* ------- List Table Title ---------- */}
          <div className="hidden md:grid grid-cols-[1fr_3fr_1fr_1fr_1fr] items-center py-1 px-2 border bg-gray-100 text-sm">
            <b>Image</b>
            <b>Name</b>
            <b>Category</b>
            <b>Price</b>
            <b className="text-center">Action</b>
          </div>

          {/* ------ Product List ------ */}
          {list.map((item, index) => (
            <div
              className="grid grid-cols-[1fr_3fr_1fr] md:grid-cols-[1fr_3fr_1fr_1fr_1fr] items-center gap-2 py-1 px-2 border text-sm"
              key={index}
            >
              <div className="flex items-center">
                <img className="w-12 h-15 object-contain" src={item.images[0]?.url} alt="" />
              </div>
              <div className="overflow-hidden text-ellipsis whitespace-nowrap">{item.name}</div>
              <div>{item.category}</div>
              <div>
                {currency}{" "}
                {item.price}
              </div>
              <div className="flex flex-col mr-3  md:flex-row items-center justify-end gap-1">
                <button
                  onClick={() => handleEdit(item)}
                  className="w-full md:w-auto text-center cursor-pointer bg-blue-500 text-lg py-2 px-2 rounded-xl"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteClick(item)}
                  disabled={isDeletingId === item._id}
                  className="w-full md:w-auto text-center cursor-pointer text-lg bg-gray-300 py-2 px-2  rounded-xl"
                >
                  {item._id === isDeletingId ? '...' : 'X'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Confirm Deletion</h3>
            <p className="mb-6">
              Are you sure you want to delete &quot;{productToDelete?.name}&quot;? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default List
