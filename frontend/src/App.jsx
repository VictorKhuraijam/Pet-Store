import { ToastContainer } from "react-toastify"
import {NavBar, SearchBar} from './components/index.js'



export const App = () => {
  return (
    <div className="px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw]">
      <ToastContainer />
      <NavBar />
      <SearchBar />
    </div>
  )
}
