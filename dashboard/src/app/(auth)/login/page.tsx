'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff } from 'lucide-react'
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
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const { effective, found, name } = useBrand()
  const communityName = name ?? effective.displayName ?? 'TrustGrid'
  const primaryColor  = effective.primaryColor ?? '#1e1b4b'
  const accentColor   = effective.accentColor  ?? '#0d4b45'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!identifier.trim() || !password) return
    setLoading(true)
    setError('')

    try {
      const { data } = await api.post('/auth/login', { identifier: identifier.trim(), password })
      if (!data?.tokens?.accessToken) throw new Error('No token received')
      saveAuth(data.tokens, data.user.institutionId)
      router.push('/dashboard')
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? err?.message ?? 'Login failed'
      setError(msg === 'No token received' ? 'Login failed — please try again.' : 'Invalid phone/email or password.')
      console.error('[login]', err?.response?.data ?? err)
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
            <p className="text-white/50 text-sm mt-1">{found ? 'Community Trust Network' : 'Community Trust Infrastructure'}</p>
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
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                <div className="flex justify-end mt-1">
                  <a href="/forgot-password" className="text-xs text-indigo-600 hover:underline font-medium">
                    Forgot password?
                  </a>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full text-white py-3.5 rounded-xl font-bold hover:opacity-90 transition-opacity disabled:opacity-70 flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg, #4F46E5 0%, #0D9488 100%)' }}
              >
                {loading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    Signing in…
                  </>
                ) : 'Sign In →'}
              </button>

              <div className="relative flex items-center gap-3 my-1">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-gray-400">or</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              <button
                type="button"
                onClick={() => alert('Google sign-in coming soon — use phone or email for now.')}
                className="w-full flex items-center justify-center gap-3 border border-gray-200 rounded-xl py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </button>
            </form>

            {process.env.NODE_ENV === 'development' && (
              <div className="mt-4 rounded-xl px-4 py-3 text-xs"
                style={{ background: 'rgba(79,70,229,0.06)', color: '#4F46E5' }}>
                <strong>Dev only:</strong> 08001234567 or emeka@redemptioncity.ng / Admin123!
              </div>
            )}
          </div>

          <p className="text-center text-white/40 text-sm mt-4">
            New to TrustGrid?{' '}
            <Link href="/register" className="text-white/70 font-semibold hover:text-white transition-colors">
              Create your community →
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
