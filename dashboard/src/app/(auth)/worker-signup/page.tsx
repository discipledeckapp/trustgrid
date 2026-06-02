'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, ChevronRight, ChevronLeft, User, Briefcase } from 'lucide-react'
import { useBrand } from '@/hooks/useBrand'
import { api, saveAuth } from '@/lib/api'

const SKILLS = [
  'Electrician', 'Plumber', 'Carpenter', 'Mason', 'Painter', 'Welder',
  'Lawyer', 'Accountant', 'Software Engineer', 'Architect', 'Civil Engineer',
  'Doctor', 'Nurse', 'Pharmacist',
  'Security Guard', 'Driver', 'Cleaner', 'Cook',
  'Event Manager', 'Photographer', 'Designer', 'Teacher',
]

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

export default function WorkerSignupPage() {
  const router = useRouter()
  const { effective, found, name } = useBrand()
  const communityName  = name ?? effective.displayName ?? 'TrustGrid'
  const primaryColor   = effective.primaryColor ?? '#1e1b4b'
  const accentColor    = effective.accentColor  ?? '#0d4b45'
  const bgImage        = effective.backgroundImageUrl
  const overlayOpacity = effective.backgroundOverlayOpacity ?? 0.65

  // Step tracking
  const [step, setStep] = useState<1 | 2>(1)

  // Step 1 fields
  const [firstName, setFirstName]     = useState('')
  const [lastName, setLastName]       = useState('')
  const [phone, setPhone]             = useState('')
  const [email, setEmail]             = useState('')
  const [password, setPassword]       = useState('')
  const [showPassword, setShowPassword] = useState(false)

  // Step 2 fields
  const [primarySkill, setPrimarySkill] = useState('')
  const [bio, setBio]                 = useState('')
  const [yearsExp, setYearsExp]       = useState('')
  const [hourlyRate, setHourlyRate]   = useState('')

  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const bgStyle = bgImage
    ? {
        backgroundImage: `url(${bgImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        position: 'relative' as const,
      }
    : { background: `linear-gradient(135deg, ${primaryColor} 0%, #0f172a 60%, ${accentColor} 100%)` }

  function handleStep1(e: React.FormEvent) {
    e.preventDefault()
    if (!firstName.trim() || !lastName.trim() || !phone.trim() || !password) return
    setError('')
    setStep(2)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!primarySkill) { setError('Please select your primary skill.'); return }
    setLoading(true)
    setError('')

    try {
      // Register via a temporary institution approach for hackathon
      const { data } = await api.post('/auth/register', {
        institution: {
          name: 'TrustGrid Global',
          type: 'CORPORATE',
          email: 'global@trustgrid.ng',
        },
        admin: {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          phone: phone.trim(),
          email: email.trim() || undefined,
          password,
          role: 'WORKER',
        },
      })

      if (data?.tokens?.accessToken) {
        saveAuth(data.tokens, data.user?.institutionId ?? '')
        // After login, create the worker profile
        try {
          await api.post('/workers/me/profile', {
            primarySkill,
            skills: [primarySkill],
            bio: bio.trim() || undefined,
            yearsExperience: yearsExp ? Number(yearsExp) : undefined,
            hourlyRate: hourlyRate ? Number(hourlyRate) : undefined,
          })
        } catch {
          // Profile creation is best-effort — redirect anyway
        }
        router.push('/profile')
      } else {
        throw new Error('Registration failed — no token received.')
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? err?.message ?? 'Registration failed'
      setError(Array.isArray(msg) ? msg.join(', ') : msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex" style={bgStyle}>
      {/* Dark overlay when background image is set */}
      {bgImage && (
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: `linear-gradient(135deg, ${primaryColor}cc 0%, rgba(15,23,42,${overlayOpacity}) 60%, ${accentColor}cc 100%)` }} />
      )}

      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-16 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.12)' }}>
            <NetworkGMarkWhite size={26} />
          </div>
          <span className="font-black text-lg text-white">TrustGrid</span>
        </div>
        <div>
          <p className="text-5xl font-black text-white leading-tight mb-2">
            Join as a Worker
          </p>
          <p className="text-2xl font-semibold mb-4"
            style={{ background: 'linear-gradient(90deg,#818cf8,#67e8f9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Your skills. Your reputation. Everywhere.
          </p>
          <p className="text-white/50 text-lg leading-relaxed">
            Build a portable trust identity that travels with you across every community, estate, and institution on TrustGrid.
          </p>
        </div>
        <p className="text-white/20 text-sm">© 2026 TrustGrid · trustgrid.ng</p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 relative z-10">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="text-center mb-8 lg:hidden">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)' }}>
              <NetworkGMarkWhite size={42} />
            </div>
            <h1 className="text-2xl font-bold text-white">Join TrustGrid as a Worker</h1>
            <p className="text-white/50 text-sm mt-1">Build your portable trust identity</p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
            {/* Step indicator */}
            <div className="flex items-center gap-2 mb-6">
              {[
                { num: 1, label: 'Account', icon: User },
                { num: 2, label: 'Profile', icon: Briefcase },
              ].map(({ num, label, icon: Icon }, idx) => (
                <div key={num} className="flex items-center gap-2 flex-1">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-black transition-colors ${
                    step >= num ? 'text-white' : 'bg-gray-100 text-gray-400'
                  }`} style={step >= num ? { background: 'linear-gradient(135deg,#4F46E5,#0D9488)' } : {}}>
                    {num}
                  </div>
                  <span className={`text-xs font-semibold transition-colors ${step >= num ? 'text-gray-900' : 'text-gray-400'}`}>{label}</span>
                  {idx === 0 && <div className={`flex-1 h-px mx-1 transition-colors ${step === 2 ? 'bg-indigo-300' : 'bg-gray-200'}`} />}
                </div>
              ))}
            </div>

            {/* Step 1 */}
            {step === 1 && (
              <form onSubmit={handleStep1} className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Create your account</h2>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">First name</label>
                    <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)}
                      placeholder="Emeka" required
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Last name</label>
                    <input type="text" value={lastName} onChange={e => setLastName(e.target.value)}
                      placeholder="Okafor" required
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone number</label>
                  <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                    placeholder="08012345678" required
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Email <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="emeka@email.com"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                  <div className="relative">
                    <input type={showPassword ? 'text' : 'password'} value={password}
                      onChange={e => setPassword(e.target.value)} required
                      placeholder="Min. 8 characters"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                    <button type="button" onClick={() => setShowPassword(v => !v)} tabIndex={-1}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1">
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">{error}</div>
                )}

                <button type="submit"
                  className="w-full text-white py-3.5 rounded-xl font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(135deg, #4F46E5 0%, #0D9488 100%)' }}>
                  Continue <ChevronRight className="w-4 h-4" />
                </button>
              </form>
            )}

            {/* Step 2 */}
            {step === 2 && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Your professional profile</h2>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Primary skill</label>
                  <select value={primarySkill} onChange={e => setPrimarySkill(e.target.value)} required
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
                    <option value="">Select your main skill…</option>
                    {SKILLS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Bio <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3}
                    placeholder="Briefly describe your experience and what you do best…"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Years experience</label>
                    <input type="number" value={yearsExp} onChange={e => setYearsExp(e.target.value)}
                      min="0" max="50" placeholder="5"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Daily rate (₦) <span className="text-gray-400 font-normal">optional</span>
                    </label>
                    <input type="number" value={hourlyRate} onChange={e => setHourlyRate(e.target.value)}
                      min="0" placeholder="15000"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">{error}</div>
                )}

                <div className="flex gap-3">
                  <button type="button" onClick={() => { setStep(1); setError('') }}
                    className="flex items-center gap-1.5 px-4 py-3.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
                    <ChevronLeft className="w-4 h-4" /> Back
                  </button>
                  <button type="submit" disabled={loading || !primarySkill}
                    className="flex-1 text-white py-3.5 rounded-xl font-bold hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2"
                    style={{ background: 'linear-gradient(135deg, #4F46E5 0%, #0D9488 100%)' }}>
                    {loading ? (
                      <>
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                        </svg>
                        Creating account…
                      </>
                    ) : 'Join TrustGrid →'}
                  </button>
                </div>
              </form>
            )}
          </div>

          <p className="text-center text-white/40 text-sm mt-4">
            Already have an account?{' '}
            <Link href="/login" className="text-white/70 font-semibold hover:text-white transition-colors">
              Sign in →
            </Link>
          </p>
          <p className="text-center text-white/30 text-xs mt-2">
            Joining via a community?{' '}
            <Link href="/join/worker" className="text-white/50 hover:text-white/70 transition-colors underline">
              Use your community join link instead
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
