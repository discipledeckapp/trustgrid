export default function Solution() {
  return (
    <section id="solution" className="py-20 px-6 bg-white">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-brand-700 font-semibold text-sm uppercase tracking-widest mb-3">The Solution</p>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            The trust operating system<br />for your community
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            TrustGrid is not a marketplace. It is governance infrastructure —
            the permanent trust and accountability layer your institution has always needed.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-14">
          {[
            {
              icon: '✓',
              color: 'bg-green-50 text-green-700',
              title: 'Verify',
              desc: 'Identity verification via NIN, BVN, document upload. Workers are who they say they are.',
            },
            {
              icon: '★',
              color: 'bg-blue-50 text-blue-700',
              title: 'Trust',
              desc: 'Algorithmic trust scores built from real deployments, ratings, endorsements, and incident history.',
            },
            {
              icon: '⚡',
              color: 'bg-purple-50 text-purple-700',
              title: 'Deploy',
              desc: 'Assign verified, trusted workers to service requests. From 1 worker to 500 at a convention.',
            },
            {
              icon: '📋',
              color: 'bg-orange-50 text-orange-700',
              title: 'Track',
              desc: 'Every deployment, rating, incident, and endorsement recorded permanently.',
            },
            {
              icon: '🛡',
              color: 'bg-red-50 text-red-700',
              title: 'Govern',
              desc: 'Procurement workflows, incident management, SLA monitoring, compliance reporting.',
            },
            {
              icon: '📊',
              color: 'bg-teal-50 text-teal-700',
              title: 'Analyse',
              desc: 'Workforce utilisation, trust score trends, vendor performance — all in one dashboard.',
            },
          ].map((item) => (
            <div key={item.title} className="bg-gray-50 rounded-xl p-6">
              <div className={`w-10 h-10 rounded-lg ${item.color} flex items-center justify-center text-lg font-bold mb-4`}>
                {item.icon}
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="bg-brand-700 rounded-2xl p-8 md:p-12 text-white text-center">
          <p className="text-brand-100 text-sm font-medium uppercase tracking-widest mb-4">Think of TrustGrid as</p>
          <h3 className="text-2xl md:text-3xl font-bold leading-snug">
            LinkedIn + Vendor Management +<br />Workforce Governance + Identity Verification<br />
            <span className="text-brand-200">for Smart Communities</span>
          </h3>
        </div>
      </div>
    </section>
  )
}
