import axios from "axios"
import { useContext, useState, useEffect } from "react"
import AuthContext from '../context/AuthContext'

const StoreStatus = () => {
  const {backendUrl} = useContext(AuthContext)

  const [store, setStore] = useState("false")

  useEffect(() => {

    const fetchStatus = async () => {
      try {
        const response = await axios.get(
          `${backendUrl}/users/store-status`,
          {withCredentials: true}
        )

        if(response.data.success){
          setStore(response.data.data.isOpen)
        }
      } catch (error) {
        console.error(error)
      }
    }
    fetchStatus()
  },[])

  const toggleStatus = async () => {
    try {
      const response = await axios.post(
        `${backendUrl}/users/admin/store-status`,
        {isOpen: !store},
        {withCredentials: true}
      )

      if(response.data.success){
        setStore(!store)
      }

    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div className="flex justify-between items-center gap-4 p-4 border-none rounded-lg shadow-md">
      <p className="text-sm md:text-xl lg:text-2xl font-semibold">Store is currently: {store ? "Open 🟢" : "Closed 🔴"}</p>
      <button
        onClick={toggleStatus}
        className={`px-4 py-2 rounded-lg ml-0 text-white ${
          store ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"
        }`}
      >
        {store ? "Close Store" : "Open Store"}
      </button>
    </div>
  )
}

export default StoreStatus
