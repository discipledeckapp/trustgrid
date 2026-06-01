'use client'
import { Suspense } from 'react'
import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { CheckCircle, Building2, Briefcase, FileCheck, Users2, ChevronRight, Plus, Trash2 } from 'lucide-react'
import { api } from '@/lib/api'
import { cn } from '@/lib/utils'

const STEPS = [
  { id: 1, label: 'Company Info',  icon: Building2,  desc: 'Basic details' },
  { id: 2, label: 'Services',      icon: Briefcase,  desc: 'What you offer' },
  { id: 3, label: 'Documents',     icon: FileCheck,  desc: 'Company documents' },
  { id: 4, label: 'Team Setup',    icon: Users2,     desc: 'Branches & team' },
]

const ORG_TYPES = ['SOLE_PROPRIETOR', 'LIMITED_LIABILITY', 'PARTNERSHIP', 'NGO', 'COOPERATIVE', 'STAFFING_AGENCY', 'FACILITIES_COMPANY', 'SECURITY_COMPANY', 'CLEANING_COMPANY']
const SERVICE_CATEGORIES = ['Electrical', 'Plumbing', 'Security', 'Cleaning', 'Catering', 'IT Services', 'Transport', 'Landscaping', 'Construction', 'Event Staffing', 'Facility Management', 'Medical Services']
const ZONES = ['Lekki', 'Victoria Island', 'Ikoyi', 'Redemption City', 'Ajah', 'Ikeja', 'Surulere', 'Mainland', 'Island', 'Abuja', 'Port Harcourt', 'Nationwide']
const DOC_TYPES = ['CAC Certificate of Incorporation', 'Tax Clearance Certificate', 'Proof of Address', 'Director\'s ID (NIN/Passport)', 'Company Seal Document']

function OrgOnboardingInner() {
  const searchParams = useSearchParams()
  const institutionId = searchParams.get('i') ?? 'cmpu5x0p80000nvfshpwx2avg'

  const [step, setStep]           = useState(1)
  const [applicationId, setApplicationId] = useState<string | null>(null)
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState('')
  const [done, setDone]           = useState(false)

  const [s1, setS1] = useState({ contactName: '', phone: '', email: '', organisationName: '', organisationType: '', rcNumber: '' })
  const [s2, setS2] = useState({ serviceCategories: [] as string[], serviceZoneIds: [] as string[], description: '' })
  const [s3, setS3] = useState({ documents: [] as string[] })
  const [s4, setS4] = useState({
    branches: [{ name: '', address: '', city: '', managerName: '', managerPhone: '' }],
  })

  async function submitStep(stepNum: number) {
    setLoading(true); setError('')
    try {
      if (stepNum === 1) {
        const { data } = await api.post(`/onboarding/organisation/start?institutionId=${institutionId}`, {
          contactName: s1.contactName, phone: s1.phone, email: s1.email || undefined,
          organisationName: s1.organisationName, organisationType: s1.organisationType, rcNumber: s1.rcNumber || undefined,
        })
        setApplicationId(data.applicationId)
        setStep(2)
      } else if (stepNum === 2 && applicationId) {
        await api.post(`/onboarding/organisation/services?institutionId=${institutionId}`, {
          applicationId, serviceCategories: s2.serviceCategories,
          serviceZoneIds: s2.serviceZoneIds, description: s2.description || undefined,
        })
        setStep(3)
      } else if (stepNum === 3 && applicationId) {
        await api.post(`/onboarding/organisation/documents?institutionId=${institutionId}`, {
          applicationId, documents: s3.documents.map(d => ({ type: 'COMPANY_DOC', name: d })),
        })
        setStep(4)
      } else if (stepNum === 4 && applicationId) {
        await api.post(`/onboarding/organisation/team?institutionId=${institutionId}`, {
          applicationId,
          branches: s4.branches.filter(b => b.name).map(b => ({
            name: b.name, address: b.address, city: b.city || undefined,
            managerName: b.managerName || undefined, managerPhone: b.managerPhone || undefined,
          })),
        })
        setDone(true)
      }
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <div className="text-center py-10">
        <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-emerald-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-3">Organisation Submitted!</h2>
        <p className="text-gray-500 mb-8">Our team will review your organisation registration within 48 hours. You will be notified once approved.</p>
        <div className="bg-purple-50 rounded-xl px-6 py-4 text-sm text-purple-700 inline-block">
          Application ID: <strong className="font-mono">{applicationId}</strong>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Register Your Organisation</h1>
        <p className="text-gray-500">Get your company listed as a trusted service provider in 4 steps.</p>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-0 mb-8">
        {STEPS.map((s, idx) => {
          const Icon = s.icon
          const isActive = step === s.id
          const isDone   = step > s.id
          return (
            <div key={s.id} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-1">
                <div className={cn('w-9 h-9 rounded-full flex items-center justify-center transition-all',
                  isDone ? 'bg-purple-700 text-white' : isActive ? 'bg-purple-700 text-white ring-4 ring-purple-200' : 'bg-gray-100 text-gray-400')}>
                  {isDone ? <CheckCircle className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                </div>
                <span className={cn('text-xs font-medium hidden sm:block', isActive ? 'text-purple-700' : 'text-gray-400')}>
                  {s.label}
                </span>
              </div>
              {idx < STEPS.length - 1 && (
                <div className={cn('flex-1 h-0.5 mx-1 mb-5', step > s.id ? 'bg-purple-700' : 'bg-gray-200')} />
              )}
            </div>
          )
        })}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
        {/* Step 1 */}
        {step === 1 && (
          <StepShell title="Company Information" subtitle="Tell us about your organisation.">
            <Field label="Organisation Name *">
              <input value={s1.organisationName} onChange={e => setS1({...s1, organisationName: e.target.value})}
                placeholder="e.g. Emeka Electrical Services Ltd" className={inputCls} />
            </Field>
            <Field label="Organisation Type *">
              <select value={s1.organisationType} onChange={e => setS1({...s1, organisationType: e.target.value})} className={inputCls}>
                <option value="">Select type...</option>
                {ORG_TYPES.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
              </select>
            </Field>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="RC Number (optional)">
                <input value={s1.rcNumber} onChange={e => setS1({...s1, rcNumber: e.target.value})}
                  placeholder="RC1234567" className={inputCls} />
              </Field>
              <Field label="Contact Person Name *">
                <input value={s1.contactName} onChange={e => setS1({...s1, contactName: e.target.value})}
                  placeholder="Your full name" className={inputCls} />
              </Field>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Phone Number *">
                <input type="tel" value={s1.phone} onChange={e => setS1({...s1, phone: e.target.value})}
                  placeholder="+2348012345678" className={inputCls} />
              </Field>
              <Field label="Email (optional)">
                <input type="email" value={s1.email} onChange={e => setS1({...s1, email: e.target.value})}
                  placeholder="info@company.ng" className={inputCls} />
              </Field>
            </div>
            <StepFooter loading={loading} error={error}
              onNext={() => {
                if (!s1.organisationName || !s1.organisationType || !s1.contactName || !s1.phone) {
                  setError('Please fill in all required fields'); return
                }
                submitStep(1)
              }}
              accentColor="purple" />
          </StepShell>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <StepShell title="Your Services" subtitle="What services does your company provide?">
            <Field label="Service Categories *">
              <div className="flex flex-wrap gap-2">
                {SERVICE_CATEGORIES.map(cat => (
                  <button key={cat} type="button"
                    onClick={() => setS2(prev => ({
                      ...prev,
                      serviceCategories: prev.serviceCategories.includes(cat)
                        ? prev.serviceCategories.filter(c => c !== cat)
                        : [...prev.serviceCategories, cat],
                    }))}
                    className={cn('px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors',
                      s2.serviceCategories.includes(cat) ? 'bg-purple-700 text-white border-purple-700' : 'bg-white text-gray-600 border-gray-200 hover:border-purple-300')}>
                    {cat}
                  </button>
                ))}
              </div>
            </Field>
            <Field label="Coverage Zones">
              <div className="flex flex-wrap gap-2">
                {ZONES.map(zone => (
                  <button key={zone} type="button"
                    onClick={() => setS2(prev => ({
                      ...prev,
                      serviceZoneIds: prev.serviceZoneIds.includes(zone)
                        ? prev.serviceZoneIds.filter(z => z !== zone)
                        : [...prev.serviceZoneIds, zone],
                    }))}
                    className={cn('px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors',
                      s2.serviceZoneIds.includes(zone) ? 'bg-purple-700 text-white border-purple-700' : 'bg-white text-gray-600 border-gray-200 hover:border-purple-300')}>
                    {zone}
                  </button>
                ))}
              </div>
            </Field>
            <Field label="Company Description (optional)">
              <textarea value={s2.description} onChange={e => setS2({...s2, description: e.target.value})} rows={3}
                placeholder="Tell institutions about your company, experience, and what makes you stand out..."
                className={`${inputCls} resize-none`} />
            </Field>
            <StepFooter loading={loading} error={error} onBack={() => setStep(1)}
              onNext={() => { if (!s2.serviceCategories.length) { setError('Select at least one service category'); return } submitStep(2) }}
              accentColor="purple" />
          </StepShell>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <StepShell title="Company Documents" subtitle="Verified documents build trust with institutions.">
            <div className="bg-purple-50 border border-purple-100 rounded-xl px-5 py-4 text-sm text-purple-700 mb-4">
              Select the documents you have available. You can upload actual files through the full mobile app.
            </div>
            <div className="space-y-2">
              {DOC_TYPES.map(doc => (
                <button key={doc} type="button"
                  onClick={() => setS3(prev => ({
                    documents: prev.documents.includes(doc)
                      ? prev.documents.filter(d => d !== doc)
                      : [...prev.documents, doc],
                  }))}
                  className={cn('w-full flex items-center justify-between px-4 py-3.5 rounded-xl border text-sm transition-all text-left',
                    s3.documents.includes(doc) ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-white border-gray-200 text-gray-700 hover:border-purple-200')}>
                  <span className="font-medium">{doc}</span>
                  <span>{s3.documents.includes(doc) ? '✓' : '+'}</span>
                </button>
              ))}
            </div>
            <StepFooter loading={loading} error={error} onBack={() => setStep(2)}
              onNext={() => submitStep(3)}
              nextLabel={s3.documents.length === 0 ? 'Skip for now' : 'Continue'}
              accentColor="purple" />
          </StepShell>
        )}

        {/* Step 4 */}
        {step === 4 && (
          <StepShell title="Set Up Your Team" subtitle="Add branches where your company operates. You can add more later.">
            <div className="space-y-4">
              {s4.branches.map((branch, idx) => (
                <div key={idx} className="border border-gray-200 rounded-xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-700">
                      {idx === 0 ? 'Main Branch / Head Office' : `Branch ${idx + 1}`}
                    </span>
                    {idx > 0 && (
                      <button type="button" onClick={() => setS4(prev => ({ branches: prev.branches.filter((_, i) => i !== idx) }))}
                        className="text-red-400 hover:text-red-600 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <Field label={idx === 0 ? 'Branch Name *' : 'Branch Name'}>
                      <input value={branch.name}
                        onChange={e => setS4(prev => ({ branches: prev.branches.map((b, i) => i === idx ? {...b, name: e.target.value} : b) }))}
                        placeholder={idx === 0 ? 'Head Office' : 'Branch name'} className={inputCls} />
                    </Field>
                    <Field label="City">
                      <input value={branch.city}
                        onChange={e => setS4(prev => ({ branches: prev.branches.map((b, i) => i === idx ? {...b, city: e.target.value} : b) }))}
                        placeholder="Lagos" className={inputCls} />
                    </Field>
                  </div>
                  <Field label="Address">
                    <input value={branch.address}
                      onChange={e => setS4(prev => ({ branches: prev.branches.map((b, i) => i === idx ? {...b, address: e.target.value} : b) }))}
                      placeholder="Street address" className={inputCls} />
                  </Field>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <Field label="Branch Manager Name">
                      <input value={branch.managerName}
                        onChange={e => setS4(prev => ({ branches: prev.branches.map((b, i) => i === idx ? {...b, managerName: e.target.value} : b) }))}
                        placeholder="Manager full name" className={inputCls} />
                    </Field>
                    <Field label="Manager Phone">
                      <input value={branch.managerPhone}
                        onChange={e => setS4(prev => ({ branches: prev.branches.map((b, i) => i === idx ? {...b, managerPhone: e.target.value} : b) }))}
                        placeholder="+234..." className={inputCls} />
                    </Field>
                  </div>
                </div>
              ))}
              <button type="button"
                onClick={() => setS4(prev => ({ branches: [...prev.branches, { name: '', address: '', city: '', managerName: '', managerPhone: '' }] }))}
                className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-purple-200 rounded-xl text-sm text-purple-600 hover:border-purple-400 hover:bg-purple-50 transition-colors">
                <Plus className="w-4 h-4" /> Add Another Branch
              </button>
            </div>
            <div className="bg-amber-50 border border-amber-100 rounded-xl px-5 py-4 text-sm text-amber-700 mt-4">
              After approval, you can add workers to your organisation through the dashboard.
            </div>
            <StepFooter loading={loading} error={error} onBack={() => setStep(3)}
              onNext={() => submitStep(4)} nextLabel="Submit Organisation" isSubmit
              accentColor="purple" />
          </StepShell>
        )}
      </div>
    </div>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function StepShell({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return <div className="space-y-5"><div><h2 className="text-xl font-bold text-gray-900">{title}</h2><p className="text-gray-500 text-sm mt-1">{subtitle}</p></div>{children}</div>
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>{children}</div>
}

function StepFooter({ loading, error, onNext, onBack, nextLabel = 'Continue', isSubmit = false, accentColor = 'blue' }: any) {
  const btnClass = accentColor === 'purple'
    ? (isSubmit ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-purple-700 hover:bg-purple-800')
    : (isSubmit ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-blue-700 hover:bg-blue-800')
  return (
    <div>
      {error && <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-600 mb-4">{error}</div>}
      <div className="flex gap-3 pt-2">
        {onBack && <button type="button" onClick={onBack} className="px-5 py-3 border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50">← Back</button>}
        <button type="button" onClick={onNext} disabled={loading}
          className={cn('flex-1 py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 text-white disabled:opacity-60 transition-colors', btnClass)}>
          {loading ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</> : <>{nextLabel}{!isSubmit && <ChevronRight className="w-4 h-4" />}</>}
        </button>
      </div>
    </div>
  )
}

const inputCls = 'w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white'

export default function OrgOnboardingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="flex items-center gap-2 mb-10">
          <div className="w-8 h-8 bg-blue-700 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <span className="font-bold text-lg text-gray-900">TrustGrid</span>
        </div>
        <Suspense fallback={<div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 border-2 border-purple-700 border-t-transparent rounded-full" /></div>}>
          <OrgOnboardingInner />
        </Suspense>
      </div>
    </div>
  )
}
