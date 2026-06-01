export default function Demo() {
  return (
    <section className="py-20 px-6 bg-white">
      <div className="max-w-5xl mx-auto">
        <div className="bg-brand-700 rounded-2xl p-10 md:p-14 flex flex-col md:flex-row items-center gap-10">
          <div className="flex-1 text-white">
            <p className="text-brand-200 text-sm font-medium uppercase tracking-widest mb-4">Live Demo Scenario</p>
            <h2 className="text-3xl font-bold mb-4 leading-snug">
              RCCG Convention needs 50 electricians in 2 minutes
            </h2>
            <p className="text-brand-100 mb-6 leading-relaxed">
              The operations team creates a service request, sets minimum trust score to 65,
              and instantly sees 40+ verified electricians ranked by trust score — with deployment
              history, endorsements, and incident records visible on every profile.
            </p>
            <ul className="space-y-2 text-sm text-brand-100 mb-8">
              {[
                'Workers assigned in under 2 minutes',
                'Each worker notified on their phone',
                'Post-convention: trust scores update automatically',
                'Permanent institutional record for next year',
              ].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <span className="text-trust-green font-bold">✓</span>
                  {item}
                </li>
              ))}
            </ul>
            <a
              href="https://app.trustgrid.ng"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-white text-brand-700 px-6 py-3 rounded-lg font-semibold hover:bg-brand-50 transition-colors"
            >
              See the Live Demo →
            </a>
          </div>
          <div className="flex-1 bg-brand-800 rounded-xl p-6 text-sm font-mono text-brand-200">
            <div className="mb-2 text-brand-300 text-xs">// Matched workers — sorted by trust score</div>
            {[
              { name: 'Chukwuemeka A.', score: 91.5, grade: 'A+', verified: true },
              { name: 'Babatunde O.',   score: 87.2, grade: 'A',  verified: true },
              { name: 'Emeka N.',       score: 81.0, grade: 'A',  verified: true },
              { name: 'Segun F.',       score: 76.4, grade: 'B+', verified: true },
              { name: 'Taiwo A.',       score: 71.1, grade: 'B+', verified: true },
            ].map((w) => (
              <div key={w.name} className="flex justify-between items-center py-2 border-b border-brand-700 last:border-0">
                <span className="text-white">{w.name}</span>
                <div className="flex items-center gap-2">
                  {w.verified && <span className="text-trust-green text-xs">✓ verified</span>}
                  <span className="text-trust-green font-bold">{w.grade} {w.score}</span>
                </div>
              </div>
            ))}
            <div className="mt-3 text-xs text-brand-300">+ 38 more qualifying workers</div>
          </div>
        </div>
      </div>
    </section>
  )
}
