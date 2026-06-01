'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Plus, AlertTriangle } from 'lucide-react'
import { useIncidents } from '@/hooks/useApi'
import { cn, STATUS_COLORS, formatDate } from '@/lib/utils'
import type { Incident } from '@/types'

export default function IncidentsPage() {
  const [status, setStatus] = useState('')
  const { data, isLoading } = useIncidents(status || undefined)
  const incidents: Incident[] = data?.data ?? []

  const SEV_COLORS: Record<string, string> = {
    LOW: 'text-blue-600', MEDIUM: 'text-amber-600',
    HIGH: 'text-orange-600', CRITICAL: 'text-red-600',
  }

  return (
    <div className="p-6 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Incidents</h1>
          <p className="text-gray-500 text-sm">{data?.pagination?.total ?? 0} total</p>
        </div>
        <Link
          href="/incidents/report"
          className="flex items-center gap-2 bg-red-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-red-700"
        >
          <Plus className="w-4 h-4" /> Report Incident
        </Link>
      </div>

      <div className="flex gap-2 mb-5">
        {['', 'OPEN', 'UNDER_INVESTIGATION', 'RESOLVED', 'DISMISSED'].map((s) => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors',
              status === s ? 'bg-blue-700 text-white border-blue-700' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300',
            )}
          >
            {s === '' ? 'All' : s.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin w-8 h-8 border-2 border-blue-700 border-t-transparent rounded-full" />
        </div>
      ) : (
        <div className="space-y-3">
          {incidents.map((inc) => (
            <div key={inc.id} className="bg-white rounded-xl border border-gray-100 p-5">
              <div className="flex items-start justify-between">
                <div className="flex gap-3">
                  <AlertTriangle className={cn('w-5 h-5 mt-0.5 shrink-0', SEV_COLORS[inc.severity] ?? 'text-gray-400')} />
                  <div>
                    <p className="font-semibold text-gray-900">{inc.title}</p>
                    {inc.worker && (
                      <p className="text-sm text-gray-500 mt-0.5">
                        Worker: {inc.worker.user.firstName} {inc.worker.user.lastName}
                      </p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">{formatDate(inc.incidentDate)}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={cn('text-xs font-semibold px-2 py-1 rounded-md', STATUS_COLORS[inc.status] ?? 'bg-gray-100 text-gray-600')}>
                    {inc.status.replace(/_/g, ' ')}
                  </span>
                  <span className={cn('text-xs font-medium', SEV_COLORS[inc.severity])}>
                    {inc.severity}
                  </span>
                </div>
              </div>
            </div>
          ))}
          {incidents.length === 0 && (
            <div className="text-center py-16 text-gray-400">
              <p className="font-medium">No incidents</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
