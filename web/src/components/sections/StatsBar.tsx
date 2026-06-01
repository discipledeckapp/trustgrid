const STATS = [
  { value: 'NIN + BVN',  label: 'Live Verification',      sub: 'via Prembly IdentityPass' },
  { value: '7-Level',    label: 'Community Hierarchy',     sub: 'Global down to Parish' },
  { value: '3',          label: 'Verification Pathways',   sub: 'Liveness · Upload · Agent' },
  { value: 'TGP-',       label: 'Trust Passport Format',   sub: 'QR-scannable, publicly verifiable' },
  { value: '∞',          label: 'Community Types',         sub: 'Church · Estate · School · City' },
]

export default function StatsBar() {
  return (
    <section
      className="border-y border-white/5 py-0"
      style={{ background: '#080810' }}
    >
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col sm:flex-row items-stretch divide-y sm:divide-y-0 sm:divide-x divide-white/8">
          {STATS.map(({ value, label, sub }) => (
            <div
              key={label}
              className="flex-1 flex flex-col items-center justify-center text-center py-8 px-4 sm:px-6 gap-1 hover:bg-white/[0.02] transition-colors"
            >
              <span
                className="text-3xl md:text-4xl font-black leading-none"
                style={{
                  background: 'linear-gradient(135deg, #ffffff 40%, #a5b4fc)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                {value}
              </span>
              <span className="text-white/70 text-xs font-semibold uppercase tracking-widest mt-1">
                {label}
              </span>
              <span className="text-white/25 text-[11px]">{sub}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
