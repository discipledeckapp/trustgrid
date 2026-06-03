const STATS = [
  { value: 'NIN + BVN',  label: 'Government Verification',  sub: 'Face match · NIMC · CAC' },
  { value: 'A+ → F',    label: 'Trust Score Grades',        sub: 'Algorithmic · Real-time · Configurable' },
  { value: '3',          label: 'Verification Pathways',    sub: 'Liveness · Upload · Agent' },
  { value: 'TGP-',       label: 'Trust Passport Format',    sub: 'QR-scannable, publicly verifiable' },
  { value: '∞',          label: 'Community Types',          sub: 'Church · Estate · School · City' },
]

export default function StatsBar() {
  return (
    <section className="border-y border-slate-200 py-0 bg-slate-50">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col sm:flex-row items-stretch divide-y sm:divide-y-0 sm:divide-x divide-slate-200">
          {STATS.map(({ value, label, sub }) => (
            <div
              key={label}
              className="flex-1 flex flex-col items-center justify-center text-center py-8 px-4 sm:px-6 gap-1 hover:bg-white transition-colors"
            >
              <span
                className="text-3xl md:text-4xl font-black leading-none"
                style={{
                  background: 'linear-gradient(135deg, #4F46E5 40%, #0D9488)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                {value}
              </span>
              <span className="text-slate-700 text-xs font-semibold uppercase tracking-widest mt-1">
                {label}
              </span>
              <span className="text-slate-400 text-[11px]">{sub}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
