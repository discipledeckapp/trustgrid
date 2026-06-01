'use client'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { cn, STATUS_COLORS, formatDate, timeAgo } from '@/lib/utils'
import { CheckCircle, XCircle, MessageSquare, User, Building2, ChevronDown, ChevronUp } from 'lucide-react'

export default function ApplicationsPage() {
  const qc = useQueryClient()
  const [typeFilter, setTypeFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('SUBMITTED')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [reviewModal, setReviewModal] = useState<{ id: string; name: string } | null>(null)
  const [decision, setDecision] = useState<'APPROVE' | 'REJECT' | 'NEEDS_MORE_INFO'>('APPROVE')
  const [notes, setNotes] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['applications', typeFilter, statusFilter],
    queryFn: () => api.get('/onboarding/applications', {
      params: { type: typeFilter || undefined, status: statusFilter || undefined, limit: 50 },
    }).then(r => r.data),
  })

  const reviewMutation = useMutation({
    mutationFn: ({ id, ...dto }: any) => api.post(`/onboarding/applications/${id}/review`, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['applications'] })
      setReviewModal(null)
      setNotes('')
    },
  })

  const apps = data?.data ?? []
  const total = data?.pagination?.total ?? 0

  return (
    <div className="p-6 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white">Onboarding Applications</h1>
          <p className="text-slate-400 text-sm">{total} total applications</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-5">
        {['', 'INDIVIDUAL_WORKER', 'ORGANISATION', 'BRANCH'].map(t => (
          <button key={t} onClick={() => setTypeFilter(t)}
            className={cn('px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors',
              typeFilter === t ? 'bg-blue-600 text-white border-blue-600' : 'bg-white/5 text-slate-400 border-white/10 hover:text-white')}>
            {t === '' ? 'All Types' : t.replace(/_/g, ' ')}
          </button>
        ))}
        <div className="w-px bg-white/10 mx-1" />
        {['', 'DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'NEEDS_MORE_INFO', 'APPROVED', 'ACTIVE', 'REJECTED'].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={cn('px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors',
              statusFilter === s ? 'bg-white/20 text-white border-white/30' : 'bg-white/5 text-slate-400 border-white/10 hover:text-white')}>
            {s === '' ? 'All Status' : s.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      {/* Applications list */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="w-7 h-7 border-2 border-white/20 border-t-white rounded-full animate-spin" />
        </div>
      ) : apps.length === 0 ? (
        <div className="text-center py-16 text-slate-500">
          <p>No applications found</p>
        </div>
      ) : (
        <div className="space-y-2">
          {apps.map((app: any) => (
            <div key={app.id} className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
              {/* Header row */}
              <div className="flex items-center gap-4 px-5 py-4">
                <div className={cn('w-9 h-9 rounded-full flex items-center justify-center shrink-0',
                  app.type === 'ORGANISATION' ? 'bg-purple-400/10' : 'bg-blue-400/10')}>
                  {app.type === 'ORGANISATION'
                    ? <Building2 className="w-4 h-4 text-purple-400" />
                    : <User className="w-4 h-4 text-blue-400" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">
                    {app.type === 'ORGANISATION' ? app.organisationName : `${app.firstName ?? ''} ${app.lastName ?? ''}`}
                  </p>
                  <p className="text-xs text-slate-400">
                    {app.type.replace(/_/g, ' ')} · {app.phone} · {timeAgo(app.updatedAt)}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={cn('text-xs font-medium px-2 py-1 rounded-md', STATUS_COLORS[app.status])}>
                    {app.status.replace(/_/g, ' ')}
                  </span>
                  <span className="text-xs text-slate-500">Step {app.stepCompleted}</span>

                  {/* Action buttons for reviewable apps */}
                  {(app.status === 'SUBMITTED' || app.status === 'UNDER_REVIEW') && (
                    <div className="flex gap-1">
                      <button
                        onClick={() => { setReviewModal({ id: app.id, name: app.organisationName ?? `${app.firstName} ${app.lastName}` }); setDecision('APPROVE') }}
                        className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 transition-colors"
                        title="Approve">
                        <CheckCircle className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => { setReviewModal({ id: app.id, name: app.organisationName ?? `${app.firstName} ${app.lastName}` }); setDecision('NEEDS_MORE_INFO') }}
                        className="p-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 transition-colors"
                        title="Request more info">
                        <MessageSquare className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => { setReviewModal({ id: app.id, name: app.organisationName ?? `${app.firstName} ${app.lastName}` }); setDecision('REJECT') }}
                        className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                        title="Reject">
                        <XCircle className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  <button onClick={() => setExpanded(expanded === app.id ? null : app.id)}
                    className="p-1 text-slate-400 hover:text-white transition-colors">
                    {expanded === app.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Expanded detail */}
              {expanded === app.id && (
                <div className="px-5 pb-4 border-t border-white/5 pt-3">
                  <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs">
                    {[
                      ['Application ID', app.id],
                      ['Primary Skill', app.primarySkill ?? '—'],
                      ['Submitted', formatDate(app.updatedAt)],
                      ['Email', app.email ?? '—'],
                      ['Review notes', app.reviewNotes ?? '—'],
                      ['Rejection reason', app.rejectionReason ?? '—'],
                    ].map(([label, value]) => (
                      <div key={label} className="flex gap-2">
                        <span className="text-slate-500 w-28 shrink-0">{label}</span>
                        <span className="text-slate-300 truncate">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Review Modal */}
      {reviewModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 w-full max-w-md">
            <h3 className="font-bold text-white mb-1">
              {decision === 'APPROVE' ? 'Approve' : decision === 'REJECT' ? 'Reject' : 'Request more info'} Application
            </h3>
            <p className="text-slate-400 text-sm mb-4">{reviewModal.name}</p>

            {/* Decision selector */}
            <div className="flex gap-2 mb-4">
              {(['APPROVE', 'NEEDS_MORE_INFO', 'REJECT'] as const).map(d => (
                <button key={d} onClick={() => setDecision(d)}
                  className={cn('flex-1 py-2 rounded-lg text-xs font-medium border transition-colors',
                    decision === d
                      ? d === 'APPROVE' ? 'bg-emerald-600 border-emerald-600 text-white'
                        : d === 'REJECT' ? 'bg-red-600 border-red-600 text-white'
                        : 'bg-amber-600 border-amber-600 text-white'
                      : 'bg-white/5 border-white/10 text-slate-400 hover:text-white')}>
                  {d.replace(/_/g, ' ')}
                </button>
              ))}
            </div>

            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3}
              placeholder={decision === 'NEEDS_MORE_INFO' ? 'What information is needed?' : decision === 'REJECT' ? 'Reason for rejection...' : 'Optional approval notes...'}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-white/30 resize-none mb-4" />

            <div className="flex gap-3">
              <button onClick={() => { setReviewModal(null); setNotes('') }}
                className="flex-1 border border-white/10 text-slate-300 py-2.5 rounded-xl text-sm font-medium hover:bg-white/5">
                Cancel
              </button>
              <button
                disabled={reviewMutation.isPending}
                onClick={() => reviewMutation.mutate({ id: reviewModal.id, decision, notes: notes || undefined })}
                className={cn('flex-1 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-60 transition-colors',
                  decision === 'APPROVE' ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : decision === 'REJECT' ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-amber-600 hover:bg-amber-700 text-white')}>
                {reviewMutation.isPending ? 'Saving...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
