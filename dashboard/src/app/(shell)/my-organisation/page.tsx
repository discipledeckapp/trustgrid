'use client'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Building2, Users, MapPin, Plus, Trash2, Phone, Mail, Star } from 'lucide-react'
import { cn, STATUS_COLORS } from '@/lib/utils'
import { VerificationBadge } from '@/components/ui/verification-badge'
import Link from 'next/link'

export default function MyOrganisationPage() {
  const qc = useQueryClient()
  const [addBranch, setAddBranch] = useState(false)
  const [branchForm, setBranchForm] = useState({ name: '', address: '', city: '', managerName: '', managerPhone: '' })

  // Fetch organisations linked to this institution
  const { data: orgsData, isLoading } = useQuery({
    queryKey: ['my-orgs'],
    queryFn: () => api.get('/vendors').then(r => r.data),
  })

  const orgs = orgsData?.data ?? []

  if (isLoading) return (
    <div className="flex justify-center py-20">
      <div className="animate-spin w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full" />
    </div>
  )

  if (orgs.length === 0) return (
    <div className="max-w-3xl mx-auto p-6 pb-16">
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mb-4">
          <Building2 className="w-8 h-8 text-purple-600" />
        </div>
        <h2 className="font-bold text-gray-900 text-xl mb-2">No Organisation Registered</h2>
        <p className="text-gray-500 text-center mb-6 max-w-sm">
          Your organisation is not yet registered with this institution. Complete your registration to access this section.
        </p>
        <Link href="/join/organisation"
          className="flex items-center gap-2 bg-purple-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-purple-800 transition-colors">
          <Plus className="w-4 h-4" /> Register Your Organisation
        </Link>
      </div>
    </div>
  )

  // Show first org (in a real system, filter by org admin's user ID)
  const org = orgs[0]

  return (
    <div className="max-w-4xl mx-auto p-6 pb-16">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-black text-gray-900">My Organisation</h1>
        <p className="text-gray-500 text-sm mt-0.5">Manage your company profile, branches, and workers</p>
      </div>

      {/* Organisation card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center text-2xl font-black text-purple-700">
              {org.companyName[0]}
            </div>
            <div>
              <h2 className="text-xl font-black text-gray-900">{org.companyName}</h2>
              {org.rcNumber && <p className="text-sm text-gray-500">RC: {org.rcNumber}</p>}
              <div className="mt-1.5">
                <VerificationBadge status={org.verificationStatus as any} size="sm" />
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-black text-purple-600">{(org.trustScore ?? 0).toFixed(1)}</div>
            <div className="text-xs text-gray-400">Trust Score</div>
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-4 pt-4 border-t border-gray-50">
          {[
            { icon: Star,  label: 'Avg Rating',  value: org.averageRating ? org.averageRating.toFixed(1) : '—' },
            { icon: Users, label: 'Contracts',   value: org.totalContracts ?? 0 },
            { icon: MapPin,label: 'Service Areas', value: (org.serviceCategories ?? []).length },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="text-center">
              <Icon className="w-4 h-4 text-gray-400 mx-auto mb-1" />
              <div className="text-lg font-black text-gray-900">{value}</div>
              <div className="text-xs text-gray-400">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Service categories */}
      {(org.serviceCategories ?? []).length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-5">
          <h3 className="font-bold text-gray-900 mb-3">Service Categories</h3>
          <div className="flex flex-wrap gap-2">
            {org.serviceCategories.map((cat: string) => (
              <span key={cat} className="bg-purple-50 text-purple-700 border border-purple-100 rounded-full px-3 py-1 text-sm font-medium">
                {cat}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* CAC Verification */}
      {org.verificationStatus !== 'FULLY_VERIFIED' && org.verificationStatus !== 'PARTIALLY_VERIFIED' && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-5 flex items-start gap-3">
          <Building2 className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-amber-800 text-sm">CAC Verification Pending</p>
            <p className="text-amber-700 text-xs mt-0.5 mb-3">
              Verify your RC number to build institutional trust and access more contracts.
            </p>
            <CACVerifyForm organisationId={org.id} />
          </div>
        </div>
      )}

      {/* Workers under org */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-900">Team Members</h3>
          <Link href="/workers/add"
            className="flex items-center gap-1.5 text-xs font-semibold text-purple-700 hover:underline">
            <Plus className="w-3.5 h-3.5" /> Add Worker
          </Link>
        </div>
        <p className="text-sm text-gray-400">
          Workers associated with your organisation appear here once added by the institution administrator.
        </p>
      </div>
    </div>
  )
}

function CACVerifyForm({ organisationId }: { organisationId: string }) {
  const [rcNumber, setRcNumber] = useState('')
  const [companyType, setCompanyType] = useState('RC')
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  async function verify() {
    setLoading(true)
    try {
      const { data } = await api.post(`/identity/organisations/${organisationId}/verify-cac`, { rcNumber, companyType })
      setResult(data)
    } finally {
      setLoading(false)
    }
  }

  if (result) return (
    <div className={`rounded-xl px-4 py-3 text-sm ${result.verified ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-50 text-gray-600'}`}>
      {result.message}
    </div>
  )

  return (
    <div className="flex gap-2">
      <select value={companyType} onChange={e => setCompanyType(e.target.value)}
        className="border border-amber-200 rounded-lg px-2 py-1.5 text-xs bg-white">
        {['RC','BN','IT','LL','LLP'].map(t => <option key={t}>{t}</option>)}
      </select>
      <input value={rcNumber} onChange={e => setRcNumber(e.target.value)}
        placeholder="RC Number" className="flex-1 border border-amber-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-amber-400" />
      <button onClick={verify} disabled={!rcNumber || loading}
        className="px-3 py-1.5 bg-amber-600 text-white rounded-lg text-xs font-semibold hover:bg-amber-700 disabled:opacity-60">
        {loading ? '...' : 'Verify'}
      </button>
    </div>
  )
}
