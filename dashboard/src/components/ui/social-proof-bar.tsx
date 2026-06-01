import { Star, Briefcase, ThumbsUp, MapPin, Clock } from 'lucide-react'

interface Props {
  rating?: number | null
  ratingCount?: number
  totalDeployments?: number
  endorsementCount?: number
  yearsExperience?: number
  primarySkill?: string
  size?: 'sm' | 'md'
}

export function SocialProofBar({
  rating, ratingCount, totalDeployments,
  endorsementCount, yearsExperience, size = 'md',
}: Props) {
  const items = [
    rating != null && {
      icon: Star,
      label: `${rating.toFixed(1)}`,
      sub: ratingCount ? `(${ratingCount})` : undefined,
      color: 'text-amber-500',
      fillIcon: true,
    },
    totalDeployments != null && totalDeployments > 0 && {
      icon: Briefcase,
      label: `${totalDeployments}`,
      sub: totalDeployments === 1 ? 'job' : 'jobs',
      color: 'text-blue-600',
    },
    endorsementCount != null && endorsementCount > 0 && {
      icon: ThumbsUp,
      label: `${endorsementCount}`,
      sub: endorsementCount === 1 ? 'vouch' : 'vouches',
      color: 'text-purple-600',
    },
    yearsExperience != null && yearsExperience > 0 && {
      icon: Clock,
      label: `${yearsExperience}yr`,
      sub: undefined,
      color: 'text-gray-500',
    },
  ].filter(Boolean) as Array<{
    icon: React.ElementType
    label: string
    sub?: string
    color: string
    fillIcon?: boolean
  }>

  if (items.length === 0) return null

  const textSize = size === 'sm' ? 'text-xs' : 'text-sm'
  const iconSize = size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'

  return (
    <div className="flex items-center flex-wrap gap-x-4 gap-y-1">
      {items.map((item, i) => {
        const Icon = item.icon
        return (
          <div key={i} className={`flex items-center gap-1 ${textSize}`}>
            <Icon
              className={`${iconSize} ${item.color} ${item.fillIcon ? 'fill-current' : ''}`}
            />
            <span className="font-semibold text-gray-800">{item.label}</span>
            {item.sub && <span className="text-gray-400">{item.sub}</span>}
          </div>
        )
      })}
    </div>
  )
}
