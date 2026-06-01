'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ShieldCheck } from 'lucide-react'

function NetworkGMark() {
  return (
    <svg width="32" height="32" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="login-g" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="#4F46E5"/>
          <stop offset="100%" stopColor="#06B6D4"/>
        </linearGradient>
      </defs>
      <path d="M 21 26 C 12 38, 12 62, 24 80 C 32 88, 42 92, 52 92 C 62 92, 72 88, 80 80 C 88 72, 90 62, 90 50"
        stroke="url(#login-g)" strokeWidth="3.5" strokeLinecap="round" fill="none"/>
      <path d="M 21 26 C 28 16, 40 10, 52 10"
        stroke="url(#login-g)" strokeWidth="3.5" strokeLinecap="round" fill="none" opacity="0.5"/>
      <path d="M 90 50 L 52 50 L 76 50"
        stroke="url(#login-g)" strokeWidth="3.5" strokeLinecap="round" fill="none"/>
      <circle cx="21" cy="26" r="4"   fill="url(#login-g)"/>
      <circle cx="52" cy="92" r="4"   fill="url(#login-g)"/>
      <circle cx="90" cy="50" r="4.5" fill="url(#login-g)"/>
      <circle cx="52" cy="50" r="5"   fill="url(#login-g)"/>
      <circle cx="76" cy="50" r="3.5" fill="url(#login-g)"/>
    </svg>
  )
}
import { api, saveAuth } from '@/lib/api'

export default function LoginPage() {
  const router = useRouter()
  const [phone, setPhone] = useState('08001234567')
  const [password, setPassword] = useState('Admin123!')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { data } = await api.post('/auth/login', { phone, password })
      saveAuth(data.tokens, data.user.institutionId)
      router.push('/dashboard')
    } catch {
      setError('Invalid credentials. Use 08001234567 / Admin123! for the demo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex" style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #0f172a 60%, #0d4b45 100%)' }}>
      {/* Left side — brand story */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-16">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.1)' }}>
            <NetworkGMark />
          </div>
          <span className="font-black text-lg text-white">TrustGrid</span>
        </div>
        <div>
          <p className="text-5xl font-black text-white leading-tight mb-4">
            Trusted People.<br />
            <span style={{ background: 'linear-gradient(90deg,#818cf8,#67e8f9)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
              Accountable Service.
            </span>
          </p>
          <p className="text-white/50 text-lg leading-relaxed">
            The community workforce governance platform for estates, churches, schools, and smart cities.
          </p>
        </div>
        <p className="text-white/20 text-sm">© 2026 TrustGrid · trustgrid.ng</p>
      </div>

      {/* Right side — login form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
      <div className="w-full max-w-md">
        {/* Logo — mobile only */}
        <div className="text-center mb-8 lg:hidden">
          <div className="w-14 h-14 bg-blue-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">TrustGrid</h1>
          <p className="text-gray-500 text-sm mt-1">Governance Dashboard</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Sign in to your institution</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full text-white py-3.5 rounded-xl font-bold hover:opacity-90 transition-opacity disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg, #4F46E5 0%, #0D9488 100%)' }}
            >
              {loading ? 'Signing in...' : 'Sign In →'}
            </button>
          </form>

          <div className="mt-4 rounded-xl px-4 py-3 text-xs"
            style={{ background: 'rgba(79,70,229,0.06)', color: '#4F46E5' }}>
            <strong>Demo credentials:</strong> 08001234567 / Admin123!
          </div>
        </div>
      </div>
      </div>
    </div>
  )
}
