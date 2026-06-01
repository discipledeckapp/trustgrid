'use client'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { api } from '@/lib/api'
import {
  Users, ShieldCheck, Star, AlertTriangle,
  ArrowRight, RefreshCw, Zap,
} from 'lucide-react'
import { cn, timeAgo } from '@/lib/utils'
import { EmergencyModal } from '@/components/ui/emergency-modal'

export default function DashboardPage() {
  const [showEmergency, setShowEmergency] = useState(false)
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => api.get('/analytics/dashboard').then(r => r.data),
    staleTime: 2 * 60 * 1000,
  })

  const { data: dist } = useQuery({
    queryKey: ['trust-dist'],
    queryFn: () => api.get('/analytics/trust-distribution').then(r => r.data),
    staleTime: 5 * 60 * 1000,
  })

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-96">
      <div className="flex flex-col items-center gap-3">
        <div className="animate-spin w-10 h-10 border-2 border-blue-700 border-t-transparent rounded-full" />
        <p className="text-sm text-gray-500">Loading your dashboard...</p>
      </div>
    </div>
  )

  const w  = data?.workforce        ?? {}
  const sr = data?.serviceRequests  ?? {}
  const inc = data?.incidents       ?? {}
  const topWorkers = data?.topWorkers ?? []
  const activity = data?.recentActivity ?? []

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="max-w-6xl mx-auto p-6 pb-16">
      {showEmergency && <EmergencyModal onClose={() => setShowEmergency(false)} />}

      {/* ── Greeting ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-gray-900">{greeting} 👋</h1>
          <p className="text-gray-500 mt-1">
            Here's what's happening with your workforce today.
            {inc.openCount > 0 && (
              <span className="text-red-600 font-semibold">
                {' '}· {inc.openCount} incident{inc.openCount !== 1 ? 's' : ''} need attention.
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowEmergency(true)}
            className="flex items-center gap-1.5 bg-red-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-red-700 transition-colors shadow-sm"
          >
            <Zap className="w-4 h-4" /> Emergency
          </button>
          <button onClick={() => refetch()}
            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors">
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* ── Headline metrics ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          {
            icon: Users,
            value: w.totalWorkers ?? 0,
            label: 'Total Workers',
            sub: `${w.availableWorkers ?? 0} available now`,
            color: 'text-blue-700',
            bg: 'bg-blue-50 border-blue-100',
            iconBg: 'bg-blue-100',
          },
          {
            icon: ShieldCheck,
            value: `${w.verifiedPercentage ?? 0}%`,
            label: 'Verified',
            sub: `${w.verifiedWorkers ?? 0} identity-confirmed`,
            color: 'text-emerald-700',
            bg: 'bg-emerald-50 border-emerald-100',
            iconBg: 'bg-emerald-100',
          },
          {
            icon: Star,
            value: w.averageTrustScore ?? 0,
            label: 'Avg Trust Score',
            sub: 'across registry',
            color: 'text-amber-700',
            bg: 'bg-amber-50 border-amber-100',
            iconBg: 'bg-amber-100',
          },
          {
            icon: AlertTriangle,
            value: inc.openCount ?? 0,
            label: 'Open Incidents',
            sub: inc.criticalOpen > 0 ? `${inc.criticalOpen} critical` : `${inc.resolvedThisMonth} resolved this month`,
            color: inc.openCount > 0 ? 'text-red-700' : 'text-gray-500',
            bg: inc.openCount > 0 ? 'bg-red-50 border-red-100' : 'bg-gray-50 border-gray-100',
            iconBg: inc.openCount > 0 ? 'bg-red-100' : 'bg-gray-100',
          },
        ].map(({ icon: Icon, value, label, sub, color, bg, iconBg }) => (
          <div key={label} className={`rounded-2xl border p-5 ${bg}`}>
            <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center mb-4`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <div className={`text-3xl font-black ${color}`}>{value}</div>
            <div className="text-sm font-semibold text-gray-700 mt-1">{label}</div>
            <div className="text-xs text-gray-400 mt-0.5">{sub}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-5 mb-8">
        {/* ── Service Requests ─────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-gray-900">Service Requests</h2>
            <Link href="/service-requests" className="text-xs text-blue-700 hover:underline font-medium">View all →</Link>
          </div>
          <div className="space-y-3">
            {[
              { label: 'This month', value: sr.totalThisMonth ?? 0, color: 'text-gray-900' },
              { label: 'Completed', value: sr.completedThisMonth ?? 0, color: 'text-emerald-600' },
              { label: 'In progress', value: sr.inProgress ?? 0, color: 'text-amber-600' },
            ].map(({ label, value, color }) => (
              <div key={label} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <span className="text-sm text-gray-500">{label}</span>
                <span className={`text-lg font-black ${color}`}>{value}</span>
              </div>
            ))}
          </div>
          {/* Completion rate bar */}
          <div className="mt-4">
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-gray-400">Completion rate</span>
              <span className="font-bold text-emerald-600">{sr.completionRate ?? 0}%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full transition-all"
                style={{ width: `${sr.completionRate ?? 0}%` }} />
            </div>
          </div>
        </div>

        {/* ── Trust Distribution ──────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-gray-900">Trust Distribution</h2>
            <Link href="/analytics" className="text-xs text-blue-700 hover:underline font-medium">Details →</Link>
          </div>
          {dist?.distribution ? (
            <div className="space-y-2.5">
              {dist.distribution.map((item: any) => {
                const colors: Record<string, string> = {
                  '90-100': 'bg-emerald-500', '80-89': 'bg-emerald-400',
                  '70-79': 'bg-teal-400', '60-69': 'bg-amber-400',
                  '50-59': 'bg-orange-400', '0-49': 'bg-red-400',
                }
                return (
                  <div key={item.range} className="flex items-center gap-3">
                    <span className="text-xs text-gray-500 w-12 shrink-0">{item.range}</span>
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${colors[item.range] ?? 'bg-gray-400'}`}
                        style={{ width: `${item.percentage}%` }} />
                    </div>
                    <span className="text-xs font-semibold text-gray-700 w-8 text-right">{item.count}</span>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-sm text-gray-400">No data yet</p>
          )}
        </div>

        {/* ── Recent Activity ──────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-bold text-gray-900 mb-5">Recent Activity</h2>
          {activity.length === 0 ? (
            <p className="text-sm text-gray-400">No recent activity</p>
          ) : (
            <div className="space-y-3">
              {activity.slice(0, 6).map((e: any) => {
                const label = e.eventType
                  .replace(/_/g, ' ').toLowerCase()
                  .replace(/\b\w/g, (c: string) => c.toUpperCase())
                return (
                  <div key={e.id} className="flex items-start gap-3">
                    <div className={cn(
                      'w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold',
                      e.delta >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600',
                    )}>
                      {e.delta >= 0 ? '+' : '−'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-700 leading-snug">
                        <span className="font-semibold">{label}</span>
                        {e.workerName && <span className="text-gray-500"> — {e.workerName}</span>}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">{timeAgo(e.createdAt)}</p>
                    </div>
                    <span className={`text-xs font-bold shrink-0 ${e.delta >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                      {e.delta >= 0 ? '+' : ''}{e.delta.toFixed(1)}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Top Workers ─────────────────────────────────────────────────── */}
      {topWorkers.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-bold text-gray-900">Your Most Trusted Workers</h2>
              <p className="text-sm text-gray-500 mt-0.5">Ranked by trust score — your community's top performers</p>
            </div>
            <Link href="/workers?sortBy=trustScore&sortOrder=desc"
              className="flex items-center gap-1 text-sm text-blue-700 hover:underline font-medium">
              See all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {topWorkers.slice(0, 5).map((w: any, i: number) => {
              const gradeColor = w.trustGradeColor ?? '#64748B'
              return (
                <Link key={w.id} href={`/workers/${w.id}`}>
                  <div className="flex flex-col items-center p-4 rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-sm transition-all text-center group">
                    {/* Rank */}
                    <div className={cn(
                      'text-xs font-black mb-2',
                      i === 0 ? 'text-amber-500' : i === 1 ? 'text-gray-500' : i === 2 ? 'text-amber-700' : 'text-gray-300',
                    )}>
                      {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                    </div>
                    {/* Avatar */}
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-xl font-black text-blue-700 mb-3 group-hover:scale-105 transition-transform">
                      {(w.name ?? w.firstName ?? '?')[0]}
                    </div>
                    <p className="text-sm font-bold text-gray-900 leading-tight truncate w-full">
                      {w.name ?? `${w.firstName} ${w.lastName}`}
                    </p>
                    <p className="text-xs text-gray-500 mb-3 truncate w-full">{w.primarySkill}</p>
                    {/* Score */}
                    <div className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold"
                      style={{ backgroundColor: `${gradeColor}18`, color: gradeColor }}>
                      {w.trustGrade} · {w.trustScore?.toFixed(1)}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
