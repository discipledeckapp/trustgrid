'use client'
import { useState, useEffect } from 'react'
import { useInstitutionConfig, useUpdateConfig } from '@/hooks/useApi'
import { Save, Settings, Sliders, Tag, Shield, Bell, RefreshCw } from 'lucide-react'

const DEFAULT_WEIGHTS = {
  account_created: 5,
  identity_verified: 10,
  credential_verified: 5,
  deployment_completed: 2,
  deployment_abandoned: -3,
  'rating_5_star': 3,
  'rating_4_star': 1.5,
  'rating_3_star': 0.5,
  'rating_2_star': -1,
  'rating_1_star': -2.5,
  endorsement_added: 1.5,
  endorsement_removed: -1.5,
  incident_raised: -5,
  incident_resolved: 3,
  incident_dismissed: 1,
  inactivity_penalty: -0.5,
}

export default function SettingsPage() {
  const { data: config, isLoading } = useInstitutionConfig()
  const updateConfig = useUpdateConfig()

  const [weights, setWeights]   = useState<Record<string, number>>(DEFAULT_WEIGHTS)
  const [minScore, setMinScore] = useState(50)
  const [decayDays, setDecayDays] = useState(365)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (config) {
      setWeights({ ...DEFAULT_WEIGHTS, ...(config.trustScoreWeights as Record<string, number> ?? {}) })
      setMinScore(config.minimumTrustScore ?? 50)
      setDecayDays(config.trustScoreTimeDecayDays ?? 365)
    }
  }, [config])

  async function handleSave() {
    await updateConfig.mutateAsync({
      trustScoreWeights: weights,
      minimumTrustScore: minScore,
      trustScoreTimeDecayDays: decayDays,
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const WEIGHT_GROUPS = [
    {
      title: 'Identity & Credentials',
      icon: Shield,
      color: 'emerald',
      keys: ['account_created', 'identity_verified', 'credential_verified'],
      labels: { account_created: 'Account created', identity_verified: 'Identity verified', credential_verified: 'Credential verified' },
    },
    {
      title: 'Deployments',
      icon: Sliders,
      color: 'blue',
      keys: ['deployment_completed', 'deployment_abandoned'],
      labels: { deployment_completed: 'Deployment completed', deployment_abandoned: 'Deployment abandoned' },
    },
    {
      title: 'Performance Ratings',
      icon: Tag,
      color: 'amber',
      keys: ['rating_5_star', 'rating_4_star', 'rating_3_star', 'rating_2_star', 'rating_1_star'],
      labels: { 'rating_5_star': '5-star rating', 'rating_4_star': '4-star rating', 'rating_3_star': '3-star rating', 'rating_2_star': '2-star rating', 'rating_1_star': '1-star rating' },
    },
    {
      title: 'Community',
      icon: Settings,
      color: 'violet',
      keys: ['endorsement_added', 'endorsement_removed'],
      labels: { endorsement_added: 'Endorsement added', endorsement_removed: 'Endorsement removed' },
    },
    {
      title: 'Incidents',
      icon: Bell,
      color: 'red',
      keys: ['incident_raised', 'incident_resolved', 'incident_dismissed', 'inactivity_penalty'],
      labels: { incident_raised: 'Incident raised', incident_resolved: 'Incident resolved', incident_dismissed: 'Incident dismissed', inactivity_penalty: 'Inactivity penalty (90d)' },
    },
  ]

  if (isLoading) return (
    <div className="flex justify-center py-16">
      <div className="animate-spin w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full" />
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto p-6 pb-16">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Settings</h1>
          <p className="text-gray-500 text-sm mt-0.5">Configure trust scoring, verification, and governance rules for your institution</p>
        </div>
        <button
          onClick={handleSave}
          disabled={updateConfig.isPending}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-60"
          style={{ background: saved ? '#059669' : 'linear-gradient(135deg,#4F46E5,#0D9488)' }}
        >
          {updateConfig.isPending ? (
            <><RefreshCw className="w-4 h-4 animate-spin" /> Saving...</>
          ) : saved ? (
            <><Save className="w-4 h-4" /> Saved!</>
          ) : (
            <><Save className="w-4 h-4" /> Save Changes</>
          )}
        </button>
      </div>

      {/* Global thresholds */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-5">
        <h2 className="font-bold text-gray-900 mb-5">Global Trust Thresholds</h2>
        <div className="grid sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Minimum Trust Score: <span className="text-indigo-600 font-black">{minScore}</span>
            </label>
            <p className="text-xs text-gray-400 mb-2">Workers below this score cannot be assigned to service requests</p>
            <input type="range" min="0" max="90" step="5" value={minScore}
              onChange={e => setMinScore(Number(e.target.value))}
              className="w-full accent-indigo-600" />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>0 (any)</span><span>45</span><span>90</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Trust Score Decay: <span className="text-teal-600 font-black">{decayDays} days</span>
            </label>
            <p className="text-xs text-gray-400 mb-2">Events older than this half-life carry less weight (higher = slower decay)</p>
            <input type="range" min="90" max="730" step="30" value={decayDays}
              onChange={e => setDecayDays(Number(e.target.value))}
              className="w-full accent-teal-600" />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>90d (fast)</span><span>1yr</span><span>2yr (slow)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Trust score weights */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="font-bold text-gray-900 mb-1">Trust Score Event Weights</h2>
        <p className="text-sm text-gray-500 mb-6">
          Positive values build trust, negative values reduce it. These weights apply to every new event in your institution.
        </p>

        <div className="space-y-8">
          {WEIGHT_GROUPS.map(({ title, icon: Icon, color, keys, labels }) => (
            <div key={title}>
              <div className="flex items-center gap-2 mb-4">
                <div className={`w-7 h-7 rounded-lg bg-${color}-100 flex items-center justify-center`}>
                  <Icon className={`w-4 h-4 text-${color}-600`} />
                </div>
                <h3 className="font-semibold text-gray-800 text-sm">{title}</h3>
              </div>
              <div className="space-y-4">
                {keys.map(key => {
                  const value = weights[key] ?? 0
                  const isNeg = value < 0
                  return (
                    <div key={key} className="flex items-center gap-4">
                      <span className="text-sm text-gray-600 w-44 shrink-0">
                        {(labels as Record<string, string>)[key]}
                      </span>
                      <input
                        type="range"
                        min={isNeg || value <= 0 ? -10 : -1}
                        max={isNeg ? 0 : 10}
                        step="0.5"
                        value={value}
                        onChange={e => setWeights(w => ({ ...w, [key]: Number(e.target.value) }))}
                        className="flex-1"
                        style={{ accentColor: value >= 0 ? '#059669' : '#E11D48' }}
                      />
                      <span className={`w-12 text-right text-sm font-bold tabular-nums ${value >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                        {value >= 0 ? '+' : ''}{value}
                      </span>
                      <button
                        onClick={() => setWeights(w => ({ ...w, [key]: DEFAULT_WEIGHTS[key as keyof typeof DEFAULT_WEIGHTS] ?? 0 }))}
                        className="text-xs text-gray-300 hover:text-gray-500 transition-colors"
                        title="Reset to default"
                      >
                        ↺
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
