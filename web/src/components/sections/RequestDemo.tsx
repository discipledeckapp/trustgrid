'use client'
import { useState } from 'react'

export default function RequestDemo() {
  const [form, setForm] = useState({ institutionName:'', name:'', email:'', role:'', phone:'', institutionType:'', message:'' })
  const [status, setStatus] = useState<'idle'|'submitting'|'success'|'error'>('idle')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('submitting')
    try {
      const res = await fetch('/api/demo-request', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify(form),
      })
      setStatus(res.ok ? 'success' : 'error')
      if (res.ok) setForm({ institutionName:'', name:'', email:'', role:'', phone:'', institutionType:'', message:'' })
    } catch { setStatus('error') }
  }

  return (
    <section id="request-demo" className="py-24 px-6 bg-slate-50">
      <div className="max-w-5xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-start">
          {/* Left: copy */}
          <div>
            <span className="text-indigo-600 text-sm font-semibold uppercase tracking-widest">Get Started</span>
            <h2 className="text-4xl font-black text-slate-900 mt-3 mb-4 leading-tight">
              See TrustGrid<br />
              <span className="text-gradient">working for your institution</span>
            </h2>
            <p className="text-slate-500 leading-relaxed mb-8">
              We will set up a live demo with your actual use case — whether you manage an estate, run a convention, or operate a school. You will see real workers, real trust scores, and a real deployment flow.
            </p>

            <div className="space-y-4 mb-8">
              {[
                { icon: '🎯', title: '30-minute focused demo', desc: 'Tailored to your institution type — no generic slides' },
                { icon: '⚡', title: 'Live product walkthrough', desc: 'The actual platform, not a prototype' },
                { icon: '🤝', title: 'Pilot discussion', desc: 'We will discuss a free pilot for qualifying institutions' },
              ].map(({ icon, title, desc }) => (
                <div key={title} className="flex items-start gap-3">
                  <span className="text-xl mt-0.5">{icon}</span>
                  <div>
                    <div className="text-slate-800 font-semibold text-sm">{title}</div>
                    <div className="text-slate-500 text-sm">{desc}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Already have an account? */}
            <div className="rounded-2xl p-5 border border-slate-200 bg-white space-y-3">
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-widest">Already on TrustGrid?</p>
              <a href="https://app.trustgrid.ng/login"
                className="flex items-center justify-between px-4 py-3 rounded-xl border border-slate-200 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all group">
                <div>
                  <div className="text-sm font-semibold text-slate-800">Institution Sign In</div>
                  <div className="text-xs text-slate-400">Estates, churches, schools, facilities</div>
                </div>
                <svg className="w-4 h-4 text-slate-400 group-hover:text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
              </a>
              <a href="https://app.trustgrid.ng/worker-signup"
                className="flex items-center justify-between px-4 py-3 rounded-xl border border-slate-200 hover:border-teal-200 hover:bg-teal-50/30 transition-all group">
                <div>
                  <div className="text-sm font-semibold text-slate-800">Worker Sign Up</div>
                  <div className="text-xs text-slate-400">Build your portable Trust Passport</div>
                </div>
                <svg className="w-4 h-4 text-slate-400 group-hover:text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
              </a>
              <a href="https://app.trustgrid.ng/join/organisation"
                className="flex items-center justify-between px-4 py-3 rounded-xl border border-slate-200 hover:border-violet-200 hover:bg-violet-50/30 transition-all group">
                <div>
                  <div className="text-sm font-semibold text-slate-800">Organisation Sign Up</div>
                  <div className="text-xs text-slate-400">CAC-verified companies & contractors</div>
                </div>
                <svg className="w-4 h-4 text-slate-400 group-hover:text-violet-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
              </a>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-200">
              <p className="text-slate-400 text-sm mb-2">Prefer to reach out directly?</p>
              <a href="mailto:hello@trustgrid.ng" className="text-indigo-600 hover:text-indigo-700 font-medium text-sm transition-colors">hello@trustgrid.ng</a>
            </div>
          </div>

          {/* Right: form */}
          <div>
            {status === 'success' ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-sm">
                <div className="text-5xl mb-4">✅</div>
                <h3 className="text-xl font-black text-slate-900 mb-2">Request received!</h3>
                <p className="text-slate-500">We will reach out within 24 hours at the number you provided.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-sm">
                <h3 className="font-black text-slate-900 text-lg mb-1">Request a Demo</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-xs text-slate-500 font-medium mb-1.5">Institution Name *</label>
                    <input required value={form.institutionName} onChange={e => setForm({...form,institutionName:e.target.value})}
                      placeholder="e.g. Redemption City Estate"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 font-medium mb-1.5">Institution Type *</label>
                    <select required value={form.institutionType} onChange={e => setForm({...form,institutionType:e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100">
                      <option value="">Select...</option>
                      {['Estate / Community','Church / Religious Org','Convention / Event','School / University','Facility Management','Smart City / Government','Other'].map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 font-medium mb-1.5">Your Role *</label>
                    <input required value={form.role} onChange={e => setForm({...form,role:e.target.value})}
                      placeholder="e.g. Estate Manager"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 font-medium mb-1.5">Your Name *</label>
                    <input required value={form.name} onChange={e => setForm({...form,name:e.target.value})}
                      placeholder="Full name"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 font-medium mb-1.5">Phone Number *</label>
                    <input required type="tel" value={form.phone} onChange={e => setForm({...form,phone:e.target.value})}
                      placeholder="+234 801 234 5678"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs text-slate-500 font-medium mb-1.5">Email Address *</label>
                    <input required type="email" value={form.email} onChange={e => setForm({...form,email:e.target.value})}
                      placeholder="you@institution.org"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs text-slate-500 font-medium mb-1.5">What is your biggest challenge? (optional)</label>
                    <textarea rows={2} value={form.message} onChange={e => setForm({...form,message:e.target.value})}
                      placeholder="e.g. We manage 150 domestic workers with no system..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 resize-none" />
                  </div>
                </div>

                {status === 'error' && <p className="text-red-500 text-xs">Something went wrong. Email us at hello@trustgrid.ng</p>}

                <button type="submit" disabled={status==='submitting'}
                  className="w-full py-3.5 rounded-xl font-bold text-white text-sm hover:opacity-90 disabled:opacity-60 transition-opacity shadow-lg shadow-indigo-100"
                  style={{background:'linear-gradient(135deg,#4F46E5,#0D9488)'}}>
                  {status==='submitting' ? 'Sending...' : 'Request a Demo →'}
                </button>
                <p className="text-center text-xs text-slate-400">We respond within 24 hours · hello@trustgrid.ng</p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
