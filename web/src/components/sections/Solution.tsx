function NetworkG({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <defs>
        <linearGradient id="sol-g" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4F46E5"/>
          <stop offset="100%" stopColor="#0D9488"/>
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
    <section id="solution" className="py-24 px-6 bg-white">
      <div className="max-w-5xl mx-auto text-center">
        <span className="text-teal-600 text-sm font-semibold uppercase tracking-widest">The Solution</span>
        <h2 className="text-4xl md:text-5xl font-black text-slate-900 mt-3 mb-4 leading-tight">
          Not just governance.<br />
          <span className="text-gradient">The trust graph.</span>
        </h2>
        <p className="text-slate-500 text-lg max-w-2xl mx-auto mb-16">
          Every verified person gets a portable Trust Passport. Every community gets a hierarchy. Every opportunity gets a trust gate.
        </p>

        <div className="relative mb-16">
          <div className="w-20 h-20 rounded-2xl mx-auto flex items-center justify-center mb-6 border border-indigo-100 bg-indigo-50">
            <NetworkG size={44} />
          </div>

          <div className="border border-indigo-100 rounded-2xl p-8 max-w-3xl mx-auto bg-gradient-to-br from-indigo-50/50 to-teal-50/50">
            <p className="text-2xl md:text-3xl font-black text-slate-900 leading-snug">
              Think of TrustGrid as<br />
              <span className="text-gradient">LinkedIn + Vendor Management + Workforce Governance + Identity Verification</span>
              <span className="text-slate-900"> for Smart Communities.</span>
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {[
            {
              icon: '🛡️',
              title: 'Trust Passport',
              sub: 'Portable verified identity',
              desc: 'Every person gets a TGP-XXXXXXXX passport — verified identity, community memberships, authority roles, and trust score. Scannable by QR from anywhere.',
              bg: 'bg-emerald-50',
              border: 'border-emerald-100',
              tag: 'text-emerald-700',
            },
            {
              icon: '📋',
              title: 'Workforce Governance',
              sub: 'Deploy with confidence',
              desc: 'Service requests, incident management, blacklists, and analytics — everything an institution needs to deploy workers responsibly and track accountability.',
              bg: 'bg-indigo-50',
              border: 'border-indigo-100',
              tag: 'text-indigo-700',
            },
            {
              icon: '📱',
              title: 'Gate Check-In',
              sub: 'QR-based access control',
              desc: 'Gatekeepers scan Trust Passports on entry — instantly confirming identity, trust grade, and clearance status. Works on any smartphone.',
              bg: 'bg-amber-50',
              border: 'border-amber-100',
              tag: 'text-amber-700',
            },
          ].map(({ icon, title, sub, desc, bg, border, tag }) => (
            <div key={title} className={`rounded-2xl p-6 text-left ${bg} border ${border} hover:shadow-md transition-all`}>
              <div className="text-3xl mb-4">{icon}</div>
              <div className={`text-xs font-bold uppercase tracking-widest ${tag} mb-1`}>{sub}</div>
              <div className="text-xl font-black text-slate-900 mb-3">{title}</div>
              <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
