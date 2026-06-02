'use client'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Building2, CheckCircle, Clock, Globe, Palette } from 'lucide-react'
import { cn, timeAgo } from '@/lib/utils'

export default function AdminInstitutionsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-institutions'],
    queryFn: () => api.get('/admin/institutions').then(r => r.data),
    retry: false,
  })

  const institutions = data?.data ?? []

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
          {institutions.map((inst: any) => {
            const brand = inst.brandConfig ?? {}
            const subdomain  = inst.subdomain   ?? brand.subdomain   ?? null
            const customDomain = inst.customDomain ?? brand.customDomain ?? null
            const primaryColor = brand.primaryColor ?? null

            return (
              <div key={inst.id} className="bg-white/5 border border-white/10 rounded-2xl p-5">
                <div className="flex items-center gap-4">
                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-xl font-black text-indigo-300 shrink-0">
                    {inst.name?.[0] ?? 'I'}
                  </div>

                  {/* Main info */}
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

                    {/* Community Brand indicators */}
                    {(subdomain || customDomain || primaryColor) && (
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        {/* Brand color swatch */}
                        {primaryColor && (
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-white/20 shrink-0"
                            style={{ backgroundColor: primaryColor }}
                            title={`Brand color: ${primaryColor}`}
                          />
                        )}

                        {/* Subdomain tag */}
                        {subdomain && (
                          <span className="inline-flex items-center gap-1 text-xs bg-white/5 border border-white/10 text-slate-300 px-2 py-0.5 rounded-md font-mono">
                            <Globe className="w-3 h-3 text-slate-500" />
                            {subdomain}.trustgrid.ng
                          </span>
                        )}

                        {/* Custom domain badge */}
                        {customDomain && (
                          <span className="inline-flex items-center gap-1 text-xs bg-cyan-400/10 border border-cyan-400/20 text-cyan-300 px-2 py-0.5 rounded-md">
                            <Globe className="w-3 h-3" />
                            {customDomain}
                          </span>
                        )}

                        {/* White-label indicator when brand is set but no domain yet */}
                        {primaryColor && !subdomain && !customDomain && (
                          <span className="inline-flex items-center gap-1 text-xs bg-purple-400/10 border border-purple-400/20 text-purple-300 px-2 py-0.5 rounded-md">
                            <Palette className="w-3 h-3" />
                            Branded
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Timestamp */}
                  <div className="text-right shrink-0">
                    <p className="text-xs text-slate-500">{inst.createdAt ? timeAgo(inst.createdAt) : '—'}</p>
                  </div>
                </div>
              </div>
            )
          })}
          {institutions.length === 0 && (
            <div className="text-center py-16 text-slate-500">No institutions found</div>
          )}
        </div>
      )}
    </div>
  )
}
