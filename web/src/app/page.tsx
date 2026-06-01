import Navbar from '@/components/sections/Navbar'
import Hero from '@/components/sections/Hero'
import StatsBar from '@/components/sections/StatsBar'
import Problem from '@/components/sections/Problem'
import InstitutionalMemory from '@/components/sections/InstitutionalMemory'
import Solution from '@/components/sections/Solution'
import Features from '@/components/sections/Features'
import WhoWeServe from '@/components/sections/WhoWeServe'
import TrustedBy from '@/components/sections/TrustedBy'
import HowItWorks from '@/components/sections/HowItWorks'
import Demo from '@/components/sections/Demo'
import RequestDemo from '@/components/sections/RequestDemo'
import Footer from '@/components/sections/Footer'

export default function Home() {
  return (
    <main className="min-h-screen" style={{background:'#0A0A0F',color:'#F8FAFC'}}>
      <Navbar />
      <Hero />
      <StatsBar />
      <Problem />
      <InstitutionalMemory />
      <Solution />
      <Features />
      <WhoWeServe />
      <TrustedBy />
      <HowItWorks />
      <Demo />
      <RequestDemo />
      <Footer />
    </main>
  )
}
