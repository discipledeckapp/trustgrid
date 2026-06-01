'use client'
import { Suspense } from 'react'
import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { api } from '@/lib/api'
import { cn } from '@/lib/utils'
import { CheckCircle, ChevronRight, ChevronLeft } from 'lucide-react'

const STEPS = [
  { id: 1, emoji: '👤', title: 'Tell us about you',    sub: 'Your name and contact' },
  { id: 2, emoji: '🔧', title: 'What do you do?',      sub: 'Skills and experience' },
  { id: 3, emoji: '🪪', title: 'Prove who you are',   sub: 'Identity verification' },
  { id: 4, emoji: '📋', title: 'Your credentials',     sub: 'Certificates & licences' },
  { id: 5, emoji: '📍', title: 'When can you work?',  sub: 'Availability & zones' },
]

const SKILLS = ['Electrician','Plumber','Security Guard','Cleaner','General Labour','Catering','IT Support','Transport','Medical Technician','Event Setup','Landscaping','Construction','AC Technician','Generator Tech','Painting']
const ZONES  = ['Lekki','Victoria Island','Ikoyi','Redemption City','Ajah','Ikeja','Surulere','Yaba','Mainland','Island','Abuja','Port Harcourt']
const CERTS  = ['Professional Certificate','Trade Licence','COREN Registration','Safety Certificate','Medical Certificate','Manufacturer Certificate']

function WorkerOnboardingInner() {
  const institutionId = useSearchParams().get('i') ?? 'cmpu6vbkr00001lt6vsiiunuo'
  const [step, setStep]           = useState(1)
  const [appId, setAppId]         = useState<string|null>(null)
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState('')
  const [done, setDone]           = useState(false)
  const [celebrating, setCelebrating] = useState(false)

  const [s1, setS1] = useState({ firstName:'', lastName:'', phone:'', email:'' })
  const [s2, setS2] = useState({ primarySkill:'', skills:[] as string[], yearsExp:'', hourly:'', daily:'', bio:'' })
  const [s3, setS3] = useState({ idType:'NIN', idNumber:'' })
  const [s4, setS4] = useState({ certs:[] as string[] })
  const [s5, setS5] = useState({ zones:[] as string[], notes:'' })

  async function go(n: number) {
    setLoading(true); setError('')
    try {
      if (n===1) {
        const { data } = await api.post(`/onboarding/worker/start?institutionId=${institutionId}`, { firstName:s1.firstName, lastName:s1.lastName, phone:s1.phone, email:s1.email||undefined })
        setAppId(data.applicationId)
      } else if (n===2 && appId) {
        await api.post(`/onboarding/worker/skills?institutionId=${institutionId}`, { applicationId:appId, primarySkill:s2.primarySkill, skills:s2.skills.length?s2.skills:[s2.primarySkill], categoryIds:[], yearsExperience:s2.yearsExp?Number(s2.yearsExp):undefined, hourlyRate:s2.hourly?Number(s2.hourly):undefined, dailyRate:s2.daily?Number(s2.daily):undefined, bio:s2.bio||undefined })
      } else if (n===3 && appId) {
        await api.post(`/onboarding/worker/verification?institutionId=${institutionId}`, { applicationId:appId, idType:s3.idType, idNumber:s3.idNumber })
      } else if (n===4 && appId) {
        await api.post(`/onboarding/worker/credentials?institutionId=${institutionId}`, { applicationId:appId, credentials:s4.certs.map(c=>({type:'CERT',name:c})) })
      } else if (n===5 && appId) {
        await api.post(`/onboarding/worker/availability?institutionId=${institutionId}`, { applicationId:appId, serviceZoneIds:s5.zones, availabilityNotes:s5.notes||undefined })
        setDone(true); return
      }
      // Celebrate then advance
      setCelebrating(true)
      setTimeout(() => { setCelebrating(false); setStep(n+1) }, 600)
    } catch(e: any) {
      setError(e?.response?.data?.message ?? 'Something went wrong. Please try again.')
    } finally { setLoading(false) }
  }

  if (done) return (
    <div className="text-center py-12">
      <div className="text-8xl mb-6 animate-bounce">🎉</div>
      <h2 className="text-3xl font-black text-gray-900 mb-3">You're in the queue!</h2>
      <p className="text-gray-500 text-lg mb-2">Your application has been submitted.</p>
      <p className="text-gray-500 mb-8">The institution will review and approve you within 24 hours. You'll receive an SMS notification.</p>
      <div className="inline-block bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl px-8 py-5 border border-blue-100">
        <p className="text-xs text-gray-500 mb-1">Your Application ID</p>
        <p className="font-mono font-bold text-blue-700 text-lg">{appId}</p>
        <p className="text-xs text-gray-400 mt-2">Save this to check your status later</p>
      </div>
    </div>
  )

  const progress = ((step - 1) / STEPS.length) * 100

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-black text-gray-900 mb-1">Join TrustGrid as a Worker</h1>
        <p className="text-gray-500">Build your trusted reputation in 5 quick steps.</p>
      </div>

      {/* Progress bar */}
      <div className="mb-2">
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-blue-700 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }} />
        </div>
      </div>
      <div className="flex justify-between mb-8">
        {STEPS.map(s => (
          <div key={s.id} className={cn('flex flex-col items-center gap-1', s.id > step && 'opacity-30')}>
            <div className={cn('w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all',
              step > s.id ? 'bg-blue-700 text-white' :
              step === s.id ? 'bg-blue-700 text-white ring-4 ring-blue-100' :
              'bg-gray-100 text-gray-400')}>
              {step > s.id ? <CheckCircle className="w-4 h-4" /> : <span>{s.emoji}</span>}
            </div>
            <span className={cn('text-xs hidden sm:block font-medium', step === s.id ? 'text-blue-700' : 'text-gray-400')}>
              {s.title.split(' ').slice(0,2).join(' ')}
            </span>
          </div>
        ))}
      </div>

      {/* Step card */}
      <div className={cn('bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden transition-all', celebrating && 'scale-[1.01] shadow-lg')}>
        {/* Step header */}
        <div className="bg-gradient-to-r from-blue-700 to-indigo-800 px-8 py-6">
          <div className="text-4xl mb-2">{STEPS[step-1].emoji}</div>
          <h2 className="text-xl font-black text-white">{STEPS[step-1].title}</h2>
          <p className="text-blue-200 text-sm">{STEPS[step-1].sub}</p>
        </div>

        <div className="px-8 py-7 space-y-4">
          {/* Step 1 */}
          {step===1 && <>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="First Name *"><input value={s1.firstName} onChange={e=>setS1({...s1,firstName:e.target.value})} placeholder="Chukwuemeka" className={iCls} /></Field>
              <Field label="Last Name *"><input value={s1.lastName} onChange={e=>setS1({...s1,lastName:e.target.value})} placeholder="Adeyemi" className={iCls} /></Field>
            </div>
            <Field label="Phone Number *"><input type="tel" value={s1.phone} onChange={e=>setS1({...s1,phone:e.target.value})} placeholder="+2348012345678" className={iCls} /></Field>
            <Field label="Email (optional)"><input type="email" value={s1.email} onChange={e=>setS1({...s1,email:e.target.value})} placeholder="your@email.com" className={iCls} /></Field>
          </>}

          {/* Step 2 */}
          {step===2 && <>
            <Field label="Primary Skill *">
              <select value={s2.primarySkill} onChange={e=>setS2({...s2,primarySkill:e.target.value})} className={iCls}>
                <option value="">Choose your main skill...</option>
                {SKILLS.map(s=><option key={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="Additional skills">
              <div className="flex flex-wrap gap-2">
                {SKILLS.map(skill=>(
                  <button key={skill} type="button"
                    onClick={()=>setS2(p=>({...p,skills:p.skills.includes(skill)?p.skills.filter(x=>x!==skill):[...p.skills,skill]}))}
                    className={cn('px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors',s2.skills.includes(skill)?'bg-blue-700 text-white border-blue-700':'bg-white text-gray-600 border-gray-200 hover:border-blue-300')}>
                    {skill}
                  </button>
                ))}
              </div>
            </Field>
            <div className="grid sm:grid-cols-3 gap-3">
              <Field label="Years Experience"><input type="number" min="0" max="50" value={s2.yearsExp} onChange={e=>setS2({...s2,yearsExp:e.target.value})} placeholder="5" className={iCls} /></Field>
              <Field label="Hourly Rate (₦)"><input type="number" value={s2.hourly} onChange={e=>setS2({...s2,hourly:e.target.value})} placeholder="2500" className={iCls} /></Field>
              <Field label="Daily Rate (₦)"><input type="number" value={s2.daily} onChange={e=>setS2({...s2,daily:e.target.value})} placeholder="12000" className={iCls} /></Field>
            </div>
            <Field label="Bio (optional)"><textarea rows={2} value={s2.bio} onChange={e=>setS2({...s2,bio:e.target.value})} placeholder="Brief intro about your background..." className={`${iCls} resize-none`} /></Field>
          </>}

          {/* Step 3 */}
          {step===3 && <>
            <div className="bg-blue-50 border border-blue-100 rounded-2xl px-5 py-4">
              <p className="text-sm font-semibold text-blue-900 mb-1">Why we verify your identity</p>
              <p className="text-sm text-blue-700">Verified workers earn 20–40% more and are trusted by more employers. Your ID number is encrypted and never shared.</p>
            </div>
            <Field label="ID Type">
              <div className="flex gap-3">
                {['NIN','BVN'].map(t=>(
                  <button key={t} type="button" onClick={()=>setS3({...s3,idType:t})}
                    className={cn('flex-1 py-3 rounded-xl text-sm font-bold border transition-colors',s3.idType===t?'bg-blue-700 text-white border-blue-700':'bg-white text-gray-600 border-gray-200 hover:border-blue-300')}>
                    {t}
                  </button>
                ))}
              </div>
            </Field>
            <Field label={`${s3.idType} Number *`}>
              <input value={s3.idNumber} onChange={e=>setS3({...s3,idNumber:e.target.value})} placeholder="11-digit number" className={iCls} maxLength={11} />
            </Field>
          </>}

          {/* Step 4 */}
          {step===4 && <>
            <p className="text-sm text-gray-600">Select the professional certificates or licences you hold. You can upload files on the mobile app.</p>
            <div className="space-y-2">
              {CERTS.map(cert=>(
                <button key={cert} type="button"
                  onClick={()=>setS4(p=>({certs:p.certs.includes(cert)?p.certs.filter(c=>c!==cert):[...p.certs,cert]}))}
                  className={cn('w-full flex items-center justify-between px-5 py-3.5 rounded-xl border text-sm font-medium transition-all',s4.certs.includes(cert)?'bg-emerald-50 border-emerald-200 text-emerald-700':'bg-white border-gray-200 text-gray-700 hover:border-blue-200')}>
                  <span>{cert}</span>
                  <span>{s4.certs.includes(cert)?'✓ Added':'+ Add'}</span>
                </button>
              ))}
            </div>
          </>}

          {/* Step 5 */}
          {step===5 && <>
            <Field label="Where can you work? (select all that apply)">
              <div className="flex flex-wrap gap-2">
                {ZONES.map(z=>(
                  <button key={z} type="button"
                    onClick={()=>setS5(p=>({...p,zones:p.zones.includes(z)?p.zones.filter(x=>x!==z):[...p.zones,z]}))}
                    className={cn('px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors',s5.zones.includes(z)?'bg-blue-700 text-white border-blue-700':'bg-white text-gray-600 border-gray-200 hover:border-blue-300')}>
                    {z}
                  </button>
                ))}
              </div>
            </Field>
            <Field label="Availability notes (optional)">
              <textarea rows={2} value={s5.notes} onChange={e=>setS5({...s5,notes:e.target.value})} placeholder="e.g. Weekdays 7am–6pm, weekends on request" className={`${iCls} resize-none`} />
            </Field>
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 rounded-2xl px-5 py-4">
              <p className="text-sm font-semibold text-emerald-800 mb-1">🚀 Almost there!</p>
              <p className="text-sm text-emerald-700">After you submit, the institution reviews your application within 24 hours. You'll get an SMS when you're approved.</p>
            </div>
          </>}

          {/* Error */}
          {error && <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">{error}</div>}

          {/* Navigation */}
          <div className="flex gap-3 pt-2">
            {step > 1 && (
              <button type="button" onClick={()=>setStep(s=>s-1)}
                className="flex items-center gap-1.5 px-5 py-3 border border-gray-200 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors">
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
            )}
            <button type="button" disabled={loading} onClick={() => {
              if (step===1 && (!s1.firstName||!s1.lastName||!s1.phone)) { setError('Please fill in the required fields.'); return }
              if (step===2 && !s2.primarySkill) { setError('Please select your primary skill.'); return }
              go(step)
            }}
              className={cn(
                'flex-1 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-60',
                step===5 ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:opacity-90' : 'bg-blue-700 text-white hover:bg-blue-800',
              )}>
              {loading ? (
                <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</>
              ) : (
                <>{step===5 ? '🎉 Submit Application' : 'Continue'}{step<5 && <ChevronRight className="w-4 h-4" />}</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
      {children}
    </div>
  )
}

const iCls = 'w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white transition-shadow'

export default function WorkerOnboardingPage() {
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
        <Suspense fallback={<div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 border-2 border-blue-700 border-t-transparent rounded-full" /></div>}>
          <WorkerOnboardingInner />
        </Suspense>
      </div>
    </div>
  )
}
