import Link from 'next/link'
import { ShieldCheck, Star, Briefcase, ThumbsUp, CheckCircle } from 'lucide-react'
import { TrustBadge } from '@/components/ui/TrustBadge'
import type { Worker } from '@/types'

export function WorkerCard({ worker }: { worker: Worker }) {
  const gradeColor = (hex: string) => {
    try { return `#${parseInt(hex.replace('#',''), 16).toString(16).padStart(6,'0')}` }
    catch { return '#64748B' }
  }
  const hex = worker.trustGradeColor ?? '#64748B'

  return (
    <Link href={`/workers/${worker.id}`}>
      <div className="group bg-white rounded-2xl border border-gray-100 p-5 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-50 transition-all duration-200 cursor-pointer">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="relative shrink-0">
            {worker.profilePhotoUrl ? (
              <img
                src={worker.profilePhotoUrl}
                alt={`${worker.firstName} ${worker.lastName}`}
                className="w-14 h-14 rounded-2xl object-cover border border-gray-100"
              />
            ) : (
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-xl font-black text-blue-700">
                {worker.firstName[0]}
              </div>
            )}
            {worker.verificationStatus === 'FULLY_VERIFIED' && (
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-white">
                <ShieldCheck className="w-2.5 h-2.5 text-white" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className="font-bold text-gray-900 truncate group-hover:text-blue-700 transition-colors">
              {worker.firstName} {worker.lastName}
            </p>
            <p className="text-sm text-gray-500 truncate">{worker.primarySkill}</p>

            {/* Stats row */}
            <div className="flex items-center flex-wrap gap-3 mt-2">
              {worker.averageRating != null && (
                <span className="flex items-center gap-1 text-xs">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span className="font-semibold text-gray-700">{worker.averageRating.toFixed(1)}</span>
                </span>
              )}
              {worker.totalDeployments > 0 && (
                <span className="flex items-center gap-1 text-xs text-gray-500">
                  <Briefcase className="w-3 h-3" />
                  <span>{worker.totalDeployments} jobs</span>
                </span>
              )}
              {worker.endorsementCount > 0 && (
                <span className="flex items-center gap-1 text-xs text-gray-500">
                  <ThumbsUp className="w-3 h-3" />
                  <span>{worker.endorsementCount}</span>
                </span>
              )}
            </div>
          </div>

          {/* Trust badge + available */}
          <div className="shrink-0 flex flex-col items-end gap-2">
            <TrustBadge score={worker.trustScore} grade={worker.trustGrade} color={hex} size="md" />
            {worker.isAvailable && (
              <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-semibold">
                <CheckCircle className="w-3 h-3" /> Available
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
