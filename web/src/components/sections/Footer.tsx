function NetworkG({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <defs>
        <linearGradient id="footer-g" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#818CF8"/>
          <stop offset="100%" stopColor="#67E8F9"/>
        </linearGradient>
      </defs>
      <path d="M 21 26 C 12 38,12 62,24 80 C 32 88,42 92,52 92 C 62 92,72 88,80 80 C 88 72,90 62,90 50" stroke="url(#footer-g)" strokeWidth="3.5" strokeLinecap="round" fill="none"/>
      <path d="M 90 50 L 52 50 L 76 50" stroke="url(#footer-g)" strokeWidth="3.5" strokeLinecap="round" fill="none"/>
      <circle cx="52" cy="50" r="5" fill="url(#footer-g)"/>
      <circle cx="90" cy="50" r="4.5" fill="url(#footer-g)"/>
    </svg>
  )
}

export default function Footer() {
  return (
    <footer style={{background:'#060609'}} className="border-t border-white/5">
      {/* Final CTA strip */}
      <div className="border-b border-white/5 py-16 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
            If Redemption City has one million people,<br className="hidden md:block" />
            <span className="text-gradient"> what governs trusted services?</span>
          </h2>
          <p className="text-white/40 mb-8 max-w-xl mx-auto">
            TrustGrid is that infrastructure. Not a marketplace. Not an app. The operating system for trusted communities.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href="#request-demo"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-white text-sm hover:opacity-90 transition-opacity"
              style={{background:'linear-gradient(135deg,#4F46E5,#0D9488)'}}>
              Request a Demo
            </a>
            <a href="https://app.trustgrid.ng/login"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold text-white/60 border border-white/10 hover:text-white hover:border-white/20 transition-all">
              View Live Platform
            </a>
          </div>
        </div>
      </div>

      {/* Footer links */}
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex flex-col md:flex-row items-start justify-between gap-8">
          <div className="max-w-xs">
            <div className="flex items-center gap-2.5 mb-3">
              <NetworkG size={22} />
              <span className="font-black text-white">Trust<span className="text-gradient">Grid</span></span>
            </div>
            <p className="text-white/30 text-sm leading-relaxed">
              Community Workforce & Service Governance Infrastructure. Built for Nigerian institutions and smart cities.
            </p>
            <p className="text-white/20 text-xs mt-3">hello@trustgrid.ng</p>
          </div>

          <div className="grid grid-cols-3 gap-8 text-sm">
            <div>
              <div className="text-white/20 text-xs uppercase tracking-widest font-semibold mb-3">Product</div>
              <div className="space-y-2">
                {[['#features','Features'],['#how-it-works','How It Works'],['https://app.trustgrid.ng/join','Self Register']].map(([href,label]) => (
                  <a key={String(label)} href={href} className="block text-white/40 hover:text-white transition-colors">{label}</a>
                ))}
              </div>
            </div>
            <div>
              <div className="text-white/20 text-xs uppercase tracking-widest font-semibold mb-3">For</div>
              <div className="space-y-2">
                {['Estates','Churches','Schools','Conventions','Facility Managers'].map(t => (
                  <span key={t} className="block text-white/40">{t}</span>
                ))}
              </div>
            </div>
            <div>
              <div className="text-white/20 text-xs uppercase tracking-widest font-semibold mb-3">Platform</div>
              <div className="space-y-2">
                {[['https://app.trustgrid.ng','App Login'],['https://app.trustgrid.ng/join/worker','Worker Signup'],['https://app.trustgrid.ng/join/organisation','Organisation Signup']].map(([href,label]) => (
                  <a key={String(label)} href={href} className="block text-white/40 hover:text-white transition-colors">{label}</a>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-white/20 text-xs">© 2026 TrustGrid. All rights reserved.</p>
          <p className="text-white/20 text-xs">Trusted People. Accountable Service. Stronger Communities.</p>
        </div>
      </div>
    </footer>
  )
}
