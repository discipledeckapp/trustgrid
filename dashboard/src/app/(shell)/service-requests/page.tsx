'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Plus, Users, Shield } from 'lucide-react'
import { useServiceRequests } from '@/hooks/useApi'
import { cn, STATUS_COLORS, formatDate } from '@/lib/utils'
import type { ServiceRequest } from '@/types'

const STATUSES = ['', 'DRAFT', 'SUBMITTED', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']

export default function ServiceRequestsPage() {
  const [status, setStatus] = useState('')
  const { data, isLoading } = useServiceRequests(status || undefined)
  const requests: ServiceRequest[] = data?.data ?? []

  return (
    <div className="p-6 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Service Requests</h1>
          <p className="text-gray-500 text-sm">{data?.pagination?.total ?? 0} total requests</p>
        </div>
        <Link
          href="/service-requests/create"
          className="flex items-center gap-2 bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-800"
        >
          <Plus className="w-4 h-4" /> New Request
        </Link>
      </div>

      {/* Status filter */}
      <div className="flex flex-wrap gap-2 mb-5">
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors',
              status === s
                ? 'bg-blue-700 text-white border-blue-700'
                : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300',
            )}
          >
            {s === '' ? 'All' : s}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin w-8 h-8 border-2 border-blue-700 border-t-transparent rounded-full" />
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((req) => (
            <Link key={req.id} href={`/service-requests/${req.id}`}>
              <div className="bg-white rounded-xl border border-gray-100 hover:border-blue-200 hover:shadow-sm transition-all p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-gray-900 truncate">{req.title}</span>
                    </div>
                    <p className="text-sm text-gray-500 line-clamp-1">{req.description}</p>
                    <div className="flex items-center gap-4 mt-2.5">
                      <span className="flex items-center gap-1 text-xs text-gray-400">
                        <Users className="w-3.5 h-3.5" /> {req.workersNeeded} workers
                      </span>
                      {req.minimumTrustScore && (
                        <span className="flex items-center gap-1 text-xs text-gray-400">
                          <Shield className="w-3.5 h-3.5" /> Trust ≥ {req.minimumTrustScore}
                        </span>
                      )}
                      <span className="text-xs text-gray-400">{formatDate(req.createdAt)}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <span className={cn('text-xs font-semibold px-2 py-1 rounded-md', STATUS_COLORS[req.status] ?? 'bg-gray-100 text-gray-600')}>
                      {req.status}
                    </span>
                    <span className={cn(
                      'text-xs font-medium',
                      req.priority === 'HIGH' || req.priority === 'CRITICAL' ? 'text-red-500' : 'text-gray-400',
                    )}>
                      {req.priority}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
          {requests.length === 0 && (
            <div className="text-center py-16 text-gray-400">
              <p className="font-medium">No service requests</p>
              <p className="text-sm mt-1">Create your first request to get started</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
