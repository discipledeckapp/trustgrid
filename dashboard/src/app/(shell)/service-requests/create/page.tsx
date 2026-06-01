'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ClipboardPlus } from 'lucide-react'
import { useCreateServiceRequest } from '@/hooks/useApi'
import { api } from '@/lib/api'

const CATEGORIES = [
  { id: 'cat_electrical', label: '⚡ Electrical',    skill: 'Electrician' },
  { id: 'cat_plumbing',   label: '💧 Plumbing',      skill: 'Plumber' },
  { id: 'cat_cleaning',   label: '✨ Cleaning',       skill: 'Cleaner' },
  { id: 'cat_security',   label: '🛡️ Security',      skill: 'Security Guard' },
  { id: 'cat_event',      label: '📋 Event Services', skill: 'Event Setup' },
  { id: 'cat_general',    label: '🔧 General Labour', skill: 'General Labour' },
  { id: 'cat_medical',    label: '🏥 Medical',        skill: 'Medical Technician' },
  { id: 'cat_transport',  label: '🚗 Transport',      skill: 'Transport' },
]

export default function CreateServiceRequestPage() {
  const router = useRouter()
  const createRequest = useCreateServiceRequest()

  const [form, setForm] = useState({
    title: '',
    description: '',
    categoryId: 'cat_electrical',
    customSkill: '',
    workersNeeded: 1,
    minimumTrustScore: 60,
    priority: 'NORMAL',
    locationAddress: '',
    scheduledStartAt: '',
    scheduledEndAt: '',
    estimatedHours: '',
    notes: '',
  })
  const [matchedCount, setMatchedCount] = useState<number | null>(null)
  const [error, setError] = useState('')

  function set(field: string) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }))
  }

  const selectedCategory = CATEGORIES.find((c) => c.id === form.categoryId)

  async function previewMatches() {
    if (!form.categoryId) return
    try {
      const { data } = await api.get('/workers', {
        params: {
          categoryId: form.categoryId,
          minTrustScore: form.minimumTrustScore,
          isAvailable: 'true',
          limit: 1,
        },
      })
      setMatchedCount(data.pagination?.total ?? 0)
    } catch {
      setMatchedCount(null)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    createRequest.mutate(
      {
        title: form.title,
        description: form.description,
        categoryId: form.categoryId,
        requiredSkills: [form.customSkill || selectedCategory?.skill || ''],
        workersNeeded: Number(form.workersNeeded),
        minimumTrustScore: Number(form.minimumTrustScore),
        priority: form.priority,
        locationAddress: form.locationAddress || undefined,
        scheduledStartAt: form.scheduledStartAt || undefined,
        scheduledEndAt: form.scheduledEndAt || undefined,
        estimatedHours: form.estimatedHours ? Number(form.estimatedHours) : undefined,
        notes: form.notes || undefined,
      },
      {
        onSuccess: async (data: any) => {
          // Auto-submit the draft
          await api.post(`/service-requests/${data.id}/submit`)
          router.push(`/service-requests/${data.id}`)
        },
        onError: (err: any) =>
          setError(err?.response?.data?.message ?? 'Failed to create request'),
      },
    )
  }

  return (
    <div className="p-6 max-w-2xl">
      <Link href="/service-requests" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-5">
        <ArrowLeft className="w-4 h-4" /> Back to Requests
      </Link>

      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
          <ClipboardPlus className="w-5 h-5 text-blue-700" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">New Service Request</h1>
          <p className="text-gray-500 text-sm">Find and assign verified workers to a job</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
        <Field label="Request Title *">
          <input required value={form.title} onChange={set('title')}
            placeholder="e.g. Convention Electricians — May 2026" className={inputCls} />
        </Field>

        <Field label="Description *">
          <textarea required value={form.description} onChange={set('description')} rows={3}
            placeholder="Describe the work required, conditions, and expectations..."
            className={`${inputCls} resize-none`} />
        </Field>

        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Service Category *">
            <select value={form.categoryId} onChange={set('categoryId')} className={inputCls}>
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
          </Field>
          <Field label="Specific Skill (optional override)">
            <input value={form.customSkill} onChange={set('customSkill')}
              placeholder={selectedCategory?.skill ?? 'e.g. Panel Wiring'} className={inputCls} />
          </Field>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Workers Needed *">
            <input required type="number" min="1" max="2000"
              value={form.workersNeeded} onChange={set('workersNeeded')} className={inputCls} />
          </Field>
          <Field label="Priority">
            <select value={form.priority} onChange={set('priority')} className={inputCls}>
              <option value="LOW">Low</option>
              <option value="NORMAL">Normal</option>
              <option value="HIGH">High</option>
              <option value="CRITICAL">Critical</option>
            </select>
          </Field>
        </div>

        {/* Minimum Trust Score with live preview */}
        <Field label={`Minimum Trust Score: ${form.minimumTrustScore}`}>
          <div className="space-y-2">
            <input
              type="range" min="0" max="90" step="5"
              value={form.minimumTrustScore}
              onChange={(e) => {
                set('minimumTrustScore')(e)
                setMatchedCount(null)
              }}
              className="w-full accent-blue-700"
            />
            <div className="flex items-center justify-between">
              <div className="flex gap-1">
                {[0, 40, 50, 60, 65, 70, 80].map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => { setForm((f) => ({ ...f, minimumTrustScore: v })); setMatchedCount(null) }}
                    className={`text-xs px-2 py-1 rounded border transition-colors ${
                      form.minimumTrustScore === v
                        ? 'bg-blue-700 text-white border-blue-700'
                        : 'bg-white text-gray-500 border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    {v === 0 ? 'Any' : `${v}+`}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={previewMatches}
                className="text-xs text-blue-700 hover:underline font-medium"
              >
                Preview matches →
              </button>
            </div>
            {matchedCount !== null && (
              <p className={`text-xs font-medium ${matchedCount >= form.workersNeeded ? 'text-emerald-600' : 'text-amber-600'}`}>
                {matchedCount} workers qualify · {matchedCount >= form.workersNeeded
                  ? `✓ Enough for ${form.workersNeeded} needed`
                  : `⚠ Need ${form.workersNeeded}, only ${matchedCount} qualify — lower the threshold`}
              </p>
            )}
          </div>
        </Field>

        <Field label="Location">
          <input value={form.locationAddress} onChange={set('locationAddress')}
            placeholder="e.g. Redemption Camp, Km 46, Lagos-Ibadan Expressway" className={inputCls} />
        </Field>

        <div className="grid sm:grid-cols-3 gap-4">
          <Field label="Start Date">
            <input type="datetime-local" value={form.scheduledStartAt}
              onChange={set('scheduledStartAt')} className={inputCls} />
          </Field>
          <Field label="End Date">
            <input type="datetime-local" value={form.scheduledEndAt}
              onChange={set('scheduledEndAt')} className={inputCls} />
          </Field>
          <Field label="Est. Hours/Day">
            <input type="number" min="1" max="24" value={form.estimatedHours}
              onChange={set('estimatedHours')} placeholder="8" className={inputCls} />
          </Field>
        </div>

        <Field label="Internal Notes (optional)">
          <textarea value={form.notes} onChange={set('notes')} rows={2}
            placeholder="Supervisor contact, special instructions..."
            className={`${inputCls} resize-none`} />
        </Field>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-600">{error}</div>
        )}

        <div className="flex gap-3 pt-2">
          <Link href="/service-requests"
            className="flex-1 text-center border border-gray-200 text-gray-700 py-3 rounded-xl text-sm font-medium hover:bg-gray-50">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={createRequest.isPending}
            className="flex-1 bg-blue-700 text-white py-3 rounded-xl text-sm font-semibold hover:bg-blue-800 disabled:opacity-60 transition-colors"
          >
            {createRequest.isPending ? 'Creating...' : 'Create & Find Matching Workers →'}
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
