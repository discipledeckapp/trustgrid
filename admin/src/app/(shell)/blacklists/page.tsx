'use client'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { ShieldOff, User, Building2 } from 'lucide-react'
import { timeAgo } from '@/lib/utils'

export default function GlobalBlacklistPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-global-blacklist'],
    queryFn: () => api.get('/admin/blacklists?limit=100').then(r => r.data),
    retry: false,
  })

  const workers: any[] = data?.data ?? []
  const total: number = data?.pagination?.total ?? 0

  return (
    <div className="p-6 max-w-5xl">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <ShieldOff className="w-5 h-5 text-red-400" /> Global Blacklist Report
        </h1>
        <p className="text-slate-400 text-sm mt-0.5">
          All suspended workers across all institutions — {total} total
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="w-7 h-7 border-2 border-red-400/40 border-t-red-400 rounded-full animate-spin" />
        </div>
      ) : workers.length === 0 ? (
        <div className="text-center py-20 text-slate-500">
          <ShieldOff className="w-10 h-10 mx-auto mb-3 opacity-20" />
          <p>No blacklisted workers across the platform</p>
        </div>
      ) : (
        <div className="space-y-2">
          {workers.map((w: any) => (
            <div key={w.id} className="bg-white/3 border border-white/8 rounded-xl p-4 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center shrink-0">
                <User className="w-5 h-5 text-red-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-white text-sm">{w.name}</span>
                  <span className="text-[10px] bg-red-500/20 text-red-300 border border-red-500/20 px-2 py-0.5 rounded-full font-bold">SUSPENDED</span>
                  {w.category && w.category !== '—' && (
                    <span className="text-[10px] bg-white/6 text-slate-400 px-2 py-0.5 rounded-full">{w.category}</span>
                  )}
                </div>
                <p className="text-slate-400 text-xs mt-0.5">
                  {w.primarySkill} · Trust {w.trustScore?.toFixed(1)} · {w.institution}
                </p>
                <div className="flex gap-3 mt-0.5 text-xs text-slate-500">
                  {w.phone && <span>{w.phone}</span>}
                  {w.email && <span>{w.email}</span>}
                </div>
                {w.reason && w.reason !== '—' && (
                  <p className="text-xs text-slate-500 mt-1 italic line-clamp-1">&ldquo;{w.reason}&rdquo;</p>
                )}
              </div>
              <span className="text-xs text-slate-600 shrink-0">{timeAgo(w.date)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
