import Navbar from './components/Navbar'
import Hero from './components/Hero'
import ScrollIndicator from './components/ScrollIndicator'
import HowItWorksSection from './components/HowItWorksSection'
import Partnerships from './components/Partnerships'

export default function Home() {
  return (
    <div className="page">
      <Navbar />
      <main>
        <Hero />
        <ScrollIndicator />
        <HowItWorksSection />
        <Partnerships />
      </main>
    </div>
  )
}
