'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, ArrowLeft, ArrowRight, CheckCircle, Building2 } from 'lucide-react'
import { api, saveAuth } from '@/lib/api'

const INSTITUTION_TYPES = [
  { value: 'CHURCH',              label: 'Church / Religious Network' },
  { value: 'ESTATE',             label: 'Residential Estate' },
  { value: 'SCHOOL',             label: 'School' },
  { value: 'UNIVERSITY',         label: 'University' },
  { value: 'CONVENTION_ORGANIZER', label: 'Convention / Events Organizer' },
  { value: 'FACILITY_MANAGER',   label: 'Facility Management Company' },
  { value: 'SMART_CITY_OPERATOR', label: 'Smart City Operator' },
  { value: 'LOCAL_GOVERNMENT',   label: 'Local Government' },
  { value: 'CORPORATE',          label: 'Corporate Organisation' },
  { value: 'NGO',                label: 'NGO / Community-Based Org' },
]

type Step = 1 | 2 | 3

export default function RegisterPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPwd, setShowPwd] = useState(false)

  // Step 1 — Institution
  const [institutionName, setInstitutionName] = useState('')
  const [institutionType, setInstitutionType] = useState('')
  const [institutionEmail, setInstitutionEmail] = useState('')

  // Step 2 — Admin account
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const [adminEmail, setAdminEmail] = useState('')
  const [password, setPassword] = useState('')

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const { data } = await api.post('/auth/register', {
        institution: {
          name: institutionName.trim(),
          type: institutionType,
          email: institutionEmail.trim().toLowerCase(),
        },
        admin: {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          phone: phone.trim(),
          email: adminEmail.trim().toLowerCase() || undefined,
          password,
        },
      })
      saveAuth(data.tokens, data.user.institutionId)
      router.push('/dashboard')
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Registration failed. Please try again.')
      setStep(1)
    } finally {
      setLoading(false)
    }
  }

  const bgStyle = { background: 'linear-gradient(135deg, #1e1b4b 0%, #0f172a 60%, #0d4b45 100%)' }

  const Card = ({ children }: { children: React.ReactNode }) => (
    <div className="min-h-screen flex items-center justify-center p-6" style={bgStyle}>
      <div className="w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <Link href="/login" className="inline-flex items-center gap-1.5 text-white/50 hover:text-white text-sm transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to sign in
          </Link>
          <span className="text-white/30 text-xs">Step {step} of 3</span>
        </div>
        {/* Step progress */}
        <div className="flex gap-1.5 mb-6">
          {[1, 2, 3].map(s => (
            <div key={s} className="h-1 flex-1 rounded-full transition-all"
              style={{ background: s <= step ? 'linear-gradient(90deg,#818cf8,#67e8f9)' : 'rgba(255,255,255,0.1)' }} />
          ))}
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
          {children}
        </div>
      </div>
    </div>
  )

  // Step 3 — Review & submit
  if (step === 3) {
    return (
      <Card>
        <h1 className="text-xl font-black text-gray-900 mb-1">Review & create account</h1>
        <p className="text-gray-500 text-sm mb-6">Confirm your details before we set up your community.</p>

        <div className="space-y-3 mb-6">
          {[
            { label: 'Community name', value: institutionName },
            { label: 'Type', value: INSTITUTION_TYPES.find(t => t.value === institutionType)?.label },
            { label: 'Community email', value: institutionEmail },
            { label: 'Admin name', value: `${firstName} ${lastName}` },
            { label: 'Admin phone', value: phone },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
              <span className="text-sm text-gray-500">{label}</span>
              <span className="text-sm font-semibold text-gray-900">{value}</span>
            </div>
          ))}
        </div>

        {error && <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-4">{error}</p>}

        <button onClick={handleRegister} disabled={loading}
          className="w-full text-white py-3.5 rounded-xl font-bold hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2"
          style={{ background: 'linear-gradient(135deg,#4F46E5,#0D9488)' }}>
          {loading ? (
            <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Creating your community…</>
          ) : <><CheckCircle className="w-4 h-4" /> Create Community</>}
        </button>
        <button onClick={() => setStep(2)} className="w-full text-gray-500 text-sm py-2 mt-2 hover:text-gray-700">
          ← Edit details
        </button>
      </Card>
    )
  }

  // Step 2 — Admin account
  if (step === 2) {
    return (
      <Card>
        <h1 className="text-xl font-black text-gray-900 mb-1">Your admin account</h1>
        <p className="text-gray-500 text-sm mb-6">This will be the primary administrator for {institutionName}.</p>
        <form onSubmit={e => { e.preventDefault(); setError(''); setStep(3) }} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">First name</label>
              <input value={firstName} onChange={e => setFirstName(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Last name</label>
              <input value={lastName} onChange={e => setLastName(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone number</label>
            <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
              placeholder="08001234567"
              className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address <span className="text-gray-400 font-normal">(optional)</span></label>
            <input type="email" value={adminEmail} onChange={e => setAdminEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
            <div className="relative">
              <input type={showPwd ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                placeholder="Minimum 8 characters"
                className="w-full border border-gray-200 rounded-lg px-4 py-3 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" required minLength={8} />
              <button type="button" tabIndex={-1} onClick={() => setShowPwd(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1">
                {showPwd ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
          <button type="submit"
            className="w-full text-white py-3.5 rounded-xl font-bold hover:opacity-90 flex items-center justify-center gap-2"
            style={{ background: 'linear-gradient(135deg,#4F46E5,#0D9488)' }}>
            Review details <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </Card>
    )
  }

  // Step 1 — Institution
  return (
    <Card>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center">
          <Building2 className="w-5 h-5 text-indigo-600" />
        </div>
        <div>
          <h1 className="text-xl font-black text-gray-900">Create your community</h1>
          <p className="text-gray-500 text-xs">Get started with TrustGrid in minutes</p>
        </div>
      </div>
      <form onSubmit={e => { e.preventDefault(); setError(''); setStep(2) }} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Community name</label>
          <input value={institutionName} onChange={e => setInstitutionName(e.target.value)}
            placeholder="e.g. Lekki Phase 1 Estate"
            className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Community type</label>
          <select value={institutionType} onChange={e => setInstitutionType(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white" required>
            <option value="">Select a type…</option>
            {INSTITUTION_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Official email</label>
          <input type="email" value={institutionEmail} onChange={e => setInstitutionEmail(e.target.value)}
            placeholder="admin@yourcommunity.org"
            className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
        </div>
        <button type="submit"
          className="w-full text-white py-3.5 rounded-xl font-bold hover:opacity-90 flex items-center justify-center gap-2"
          style={{ background: 'linear-gradient(135deg,#4F46E5,#0D9488)' }}>
          Continue <ArrowRight className="w-4 h-4" />
        </button>
        <p className="text-center text-xs text-gray-400">
          Already have an account?{' '}
          <Link href="/login" className="text-indigo-600 font-semibold hover:underline">Sign in</Link>
        </p>
      </form>
    </Card>
  )
}
