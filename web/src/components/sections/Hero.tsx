import Link from 'next/link'

// Trust Passport card mockup — shows the actual product
function PassportMockup() {
  return (
    <div className="relative w-full max-w-sm mx-auto">
      {/* Glow behind card */}
      <div className="absolute inset-0 bg-indigo-500/20 blur-3xl rounded-3xl" />

      <div className="relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl" style={{background:'linear-gradient(135deg,#1a1a2e 0%,#16213e 100%)'}}>
        {/* Card header */}
        <div className="p-5 relative overflow-hidden" style={{background:'linear-gradient(135deg,#4F46E5,#0D9488)'}}>
          <div className="absolute inset-0 opacity-10" style={{backgroundImage:'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',backgroundSize:'20px 20px'}} />
          <div className="relative flex items-center justify-between mb-4">
            <div className="text-[10px] font-bold tracking-widest text-white/70 uppercase">Community Trust Passport</div>
            <div className="text-[10px] font-mono text-white/40">TGP-4A7F9C</div>
          </div>
          <div className="relative flex items-end gap-3">
            {/* Avatar with photo */}
            <div className="relative shrink-0">
              <img src="https://images.unsplash.com/photo-1531384441138-2736e62e0919?w=80&h=80&fit=crop&crop=face" alt="Worker" className="w-16 h-16 rounded-xl object-cover border-2 border-white/20" />
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-white">
                <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
              </div>
            </div>
            <div>
              <div className="text-white font-bold text-base">Chukwuemeka A.</div>
              <div className="text-indigo-200 text-xs">Electrician · 5yr experience</div>
              <div className="flex items-center gap-1.5 mt-1.5">
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full px-2 py-0.5">✓ NIN Verified</span>
                <span className="text-[10px] bg-white/10 text-white/70 rounded-full px-2 py-0.5">Available</span>
              </div>
            </div>
            {/* Trust score */}
            <div className="ml-auto text-center shrink-0">
              <div className="text-2xl font-black text-white">91.5</div>
              <div className="text-[10px] text-emerald-300 font-bold">A+ Grade</div>
            </div>
          </div>
        </div>

        {/* Card body */}
        <div className="p-4 space-y-3">
          {/* Score bars */}
          <div className="space-y-1.5">
            {[['Identity',95,'bg-emerald-500'],['Deployments',88,'bg-indigo-500'],['Ratings',94,'bg-amber-500'],['Endorsements',85,'bg-violet-500']].map(([label,pct,color]) => (
              <div key={String(label)} className="flex items-center gap-2">
                <span className="text-[10px] text-white/40 w-20 shrink-0">{label}</span>
                <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                  <div className={`h-full ${color} rounded-full`} style={{width:`${pct}%`}} />
                </div>
                <span className="text-[10px] text-white/40 w-6 text-right">{pct}</span>
              </div>
            ))}
          </div>

          {/* Endorsement faces */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {['photo-1531384441138-2736e62e0919','photo-1507003211169-0a1dd7228f2d','photo-1438761681033-6461ffad8d80','photo-1472099645785-5658abf4ff4e'].map((id,i) => (
                  <img key={i} src={`https://images.unsplash.com/${id}?w=28&h=28&fit=crop&crop=face`} className="w-6 h-6 rounded-full border-2 border-[#1a1a2e] object-cover" alt="" />
                ))}
              </div>
              <span className="text-[10px] text-white/40">12 endorsements</span>
            </div>
            <div className="flex items-center gap-1">
              {[1,2,3,4,5].map(s => <span key={s} className="text-amber-400 text-xs">★</span>)}
              <span className="text-[10px] text-white/40 ml-1">4.9</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center mesh-bg overflow-hidden pt-16">
      {/* Decorative orbs */}
      <div className="absolute top-20 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 right-1/4 w-80 h-80 bg-teal-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 py-20 w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left — copy */}
          <div className="animate-fade-up">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
              <span className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse" />
              Built for Nigerian Institutions
            </div>

            <h1 className="text-5xl lg:text-6xl font-black leading-[1.08] tracking-tight mb-6">
              <span className="text-white">The Trust Layer</span>
              <br />
              <span className="text-gradient">Communities Need</span>
            </h1>

            <p className="text-lg text-white/60 leading-relaxed mb-8 max-w-lg">
              TrustGrid gives estates, churches, schools, and smart cities the infrastructure to verify, deploy, and govern trusted service workers — turning WhatsApp chaos into permanent institutional accountability.
            </p>

            {/* Key facts — honest, product-based */}
            <div className="flex flex-wrap gap-4 mb-10">
              {[
                { icon: '🔐', text: 'NIN/BVN verified workers' },
                { icon: '⭐', text: 'Algorithmic trust scores' },
                { icon: '🏛️', text: 'Built for institutions' },
              ].map(({ icon, text }) => (
                <div key={text} className="flex items-center gap-2 text-sm text-white/50">
                  <span>{icon}</span>
                  <span>{text}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <a href="#request-demo"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-white text-sm hover:opacity-90 transition-opacity"
                style={{background:'linear-gradient(135deg,#4F46E5,#0D9488)'}}>
                Request a Demo
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
              </a>
              <a href="https://app.trustgrid.ng/login"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold text-white/70 border border-white/10 hover:border-white/20 hover:text-white transition-all">
                View Live Demo →
              </a>
            </div>
          </div>

          {/* Right — product mockup */}
          <div className="animate-fade-up delay-200">
            <PassportMockup />

            {/* Caption */}
            <p className="text-center text-xs text-white/30 mt-4">
              Community Trust Passport — built into TrustGrid
            </p>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="flex justify-center mt-20">
          <a href="#problem" className="flex flex-col items-center gap-2 text-white/20 hover:text-white/40 transition-colors">
            <span className="text-xs tracking-widest uppercase">Scroll</span>
            <svg className="w-5 h-5 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  )
}
