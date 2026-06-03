export default function InstitutionalMemory() {
  return (
    <section className="py-24 px-6 bg-slate-50">
      <div className="max-w-5xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="text-sm text-amber-600 font-semibold uppercase tracking-widest mb-4">For Every Estate Manager, Church Coordinator, and Facility Director</div>
            <h2 className="text-4xl font-black text-slate-900 leading-tight mb-6">
              You have hired this person before.<br />
              <span className="text-amber-500">You just don&apos;t remember.</span>
            </h2>

            <div className="space-y-5 text-slate-500 leading-relaxed">
              <p>
                Every time a new estate manager joins, they start from zero. The workers their predecessor trusted — gone. The ones who caused problems — forgotten. The endorsements, the incident records, the performance history — all of it lived in a WhatsApp group that nobody can find.
              </p>
              <p>
                This is not a small problem. It is the reason the same unvetted worker shows up at three different estates. The reason an annual convention re-interviews the same electricians every year. The reason institutions cannot grow — because their knowledge doesn&apos;t accumulate.
              </p>
              <p className="text-slate-800 font-semibold">
                TrustGrid ends this. Every deployment, every rating, every endorsement becomes permanent institutional memory — tied to the institution, not to any individual employee.
              </p>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-4">
              {[
                { label: 'Institutional memory survives', sub: 'Staff changes, phone losses, WhatsApp migrations', icon: '🏛️' },
                { label: 'Workers build portable reputation', sub: 'Their record moves with them across institutions', icon: '🏆' },
                { label: 'Every incident is recorded', sub: 'No more "we didn\'t know" when problems repeat', icon: '⚠️' },
                { label: 'Trust compounds over time', sub: 'Better data every year. Smarter decisions every hire.', icon: '📈' },
              ].map(({ label, sub, icon }) => (
                <div key={label} className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
                  <span className="text-xl mb-2 block">{icon}</span>
                  <div className="text-slate-800 text-sm font-semibold mb-1">{label}</div>
                  <div className="text-slate-400 text-xs leading-relaxed">{sub}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl p-5 border border-red-100 bg-red-50">
              <div className="text-xs text-red-500 font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                <span>✗</span> Without TrustGrid
              </div>
              <div className="space-y-2">
                {[
                  'Manager changes → all worker history lost',
                  'Same incident repeats with same worker',
                  'Convention team rebuilt from scratch every year',
                  '"Who recommended this person?" has no answer',
                  'New estate manager starts with zero trust data',
                ].map(p => (
                  <div key={p} className="flex items-start gap-2 text-sm text-slate-500">
                    <span className="text-red-400 mt-0.5 shrink-0">—</span>
                    <span>{p}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl p-5 border border-emerald-100 bg-emerald-50">
              <div className="text-xs text-emerald-600 font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                <span>✓</span> With TrustGrid
              </div>
              <div className="space-y-2">
                {[
                  'Every worker\'s full history permanently on record',
                  'Incidents tracked, resolved, and scored automatically',
                  'Convention team pre-built from last year\'s registry',
                  'Every endorsement names who made it and why',
                  'New manager inherits years of institutional trust data',
                ].map(p => (
                  <div key={p} className="flex items-start gap-2 text-sm text-slate-700">
                    <span className="text-emerald-500 mt-0.5 shrink-0">✓</span>
                    <span>{p}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl p-4 text-center border border-indigo-100 bg-white">
              <p className="text-slate-600 text-sm font-medium">
                &ldquo;The community built this worker&apos;s reputation with data. Not memory. Not luck.&rdquo;
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
