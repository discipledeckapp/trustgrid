import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function gradeColor(color: string): string {
  return color ?? '#64748B'
}

export function formatCurrency(amount: number, currency = 'NGN'): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-NG', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

export function timeAgo(iso: string): string {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (seconds < 60) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}

export const STATUS_COLORS: Record<string, string> = {
  DRAFT:         'bg-gray-100 text-gray-600',
  SUBMITTED:     'bg-blue-100 text-blue-700',
  REVIEWING:     'bg-purple-100 text-purple-700',
  ASSIGNED:      'bg-amber-100 text-amber-700',
  IN_PROGRESS:   'bg-teal-100 text-teal-700',
  COMPLETED:     'bg-green-100 text-green-700',
  CANCELLED:     'bg-red-100 text-red-600',
  OPEN:          'bg-red-100 text-red-600',
  RESOLVED:      'bg-green-100 text-green-700',
  UNDER_INVESTIGATION: 'bg-amber-100 text-amber-700',
  LOW:           'bg-blue-100 text-blue-600',
  MEDIUM:        'bg-amber-100 text-amber-700',
  HIGH:          'bg-orange-100 text-orange-700',
  CRITICAL:      'bg-red-100 text-red-700',
}
