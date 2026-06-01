const steps = [
  {
    step: '01',
    title: 'Onboard your institution',
    desc: 'Register your estate, church, school, or organisation. Configure your trust score weights, service categories, and verification requirements.',
  },
  {
    step: '02',
    title: 'Register your workers',
    desc: 'Add workers via the dashboard or mobile app. Collect their details, skills, and identity documents. Verify via NIN or BVN.',
  },
  {
    step: '03',
    title: 'Build trust over time',
    desc: 'Every deployment, rating, endorsement, and resolved incident automatically updates each worker\'s trust score.',
  },
  {
    step: '04',
    title: 'Deploy with confidence',
    desc: 'When you need workers — for a routine job or a 500-person convention — filter by skill and trust score. Assign verified people in minutes.',
  },
]

export default function HowItWorks() {
  return (
    <section className="py-20 px-6 bg-gray-50">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-brand-700 font-semibold text-sm uppercase tracking-widest mb-3">How It Works</p>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Up and running in days, not months</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {steps.map((s, i) => (
            <div key={s.step} className="bg-white rounded-xl p-7 border border-gray-100">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-brand-700 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                  {s.step}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">{s.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
