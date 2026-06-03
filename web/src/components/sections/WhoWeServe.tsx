const CUSTOMERS = [
  {
    photo: 'https://images.unsplash.com/photo-1504257432389-52343af06ae3?w=80&h=80&fit=crop&crop=face',
    title: 'Churches & Religious Networks',
    role: 'Redemption City Convention Coordinator',
    quote: 'Staffing 2,000 volunteers for a national convention through WhatsApp was costing us 40 hours per event. TrustGrid gave us a verified workforce registry in days.',
    pain: 'No system for community-scale workforce governance',
    icon: '⛪',
  },
  {
    photo: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=80&h=80&fit=crop&crop=face',
    title: 'Residential Estates',
    role: 'Estate Manager, Lekki Phase 1',
    quote: 'We manage 200+ domestic workers across 3 estates. Before TrustGrid, every new manager started from zero — same workers, zero institutional memory.',
    pain: 'No record of who worked well or caused problems',
    icon: '🏘️',
  },
  {
    photo: 'https://images.unsplash.com/photo-1580489944761-15a19d674916?w=80&h=80&fit=crop&crop=face',
    title: 'Government & Smart Cities',
    role: 'City Infrastructure Lead',
    quote: 'Every service domain — healthcare, residential, commercial — needs a unified trust layer. TrustGrid is the infrastructure layer the city was missing.',
    pain: 'No city-wide workforce trust infrastructure',
    icon: '🌆',
  },
  {
    photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=80&h=80&fit=crop&crop=face',
    title: 'Schools & Universities',
    role: 'Facility Manager, Private University',
    quote: 'Child safety means knowing exactly who is on campus. We needed government-grade verification, not just phone numbers from an agency.',
    pain: 'No verified records of vendors and security contractors',
    icon: '🏫',
  },
  {
    photo: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=80&h=80&fit=crop&crop=face',
    title: 'NGOs & Community-Based Orgs',
    role: 'Programme Director, NGO',
    quote: 'Donors require proof that our volunteers are verified and accountable. TrustGrid Trust Passports are now our proof-of-deployment.',
    pain: 'No verifiable record of volunteer identity and deployment',
    icon: '🤝',
  },
  {
    photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80&h=80&fit=crop&crop=face',
    title: 'Verified Service Workers',
    role: 'Electrician, 8yr experience',
    quote: 'My TrustGrid passport shows my full work history, NIN verification, and endorsements. I now get called first — without any agency taking a cut.',
    pain: 'No portable professional reputation outside personal contacts',
    icon: '⚡',
  },
]

export default function WhoWeServe() {
  return (
    <section id="who-we-serve" className="py-24 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <span className="text-teal-600 text-sm font-semibold uppercase tracking-widest">Who We Serve</span>
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 mt-3 mb-4">
            Built for institutions.<br />
            <span className="text-gradient">Trusted by communities.</span>
          </h2>
          <p className="text-slate-500 max-w-xl mx-auto">
            Residents are users. Institutions are customers. Workers build their reputation. Everyone benefits from permanent trust infrastructure.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {CUSTOMERS.map(({ photo, title, role, quote, pain, icon }) => (
            <div key={title} className="glass glass-hover rounded-2xl p-6 transition-all">
              <div className="flex items-start gap-3 mb-4">
                <span className="text-2xl mt-0.5">{icon}</span>
                <div>
                  <div className="font-bold text-slate-900 text-sm">{title}</div>
                </div>
              </div>

              <div className="flex items-start gap-3 mb-4 bg-slate-50 rounded-xl p-3">
                <img src={photo} alt={role} className="w-10 h-10 rounded-full object-cover shrink-0 ring-1 ring-slate-200" />
                <div>
                  <p className="text-slate-600 text-xs leading-relaxed italic">&ldquo;{quote}&rdquo;</p>
                  <p className="text-slate-400 text-[10px] mt-1.5">— {role}</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <span className="text-red-400 text-xs mt-0.5">✗</span>
                <span className="text-slate-400 text-xs">{pain}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
