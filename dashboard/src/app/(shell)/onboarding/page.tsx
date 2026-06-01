'use client'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { cn, STATUS_COLORS, timeAgo } from '@/lib/utils'
import { CheckCircle, XCircle, MessageSquare, User, Building2, Share2, ChevronDown, ChevronUp, Clock, Zap, Copy, Sparkles } from 'lucide-react'

export default function OnboardingPage() {
  const qc = useQueryClient()
  const [typeFilter, setTypeFilter]     = useState('')
  const [statusFilter, setStatusFilter] = useState('SUBMITTED')
  const [expanded, setExpanded]         = useState<string|null>(null)
  const [reviewModal, setReviewModal]   = useState<{id:string;name:string}|null>(null)
  const [decision, setDecision]         = useState<'APPROVE'|'REJECT'|'NEEDS_MORE_INFO'>('APPROVE')
  const [notes, setNotes]               = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['onboarding-apps', typeFilter, statusFilter],
    queryFn: () => api.get('/onboarding/applications', {
      params: { type: typeFilter||undefined, status: statusFilter||undefined, limit: 50 },
    }).then(r => r.data),
  })

  const { data: inst } = useQuery({
    queryKey: ['institution'],
    queryFn: () => api.get('/institution').then(r => r.data),
  })

  const reviewMutation = useMutation({
    mutationFn: ({ id, ...dto }: any) => api.post(`/onboarding/applications/${id}/review`, dto).then(r => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['onboarding-apps'] }); setReviewModal(null); setNotes('') },
  })

  const seedHierarchyMutation = useMutation({
    mutationFn: () => api.post('/community/node-types/seed/rccg').then(r => r.data),
  })

  const seedRolesMutation = useMutation({
    mutationFn: () => api.post('/authority/roles/seed/rccg').then(r => r.data),
  })

  const apps     = data?.data ?? []
  const pending  = apps.filter((a: any) => ['SUBMITTED','UNDER_REVIEW'].includes(a.status)).length
  const origin   = typeof window !== 'undefined' ? window.location.origin : 'https://app.trustgrid.ng'
  const iid      = inst?.id ?? ''
  const subdomain = inst?.subdomain ?? null
  const joinLink  = subdomain
    ? `https://${subdomain}.trustgrid.ng/join`
    : 'https://app.trustgrid.ng/join'

  return (
    <div className="max-w-5xl mx-auto p-6 pb-16">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-gray-900">Onboarding Applications</h1>
        <p className="text-gray-500 mt-0.5">
          {pending > 0 ? (
            <span className="text-amber-600 font-semibold">{pending} application{pending!==1?'s':''} waiting for your review</span>
          ) : 'All applications are up to date'}
        </p>
      </div>

      {/* Community-First banner */}
      <div className="bg-white rounded-2xl border border-indigo-100 shadow-sm p-6 mb-6">
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
            style={{ background: 'linear-gradient(135deg, #eef2ff, #ede9fe)' }}>
            <Sparkles className="w-5 h-5 text-indigo-500" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-black text-gray-900 mb-0.5">Community-First Onboarding</h2>
            <p className="text-sm text-gray-500 mb-4">
              New members join TrustGrid through their community. Share the link below to let members onboard directly.
            </p>

            {/* Copyable join link */}
            <div className="flex gap-2 mb-5">
              <div className="flex-1 flex items-center bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-2.5 gap-2 min-w-0">
                <span className="text-indigo-400 shrink-0">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                </span>
                <code className="text-xs text-indigo-700 font-mono truncate flex-1">{joinLink}</code>
              </div>
              <button
                onClick={() => navigator.clipboard?.writeText(joinLink)}
                className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-colors shrink-0"
              >
                <Copy className="w-3.5 h-3.5" /> Copy
              </button>
            </div>

            {/* Demo setup buttons */}
            <div className="border-t border-gray-100 pt-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Demo Setup</p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => seedHierarchyMutation.mutate()}
                  disabled={seedHierarchyMutation.isPending || seedHierarchyMutation.isSuccess}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-colors',
                    seedHierarchyMutation.isSuccess
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-indigo-300 hover:text-indigo-700 disabled:opacity-50',
                  )}
                >
                  {seedHierarchyMutation.isPending ? (
                    <span className="w-3.5 h-3.5 border border-current border-t-transparent rounded-full animate-spin" />
                  ) : seedHierarchyMutation.isSuccess ? (
                    <CheckCircle className="w-3.5 h-3.5" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5" />
                  )}
                  Seed Redemption City Hierarchy
                </button>
                <button
                  onClick={() => seedRolesMutation.mutate()}
                  disabled={seedRolesMutation.isPending || seedRolesMutation.isSuccess}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-colors',
                    seedRolesMutation.isSuccess
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-indigo-300 hover:text-indigo-700 disabled:opacity-50',
                  )}
                >
                  {seedRolesMutation.isPending ? (
                    <span className="w-3.5 h-3.5 border border-current border-t-transparent rounded-full animate-spin" />
                  ) : seedRolesMutation.isSuccess ? (
                    <CheckCircle className="w-3.5 h-3.5" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5" />
                  )}
                  Seed Authority Roles
                </button>
              </div>
              {(seedHierarchyMutation.isError || seedRolesMutation.isError) && (
                <p className="text-xs text-red-500 mt-2">Seed failed — check that the backend endpoints are available.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Invite links */}
      <div className="grid sm:grid-cols-2 gap-4 mb-8">
        {[
          { type: 'worker', icon: User, label: 'Invite Workers to Register', color: 'from-blue-600 to-indigo-700' },
          { type: 'organisation', icon: Building2, label: 'Invite Organisations to Register', color: 'from-purple-600 to-pink-700' },
        ].map(({ type, icon: Icon, label, color }) => (
          <div key={type} className={`bg-gradient-to-r ${color} rounded-2xl p-5 text-white`}>
            <div className="flex items-center gap-2 mb-3">
              <Icon className="w-4 h-4 text-white/80" />
              <span className="text-sm font-semibold">{label}</span>
            </div>
            <div className="flex gap-2">
              <input readOnly value={`${origin}/join/${type}?i=${iid}`}
                className="flex-1 text-xs bg-white/20 border border-white/20 rounded-lg px-3 py-2 text-white font-mono truncate focus:outline-none" />
              <button onClick={() => navigator.clipboard?.writeText(`${origin}/join/${type}?i=${iid}`)}
                className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors" title="Copy link">
                <Share2 className="w-3.5 h-3.5 text-white" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-5">
        {['','INDIVIDUAL_WORKER','ORGANISATION'].map(t => (
          <button key={t} onClick={() => setTypeFilter(t)}
            className={cn('px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors',
              typeFilter===t?'bg-blue-700 text-white border-blue-700':'bg-white text-gray-500 border-gray-200 hover:border-blue-200')}>
            {t===''?'All Types':t.replace(/_/g,' ')}
          </button>
        ))}
        <div className="w-px bg-gray-200 mx-1" />
        {['','SUBMITTED','UNDER_REVIEW','NEEDS_MORE_INFO','ACTIVE','REJECTED'].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={cn('px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors',
              statusFilter===s?'bg-gray-800 text-white border-gray-800':'bg-white text-gray-500 border-gray-200 hover:border-gray-400')}>
            {s===''?'All':s.replace(/_/g,' ')}
          </button>
        ))}
      </div>

      {/* Application cards */}
      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin w-8 h-8 border-2 border-blue-700 border-t-transparent rounded-full" />
        </div>
      ) : apps.length===0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
          <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Zap className="w-7 h-7 text-gray-300" />
          </div>
          <p className="font-semibold text-gray-700 mb-1">No applications here</p>
          <p className="text-sm text-gray-400">Share your invite links above to start receiving registrations</p>
        </div>
      ) : (
        <div className="space-y-3">
          {apps.map((app: any) => {
            const name = app.type==='ORGANISATION' ? app.organisationName : `${app.firstName??''} ${app.lastName??''}`.trim()
            const isOrg = app.type==='ORGANISATION'
            const canReview = ['SUBMITTED','UNDER_REVIEW'].includes(app.status)

            return (
              <div key={app.id} className={cn('bg-white rounded-2xl border overflow-hidden transition-shadow',
                canReview ? 'border-amber-200 shadow-sm' : 'border-gray-100')}>
                <div className="flex items-center gap-4 px-5 py-4">
                  {/* Avatar */}
                  <div className={cn('w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-black shrink-0',
                    isOrg ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700')}>
                    {name[0]}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-gray-900">{name}</p>
                      <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full', STATUS_COLORS[app.status]??'bg-gray-100 text-gray-500')}>
                        {app.status.replace(/_/g,' ')}
                      </span>
                      {canReview && (
                        <span className="inline-flex items-center gap-1 text-xs text-amber-600 font-semibold">
                          <Clock className="w-3 h-3" /> Awaiting review
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {isOrg ? '🏢 Organisation' : '👤 Individual Worker'}
                      {app.primarySkill && ` · ${app.primarySkill}`}
                      {app.phone && ` · ${app.phone}`}
                      {' · '}{timeAgo(app.updatedAt)}
                      {' · Step '}{app.stepCompleted}/{isOrg?4:5}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    {canReview && (
                      <div className="flex gap-1.5">
                        <button onClick={()=>{setReviewModal({id:app.id,name});setDecision('APPROVE')}}
                          className="flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl px-3 py-1.5 text-xs font-bold transition-colors">
                          <CheckCircle className="w-3.5 h-3.5" /> Approve
                        </button>
                        <button onClick={()=>{setReviewModal({id:app.id,name});setDecision('NEEDS_MORE_INFO')}}
                          className="p-1.5 bg-amber-50 hover:bg-amber-100 text-amber-600 border border-amber-200 rounded-xl transition-colors" title="Request more info">
                          <MessageSquare className="w-4 h-4" />
                        </button>
                        <button onClick={()=>{setReviewModal({id:app.id,name});setDecision('REJECT')}}
                          className="p-1.5 bg-red-50 hover:bg-red-100 text-red-500 border border-red-200 rounded-xl transition-colors" title="Reject">
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                    <button onClick={()=>setExpanded(expanded===app.id?null:app.id)}
                      className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
                      {expanded===app.id?<ChevronUp className="w-4 h-4"/>:<ChevronDown className="w-4 h-4"/>}
                    </button>
                  </div>
                </div>

                {expanded===app.id && (
                  <div className="px-5 pb-4 pt-2 border-t border-gray-50">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {[['Phone',app.phone],['Email',app.email||'—'],['Submitted',new Date(app.updatedAt).toLocaleDateString()],['Notes',app.reviewNotes||'—'],['Rejection',app.rejectionReason||'—']].map(([l,v])=>(
                        <div key={l as string} className="bg-gray-50 rounded-xl px-3 py-2">
                          <p className="text-xs text-gray-400">{l}</p>
                          <p className="text-sm font-semibold text-gray-700 truncate">{v}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Review modal */}
      {reviewModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-7 w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-black text-gray-900 mb-1">Review Application</h3>
            <p className="text-gray-500 text-sm mb-5">{reviewModal.name}</p>

            <div className="flex gap-2 mb-4">
              {(['APPROVE','NEEDS_MORE_INFO','REJECT'] as const).map(d=>(
                <button key={d} onClick={()=>setDecision(d)}
                  className={cn('flex-1 py-2.5 rounded-xl text-xs font-bold border transition-colors',
                    decision===d
                      ? d==='APPROVE'?'bg-emerald-600 text-white border-emerald-600'
                        :d==='REJECT'?'bg-red-600 text-white border-red-600'
                        :'bg-amber-500 text-white border-amber-500'
                      :'bg-white text-gray-600 border-gray-200 hover:border-gray-400')}>
                  {d==='APPROVE'?'✓ Approve':d==='REJECT'?'✗ Reject':'⚡ Need More Info'}
                </button>
              ))}
            </div>

            <textarea value={notes} onChange={e=>setNotes(e.target.value)} rows={3}
              placeholder={decision==='NEEDS_MORE_INFO'?'What information do you need?':decision==='REJECT'?'Reason for rejection...':'Optional approval notes...'}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none mb-4" />

            <div className="flex gap-3">
              <button onClick={()=>{setReviewModal(null);setNotes('')}}
                className="flex-1 border border-gray-200 text-gray-600 py-3 rounded-xl text-sm font-semibold hover:bg-gray-50">
                Cancel
              </button>
              <button disabled={reviewMutation.isPending}
                onClick={()=>reviewMutation.mutate({id:reviewModal.id,decision,notes:notes||undefined})}
                className={cn('flex-1 py-3 rounded-xl text-sm font-bold text-white disabled:opacity-60 transition-colors',
                  decision==='APPROVE'?'bg-emerald-600 hover:bg-emerald-700':decision==='REJECT'?'bg-red-600 hover:bg-red-700':'bg-amber-500 hover:bg-amber-600')}>
                {reviewMutation.isPending?'Saving...':'Confirm Decision'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
