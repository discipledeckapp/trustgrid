function NetworkG({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <defs>
        <linearGradient id="sol-g" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4F46E5"/>
          <stop offset="100%" stopColor="#06B6D4"/>
        </linearGradient>
      </defs>
      <path d="M 21 26 C 12 38,12 62,24 80 C 32 88,42 92,52 92 C 62 92,72 88,80 80 C 88 72,90 62,90 50" stroke="url(#sol-g)" strokeWidth="3.5" strokeLinecap="round" fill="none"/>
      <path d="M 21 26 C 28 16,40 10,52 10" stroke="url(#sol-g)" strokeWidth="3.5" strokeLinecap="round" fill="none" opacity="0.5"/>
      <path d="M 90 50 L 52 50 L 76 50" stroke="url(#sol-g)" strokeWidth="3.5" strokeLinecap="round" fill="none"/>
      <circle cx="52" cy="50" r="5" fill="url(#sol-g)"/>
      <circle cx="90" cy="50" r="4.5" fill="url(#sol-g)"/>
      <circle cx="52" cy="92" r="4" fill="url(#sol-g)"/>
      <circle cx="21" cy="26" r="4" fill="url(#sol-g)"/>
    </svg>
  )
}

export default function Solution() {
  return (
    <section id="solution" className="py-24 px-6 mesh-bg">
      <div className="max-w-5xl mx-auto text-center">
        <span className="text-teal-400 text-sm font-semibold uppercase tracking-widest">The Solution</span>
        <h2 className="text-4xl md:text-5xl font-black text-white mt-3 mb-4 leading-tight">
          Not a marketplace.<br />
          <span className="text-gradient">The operating system.</span>
        </h2>
        <p className="text-white/50 text-lg max-w-2xl mx-auto mb-16">
          TrustGrid gives institutions permanent, searchable, algorithmic institutional memory about every worker and organisation they have ever engaged.
        </p>

        {/* Central illustration */}
        <div className="relative mb-16">
          <div className="w-20 h-20 rounded-2xl mx-auto flex items-center justify-center mb-6" style={{background:'linear-gradient(135deg,rgba(79,70,229,0.2),rgba(13,148,136,0.2))'}}>
            <NetworkG size={44} />
          </div>

          {/* The positioning statement */}
          <div className="glass border-gradient rounded-2xl p-8 max-w-3xl mx-auto">
            <p className="text-2xl md:text-3xl font-black text-white leading-snug">
              Think of TrustGrid as<br />
              <span className="text-gradient">LinkedIn + Vendor Management + Workforce Governance + Identity Verification</span>
              <span className="text-white"> for Smart Communities.</span>
            </p>
          </div>
        </div>

        {/* Three pillars */}
        <div className="grid md:grid-cols-3 gap-5">
          {[
            {
              icon: '🔐',
              title: 'Verify',
              sub: 'Identity-first',
              desc: 'NIN and BVN verification via Prembly. Face match. Credential upload. Every worker confirmed before deployment.',
              color: 'from-emerald-500/10 to-teal-500/10',
              border: 'border-emerald-500/20',
              tag: 'text-emerald-400',
            },
            {
              icon: '⭐',
              title: 'Score',
              sub: 'Algorithmic trust',
              desc: 'Every deployment, rating, endorsement, and incident builds a permanent trust score. Configurable weights per institution.',
              color: 'from-indigo-500/10 to-violet-500/10',
              border: 'border-indigo-500/20',
              tag: 'text-indigo-400',
            },
            {
              icon: '🏛️',
              title: 'Govern',
              sub: 'Institutional memory',
              desc: 'Service requests, workforce assignments, incident management, procurement. Everything your institution needs in one place.',
              color: 'from-amber-500/10 to-orange-500/10',
              border: 'border-amber-500/20',
              tag: 'text-amber-400',
            },
          ].map(({ icon, title, sub, desc, color, border, tag }) => (
            <div key={title} className={`rounded-2xl p-6 text-left bg-gradient-to-br ${color} border ${border} glass-hover transition-all`}>
              <div className="text-3xl mb-4">{icon}</div>
              <div className={`text-xs font-bold uppercase tracking-widest ${tag} mb-1`}>{sub}</div>
              <div className="text-xl font-black text-white mb-3">{title}</div>
              <p className="text-white/50 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
