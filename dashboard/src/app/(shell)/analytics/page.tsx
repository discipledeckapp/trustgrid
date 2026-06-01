'use client'
import { useTrustDistribution, useDashboard } from '@/hooks/useApi'

const GRADE_LABELS: Record<string, string> = {
  '90-100': 'A+ Exceptional',
  '80-89':  'A  Excellent',
  '70-79':  'B+ Good',
  '60-69':  'B  Satisfactory',
  '50-59':  'C  Fair',
  '0-49':   'D/F Below Average',
}

const GRADE_COLORS: Record<string, string> = {
  '90-100': '#10B981',
  '80-89':  '#34D399',
  '70-79':  '#6EE7B7',
  '60-69':  '#FCD34D',
  '50-59':  '#F59E0B',
  '0-49':   '#EF4444',
}

export default function AnalyticsPage() {
  const { data: dist, isLoading: distLoading } = useTrustDistribution()
  const { data: dashboard } = useDashboard()

  if (distLoading) {
    return (
      <div className="p-8 flex justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-blue-700 border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="p-6 max-w-5xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Analytics</h1>

      <div className="grid md:grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Workforce',     value: dist?.workforce ?? 0 },
          { label: 'Avg Score',     value: dist?.averageScore ?? 0 },
          { label: 'Median Score',  value: dist?.medianScore ?? 0 },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-100 p-5 text-center">
            <p className="text-3xl font-bold text-blue-700">{value}</p>
            <p className="text-sm text-gray-500 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Trust Distribution */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 mb-5">
        <h2 className="font-semibold text-gray-900 mb-5">Trust Score Distribution</h2>
        <div className="space-y-3">
          {dist?.distribution.map((item) => (
            <div key={item.range} className="flex items-center gap-4">
              <div className="w-32 shrink-0">
                <p className="text-xs font-medium text-gray-700">{GRADE_LABELS[item.range] ?? item.range}</p>
              </div>
              <div className="flex-1 relative h-7 bg-gray-50 rounded-md overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 rounded-md transition-all"
                  style={{
                    width: `${item.percentage}%`,
                    backgroundColor: GRADE_COLORS[item.range] ?? '#94A3B8',
                    opacity: 0.7,
                  }}
                />
              </div>
              <div className="w-24 shrink-0 text-right">
                <span className="text-sm text-gray-600 font-medium">{item.count}</span>
                <span className="text-xs text-gray-400 ml-1">({item.percentage.toFixed(1)}%)</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Service metrics */}
      {dashboard && (
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h2 className="font-semibold text-gray-900 mb-4">Service Requests (this month)</h2>
            <div className="space-y-3">
              {[
                ['Total',       dashboard.serviceRequests.totalThisMonth],
                ['Completed',   dashboard.serviceRequests.completedThisMonth],
                ['In progress', dashboard.serviceRequests.inProgress],
                ['Completion rate', `${dashboard.serviceRequests.completionRate}%`],
              ].map(([label, val]) => (
                <div key={String(label)} className="flex justify-between text-sm">
                  <span className="text-gray-500">{label}</span>
                  <span className="font-semibold">{val}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h2 className="font-semibold text-gray-900 mb-4">Incidents</h2>
            <div className="space-y-3">
              {[
                ['Open',              dashboard.incidents.openCount],
                ['Resolved (month)', dashboard.incidents.resolvedThisMonth],
                ['Critical open',    dashboard.incidents.criticalOpen],
              ].map(([label, val]) => (
                <div key={String(label)} className="flex justify-between text-sm">
                  <span className="text-gray-500">{label}</span>
                  <span className="font-semibold">{val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
