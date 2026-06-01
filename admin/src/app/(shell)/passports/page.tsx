'use client'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Shield, Search, AlertTriangle, BadgeCheck, Clock, XCircle } from 'lucide-react'
import { cn, formatDate } from '@/lib/utils'

const STATUS_STYLE: Record<string, string> = {
  ACTIVE:   'bg-emerald-400/10 text-emerald-400 border-emerald-400/20',
  REVOKED:  'bg-red-400/10    text-red-400    border-red-400/20',
  EXPIRED:  'bg-amber-400/10  text-amber-400  border-amber-400/20',
  PENDING:  'bg-blue-400/10   text-blue-400   border-blue-400/20',
}

export default function AdminPassportsPage() {
  const [search, setSearch] = useState('')
  const queryClient = useQueryClient()

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin-passports'],
    queryFn: () => api.get('/admin/passports').then(r => r.data),
    retry: false,
  })

  const revokeMutation = useMutation({
    mutationFn: (passportId: string) =>
      api.patch(`/admin/passports/${passportId}/revoke`).then(r => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-passports'] }),
  })

  const passports: any[] = data?.data ?? data?.passports ?? []
  const total: number    = data?.total ?? passports.length

  const filtered = passports.filter((p: any) => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return (
      p.passportCode?.toLowerCase().includes(q) ||
      p.holderName?.toLowerCase().includes(q) ||
      p.institution?.name?.toLowerCase().includes(q)
    )
  })

  // --- Endpoint not implemented yet — show structured placeholder ---
  if (isError || (!isLoading && !data)) {
    return (
      <div className="p-6 max-w-5xl">
        <PageHeader total={null} />

        {/* Coming soon card */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-10 text-center mt-6">
          <div className="w-14 h-14 bg-cyan-400/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Shield className="w-7 h-7 text-cyan-400" />
          </div>
          <h2 className="text-white font-semibold text-base mb-2">Trust Passports — Coming Soon</h2>
          <p className="text-slate-400 text-sm max-w-sm mx-auto">
            The <code className="text-cyan-300 bg-white/5 px-1 rounded">GET /admin/passports</code> endpoint is not yet
            available. Once implemented, this page will display all issued trust passports with search and revocation controls.
          </p>

          {/* Skeleton preview */}
          <div className="mt-8 overflow-x-auto">
            <table className="w-full text-sm text-left opacity-30 pointer-events-none select-none">
              <thead>
                <tr className="text-slate-500 text-xs border-b border-white/5">
                  <th className="pb-3 pr-4 font-medium">Passport Code</th>
                  <th className="pb-3 pr-4 font-medium">Holder</th>
                  <th className="pb-3 pr-4 font-medium">Institution</th>
                  <th className="pb-3 pr-4 font-medium">Status</th>
                  <th className="pb-3 pr-4 font-medium">Issued</th>
                  <th className="pb-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3].map(n => (
                  <tr key={n} className="border-b border-white/5">
                    <td className="py-3 pr-4"><span className="block h-3 w-28 bg-white/10 rounded" /></td>
                    <td className="py-3 pr-4"><span className="block h-3 w-32 bg-white/10 rounded" /></td>
                    <td className="py-3 pr-4"><span className="block h-3 w-24 bg-white/10 rounded" /></td>
                    <td className="py-3 pr-4"><span className="block h-3 w-16 bg-white/10 rounded" /></td>
                    <td className="py-3 pr-4"><span className="block h-3 w-20 bg-white/10 rounded" /></td>
                    <td className="py-3"><span className="block h-5 w-16 bg-red-400/20 rounded" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-5xl">
      <PageHeader total={total} />

      {/* Search */}
      <div className="relative mb-5">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
        <input
          type="text"
          placeholder="Search by passport code, holder or institution…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-white/20"
        />
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="w-7 h-7 border-2 border-white/20 border-t-white rounded-full animate-spin" />
        </div>
      ) : (
        <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
          {filtered.length === 0 ? (
            <p className="text-center text-slate-500 text-sm py-16">
              {search ? 'No passports match your search' : 'No passports issued yet'}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-slate-500 text-xs border-b border-white/5">
                    <th className="px-5 py-3 font-medium">Passport Code</th>
                    <th className="px-5 py-3 font-medium">Holder</th>
                    <th className="px-5 py-3 font-medium">Institution</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 font-medium">Issued</th>
                    <th className="px-5 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filtered.map((p: any) => {
                    const status = p.status ?? 'ACTIVE'
                    const isRevoked = status === 'REVOKED'
                    const isPending = revokeMutation.isPending && revokeMutation.variables === p.id

                    return (
                      <tr key={p.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-5 py-3 font-mono text-cyan-300 text-xs font-medium">
                          {p.passportCode ?? p.code ?? '—'}
                        </td>
                        <td className="px-5 py-3 text-white">
                          {p.holderName ?? p.worker?.name ?? p.worker?.firstName
                            ? `${p.worker?.firstName ?? ''} ${p.worker?.lastName ?? ''}`.trim()
                            : '—'}
                        </td>
                        <td className="px-5 py-3 text-slate-400">
                          {p.institution?.name ?? p.institutionName ?? '—'}
                        </td>
                        <td className="px-5 py-3">
                          <span className={cn(
                            'inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-md border',
                            STATUS_STYLE[status] ?? STATUS_STYLE.ACTIVE,
                          )}>
                            {status === 'ACTIVE'  && <BadgeCheck className="w-3 h-3" />}
                            {status === 'REVOKED' && <XCircle    className="w-3 h-3" />}
                            {status === 'EXPIRED' && <AlertTriangle className="w-3 h-3" />}
                            {status === 'PENDING' && <Clock      className="w-3 h-3" />}
                            {status}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-slate-400 text-xs">
                          {p.issuedAt ?? p.createdAt ? formatDate(p.issuedAt ?? p.createdAt) : '—'}
                        </td>
                        <td className="px-5 py-3">
                          {isRevoked ? (
                            <span className="text-xs text-slate-600">Revoked</span>
                          ) : (
                            <button
                              onClick={() => {
                                if (confirm(`Revoke passport ${p.passportCode ?? p.code}? This cannot be undone.`)) {
                                  revokeMutation.mutate(p.id)
                                }
                              }}
                              disabled={isPending}
                              className={cn(
                                'text-xs px-3 py-1 rounded-md font-medium transition-colors',
                                'bg-red-500/10 text-red-400 border border-red-500/20',
                                'hover:bg-red-500/20 hover:text-red-300',
                                'disabled:opacity-50 disabled:cursor-not-allowed',
                              )}
                            >
                              {isPending ? 'Revoking…' : 'Revoke'}
                            </button>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function PageHeader({ total }: { total: number | null }) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-cyan-400/10 rounded-xl flex items-center justify-center">
          <Shield className="w-5 h-5 text-cyan-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">Trust Passports</h1>
          <p className="text-slate-400 text-sm mt-0.5">
            {total !== null
              ? `${total.toLocaleString()} passport${total !== 1 ? 's' : ''} issued across the platform`
              : 'Platform-wide passport registry'}
          </p>
        </div>
      </div>
    </div>
  )
}
