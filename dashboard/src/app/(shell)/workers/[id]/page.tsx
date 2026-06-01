'use client'
import { useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, Briefcase, ThumbsUp, Star,
  ShieldCheck, AlertTriangle, CheckCircle,
} from 'lucide-react'
import { useWorker, useWorkerTrustScore, useEndorseWorker, useSubmitReview } from '@/hooks/useApi'
import { TrustGauge } from '@/components/ui/trust-gauge'
import { VerificationBadge } from '@/components/ui/verification-badge'
import { EndorsementCard } from '@/components/ui/endorsement-card'

export default function WorkerProfilePage() {
  const { id } = useParams<{ id: string }>()
  const { data: worker, isLoading, refetch } = useWorker(id)
  const { data: trustData } = useWorkerTrustScore(id)
  const endorseMutation  = useEndorseWorker(id)
  const reviewMutation   = useSubmitReview()

  const [endorseOpen, setEndorseOpen] = useState(false)
  const [reviewOpen,  setReviewOpen]  = useState(false)
  const [form,  setForm]  = useState({ endorserName: '', endorserRole: '', comment: '' })
  const [rform, setRform] = useState({ overallRating: 5, comment: '' })

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-96">
      <div className="animate-spin w-10 h-10 border-2 border-blue-700 border-t-transparent rounded-full" />
    </div>
  )
  if (!worker) return <div className="p-8 text-gray-500">Worker not found</div>

  const completionRate = worker.completionRate ? Math.round(worker.completionRate * 100) : null

  return (
    <div className="max-w-4xl mx-auto pb-20">
      {/* Back nav */}
      <div className="px-6 pt-6 pb-4">
        <Link href="/workers" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Workforce Registry
        </Link>
      </div>

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <div className="mx-6 rounded-3xl overflow-hidden bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-900 shadow-xl shadow-blue-900/25 mb-6">
        <div className="px-8 pt-8 pb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {/* Avatar with verification overlay */}
            <div className="relative shrink-0">
              <div className="w-24 h-24 rounded-2xl bg-white/20 backdrop-blur border border-white/20 flex items-center justify-center text-4xl font-black text-white">
                {worker.firstName[0]}
              </div>
              {worker.identityVerified && (
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-white shadow-md">
                  <ShieldCheck className="w-4 h-4 text-white" />
                </div>
              )}
            </div>

            {/* Identity block */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-2xl font-black text-white">{worker.firstName} {worker.lastName}</h1>
                <VerificationBadge status={worker.verificationStatus as any} size="sm" />
              </div>
              <p className="text-blue-200 font-medium mb-4">
                {worker.primarySkill}{worker.yearsExperience ? ` · ${worker.yearsExperience}yrs exp` : ''}
              </p>
              {/* Social proof pills */}
              <div className="flex flex-wrap gap-2">
                {worker.averageRating != null && (
                  <span className="inline-flex items-center gap-1 bg-white/15 rounded-full px-3 py-1 text-sm">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span className="font-bold text-white">{worker.averageRating.toFixed(1)}</span>
                    <span className="text-blue-200">avg</span>
                  </span>
                )}
                {worker.totalDeployments > 0 && (
                  <span className="inline-flex items-center gap-1 bg-white/15 rounded-full px-3 py-1 text-sm">
                    <Briefcase className="w-3.5 h-3.5 text-blue-200" />
                    <span className="font-bold text-white">{worker.totalDeployments}</span>
                    <span className="text-blue-200">jobs</span>
                  </span>
                )}
                {worker.totalEndorsements > 0 && (
                  <span className="inline-flex items-center gap-1 bg-white/15 rounded-full px-3 py-1 text-sm">
                    <ThumbsUp className="w-3.5 h-3.5 text-blue-200" />
                    <span className="font-bold text-white">{worker.totalEndorsements}</span>
                    <span className="text-blue-200">{worker.totalEndorsements === 1 ? 'vouch' : 'vouches'}</span>
                  </span>
                )}
              </div>
            </div>

            {/* Trust gauge */}
            <div className="shrink-0">
              <TrustGauge
                score={worker.trustScore}
                grade={worker.trustGrade}
                gradeLabel={worker.trustGradeLabel ?? 'Trust Score'}
                size="lg"
                showLabel
                showTrend={trustData?.trend ?? null}
              />
            </div>
          </div>
        </div>

        {/* Availability bar */}
        <div className={`px-8 py-3 flex items-center gap-2 border-t border-white/10 ${worker.isAvailable ? 'bg-emerald-600/30' : 'bg-white/5'}`}>
          <div className={`w-2 h-2 rounded-full ${worker.isAvailable ? 'bg-emerald-300 animate-pulse' : 'bg-gray-400'}`} />
          <span className="text-sm text-white font-medium">
            {worker.isAvailable ? 'Available for assignments right now' : 'Not currently available'}
          </span>
          {(worker.incidentHistory?.open ?? 0) > 0 && (
            <span className="ml-auto inline-flex items-center gap-1 bg-red-500/30 rounded-full px-3 py-0.5 text-xs text-red-200 font-medium">
              <AlertTriangle className="w-3 h-3" />
              {worker.incidentHistory.open} open incident
            </span>
          )}
        </div>
      </div>

      <div className="px-6 space-y-5">
        {/* Action buttons */}
        <div className="flex flex-wrap gap-3">
          {/* Trust Passport — the hero CTA */}
          <Link href={`/workers/${id}/passport`}
            className="flex items-center gap-2 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:opacity-90 transition-opacity shadow-md"
            style={{ background: 'linear-gradient(135deg, #4F46E5 0%, #0D9488 100%)' }}>
            <ShieldCheck className="w-4 h-4" /> View Trust Passport
          </Link>
          <button onClick={() => setEndorseOpen(true)}
            className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors">
            <ThumbsUp className="w-4 h-4" /> Vouch for {worker.firstName}
          </button>
          <button onClick={() => setReviewOpen(true)}
            className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors">
            <Star className="w-4 h-4" /> Leave a Review
          </button>
        </div>

        {/* Trust breakdown */}
        {trustData && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-50 flex items-center justify-between">
              <div>
                <h2 className="font-bold text-gray-900">How {worker.firstName}'s Trust Score is Built</h2>
                <p className="text-sm text-gray-500 mt-0.5">Every deployment, review, and endorsement contributes</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-black text-gray-900">{worker.trustScore.toFixed(1)}</div>
                <div className="text-xs text-gray-400">out of 100</div>
              </div>
            </div>
            <div className="px-6 py-5 space-y-4">
              {[
                { label: 'Identity Verified',   value: trustData.verificationScore, color: 'bg-emerald-500', max: 15, icon: ShieldCheck },
                { label: 'Jobs Completed',       value: trustData.deploymentScore,   color: 'bg-blue-500',    max: 40, icon: Briefcase },
                { label: 'Performance Ratings',  value: trustData.ratingScore,       color: 'bg-amber-500',   max: 30, icon: Star },
                { label: 'Community Endorsements',value: trustData.endorsementScore, color: 'bg-purple-500',  max: 15, icon: ThumbsUp },
              ].map(({ label, value, color, max, icon: Icon }) => (
                <div key={label}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <Icon className="w-3.5 h-3.5 text-gray-400" />
                      <span className="text-sm text-gray-700">{label}</span>
                    </div>
                    <span className="text-sm font-bold text-gray-900">+{Math.max(0, value).toFixed(1)}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${color} transition-all duration-700`}
                      style={{ width: `${Math.min(100, (Math.max(0, value) / max) * 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stats grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Completion Rate', value: completionRate != null ? `${completionRate}%` : '—', sub: `${worker.completedDeployments}/${worker.totalDeployments} jobs`, color: 'text-emerald-700', bg: 'bg-emerald-50', icon: CheckCircle },
            { label: 'Avg Rating', value: worker.averageRating ? worker.averageRating.toFixed(1) : '—', sub: 'out of 5.0 ⭐', color: 'text-amber-700', bg: 'bg-amber-50', icon: Star },
            { label: 'Community Vouches', value: worker.totalEndorsements, sub: 'people vouch', color: 'text-purple-700', bg: 'bg-purple-50', icon: ThumbsUp },
            { label: 'Incidents', value: worker.incidentHistory?.total ?? 0, sub: `${worker.incidentHistory?.resolved ?? 0} resolved`, color: (worker.incidentHistory?.open ?? 0) > 0 ? 'text-red-700' : 'text-gray-500', bg: (worker.incidentHistory?.open ?? 0) > 0 ? 'bg-red-50' : 'bg-gray-50', icon: AlertTriangle },
          ].map(({ label, value, sub, color, bg, icon: Icon }) => (
            <div key={label} className={`${bg} rounded-2xl p-4`}>
              <Icon className={`w-4 h-4 ${color} mb-2 opacity-70`} />
              <div className={`text-2xl font-black ${color}`}>{value}</div>
              <div className="text-xs font-semibold text-gray-600 mt-0.5">{label}</div>
              <div className="text-xs text-gray-400">{sub}</div>
            </div>
          ))}
        </div>

        {/* Bio & Skills */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-3">About {worker.firstName}</h2>
          {worker.bio && <p className="text-gray-600 leading-relaxed mb-4 text-sm">{worker.bio}</p>}
          <div className="flex flex-wrap gap-2">
            {worker.skills.map((skill: string) => (
              <span key={skill} className="bg-blue-50 text-blue-700 border border-blue-100 rounded-full px-3 py-1 text-sm font-medium">
                {skill}
              </span>
            ))}
          </div>
          {(worker.hourlyRate || worker.dailyRate) && (
            <div className="mt-4 pt-4 border-t border-gray-50 flex gap-6 text-sm">
              {worker.hourlyRate && <div><span className="text-gray-400">Hourly </span><span className="font-bold text-gray-900">₦{worker.hourlyRate.toLocaleString()}</span></div>}
              {worker.dailyRate && <div><span className="text-gray-400">Daily </span><span className="font-bold text-gray-900">₦{worker.dailyRate.toLocaleString()}</span></div>}
            </div>
          )}
        </div>

        {/* Endorsements */}
        {worker.endorsements?.length > 0 && (
          <div>
            <div className="flex items-end justify-between mb-4">
              <div>
                <h2 className="font-bold text-gray-900">People who vouch for {worker.firstName}</h2>
                <p className="text-sm text-gray-500 mt-0.5">{worker.endorsements.length} personal {worker.endorsements.length === 1 ? 'endorsement' : 'endorsements'} from the community</p>
              </div>
              <span className="text-3xl font-black text-purple-600">{worker.totalEndorsements}</span>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              {worker.endorsements.map((e: any) => <EndorsementCard key={e.id} endorsement={e} />)}
            </div>
          </div>
        )}

        {/* Reviews */}
        {worker.recentReviews?.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h2 className="font-bold text-gray-900 mb-4">What employers say</h2>
            <div className="space-y-4">
              {worker.recentReviews.map((r: any) => (
                <div key={r.id} className="flex items-start gap-3 py-3 border-b border-gray-50 last:border-0">
                  <div className="flex shrink-0">
                    {[1,2,3,4,5].map(s => (
                      <Star key={s} className={`w-4 h-4 ${s <= Math.round(r.overallRating) ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />
                    ))}
                  </div>
                  {r.comment && <p className="text-sm text-gray-600 flex-1 italic">"{r.comment}"</p>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Endorse modal */}
      {endorseOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-7 w-full max-w-md shadow-2xl">
            <div className="text-center mb-6">
              <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <ThumbsUp className="w-7 h-7 text-blue-700" />
              </div>
              <h3 className="text-xl font-black text-gray-900">Vouch for {worker.firstName}</h3>
              <p className="text-sm text-gray-500 mt-1">Your name goes on this. It builds their reputation in the community.</p>
            </div>
            <div className="space-y-3 mb-4">
              <input placeholder="Your name *" value={form.endorserName} onChange={e => setForm({...form, endorserName: e.target.value})}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <input placeholder="Your role (e.g. Estate Manager)" value={form.endorserRole} onChange={e => setForm({...form, endorserRole: e.target.value})}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <textarea placeholder={`Why do you trust ${worker.firstName}?`} rows={3} value={form.comment} onChange={e => setForm({...form, comment: e.target.value})}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
            </div>
            <div className="bg-blue-50 rounded-xl px-4 py-3 text-xs text-blue-700 mb-4">
              Your endorsement is public and carries institutional weight.
            </div>
            <div className="flex gap-3">
              <button onClick={() => setEndorseOpen(false)} className="flex-1 border border-gray-200 py-3 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50">Cancel</button>
              <button disabled={!form.endorserName || endorseMutation.isPending}
                onClick={() => endorseMutation.mutate(form, { onSuccess: () => { setEndorseOpen(false); refetch() }})}
                className="flex-1 bg-blue-700 text-white py-3 rounded-xl text-sm font-bold hover:bg-blue-800 disabled:opacity-60 transition-colors">
                {endorseMutation.isPending ? 'Saving...' : `Vouch for ${worker.firstName}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Review modal */}
      {reviewOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-7 w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-black text-gray-900 mb-1">Rate {worker.firstName}</h3>
            <p className="text-sm text-gray-500 mb-5">Your review updates their trust score automatically.</p>
            <div className="flex justify-center gap-3 mb-5">
              {[1,2,3,4,5].map(s => (
                <button key={s} type="button" onClick={() => setRform(f => ({...f, overallRating: s}))}
                  className={`text-4xl transition-transform hover:scale-110 ${s <= rform.overallRating ? 'text-amber-400' : 'text-gray-200'}`}>★</button>
              ))}
            </div>
            <textarea rows={3} value={rform.comment} onChange={e => setRform(f => ({...f, comment: e.target.value}))}
              placeholder="What was it like working with them? (optional)"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none mb-4" />
            <div className="flex gap-3">
              <button onClick={() => setReviewOpen(false)} className="flex-1 border border-gray-200 py-3 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50">Cancel</button>
              <button
                disabled={reviewMutation.isPending}
                onClick={() => reviewMutation.mutate({ workerId: id, overallRating: rform.overallRating, comment: rform.comment || undefined },
                  { onSuccess: () => { setReviewOpen(false); refetch() }})}
                className="flex-1 bg-amber-500 text-white py-3 rounded-xl text-sm font-bold hover:bg-amber-600 disabled:opacity-60 transition-colors">
                {reviewMutation.isPending ? 'Saving...' : 'Submit Review'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
