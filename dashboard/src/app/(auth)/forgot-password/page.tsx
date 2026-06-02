'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { Eye, EyeOff, ArrowLeft, CheckCircle } from 'lucide-react'

type Step = 'request' | 'verify' | 'success'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('request')
  const [identifier, setIdentifier] = useState('')
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')

  // Step 1: request OTP
  async function requestOtp(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      await api.post('/auth/forgot-password', { identifier: identifier.trim() })
      setInfo(`A reset code has been sent to ${identifier.trim()}.`)
      setStep('verify')
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Step 2+3: verify OTP + set new password
  async function resetPassword(e: React.FormEvent) {
    e.preventDefault()
    if (newPassword !== confirmPassword) { setError('Passwords do not match'); return }
    if (newPassword.length < 8) { setError('Password must be at least 8 characters'); return }
    setLoading(true); setError('')
    try {
      await api.post('/auth/reset-password', {
        identifier: identifier.trim(),
        otp: otp.trim(),
        newPassword,
      })
      setStep('success')
      setTimeout(() => router.push('/login'), 2500)
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Invalid or expired code. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Shared card wrapper
  const Card = ({ children }: { children: React.ReactNode }) => (
    <div className="min-h-screen flex items-center justify-center p-6"
      style={{ background: 'linear-gradient(135deg,#1e1b4b 0%,#0f172a 60%,#0d4b45 100%)' }}>
      <div className="w-full max-w-md">
        <Link href="/login" className="inline-flex items-center gap-1.5 text-white/50 hover:text-white text-sm mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to sign in
        </Link>
        <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
          {children}
        </div>
      </div>
    </div>
  )

  if (step === 'success') {
    return (
      <Card>
        <div className="text-center py-4">
          <CheckCircle className="w-14 h-14 text-emerald-500 mx-auto mb-4" />
          <h1 className="text-xl font-black text-gray-900 mb-2">Password updated</h1>
          <p className="text-gray-500 text-sm">Redirecting you to sign in…</p>
        </div>
      </Card>
    )
  }

  if (step === 'verify') {
    return (
      <Card>
        <h1 className="text-xl font-black text-gray-900 mb-1">Enter reset code</h1>
        <p className="text-gray-500 text-sm mb-6">{info}</p>
        <form onSubmit={resetPassword} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">6-digit code</label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]{6}"
              maxLength={6}
              value={otp}
              onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              className="w-full border border-gray-200 rounded-lg px-4 py-3 text-center text-2xl font-mono tracking-[0.4em] focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">New password</label>
            <div className="relative">
              <input
                type={showPwd ? 'text' : 'password'}
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="Minimum 8 characters"
                className="w-full border border-gray-200 rounded-lg px-4 py-3 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
              <button type="button" tabIndex={-1} onClick={() => setShowPwd(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1">
                {showPwd ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm new password</label>
            <input
              type={showPwd ? 'text' : 'password'}
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="Repeat password"
              className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
          {error && <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-4 py-3">{error}</p>}
          <button type="submit" disabled={loading || otp.length < 6}
            className="w-full text-white py-3.5 rounded-xl font-bold hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2"
            style={{ background: 'linear-gradient(135deg,#4F46E5,#0D9488)' }}>
            {loading ? (
              <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> Updating…</>
            ) : 'Set New Password'}
          </button>
          <button type="button" onClick={() => { setStep('request'); setOtp(''); setError('') }}
            className="w-full text-indigo-600 text-sm font-medium hover:underline py-1">
            Didn't receive a code? Try again
          </button>
        </form>
      </Card>
    )
  }

  return (
    <Card>
      <h1 className="text-xl font-black text-gray-900 mb-1">Reset your password</h1>
      <p className="text-gray-500 text-sm mb-6">
        Enter your phone number or email address and we'll send you a reset code.
      </p>
      <form onSubmit={requestOtp} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone or Email</label>
          <input
            type="text"
            value={identifier}
            onChange={e => setIdentifier(e.target.value)}
            placeholder="08001234567 or email@example.com"
            autoComplete="username"
            className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
            autoFocus
          />
        </div>
        {error && <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-4 py-3">{error}</p>}
        <button type="submit" disabled={loading}
          className="w-full text-white py-3.5 rounded-xl font-bold hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2"
          style={{ background: 'linear-gradient(135deg,#4F46E5,#0D9488)' }}>
          {loading ? (
            <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> Sending code…</>
          ) : 'Send Reset Code'}
        </button>
      </form>
    </Card>
  )
}
