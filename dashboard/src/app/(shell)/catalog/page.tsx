'use client'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { cn } from '@/lib/utils'
import { Search, CheckCircle, XCircle, Sliders, Tag } from 'lucide-react'

export default function InstitutionCatalogPage() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [domainFilter, setDomainFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState<'all'|'professional'|'artisan'>('all')
  const [editOverride, setEditOverride] = useState<any>(null)

  const { data: catalog, isLoading } = useQuery({
    queryKey: ['institution-catalog'],
    queryFn: () => api.get('/catalog/institution').then(r => r.data),
  })

  const overrideMutation = useMutation({
    mutationFn: ({ categoryId, ...override }: any) =>
      api.patch(`/catalog/institution/${categoryId}`, override).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['institution-catalog'] })
      setEditOverride(null)
    },
  })

  const categories: any[] = catalog ?? []

  const domains = [...new Set(categories.map((c: any) => c.domain?.name).filter(Boolean))]

  const filtered = categories.filter((c: any) => {
    const matchSearch = !search || c.name.toLowerCase().includes(search.toLowerCase())
    const matchDomain = !domainFilter || c.domain?.name === domainFilter
    const matchType = typeFilter === 'all' || (typeFilter === 'professional' ? c.isProfessional : !c.isProfessional)
    return matchSearch && matchDomain && matchType
  })

  const enabled = categories.filter((c: any) => c.isEnabledForInstitution).length
  const total = categories.length

  return (
    <div className="max-w-5xl mx-auto p-6 pb-16">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
          <Tag className="w-6 h-6 text-indigo-600" /> My Service Catalog
        </h1>
        <p className="text-gray-500 text-sm mt-0.5">
          {enabled} of {total} service categories enabled for your institution. Enable or disable categories, and set institution-specific trust score thresholds.
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-5 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search categories..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50" />
        </div>
        <div className="flex flex-wrap gap-2">
          {['all','professional','artisan'].map(t => (
            <button key={t} onClick={() => setTypeFilter(t as any)}
              className={cn('px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors',
                typeFilter === t ? 'bg-indigo-700 text-white border-indigo-700' : 'bg-white text-gray-500 border-gray-200 hover:border-indigo-300')}>
              {t === 'all' ? 'All Types' : t === 'professional' ? '🎓 Professionals' : '🔧 Artisans & Trades'}
            </button>
          ))}
          <select value={domainFilter} onChange={e => setDomainFilter(e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-1.5 text-xs bg-white text-gray-600 focus:outline-none">
            <option value="">All Domains</option>
            {domains.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
      </div>

      {/* Category grid */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin w-7 h-7 border-2 border-indigo-600 border-t-transparent rounded-full" />
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {filtered.map((cat: any) => (
            <div key={cat.id}
              className={cn('bg-white rounded-2xl border p-4 transition-all',
                cat.isEnabledForInstitution ? 'border-gray-100 hover:border-indigo-200' : 'border-gray-100 opacity-60')}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-gray-900 text-sm">{cat.name}</p>
                    {cat.isProfessional && (
                      <span className="text-[10px] bg-violet-100 text-violet-700 px-1.5 py-0.5 rounded font-medium">Professional</span>
                    )}
                    {cat.hasOverride && (
                      <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-medium">Custom</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{cat.domain?.name}</p>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="text-xs text-gray-400">Min trust: {cat.institutionMinTrustScore}</span>
                    {(cat.skills ?? []).length > 0 && (
                      <span className="text-xs text-gray-400">{cat.skills.length} skills</span>
                    )}
                  </div>
                  {(cat.requiredCertifications ?? []).length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {cat.requiredCertifications.slice(0,3).map((cert: string) => (
                        <span key={cert} className="text-[10px] bg-amber-50 text-amber-700 border border-amber-100 rounded px-1.5 py-0.5">{cert}</span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex flex-col items-end gap-2 shrink-0">
                  <button
                    onClick={() => overrideMutation.mutate({ categoryId: cat.id, isEnabled: !cat.isEnabledForInstitution })}
                    className={cn('transition-colors', cat.isEnabledForInstitution ? 'text-emerald-500 hover:text-emerald-700' : 'text-gray-300 hover:text-gray-500')}>
                    {cat.isEnabledForInstitution
                      ? <CheckCircle className="w-5 h-5" />
                      : <XCircle className="w-5 h-5" />}
                  </button>
                  <button onClick={() => setEditOverride(cat)}
                    className="text-gray-300 hover:text-indigo-500 transition-colors">
                    <Sliders className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Override modal */}
      {editOverride && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-7 w-full max-w-sm shadow-2xl">
            <h3 className="text-xl font-black text-gray-900 mb-1">{editOverride.name}</h3>
            <p className="text-gray-500 text-sm mb-5">{editOverride.domain?.name} · Set institution-specific rules</p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Min Trust Score for your institution: <span className="text-indigo-600">{editOverride.institutionMinTrustScore ?? editOverride.defaultMinTrustScore}</span>
                </label>
                <input type="range" min="0" max="90" step="5"
                  value={editOverride.institutionMinTrustScore ?? editOverride.defaultMinTrustScore}
                  onChange={e => setEditOverride({...editOverride, institutionMinTrustScore: Number(e.target.value)})}
                  className="w-full accent-indigo-600" />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>0 (any)</span><span>Platform default: {editOverride.defaultMinTrustScore}</span><span>90</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Custom label (optional)</label>
                <input value={editOverride.customLabel ?? ''} onChange={e => setEditOverride({...editOverride, customLabel: e.target.value})}
                  placeholder={`e.g. "Estate Electrician" instead of "${editOverride.name}"`}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
            </div>

            <div className="flex gap-3 mt-5">
              <button onClick={() => setEditOverride(null)} className="flex-1 border border-gray-200 text-gray-600 py-3 rounded-xl text-sm font-semibold hover:bg-gray-50">Cancel</button>
              <button
                disabled={overrideMutation.isPending}
                onClick={() => overrideMutation.mutate({
                  categoryId: editOverride.id,
                  minTrustScore: editOverride.institutionMinTrustScore,
                  customLabel: editOverride.customLabel || null,
                })}
                className="flex-1 text-white py-3 rounded-xl text-sm font-bold hover:opacity-90 disabled:opacity-60 transition-opacity"
                style={{background:'linear-gradient(135deg,#4F46E5,#0D9488)'}}>
                {overrideMutation.isPending ? 'Saving...' : 'Save Override'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
