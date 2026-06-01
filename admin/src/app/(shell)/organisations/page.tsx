'use client'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Building2, CheckCircle, AlertTriangle } from 'lucide-react'
import { cn, STATUS_COLORS, timeAgo } from '@/lib/utils'

export default function AdminOrganisationsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-orgs'],
    queryFn: () => api.get('/vendors', { params: { limit: 50 } }).then(r => r.data),
    retry: false,
  })

  const orgs = data?.data ?? []
  const total = data?.pagination?.total ?? 0

  return (
    <div className="p-6 max-w-5xl">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-white">Organisations</h1>
        <p className="text-slate-400 text-sm mt-0.5">{total} registered service organisations</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="w-7 h-7 border-2 border-white/20 border-t-white rounded-full animate-spin" />
        </div>
      ) : orgs.length === 0 ? (
        <div className="text-center py-16 text-slate-500">No organisations registered yet</div>
      ) : (
        <div className="space-y-3">
          {orgs.map((org: any) => (
            <div key={org.id} className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/20 flex items-center justify-center text-xl font-black text-purple-300 shrink-0">
                  {org.companyName?.[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-bold text-white">{org.companyName}</p>
                    <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full',
                      org.verificationStatus === 'FULLY_VERIFIED' || org.verificationStatus === 'PARTIALLY_VERIFIED'
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'bg-slate-500/20 text-slate-400')}>
                      {org.verificationStatus?.replace(/_/g,' ')}
                    </span>
                    {org.isBlacklisted && (
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-red-500/20 text-red-400">
                        Blacklisted
                      </span>
                    )}
                  </div>
                  <p className="text-slate-400 text-xs mt-0.5">
                    {org.phone}
                    {org.serviceCategories?.length ? ` · ${org.serviceCategories.slice(0,3).join(', ')}` : ''}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-lg font-black text-purple-400">{(org.trustScore ?? 0).toFixed(1)}</div>
                  <div className="text-xs text-slate-500">{org.totalContracts ?? 0} contracts</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
