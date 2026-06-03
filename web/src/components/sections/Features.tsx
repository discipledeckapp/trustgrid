const FEATURES = [
  { icon: '🛡️', title: 'Trust Passport', desc: 'Every person gets a TGP-XXXXXXXX passport — portable, QR-scannable, publicly verifiable. Verified identity, trust grade, credentials, and deployment history.', tag: 'Core' },
  { icon: '🪪', title: 'NIN / BVN Verification', desc: 'Live NIN and BVN verification against Nigerian government records. Face liveness detection. Government-grade identity at community scale.', tag: 'Core' },
  { icon: '⭐', title: 'Trust Score Engine', desc: 'Algorithmic, time-decayed trust scores built from real deployments, ratings, endorsements, and incidents. Configurable weights per community.', tag: 'Core' },
  { icon: '📋', title: 'Service Requests', desc: 'Structured request pipeline from DRAFT to COMPLETED. Set minimum trust scores, match workers, assign, track, and review — all in one place.', tag: 'Operations' },
  { icon: '⚠️', title: 'Incident Management', desc: 'Report, investigate, and resolve incidents. Every resolution updates the trust score. No incident is ever swept under the rug.', tag: 'Operations' },
  { icon: '📱', title: 'Gate Check-In', desc: 'QR code-based gate access for verified workers. Gatekeepers scan a Trust Passport and instantly confirm identity, grade, and clearance status.', tag: 'Operations' },
  { icon: '👍', title: 'Community Endorsements', desc: 'Named, weighted endorsements from authority holders — Parish Pastors, Estate Managers, HODs. Not anonymous stars — real chain-of-authority accountability.', tag: 'Trust' },
  { icon: '🏢', title: 'Organisation Registry', desc: 'CAC-verified organisations can be onboarded, linked to workers, and tracked. Know which companies are cleared for your community.', tag: 'Trust' },
  { icon: '🚫', title: 'Blacklist Management', desc: 'Permanently blacklist workers across your registry. Blacklisted records are preserved and searchable — no one gets through twice.', tag: 'Trust' },
  { icon: '🎨', title: 'Community White-Label', desc: 'Every community gets its own branded portal — redemption-city.trustgrid.ng or a custom domain. Custom colors, logo, and name. One platform, infinite communities.', tag: 'Platform' },
  { icon: '🔔', title: 'SMS + WhatsApp Alerts', desc: 'Members receive opportunity alerts, verification updates, and assignment notifications via Termii SMS and WhatsApp — meeting them where they already are.', tag: 'Platform' },
  { icon: '📊', title: 'Analytics Dashboard', desc: 'Real-time workforce metrics — trust score distribution, deployment completion rates, incident trends, and top worker rankings at a glance.', tag: 'Platform' },
]

const TAG_COLORS: Record<string, string> = {
  Core:       'text-indigo-700 bg-indigo-50 border-indigo-100',
  Trust:      'text-emerald-700 bg-emerald-50 border-emerald-100',
  Operations: 'text-amber-700 bg-amber-50 border-amber-100',
  Platform:   'text-slate-600 bg-slate-100 border-slate-200',
}

export default function Features() {
  return (
    <section id="features" className="py-24 px-6 bg-slate-50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <span className="text-indigo-600 text-sm font-semibold uppercase tracking-widest">Platform Capabilities</span>
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 mt-3 mb-4">
            Everything institutions need<br />to run on trusted people
          </h2>
          <p className="text-slate-500 max-w-xl mx-auto">
            Not a feature dump — each capability solves a real governance problem that WhatsApp and Excel cannot.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map(({ icon, title, desc, tag }) => (
            <div key={title} className="glass glass-hover rounded-2xl p-5 transition-all group cursor-default">
              <div className="flex items-start justify-between mb-3">
                <span className="text-2xl">{icon}</span>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${TAG_COLORS[tag] || 'text-slate-500 bg-slate-100 border-slate-200'}`}>{tag}</span>
              </div>
              <h3 className="font-bold text-slate-900 mb-2">{title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
