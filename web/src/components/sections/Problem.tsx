export default function Problem() {
  return (
    <section id="problem" className="py-24 px-6 bg-white dark:bg-[#0F0F1A]">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-indigo-600 dark:text-indigo-400 text-sm font-semibold uppercase tracking-widest">The Problem</span>
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mt-3 leading-tight">
            Your workers are managed<br />
            <span className="text-gradient">on WhatsApp. That is not enough.</span>
          </h2>
          <p className="text-slate-500 dark:text-white/50 text-lg mt-4 max-w-2xl mx-auto">
            Every estate, church, school, and event organiser in Nigeria already knows service workers. The problem is not finding them. The problem is knowing who to trust.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-16">
          <div className="rounded-2xl p-6 border border-red-100 dark:border-red-500/10 bg-red-50/50 dark:bg-red-500/5">
            <div className="text-sm text-red-500 font-semibold uppercase tracking-widest mb-4">How institutions manage today</div>
            <div className="space-y-3">
              {[
                { icon: '💬', label: 'WhatsApp groups', sub: 'Data lost when contacts change' },
                { icon: '📊', label: 'Excel spreadsheets', sub: 'No search, no history, no alerts' },
                { icon: '🗣️', label: 'Word of mouth', sub: 'Unverifiable, biased, breaks down at scale' },
                { icon: '📞', label: 'Personal phone books', sub: 'Gone when the manager leaves' },
              ].map(({ icon, label, sub }) => (
                <div key={label} className="flex items-start gap-3 py-2 border-b border-red-100 last:border-0">
                  <span className="text-xl mt-0.5">{icon}</span>
                  <div>
                    <div className="text-slate-800 text-sm font-medium">{label}</div>
                    <div className="text-slate-400 text-xs mt-0.5">{sub}</div>
                  </div>
                  <div className="ml-auto shrink-0 w-5 h-5 rounded-full bg-red-100 flex items-center justify-center">
                    <svg className="w-3 h-3 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12"/></svg>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl p-6 border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/3">
            <div className="text-sm text-slate-400 font-semibold uppercase tracking-widest mb-4">Questions you cannot answer today</div>
            <div className="space-y-3">
              {[
                'Which workers can we actually trust?',
                'Who performed well last convention?',
                'Does this person have open incidents?',
                'Which company is verified for our estate?',
                'How do we staff 500 workers for 3 days?',
                'What happened to last year\'s worker records?',
              ].map((q) => (
                <div key={q} className="flex items-start gap-2.5 py-2 border-b border-slate-100 last:border-0">
                  <div className="w-1.5 h-1.5 bg-amber-400 rounded-full mt-2 shrink-0" />
                  <span className="text-slate-600 text-sm">{q}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-2xl p-8 text-center relative overflow-hidden border border-indigo-100 dark:border-indigo-500/20 bg-gradient-to-br from-indigo-50 to-teal-50 dark:from-indigo-500/5 dark:to-teal-500/5">
          <div className="text-4xl mb-4">⚡</div>
          <p className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            One unvetted worker incident can cost an institution<br className="hidden md:block" /> more than a year of TrustGrid.
          </p>
          <p className="text-slate-500 text-sm">
            Legal fees, reputational damage, replacement costs — none of which appear in the WhatsApp group.
          </p>
        </div>
      </div>
    </section>
  )
}
