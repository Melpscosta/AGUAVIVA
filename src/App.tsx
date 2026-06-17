import Navbar from './components/Navbar'
import Hero from './components/Hero'
import GamePlaceholder from './components/GamePlaceholder'
import ScrollIndicator from './components/ScrollIndicator'
import HowItWorks from './components/HowItWorks'
import Partnerships from './components/Partnerships'
import './App.css'

function App() {
  return (
    <div className="page">
      <Navbar />
      <main>
        <Hero />
        <GamePlaceholder />
        <ScrollIndicator />
        <HowItWorks />
        <Partnerships />
      </main>
    </div>
  )
}

export default App
