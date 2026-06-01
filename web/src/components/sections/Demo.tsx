export default function Demo() {
  return (
    <section className="py-24 px-6 mesh-bg">
      <div className="max-w-5xl mx-auto">
        {/* Demo scenario */}
        <div className="rounded-3xl overflow-hidden border border-indigo-500/20" style={{background:'linear-gradient(135deg,rgba(79,70,229,0.1),rgba(13,148,136,0.1))'}}>
          <div className="p-8 md:p-12 grid md:grid-cols-2 gap-10 items-center">
            {/* Left: scenario */}
            <div>
              <div className="text-xs text-indigo-400 font-bold uppercase tracking-widest mb-3">Live Demo Scenario</div>
              <h3 className="text-3xl font-black text-white mb-4 leading-tight">
                RCCG Convention needs<br />50 electricians. Now.
              </h3>
              <p className="text-white/60 mb-6 leading-relaxed">
                The operations team creates a service request, sets minimum trust score to 65, and sees 33 verified electricians ranked by trust score — with full deployment history, endorsements, and incident records on every profile.
              </p>

              <div className="space-y-3 mb-8">
                {[
                  ['Workers assigned', 'Under 2 minutes'],
                  ['Each worker notified', 'Via WhatsApp + SMS'],
                  ['Post-event reviews', 'Auto-update trust scores'],
                  ['Permanent record', 'Ready for next convention'],
                ].map(([action, result]) => (
                  <div key={String(action)} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                    <span className="text-white/60 text-sm">{action}</span>
                    <span className="text-emerald-400 text-sm font-semibold">{result}</span>
                  </div>
                ))}
              </div>

              <a href="https://app.trustgrid.ng/login" target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-white text-sm hover:opacity-90 transition-opacity"
                style={{background:'linear-gradient(135deg,#4F46E5,#0D9488)'}}>
                See It Live →
              </a>
            </div>

            {/* Right: worker list mockup */}
            <div className="space-y-2">
              <div className="text-xs text-white/30 font-medium mb-3">Matched workers — sorted by trust score</div>
              {[
                { name: 'Adaeze M.', skill: 'Electrician', score: 96, grade: 'A+', color: '#10B981', verified: true, jobs: 23 },
                { name: 'Chukwuemeka A.', skill: 'Electrician', score: 91, grade: 'A+', color: '#10B981', verified: true, jobs: 18 },
                { name: 'Babatunde O.', skill: 'Panel Wiring', score: 87, grade: 'A', color: '#14B8A6', verified: true, jobs: 31 },
                { name: 'Emeka N.', skill: 'Generator Tech', score: 81, grade: 'A', color: '#14B8A6', verified: true, jobs: 14 },
                { name: 'Segun F.', skill: 'Electrician', score: 76, grade: 'B+', color: '#6366F1', verified: true, jobs: 9 },
              ].map((w, i) => (
                <div key={w.name} className="flex items-center gap-3 bg-white/5 rounded-xl px-4 py-3 border border-white/5">
                  <span className="text-white/20 text-xs w-4 shrink-0">#{i+1}</span>
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-sm font-black text-indigo-300 shrink-0">
                    {w.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-white text-xs font-semibold flex items-center gap-1.5">
                      {w.name}
                      {w.verified && <span className="text-emerald-400 text-[10px]">✓</span>}
                    </div>
                    <div className="text-white/30 text-[10px]">{w.skill} · {w.jobs} jobs</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xs font-black" style={{color:w.color}}>{w.grade} {w.score}</div>
                  </div>
                </div>
              ))}
              <div className="text-center text-xs text-white/20 pt-1">+ 28 more qualifying workers</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
