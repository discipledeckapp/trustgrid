'use client'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Building2, CheckCircle, Clock } from 'lucide-react'
import { cn, timeAgo } from '@/lib/utils'

export default function AdminInstitutionsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-institutions'],
    // In production this would be GET /admin/institutions (platform-level)
    // For now we surface what the authenticated institution can see
    queryFn: () => api.get('/institution').then(r => [r.data]),
    retry: false,
  })

  const institutions = Array.isArray(data) ? data : []

  return (
    <div className="p-6 max-w-5xl">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-white">Institutions</h1>
        <p className="text-slate-400 text-sm mt-0.5">All registered institutions on the platform</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="w-7 h-7 border-2 border-white/20 border-t-white rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-3">
          {institutions.map((inst: any) => (
            <div key={inst.id} className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-xl font-black text-indigo-300 shrink-0">
                  {inst.name?.[0] ?? 'I'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-bold text-white truncate">{inst.name}</p>
                    {inst.isVerified ? (
                      <span className="inline-flex items-center gap-1 text-xs text-emerald-400 font-medium">
                        <CheckCircle className="w-3 h-3" /> Verified
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs text-amber-400 font-medium">
                        <Clock className="w-3 h-3" /> Pending
                      </span>
                    )}
                  </div>
                  <p className="text-slate-400 text-xs mt-0.5">
                    {inst.type?.replace(/_/g,' ')} · {inst.country} · {inst.email}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-slate-500">{inst.createdAt ? timeAgo(inst.createdAt) : '—'}</p>
                </div>
              </div>
            </div>
          ))}
          {institutions.length === 0 && (
            <div className="text-center py-16 text-slate-500">No institutions found</div>
          )}
        </div>
      )}
    </div>
  )
}
