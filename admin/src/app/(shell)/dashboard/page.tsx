'use client'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Building2, Users, Shield, BadgeCheck, CreditCard, TrendingUp, AlertTriangle, ClipboardList } from 'lucide-react'
import { cn, STATUS_COLORS, timeAgo, formatDate } from '@/lib/utils'

const PLAN_MRR: Record<string, number> = {
  STARTER:    9900,
  GROWTH:     29900,
  ENTERPRISE: 99900,
}

export default function AdminDashboardPage() {
  // Try /admin/stats first; fall back to /institutions?limit=10
  const { data: adminStats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => api.get('/admin/stats').then(r => r.data),
    retry: false,
  })

  const { data: institutionsPage } = useQuery({
    queryKey: ['admin-institutions-dash'],
    queryFn: () => api.get('/institutions?limit=10').then(r => r.data),
    retry: false,
    enabled: !adminStats,
  })

  const { data: apps } = useQuery({
    queryKey: ['admin-apps'],
    queryFn: () => api.get('/onboarding/applications?limit=5').then(r => r.data),
    retry: false,
  })

  // Normalise: if adminStats is present use it, else derive from institutionsPage
  const institutions: any[] = adminStats?.recentInstitutions
    ?? (Array.isArray(institutionsPage?.data) ? institutionsPage.data : [])

  const totalInstitutions = adminStats?.totalInstitutions ?? institutionsPage?.total ?? institutions.length
  const totalWorkers      = adminStats?.totalWorkers      ?? '—'
  const totalVerified     = adminStats?.totalVerifiedWorkers ?? '—'
  const totalPassports    = adminStats?.totalPassports    ?? '—'
  const activeSubscriptions = adminStats?.activeSubscriptions ?? institutions.filter((i: any) => i.subscriptionStatus === 'ACTIVE').length
  const mrr = adminStats?.mrr
    ?? institutions.reduce((sum: number, i: any) => {
         if (i.subscriptionStatus !== 'ACTIVE') return sum
         return sum + (PLAN_MRR[i.subscriptionPlan] ?? 0)
       }, 0)

  const stats = [
    { label: 'Total Institutions',    value: totalInstitutions,   icon: Building2,   color: 'text-indigo-400',  bg: 'bg-indigo-400/10' },
    { label: 'Total Workers',         value: totalWorkers,         icon: Users,       color: 'text-blue-400',    bg: 'bg-blue-400/10' },
    { label: 'Verified Workers',      value: totalVerified,        icon: BadgeCheck,  color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
    { label: 'Trust Passports Issued',value: totalPassports,       icon: Shield,      color: 'text-cyan-400',    bg: 'bg-cyan-400/10' },
    { label: 'Active Subscriptions',  value: activeSubscriptions,  icon: CreditCard,  color: 'text-purple-400',  bg: 'bg-purple-400/10' },
    {
      label: 'MRR (₦)',
      value: typeof mrr === 'number'
        ? `₦${(mrr / 100).toLocaleString('en-NG')}`
        : '—',
      icon: TrendingUp,
      color: 'text-amber-400',
      bg: 'bg-amber-400/10',
    },
  ]

  const recentInstitutions = institutions.slice(0, 5)

  const pending = (apps?.data ?? []).filter((a: any) => a.status === 'SUBMITTED' || a.status === 'UNDER_REVIEW')

  return (
    <div className="p-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-white">Platform Overview</h1>
        <p className="text-slate-400 text-sm mt-0.5">
          TrustGrid Super Admin —{' '}
          {new Date().toLocaleDateString('en-NG', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
      </div>

      {/* Platform Stats — 3-column grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white/5 border border-white/10 rounded-xl p-5">
            <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center mb-3', bg)}>
              <Icon className={cn('w-5 h-5', color)} />
            </div>
            <p className={cn('text-2xl font-bold', color)}>{value}</p>
            <p className="text-slate-400 text-xs mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Recent Institutions table */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-5 mb-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-white text-sm">Recent Institutions</h2>
          <a href="/institutions" className="text-xs text-blue-400 hover:underline">View all →</a>
        </div>

        {recentInstitutions.length === 0 ? (
          <p className="text-slate-500 text-sm">No institution data available</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 text-xs border-b border-white/5">
                  <th className="pb-3 pr-4 font-medium">Name</th>
                  <th className="pb-3 pr-4 font-medium">Type</th>
                  <th className="pb-3 pr-4 font-medium">Plan</th>
                  <th className="pb-3 pr-4 font-medium text-right">Workers</th>
                  <th className="pb-3 pr-4 font-medium text-right">Verified%</th>
                  <th className="pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {recentInstitutions.map((inst: any) => {
                  const total    = inst.workerCount ?? inst._count?.workers ?? 0
                  const verified = inst.verifiedWorkerCount ?? inst._count?.verifiedWorkers ?? 0
                  const pct      = total > 0 ? Math.round((verified / total) * 100) : 0
                  const active   = inst.subscriptionStatus === 'ACTIVE' || inst.isActive || inst.isVerified

                  return (
                    <tr key={inst.id} className="text-slate-300">
                      <td className="py-2.5 pr-4">
                        <span className="font-medium text-white">{inst.name}</span>
                      </td>
                      <td className="py-2.5 pr-4 text-slate-400 text-xs">
                        {inst.type?.replace(/_/g, ' ') ?? '—'}
                      </td>
                      <td className="py-2.5 pr-4">
                        {inst.subscriptionPlan ? (
                          <span className="text-xs bg-purple-400/10 text-purple-300 px-2 py-0.5 rounded-md">
                            {inst.subscriptionPlan}
                          </span>
                        ) : (
                          <span className="text-slate-600 text-xs">—</span>
                        )}
                      </td>
                      <td className="py-2.5 pr-4 text-right text-slate-300">{total || '—'}</td>
                      <td className="py-2.5 pr-4 text-right">
                        {total > 0 ? (
                          <span className={cn('text-xs font-medium', pct >= 80 ? 'text-emerald-400' : pct >= 50 ? 'text-amber-400' : 'text-red-400')}>
                            {pct}%
                          </span>
                        ) : (
                          <span className="text-slate-600 text-xs">—</span>
                        )}
                      </td>
                      <td className="py-2.5">
                        <span className={cn(
                          'text-xs font-medium px-2 py-0.5 rounded-md',
                          active ? 'bg-emerald-400/10 text-emerald-400' : 'bg-red-400/10 text-red-400',
                        )}>
                          {active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Bottom row */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Pending Applications */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-white text-sm">Pending Applications</h2>
            {pending.length > 0 && (
              <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full">
                {pending.length} waiting
              </span>
            )}
          </div>
          {pending.length === 0 ? (
            <p className="text-slate-500 text-sm">No pending applications</p>
          ) : (
            <div className="space-y-3">
              {pending.slice(0, 5).map((app: any) => (
                <div key={app.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                  <div>
                    <p className="text-sm text-white font-medium">
                      {app.type === 'ORGANISATION' ? app.organisationName : `${app.firstName} ${app.lastName}`}
                    </p>
                    <p className="text-xs text-slate-400">
                      {app.type.replace(/_/g, ' ')} · {timeAgo(app.updatedAt)}
                    </p>
                  </div>
                  <span className={cn('text-xs font-medium px-2 py-0.5 rounded-md', STATUS_COLORS[app.status])}>
                    {app.status.replace(/_/g, ' ')}
                  </span>
                </div>
              ))}
            </div>
          )}
          <a href="/applications" className="block mt-4 text-xs text-blue-400 hover:underline">
            View all applications →
          </a>
        </div>

        {/* Quick Actions */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-5">
          <h2 className="font-semibold text-white text-sm mb-4">Quick Actions</h2>
          <div className="space-y-2">
            {[
              { label: 'Review pending worker applications',    href: '/applications?type=INDIVIDUAL_WORKER&status=SUBMITTED', color: 'text-blue-400' },
              { label: 'Review organisation registrations',     href: '/applications?type=ORGANISATION&status=SUBMITTED',     color: 'text-purple-400' },
              { label: 'View all institutions',                 href: '/institutions',  color: 'text-emerald-400' },
              { label: 'Trust Passports',                       href: '/passports',     color: 'text-cyan-400' },
            ].map(({ label, href, color }) => (
              <a key={href} href={href}
                className="flex items-center gap-2 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-sm">
                <span className={cn('w-1.5 h-1.5 rounded-full', color.replace('text-', 'bg-'))} />
                <span className="text-slate-300">{label}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
