export default function Hero() {
  return (
    <section className="pt-32 pb-20 px-6 bg-gradient-to-b from-brand-50 to-white">
      <div className="max-w-4xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 bg-brand-100 text-brand-700 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
          <span className="w-2 h-2 bg-brand-700 rounded-full animate-pulse" />
          Built for Nigerian & African Communities
        </div>

        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight mb-6">
          Trusted People.<br />
          <span className="text-brand-700">Accountable Service.</span><br />
          Stronger Communities.
        </h1>

        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed">
          TrustGrid is the workforce governance platform for estates, churches, schools,
          and smart cities — verify workers, track performance, govern service delivery,
          and build permanent institutional trust.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="#request-demo"
            className="w-full sm:w-auto bg-brand-700 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-brand-800 transition-colors shadow-lg shadow-brand-700/20"
          >
            Request a Demo
          </a>
          <a
            href="https://app.trustgrid.ng"
            className="w-full sm:w-auto border border-gray-300 text-gray-700 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-50 transition-colors"
          >
            View Live Demo →
          </a>
        </div>

        <p className="mt-6 text-sm text-gray-500">
          Free to get started · No credit card required · Built for Nigerian institutions
        </p>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto">
          {[
            { value: '14+', label: 'Core Modules' },
            { value: '100%', label: 'Configurable' },
            { value: '6+', label: 'African Countries' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl font-bold text-brand-700">{stat.value}</div>
              <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
