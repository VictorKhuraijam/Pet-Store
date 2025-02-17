import { useDispatch } from 'react-redux'
import {BestSeller, Hero, LatestCollection, OurPolicy} from '../components/index'
import { useEffect } from 'react'
import { fetchProducts } from '../store/shopSlice'

function Home() {
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(fetchProducts())
  },[dispatch])

  return (
    <div>
      <Hero />
      <LatestCollection />
      <BestSeller />
      <OurPolicy />

    </div>
  )
}

export default Home
