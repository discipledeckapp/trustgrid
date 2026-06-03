'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff } from 'lucide-react'
import { api, saveAdminAuth } from '@/lib/api'

function NetworkGMark({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <defs>
        <linearGradient id="admin-login-g" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="#a5b4fc"/>
          <stop offset="100%" stopColor="#67e8f9"/>
        </linearGradient>
      </defs>
      <path d="M 21 26 C 12 38, 12 62, 24 80 C 32 88, 42 92, 52 92 C 62 92, 72 88, 80 80 C 88 72, 90 62, 90 50"
        stroke="url(#admin-login-g)" strokeWidth="5" strokeLinecap="round" fill="none"/>
      <path d="M 21 26 C 28 16, 40 10, 52 10"
        stroke="url(#admin-login-g)" strokeWidth="5" strokeLinecap="round" fill="none" opacity="0.5"/>
      <path d="M 90 50 L 52 50 L 76 50"
        stroke="url(#admin-login-g)" strokeWidth="5" strokeLinecap="round" fill="none"/>
      <circle cx="21" cy="26" r="5"   fill="url(#admin-login-g)"/>
      <circle cx="52" cy="92" r="5"   fill="url(#admin-login-g)"/>
      <circle cx="90" cy="50" r="5.5" fill="url(#admin-login-g)"/>
      <circle cx="52" cy="50" r="6"   fill="url(#admin-login-g)"/>
      <circle cx="76" cy="50" r="4.5" fill="url(#admin-login-g)"/>
    </svg>
  )
}

export default function AdminLoginPage() {
  const router = useRouter()
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const { data } = await api.post('/auth/login', { identifier, password })
      if (data.user.role !== 'PLATFORM_ADMIN') {
        throw new Error('Platform admin access required')
      }
      saveAdminAuth(data.tokens.accessToken)
      router.push('/dashboard')
    } catch {
      setError('Invalid credentials or account is not a platform admin.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6" style={{ background: '#020617' }}>
      <div className="w-full max-w-sm">

        {/* Logo block */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-indigo-950 rounded-2xl flex items-center justify-center mb-4 border border-indigo-900">
            <NetworkGMark size={48} />
          </div>
          <h1 className="text-white font-black text-2xl tracking-tight">TrustGrid</h1>
          <p className="text-indigo-400 text-xs font-semibold mt-1 tracking-widest uppercase font-mono">
            Platform Administration
          </p>
        </div>

        {/* Separator */}
        <div className="border-t border-slate-800 mb-8" />

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-slate-400 text-xs uppercase tracking-widest font-semibold mb-2">
              Email or Phone
            </label>
            <input
              type="text"
              value={identifier}
              onChange={e => setIdentifier(e.target.value)}
              placeholder="admin@trustgrid.ng"
              autoComplete="username"
              className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-4 py-3 focus:border-indigo-500 focus:outline-none placeholder:text-slate-600 text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-slate-400 text-xs uppercase tracking-widest font-semibold mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••••••"
                autoComplete="current-password"
                className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-4 py-3 pr-12 focus:border-indigo-500 focus:outline-none placeholder:text-slate-600 text-sm"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                tabIndex={-1}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors p-1"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <div className="flex justify-end mt-1.5">
              <a href="mailto:hello@trustgrid.ng" className="text-xs text-indigo-500 hover:text-indigo-400 transition-colors">
                Forgot password?
              </a>
            </div>
          </div>

          {error && (
            <p className="text-red-500 text-xs">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white font-bold py-3 rounded-lg transition-colors text-sm tracking-wide"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <p className="text-slate-700 text-xs text-center mt-10">
          Restricted access · Authorised personnel only
        </p>
      </div>
    </div>
  )
}
