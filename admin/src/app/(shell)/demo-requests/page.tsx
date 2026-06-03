'use client'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Mail, Phone, Building2, Clock, CheckCircle2, XCircle, Circle, ChevronDown } from 'lucide-react'
import { timeAgo } from '@/lib/utils'

const STATUSES = ['NEW', 'CONTACTED', 'DEMO_SCHEDULED', 'CLOSED_WON', 'CLOSED_LOST']

const STATUS_STYLES: Record<string, string> = {
  NEW:              'bg-blue-500/20 text-blue-300 border-blue-500/30',
  CONTACTED:        'bg-amber-500/20 text-amber-300 border-amber-500/30',
  DEMO_SCHEDULED:   'bg-violet-500/20 text-violet-300 border-violet-500/30',
  CLOSED_WON:       'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  CLOSED_LOST:      'bg-red-500/20 text-red-300 border-red-500/30',
}

export default function DemoRequestsPage() {
  const queryClient = useQueryClient()
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-demo-requests'],
    queryFn: () => api.get('/demo-requests?limit=100').then(r => r.data),
    retry: false,
  })

  const updateStatus = useMutation({
    mutationFn: ({ id, status, notes }: { id: string; status: string; notes?: string }) =>
      api.patch(`/demo-requests/${id}/status`, { status, notes }).then(r => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-demo-requests'] }),
  })

  const requests: any[] = data?.items ?? []
  const selected = selectedId ? requests.find(r => r.id === selectedId) : null

  return (
    <div className="p-6 max-w-6xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Demo Requests</h1>
          <p className="text-slate-400 text-sm mt-0.5">Leads from trustgrid.ng — {data?.total ?? 0} total</p>
        </div>
        <div className="flex items-center gap-2">
          {STATUSES.map(s => (
            <div key={s} className={`text-[10px] font-bold px-2 py-1 rounded-full border ${STATUS_STYLES[s]}`}>
              {requests.filter(r => r.status === s).length} {s.replace('_', ' ')}
            </div>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="w-7 h-7 border-2 border-white/20 border-t-white rounded-full animate-spin" />
        </div>
      ) : requests.length === 0 ? (
        <div className="text-center py-20 text-slate-500">
          <Mail className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p>No demo requests yet</p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-5 gap-4">
          {/* List */}
          <div className="lg:col-span-2 space-y-2 max-h-[75vh] overflow-y-auto pr-1">
            {requests.map((req: any) => (
              <button key={req.id} onClick={() => setSelectedId(req.id)}
                className={`w-full text-left rounded-xl p-4 border transition-all ${
                  selectedId === req.id
                    ? 'bg-white/10 border-white/20'
                    : 'bg-white/3 border-white/6 hover:bg-white/6'
                }`}>
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="font-semibold text-white text-sm truncate">{req.institutionName}</div>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border shrink-0 ${STATUS_STYLES[req.status] ?? STATUS_STYLES.NEW}`}>
                    {req.status}
                  </span>
                </div>
                <div className="text-slate-400 text-xs">{req.contactName} · {req.institutionType || 'Unknown type'}</div>
                <div className="text-slate-500 text-xs mt-1">{timeAgo(req.createdAt)}</div>
              </button>
            ))}
          </div>

          {/* Detail */}
          <div className="lg:col-span-3">
            {selected ? (
              <div className="bg-white/3 border border-white/8 rounded-2xl p-6 space-y-5">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-lg font-black text-white">{selected.institutionName}</h2>
                    <p className="text-slate-400 text-sm">{selected.institutionType || 'Unknown type'}</p>
                  </div>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${STATUS_STYLES[selected.status] ?? STATUS_STYLES.NEW}`}>
                    {selected.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2 text-slate-300">
                    <Building2 className="w-4 h-4 text-slate-500 shrink-0" />
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase tracking-wide">Contact</div>
                      <div>{selected.contactName}</div>
                      {selected.contactRole && <div className="text-slate-400 text-xs">{selected.contactRole}</div>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <Phone className="w-4 h-4 text-slate-500 shrink-0" />
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase tracking-wide">Phone</div>
                      <a href={`tel:${selected.contactPhone}`} className="hover:text-white transition-colors">{selected.contactPhone}</a>
                    </div>
                  </div>
                  {selected.contactEmail && (
                    <div className="flex items-center gap-2 text-slate-300">
                      <Mail className="w-4 h-4 text-slate-500 shrink-0" />
                      <div>
                        <div className="text-[10px] text-slate-500 uppercase tracking-wide">Email</div>
                        <a href={`mailto:${selected.contactEmail}`} className="hover:text-white transition-colors">{selected.contactEmail}</a>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-slate-300">
                    <Clock className="w-4 h-4 text-slate-500 shrink-0" />
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase tracking-wide">Submitted</div>
                      <div>{new Date(selected.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
                    </div>
                  </div>
                </div>

                {selected.message && (
                  <div className="bg-white/4 rounded-xl p-4">
                    <div className="text-[10px] text-slate-500 uppercase tracking-wide mb-2">Their Challenge</div>
                    <p className="text-slate-300 text-sm leading-relaxed">{selected.message}</p>
                  </div>
                )}

                <div className="space-y-3">
                  <div className="text-[10px] text-slate-500 uppercase tracking-wide">Update Status</div>
                  <div className="flex flex-wrap gap-2">
                    {STATUSES.map(s => (
                      <button key={s}
                        onClick={() => updateStatus.mutate({ id: selected.id, status: s })}
                        disabled={selected.status === s || updateStatus.isPending}
                        className={`text-xs font-bold px-3 py-1.5 rounded-full border transition-all disabled:opacity-40 ${
                          selected.status === s
                            ? `${STATUS_STYLES[s]} cursor-default`
                            : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10 hover:text-white'
                        }`}>
                        {s.replace(/_/g, ' ')}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3">
                  {selected.contactPhone && (
                    <a href={`tel:${selected.contactPhone}`}
                      className="flex-1 text-center py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold transition-colors">
                      📞 Call Now
                    </a>
                  )}
                  {selected.contactEmail && (
                    <a href={`mailto:${selected.contactEmail}?subject=TrustGrid Demo — ${selected.institutionName}`}
                      className="flex-1 text-center py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold transition-colors">
                      ✉️ Send Email
                    </a>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-48 text-slate-600 text-sm">
                Select a request to view details
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
