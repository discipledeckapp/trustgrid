const STEPS = [
  {
    n: '01',
    title: 'Institution registers',
    desc: 'Estate, church, school, or facility manager registers their institution in minutes. Choose your configuration bundle. Set your service categories and trust thresholds.',
    visual: '🏛️',
    color: 'text-indigo-400',
  },
  {
    n: '02',
    title: 'Workers & organisations onboard',
    desc: 'Workers self-register via a 5-step wizard or an agent registers on their behalf. NIN/BVN verified, credentials uploaded, availability set. Organisations register their company with CAC verification.',
    visual: '👥',
    color: 'text-teal-400',
  },
  {
    n: '03',
    title: 'Trust scores build automatically',
    desc: 'Every deployment, review, endorsement, and resolved incident updates trust scores in real time. The algorithm rewards reliability and accountability.',
    visual: '⭐',
    color: 'text-amber-400',
  },
  {
    n: '04',
    title: 'Deploy with confidence',
    desc: 'Filter your workforce registry by skill, trust score, and availability. Assign workers to service requests in seconds. For events — deploy 500 workers in under 2 minutes.',
    visual: '🚀',
    color: 'text-emerald-400',
  },
  {
    n: '05',
    title: 'Permanent institutional memory',
    desc: 'Every assignment, incident, and review is permanently recorded. When your manager changes, the institutional memory stays. The community gets smarter with every interaction.',
    visual: '📚',
    color: 'text-violet-400',
  },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 px-6" style={{background:'#0F0F1A'}}>
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-indigo-400 text-sm font-semibold uppercase tracking-widest">How It Works</span>
          <h2 className="text-4xl md:text-5xl font-black text-white mt-3 mb-4">
            Up and running in a day.<br />
            <span className="text-gradient">Permanent value from day one.</span>
          </h2>
        </div>

        <div className="space-y-4">
          {STEPS.map(({ n, title, desc, visual, color }, i) => (
            <div key={n} className="glass glass-hover rounded-2xl p-6 flex items-start gap-6 transition-all">
              <div className={`text-4xl font-black ${color} opacity-30 w-10 shrink-0 leading-none`}>{n}</div>
              <div className="text-3xl shrink-0">{visual}</div>
              <div className="flex-1">
                <h3 className="font-bold text-white text-lg mb-2">{title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{desc}</p>
              </div>
              {i < STEPS.length - 1 && (
                <div className="hidden md:block shrink-0 self-center text-white/10">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7"/>
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
