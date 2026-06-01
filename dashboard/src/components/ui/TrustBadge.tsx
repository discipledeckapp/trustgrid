import { cn } from '@/lib/utils'

interface Props {
  score: number
  grade: string
  color: string
  size?: 'sm' | 'md' | 'lg'
}

function hexToRgba(hex: string, alpha: number) {
  try {
    const h = hex.replace('#', '')
    const r = parseInt(h.slice(0, 2), 16)
    const g = parseInt(h.slice(2, 4), 16)
    const b = parseInt(h.slice(4, 6), 16)
    return `rgba(${r},${g},${b},${alpha})`
  } catch {
    return `rgba(100,116,139,${alpha})`
  }
}

export function TrustBadge({ score, grade, color, size = 'md' }: Props) {
  return (
    <div
      className={cn(
        'inline-flex flex-col items-center rounded-xl font-bold leading-tight border',
        size === 'sm' && 'px-2 py-1 text-xs gap-0',
        size === 'md' && 'px-3 py-1.5 text-sm gap-0.5',
        size === 'lg' && 'px-4 py-2.5 text-base gap-1',
      )}
      style={{
        backgroundColor: hexToRgba(color, 0.08),
        color,
        borderColor: hexToRgba(color, 0.20),
      }}
    >
      <span className="font-black">{grade}</span>
      <span style={{ opacity: 0.75, fontSize: '0.85em' }}>{score.toFixed(1)}</span>
    </div>
  )
}
