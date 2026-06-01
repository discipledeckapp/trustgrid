/**
 * Community Trust Passport
 * ─────────────────────────────────────────────────────────────────────────────
 * The flagship screen of TrustGrid.
 * This is the centrepiece of the Kingdom Hack 3.0 demo.
 *
 * Communicates in under 3 seconds:
 *   - Who this person is
 *   - How trusted they are (and why)
 *   - Who vouches for them
 *   - What institutions they have served
 *   - Their permanent community record
 */
'use client'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ShieldCheck, Briefcase, ThumbsUp, Star, Calendar, Award, Share2, QrCode, ArrowUpRight } from 'lucide-react'
import { useWorker, useWorkerTrustScore, useVerifiedDetails, useWorkerPhoto } from '@/hooks/useApi'
import { TrustGauge } from '@/components/ui/trust-gauge'
import { VerificationBadge } from '@/components/ui/verification-badge'
import { FaceStack } from '@/components/ui/face-stack'
import { CredentialBadge } from '@/components/ui/credential-badge'
import { cn } from '@/lib/utils'

const GRADE_RING: Record<string, string> = {
  'A+': 'ring-emerald-500',  'A':  'ring-teal-500',
  'B+': 'ring-indigo-500',   'B':  'ring-violet-500',
  'C':  'ring-amber-500',    'D':  'ring-orange-500',
  'F':  'ring-red-500',
}

const GRADE_TEXT: Record<string, string> = {
  'A+': 'text-emerald-600', 'A': 'text-teal-600',
  'B+': 'text-indigo-600',  'B': 'text-violet-600',
  'C':  'text-amber-600',   'D': 'text-orange-600',
  'F':  'text-red-600',
}

export default function TrustPassportPage() {
  const { id } = useParams<{ id: string }>()
  const { data: worker, isLoading } = useWorker(id)
  const { data: trust }             = useWorkerTrustScore(id)
  const { data: identity }          = useVerifiedDetails(id)
  const { data: photoData }         = useWorkerPhoto(id)

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-screen bg-canvas">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-3xl bg-brand-gradient flex items-center justify-center animate-pulse">
          <ShieldCheck className="w-8 h-8 text-white" />
        </div>
        <p className="text-slate-500 text-sm font-medium">Loading Trust Passport…</p>
      </div>
    </div>
  )

  if (!worker) return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-slate-500">Passport not found</p>
    </div>
  )

  const grade     = worker.trustGrade ?? 'F'
  const gradeText = GRADE_TEXT[grade] ?? 'text-slate-600'
  const gradeRing = GRADE_RING[grade] ?? 'ring-slate-300'

  // Endorser faces from endorsements data
  const endorserFaces = (worker.endorsements ?? []).map((e: any) => ({
    name: e.endorserName,
    role: e.endorserRole,
  }))

  return (
    <div className="min-h-screen bg-canvas">
      {/* Back + actions bar */}
      <div className="max-w-3xl mx-auto px-6 pt-6 pb-2 flex items-center justify-between">
        <Link href={`/workers/${id}`}
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Profile
        </Link>
        <div className="flex items-center gap-2">
          <button className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 border border-slate-200 rounded-lg px-3 py-1.5 hover:bg-white transition-all">
            <QrCode className="w-3.5 h-3.5" /> QR Code
          </button>
          <button className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-brand-600 rounded-lg px-3 py-1.5 hover:bg-brand-700 transition-colors shadow-brand">
            <Share2 className="w-3.5 h-3.5" /> Share Passport
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 pb-16">

        {/* ── PASSPORT CARD ──────────────────────────────────────────────── */}
        <div className="bg-white rounded-3xl overflow-hidden shadow-passport border border-slate-100 mt-4">

          {/* ── HEADER: Identity + Trust Score ───────────────────────────── */}
          <div className="passport-header px-8 pt-8 pb-8">
            {/* Passport label */}
            <div className="flex items-center justify-between mb-6">
              <div className="inline-flex items-center gap-2 bg-white/15 rounded-full px-3 py-1">
                <span className="text-xs font-bold text-white/90 tracking-widest uppercase">
                  Community Trust Passport
                </span>
              </div>
              <div className="text-white/50 text-xs font-mono">
                TGP-{id.slice(-8).toUpperCase()}
              </div>
            </div>

            <div className="flex items-end justify-between gap-6">
              {/* Avatar with trust ring — shows live photo when available */}
              <div className="flex items-end gap-5">
                <div className="relative shrink-0">
                  {photoData?.photo ? (
                    // Real live photo (taken during verification)
                    <div className={cn(
                      'w-24 h-24 rounded-2xl overflow-hidden ring-4 ring-offset-2 ring-offset-transparent border-2 border-white/30',
                      gradeRing,
                    )}>
                      <img
                        src={`data:image/jpeg;base64,${photoData.photo.replace(/^data:image\/\w+;base64,/, '')}`}
                        alt={`${worker.firstName} ${worker.lastName}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    // Fallback initials avatar
                    <div className={cn(
                      'w-24 h-24 rounded-2xl bg-white/20 backdrop-blur border border-white/30 flex items-center justify-center text-4xl font-black text-white ring-4 ring-offset-2 ring-offset-transparent',
                      gradeRing,
                    )}>
                      {worker.firstName[0]}
                    </div>
                  )}
                  {worker.identityVerified && (
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-white shadow">
                      <ShieldCheck className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>

                <div className="mb-1">
                  {/* Legal name (from NIMC) when verified, otherwise registered name */}
                  <h1 className="text-2xl font-black text-white leading-tight">
                    {identity?.legalName && identity.legalName !== 'Not verified yet'
                      ? identity.legalName
                      : `${worker.firstName} ${worker.lastName}`}
                  </h1>
                  {identity?.legalName && identity.legalName !== 'Not verified yet' && (
                    <p className="text-emerald-300 text-xs font-semibold mt-0.5">
                      ✓ Name verified against government records
                    </p>
                  )}
                  <p className="text-blue-100 font-medium text-base mt-1">
                    {worker.primarySkill}
                    {worker.yearsExperience ? ` · ${worker.yearsExperience}yr experience` : ''}
                    {identity?.birthYear ? ` · Born ${identity.birthYear}` : ''}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 mt-3">
                    <VerificationBadge status={worker.verificationStatus as any} size="sm" />
                    {worker.isAvailable && (
                      <span className="inline-flex items-center gap-1.5 bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 rounded-full px-2.5 py-0.5 text-xs font-semibold">
                        <span className="w-1.5 h-1.5 bg-emerald-300 rounded-full animate-pulse" />
                        Available
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Trust Score Gauge */}
              <div className="shrink-0 bg-white/10 backdrop-blur rounded-2xl p-4 text-center">
                <TrustGauge
                  score={worker.trustScore}
                  grade={grade}
                  gradeLabel={worker.trustGradeLabel ?? 'Trust Score'}
                  size="lg"
                  showLabel
                  showTrend={trust?.trend ?? null}
                />
              </div>
            </div>
          </div>

          {/* ── BODY ─────────────────────────────────────────────────────── */}
          <div className="divide-y divide-slate-50">

            {/* Trust Score Breakdown */}
            <div className="px-8 py-6">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
                Trust Score Breakdown
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {trust && [
                  { label: 'Identity Verified',    value: trust.verificationScore, max: 15, color: 'bg-emerald-500' },
                  { label: 'Jobs Completed',        value: trust.deploymentScore,   max: 40, color: 'bg-brand-600' },
                  { label: 'Performance Ratings',   value: trust.ratingScore,       max: 30, color: 'bg-amber-500' },
                  { label: 'Community Endorsements',value: trust.endorsementScore,  max: 15, color: 'bg-violet-500' },
                ].map(({ label, value, max, color }) => (
                  <div key={label} className="space-y-1.5">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600 font-medium">{label}</span>
                      <span className="font-bold text-slate-900">+{Math.max(0, value).toFixed(1)}</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full ${color} rounded-full`}
                        style={{ width: `${Math.min(100, (Math.max(0, value) / max) * 100)}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Verification */}
            <div className="px-8 py-6">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
                Verification Record
              </h2>
              <div className="flex flex-wrap gap-2">
                <VerificationBadge status={worker.verificationStatus as any} size="md" showLabel />
                {worker.verificationStatus === 'FULLY_VERIFIED' && (
                  <>
                    <span className="inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-full px-3 py-1 text-xs font-semibold">
                      <ShieldCheck className="w-3.5 h-3.5" /> NIN Confirmed
                    </span>
                    {worker.faceMatchPassed && (
                      <span className="inline-flex items-center gap-1.5 bg-teal-50 border border-teal-200 text-teal-700 rounded-full px-3 py-1 text-xs font-semibold">
                        <ShieldCheck className="w-3.5 h-3.5" /> Face Match ✓
                      </span>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Credentials */}
            {worker.credentials?.length > 0 && (
              <div className="px-8 py-6">
                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
                  Professional Credentials
                </h2>
                <div className="flex flex-wrap gap-2">
                  {worker.credentials.map((c: any) => (
                    <CredentialBadge key={c.id} name={c.credentialType} isVerified={c.isVerified} />
                  ))}
                </div>
              </div>
            )}

            {/* Community endorsements */}
            {endorserFaces.length > 0 && (
              <div className="px-8 py-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Community Vouches
                  </h2>
                  <span className={`text-2xl font-black ${gradeText}`}>
                    {worker.totalEndorsements}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <FaceStack faces={endorserFaces} maxVisible={6} size={36} />
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      {endorserFaces.slice(0, 2).map((f: any) => f.name).join(', ')}
                      {endorserFaces.length > 2 && ` and ${endorserFaces.length - 2} others`}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      have personally vouched for {worker.firstName}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Recent deployments timeline */}
            {worker.recentReviews?.length > 0 && (
              <div className="px-8 py-6">
                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
                  Recent Deployments
                </h2>
                <div className="trust-timeline">
                  {worker.recentReviews.slice(0, 4).map((r: any, i: number) => (
                    <div key={r.id} className={`trust-timeline-item ${r.overallRating >= 4 ? 'positive' : r.overallRating <= 2 ? 'negative' : ''}`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-slate-800">
                            {r.overallRating >= 4 ? 'Excellent performance' :
                             r.overallRating === 3 ? 'Satisfactory performance' :
                             'Below expectations'}
                          </p>
                          {r.comment && (
                            <p className="text-xs text-slate-500 mt-0.5 italic">"{r.comment}"</p>
                          )}
                        </div>
                        <div className="flex gap-0.5 shrink-0 ml-4">
                          {[1,2,3,4,5].map(s => (
                            <Star key={s} className={`w-3.5 h-3.5 ${s <= Math.round(r.overallRating) ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Community Record Summary */}
            <div className="px-8 py-6 bg-gradient-to-r from-slate-50 to-white">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
                Community Record
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { icon: Briefcase, value: worker.totalDeployments, label: 'Jobs Done', color: 'text-brand-600' },
                  { icon: Star,      value: worker.averageRating?.toFixed(1) ?? '—', label: 'Avg Rating', color: 'text-amber-600' },
                  { icon: ThumbsUp,  value: worker.totalEndorsements, label: 'Vouches', color: 'text-violet-600' },
                  { icon: Award,     value: worker.incidentHistory?.total ?? 0, label: 'Incidents', color: (worker.incidentHistory?.open ?? 0) > 0 ? 'text-rose-600' : 'text-slate-400' },
                ].map(({ icon: Icon, value, label, color }) => (
                  <div key={label} className="text-center">
                    <Icon className={`w-5 h-5 mx-auto mb-1 ${color}`} />
                    <div className={`text-xl font-black ${color}`}>{value}</div>
                    <div className="text-xs text-slate-500 font-medium">{label}</div>
                  </div>
                ))}
              </div>

              {/* Percentile callout */}
              {worker.totalDeployments > 5 && (
                <div className="mt-4 bg-brand-50 border border-brand-100 rounded-2xl px-5 py-3 flex items-center gap-3">
                  <div className="w-8 h-8 bg-brand-100 rounded-xl flex items-center justify-center shrink-0">
                    <ArrowUpRight className="w-4 h-4 text-brand-600" />
                  </div>
                  <p className="text-sm text-brand-700">
                    <span className="font-bold">{worker.firstName}</span> is in the{' '}
                    <span className="font-black">
                      {worker.trustScore >= 90 ? 'top 5%' :
                       worker.trustScore >= 80 ? 'top 15%' :
                       worker.trustScore >= 70 ? 'top 30%' : 'top half'}
                    </span>{' '}
                    of {worker.primarySkill}s in this registry
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-8 py-5 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                {/* Network G mini mark */}
                <svg width="20" height="20" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="pg" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#4F46E5"/>
                      <stop offset="100%" stopColor="#06B6D4"/>
                    </linearGradient>
                  </defs>
                  <path d="M 21 26 C 12 38, 12 62, 24 80 C 32 88, 42 92, 52 92 C 62 92, 72 88, 80 80 C 88 72, 90 62, 90 50" stroke="url(#pg)" strokeWidth="3" strokeLinecap="round" fill="none"/>
                  <path d="M 90 50 L 52 50 L 76 50" stroke="url(#pg)" strokeWidth="3" strokeLinecap="round" fill="none"/>
                  <circle cx="52" cy="50" r="4" fill="url(#pg)"/>
                  <circle cx="90" cy="50" r="3.5" fill="url(#pg)"/>
                  <circle cx="52" cy="92" r="3" fill="url(#pg)"/>
                </svg>
                <span className="text-xs font-bold text-slate-700">TrustGrid</span>
                <span className="text-xs text-slate-400">· Verified Community Record</span>
              </div>
              <div className="text-xs text-slate-400 font-mono">
                {new Date().toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
              </div>
            </div>
          </div>
        </div>

        {/* Assign CTA below passport */}
        <div className="mt-5 flex gap-3">
          <Link href={`/workers/${id}`}
            className="flex-1 flex items-center justify-center gap-2 border border-slate-200 bg-white text-slate-700 py-3.5 rounded-2xl text-sm font-semibold hover:bg-slate-50 transition-colors">
            View Full Profile
          </Link>
          <Link href={`/service-requests`}
            className="flex-1 flex items-center justify-center gap-2 bg-brand-gradient text-white py-3.5 rounded-2xl text-sm font-bold hover:opacity-90 transition-opacity shadow-brand">
            <Briefcase className="w-4 h-4" /> Assign to Request
          </Link>
        </div>
      </div>
    </div>
  )
}
