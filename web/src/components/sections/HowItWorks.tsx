const STEPS = [
  {
    n: '01',
    title: 'Community joins',
    desc: 'Estate, church, school, or facility manager registers their institution in minutes. Choose your configuration bundle. Set your service categories and trust thresholds.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
        <path d="M3 21h18M3 7l9-4 9 4M4 7v14M20 7v14M8 21V11m4 10V11m4 10V11"/>
      </svg>
    ),
    color: '#6366F1',
    gradStart: '#4F46E5',
    gradEnd: '#7C3AED',
  },
  {
    n: '02',
    title: 'Members verify identity',
    desc: 'Workers self-register via a 5-step wizard or an agent registers on their behalf. NIN/BVN verified, credentials uploaded, availability set. Organisations register with CAC verification.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        <polyline points="9 12 11 14 15 10"/>
      </svg>
    ),
    color: '#14B8A6',
    gradStart: '#0D9488',
    gradEnd: '#0891B2',
  },
  {
    n: '03',
    title: 'Trust scores build',
    desc: 'Every deployment, review, endorsement, and resolved incident updates trust scores in real time. The algorithm rewards reliability and accountability.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
      </svg>
    ),
    color: '#F59E0B',
    gradStart: '#D97706',
    gradEnd: '#EF4444',
  },
  {
    n: '04',
    title: 'Opportunities unlock',
    desc: 'Filter your workforce registry by skill, trust score, and availability. Assign workers to service requests in seconds. For events — deploy 500 workers in under 2 minutes.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
        <path d="M7 11V7a5 5 0 0 1 9.9-1"/>
      </svg>
    ),
    color: '#10B981',
    gradStart: '#059669',
    gradEnd: '#0D9488',
  },
  {
    n: '05',
    title: 'Institutional memory builds',
    desc: 'Every assignment, incident, and review is permanently recorded. When your manager changes, the institutional memory stays. The community gets smarter with every interaction.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
        <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
        <rect x="3" y="14" width="7" height="7"/>
        <path d="M14 14h.01M14 18h.01M18 14h.01M18 18h.01M18 21h.01M21 14h.01"/>
      </svg>
    ),
    color: '#A78BFA',
    gradStart: '#7C3AED',
    gradEnd: '#6366F1',
  },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 px-6 bg-white">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-indigo-600 text-sm font-semibold uppercase tracking-widest">How It Works</span>
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 mt-3 mb-4">
            Up and running in a day.<br />
            <span className="text-gradient">Permanent value from day one.</span>
          </h2>
          <p className="text-slate-500 max-w-lg mx-auto text-sm leading-relaxed">
            Five steps from signup to a fully operational community workforce platform.
          </p>
        </div>

        <div className="hidden md:flex items-start justify-between gap-0 mb-12 relative">
          <div
            className="absolute top-9 left-[10%] right-[10%] h-px"
            style={{
              backgroundImage: 'repeating-linear-gradient(90deg,#CBD5E1 0,#CBD5E1 8px,transparent 8px,transparent 16px)',
            }}
          />
          {STEPS.map(({ n, title, icon, gradStart, gradEnd, color }) => (
            <div key={n} className="flex flex-col items-center gap-3 z-10 w-36">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center relative"
                style={{
                  background: `linear-gradient(135deg,${gradStart},${gradEnd})`,
                  boxShadow: `0 4px 16px ${gradStart}40`,
                }}
              >
                <div style={{ color: '#fff' }}>{icon}</div>
                <div
                  className="absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black text-white border-2 border-white"
                  style={{ background: color }}
                >
                  {parseInt(n)}
                </div>
              </div>
              <div className="text-center">
                <div className="text-slate-700 text-xs font-bold leading-snug">{title}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          {STEPS.map(({ n, title, desc, icon, color, gradStart, gradEnd }, i) => (
            <div key={n} className="glass glass-hover rounded-2xl p-5 flex items-start gap-5 transition-all">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: `linear-gradient(135deg,${gradStart},${gradEnd})` }}
              >
                <div style={{ color: '#fff', transform: 'scale(0.8)' }}>{icon}</div>
              </div>
              <div className="flex-1">
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color }}>{n}</span>
                  <h3 className="font-bold text-slate-900 text-base">{title}</h3>
                </div>
                <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
              </div>
              {i < STEPS.length - 1 && (
                <div className="hidden md:flex shrink-0 self-center text-slate-300 ml-2">
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
