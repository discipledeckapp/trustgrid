'use client'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Building2, Users, Briefcase, ClipboardList, TrendingUp, Shield, AlertTriangle } from 'lucide-react'
import { cn, STATUS_COLORS, timeAgo } from '@/lib/utils'

export default function AdminDashboardPage() {
  // For demo: pull from institution analytics (in prod this would be a /admin/stats endpoint)
  const { data: dash } = useQuery({
    queryKey: ['admin-dash'],
    queryFn: () => api.get('/analytics/dashboard').then(r => r.data),
    retry: false,
  })

  const { data: apps } = useQuery({
    queryKey: ['admin-apps'],
    queryFn: () => api.get('/onboarding/applications?limit=5').then(r => r.data),
    retry: false,
  })

  const stats = [
    { label: 'Total Workers',      value: dash?.workforce?.totalWorkers ?? '—',  icon: Users,        color: 'text-blue-400',    bg: 'bg-blue-400/10' },
    { label: 'Verified Workers',   value: dash?.workforce?.verifiedWorkers ?? '—', icon: Shield,      color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
    { label: 'Open Incidents',     value: dash?.incidents?.openCount ?? '—',      icon: AlertTriangle, color: 'text-red-400',   bg: 'bg-red-400/10' },
    { label: 'Requests This Month', value: dash?.serviceRequests?.totalThisMonth ?? '—', icon: ClipboardList, color: 'text-purple-400', bg: 'bg-purple-400/10' },
  ]

  const pending = (apps?.data ?? []).filter((a: any) => a.status === 'SUBMITTED' || a.status === 'UNDER_REVIEW')

  return (
    <div className="p-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-white">Platform Overview</h1>
        <p className="text-slate-400 text-sm mt-0.5">TrustGrid Super Admin — {new Date().toLocaleDateString('en-NG', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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
              { label: 'Review pending worker applications', href: '/applications?type=INDIVIDUAL_WORKER&status=SUBMITTED', color: 'text-blue-400' },
              { label: 'Review organisation registrations', href: '/applications?type=ORGANISATION&status=SUBMITTED', color: 'text-purple-400' },
              { label: 'View all institutions', href: '/institutions', color: 'text-emerald-400' },
              { label: 'Platform analytics', href: '/dashboard', color: 'text-amber-400' },
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
