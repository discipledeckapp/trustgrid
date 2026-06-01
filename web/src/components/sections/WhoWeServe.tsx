const CUSTOMERS = [
  {
    photo: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=80&h=80&fit=crop&crop=face',
    title: 'Estate & Community Managers',
    role: 'Estate Manager',
    quote: 'We manage over 200 domestic workers and contractors across 3 estates. Before TrustGrid, every new manager started from zero.',
    pain: 'No record of who worked well or caused problems',
    icon: '🏘️',
  },
  {
    photo: 'https://images.unsplash.com/photo-1504257432389-52343af06ae3?w=80&h=80&fit=crop&crop=face',
    title: 'Churches & Conventions',
    role: 'Convention Coordinator',
    quote: 'Staffing 2,000 volunteers and workers for a national convention through WhatsApp was costing us 40 hours per event.',
    pain: 'No system for event-scale workforce governance',
    icon: '⛪',
  },
  {
    photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=80&h=80&fit=crop&crop=face',
    title: 'Schools & Universities',
    role: 'Facility Manager',
    quote: 'Child safety requires knowing exactly who is on campus. We needed verification, not just phone numbers.',
    pain: 'No verified records of facility vendors and security staff',
    icon: '🏫',
  },
  {
    photo: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=80&h=80&fit=crop&crop=face',
    title: 'Facility Management Companies',
    role: 'Operations Director',
    quote: 'A worker trusted at one site was unknown at another. We needed shared institutional memory across all properties.',
    pain: 'Workers re-screened at every site, no shared trust data',
    icon: '🏢',
  },
  {
    photo: 'https://images.unsplash.com/photo-1580489944761-15a19d674916?w=80&h=80&fit=crop&crop=face',
    title: 'Smart City Operators',
    role: 'City Infrastructure Lead',
    quote: 'Every service domain in the city — healthcare, residential, commercial — needs a unified trust layer. That is TrustGrid.',
    pain: 'No city-wide workforce trust infrastructure',
    icon: '🌆',
  },
  {
    photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80&h=80&fit=crop&crop=face',
    title: 'Individual Service Workers',
    role: 'Electrician, 8yr experience',
    quote: 'My TrustGrid passport shows my full work history and verification. Institutions now call me first.',
    pain: 'No portable professional reputation outside personal contacts',
    icon: '⚡',
  },
]

export default function WhoWeServe() {
  return (
    <section id="who-we-serve" className="py-24 px-6 mesh-bg">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <span className="text-teal-400 text-sm font-semibold uppercase tracking-widest">Who We Serve</span>
          <h2 className="text-4xl md:text-5xl font-black text-white mt-3 mb-4">
            Built for institutions.<br />
            <span className="text-gradient">Trusted by communities.</span>
          </h2>
          <p className="text-white/40 max-w-xl mx-auto">
            Residents are users. Institutions are customers. Workers build their reputation. Everyone benefits from permanent trust infrastructure.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {CUSTOMERS.map(({ photo, title, role, quote, pain, icon }) => (
            <div key={title} className="glass glass-hover rounded-2xl p-6 transition-all">
              <div className="flex items-start gap-3 mb-4">
                <span className="text-2xl mt-0.5">{icon}</span>
                <div>
                  <div className="font-bold text-white text-sm">{title}</div>
                </div>
              </div>

              {/* Person quote */}
              <div className="flex items-start gap-3 mb-4 bg-white/3 rounded-xl p-3">
                <img src={photo} alt={role} className="w-10 h-10 rounded-full object-cover shrink-0 ring-1 ring-white/10" />
                <div>
                  <p className="text-white/60 text-xs leading-relaxed italic">"{quote}"</p>
                  <p className="text-white/30 text-[10px] mt-1.5">— {role}</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <span className="text-red-400/60 text-xs mt-0.5">✗</span>
                <span className="text-white/30 text-xs">{pain}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
