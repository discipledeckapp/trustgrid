'use client'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { ShieldOff, ShieldCheck, AlertTriangle, Search, Plus, X } from 'lucide-react'
import { cn, formatDate, timeAgo } from '@/lib/utils'

const CATEGORIES = ['MISCONDUCT','THEFT','VIOLENCE','FRAUD','ABANDONMENT','POLICY_VIOLATION','OTHER']

export default function BlacklistPage() {
  const qc = useQueryClient()
  const [addModal, setAddModal]     = useState(false)
  const [removeModal, setRemoveModal] = useState<{id:string;name:string}|null>(null)
  const [form, setForm]             = useState({ workerId:'', reason:'', category:'MISCONDUCT', evidence:'', notifyWorker:true })
  const [removeReason, setRemoveReason] = useState('')
  const [error, setError]           = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['blacklist'],
    queryFn: () => api.get('/blacklist').then(r => r.data),
  })

  const blacklistMutation = useMutation({
    mutationFn: (data: any) => api.post('/blacklist/add', data).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['blacklist'] })
      setAddModal(false)
      setForm({ workerId:'', reason:'', category:'MISCONDUCT', evidence:'', notifyWorker:true })
    },
    onError: (err: any) => setError(err?.response?.data?.message ?? 'Failed to blacklist worker'),
  })

  const removeMutation = useMutation({
    mutationFn: ({ workerId, reason }: any) => api.post('/blacklist/remove', { workerId, reason, notifyWorker: true }).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['blacklist'] })
      setRemoveModal(null)
      setRemoveReason('')
    },
  })

  const workers = data?.data ?? []
  const total = data?.pagination?.total ?? 0

  return (
    <div className="max-w-4xl mx-auto p-6 pb-16">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            <ShieldOff className="w-6 h-6 text-red-500" />
            Blacklist
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {total} suspended worker{total !== 1 ? 's' : ''} · All blacklisted workers are notified via SMS and WhatsApp
          </p>
        </div>
        <button onClick={() => setAddModal(true)}
          className="flex items-center gap-2 bg-red-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-red-700 transition-colors">
          <Plus className="w-4 h-4" /> Add to Blacklist
        </button>
      </div>

      {/* Policy notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 mb-5 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-amber-800">Worker rights notice</p>
          <p className="text-sm text-amber-700 mt-0.5">
            Every blacklisted worker is automatically notified of the reason via SMS and WhatsApp. Workers can appeal by contacting the institution directly. Blacklists are institution-specific — a worker blacklisted here can still work for other institutions.
          </p>
        </div>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin w-7 h-7 border-2 border-red-600 border-t-transparent rounded-full" />
        </div>
      ) : workers.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <ShieldCheck className="w-12 h-12 text-emerald-200 mx-auto mb-3" />
          <p className="font-semibold text-gray-700">No blacklisted workers</p>
          <p className="text-sm text-gray-400 mt-1">Your workforce registry is clean</p>
        </div>
      ) : (
        <div className="space-y-3">
          {workers.map((w: any) => (
            <div key={w.id} className="bg-white rounded-2xl border border-red-100 p-5">
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-red-100 flex items-center justify-center text-lg font-black text-red-600 shrink-0">
                  {w.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-gray-900">{w.name}</p>
                    <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium">Suspended</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5">{w.primarySkill} · Trust score: {w.trustScore?.toFixed(1)}</p>
                  {w.lastIncident && (
                    <p className="text-xs text-gray-400 mt-1.5 italic">
                      "{w.lastIncident.reason?.slice(0, 120)}{w.lastIncident.reason?.length > 120 ? '...' : ''}"
                    </p>
                  )}
                </div>
                <button
                  onClick={() => setRemoveModal({ id: w.id, name: w.name })}
                  className="flex items-center gap-1.5 text-xs text-emerald-700 border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg font-medium transition-colors shrink-0">
                  <ShieldCheck className="w-3.5 h-3.5" /> Reinstate
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add to blacklist modal */}
      {addModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-7 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-xl font-black text-gray-900 flex items-center gap-2">
                <ShieldOff className="w-5 h-5 text-red-500" /> Add to Blacklist
              </h3>
              <button onClick={() => setAddModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 mb-4 text-sm text-red-700">
              The worker will be <strong>automatically notified</strong> of this action and the reason via SMS and WhatsApp.
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Worker ID *</label>
                <input value={form.workerId} onChange={e => setForm({...form, workerId: e.target.value})}
                  placeholder="Paste the worker's ID from their profile"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Category *</label>
                <select value={form.category} onChange={e => setForm({...form, category: e.target.value})}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-red-500">
                  {CATEGORIES.map(c => <option key={c} value={c}>{c.replace(/_/g,' ')}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Reason * <span className="text-gray-400 font-normal">(sent to worker)</span></label>
                <textarea value={form.reason} onChange={e => setForm({...form, reason: e.target.value})} rows={3}
                  placeholder="Be clear and factual. This message is sent directly to the worker."
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 resize-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Evidence / Notes (internal only)</label>
                <textarea value={form.evidence} onChange={e => setForm({...form, evidence: e.target.value})} rows={2}
                  placeholder="Internal notes, incident references, witness names..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 resize-none" />
              </div>
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input type="checkbox" checked={form.notifyWorker}
                  onChange={e => setForm({...form, notifyWorker: e.target.checked})}
                  className="w-4 h-4 accent-red-600" />
                <span className="text-sm text-gray-700">Notify worker via SMS + WhatsApp (recommended)</span>
              </label>
            </div>

            {error && <p className="text-red-500 text-xs mt-3">{error}</p>}

            <div className="flex gap-3 mt-5">
              <button onClick={() => { setAddModal(false); setError('') }}
                className="flex-1 border border-gray-200 text-gray-600 py-3 rounded-xl text-sm font-semibold hover:bg-gray-50">
                Cancel
              </button>
              <button
                disabled={!form.workerId || !form.reason || blacklistMutation.isPending}
                onClick={() => blacklistMutation.mutate(form)}
                className="flex-1 bg-red-600 text-white py-3 rounded-xl text-sm font-bold hover:bg-red-700 disabled:opacity-60 transition-colors">
                {blacklistMutation.isPending ? 'Processing...' : 'Confirm Blacklist'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Remove from blacklist modal */}
      {removeModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-7 w-full max-w-sm shadow-2xl">
            <h3 className="text-xl font-black text-gray-900 mb-2">Reinstate {removeModal.name}</h3>
            <p className="text-gray-500 text-sm mb-4">They will be notified of their reinstatement via SMS and WhatsApp.</p>
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Reason for reinstatement *</label>
              <textarea value={removeReason} onChange={e => setRemoveReason(e.target.value)} rows={3}
                placeholder="e.g. Appeal accepted, investigation cleared the worker..."
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none" />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setRemoveModal(null)}
                className="flex-1 border border-gray-200 text-gray-600 py-3 rounded-xl text-sm font-semibold hover:bg-gray-50">
                Cancel
              </button>
              <button
                disabled={!removeReason || removeMutation.isPending}
                onClick={() => removeMutation.mutate({ workerId: removeModal.id, reason: removeReason })}
                className="flex-1 bg-emerald-600 text-white py-3 rounded-xl text-sm font-bold hover:bg-emerald-700 disabled:opacity-60">
                {removeMutation.isPending ? 'Reinstating...' : 'Reinstate'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
