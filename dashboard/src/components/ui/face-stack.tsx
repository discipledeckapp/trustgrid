'use client'

interface Face {
  name: string
  role?: string
  color?: string
}

const COLORS = [
  'bg-indigo-100 text-indigo-700',
  'bg-emerald-100 text-emerald-700',
  'bg-teal-100 text-teal-700',
  'bg-violet-100 text-violet-700',
  'bg-amber-100 text-amber-700',
  'bg-blue-100 text-blue-700',
]

function colorFor(name: string) {
  return COLORS[name.charCodeAt(0) % COLORS.length]
}

interface FaceStackProps {
  faces: Face[]
  maxVisible?: number
  size?: number
}

export function FaceStack({ faces, maxVisible = 5, size = 28 }: FaceStackProps) {
  const visible = faces.slice(0, maxVisible)
  const overflow = faces.length - maxVisible

  return (
    <div className="flex items-center">
      {visible.map((face, i) => (
        <div
          key={i}
          title={face.role ? `${face.name} — ${face.role}` : face.name}
          className={`relative flex items-center justify-center rounded-full border-2 border-white font-bold text-xs ${colorFor(face.name)}`}
          style={{
            width: size,
            height: size,
            fontSize: size * 0.38,
            marginLeft: i === 0 ? 0 : -(size * 0.28),
            zIndex: visible.length - i,
          }}
        >
          {face.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
        </div>
      ))}
      {overflow > 0 && (
        <div
          className="flex items-center justify-center rounded-full border-2 border-white bg-slate-100 text-slate-600 font-bold text-xs"
          style={{
            width: size,
            height: size,
            fontSize: size * 0.33,
            marginLeft: -(size * 0.28),
            zIndex: 0,
          }}
        >
          +{overflow}
        </div>
      )}
    </div>
  )
}
