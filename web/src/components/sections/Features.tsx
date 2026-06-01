const FEATURES = [
  { icon: '🛡️', title: 'Trust Passport', desc: 'Every person gets a TGP-XXXXXXXX passport — portable, QR-scannable, publicly verifiable. Verified identity, community memberships, trust grade, credentials.', tag: 'Core' },
  { icon: '🏘️', title: 'Community Hierarchy Engine', desc: 'Model any community as a verified node tree — RCCG Province → Area → Parish, or Estate → Phase → Block. Unlimited depth, configurable node types.', tag: 'Core' },
  { icon: '🪪', title: 'NIN / BVN Verification', desc: 'Live NIN and BVN verification via Prembly IdentityPass. Face liveness detection via Amazon Rekognition. Government-grade identity at community scale.', tag: 'Core' },
  { icon: '⭐', title: 'Trust Score Engine', desc: 'Algorithmic, time-decayed trust scores built from real deployments, ratings, endorsements, and incidents. Configurable weights per community.', tag: 'Core' },
  { icon: '🔓', title: 'Opportunity Network', desc: 'Post trust-gated opportunities — jobs, volunteering, ministries, event roles. Only verified members who meet the score threshold can apply. No CV fraud.', tag: 'Trust' },
  { icon: '👍', title: 'Community Endorsements', desc: 'Named, weighted endorsements from authority holders — Parish Pastors, Estate Managers, HODs. Not anonymous stars — real chain-of-authority accountability.', tag: 'Trust' },
  { icon: '🏛️', title: 'Authority Engine', desc: 'Role-based authority assignment with permission gates. Provincial Pastors endorse parishes. Area Coordinators assign roles. No self-declared authority.', tag: 'Trust' },
  { icon: '📝', title: 'Service Requests', desc: 'Structured request pipeline from DRAFT to COMPLETED. Set minimum trust scores, match workers, assign, track, and review in one place.', tag: 'Operations' },
  { icon: '⚠️', title: 'Incident Management', desc: 'Report, investigate, and resolve incidents. Every resolution updates the trust score. No incident is ever swept under the rug.', tag: 'Operations' },
  { icon: '🎨', title: 'Community White-Label', desc: 'Every community gets its own branded portal — redemption-city.trustgrid.ng or portal.rccg.org. Custom colors, logo, and name. One codebase, infinite communities.', tag: 'Platform' },
  { icon: '🔔', title: 'SMS + WhatsApp Alerts', desc: 'Members receive opportunity alerts, verification updates, and assignment notifications via Termii SMS and WhatsApp — meeting them where they already are.', tag: 'Platform' },
  { icon: '⚙️', title: 'Configurable Trust Engine', desc: 'Every trust weight, SLA rule, hierarchy level, and category is configurable per community. No hardcoded decisions. Your trust, your rules.', tag: 'Platform' },
]

const TAG_COLORS: Record<string, string> = {
  Core: 'text-indigo-400 bg-indigo-400/10',
  Trust: 'text-emerald-400 bg-emerald-400/10',
  Operations: 'text-amber-400 bg-amber-400/10',
  Notifications: 'text-teal-400 bg-teal-400/10',
  Community: 'text-violet-400 bg-violet-400/10',
  Platform: 'text-slate-400 bg-slate-400/10',
}

export default function Features() {
  return (
    <section id="features" className="py-24 px-6" style={{background:'#0F0F1A'}}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <span className="text-indigo-400 text-sm font-semibold uppercase tracking-widest">Platform Capabilities</span>
          <h2 className="text-4xl md:text-5xl font-black text-white mt-3 mb-4">
            Everything communities need<br />to run on trusted people
          </h2>
          <p className="text-white/40 max-w-xl mx-auto">
            Not a feature dump — each capability solves a real governance problem that WhatsApp and Excel cannot.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map(({ icon, title, desc, tag }) => (
            <div key={title} className="glass glass-hover rounded-2xl p-5 transition-all group cursor-default">
              <div className="flex items-start justify-between mb-3">
                <span className="text-2xl">{icon}</span>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${TAG_COLORS[tag] || 'text-white/40 bg-white/5'}`}>{tag}</span>
              </div>
              <h3 className="font-bold text-white mb-2 group-hover:text-gradient transition-all">{title}</h3>
              <p className="text-white/40 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
