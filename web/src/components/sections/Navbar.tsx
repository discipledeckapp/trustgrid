'use client'
import { useState } from 'react'
import Link from 'next/link'

export default function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/95 backdrop-blur border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-brand-700 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <span className="font-bold text-xl text-gray-900">TrustGrid</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <a href="#problem" className="text-gray-600 hover:text-gray-900 text-sm">Problem</a>
          <a href="#solution" className="text-gray-600 hover:text-gray-900 text-sm">Solution</a>
          <a href="#features" className="text-gray-600 hover:text-gray-900 text-sm">Features</a>
          <a href="#who-we-serve" className="text-gray-600 hover:text-gray-900 text-sm">Who We Serve</a>
        </div>

        <div className="hidden md:flex items-center gap-3">
          <a
            href="https://app.trustgrid.ng"
            className="text-sm text-gray-600 hover:text-gray-900 font-medium"
          >
            Sign In
          </a>
          <a
            href="#request-demo"
            className="text-sm bg-brand-700 text-white px-4 py-2 rounded-lg hover:bg-brand-800 font-medium transition-colors"
          >
            Request Demo
          </a>
        </div>

        <button className="md:hidden" onClick={() => setOpen(!open)}>
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={open ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
          </svg>
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-gray-100 bg-white px-6 py-4 flex flex-col gap-4">
          <a href="#problem" className="text-gray-600 text-sm" onClick={() => setOpen(false)}>Problem</a>
          <a href="#solution" className="text-gray-600 text-sm" onClick={() => setOpen(false)}>Solution</a>
          <a href="#features" className="text-gray-600 text-sm" onClick={() => setOpen(false)}>Features</a>
          <a href="#who-we-serve" className="text-gray-600 text-sm" onClick={() => setOpen(false)}>Who We Serve</a>
          <a href="#request-demo" className="bg-brand-700 text-white px-4 py-2 rounded-lg text-sm text-center font-medium" onClick={() => setOpen(false)}>
            Request Demo
          </a>
        </div>
      )}
    </nav>
  )
}
