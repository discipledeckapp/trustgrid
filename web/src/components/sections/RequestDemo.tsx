'use client'
import { useState } from 'react'

export default function RequestDemo() {
  const [form, setForm] = useState({
    institutionName: '',
    name: '',
    role: '',
    phone: '',
    institutionType: '',
    message: '',
  })
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('submitting')
    try {
      const res = await fetch('/api/demo-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        setStatus('success')
        setForm({ institutionName: '', name: '', role: '', phone: '', institutionType: '', message: '' })
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  return (
    <section id="request-demo" className="py-20 px-6 bg-gray-50">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <p className="text-brand-700 font-semibold text-sm uppercase tracking-widest mb-3">Get Started</p>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Request a Demo</h2>
          <p className="text-gray-600">
            Tell us about your institution. We will reach out within 24 hours to schedule a live walkthrough.
          </p>
        </div>

        {status === 'success' ? (
          <div className="bg-white rounded-2xl border border-green-200 p-10 text-center">
            <div className="text-5xl mb-4">✅</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Request received!</h3>
            <p className="text-gray-600">We will contact you within 24 hours at the number provided.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 p-8 space-y-5">
            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Institution Name *</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Redemption City Estate"
                  value={form.institutionName}
                  onChange={e => setForm({ ...form, institutionName: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Institution Type *</label>
                <select
                  required
                  value={form.institutionType}
                  onChange={e => setForm({ ...form, institutionType: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 bg-white"
                >
                  <option value="">Select type</option>
                  <option>Estate / Residential Community</option>
                  <option>Church / Religious Organisation</option>
                  <option>School / University</option>
                  <option>Convention / Event Organiser</option>
                  <option>Facility Management Company</option>
                  <option>Smart City / Government</option>
                  <option>Other</option>
                </select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Your Name *</label>
                <input
                  required
                  type="text"
                  placeholder="Full name"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Your Role *</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Estate Manager, Facility Director"
                  value={form.role}
                  onChange={e => setForm({ ...form, role: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number *</label>
              <input
                required
                type="tel"
                placeholder="+234 801 234 5678"
                value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Tell us about your challenge (optional)</label>
              <textarea
                rows={3}
                placeholder="How many workers do you manage? What is your biggest pain point today?"
                value={form.message}
                onChange={e => setForm({ ...form, message: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 resize-none"
              />
            </div>

            {status === 'error' && (
              <p className="text-red-500 text-sm">Something went wrong. Please email us at hello@trustgrid.ng</p>
            )}

            <button
              type="submit"
              disabled={status === 'submitting'}
              className="w-full bg-brand-700 text-white py-4 rounded-xl font-semibold hover:bg-brand-800 transition-colors disabled:opacity-60"
            >
              {status === 'submitting' ? 'Sending...' : 'Request a Demo →'}
            </button>

            <p className="text-center text-xs text-gray-400">
              We respond within 24 hours · hello@trustgrid.ng
            </p>
          </form>
        )}
      </div>
    </section>
  )
}
