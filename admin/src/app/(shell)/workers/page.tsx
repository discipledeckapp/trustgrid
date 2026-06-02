'use client'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Users, ShieldCheck, Star } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function AdminWorkersPage() {
  const [minScore, setMinScore] = useState(0)
  const [verifiedOnly, setVerifiedOnly] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-workers', minScore, verifiedOnly],
    queryFn: () => api.get('/admin/workers', {
      params: {
        sortBy: 'trustScore', sortOrder: 'desc', limit: 50,
        ...(minScore > 0 && { minTrustScore: minScore }),
        ...(verifiedOnly && { verificationStatus: 'FULLY_VERIFIED' }),
      },
    }).then(r => r.data),
    retry: false,
  })

  const workers = data?.data ?? []
  const total = data?.pagination?.total ?? 0

  return (
    <div className="p-6 max-w-5xl">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-white">Workers</h1>
        <p className="text-slate-400 text-sm mt-0.5">{total} total workers across the platform</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-5 bg-white/5 border border-white/10 rounded-xl p-3">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Min trust:</span>
          <select value={minScore} onChange={e => setMinScore(Number(e.target.value))}
            className="bg-white/10 border border-white/10 rounded-lg px-2 py-1 text-xs text-white">
            {[0,40,50,60,70,80].map(v => <option key={v} value={v}>{v === 0 ? 'Any' : `${v}+`}</option>)}
          </select>
        </div>
        <button onClick={() => setVerifiedOnly(v => !v)}
          className={cn('px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors',
            verifiedOnly ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white/5 text-slate-400 border-white/10 hover:text-white')}>
          Verified Only
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="w-7 h-7 border-2 border-white/20 border-t-white rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-2">
          {workers.map((w: any) => {
            const color = w.trustGradeColor ?? '#4F46E5'
            return (
              <div key={w.id} className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-base font-black text-white shrink-0">
                  {w.firstName[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-semibold text-white truncate">{w.firstName} {w.lastName}</p>
                    {w.verificationStatus === 'FULLY_VERIFIED' && (
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-slate-400">
                    {w.primarySkill}
                    {w.averageRating ? ` · ⭐${w.averageRating.toFixed(1)}` : ''}
                    {` · ${w.totalDeployments} jobs`}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <div className="text-sm font-black" style={{ color }}>
                    {w.trustGrade} {w.trustScore?.toFixed(1)}
                  </div>
                  <div className="text-xs text-slate-500">
                    {w.isAvailable ? '● Available' : '○ Unavailable'}
                  </div>
                </div>
              </div>
            )
          })}
          {workers.length === 0 && (
            <div className="text-center py-16 text-slate-500">No workers found</div>
          )}
        </div>
      )}
    </div>
  )
}
