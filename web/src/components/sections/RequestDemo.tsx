'use client'
import { useState } from 'react'

export default function RequestDemo() {
  const [form, setForm] = useState({ institutionName:'', name:'', role:'', phone:'', institutionType:'', message:'' })
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
      if (res.ok) setForm({ institutionName:'', name:'', role:'', phone:'', institutionType:'', message:'' })
    } catch { setStatus('error') }
  }

  return (
    <section id="request-demo" className="py-24 px-6" style={{background:'#0A0A0F'}}>
      <div className="max-w-5xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-start">
          {/* Left: copy */}
          <div>
            <span className="text-indigo-400 text-sm font-semibold uppercase tracking-widest">Get Started</span>
            <h2 className="text-4xl font-black text-white mt-3 mb-4 leading-tight">
              See TrustGrid<br />
              <span className="text-gradient">working for your institution</span>
            </h2>
            <p className="text-white/50 leading-relaxed mb-8">
              We will set up a live demo with your actual use case — whether you manage an estate, run a convention, or operate a school. You will see real workers, real trust scores, and a real deployment flow.
            </p>

            {/* What to expect */}
            <div className="space-y-4">
              {[
                { icon: '🎯', title: '30-minute focused demo', desc: 'Tailored to your institution type — no generic slides' },
                { icon: '⚡', title: 'Live product walkthrough', desc: 'The actual platform, not a prototype' },
                { icon: '🤝', title: 'Pilot discussion', desc: 'We will discuss a free pilot for qualifying institutions' },
              ].map(({ icon, title, desc }) => (
                <div key={title} className="flex items-start gap-3">
                  <span className="text-xl mt-0.5">{icon}</span>
                  <div>
                    <div className="text-white font-semibold text-sm">{title}</div>
                    <div className="text-white/40 text-sm">{desc}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Contact */}
            <div className="mt-8 pt-8 border-t border-white/5">
              <p className="text-white/30 text-sm mb-2">Prefer to reach out directly?</p>
              <a href="mailto:hello@trustgrid.ng" className="text-indigo-400 hover:text-indigo-300 font-medium text-sm transition-colors">hello@trustgrid.ng</a>
            </div>
          </div>

          {/* Right: form */}
          <div>
            {status === 'success' ? (
              <div className="glass rounded-2xl p-8 text-center">
                <div className="text-5xl mb-4">✅</div>
                <h3 className="text-xl font-black text-white mb-2">Request received!</h3>
                <p className="text-white/50">We will reach out within 24 hours at the number you provided.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="glass rounded-2xl p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-xs text-white/40 font-medium mb-1.5">Institution Name *</label>
                    <input required value={form.institutionName} onChange={e => setForm({...form,institutionName:e.target.value})}
                      placeholder="e.g. Redemption City Estate"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-indigo-500/50" />
                  </div>
                  <div>
                    <label className="block text-xs text-white/40 font-medium mb-1.5">Institution Type *</label>
                    <select required value={form.institutionType} onChange={e => setForm({...form,institutionType:e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500/50">
                      <option value="" className="bg-[#1a1a2e]">Select...</option>
                      {['Estate / Community','Church / Religious Org','Convention / Event','School / University','Facility Management','Smart City / Government','Other'].map(t => (
                        <option key={t} value={t} className="bg-[#1a1a2e]">{t}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-white/40 font-medium mb-1.5">Your Role *</label>
                    <input required value={form.role} onChange={e => setForm({...form,role:e.target.value})}
                      placeholder="e.g. Estate Manager"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-indigo-500/50" />
                  </div>
                  <div>
                    <label className="block text-xs text-white/40 font-medium mb-1.5">Your Name *</label>
                    <input required value={form.name} onChange={e => setForm({...form,name:e.target.value})}
                      placeholder="Full name"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-indigo-500/50" />
                  </div>
                  <div>
                    <label className="block text-xs text-white/40 font-medium mb-1.5">Phone Number *</label>
                    <input required type="tel" value={form.phone} onChange={e => setForm({...form,phone:e.target.value})}
                      placeholder="+234 801 234 5678"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-indigo-500/50" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs text-white/40 font-medium mb-1.5">What is your biggest challenge? (optional)</label>
                    <textarea rows={2} value={form.message} onChange={e => setForm({...form,message:e.target.value})}
                      placeholder="e.g. We manage 150 domestic workers with no system..."
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-indigo-500/50 resize-none" />
                  </div>
                </div>

                {status === 'error' && <p className="text-red-400 text-xs">Something went wrong. Email us at hello@trustgrid.ng</p>}

                <button type="submit" disabled={status==='submitting'}
                  className="w-full py-3.5 rounded-xl font-bold text-white text-sm hover:opacity-90 disabled:opacity-60 transition-opacity"
                  style={{background:'linear-gradient(135deg,#4F46E5,#0D9488)'}}>
                  {status==='submitting' ? 'Sending...' : 'Request a Demo →'}
                </button>
                <p className="text-center text-xs text-white/20">We respond within 24 hours · hello@trustgrid.ng</p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
