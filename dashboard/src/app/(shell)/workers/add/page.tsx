'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, UserPlus } from 'lucide-react'
import { useCreateWorker } from '@/hooks/useApi'

const SKILLS = [
  'Electrician', 'Plumber', 'Cleaner', 'Security Guard',
  'General Labour', 'Catering', 'IT Support', 'Transport',
  'Medical Technician', 'Event Setup', 'Landscaping', 'Construction',
]

const CATEGORIES: Record<string, string> = {
  'Electrician':        'cat_electrical',
  'Plumber':            'cat_plumbing',
  'Cleaner':            'cat_cleaning',
  'Security Guard':     'cat_security',
  'General Labour':     'cat_general',
  'Catering':           'cat_event',
  'IT Support':         'cat_general',
  'Transport':          'cat_transport',
  'Medical Technician': 'cat_medical',
  'Event Setup':        'cat_event',
  'Landscaping':        'cat_general',
  'Construction':       'cat_general',
}

export default function AddWorkerPage() {
  const router = useRouter()
  const createWorker = useCreateWorker()

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    primarySkill: '',
    workerType: 'CONTRACTOR',
    yearsExperience: '',
    hourlyRate: '',
    dailyRate: '',
    bio: '',
  })
  const [error, setError] = useState('')

  function set(field: string) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!form.primarySkill) { setError('Select a primary skill'); return }

    createWorker.mutate(
      {
        firstName: form.firstName,
        lastName: form.lastName,
        phone: form.phone,
        email: form.email || undefined,
        primarySkill: form.primarySkill,
        skills: [form.primarySkill],
        categoryIds: CATEGORIES[form.primarySkill] ? [CATEGORIES[form.primarySkill]] : [],
        workerType: form.workerType,
        yearsExperience: form.yearsExperience ? Number(form.yearsExperience) : undefined,
        hourlyRate: form.hourlyRate ? Number(form.hourlyRate) : undefined,
        dailyRate: form.dailyRate ? Number(form.dailyRate) : undefined,
        bio: form.bio || undefined,
      },
      {
        onSuccess: (data: any) => router.push(`/workers/${data.id}`),
        onError: (err: any) => setError(err?.response?.data?.message ?? 'Failed to add worker'),
      },
    )
  }

  return (
    <div className="p-6 max-w-2xl">
      <Link href="/workers" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-5">
        <ArrowLeft className="w-4 h-4" /> Back to Registry
      </Link>

      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
          <UserPlus className="w-5 h-5 text-blue-700" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Add Worker</h1>
          <p className="text-gray-500 text-sm">Register a new worker to your institution's registry</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
        {/* Name */}
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="First Name *">
            <input required value={form.firstName} onChange={set('firstName')}
              placeholder="Chukwuemeka" className={inputCls} />
          </Field>
          <Field label="Last Name *">
            <input required value={form.lastName} onChange={set('lastName')}
              placeholder="Adeyemi" className={inputCls} />
          </Field>
        </div>

        {/* Contact */}
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Phone Number *">
            <input required type="tel" value={form.phone} onChange={set('phone')}
              placeholder="+2348012345678" className={inputCls} />
          </Field>
          <Field label="Email (optional)">
            <input type="email" value={form.email} onChange={set('email')}
              placeholder="worker@email.com" className={inputCls} />
          </Field>
        </div>

        {/* Skill & Type */}
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Primary Skill *">
            <select required value={form.primarySkill} onChange={set('primarySkill')} className={inputCls}>
              <option value="">Select skill...</option>
              {SKILLS.map((s) => <option key={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="Worker Type">
            <select value={form.workerType} onChange={set('workerType')} className={inputCls}>
              <option value="CONTRACTOR">Contractor</option>
              <option value="FREELANCER">Freelancer</option>
              <option value="VOLUNTEER">Volunteer</option>
              <option value="EMPLOYEE">Employee</option>
            </select>
          </Field>
        </div>

        {/* Experience & Rates */}
        <div className="grid sm:grid-cols-3 gap-4">
          <Field label="Years Experience">
            <input type="number" min="0" max="50" value={form.yearsExperience} onChange={set('yearsExperience')}
              placeholder="5" className={inputCls} />
          </Field>
          <Field label="Hourly Rate (₦)">
            <input type="number" min="0" value={form.hourlyRate} onChange={set('hourlyRate')}
              placeholder="2500" className={inputCls} />
          </Field>
          <Field label="Daily Rate (₦)">
            <input type="number" min="0" value={form.dailyRate} onChange={set('dailyRate')}
              placeholder="12000" className={inputCls} />
          </Field>
        </div>

        {/* Bio */}
        <Field label="Bio (optional)">
          <textarea value={form.bio} onChange={set('bio')} rows={3}
            placeholder="Brief description of the worker's background and expertise..."
            className={`${inputCls} resize-none`} />
        </Field>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <Link href="/workers"
            className="flex-1 text-center border border-gray-200 text-gray-700 py-3 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={createWorker.isPending}
            className="flex-1 bg-blue-700 text-white py-3 rounded-xl text-sm font-semibold hover:bg-blue-800 transition-colors disabled:opacity-60"
          >
            {createWorker.isPending ? 'Adding worker...' : 'Add to Registry'}
          </button>
        </div>
      </form>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      {children}
    </div>
  )
}

const inputCls = 'w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white'
