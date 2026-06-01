'use client'

interface TrustGaugeProps {
  score: number
  grade: string
  gradeLabel: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showLabel?: boolean
  showTrend?: 'IMPROVING' | 'DECLINING' | 'STABLE' | null
}

const SIZE = {
  sm:  { outer: 64,  stroke: 6,  text: 'text-base',  grade: 'text-xs' },
  md:  { outer: 96,  stroke: 8,  text: 'text-xl',    grade: 'text-sm' },
  lg:  { outer: 132, stroke: 10, text: 'text-3xl',   grade: 'text-base' },
  xl:  { outer: 172, stroke: 12, text: 'text-4xl',   grade: 'text-lg' },
}

const GRADE_STOPS: Record<string, { start: string; end: string }> = {
  'A+': { start: '#10b981', end: '#059669' },
  'A':  { start: '#34d399', end: '#10b981' },
  'B+': { start: '#6ee7b7', end: '#34d399' },
  'B':  { start: '#fbbf24', end: '#f59e0b' },
  'C':  { start: '#f59e0b', end: '#d97706' },
  'D':  { start: '#fb923c', end: '#ea580c' },
  'F':  { start: '#f87171', end: '#ef4444' },
}

export function TrustGauge({ score, grade, gradeLabel, size = 'md', showLabel = true, showTrend }: TrustGaugeProps) {
  const { outer, stroke, text, grade: gradeText } = SIZE[size]
  const radius = (outer - stroke * 2) / 2
  const circumference = 2 * Math.PI * radius
  const progress = Math.max(0, Math.min(100, score))
  const dash = (progress / 100) * circumference
  const gap = circumference - dash
  const stops = GRADE_STOPS[grade] ?? { start: '#94a3b8', end: '#64748b' }
  const gradId = `tg-${grade.replace('+', 'plus')}-${size}`
  const center = outer / 2

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: outer, height: outer }}>
        <svg width={outer} height={outer} style={{ transform: 'rotate(-90deg)' }}>
          <defs>
            <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%"   stopColor={stops.start} />
              <stop offset="100%" stopColor={stops.end} />
            </linearGradient>
          </defs>
          {/* Track */}
          <circle
            cx={center} cy={center} r={radius}
            fill="none" stroke="#f1f5f9" strokeWidth={stroke}
          />
          {/* Progress */}
          <circle
            cx={center} cy={center} r={radius}
            fill="none"
            stroke={`url(#${gradId})`}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${dash} ${gap}`}
            style={{ transition: 'stroke-dasharray 0.8s cubic-bezier(0.4,0,0.2,1)' }}
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`font-black leading-none ${text}`}
            style={{ color: stops.end }}>
            {score.toFixed(0)}
          </span>
          <span className={`font-bold ${gradeText}`} style={{ color: stops.end }}>
            {grade}
          </span>
        </div>
      </div>

      {showLabel && (
        <div className="text-center">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{gradeLabel}</p>
          {showTrend && (
            <p className={`text-xs font-medium mt-0.5 ${
              showTrend === 'IMPROVING' ? 'text-emerald-600' :
              showTrend === 'DECLINING' ? 'text-red-500' : 'text-gray-400'
            }`}>
              {showTrend === 'IMPROVING' ? '↑ Improving' :
               showTrend === 'DECLINING' ? '↓ Declining' : '→ Stable'}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
