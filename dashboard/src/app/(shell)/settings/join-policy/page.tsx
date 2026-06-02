'use client'
import { useState, useEffect } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Users, Lock, UserCheck, Upload, Copy, CheckCircle } from 'lucide-react'

const POLICIES = [
  {
    value: 'OPEN',
    label: 'Open — Anyone can join',
    desc: 'Anyone who visits your join link can sign up and immediately becomes a pending member. Best for public communities.',
    icon: Users,
    color: 'text-emerald-600',
    border: 'border-emerald-200',
    bg: 'bg-emerald-50',
  },
  {
    value: 'REQUEST',
    label: 'Request — Approval required',
    desc: 'Anyone can request to join. Your team reviews and approves or rejects each application. Default for most communities.',
    icon: UserCheck,
    color: 'text-indigo-600',
    border: 'border-indigo-200',
    bg: 'bg-indigo-50',
  },
  {
    value: 'INVITE_ONLY',
    label: 'Invite only — By invitation',
    desc: 'Only people you explicitly invite via phone or email can join. Best for private or sensitive communities.',
    icon: Lock,
    color: 'text-amber-600',
    border: 'border-amber-200',
    bg: 'bg-amber-50',
  },
]

export default function JoinPolicyPage() {
  const [policy, setPolicy] = useState('REQUEST')
  const [allowSelfSignup, setAllowSelfSignup] = useState(true)
  const [copied, setCopied] = useState(false)
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [csvUploading, setCsvUploading] = useState(false)
  const [csvResult, setCsvResult] = useState<{ imported: number; skipped: number } | null>(null)

  const { data: inst } = useQuery({
    queryKey: ['institution'],
    queryFn: () => api.get('/institution').then(r => r.data),
  })

  const { data: config } = useQuery({
    queryKey: ['institution-config'],
    queryFn: () => api.get('/institution/config').then(r => r.data),
  })

  useEffect(() => {
    if (config) {
      setPolicy(config.joinPolicy ?? 'REQUEST')
      setAllowSelfSignup(config.allowSelfSignup ?? true)
    }
  }, [config])

  const saveMutation = useMutation({
    mutationFn: () => api.patch('/institution/config', { joinPolicy: policy, allowSelfSignup }).then(r => r.data),
  })

  const subdomain = inst?.subdomain
  const joinLink = subdomain
    ? `https://${subdomain}.trustgrid.ng/join`
    : `https://app.trustgrid.ng/join`

  function copyLink() {
    navigator.clipboard.writeText(joinLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleCsvUpload() {
    if (!csvFile) return
    setCsvUploading(true)
    try {
      const text = await csvFile.text()
      const lines = text.split('\n').slice(1) // skip header
      const members = lines
        .map(line => line.trim().split(','))
        .filter(cols => cols.length >= 2)
        .map(cols => ({
          firstName: cols[0]?.trim() ?? '',
          lastName:  cols[1]?.trim() ?? '',
          phone:     cols[2]?.trim() ?? '',
          email:     cols[3]?.trim() ?? '',
        }))
        .filter(m => m.firstName && (m.phone || m.email))

      const { data } = await api.post('/onboarding/bulk-import', { members })
      setCsvResult({ imported: data.imported ?? members.length, skipped: data.skipped ?? 0 })
    } catch {
      setCsvResult({ imported: 0, skipped: 0 })
    } finally {
      setCsvUploading(false)
      setCsvFile(null)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6 pb-16">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-gray-900">Join Policy</h1>
        <p className="text-gray-500 text-sm mt-0.5">
          Control how new members join your community on TrustGrid.
        </p>
      </div>

      {/* Join link */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-6">
        <p className="text-sm font-semibold text-gray-700 mb-2">Your community join link</p>
        <div className="flex items-center gap-2">
          <code className="flex-1 bg-gray-50 rounded-lg px-3 py-2 text-sm text-indigo-600 border border-gray-200 truncate">{joinLink}</code>
          <button onClick={copyLink}
            className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-lg text-sm font-semibold text-gray-600 hover:border-indigo-300 transition-colors shrink-0">
            {copied ? <><CheckCircle className="w-4 h-4 text-emerald-500" /> Copied</> : <><Copy className="w-4 h-4" /> Copy</>}
          </button>
        </div>
        <div className="flex items-center gap-3 mt-3">
          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
            <input type="checkbox" checked={allowSelfSignup} onChange={e => setAllowSelfSignup(e.target.checked)}
              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
            Show public join page (visible to anyone with the link)
          </label>
        </div>
      </div>

      {/* Policy selection */}
      <div className="space-y-3 mb-6">
        {POLICIES.map(p => {
          const Icon = p.icon
          const selected = policy === p.value
          return (
            <button key={p.value} onClick={() => setPolicy(p.value)}
              className={`w-full text-left rounded-2xl border-2 p-5 transition-all ${selected ? `${p.border} ${p.bg}` : 'border-gray-100 bg-white hover:border-gray-200'}`}>
              <div className="flex items-start gap-4">
                <Icon className={`w-5 h-5 mt-0.5 shrink-0 ${selected ? p.color : 'text-gray-400'}`} />
                <div>
                  <p className={`font-bold text-sm ${selected ? 'text-gray-900' : 'text-gray-700'}`}>{p.label}</p>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{p.desc}</p>
                </div>
                <div className={`ml-auto w-4 h-4 rounded-full border-2 shrink-0 mt-0.5 ${selected ? `${p.border} bg-white` : 'border-gray-300'}`}>
                  {selected && <div className={`w-2 h-2 rounded-full m-0.5 ${p.color.replace('text-', 'bg-')}`} />}
                </div>
              </div>
            </button>
          )
        })}
      </div>

      <button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}
        className="w-full text-white py-3.5 rounded-xl font-bold hover:opacity-90 disabled:opacity-60 mb-8"
        style={{ background: 'linear-gradient(135deg,#4F46E5,#0D9488)' }}>
        {saveMutation.isPending ? 'Saving…' : 'Save Join Policy'}
      </button>

      {/* CSV bulk import */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <div className="flex items-center gap-2 mb-1">
          <Upload className="w-4 h-4 text-indigo-600" />
          <h2 className="font-bold text-gray-900">Bulk import members</h2>
        </div>
        <p className="text-xs text-gray-500 mb-4">
          Upload a CSV to add existing members. Format: <code className="bg-gray-100 px-1 rounded">firstName, lastName, phone, email</code> (header row required).
        </p>

        <a href="data:text/csv;charset=utf-8,firstName%2ClastName%2Cphone%2Cemail%0AEmeka%2COkafor%2C08001234567%2Cemeka%40example.com"
          download="trustgrid-members-template.csv"
          className="inline-flex items-center gap-1.5 text-xs text-indigo-600 font-semibold hover:underline mb-3">
          Download template CSV
        </a>

        <div className="flex gap-3">
          <label className="flex-1 cursor-pointer">
            <div className={`border-2 border-dashed rounded-xl px-4 py-3 text-sm text-center transition-colors ${csvFile ? 'border-indigo-300 bg-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-400 hover:border-indigo-200'}`}>
              {csvFile ? csvFile.name : 'Choose CSV file…'}
            </div>
            <input type="file" accept=".csv" className="hidden" onChange={e => setCsvFile(e.target.files?.[0] ?? null)} />
          </label>
          <button onClick={handleCsvUpload} disabled={!csvFile || csvUploading}
            className="px-5 py-3 text-white rounded-xl text-sm font-bold hover:opacity-90 disabled:opacity-40"
            style={{ background: 'linear-gradient(135deg,#4F46E5,#0D9488)' }}>
            {csvUploading ? 'Importing…' : 'Import'}
          </button>
        </div>

        {csvResult && (
          <div className="mt-3 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 text-sm">
            <span className="text-emerald-700 font-semibold">{csvResult.imported} members imported</span>
            {csvResult.skipped > 0 && <span className="text-gray-500 ml-2">({csvResult.skipped} skipped — already exist)</span>}
          </div>
        )}
      </div>
    </div>
  )
}
