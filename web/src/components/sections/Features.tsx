const FEATURES = [
  { icon: '🪪', title: 'Identity Verification', desc: 'NIN, BVN, and CAC verification via Prembly. Face match. Credentials. Workers confirmed before they set foot on site.', tag: 'Core' },
  { icon: '⭐', title: 'Trust Score Engine', desc: 'Algorithmic, time-decayed trust scores built from real deployments, ratings, endorsements, and incidents. Configurable per institution.', tag: 'Core' },
  { icon: '📋', title: 'Workforce Registry', desc: 'Permanent, searchable registry of every worker your institution has ever engaged. Never lose institutional memory again.', tag: 'Core' },
  { icon: '🏢', title: 'Organisation Registry', desc: 'Register service companies with branches and teams. CAC-verified. Know which company is trusted before signing any contract.', tag: 'Core' },
  { icon: '👍', title: 'Community Endorsements', desc: 'Named, weighted endorsements from institutional operators and community members. Not anonymous stars — real accountability.', tag: 'Trust' },
  { icon: '📊', title: 'Community Trust Passport', desc: 'A shareable credential that travels with every worker. Legal name, verified face, trust grade, and full deployment history.', tag: 'Trust' },
  { icon: '⚡', title: 'Emergency Mobilisation', desc: 'Find and deploy the nearest available verified workers in seconds. Built for estate power outages, security incidents, and event crises.', tag: 'Operations' },
  { icon: '📝', title: 'Service Requests', desc: 'Structured request pipeline from DRAFT to COMPLETED. Set minimum trust scores, match workers, assign, track, and review.', tag: 'Operations' },
  { icon: '⚠️', title: 'Incident Management', desc: 'Report, investigate, and resolve incidents. Every resolution updates the trust score. No incident is ever swept under the rug.', tag: 'Operations' },
  { icon: '🔔', title: 'SMS + WhatsApp Alerts', desc: 'Workers receive assignment notifications via Termii SMS and WhatsApp — meeting them where they already are.', tag: 'Notifications' },
  { icon: '🏆', title: 'Volunteer Registry', desc: 'Manage welfare workers, event volunteers, and community corps with skills, availability, and deployment history.', tag: 'Community' },
  { icon: '⚙️', title: 'Configuration Engine', desc: 'Every trust weight, SLA rule, and category is configurable per institution. No hardcoded decisions.', tag: 'Platform' },
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
            Everything your institution<br />needs to govern trusted people
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
