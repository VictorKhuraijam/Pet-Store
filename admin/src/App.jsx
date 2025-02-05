import { useEffect, useContext } from 'react'
import AuthContext from './context/AuthContext'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import Add from './pages/Add'
import { Routes, Route, useNavigate} from 'react-router-dom'
import List from './pages/List'
import Orders from './pages/Orders'
import Login from './components/Login'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';




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

  return (
    <div className='bg-gray-50 min-h-screen mx-auto'>
      <ToastContainer />
      {!isAuthenticated ? (
        <>
        <Routes>
          <Route path='/login' element={<Login />}/>
          {/* <Route path='*' element={<Navigate to='/login' replace />} /> */}
        </Routes>
        </>
      )
        : (
        <>
        <Navbar />
        <hr />
        <div className='flex w-full'>
          <Sidebar/>
          <div className='w-[70%] mx-auto ml-[max(5vw,25px)] my-8 text-gray-600 text-base'>
            <Routes>
              <Route path='/add' element={<Add  />} />
              <Route path='/list' element={<List  />} />
              <Route path='/orders' element={<Orders  />} />

              {/* <Route path='*' element={<Navigate to='/add' replace />} /> */}
            </Routes>
          </div>
        </div>
        </>
       )
      }
    </div>
  )
}

export default App
