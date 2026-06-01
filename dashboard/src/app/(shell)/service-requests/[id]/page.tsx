'use client'
import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, Users, Shield, MapPin, Calendar,
  CheckCircle, Clock, AlertCircle, UserCheck,
} from 'lucide-react'
import { useServiceRequest, useMatchedWorkers, useAssignWorkers, useSubmitReview } from '@/hooks/useApi'
import { TrustBadge } from '@/components/ui/TrustBadge'
import { cn, STATUS_COLORS, formatDate } from '@/lib/utils'
import type { Worker } from '@/types'

export default function ServiceRequestDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  const { data: request, isLoading, refetch } = useServiceRequest(id)
  const { data: matchedWorkers = [], isLoading: matchLoading } = useMatchedWorkers(id)
  const assignWorkers = useAssignWorkers(id)
  const submitReview = useSubmitReview()

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [assigning, setAssigning] = useState(false)
  const [reviewOpen, setReviewOpen] = useState(false)
  const [reviewWorker, setReviewWorker] = useState<Worker | null>(null)
  const [reviewForm, setReviewForm] = useState({ overallRating: 5, comment: '' })
  const [assignSuccess, setAssignSuccess] = useState(false)

  function toggleWorker(workerId: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      next.has(workerId) ? next.delete(workerId) : next.add(workerId)
      return next
    })
  }

  function selectAll() {
    const needed = request?.workersNeeded ?? 0
    const ids = (matchedWorkers as Worker[]).slice(0, needed).map((w) => w.id)
    setSelectedIds(new Set(ids))
  }

  async function handleAssign() {
    if (selectedIds.size === 0) return
    setAssigning(true)
    try {
      await assignWorkers.mutateAsync([...selectedIds])
      setAssignSuccess(true)
      refetch()
      setSelectedIds(new Set())
    } finally {
      setAssigning(false)
    }
  }

  function openReview(worker: Worker) {
    setReviewWorker(worker)
    setReviewForm({ overallRating: 5, comment: '' })
    setReviewOpen(true)
  }

  async function handleReviewSubmit() {
    if (!reviewWorker) return
    await submitReview.mutateAsync({
      serviceRequestId: id,
      workerId: reviewWorker.id,
      overallRating: reviewForm.overallRating,
      comment: reviewForm.comment,
    })
    setReviewOpen(false)
    setReviewWorker(null)
    refetch()
  }

  if (isLoading) {
    return (
      <div className="p-8 flex justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-blue-700 border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!request) return <div className="p-8 text-gray-500">Request not found</div>

  const canAssign = ['SUBMITTED', 'REVIEWING'].includes(request.status)
  const isComplete = request.status === 'COMPLETED'
  const workers = matchedWorkers as Worker[]
  const needed = request.workersNeeded

  return (
    <div className="p-6 max-w-6xl">
      <Link href="/service-requests"
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-5">
        <ArrowLeft className="w-4 h-4" /> Back to Requests
      </Link>

      {/* Request Header */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-5">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{request.title}</h1>
            <p className="text-gray-500 mt-1">{request.description}</p>
          </div>
          <span className={cn('text-sm font-semibold px-3 py-1.5 rounded-lg shrink-0',
            STATUS_COLORS[request.status] ?? 'bg-gray-100 text-gray-600')}>
            {request.status}
          </span>
        </div>

        <div className="flex flex-wrap gap-4 text-sm text-gray-500">
          <span className="flex items-center gap-1.5">
            <Users className="w-4 h-4" />
            {request.workersNeeded} workers needed
          </span>
          {request.minimumTrustScore && (
            <span className="flex items-center gap-1.5">
              <Shield className="w-4 h-4" />
              Trust ≥ {request.minimumTrustScore}
            </span>
          )}
          {request.locationAddress && (
            <span className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4" />
              {request.locationAddress}
            </span>
          )}
          {request.scheduledStartAt && (
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              {formatDate(request.scheduledStartAt)}
              {request.scheduledEndAt && ` — ${formatDate(request.scheduledEndAt)}`}
            </span>
          )}
        </div>
      </div>

      {/* Assignment success banner */}
      {assignSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-5 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          <div>
            <p className="font-semibold text-emerald-800">Workers assigned successfully!</p>
            <p className="text-sm text-emerald-600">All assigned workers have been notified.</p>
          </div>
        </div>
      )}

      {/* Matched Workers Panel */}
      <div className="bg-white rounded-2xl border border-gray-100">
        {/* Panel header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-gray-900">
              {canAssign ? 'Matching Workers' : 'Workforce'}
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {matchLoading ? 'Finding matches...' : `${workers.length} workers qualify · ${needed} needed`}
              {!matchLoading && workers.length >= needed
                ? <span className="text-emerald-600 font-medium"> · ✓ Enough workers</span>
                : !matchLoading
                  ? <span className="text-amber-600 font-medium"> · ⚠ Fewer than needed</span>
                  : null}
            </p>
          </div>

          {canAssign && (
            <div className="flex items-center gap-3">
              {selectedIds.size > 0 && (
                <span className="text-sm text-blue-700 font-medium">
                  {selectedIds.size} selected
                </span>
              )}
              <button
                onClick={selectAll}
                className="text-sm text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition-colors"
              >
                Select top {needed}
              </button>
              <button
                onClick={handleAssign}
                disabled={selectedIds.size === 0 || assigning}
                className="flex items-center gap-2 bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-800 disabled:opacity-50 transition-colors"
              >
                <UserCheck className="w-4 h-4" />
                {assigning ? 'Assigning...' : `Assign ${selectedIds.size || needed} Workers`}
              </button>
            </div>
          )}
        </div>

        {/* Worker List */}
        {matchLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin w-8 h-8 border-2 border-blue-700 border-t-transparent rounded-full" />
          </div>
        ) : workers.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <AlertCircle className="w-10 h-10 mx-auto mb-3 opacity-50" />
            <p className="font-medium">No workers match the criteria</p>
            <p className="text-sm mt-1">Try lowering the minimum trust score requirement</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {workers.map((worker, index) => {
              const selected = selectedIds.has(worker.id)
              const inTopN = index < needed

              return (
                <div
                  key={worker.id}
                  className={cn(
                    'flex items-center gap-4 px-6 py-4 transition-colors',
                    canAssign && 'cursor-pointer hover:bg-gray-50',
                    selected && 'bg-blue-50',
                  )}
                  onClick={canAssign ? () => toggleWorker(worker.id) : undefined}
                >
                  {/* Selection indicator */}
                  {canAssign && (
                    <div className={cn(
                      'w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors',
                      selected ? 'bg-blue-700 border-blue-700' : 'border-gray-300',
                    )}>
                      {selected && <CheckCircle className="w-3.5 h-3.5 text-white fill-current" />}
                    </div>
                  )}

                  {/* Rank */}
                  <span className={cn(
                    'text-xs font-bold w-6 text-center shrink-0',
                    inTopN ? 'text-blue-700' : 'text-gray-300',
                  )}>
                    #{index + 1}
                  </span>

                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                    <span className="text-blue-700 font-bold">{worker.firstName[0]}</span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-sm text-gray-900 truncate">
                        {worker.firstName} {worker.lastName}
                      </span>
                      {worker.verificationStatus === 'FULLY_VERIFIED' && (
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-gray-400">{worker.primarySkill}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-gray-400">{worker.totalDeployments} jobs</span>
                      {worker.averageRating && (
                        <span className="text-xs text-gray-400">⭐ {worker.averageRating.toFixed(1)}</span>
                      )}
                      {worker.isAvailable && (
                        <span className="text-xs text-emerald-600 font-medium">Available</span>
                      )}
                    </div>
                  </div>

                  {/* Trust badge */}
                  <TrustBadge
                    score={worker.trustScore}
                    grade={worker.trustGrade}
                    color={worker.trustGradeColor}
                    size="md"
                  />

                  {/* Actions for completed requests */}
                  {isComplete && (
                    <button
                      onClick={(e) => { e.stopPropagation(); openReview(worker) }}
                      className="text-xs bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1.5 rounded-lg hover:bg-amber-100 transition-colors font-medium shrink-0"
                    >
                      Rate Worker
                    </button>
                  )}

                  {/* Profile link */}
                  <Link
                    href={`/workers/${worker.id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="text-xs text-gray-400 hover:text-blue-700 shrink-0 transition-colors"
                  >
                    View →
                  </Link>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Performance Review Modal */}
      {reviewOpen && reviewWorker && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h3 className="font-bold text-lg mb-1">
              Rate {reviewWorker.firstName} {reviewWorker.lastName}
            </h3>
            <p className="text-sm text-gray-500 mb-5">{reviewWorker.primarySkill}</p>

            {/* Star Rating */}
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Overall Rating *</p>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewForm((f) => ({ ...f, overallRating: star }))}
                    className={cn(
                      'text-3xl transition-transform hover:scale-110',
                      star <= reviewForm.overallRating ? 'text-amber-400' : 'text-gray-200',
                    )}
                  >
                    ★
                  </button>
                ))}
                <span className="self-center text-sm text-gray-500 ml-2">
                  {['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'][reviewForm.overallRating]}
                </span>
              </div>
            </div>

            <div className="mb-5">
              <p className="text-sm font-medium text-gray-700 mb-1.5">Comment (optional)</p>
              <textarea
                rows={3}
                value={reviewForm.comment}
                onChange={(e) => setReviewForm((f) => ({ ...f, comment: e.target.value }))}
                placeholder="Describe the worker's performance, professionalism, punctuality..."
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            <div className="bg-blue-50 rounded-lg px-4 py-3 text-xs text-blue-700 mb-4">
              This review will update {reviewWorker.firstName}'s trust score automatically.
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setReviewOpen(false)}
                className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleReviewSubmit}
                disabled={submitReview.isPending}
                className="flex-1 bg-blue-700 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-800 disabled:opacity-60"
              >
                {submitReview.isPending ? 'Saving...' : 'Submit Review'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
