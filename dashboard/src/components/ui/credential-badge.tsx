import { Award, FileCheck, Shield, Wrench } from 'lucide-react'

const CREDENTIAL_ICONS: Record<string, React.ElementType> = {
  'Professional Certificate': Award,
  'Trade Licence':            FileCheck,
  'COREN Registration':       Shield,
  'Safety Certificate':       Shield,
  'Medical Certificate':      Shield,
  'DEFAULT':                  Award,
}

const CREDENTIAL_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  'Professional Certificate': { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
  'Trade Licence':            { bg: 'bg-teal-50',   text: 'text-teal-700',   border: 'border-teal-200' },
  'COREN Registration':       { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  'Safety Certificate':       { bg: 'bg-amber-50',  text: 'text-amber-700',  border: 'border-amber-200' },
  'Medical Certificate':      { bg: 'bg-rose-50',   text: 'text-rose-700',   border: 'border-rose-200' },
  'DEFAULT':                  { bg: 'bg-slate-50',  text: 'text-slate-700',  border: 'border-slate-200' },
}

interface Props {
  name: string
  isVerified?: boolean
  size?: 'sm' | 'md'
}

export function CredentialBadge({ name, isVerified = false, size = 'md' }: Props) {
  const Icon   = CREDENTIAL_ICONS[name] ?? CREDENTIAL_ICONS.DEFAULT
  const colors = CREDENTIAL_COLORS[name] ?? CREDENTIAL_COLORS.DEFAULT

  return (
    <div className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 ${colors.bg} ${colors.border}`}>
      <Icon className={`w-3.5 h-3.5 ${colors.text}`} />
      <span className={`text-xs font-semibold ${colors.text}`}>{name}</span>
      {isVerified && (
        <span className="text-emerald-600 text-xs">✓</span>
      )}
    </div>
  )
}
