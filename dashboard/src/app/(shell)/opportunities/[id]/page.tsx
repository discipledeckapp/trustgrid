'use client'
import { useParams } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { cn, formatDate } from '@/lib/utils'
import {
  Briefcase, Users, Star, CheckCircle, XCircle, Clock, ArrowLeft,
} from 'lucide-react'
import Link from 'next/link'

const TYPE_LABELS: Record<string, string> = {
  VOLUNTEER:        'Volunteer',
  EMPLOYMENT:       'Employment',
  SERVICE_CONTRACT: 'Service Contract',
  TRAINING:         'Training',
  EVENT_ROLE:       'Event Role',
}

const TYPE_COLORS: Record<string, string> = {
  VOLUNTEER:        'bg-green-100 text-green-700',
  EMPLOYMENT:       'bg-blue-100 text-blue-700',
  SERVICE_CONTRACT: 'bg-purple-100 text-purple-700',
  TRAINING:         'bg-amber-100 text-amber-700',
  EVENT_ROLE:       'bg-pink-100 text-pink-700',
}

const STATUS_COLORS: Record<string, string> = {
  DRAFT:   'bg-gray-100 text-gray-600',
  OPEN:    'bg-emerald-100 text-emerald-700',
  CLOSED:  'bg-red-100 text-red-600',
}

const APP_STATUS_COLORS: Record<string, string> = {
  PENDING:   'bg-amber-100 text-amber-700',
  APPROVED:  'bg-emerald-100 text-emerald-700',
  REJECTED:  'bg-red-100 text-red-600',
  WITHDRAWN: 'bg-gray-100 text-gray-500',
}

export default function OpportunityDetailPage() {
  const params = useParams<{ id: string }>()
  const id = params.id
  const qc = useQueryClient()

  const { data: opp, isLoading } = useQuery({
    queryKey: ['opportunity', id],
    queryFn: () => api.get(`/opportunities/${id}`).then(r => r.data),
    enabled: !!id,
  })

  const { data: appsData, isLoading: appsLoading } = useQuery({
    queryKey: ['opportunity-applications', id],
    queryFn: () => api.get(`/opportunities/${id}/applications`).then(r => r.data),
    enabled: !!id,
  })

  const reviewMutation = useMutation({
    mutationFn: ({ appId, decision }: { appId: string; decision: 'APPROVED' | 'REJECTED' }) =>
      api.patch(`/opportunities/applications/${appId}/review`, { decision }).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['opportunity-applications', id] }),
  })

  const publishMutation = useMutation({
    mutationFn: () => api.patch(`/opportunities/${id}/publish`).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['opportunity', id] }),
  })

  const closeMutation = useMutation({
    mutationFn: () => api.patch(`/opportunities/${id}/close`).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['opportunity', id] }),
  })

  const applications: any[] = appsData?.data ?? appsData ?? []
  const filled = opp?.applicationCount ?? applications.filter((a: any) => a.status === 'APPROVED').length
  const available = opp?.slotsAvailable ?? 0
  const pct = available > 0 ? Math.min(100, Math.round((filled / available) * 100)) : 0

  if (isLoading) {
    return (
      <div className="flex justify-center py-32">
        <div className="animate-spin w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!opp) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
          <Briefcase className="w-10 h-10 text-gray-300 mx-auto mb-4" />
          <p className="font-semibold text-gray-700">Opportunity not found</p>
          <Link href="/opportunities" className="mt-4 text-sm text-indigo-600 font-semibold hover:underline inline-block">
            ← Back to Opportunities
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6 pb-16 space-y-5">
      {/* Breadcrumb */}
      <Link
        href="/opportunities"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-indigo-600 font-medium transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Opportunities
      </Link>

      {/* Header card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center shrink-0">
              <Briefcase className="w-7 h-7 text-indigo-500" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <h1 className="text-xl font-black text-gray-900">{opp.title}</h1>
                <span className={cn('text-xs font-semibold px-2.5 py-1 rounded-full', TYPE_COLORS[opp.type] ?? 'bg-gray-100 text-gray-600')}>
                  {TYPE_LABELS[opp.type] ?? opp.type}
                </span>
                <span className={cn('text-xs font-semibold px-2.5 py-1 rounded-full', STATUS_COLORS[opp.status] ?? 'bg-gray-100 text-gray-500')}>
                  {opp.status}
                </span>
              </div>

              {/* Trust gate & metadata */}
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-gray-600">
                {opp.publishingNodeId && (
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-500">Node:</span>
                    <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded-lg">{opp.publishingNodeId}</span>
                  </span>
                )}
                {opp.location && (
                  <span className="text-gray-500">{opp.location}</span>
                )}
                {opp.startDate && (
                  <span className="text-gray-500">{formatDate(opp.startDate)} – {opp.endDate ? formatDate(opp.endDate) : 'ongoing'}</span>
                )}
              </div>
            </div>
          </div>

          {/* Operator actions */}
          <div className="flex gap-2 shrink-0">
            {opp.status === 'DRAFT' && (
              <button
                onClick={() => publishMutation.mutate()}
                disabled={publishMutation.isPending}
                className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-4 py-2 text-sm font-bold transition-colors disabled:opacity-50"
              >
                <CheckCircle className="w-4 h-4" /> Publish
              </button>
            )}
            {opp.status === 'OPEN' && (
              <button
                onClick={() => closeMutation.mutate()}
                disabled={closeMutation.isPending}
                className="flex items-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-xl px-4 py-2 text-sm font-bold transition-colors disabled:opacity-50"
              >
                <XCircle className="w-4 h-4" /> Close
              </button>
            )}
          </div>
        </div>

        {/* Trust gate criteria */}
        <div className="mt-5 pt-5 border-t border-gray-50 grid sm:grid-cols-3 gap-4">
          <div className="bg-indigo-50 rounded-xl p-4 flex items-center gap-3">
            <Star className="w-5 h-5 text-indigo-500 shrink-0" />
            <div>
              <p className="text-xs text-indigo-600 font-semibold">Min Trust Score</p>
              <p className="text-lg font-black text-indigo-800">{opp.minTrustScore ?? '—'}</p>
            </div>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 flex items-center gap-3">
            <Users className="w-5 h-5 text-gray-500 shrink-0" />
            <div>
              <p className="text-xs text-gray-500 font-semibold">Slots</p>
              <p className="text-lg font-black text-gray-800">{filled} <span className="text-sm font-normal text-gray-500">/ {available}</span></p>
            </div>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-gray-500 shrink-0" />
            <div>
              <p className="text-xs text-gray-500 font-semibold">No Open Incidents</p>
              <p className="text-sm font-bold text-gray-800">{opp.noOpenIncidentsRequired ? 'Required' : 'Not required'}</p>
            </div>
          </div>
        </div>

        {/* Slots progress bar */}
        <div className="mt-4">
          <div className="flex justify-between text-xs text-gray-500 mb-1.5">
            <span>{filled} filled</span>
            <span>{available - filled} remaining</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${pct}%`,
                background: pct >= 100 ? '#ef4444' : 'linear-gradient(90deg, #6366f1, #8b5cf6)',
              }}
            />
          </div>
        </div>

        {/* Required skills */}
        {opp.requiredSkills?.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {opp.requiredSkills.map((skill: string) => (
              <span key={skill} className="text-xs font-medium bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full border border-indigo-100">
                {skill}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Description */}
      {opp.description && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-sm font-black text-gray-700 uppercase tracking-wider mb-3">Description</h2>
          <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{opp.description}</p>
        </div>
      )}

      {/* Applications */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-sm font-black text-gray-700 uppercase tracking-wider mb-4">
          Applications
          {!appsLoading && (
            <span className="ml-2 text-xs font-bold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
              {applications.length}
            </span>
          )}
        </h2>

        {appsLoading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full" />
          </div>
        ) : applications.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <Users className="w-8 h-8 mx-auto mb-3 text-gray-200" />
            <p className="text-sm font-medium">No applications yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {applications.map((app: any) => (
              <div
                key={app.id}
                className="flex items-center gap-4 px-4 py-3 rounded-xl border border-gray-100 hover:border-indigo-100 hover:bg-indigo-50/30 transition-colors"
              >
                {/* Avatar */}
                <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center text-sm font-black text-indigo-700 shrink-0">
                  {(app.userId ?? app.id ?? '?')[0]?.toUpperCase()}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm truncate">
                    {app.userId ?? 'Unknown applicant'}
                  </p>
                  <p className="text-xs text-gray-400">
                    Applied {app.appliedAt ? formatDate(app.appliedAt) : app.createdAt ? formatDate(app.createdAt) : '—'}
                  </p>
                </div>

                {/* Status badge */}
                <span className={cn(
                  'text-xs font-semibold px-2.5 py-1 rounded-full',
                  APP_STATUS_COLORS[app.status] ?? 'bg-gray-100 text-gray-500',
                )}>
                  {app.status ?? '—'}
                </span>

                {/* Approve / Reject */}
                {app.status === 'PENDING' && (
                  <div className="flex gap-1.5 shrink-0">
                    <button
                      onClick={() => reviewMutation.mutate({ appId: app.id, decision: 'APPROVED' })}
                      disabled={reviewMutation.isPending}
                      className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl transition-colors disabled:opacity-50"
                      title="Approve"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => reviewMutation.mutate({ appId: app.id, decision: 'REJECTED' })}
                      disabled={reviewMutation.isPending}
                      className="p-1.5 bg-red-50 hover:bg-red-100 text-red-500 border border-red-200 rounded-xl transition-colors disabled:opacity-50"
                      title="Reject"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
