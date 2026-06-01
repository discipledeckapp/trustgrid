const customers = [
  { icon: '🏘️', name: 'Estates & Communities', desc: 'Govern domestic workers, security, contractors across residential properties.' },
  { icon: '⛪', name: 'Churches & Religious Orgs', desc: 'Manage volunteers, event workers, and welfare teams at scale.' },
  { icon: '🎪', name: 'Convention Organisers', desc: 'Staff 200–2,000 verified temporary workers for multi-day events.' },
  { icon: '🏫', name: 'Schools & Universities', desc: 'Vendor governance, security, maintenance — with procurement compliance.' },
  { icon: '🏢', name: 'Facility Managers', desc: 'Unified workforce registry across multiple properties.' },
  { icon: '🌆', name: 'Smart City Operators', desc: 'City-wide trust infrastructure for every community service interaction.' },
]

export default function WhoWeServe() {
  return (
    <section id="who-we-serve" className="py-20 px-6 bg-white">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-brand-700 font-semibold text-sm uppercase tracking-widest mb-3">Who We Serve</p>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Built for institutions,<br />not individuals
          </h2>
          <p className="text-gray-600 text-lg max-w-xl mx-auto">
            Residents are users. Institutions are customers.
            TrustGrid is the governance layer your organisation deploys, not an app your residents download.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {customers.map((c) => (
            <div key={c.name} className="rounded-xl p-6 border border-gray-100 hover:border-brand-200 hover:bg-brand-50/30 transition-all">
              <div className="text-3xl mb-4">{c.icon}</div>
              <h3 className="font-semibold text-gray-900 mb-2">{c.name}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{c.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
