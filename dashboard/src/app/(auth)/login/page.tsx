'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useBrand } from '@/hooks/useBrand'
import { api, saveAuth } from '@/lib/api'

// White version — for dark backgrounds (mobile header, left panel)
function NetworkGMarkWhite({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <path d="M 21 26 C 12 38, 12 62, 24 80 C 32 88, 42 92, 52 92 C 62 92, 72 88, 80 80 C 88 72, 90 62, 90 50"
        stroke="white" strokeWidth="5" strokeLinecap="round" fill="none"/>
      <path d="M 21 26 C 28 16, 40 10, 52 10"
        stroke="white" strokeWidth="5" strokeLinecap="round" fill="none" opacity="0.55"/>
      <path d="M 90 50 L 52 50 L 76 50"
        stroke="white" strokeWidth="5" strokeLinecap="round" fill="none"/>
      <circle cx="21" cy="26" r="5"   fill="white"/>
      <circle cx="52" cy="92" r="5"   fill="white"/>
      <circle cx="90" cy="50" r="5.5" fill="white"/>
      <circle cx="52" cy="50" r="6"   fill="white"/>
      <circle cx="76" cy="50" r="4.5" fill="white"/>
    </svg>
  )
}

// Gradient version — for light backgrounds (sidebar, etc.)
function NetworkGMark({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <defs>
        <linearGradient id="dash-login-g" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="#a5b4fc"/>
          <stop offset="100%" stopColor="#67e8f9"/>
        </linearGradient>
      </defs>
      <path d="M 21 26 C 12 38, 12 62, 24 80 C 32 88, 42 92, 52 92 C 62 92, 72 88, 80 80 C 88 72, 90 62, 90 50"
        stroke="url(#dash-login-g)" strokeWidth="5" strokeLinecap="round" fill="none"/>
      <path d="M 21 26 C 28 16, 40 10, 52 10"
        stroke="url(#dash-login-g)" strokeWidth="5" strokeLinecap="round" fill="none" opacity="0.5"/>
      <path d="M 90 50 L 52 50 L 76 50"
        stroke="url(#dash-login-g)" strokeWidth="5" strokeLinecap="round" fill="none"/>
      <circle cx="21" cy="26" r="5"   fill="url(#dash-login-g)"/>
      <circle cx="52" cy="92" r="5"   fill="url(#dash-login-g)"/>
      <circle cx="90" cy="50" r="5.5" fill="url(#dash-login-g)"/>
      <circle cx="52" cy="50" r="6"   fill="url(#dash-login-g)"/>
      <circle cx="76" cy="50" r="4.5" fill="url(#dash-login-g)"/>
    </svg>
  )
}

export default function LoginPage() {
  const router = useRouter()
  const [identifier, setIdentifier] = useState('08001234567')
  const [password, setPassword] = useState('Admin123!')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const { effective, found, name } = useBrand()
  const communityName = name ?? effective.displayName ?? 'TrustGrid'
  const primaryColor  = effective.primaryColor ?? '#1e1b4b'
  const accentColor   = effective.accentColor  ?? '#0d4b45'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { data } = await api.post('/auth/login', { identifier, password })
      saveAuth(data.tokens, data.user.institutionId)
      router.push('/dashboard')
    } catch {
      setError('Invalid credentials. Demo: 08001234567 / Admin123!')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex"
      style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, #0f172a 60%, ${accentColor} 100%)` }}
    >
      {/* Left side — community brand story */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-16">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.12)' }}>
            <NetworkGMarkWhite size={26} />
          </div>
          <span className="font-black text-lg text-white">TrustGrid</span>
        </div>
        <div>
          <p className="text-5xl font-black text-white leading-tight mb-2">
            {found ? communityName : 'TrustGrid'}
          </p>
          <p className="text-2xl font-semibold mb-4"
            style={{ background: 'linear-gradient(90deg,#818cf8,#67e8f9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Trusted People. Trusted Communities.
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
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)' }}>
              <NetworkGMarkWhite size={42} />
            </div>
            <h1 className="text-2xl font-bold text-white">{found ? communityName : 'TrustGrid'}</h1>
            <p className="text-white/50 text-sm mt-1">Governance Dashboard</p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              Sign in to {found ? communityName : 'your institution'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone or Email</label>
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="Phone number or email address"
                  autoComplete="username"
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
              <strong>Demo:</strong> 08001234567 or emeka@redemptioncity.ng / Admin123!
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
