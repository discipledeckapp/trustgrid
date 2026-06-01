import { ShieldCheck, ShieldAlert, Shield, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

type Status = 'FULLY_VERIFIED' | 'PARTIALLY_VERIFIED' | 'UNVERIFIED' | 'PENDING' | 'VERIFICATION_FAILED'

interface Props {
  status: Status
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
}

const CONFIG: Record<Status, {
  icon: React.ElementType
  label: string
  bg: string
  text: string
  border: string
  iconColor: string
}> = {
  FULLY_VERIFIED: {
    icon: ShieldCheck,
    label: 'Identity Verified',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    iconColor: 'text-emerald-600',
  },
  PARTIALLY_VERIFIED: {
    icon: Shield,
    label: 'ID Confirmed',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
    iconColor: 'text-blue-600',
  },
  PENDING: {
    icon: Clock,
    label: 'Verification Pending',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    iconColor: 'text-amber-500',
  },
  UNVERIFIED: {
    icon: ShieldAlert,
    label: 'Unverified',
    bg: 'bg-gray-50',
    text: 'text-gray-500',
    border: 'border-gray-200',
    iconColor: 'text-gray-400',
  },
  VERIFICATION_FAILED: {
    icon: ShieldAlert,
    label: 'Verification Failed',
    bg: 'bg-red-50',
    text: 'text-red-600',
    border: 'border-red-200',
    iconColor: 'text-red-500',
  },
}

const ICON_SIZE = { sm: 'w-3 h-3', md: 'w-4 h-4', lg: 'w-5 h-5' }
const TEXT_SIZE = { sm: 'text-xs', md: 'text-xs', lg: 'text-sm' }
const PAD = { sm: 'px-1.5 py-0.5', md: 'px-2.5 py-1', lg: 'px-3 py-1.5' }

export function VerificationBadge({ status, size = 'md', showLabel = true }: Props) {
  const c = CONFIG[status] ?? CONFIG.UNVERIFIED
  const Icon = c.icon

  return (
    <div className={cn(
      'inline-flex items-center gap-1.5 rounded-full border font-medium',
      c.bg, c.text, c.border, PAD[size],
    )}>
      <Icon className={cn(ICON_SIZE[size], c.iconColor)} />
      {showLabel && <span className={TEXT_SIZE[size]}>{c.label}</span>}
    </div>
  )
}
