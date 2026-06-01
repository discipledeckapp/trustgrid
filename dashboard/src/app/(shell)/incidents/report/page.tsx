'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, AlertTriangle, Search } from 'lucide-react'
import { useCreateIncident, useWorkers } from '@/hooks/useApi'
import type { Worker } from '@/types'

export default function ReportIncidentPage() {
  const router = useRouter()
  const createIncident = useCreateIncident()

  const [form, setForm] = useState({
    title: '',
    description: '',
    severity: 'MEDIUM',
    incidentDate: new Date().toISOString().slice(0, 16),
    locationAddress: '',
    workerId: '',
  })
  const [workerSearch, setWorkerSearch] = useState('')
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null)
  const [showWorkerDropdown, setShowWorkerDropdown] = useState(false)
  const [error, setError] = useState('')

  const { data: workersData } = useWorkers(
    workerSearch.length >= 2 ? { search: workerSearch, limit: 8 } : {},
  )
  const workers: Worker[] = workersData?.data ?? []

  function set(field: string) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }))
  }

  function selectWorker(worker: Worker) {
    setSelectedWorker(worker)
    setForm((f) => ({ ...f, workerId: worker.id }))
    setWorkerSearch(`${worker.firstName} ${worker.lastName}`)
    setShowWorkerDropdown(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!form.title || !form.description) {
      setError('Title and description are required')
      return
    }

    createIncident.mutate(
      {
        title: form.title,
        description: form.description,
        severity: form.severity,
        incidentDate: new Date(form.incidentDate).toISOString(),
        locationAddress: form.locationAddress || undefined,
        workerId: form.workerId || undefined,
      },
      {
        onSuccess: () => router.push('/incidents'),
        onError: (err: any) => setError(err?.response?.data?.message ?? 'Failed to report incident'),
      },
    )
  }

  const SEV_INFO = {
    LOW:      { color: 'text-blue-600 bg-blue-50',    label: 'Low — Minor issue, no immediate risk' },
    MEDIUM:   { color: 'text-amber-600 bg-amber-50',  label: 'Medium — Needs attention and investigation' },
    HIGH:     { color: 'text-orange-600 bg-orange-50',label: 'High — Significant impact, urgent review required' },
    CRITICAL: { color: 'text-red-600 bg-red-50',      label: 'Critical — Immediate action required' },
  }

  return (
    <div className="p-6 max-w-2xl">
      <Link href="/incidents"
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-5">
        <ArrowLeft className="w-4 h-4" /> Back to Incidents
      </Link>

      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
          <AlertTriangle className="w-5 h-5 text-red-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Report Incident</h1>
          <p className="text-gray-500 text-sm">Incidents are investigated before trust scores are affected</p>
        </div>
      </div>

      {/* Info banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-5 text-sm text-amber-700">
        <strong>How this works:</strong> Filing a report applies an immediate −5 trust score penalty.
        If the worker is exonerated during investigation, +3 is restored. If penalised, an additional −2 is applied.
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
        {/* Worker search */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Worker (optional — leave blank for vendor or general incident)
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={workerSearch}
              onChange={(e) => {
                setWorkerSearch(e.target.value)
                setShowWorkerDropdown(true)
                if (!e.target.value) { setSelectedWorker(null); setForm((f) => ({ ...f, workerId: '' })) }
              }}
              placeholder="Search by name..."
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {selectedWorker && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">Selected</span>
              </div>
            )}
          </div>
          {showWorkerDropdown && workers.length > 0 && (
            <div className="absolute z-10 mt-1 w-full max-w-lg bg-white border border-gray-200 rounded-xl shadow-lg">
              {workers.map((w) => (
                <button
                  key={w.id}
                  type="button"
                  onClick={() => selectWorker(w)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                    <span className="text-blue-700 text-xs font-bold">{w.firstName[0]}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">{w.firstName} {w.lastName}</p>
                    <p className="text-xs text-gray-400">{w.primarySkill} · Trust {w.trustScore.toFixed(1)}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <Field label="Incident Title *">
          <input required value={form.title} onChange={set('title')}
            placeholder="e.g. Equipment damaged during assignment" className={inputCls} />
        </Field>

        <Field label="Description *">
          <textarea required value={form.description} onChange={set('description')} rows={4}
            placeholder="Describe what happened, when, where, and who was involved..."
            className={`${inputCls} resize-none`} />
        </Field>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Severity *</label>
            <select value={form.severity} onChange={set('severity')} className={inputCls}>
              {Object.entries(SEV_INFO).map(([val, info]) => (
                <option key={val} value={val}>{val} — {info.label.split('—')[1].trim()}</option>
              ))}
            </select>
            {form.severity && (
              <p className={`mt-1.5 text-xs px-2 py-1 rounded-md ${SEV_INFO[form.severity as keyof typeof SEV_INFO]?.color}`}>
                {SEV_INFO[form.severity as keyof typeof SEV_INFO]?.label}
              </p>
            )}
          </div>
          <Field label="Incident Date & Time *">
            <input required type="datetime-local" value={form.incidentDate}
              onChange={set('incidentDate')} className={inputCls} />
          </Field>
        </div>

        <Field label="Location (optional)">
          <input value={form.locationAddress} onChange={set('locationAddress')}
            placeholder="e.g. Block C, Unit 14, Estate" className={inputCls} />
        </Field>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-600">{error}</div>
        )}

        <div className="flex gap-3 pt-2">
          <Link href="/incidents"
            className="flex-1 text-center border border-gray-200 text-gray-700 py-3 rounded-xl text-sm font-medium hover:bg-gray-50">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={createIncident.isPending}
            className="flex-1 bg-red-600 text-white py-3 rounded-xl text-sm font-semibold hover:bg-red-700 disabled:opacity-60 transition-colors"
          >
            {createIncident.isPending ? 'Reporting...' : 'Report Incident'}
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
