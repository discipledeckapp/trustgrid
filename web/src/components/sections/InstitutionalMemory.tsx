export default function InstitutionalMemory() {
  return (
    <section className="py-24 px-6" style={{background:'linear-gradient(180deg,#0F0F1A 0%,#0A0A0F 100%)'}}>
      <div className="max-w-5xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left: the emotional argument */}
          <div>
            <div className="text-sm text-amber-400 font-semibold uppercase tracking-widest mb-4">For Every Estate Manager, Church Coordinator, and Facility Director</div>
            <h2 className="text-4xl font-black text-white leading-tight mb-6">
              You have hired this person before.<br />
              <span className="text-amber-400">You just don't remember.</span>
            </h2>

            <div className="space-y-5 text-white/60 leading-relaxed">
              <p>
                Every time a new estate manager joins, they start from zero. The workers their predecessor trusted — gone. The ones who caused problems — forgotten. The endorsements, the incident records, the performance history — all of it lived in a WhatsApp group that nobody can find.
              </p>
              <p>
                This is not a small problem. It is the reason the same unvetted worker shows up at three different estates. The reason an annual convention re-interviews the same electricians every year. The reason institutions cannot grow — because their knowledge doesn't accumulate.
              </p>
              <p className="text-white font-semibold">
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
                <div key={label} className="glass rounded-xl p-4">
                  <span className="text-xl mb-2 block">{icon}</span>
                  <div className="text-white text-sm font-semibold mb-1">{label}</div>
                  <div className="text-white/40 text-xs leading-relaxed">{sub}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: before/after visual */}
          <div className="space-y-4">
            {/* Before */}
            <div className="rounded-2xl p-5 border border-red-500/15" style={{background:'rgba(239,68,68,0.04)'}}>
              <div className="text-xs text-red-400 font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
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
                  <div key={p} className="flex items-start gap-2 text-sm text-white/40">
                    <span className="text-red-400/50 mt-0.5 shrink-0">—</span>
                    <span>{p}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* After */}
            <div className="rounded-2xl p-5 border border-emerald-500/15" style={{background:'rgba(16,185,129,0.04)'}}>
              <div className="text-xs text-emerald-400 font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
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
                  <div key={p} className="flex items-start gap-2 text-sm text-white/60">
                    <span className="text-emerald-400 mt-0.5 shrink-0">✓</span>
                    <span>{p}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Key message */}
            <div className="rounded-xl p-4 text-center border border-indigo-500/20" style={{background:'rgba(79,70,229,0.05)'}}>
              <p className="text-white/70 text-sm font-medium">
                "The community built this worker's reputation with data. Not memory. Not luck."
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
