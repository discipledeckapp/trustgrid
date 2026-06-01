const STATS = [
  { value: '5M+',    label: 'RCCG Members',       sub: 'potential network' },
  { value: '15,000', label: 'Parishes',            sub: 'across Nigeria' },
  { value: '500+',   label: 'Managed Estates',     sub: 'Lagos metro' },
  { value: '₦47M',   label: 'Year 1 ARR Target',   sub: 'conservative estimate' },
  { value: '82%',    label: 'Gross Margin',        sub: 'SaaS infrastructure' },
]

export default function StatsBar() {
  return (
    <section
      className="border-y border-white/5 py-0"
      style={{ background: '#080810' }}
    >
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col sm:flex-row items-stretch divide-y sm:divide-y-0 sm:divide-x divide-white/8">
          {STATS.map(({ value, label, sub }) => (
            <div
              key={label}
              className="flex-1 flex flex-col items-center justify-center text-center py-8 px-4 sm:px-6 gap-1 hover:bg-white/[0.02] transition-colors"
            >
              <span
                className="text-3xl md:text-4xl font-black leading-none"
                style={{
                  background: 'linear-gradient(135deg, #ffffff 40%, #a5b4fc)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                {value}
              </span>
              <span className="text-white/70 text-xs font-semibold uppercase tracking-widest mt-1">
                {label}
              </span>
              <span className="text-white/25 text-[11px]">{sub}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
