'use client'
import { useState } from 'react'
import { Zap, X, Star, ShieldCheck, Users, AlertTriangle } from 'lucide-react'
import { useMobilise } from '@/hooks/useApi'
import { cn } from '@/lib/utils'
import { TrustBadge } from './TrustBadge'
import Link from 'next/link'

const SKILLS = ['Electrician','Plumber','Security Guard','Cleaner','Medical Technician','Generator Tech','IT Support']

interface Props { onClose: () => void }

export function EmergencyModal({ onClose }: Props) {
  const mobilise = useMobilise()
  const [skill, setSkill]  = useState('Electrician')
  const [desc, setDesc]    = useState('')
  const [location, setLocation] = useState('')
  const [minScore, setMinScore] = useState(50)
  const [needed, setNeeded] = useState(3)
  const [urgency, setUrgency] = useState<'HIGH'|'CRITICAL'>('HIGH')
  const [result, setResult] = useState<any>(null)

  async function handleMobilise() {
    const data = await mobilise.mutateAsync({
      skill, description: desc || `Emergency ${skill} needed`,
      locationAddress: location || undefined,
      minimumTrustScore: minScore,
      workersNeeded: needed,
      urgency,
    })
    setResult(data)
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-orange-600 px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-black text-white text-lg">Emergency Mobilisation</h2>
              <p className="text-red-100 text-xs">Find verified workers instantly</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/60 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {!result ? (
            <div className="space-y-4">
              {/* Urgency */}
              <div className="flex gap-2">
                {(['HIGH', 'CRITICAL'] as const).map(u => (
                  <button key={u} onClick={() => setUrgency(u)}
                    className={cn('flex-1 py-2.5 rounded-xl text-sm font-bold border transition-colors',
                      urgency === u
                        ? u === 'CRITICAL' ? 'bg-red-600 text-white border-red-600' : 'bg-orange-500 text-white border-orange-500'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400')}>
                    {u === 'CRITICAL' ? '🚨 Critical' : '⚠️ High Priority'}
                  </button>
                ))}
              </div>

              {/* Skill */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Skill needed *</label>
                <select value={skill} onChange={e => setSkill(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 bg-white">
                  {SKILLS.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Situation (optional)</label>
                <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={2}
                  placeholder="e.g. Total power outage in Block D, generator also down"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 resize-none" />
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Location</label>
                <input value={location} onChange={e => setLocation(e.target.value)}
                  placeholder="e.g. Block D, Gate 3"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
              </div>

              {/* Workers + min score */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Workers needed</label>
                  <input type="number" min="1" max="20" value={needed} onChange={e => setNeeded(Number(e.target.value))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Min trust: {minScore}</label>
                  <input type="range" min="0" max="80" step="5" value={minScore}
                    onChange={e => setMinScore(Number(e.target.value))}
                    className="w-full mt-2 accent-red-600" />
                </div>
              </div>

              <button onClick={handleMobilise} disabled={mobilise.isPending}
                className="w-full py-3.5 rounded-xl text-sm font-black text-white flex items-center justify-center gap-2 disabled:opacity-60 transition-all"
                style={{ background: 'linear-gradient(135deg, #DC2626, #EA580C)' }}>
                {mobilise.isPending ? (
                  <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Finding workers...</>
                ) : (
                  <><Zap className="w-4 h-4" /> Mobilise Now</>
                )}
              </button>
            </div>
          ) : (
            // Results
            <div>
              <div className={cn('rounded-2xl p-4 mb-4 flex items-start gap-3',
                result.enoughWorkers ? 'bg-emerald-50 border border-emerald-200' : 'bg-amber-50 border border-amber-200')}>
                {result.enoughWorkers
                  ? <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  : <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />}
                <div>
                  <p className={`text-sm font-bold ${result.enoughWorkers ? 'text-emerald-800' : 'text-amber-800'}`}>
                    {result.enoughWorkers ? '✓ Workers found' : '⚠ Limited availability'}
                  </p>
                  <p className={`text-xs mt-0.5 ${result.enoughWorkers ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {result.message}
                  </p>
                </div>
              </div>

              {/* Top matched workers */}
              <div className="space-y-2 mb-4">
                {result.matched.slice(0, 5).map((w: any) => (
                  <Link key={w.id} href={`/service-requests/${result.requestId}`} onClick={onClose}>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                      <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center text-sm font-black text-blue-700 shrink-0">
                        {w.firstName[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{w.firstName} {w.lastName}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          {w.averageRating && <span><Star className="w-3 h-3 inline fill-amber-400 text-amber-400" /> {w.averageRating.toFixed(1)}</span>}
                          <span><Users className="w-3 h-3 inline" /> {w.totalDeployments} jobs</span>
                        </div>
                      </div>
                      <TrustBadge score={w.trustScore} grade={w.trustGrade} color={w.trustGradeColor ?? '#4F46E5'} size="sm" />
                    </div>
                  </Link>
                ))}
              </div>

              <div className="flex gap-3">
                <button onClick={onClose}
                  className="flex-1 border border-gray-200 text-gray-700 py-3 rounded-xl text-sm font-semibold hover:bg-gray-50">
                  Close
                </button>
                <Link href={`/service-requests/${result.requestId}`} onClick={onClose}
                  className="flex-1 text-center py-3 rounded-xl text-sm font-bold text-white transition-colors"
                  style={{ background: 'linear-gradient(135deg,#4F46E5,#0D9488)' }}>
                  Assign Workers →
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
