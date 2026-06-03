'use client'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { ShieldOff, ShieldCheck, AlertTriangle, Search, Plus, X, Building2, Clock, User } from 'lucide-react'
import { timeAgo } from '@/lib/utils'

const WORKER_CATEGORIES = ['MISCONDUCT','THEFT','VIOLENCE','FRAUD','ABANDONMENT','POLICY_VIOLATION','OTHER']
const ORG_CATEGORIES    = ['MISCONDUCT','FRAUD','POLICY_VIOLATION','SAFETY_VIOLATION','OTHER']

type Tab = 'workers' | 'organisations' | 'audit'

export default function BlacklistPage() {
  const qc = useQueryClient()
  const [tab, setTab] = useState<Tab>('workers')

  // Worker blacklist modal state
  const [addModal, setAddModal]       = useState(false)
  const [removeModal, setRemoveModal] = useState<{id:string;name:string}|null>(null)
  const [removeReason, setRemoveReason] = useState('')

  // Worker lookup flow
  const [lookupInput, setLookupInput] = useState('')
  const [lookedUp, setLookedUp]       = useState<any>(null)
  const [lookupError, setLookupError] = useState('')
  const [lookupLoading, setLookupLoading] = useState(false)
  const [form, setForm]               = useState({ reason:'', category:'MISCONDUCT', evidence:'', notifyWorker:true })
  const [formError, setFormError]     = useState('')

  // Org blacklist state
  const [orgModal, setOrgModal]       = useState(false)
  const [orgRemoveModal, setOrgRemoveModal] = useState<{id:string;name:string}|null>(null)
  const [orgForm, setOrgForm]         = useState({ organisationId:'', reason:'', category:'MISCONDUCT', evidence:'' })
  const [orgRemoveReason, setOrgRemoveReason] = useState('')
  const [orgError, setOrgError]       = useState('')

  // Queries
  const workersQ = useQuery({ queryKey: ['blacklist-workers'], queryFn: () => api.get('/blacklist').then(r => r.data) })
  const orgsQ    = useQuery({ queryKey: ['blacklist-orgs'],    queryFn: () => api.get('/blacklist/organisations').then(r => r.data) })
  const auditQ   = useQuery({ queryKey: ['blacklist-audit'],   queryFn: () => api.get('/blacklist/audit').then(r => r.data), enabled: tab === 'audit' })

  // Mutations
  const blacklistWorker = useMutation({
    mutationFn: (data: any) => api.post('/blacklist/add', data).then(r => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['blacklist-workers'] }); closeAddModal() },
    onError: (e: any) => setFormError(e?.response?.data?.message ?? 'Failed'),
  })

  const reinstateWorker = useMutation({
    mutationFn: ({ workerId, reason }: any) => api.post('/blacklist/remove', { workerId, reason }).then(r => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['blacklist-workers'] }); setRemoveModal(null); setRemoveReason('') },
  })

  const blacklistOrg = useMutation({
    mutationFn: (data: any) => api.post('/blacklist/organisations/add', data).then(r => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['blacklist-orgs'] }); closeOrgModal() },
    onError: (e: any) => setOrgError(e?.response?.data?.message ?? 'Failed'),
  })

  const reinstateOrg = useMutation({
    mutationFn: ({ id, reason }: any) => api.post(`/blacklist/organisations/${id}/remove`, { reason }).then(r => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['blacklist-orgs'] }); setOrgRemoveModal(null); setOrgRemoveReason('') },
  })

  function closeAddModal() {
    setAddModal(false); setLookupInput(''); setLookedUp(null); setLookupError('')
    setForm({ reason:'', category:'MISCONDUCT', evidence:'', notifyWorker:true }); setFormError('')
  }

  function closeOrgModal() {
    setOrgModal(false); setOrgForm({ organisationId:'', reason:'', category:'MISCONDUCT', evidence:'' }); setOrgError('')
  }

  async function doLookup() {
    if (!lookupInput.trim()) return
    setLookupLoading(true); setLookupError(''); setLookedUp(null)
    try {
      const { data } = await api.get(`/blacklist/lookup?identifier=${encodeURIComponent(lookupInput.trim())}`)
      if (!data) { setLookupError('No worker found with that phone, email, or ID.'); return }
      if (data.isBlacklisted) { setLookupError(`${data.name} is already blacklisted.`); return }
      setLookedUp(data)
    } catch (e: any) {
      setLookupError(e?.response?.data?.message ?? 'Lookup failed')
    } finally {
      setLookupLoading(false)
    }
  }

  const workers = workersQ.data?.data ?? []
  const workerTotal = workersQ.data?.pagination?.total ?? 0
  const orgs = orgsQ.data?.data ?? []
  const orgTotal = orgsQ.data?.pagination?.total ?? 0
  const auditItems = auditQ.data?.data ?? []

  const TAB_COUNTS: Record<Tab, number> = {
    workers: workerTotal,
    organisations: orgTotal,
    audit: auditItems.length,
  }

  return (
    <div className="max-w-5xl mx-auto p-6 pb-16">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            <ShieldOff className="w-6 h-6 text-red-500" /> Blacklist
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {workerTotal} suspended worker{workerTotal !== 1 ? 's' : ''} · {orgTotal} suspended organisation{orgTotal !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex gap-2">
          {tab === 'workers' && (
            <button onClick={() => setAddModal(true)}
              className="flex items-center gap-2 bg-red-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-red-700 transition-colors">
              <Plus className="w-4 h-4" /> Blacklist Worker
            </button>
          )}
          {tab === 'organisations' && (
            <button onClick={() => setOrgModal(true)}
              className="flex items-center gap-2 bg-red-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-red-700 transition-colors">
              <Plus className="w-4 h-4" /> Blacklist Organisation
            </button>
          )}
        </div>
      </div>

      {/* Policy notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 mb-5 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <p className="text-sm text-amber-700">
          <strong className="text-amber-800">Worker rights notice:</strong> Every blacklisted worker is automatically notified via SMS, WhatsApp, and email (if available). Blacklists are institution-specific — workers can still work elsewhere. All actions are permanently logged.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-6 w-fit">
        {(['workers','organisations','audit'] as Tab[]).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all capitalize ${
              tab === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}>
            {t} {TAB_COUNTS[t] > 0 && <span className="ml-1 text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full">{TAB_COUNTS[t]}</span>}
          </button>
        ))}
      </div>

      {/* ── Workers Tab ───────────────────────────────────────────── */}
      {tab === 'workers' && (
        workersQ.isLoading ? <Spinner /> :
        workers.length === 0 ? <EmptyState icon={<ShieldCheck className="w-12 h-12 text-emerald-200 mx-auto mb-3"/>} text="No blacklisted workers" sub="Your workforce registry is clean" /> :
        <div className="space-y-3">
          {workers.map((w: any) => (
            <div key={w.id} className="bg-white rounded-2xl border border-red-100 p-5">
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-red-100 flex items-center justify-center text-lg font-black text-red-600 shrink-0">
                  {w.name?.[0] ?? '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-bold text-gray-900">{w.name}</p>
                    <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium">Suspended</span>
                    {w.lastIncident?.category && (
                      <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{w.lastIncident.category}</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5">{w.primarySkill} · Trust score: {w.trustScore?.toFixed(1)}</p>
                  <div className="flex gap-3 mt-1 text-xs text-gray-400">
                    {w.phone && <span>📞 {w.phone}</span>}
                    {w.email && <span>✉️ {w.email}</span>}
                  </div>
                  {w.lastIncident?.reason && (
                    <p className="text-xs text-gray-400 mt-1.5 italic">
                      &ldquo;{w.lastIncident.reason.slice(0, 140)}{w.lastIncident.reason.length > 140 ? '...' : ''}&rdquo;
                    </p>
                  )}
                </div>
                <button onClick={() => setRemoveModal({ id: w.id, name: w.name })}
                  className="flex items-center gap-1.5 text-xs text-emerald-700 border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg font-medium transition-colors shrink-0">
                  <ShieldCheck className="w-3.5 h-3.5" /> Reinstate
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Organisations Tab ─────────────────────────────────────── */}
      {tab === 'organisations' && (
        orgsQ.isLoading ? <Spinner /> :
        orgs.length === 0 ? <EmptyState icon={<Building2 className="w-12 h-12 text-gray-200 mx-auto mb-3"/>} text="No blacklisted organisations" sub="All organisations in your registry are in good standing" /> :
        <div className="space-y-3">
          {orgs.map((o: any) => (
            <div key={o.id} className="bg-white rounded-2xl border border-red-100 p-5">
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
                  <Building2 className="w-5 h-5 text-red-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-gray-900">{o.name}</p>
                    <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium">Suspended</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5">{o.type?.replace(/_/g,' ')} · RC: {o.rcNumber ?? '—'}</p>
                  <div className="flex gap-3 mt-1 text-xs text-gray-400">
                    {o.phone && <span>📞 {o.phone}</span>}
                    {o.email && <span>✉️ {o.email}</span>}
                  </div>
                </div>
                <button onClick={() => setOrgRemoveModal({ id: o.id, name: o.name })}
                  className="flex items-center gap-1.5 text-xs text-emerald-700 border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg font-medium transition-colors shrink-0">
                  <ShieldCheck className="w-3.5 h-3.5" /> Reinstate
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Audit Trail Tab ───────────────────────────────────────── */}
      {tab === 'audit' && (
        auditQ.isLoading ? <Spinner /> :
        auditItems.length === 0 ? <EmptyState icon={<Clock className="w-12 h-12 text-gray-200 mx-auto mb-3"/>} text="No audit records yet" sub="All blacklist and reinstatement actions will appear here" /> :
        <div className="space-y-2">
          {auditItems.map((e: any) => (
            <div key={e.id} className="bg-white rounded-xl border border-gray-100 p-4 flex items-start gap-4">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                e.action === 'BLACKLISTED' ? 'bg-red-100' : 'bg-emerald-100'
              }`}>
                {e.type === 'WORKER' ? (
                  <User className={`w-4 h-4 ${e.action === 'BLACKLISTED' ? 'text-red-600' : 'text-emerald-600'}`} />
                ) : (
                  <Building2 className={`w-4 h-4 ${e.action === 'BLACKLISTED' ? 'text-red-600' : 'text-emerald-600'}`} />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    e.action === 'BLACKLISTED' ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'
                  }`}>{e.action}</span>
                  <span className="text-xs text-gray-500 uppercase tracking-wide">{e.type}</span>
                  {e.category && e.category !== '—' && (
                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{e.category}</span>
                  )}
                </div>
                <p className="font-semibold text-gray-900 text-sm mt-0.5">{e.subjectName}</p>
                {e.reason && <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{e.reason.split('\n\nEvidence:')[0]}</p>}
                <p className="text-xs text-gray-400 mt-1">By {e.performedBy} · {timeAgo(e.date)}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Add Worker Modal ──────────────────────────────────────── */}
      {addModal && (
        <Modal onClose={closeAddModal} title={<><ShieldOff className="w-5 h-5 text-red-500" /> Blacklist Worker</>}>
          <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 mb-4 text-sm text-red-700">
            The worker will be <strong>automatically notified</strong> via SMS, WhatsApp, and email.
          </div>

          {/* Step 1 — Lookup */}
          {!lookedUp && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Search worker by phone, email, or ID *</label>
                <div className="flex gap-2">
                  <input value={lookupInput} onChange={e => setLookupInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && doLookup()}
                    placeholder="08012345678 or worker@email.com or worker ID"
                    className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
                  <button onClick={doLookup} disabled={lookupLoading}
                    className="px-4 py-3 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-gray-700 disabled:opacity-50 flex items-center gap-2">
                    {lookupLoading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Search className="w-4 h-4" />}
                    Find
                  </button>
                </div>
                {lookupError && <p className="text-red-500 text-xs mt-2">{lookupError}</p>}
              </div>
            </div>
          )}

          {/* Step 2 — Confirm + form */}
          {lookedUp && (
            <div className="space-y-3">
              {/* Worker preview */}
              <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3 mb-1">
                <div className="w-10 h-10 rounded-xl bg-gray-200 flex items-center justify-center font-black text-gray-600">
                  {lookedUp.name?.[0]}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 text-sm">{lookedUp.name}</p>
                  <p className="text-xs text-gray-500">{lookedUp.primarySkill} · Score: {lookedUp.trustScore?.toFixed(1)}</p>
                </div>
                <button onClick={() => { setLookedUp(null); setLookupInput('') }} className="text-gray-400 hover:text-gray-600">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Category *</label>
                <select value={form.category} onChange={e => setForm({...form, category: e.target.value})}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-red-500">
                  {WORKER_CATEGORIES.map(c => <option key={c} value={c}>{c.replace(/_/g,' ')}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Reason * <span className="text-gray-400 font-normal">(sent to worker)</span></label>
                <textarea value={form.reason} onChange={e => setForm({...form, reason: e.target.value})} rows={3}
                  placeholder="Be clear and factual. This message is sent directly to the worker."
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 resize-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Evidence / Notes <span className="text-gray-400 font-normal">(internal only)</span></label>
                <textarea value={form.evidence} onChange={e => setForm({...form, evidence: e.target.value})} rows={2}
                  placeholder="Internal notes, incident references, witness names..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 resize-none" />
              </div>
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input type="checkbox" checked={form.notifyWorker} onChange={e => setForm({...form, notifyWorker: e.target.checked})} className="w-4 h-4 accent-red-600" />
                <span className="text-sm text-gray-700">Notify worker via SMS + WhatsApp + email (recommended)</span>
              </label>
              {formError && <p className="text-red-500 text-xs">{formError}</p>}

              <div className="flex gap-3 pt-1">
                <button onClick={closeAddModal} className="flex-1 border border-gray-200 text-gray-600 py-3 rounded-xl text-sm font-semibold hover:bg-gray-50">Cancel</button>
                <button disabled={!form.reason || blacklistWorker.isPending}
                  onClick={() => blacklistWorker.mutate({ workerId: lookedUp.workerId, ...form })}
                  className="flex-1 bg-red-600 text-white py-3 rounded-xl text-sm font-bold hover:bg-red-700 disabled:opacity-60">
                  {blacklistWorker.isPending ? 'Processing...' : 'Confirm Blacklist'}
                </button>
              </div>
            </div>
          )}
        </Modal>
      )}

      {/* ── Reinstate Worker Modal ────────────────────────────────── */}
      {removeModal && (
        <Modal onClose={() => { setRemoveModal(null); setRemoveReason('') }} title="Reinstate Worker">
          <p className="text-gray-500 text-sm mb-4">
            <strong>{removeModal.name}</strong> will be notified of their reinstatement.
          </p>
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Reason for reinstatement *</label>
            <textarea value={removeReason} onChange={e => setRemoveReason(e.target.value)} rows={3}
              placeholder="e.g. Appeal accepted, investigation cleared the worker..."
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none" />
          </div>
          <div className="flex gap-3">
            <button onClick={() => { setRemoveModal(null); setRemoveReason('') }} className="flex-1 border border-gray-200 text-gray-600 py-3 rounded-xl text-sm font-semibold">Cancel</button>
            <button disabled={!removeReason || reinstateWorker.isPending}
              onClick={() => reinstateWorker.mutate({ workerId: removeModal.id, reason: removeReason })}
              className="flex-1 bg-emerald-600 text-white py-3 rounded-xl text-sm font-bold hover:bg-emerald-700 disabled:opacity-60">
              {reinstateWorker.isPending ? 'Reinstating...' : 'Reinstate'}
            </button>
          </div>
        </Modal>
      )}

      {/* ── Blacklist Organisation Modal ──────────────────────────── */}
      {orgModal && (
        <Modal onClose={closeOrgModal} title={<><Building2 className="w-5 h-5 text-red-500" /> Blacklist Organisation</>}>
          <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 mb-4 text-sm text-red-700">
            The organisation will be suspended and all associated workers flagged.
          </div>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Organisation ID *</label>
              <input value={orgForm.organisationId} onChange={e => setOrgForm({...orgForm, organisationId: e.target.value})}
                placeholder="Paste the organisation ID from their profile"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Category *</label>
              <select value={orgForm.category} onChange={e => setOrgForm({...orgForm, category: e.target.value})}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-red-500">
                {ORG_CATEGORIES.map(c => <option key={c} value={c}>{c.replace(/_/g,' ')}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Reason *</label>
              <textarea value={orgForm.reason} onChange={e => setOrgForm({...orgForm, reason: e.target.value})} rows={3}
                placeholder="Reason for blacklisting this organisation..."
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 resize-none" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Evidence / Notes <span className="text-gray-400 font-normal">(internal)</span></label>
              <textarea value={orgForm.evidence} onChange={e => setOrgForm({...orgForm, evidence: e.target.value})} rows={2}
                placeholder="Internal notes, references..."
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 resize-none" />
            </div>
            {orgError && <p className="text-red-500 text-xs">{orgError}</p>}
            <div className="flex gap-3 pt-1">
              <button onClick={closeOrgModal} className="flex-1 border border-gray-200 text-gray-600 py-3 rounded-xl text-sm font-semibold">Cancel</button>
              <button disabled={!orgForm.organisationId || !orgForm.reason || blacklistOrg.isPending}
                onClick={() => blacklistOrg.mutate(orgForm)}
                className="flex-1 bg-red-600 text-white py-3 rounded-xl text-sm font-bold hover:bg-red-700 disabled:opacity-60">
                {blacklistOrg.isPending ? 'Processing...' : 'Confirm Blacklist'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── Reinstate Org Modal ───────────────────────────────────── */}
      {orgRemoveModal && (
        <Modal onClose={() => { setOrgRemoveModal(null); setOrgRemoveReason('') }} title="Reinstate Organisation">
          <p className="text-gray-500 text-sm mb-4">Reinstate <strong>{orgRemoveModal.name}</strong> and restore their active status.</p>
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Reason *</label>
            <textarea value={orgRemoveReason} onChange={e => setOrgRemoveReason(e.target.value)} rows={3}
              placeholder="e.g. Compliance requirements met, investigation resolved..."
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none" />
          </div>
          <div className="flex gap-3">
            <button onClick={() => { setOrgRemoveModal(null); setOrgRemoveReason('') }} className="flex-1 border border-gray-200 text-gray-600 py-3 rounded-xl text-sm font-semibold">Cancel</button>
            <button disabled={!orgRemoveReason || reinstateOrg.isPending}
              onClick={() => reinstateOrg.mutate({ id: orgRemoveModal.id, reason: orgRemoveReason })}
              className="flex-1 bg-emerald-600 text-white py-3 rounded-xl text-sm font-bold hover:bg-emerald-700 disabled:opacity-60">
              {reinstateOrg.isPending ? 'Reinstating...' : 'Reinstate'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}

function Spinner() {
  return <div className="flex justify-center py-12"><div className="animate-spin w-7 h-7 border-2 border-red-600 border-t-transparent rounded-full" /></div>
}

function EmptyState({ icon, text, sub }: { icon: React.ReactNode; text: string; sub: string }) {
  return (
    <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
      {icon}
      <p className="font-semibold text-gray-700">{text}</p>
      <p className="text-sm text-gray-400 mt-1">{sub}</p>
    </div>
  )
}

function Modal({ children, onClose, title }: { children: React.ReactNode; onClose: () => void; title: React.ReactNode }) {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-7 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-xl font-black text-gray-900 flex items-center gap-2">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
        </div>
        {children}
      </div>
    </div>
  )
}
