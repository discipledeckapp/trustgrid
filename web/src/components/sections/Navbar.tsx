'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

function NetworkG({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <defs>
        <linearGradient id="nav-g" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#818CF8"/>
          <stop offset="100%" stopColor="#67E8F9"/>
        </linearGradient>
      </defs>
      <path d="M 21 26 C 12 38,12 62,24 80 C 32 88,42 92,52 92 C 62 92,72 88,80 80 C 88 72,90 62,90 50" stroke="url(#nav-g)" strokeWidth="3.5" strokeLinecap="round" fill="none"/>
      <path d="M 21 26 C 28 16,40 10,52 10" stroke="url(#nav-g)" strokeWidth="3.5" strokeLinecap="round" fill="none" opacity="0.5"/>
      <path d="M 90 50 L 52 50 L 76 50" stroke="url(#nav-g)" strokeWidth="3.5" strokeLinecap="round" fill="none"/>
      <circle cx="21" cy="26" r="4" fill="url(#nav-g)"/>
      <circle cx="52" cy="92" r="4" fill="url(#nav-g)"/>
      <circle cx="90" cy="50" r="4.5" fill="url(#nav-g)"/>
      <circle cx="52" cy="50" r="5" fill="url(#nav-g)"/>
      <circle cx="76" cy="50" r="3.5" fill="url(#nav-g)"/>
    </svg>
  )
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-[#0A0A0F]/90 backdrop-blur-xl border-b border-white/5' : 'bg-transparent'}`}>
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <NetworkG size={28} />
          <span className="font-black text-lg tracking-tight">
            <span className="text-white">Trust</span>
            <span className="text-gradient">Grid</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {[['#problem','Why TrustGrid'],['#features','Features'],['#who-we-serve','Who We Serve'],['#how-it-works','How It Works']].map(([href,label]) => (
            <a key={href} href={href} className="px-4 py-2 text-sm text-white/50 hover:text-white transition-colors rounded-lg hover:bg-white/5">{label}</a>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <a href="https://app.trustgrid.ng/login" className="text-sm text-white/50 hover:text-white transition-colors">Sign In</a>
          <a href="#request-demo" className="text-sm font-semibold px-4 py-2 rounded-xl text-white hover:opacity-90 transition-opacity" style={{background:'linear-gradient(135deg,#4F46E5,#0D9488)'}}>Request Demo</a>
        </div>

        <button onClick={() => setOpen(!open)} className="md:hidden text-white/60 hover:text-white">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={open ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
          </svg>
        </button>
      </div>

      {open && (
        <div className="md:hidden bg-[#0F0F1A]/95 backdrop-blur border-t border-white/5 px-6 py-4 space-y-1">
          {[['#problem','Why TrustGrid'],['#features','Features'],['#who-we-serve','Who We Serve'],['#how-it-works','How It Works']].map(([href,label]) => (
            <a key={href} href={href} onClick={() => setOpen(false)} className="block py-3 text-sm text-white/60 hover:text-white border-b border-white/5 last:border-0">{label}</a>
          ))}
          <div className="pt-3 space-y-2">
            <a href="https://app.trustgrid.ng/login" className="block text-center py-2.5 text-sm border border-white/10 rounded-xl text-white/60">Sign In</a>
            <a href="#request-demo" onClick={() => setOpen(false)} className="block text-center py-2.5 text-sm font-semibold rounded-xl text-white" style={{background:'linear-gradient(135deg,#4F46E5,#0D9488)'}}>Request Demo</a>
          </div>
        </div>
      )}
    </nav>
  )
}
