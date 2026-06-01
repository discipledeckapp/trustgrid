'use client'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { cn, STATUS_COLORS, formatDate } from '@/lib/utils'
import {
  Briefcase, Users, Star, Plus, CheckCircle, XCircle, Clock, X,
} from 'lucide-react'

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

const OPP_STATUS_COLORS: Record<string, string> = {
  DRAFT:   'bg-gray-100 text-gray-600',
  OPEN:    'bg-emerald-100 text-emerald-700',
  CLOSED:  'bg-red-100 text-red-600',
}

const EMPTY_FORM = {
  title: '',
  type: 'VOLUNTEER',
  description: '',
  publishingNodeId: '',
  location: '',
  startDate: '',
  endDate: '',
  slotsAvailable: 1,
  minTrustScore: 50,
  requiredSkills: '',
  noOpenIncidentsRequired: false,
}

export default function OpportunitiesPage() {
  const qc = useQueryClient()
  const [tab, setTab] = useState<'ALL' | 'OPEN' | 'DRAFT' | 'CLOSED'>('ALL')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ ...EMPTY_FORM })
  const [formError, setFormError] = useState('')

  /* ── Queries ── */
  const { data, isLoading } = useQuery({
    queryKey: ['opportunities', tab],
    queryFn: () =>
      api.get('/opportunities', {
        params: { status: tab === 'ALL' ? undefined : tab, limit: 50 },
      }).then(r => r.data),
  })

  const opps: any[] = data?.data ?? []

  /* ── Mutations ── */
  const createMutation = useMutation({
    mutationFn: (dto: any) => api.post('/opportunities', dto).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['opportunities'] })
      setShowForm(false)
      setForm({ ...EMPTY_FORM })
      setFormError('')
    },
    onError: (e: any) => setFormError(e?.response?.data?.message ?? 'Failed to create opportunity'),
  })

  const publishMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/opportunities/${id}/publish`).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['opportunities'] }),
  })

  const closeMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/opportunities/${id}/close`).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['opportunities'] }),
  })

  /* ── Helpers ── */
  function handleFieldChange(field: string, value: any) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  function buildDto(publishNow: boolean) {
    return {
      title: form.title,
      type: form.type,
      description: form.description || undefined,
      publishingNodeId: form.publishingNodeId || undefined,
      location: form.location || undefined,
      startDate: form.startDate || undefined,
      endDate: form.endDate || undefined,
      slotsAvailable: Number(form.slotsAvailable),
      minTrustScore: Number(form.minTrustScore),
      requiredSkills: form.requiredSkills
        ? form.requiredSkills.split(',').map((s: string) => s.trim()).filter(Boolean)
        : undefined,
      noOpenIncidentsRequired: form.noOpenIncidentsRequired,
      status: publishNow ? 'OPEN' : 'DRAFT',
    }
  }

  const TABS = ['ALL', 'OPEN', 'DRAFT', 'CLOSED'] as const

  return (
    <div className="max-w-6xl mx-auto p-6 pb-16">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Opportunities</h1>
          <p className="text-gray-500 mt-0.5">
            {opps.length > 0 ? `${opps.length} opportunit${opps.length === 1 ? 'y' : 'ies'}` : 'No opportunities yet'}
          </p>
        </div>
        <button
          onClick={() => { setShowForm(true); setFormError('') }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white shadow-sm shadow-indigo-200 transition-colors"
          style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}
        >
          <Plus className="w-4 h-4" /> Create Opportunity
        </button>
      </div>

      {/* Tab filters */}
      <div className="flex gap-2 mb-6">
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'px-4 py-2 rounded-xl text-xs font-semibold border transition-colors',
              tab === t
                ? 'bg-indigo-700 text-white border-indigo-700'
                : 'bg-white text-gray-500 border-gray-200 hover:border-indigo-300',
            )}
          >
            {t === 'ALL' ? 'All' : t.charAt(0) + t.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {/* List */}
      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full" />
        </div>
      ) : opps.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
          <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Briefcase className="w-7 h-7 text-indigo-300" />
          </div>
          <p className="font-semibold text-gray-700 mb-1">No opportunities found</p>
          <p className="text-sm text-gray-400 mb-5">Create your first opportunity to start recruiting</p>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white"
            style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}
          >
            <Plus className="w-4 h-4" /> Create Opportunity
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {opps.map((opp: any) => {
            const filled = opp.applicationCount ?? 0
            const available = opp.slotsAvailable ?? 0
            const pct = available > 0 ? Math.min(100, Math.round((filled / available) * 100)) : 0

            return (
              <div
                key={opp.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-5"
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className="w-11 h-11 rounded-2xl bg-indigo-50 flex items-center justify-center shrink-0">
                    <Briefcase className="w-5 h-5 text-indigo-500" />
                  </div>

                  {/* Main info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className="font-bold text-gray-900 text-sm">{opp.title}</p>
                      <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full', TYPE_COLORS[opp.type] ?? 'bg-gray-100 text-gray-600')}>
                        {TYPE_LABELS[opp.type] ?? opp.type}
                      </span>
                      <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full', OPP_STATUS_COLORS[opp.status] ?? 'bg-gray-100 text-gray-500')}>
                        {opp.status}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 mb-3">
                      {opp.publishingNodeId && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Node: {opp.publishingNodeId}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {filled}/{available} slots
                      </span>
                      <span className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-amber-400" />
                        Min trust: {opp.minTrustScore ?? '—'}
                      </span>
                      <span className="flex items-center gap-1">
                        <CheckCircle className="w-3 h-3 text-indigo-400" />
                        {opp.applicationCount ?? 0} application{opp.applicationCount !== 1 ? 's' : ''}
                      </span>
                    </div>

                    {/* Slots bar */}
                    <div className="h-1.5 bg-gray-100 rounded-full w-48 overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${pct}%`,
                          background: pct >= 100 ? '#ef4444' : 'linear-gradient(90deg, #6366f1, #8b5cf6)',
                        }}
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    {opp.status === 'DRAFT' && (
                      <button
                        onClick={() => publishMutation.mutate(opp.id)}
                        disabled={publishMutation.isPending}
                        className="flex items-center gap-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl px-3 py-1.5 text-xs font-bold transition-colors disabled:opacity-50"
                      >
                        <CheckCircle className="w-3.5 h-3.5" /> Publish
                      </button>
                    )}
                    {opp.status === 'OPEN' && (
                      <button
                        onClick={() => closeMutation.mutate(opp.id)}
                        disabled={closeMutation.isPending}
                        className="flex items-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-xl px-3 py-1.5 text-xs font-bold transition-colors disabled:opacity-50"
                      >
                        <XCircle className="w-3.5 h-3.5" /> Close
                      </button>
                    )}
                    <a
                      href={`/opportunities/${opp.id}`}
                      className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
                      title="View details"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Create Opportunity panel */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-end">
          <div className="w-full max-w-xl h-full bg-white shadow-2xl flex flex-col overflow-hidden">
            {/* Panel header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <div>
                <h2 className="text-lg font-black text-gray-900">Create Opportunity</h2>
                <p className="text-xs text-gray-500 mt-0.5">Fill in the details below</p>
              </div>
              <button
                onClick={() => { setShowForm(false); setForm({ ...EMPTY_FORM }); setFormError('') }}
                className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable form body */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
              {formError && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
                  {formError}
                </div>
              )}

              {/* Title */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Title *</label>
                <input
                  value={form.title}
                  onChange={e => handleFieldChange('title', e.target.value)}
                  placeholder="e.g. Security Guard – Gate A"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Type */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Type *</label>
                <select
                  value={form.type}
                  onChange={e => handleFieldChange('type', e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  {Object.entries(TYPE_LABELS).map(([val, label]) => (
                    <option key={val} value={val}>{label}</option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Description</label>
                <textarea
                  value={form.description}
                  onChange={e => handleFieldChange('description', e.target.value)}
                  rows={3}
                  placeholder="Describe the role, responsibilities, and expectations..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>

              {/* Publishing Node ID */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Publishing Node ID
                  <span className="text-gray-400 font-normal ml-1">(community node this opportunity belongs to)</span>
                </label>
                <input
                  value={form.publishingNodeId}
                  onChange={e => handleFieldChange('publishingNodeId', e.target.value)}
                  placeholder="e.g. node_abc123"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Location</label>
                <input
                  value={form.location}
                  onChange={e => handleFieldChange('location', e.target.value)}
                  placeholder="e.g. Lagos, Nigeria"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Start Date</label>
                  <input
                    type="date"
                    value={form.startDate}
                    onChange={e => handleFieldChange('startDate', e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">End Date</label>
                  <input
                    type="date"
                    value={form.endDate}
                    onChange={e => handleFieldChange('endDate', e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  />
                </div>
              </div>

              {/* Slots + Trust Score */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Slots Available</label>
                  <input
                    type="number"
                    min={1}
                    value={form.slotsAvailable}
                    onChange={e => handleFieldChange('slotsAvailable', e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Min Trust Score
                    <span className="ml-1 font-bold text-indigo-600">{form.minTrustScore}</span>
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={form.minTrustScore}
                    onChange={e => handleFieldChange('minTrustScore', Number(e.target.value))}
                    className="w-full accent-indigo-600 mt-2"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>0</span><span>50</span><span>100</span>
                  </div>
                </div>
              </div>

              {/* Required Skills */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Required Skills
                  <span className="text-gray-400 font-normal ml-1">(comma-separated)</span>
                </label>
                <input
                  value={form.requiredSkills}
                  onChange={e => handleFieldChange('requiredSkills', e.target.value)}
                  placeholder="e.g. Security, First Aid, Communication"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* No Open Incidents */}
              <label className="flex items-center gap-3 cursor-pointer group">
                <div
                  onClick={() => handleFieldChange('noOpenIncidentsRequired', !form.noOpenIncidentsRequired)}
                  className={cn(
                    'w-10 h-6 rounded-full transition-colors relative shrink-0',
                    form.noOpenIncidentsRequired ? 'bg-indigo-600' : 'bg-gray-200',
                  )}
                >
                  <span className={cn(
                    'absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform',
                    form.noOpenIncidentsRequired ? 'translate-x-5' : 'translate-x-1',
                  )} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">No open incidents required</p>
                  <p className="text-xs text-gray-500">Applicants must have zero active incidents on their record</p>
                </div>
              </label>
            </div>

            {/* Actions footer */}
            <div className="border-t border-gray-100 px-6 py-4 flex gap-3">
              <button
                disabled={createMutation.isPending || !form.title}
                onClick={() => createMutation.mutate(buildDto(false))}
                className="flex-1 border border-gray-200 text-gray-700 py-3 rounded-xl text-sm font-semibold hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                {createMutation.isPending ? 'Saving...' : 'Save as Draft'}
              </button>
              <button
                disabled={createMutation.isPending || !form.title}
                onClick={() => createMutation.mutate(buildDto(true))}
                className="flex-1 py-3 rounded-xl text-sm font-bold text-white disabled:opacity-50 transition-colors"
                style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}
              >
                {createMutation.isPending ? 'Publishing...' : 'Publish Now'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
