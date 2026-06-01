import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const STATUS_COLORS: Record<string, string> = {
  DRAFT:          'bg-gray-100 text-gray-600',
  SUBMITTED:      'bg-blue-100 text-blue-700',
  UNDER_REVIEW:   'bg-purple-100 text-purple-700',
  NEEDS_MORE_INFO:'bg-amber-100 text-amber-700',
  APPROVED:       'bg-emerald-100 text-emerald-700',
  REJECTED:       'bg-red-100 text-red-600',
  ACTIVE:         'bg-emerald-100 text-emerald-700',
  SUSPENDED:      'bg-red-100 text-red-600',
  FULLY_VERIFIED: 'bg-emerald-100 text-emerald-700',
  UNVERIFIED:     'bg-gray-100 text-gray-600',
  PENDING:        'bg-amber-100 text-amber-700',
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function timeAgo(iso: string) {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (seconds < 60) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}
