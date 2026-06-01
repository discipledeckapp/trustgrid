'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Search, Plus, SlidersHorizontal, Users } from 'lucide-react'
import { useWorkers } from '@/hooks/useApi'
import { WorkerCard } from '@/components/workers/WorkerCard'
import { cn } from '@/lib/utils'

const SKILL_FILTERS = [
  { label: 'All Skills', value: '' },
  { label: '⚡ Electrician', value: 'Electrician' },
  { label: '💧 Plumber', value: 'Plumber' },
  { label: '🛡️ Security', value: 'Security Guard' },
  { label: '✨ Cleaner', value: 'Cleaner' },
  { label: '🔧 General', value: 'General Labour' },
]

export default function WorkersPage() {
  const [search, setSearch]       = useState('')
  const [skill,  setSkill]        = useState('')
  const [minScore, setMinScore]   = useState(0)
  const [verifiedOnly, setVerifiedOnly] = useState(false)
  const [availableOnly, setAvailableOnly] = useState(false)

  const filters = {
    ...(search       && { search }),
    ...(skill        && { skill }),
    ...(minScore > 0 && { minTrustScore: minScore }),
    ...(verifiedOnly && { verificationStatus: 'FULLY_VERIFIED' }),
    ...(availableOnly && { isAvailable: 'true' }),
    sortBy: 'trustScore', sortOrder: 'desc', limit: 60,
  }

  const { data, isLoading } = useWorkers(filters)
  const workers = data?.data ?? []
  const total   = data?.pagination?.total ?? 0

  return (
    <div className="max-w-6xl mx-auto p-6 pb-16">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Workforce Registry</h1>
          <p className="text-gray-500 mt-0.5">
            {total > 0 ? `${total} workers in your registry` : 'No workers yet'}
          </p>
        </div>
        <Link href="/workers/add"
          className="flex items-center gap-2 bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-800 transition-colors shadow-sm shadow-blue-200">
          <Plus className="w-4 h-4" /> Add Worker
        </Link>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-5">
        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or skill..."
            className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
          />
        </div>

        {/* Skill filter tabs */}
        <div className="flex flex-wrap gap-2 mb-3">
          {SKILL_FILTERS.map(f => (
            <button key={f.value} onClick={() => setSkill(f.value)}
              className={cn('px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors',
                skill === f.value ? 'bg-blue-700 text-white border-blue-700' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300')}>
              {f.label}
            </button>
          ))}
        </div>

        {/* Extra filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-xs text-gray-500 font-medium">Min trust:</span>
            <select value={minScore} onChange={e => setMinScore(Number(e.target.value))}
              className="border border-gray-200 rounded-lg px-2 py-1 text-xs bg-white font-medium">
              {[0,40,50,60,65,70,80].map(v => <option key={v} value={v}>{v === 0 ? 'Any' : `${v}+`}</option>)}
            </select>
          </div>
          {[
            { label: '✓ Verified only', val: verifiedOnly, set: setVerifiedOnly },
            { label: '● Available now', val: availableOnly, set: setAvailableOnly },
          ].map(({ label, val, set }) => (
            <button key={label} onClick={() => set(!val)}
              className={cn('px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors',
                val ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-gray-600 border-gray-200 hover:border-emerald-300')}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="animate-spin w-10 h-10 border-2 border-blue-700 border-t-transparent rounded-full mb-3" />
          <p className="text-sm text-gray-500">Finding your workers...</p>
        </div>
      ) : workers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
            <Users className="w-8 h-8 text-gray-300" />
          </div>
          <p className="font-semibold text-gray-700 mb-1">No workers found</p>
          <p className="text-sm text-gray-400">Try adjusting your filters or add new workers</p>
          <Link href="/workers/add" className="mt-4 text-sm text-blue-700 font-semibold hover:underline">
            + Add your first worker
          </Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {workers.map((w: any) => <WorkerCard key={w.id} worker={w} />)}
        </div>
      )}
    </div>
  )
}
