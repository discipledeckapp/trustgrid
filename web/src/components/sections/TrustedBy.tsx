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
    <section className="py-20 px-6 bg-slate-50">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-indigo-600 text-sm font-semibold uppercase tracking-widest">
            Community First
          </span>
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 mt-3">
            Built for communities across Nigeria
          </h2>
          <p className="text-slate-500 mt-3 text-sm max-w-xl mx-auto leading-relaxed">
            From mega-churches to gated estates — any community that manages people and trust can use TrustGrid.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {COMMUNITIES.map(({ icon, label, sample }) => (
            <div
              key={label}
              className="flex flex-col items-center text-center rounded-2xl border border-slate-200 bg-white px-3 py-5 gap-2 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all cursor-default group shadow-sm"
            >
              <span className="text-2xl">{icon}</span>
              <span className="text-slate-700 text-[11px] font-semibold leading-tight">
                {label}
              </span>
              <span className="text-slate-400 text-[10px] group-hover:text-indigo-500 transition-colors">
                {sample}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-12 flex items-center gap-4 justify-center">
          <div className="h-px flex-1 max-w-[120px] bg-gradient-to-r from-transparent to-slate-300" />
          <span className="text-slate-400 text-xs font-medium uppercase tracking-widest">more communities joining weekly</span>
          <div className="h-px flex-1 max-w-[120px] bg-gradient-to-l from-transparent to-slate-300" />
        </div>
      </div>
    </section>
  )
}
