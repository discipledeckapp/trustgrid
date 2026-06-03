'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

function NetworkG({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <defs>
        <linearGradient id="nav-g" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4F46E5"/>
          <stop offset="100%" stopColor="#0D9488"/>
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

function SunIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <circle cx="12" cy="12" r="5"/>
      <path strokeLinecap="round" d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
    </svg>
  )
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [dark, setDark] = useState(false)

  useEffect(() => {
    // Read saved preference
    const saved = localStorage.getItem('tg-theme')
    setDark(saved === 'dark' || document.documentElement.classList.contains('dark'))

    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  function toggleTheme() {
    const next = !dark
    setDark(next)
    if (next) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('tg-theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('tg-theme', 'light')
    }
  }

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled
        ? 'bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl border-b border-slate-200 dark:border-white/5 shadow-sm'
        : 'bg-white/80 dark:bg-transparent backdrop-blur-md'
    }`}>
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <NetworkG size={28} />
          <span className="font-black text-lg tracking-tight">
            <span className="text-slate-900 dark:text-white">Trust</span>
            <span className="text-gradient">Grid</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {[['#problem','Why TrustGrid'],['#features','Features'],['#who-we-serve','Who We Serve'],['#how-it-works','How It Works']].map(([href,label]) => (
            <a key={href} href={href} className="px-4 py-2 text-sm text-slate-500 dark:text-white/50 hover:text-slate-900 dark:hover:text-white transition-colors rounded-lg hover:bg-slate-50 dark:hover:bg-white/5">{label}</a>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-slate-400 dark:text-white/40 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-all"
            aria-label="Toggle dark mode"
          >
            {dark ? <SunIcon /> : <MoonIcon />}
          </button>
          <a href="https://app.trustgrid.ng/login" className="text-sm text-slate-500 dark:text-white/50 hover:text-slate-900 dark:hover:text-white transition-colors font-medium">Sign In</a>
          <a href="https://app.trustgrid.ng/register" className="text-sm font-semibold px-4 py-2 rounded-xl text-white hover:opacity-90 transition-opacity" style={{background:'linear-gradient(135deg,#4F46E5,#0D9488)'}}>Get Started</a>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <button onClick={toggleTheme} className="p-2 rounded-lg text-slate-400 dark:text-white/40 hover:bg-slate-100 dark:hover:bg-white/10 transition-all" aria-label="Toggle dark mode">
            {dark ? <SunIcon /> : <MoonIcon />}
          </button>
          <button onClick={() => setOpen(!open)} className="text-slate-500 dark:text-white/60 hover:text-slate-900 dark:hover:text-white">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={open ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-white/5 px-6 py-4 space-y-1 shadow-lg">
          {[['#problem','Why TrustGrid'],['#features','Features'],['#who-we-serve','Who We Serve'],['#how-it-works','How It Works']].map(([href,label]) => (
            <a key={href} href={href} onClick={() => setOpen(false)} className="block py-3 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border-b border-slate-100 dark:border-white/5 last:border-0">{label}</a>
          ))}
          <div className="pt-3 space-y-2">
            <a href="https://app.trustgrid.ng/login" className="block text-center py-2.5 text-sm border border-slate-200 dark:border-white/10 rounded-xl text-slate-700 dark:text-white/60 hover:bg-slate-50 dark:hover:bg-white/5">Sign In</a>
            <a href="https://app.trustgrid.ng/register" onClick={() => setOpen(false)} className="block text-center py-2.5 text-sm font-semibold rounded-xl text-white" style={{background:'linear-gradient(135deg,#4F46E5,#0D9488)'}}>Get Started — It&apos;s Free</a>
            <a href="https://app.trustgrid.ng/worker-signup" onClick={() => setOpen(false)} className="block text-center py-2 text-xs text-slate-400 dark:text-white/30 hover:text-slate-600 dark:hover:text-white/50">Joining as a worker? Sign up here →</a>
          </div>
        </div>
      )}
    </nav>
  )
}
