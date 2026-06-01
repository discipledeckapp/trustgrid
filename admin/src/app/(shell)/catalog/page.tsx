'use client'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { cn, STATUS_COLORS } from '@/lib/utils'
import {
  Plus, Edit2, Trash2, ChevronDown, ChevronRight,
  Briefcase, Shield, Search, ToggleLeft, ToggleRight,
} from 'lucide-react'

const WORKER_TYPES = ['CONTRACTOR','FREELANCER','EMPLOYEE','VOLUNTEER','INTERN']

export default function AdminCatalogPage() {
  const qc = useQueryClient()
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null)
  const [showAddCategory, setShowAddCategory] = useState(false)
  const [showAddDomain, setShowAddDomain] = useState(false)
  const [editCategory, setEditCategory] = useState<any>(null)
  const [search, setSearch] = useState('')

  // Forms
  const [catForm, setCatForm] = useState({
    domainId: '', name: '', description: '', color: '#6B7280',
    skills: '', requiredCertifications: '', allowedWorkerTypes: ['CONTRACTOR','FREELANCER'],
    defaultMinTrustScore: 50, isProfessional: false, requiresLicence: false,
  })
  const [domainForm, setDomainForm] = useState({ name: '', description: '', color: '#6B7280' })

  const { data: catalog, isLoading } = useQuery({
    queryKey: ['admin-catalog'],
    queryFn: () => api.get('/catalog?includeInactive=true').then(r => r.data),
    retry: false,
  })

  const { data: stats } = useQuery({
    queryKey: ['catalog-stats'],
    queryFn: () => api.get('/catalog/stats').then(r => r.data),
    retry: false,
  })

  const createCategoryMutation = useMutation({
    mutationFn: (data: any) => api.post('/catalog/categories', {
      ...data,
      skills: data.skills.split(',').map((s: string) => s.trim()).filter(Boolean),
      requiredCertifications: data.requiredCertifications.split(',').map((s: string) => s.trim()).filter(Boolean),
    }).then(r => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-catalog'] }); setShowAddCategory(false) },
  })

  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, ...data }: any) => api.patch(`/catalog/categories/${id}`, {
      ...data,
      skills: typeof data.skills === 'string' ? data.skills.split(',').map((s: string) => s.trim()).filter(Boolean) : data.skills,
      requiredCertifications: typeof data.requiredCertifications === 'string' ? data.requiredCertifications.split(',').map((s: string) => s.trim()).filter(Boolean) : data.requiredCertifications,
    }).then(r => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-catalog'] }); setEditCategory(null) },
  })

  const toggleCategoryMutation = useMutation({
    mutationFn: ({ id, isActive }: any) => api.patch(`/catalog/categories/${id}`, { isActive }).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-catalog'] }),
  })

  const createDomainMutation = useMutation({
    mutationFn: (data: any) => api.post('/catalog/domains', data).then(r => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-catalog'] }); setShowAddDomain(false) },
  })

  const domains: any[] = catalog ?? []
  const allCategories = domains.flatMap((d: any) => d.categories ?? [])
  const filteredCategories = search
    ? allCategories.filter((c: any) => c.name.toLowerCase().includes(search.toLowerCase()))
    : null

  return (
    <div className="p-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white">Service Catalog</h1>
          <p className="text-slate-400 text-sm mt-0.5">
            Manage the platform-wide catalog of service categories available to all institutions
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowAddDomain(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-white/5 border border-white/10 text-slate-300 rounded-xl text-xs font-medium hover:bg-white/10">
            <Plus className="w-3.5 h-3.5" /> Add Domain
          </button>
          <button onClick={() => setShowAddCategory(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-white rounded-xl text-xs font-bold hover:opacity-90"
            style={{background:'linear-gradient(135deg,#4F46E5,#0D9488)'}}>
            <Plus className="w-3.5 h-3.5" /> Add Category
          </button>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Domains', value: stats.domains, color: 'text-indigo-400' },
            { label: 'Categories', value: stats.categories, color: 'text-teal-400' },
            { label: 'Professional', value: stats.professional, color: 'text-violet-400' },
            { label: 'Artisan/Trade', value: stats.artisan, color: 'text-amber-400' },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
              <div className={`text-2xl font-black ${color}`}>{value}</div>
              <div className="text-slate-500 text-xs mt-0.5">{label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search categories..."
          className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50" />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="w-7 h-7 border-2 border-white/20 border-t-white rounded-full animate-spin" />
        </div>
      ) : filteredCategories ? (
        // Search results
        <div className="space-y-2">
          {filteredCategories.map((cat: any) => (
            <CategoryRow key={cat.id} cat={cat}
              onEdit={() => { setEditCategory({ ...cat, skills: cat.skills?.join(', '), requiredCertifications: cat.requiredCertifications?.join(', ') }) }}
              onToggle={() => toggleCategoryMutation.mutate({ id: cat.id, isActive: !cat.isActive })} />
          ))}
        </div>
      ) : (
        // Domain accordion
        <div className="space-y-2">
          {domains.map((domain: any) => (
            <div key={domain.id} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
              <button
                onClick={() => setSelectedDomain(selectedDomain === domain.id ? null : domain.id)}
                className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
                    style={{background: `${domain.color}20`, color: domain.color}}>
                    ●
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-white text-sm">{domain.name}</p>
                    <p className="text-slate-500 text-xs">{domain.categories?.length ?? 0} categories</p>
                  </div>
                </div>
                {selectedDomain === domain.id
                  ? <ChevronDown className="w-4 h-4 text-slate-500" />
                  : <ChevronRight className="w-4 h-4 text-slate-500" />}
              </button>

              {selectedDomain === domain.id && (
                <div className="border-t border-white/5 divide-y divide-white/5">
                  {(domain.categories ?? []).map((cat: any) => (
                    <CategoryRow key={cat.id} cat={cat}
                      onEdit={() => setEditCategory({ ...cat, skills: cat.skills?.join(', '), requiredCertifications: cat.requiredCertifications?.join(', ') })}
                      onToggle={() => toggleCategoryMutation.mutate({ id: cat.id, isActive: !cat.isActive })} />
                  ))}
                  {(domain.categories ?? []).length === 0 && (
                    <p className="text-center py-4 text-slate-600 text-sm">No categories yet</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add Category Modal */}
      {(showAddCategory || editCategory) && (
        <CategoryModal
          title={editCategory ? 'Edit Category' : 'Add Category'}
          form={editCategory ?? catForm}
          domains={domains}
          workerTypes={WORKER_TYPES}
          onChange={editCategory ? setEditCategory : setCatForm}
          onClose={() => { setShowAddCategory(false); setEditCategory(null) }}
          onSave={() => {
            if (editCategory) {
              updateCategoryMutation.mutate({ id: editCategory.id, ...editCategory })
            } else {
              createCategoryMutation.mutate(catForm)
            }
          }}
          saving={createCategoryMutation.isPending || updateCategoryMutation.isPending}
        />
      )}

      {/* Add Domain Modal */}
      {showAddDomain && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 w-full max-w-sm">
            <h3 className="font-bold text-white mb-4">Add Service Domain</h3>
            <div className="space-y-3 mb-4">
              <input value={domainForm.name} onChange={e => setDomainForm({...domainForm, name: e.target.value})}
                placeholder="Domain name (e.g. 'Legal Services')"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50" />
              <input value={domainForm.description} onChange={e => setDomainForm({...domainForm, description: e.target.value})}
                placeholder="Brief description"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50" />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowAddDomain(false)} className="flex-1 border border-white/10 text-slate-400 py-2.5 rounded-xl text-sm">Cancel</button>
              <button onClick={() => createDomainMutation.mutate(domainForm)}
                disabled={!domainForm.name || createDomainMutation.isPending}
                className="flex-1 text-white py-2.5 rounded-xl text-sm font-bold disabled:opacity-60"
                style={{background:'linear-gradient(135deg,#4F46E5,#0D9488)'}}>
                {createDomainMutation.isPending ? 'Saving...' : 'Create Domain'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function CategoryRow({ cat, onEdit, onToggle }: { cat: any; onEdit: () => void; onToggle: () => void }) {
  return (
    <div className={cn('flex items-center gap-4 px-5 py-3.5 transition-colors', !cat.isActive && 'opacity-40')}>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-white">{cat.name}</span>
          {cat.isProfessional && (
            <span className="text-[10px] bg-violet-500/20 text-violet-300 px-1.5 py-0.5 rounded font-medium">Professional</span>
          )}
          {cat.requiresLicence && (
            <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-medium">Licence req.</span>
          )}
        </div>
        <div className="flex items-center gap-3 mt-0.5">
          <span className="text-[10px] text-slate-500">Min trust: {cat.defaultMinTrustScore}</span>
          {(cat.skills ?? []).length > 0 && (
            <span className="text-[10px] text-slate-500">{cat.skills.length} skills</span>
          )}
          {(cat.requiredCertifications ?? []).length > 0 && (
            <span className="text-[10px] text-slate-500">{cat.requiredCertifications.join(', ')}</span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        <button onClick={onEdit} className="p-1.5 text-slate-500 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
          <Edit2 className="w-3.5 h-3.5" />
        </button>
        <button onClick={onToggle}
          className={cn('p-1.5 rounded-lg transition-colors', cat.isActive ? 'text-emerald-400 hover:bg-emerald-400/10' : 'text-slate-600 hover:bg-white/5')}>
          {cat.isActive ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
        </button>
      </div>
    </div>
  )
}

function CategoryModal({ title, form, domains, workerTypes, onChange, onClose, onSave, saving }: any) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <h3 className="font-bold text-white mb-5">{title}</h3>
        <div className="space-y-3">
          <select value={form.domainId} onChange={e => onChange({...form, domainId: e.target.value})}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none">
            <option value="" className="bg-slate-900">Select domain *</option>
            {domains.map((d: any) => <option key={d.id} value={d.id} className="bg-slate-900">{d.name}</option>)}
          </select>
          <input value={form.name} onChange={e => onChange({...form, name: e.target.value})}
            placeholder="Category name *"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50" />
          <textarea value={form.description ?? ''} onChange={e => onChange({...form, description: e.target.value})} rows={2}
            placeholder="Description (optional)"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50 resize-none" />
          <textarea value={form.skills ?? ''} onChange={e => onChange({...form, skills: e.target.value})} rows={2}
            placeholder="Skills (comma-separated): Electrician, Solar Installation, Panel Wiring"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50 resize-none" />
          <input value={form.requiredCertifications ?? ''} onChange={e => onChange({...form, requiredCertifications: e.target.value})}
            placeholder="Required certifications (comma-separated): COREN, NBA Membership"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50" />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Default min trust score</label>
              <input type="number" min="0" max="100" value={form.defaultMinTrustScore}
                onChange={e => onChange({...form, defaultMinTrustScore: Number(e.target.value)})}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none" />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Hex color</label>
              <input value={form.color ?? '#6B7280'} onChange={e => onChange({...form, color: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none" />
            </div>
          </div>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.isProfessional ?? false}
                onChange={e => onChange({...form, isProfessional: e.target.checked})}
                className="accent-indigo-500" />
              <span className="text-sm text-slate-300">Professional category</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.requiresLicence ?? false}
                onChange={e => onChange({...form, requiresLicence: e.target.checked})}
                className="accent-amber-500" />
              <span className="text-sm text-slate-300">Requires licence</span>
            </label>
          </div>
        </div>
        <div className="flex gap-3 mt-5">
          <button onClick={onClose} className="flex-1 border border-white/10 text-slate-400 py-2.5 rounded-xl text-sm">Cancel</button>
          <button onClick={onSave} disabled={!form.name || !form.domainId || saving}
            className="flex-1 text-white py-2.5 rounded-xl text-sm font-bold disabled:opacity-60"
            style={{background:'linear-gradient(135deg,#4F46E5,#0D9488)'}}>
            {saving ? 'Saving...' : 'Save Category'}
          </button>
        </div>
      </div>
    </div>
  )
}
