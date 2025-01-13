import {BestSeller, Hero, LatestCollection, OurPolicy} from '../components/index'
import NewsLetterBox from '../components/NewsLetterBox'

function Home() {
  return (
    <div>
      <Hero />
      <LatestCollection />
      <BestSeller />
      <OurPolicy />
      <NewsLetterBox />
    </div>
  )
}

export default Home
