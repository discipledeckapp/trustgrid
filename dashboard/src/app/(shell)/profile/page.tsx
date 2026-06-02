'use client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { useState } from 'react'
import { User, Briefcase, Shield, Star, CheckCircle, Plus } from 'lucide-react'
import Link from 'next/link'

const SKILLS = [
  'Electrician', 'Plumber', 'Carpenter', 'Mason', 'Painter', 'Welder',
  'Lawyer', 'Accountant', 'Software Engineer', 'Architect', 'Civil Engineer',
  'Doctor', 'Nurse', 'Pharmacist',
  'Security Guard', 'Driver', 'Cleaner', 'Cook',
  'Event Manager', 'Photographer', 'Designer', 'Teacher',
]

export default function MyProfilePage() {
  const qc = useQueryClient()
  const [primarySkill, setPrimarySkill] = useState('')
  const [bio, setBio]                   = useState('')
  const [yearsExp, setYearsExp]         = useState('')
  const [hourlyRate, setHourlyRate]     = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['my-worker-profile'],
    queryFn: () => api.get('/workers/me/profile').then(r => r.data),
  })

  const createMutation = useMutation({
    mutationFn: () => api.post('/workers/me/profile', {
      primarySkill,
      skills: [primarySkill],
      bio: bio || undefined,
      yearsExperience: yearsExp ? Number(yearsExp) : undefined,
      hourlyRate: hourlyRate ? Number(hourlyRate) : undefined,
    }).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['my-worker-profile'] }),
  })

  const profile = data?.profiles?.[0] ?? data?.profile ?? (data && !data.profiles ? data : null)

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto p-6 pb-16">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
          <User className="w-6 h-6 text-indigo-600" /> My Profile
        </h1>
        <p className="text-gray-500 text-sm mt-0.5">Your worker identity on TrustGrid. Portable across all communities.</p>
      </div>

      {profile ? (
        <div className="space-y-5">
          {/* Profile card */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <div className="flex items-start gap-4">
              {profile.user?.profilePhotoUrl ? (
                <img src={profile.user.profilePhotoUrl} className="w-16 h-16 rounded-2xl object-cover" alt="" />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center text-2xl font-black text-indigo-600">
                  {profile.user?.firstName?.[0] ?? '?'}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-black text-gray-900">
                  {profile.user?.firstName} {profile.user?.lastName}
                </h2>
                <p className="text-indigo-600 font-semibold text-sm">{profile.primarySkill}</p>
                {profile.yearsExperience && (
                  <p className="text-gray-400 text-xs mt-0.5">{profile.yearsExperience} years experience</p>
                )}
                {profile.bio && (
                  <p className="text-gray-600 text-sm mt-2 leading-relaxed">{profile.bio}</p>
                )}
                {profile.hourlyRate && (
                  <p className="text-gray-500 text-xs mt-1.5 font-medium">
                    ₦{profile.hourlyRate.toLocaleString()} / day
                  </p>
                )}
              </div>
              <div className="text-right shrink-0">
                <div className="text-3xl font-black text-gray-900">{Math.round(profile.trustScore ?? 0)}</div>
                <div className="text-xs text-gray-400 mt-0.5">Trust Score</div>
                {profile.isGlobal && (
                  <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-bold mt-2 inline-block border border-indigo-100">
                    Global Profile
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Verification status */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <h3 className="font-bold text-gray-900 text-sm mb-3 flex items-center gap-2">
              <Shield className="w-4 h-4 text-indigo-600" /> Identity Verification
            </h3>
            <div className="flex items-center gap-3 flex-wrap">
              {profile.verificationStatus === 'FULLY_VERIFIED' ? (
                <span className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full text-sm font-semibold">
                  <CheckCircle className="w-4 h-4" /> Fully Verified
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-full text-sm font-semibold">
                  {profile.verificationStatus === 'UNVERIFIED' ? 'Not verified yet' : (profile.verificationStatus ?? 'Pending')}
                </span>
              )}
              <Link href="/passport" className="text-indigo-600 text-sm font-semibold hover:underline">
                View Trust Passport →
              </Link>
            </div>
          </div>

          {/* Skills */}
          {profile.skills && profile.skills.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <h3 className="font-bold text-gray-900 text-sm mb-3 flex items-center gap-2">
                <Star className="w-4 h-4 text-indigo-600" /> Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((s: string) => (
                  <span key={s} className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-semibold border border-indigo-100">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Trust Passport CTA */}
          <div className="bg-gradient-to-br from-indigo-600 to-teal-600 rounded-2xl p-5 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-black text-base">Your Trust Passport</p>
                <p className="text-white/70 text-sm mt-0.5">Share your verified identity with any community.</p>
              </div>
              <Link href="/passport"
                className="shrink-0 bg-white/15 hover:bg-white/25 transition-colors px-4 py-2 rounded-xl text-sm font-bold border border-white/20">
                View →
              </Link>
            </div>
          </div>
        </div>
      ) : (
        /* No profile — show creation form */
        <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center mx-auto mb-3">
              <Briefcase className="w-7 h-7 text-indigo-600" />
            </div>
            <h2 className="text-lg font-black text-gray-900">Add your worker profile</h2>
            <p className="text-gray-500 text-sm mt-1 leading-relaxed">
              Your skills and profile are portable across all communities on TrustGrid.
            </p>
          </div>

          {createMutation.isError && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600 mb-4">
              {(createMutation.error as any)?.response?.data?.message ?? 'Something went wrong. Please try again.'}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Primary skill</label>
              <select value={primarySkill} onChange={e => setPrimarySkill(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white" required>
                <option value="">Select your main skill…</option>
                {SKILLS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Bio <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3}
                placeholder="Brief description of your experience and expertise…"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Years experience</label>
                <input type="number" value={yearsExp} onChange={e => setYearsExp(e.target.value)}
                  min="0" max="50"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Daily rate (₦) <span className="text-gray-400 font-normal">optional</span>
                </label>
                <input type="number" value={hourlyRate} onChange={e => setHourlyRate(e.target.value)}
                  min="0"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
            </div>

            <button onClick={() => createMutation.mutate()}
              disabled={!primarySkill || createMutation.isPending}
              className="w-full text-white py-3.5 rounded-xl font-bold hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2 transition-opacity"
              style={{ background: 'linear-gradient(135deg,#4F46E5,#0D9488)' }}>
              {createMutation.isPending ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Creating…
                </>
              ) : (
                <><Plus className="w-4 h-4" /> Create Worker Profile</>
              )}
            </button>
          </div>

          <div className="mt-6 pt-5 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-400">
              Your profile is portable — once created, it travels with you across every community on TrustGrid.
            </p>
            <Link href="/passport" className="text-xs text-indigo-600 font-semibold hover:underline mt-1 inline-block">
              Learn about Trust Passports →
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
