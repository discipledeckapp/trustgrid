const problems = [
  { question: 'Who can we trust?', cause: 'No verification layer — anyone can be recommended' },
  { question: 'Who performed well?', cause: 'Memory and verbal recommendations only' },
  { question: 'Who should we rehire?', cause: 'No deployment or performance history' },
  { question: 'Who has unresolved incidents?', cause: 'Incidents forgotten or buried in chats' },
  { question: 'How do we staff 500 workers for our convention?', cause: 'No workforce management system' },
]

export default function Problem() {
  return (
    <section id="problem" className="py-20 px-6 bg-gray-50">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-brand-700 font-semibold text-sm uppercase tracking-widest mb-3">The Problem</p>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            The problem is not finding workers.<br />It is trusting them.
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Every estate, church, school, and event organiser in Nigeria already knows workers.
            The crisis is governance — there is no institutional infrastructure to answer these questions with data.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-12">
          {problems.map((p) => (
            <div key={p.question} className="bg-white rounded-xl p-6 border border-red-100">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-red-500 text-xs font-bold">?</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{p.question}</p>
                  <p className="text-gray-500 text-sm mt-1">{p.cause}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-8">
          <p className="text-center text-gray-500 text-sm font-medium uppercase tracking-widest mb-6">
            Where this information lives today
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {['WhatsApp Groups', 'Excel Spreadsheets', 'Personal Contacts', 'Verbal Recommendations', 'Physical Notebooks'].map((item) => (
              <div key={item} className="flex items-center gap-2 bg-gray-50 border border-gray-200 px-4 py-2 rounded-lg">
                <span className="text-red-400">✗</span>
                <span className="text-gray-700 text-sm">{item}</span>
              </div>
            ))}
          </div>
          <p className="text-center text-gray-500 text-sm mt-6">
            This data is lost every time a coordinator changes, a phone is stolen, or a WhatsApp group is deleted.
          </p>
        </div>
      </div>
    </section>
  )
}
