const COMMUNITIES = [
  { icon: '⛪', label: 'Churches & Conventions', sample: 'Redemption City' },
  { icon: '🏘️', label: 'Residential Estates',    sample: 'Lekki Phase 1' },
  { icon: '🌆', label: 'Smart Cities',            sample: 'Eko Atlantic' },
  { icon: '🏫', label: 'Schools',                 sample: 'Covenant University' },
  { icon: '🤝', label: 'NGOs',                    sample: "SOS Children's Village" },
  { icon: '🏢', label: 'Corporate',               sample: 'GTBank HQ' },
]

export default function TrustedBy() {
  return (
    <section className="py-20 px-6" style={{ background: '#080810' }}>
      <div className="max-w-5xl mx-auto">
        {/* Heading */}
        <div className="text-center mb-12">
          <span className="text-indigo-400 text-sm font-semibold uppercase tracking-widest">
            Community First
          </span>
          <h2 className="text-3xl md:text-4xl font-black text-white mt-3">
            Built for communities across Nigeria
          </h2>
          <p className="text-white/40 mt-3 text-sm max-w-xl mx-auto leading-relaxed">
            From mega-churches to gated estates — any community that manages people and trust can use TrustGrid.
          </p>
        </div>

        {/* Community type cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {COMMUNITIES.map(({ icon, label, sample }) => (
            <div
              key={label}
              className="flex flex-col items-center text-center rounded-2xl border border-white/8 px-3 py-5 gap-2 hover:border-indigo-500/40 hover:bg-indigo-500/5 transition-all cursor-default group"
              style={{ background: 'rgba(255,255,255,0.02)' }}
            >
              <span className="text-2xl">{icon}</span>
              <span className="text-white/80 text-[11px] font-semibold leading-tight">
                {label}
              </span>
              <span className="text-white/25 text-[10px] group-hover:text-white/40 transition-colors">
                {sample}
              </span>
            </div>
          ))}
        </div>

        {/* Subtle divider line */}
        <div className="mt-12 flex items-center gap-4 justify-center">
          <div className="h-px flex-1 max-w-[120px]" style={{ background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.08))' }} />
          <span className="text-white/20 text-xs font-medium uppercase tracking-widest">more communities joining weekly</span>
          <div className="h-px flex-1 max-w-[120px]" style={{ background: 'linear-gradient(to left, transparent, rgba(255,255,255,0.08))' }} />
        </div>
      </div>
    </section>
  )
}
