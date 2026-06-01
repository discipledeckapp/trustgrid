export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 py-12 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 bg-brand-600 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <span className="text-white font-bold">TrustGrid</span>
            </div>
            <p className="text-sm max-w-xs leading-relaxed">
              The workforce governance platform for communities, institutions, and smart cities across Africa.
            </p>
          </div>

          <div className="flex gap-12">
            <div>
              <p className="text-white text-sm font-medium mb-3">Product</p>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#who-we-serve" className="hover:text-white transition-colors">Who We Serve</a></li>
                <li><a href="https://app.trustgrid.ng" className="hover:text-white transition-colors">Live Demo</a></li>
              </ul>
            </div>
            <div>
              <p className="text-white text-sm font-medium mb-3">Company</p>
              <ul className="space-y-2 text-sm">
                <li><a href="mailto:hello@trustgrid.ng" className="hover:text-white transition-colors">hello@trustgrid.ng</a></li>
                <li><a href="#request-demo" className="hover:text-white transition-colors">Request Demo</a></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
          <p>© 2026 TrustGrid. All rights reserved.</p>
          <p>Trusted People. Accountable Service. Stronger Communities.</p>
        </div>
      </div>
    </footer>
  )
}
