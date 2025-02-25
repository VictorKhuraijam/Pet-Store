import { useEffect, useContext } from 'react'
import AuthContext from './context/AuthContext'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import Add from './pages/Add'
import { Routes, Route, useNavigate, Navigate, Outlet} from 'react-router-dom'
import List from './pages/List'
import Orders from './pages/Orders'
import Login from './components/Login'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import StoreStatus from './pages/StoreStatus'




const App = () => {
  const {isAuthenticated, checkAuthStatus, loading} = useContext(AuthContext)
  const navigate = useNavigate()

  useEffect(() => {
    if (loading) return;
    console.log("Is Authenticated:", isAuthenticated)
    if(!isAuthenticated){
      navigate('/login' )
    }
  },[isAuthenticated, navigate, loading])

  useEffect(()=>{
    checkAuthStatus()
  },[])

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className='bg-gray-50 min-h-screen mx-auto'>
      <ToastContainer />
      <Routes>
        <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/status" replace />} />

        <Route element={isAuthenticated ? (
          <>
            <Navbar />
            <hr />
            <div className='flex w-full'>
              <Sidebar />
              <div className='w-[70%] mx-auto ml-[max(5vw,25px)] my-8 text-gray-600 text-base'>
                <Outlet />
              </div>
            </div>
          </>
        ) : <Navigate to="/login" replace />}>

          <Route path="/status" element={<StoreStatus />} />
          <Route path="/add" element={<Add />} />
          <Route path="/list" element={<List />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/" element={<Navigate to="/add" replace />} />
        </Route>

        <Route path="*" element={<Navigate to={isAuthenticated ? "/status" : "/login"} replace />} />
      </Routes>

    </div>
  )
}

export default App
