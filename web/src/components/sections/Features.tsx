const features = [
  {
    title: 'Workforce Registry',
    desc: 'Searchable, filterable registry of all your workers — ranked by trust score, filterable by skill, availability, and verification status.',
    icon: '👥',
  },
  {
    title: 'Trust Score Engine',
    desc: 'Algorithmic trust scores derived from identity verification, deployment history, ratings, endorsements, and incident records. Fully configurable per institution.',
    icon: '⭐',
  },
  {
    title: 'Identity Verification',
    desc: 'NIN and BVN verification built in. Extendable to Ghana Card, Huduma (Kenya), and other African identity systems without any code changes.',
    icon: '🪪',
  },
  {
    title: 'Community Endorsements',
    desc: 'Structured peer and institutional endorsements. Named, accountable, weighted — not anonymous star ratings.',
    icon: '👍',
  },
  {
    title: 'Service Requests',
    desc: 'Create requests, set minimum trust scores, see matched workers instantly, assign and track the full deployment lifecycle.',
    icon: '📋',
  },
  {
    title: 'Incident Management',
    desc: 'Report, investigate, and resolve incidents. Every resolution updates the worker\'s trust score automatically.',
    icon: '⚠️',
  },
  {
    title: 'Procurement Governance',
    desc: 'Vendor registry, procurement workflows, approval chains, spend tracking — for institutions that need accountability in vendor management.',
    icon: '📦',
  },
  {
    title: 'Convention Staffing',
    desc: 'Deploy 50 to 2,000 verified workers for a multi-day event. Real-time tracking, supervisor check-ins, post-event performance reviews.',
    icon: '🏟️',
  },
]

export default function Features() {
  return (
    <section id="features" className="py-20 px-6 bg-gray-50">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-brand-700 font-semibold text-sm uppercase tracking-widest mb-3">Platform Modules</p>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Everything your institution needs<br />to govern trusted people
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((f) => (
            <div key={f.title} className="bg-white rounded-xl p-6 border border-gray-100 hover:border-brand-200 hover:shadow-sm transition-all">
              <div className="text-3xl mb-4">{f.icon}</div>
              <h3 className="font-semibold text-gray-900 mb-2 text-sm">{f.title}</h3>
              <p className="text-gray-500 text-xs leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
