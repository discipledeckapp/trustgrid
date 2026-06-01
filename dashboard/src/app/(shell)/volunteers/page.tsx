'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useVolunteers, useCreateVolunteer } from '@/hooks/useApi'
import { Users, Plus, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

const SKILLS = ['Medical Volunteer','Welfare Worker','Event Support','Transport','Security','IT Support','Catering','General']

export default function VolunteersPage() {
  const [skillFilter, setSkillFilter] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ firstName:'', lastName:'', phone:'', skills:[] as string[] })
  const createVolunteer = useCreateVolunteer()

  const { data, isLoading } = useVolunteers({ skill: skillFilter || undefined, limit: 50 })
  const volunteers = data?.data ?? []
  const total = data?.pagination?.total ?? 0

  async function handleCreate() {
    await createVolunteer.mutateAsync(form)
    setShowAdd(false)
    setForm({ firstName:'', lastName:'', phone:'', skills:[] })
  }

  return (
    <div className="max-w-5xl mx-auto p-6 pb-16">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Volunteer Registry</h1>
          <p className="text-gray-500 text-sm mt-0.5">{total} volunteers registered</p>
        </div>
        <button onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 bg-teal-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-teal-800 transition-colors">
          <Plus className="w-4 h-4" /> Add Volunteer
        </button>
      </div>

      {/* Skill filter */}
      <div className="flex flex-wrap gap-2 mb-5 bg-white rounded-xl border border-gray-100 p-3">
        <button onClick={() => setSkillFilter('')}
          className={cn('px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors',
            !skillFilter ? 'bg-teal-700 text-white border-teal-700' : 'bg-white text-gray-500 border-gray-200 hover:border-teal-300')}>
          All Skills
        </button>
        {SKILLS.map(s => (
          <button key={s} onClick={() => setSkillFilter(s)}
            className={cn('px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors',
              skillFilter === s ? 'bg-teal-700 text-white border-teal-700' : 'bg-white text-gray-500 border-gray-200 hover:border-teal-300')}>
            {s}
          </button>
        ))}
      </div>

      {/* Volunteer list */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin w-7 h-7 border-2 border-teal-700 border-t-transparent rounded-full" />
        </div>
      ) : volunteers.length === 0 ? (
        <div className="flex flex-col items-center py-20 bg-white rounded-2xl border border-gray-100">
          <Users className="w-12 h-12 text-gray-200 mb-4" />
          <p className="font-semibold text-gray-700 mb-1">No volunteers yet</p>
          <p className="text-sm text-gray-400">Add volunteers to build your community corps</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {volunteers.map((v: any) => (
            <div key={v.id} className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3 hover:border-teal-200 hover:shadow-sm transition-all">
              <div className="w-11 h-11 rounded-xl bg-teal-100 flex items-center justify-center text-lg font-black text-teal-700 shrink-0">
                {v.firstName[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 truncate">{v.firstName} {v.lastName}</p>
                <p className="text-xs text-gray-400 truncate">{v.skills?.join(', ')}</p>
              </div>
              <div>
                {v.isAvailable ? (
                  <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-semibold">
                    <CheckCircle className="w-3 h-3" /> Available
                  </span>
                ) : (
                  <span className="text-xs text-gray-400">Unavailable</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-7 w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-black text-gray-900 mb-5">Add Volunteer</h3>
            <div className="space-y-3 mb-4">
              <div className="grid grid-cols-2 gap-3">
                <input value={form.firstName} onChange={e => setForm({...form, firstName:e.target.value})}
                  placeholder="First name *" className="border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
                <input value={form.lastName} onChange={e => setForm({...form, lastName:e.target.value})}
                  placeholder="Last name *" className="border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
              </div>
              <input value={form.phone} onChange={e => setForm({...form, phone:e.target.value})}
                placeholder="Phone *" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Skills</p>
                <div className="flex flex-wrap gap-2">
                  {SKILLS.map(s => (
                    <button key={s} type="button"
                      onClick={() => setForm(f => ({ ...f, skills: f.skills.includes(s) ? f.skills.filter(x => x !== s) : [...f.skills, s] }))}
                      className={cn('px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors',
                        form.skills.includes(s) ? 'bg-teal-700 text-white border-teal-700' : 'bg-white text-gray-600 border-gray-200 hover:border-teal-300')}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowAdd(false)} className="flex-1 border border-gray-200 text-gray-600 py-3 rounded-xl text-sm font-semibold hover:bg-gray-50">Cancel</button>
              <button disabled={!form.firstName || !form.phone || createVolunteer.isPending}
                onClick={handleCreate}
                className="flex-1 bg-teal-700 text-white py-3 rounded-xl text-sm font-bold hover:bg-teal-800 disabled:opacity-60 transition-colors">
                {createVolunteer.isPending ? 'Adding...' : 'Add Volunteer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
