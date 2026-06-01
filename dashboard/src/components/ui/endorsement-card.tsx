import { Quote } from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface Endorsement {
  id: string
  endorserName: string
  endorserRole?: string
  comment?: string
  weight: number
  createdAt: string
}

interface Props {
  endorsement: Endorsement
}

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
}

function getAvatarColor(name: string) {
  const colors = [
    'bg-blue-100 text-blue-700',
    'bg-purple-100 text-purple-700',
    'bg-emerald-100 text-emerald-700',
    'bg-amber-100 text-amber-700',
    'bg-pink-100 text-pink-700',
    'bg-indigo-100 text-indigo-700',
  ]
  return colors[name.charCodeAt(0) % colors.length]
}

const isInstitutional = (weight: number) => weight >= 3

export function EndorsementCard({ endorsement: e }: Props) {
  const institutional = isInstitutional(e.weight)

  return (
    <div className={`relative rounded-2xl p-5 border transition-shadow hover:shadow-sm ${
      institutional
        ? 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100'
        : 'bg-white border-gray-100'
    }`}>
      {/* Quote mark */}
      <Quote className="w-6 h-6 text-blue-200 absolute top-4 right-4" />

      {/* Endorser avatar + name */}
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${getAvatarColor(e.endorserName)}`}>
          {getInitials(e.endorserName)}
        </div>
        <div>
          <p className="font-semibold text-gray-900 text-sm">{e.endorserName}</p>
          {e.endorserRole && (
            <p className="text-xs text-gray-500">{e.endorserRole}</p>
          )}
        </div>
        {institutional && (
          <span className="ml-auto text-xs bg-blue-700 text-white px-2 py-0.5 rounded-full font-medium">
            Institution
          </span>
        )}
      </div>

      {/* Comment */}
      {e.comment && (
        <p className="text-sm text-gray-700 leading-relaxed italic">"{e.comment}"</p>
      )}

      <p className="text-xs text-gray-400 mt-3">{formatDate(e.createdAt)}</p>
    </div>
  )
}
