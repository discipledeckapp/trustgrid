'use client'
import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { CheckCircle, Zap, Building2, Calendar, CreditCard, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function BillingPage() {
  const [selectedPlan, setSelectedPlan] = useState('growth')
  const [email, setEmail] = useState('')
  const [paying, setPaying] = useState(false)

  const { data: plans } = useQuery({
    queryKey: ['billing-plans'],
    queryFn: () => api.get('/billing/plans').then(r => r.data),
    retry: false,
  })

  const { data: status } = useQuery({
    queryKey: ['billing-status'],
    queryFn: () => api.get('/billing/status').then(r => r.data),
    retry: false,
  })

  async function handleSubscribe() {
    if (!email) return
    setPaying(true)
    try {
      const { data } = await api.post(`/billing/subscribe/${selectedPlan}`, { email })
      // Redirect to Paystack checkout
      window.open(data.authorizationUrl, '_blank')
    } catch (err: any) {
      alert(err?.response?.data?.message ?? 'Payment initiation failed. Check Paystack configuration.')
    } finally {
      setPaying(false)
    }
  }

  const subs = plans?.subscriptions ?? []
  const verificationFees = plans?.verification ?? []
  const eventFees = plans?.events ?? []

  const PLAN_FEATURES: Record<string, string[]> = {
    starter:      ['Up to 50 workers','NIN/BVN verification','Trust score engine','Service requests','Incident management','Email support'],
    growth:       ['Up to 250 workers','All Starter features','Performance reviews','Endorsements','Organisations module','WhatsApp notifications','Priority support'],
    professional: ['Up to 1,000 workers','All Growth features','Volunteer registry','Procurement governance','Analytics & reports','Custom trust weights','Dedicated onboarding'],
    enterprise:   ['Unlimited workers','All Professional features','Multi-site management','Smart city dashboard','Custom integrations','SLA agreement','Dedicated account manager'],
  }

  return (
    <div className="max-w-5xl mx-auto p-6 pb-16">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
          <CreditCard className="w-6 h-6 text-indigo-600" /> Billing & Plans
        </h1>
        <p className="text-gray-500 text-sm mt-0.5">
          Choose the plan that fits your institution. Cancel anytime.
        </p>
      </div>

      {!status?.configured && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 mb-6 flex items-start gap-3">
          <Zap className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-amber-800 text-sm">Paystack not configured</p>
            <p className="text-amber-700 text-xs mt-0.5">
              Add <code className="bg-amber-100 px-1 rounded">PAYSTACK_SECRET_KEY</code> to Render environment variables to enable payments.
              Get your key from <a href="https://dashboard.paystack.com" target="_blank" className="underline">dashboard.paystack.com</a>.
            </p>
          </div>
        </div>
      )}

      {/* Subscription plans */}
      <div className="mb-10">
        <h2 className="text-lg font-bold text-gray-900 mb-1">Institution Subscriptions</h2>
        <p className="text-gray-500 text-sm mb-5">Monthly recurring. All plans include identity verification, trust scores, and workforce governance.</p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {subs.map((plan: any) => {
            const isSelected = selectedPlan === plan.id
            const isPopular  = plan.id === 'growth'
            return (
              <div key={plan.id}
                onClick={() => !plan.isCustom && setSelectedPlan(plan.id)}
                className={cn(
                  'rounded-2xl border p-5 cursor-pointer transition-all',
                  isSelected ? 'border-indigo-500 bg-indigo-50 shadow-md shadow-indigo-100' :
                  'border-gray-100 bg-white hover:border-indigo-200',
                )}>
                {isPopular && (
                  <span className="text-[10px] bg-indigo-600 text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">Most Popular</span>
                )}
                <h3 className="font-black text-gray-900 mt-2 text-sm">{plan.name.replace('TrustGrid ','')}</h3>
                {plan.isCustom ? (
                  <p className="text-2xl font-black text-indigo-600 mt-1">Custom</p>
                ) : (
                  <div className="mt-1">
                    <span className="text-2xl font-black text-gray-900">₦{plan.amountNGN.toLocaleString()}</span>
                    <span className="text-gray-400 text-xs">/month</span>
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  {plan.maxWorkers === -1 ? 'Unlimited workers' : `Up to ${plan.maxWorkers} workers`}
                </p>

                <div className="mt-3 space-y-1.5">
                  {(PLAN_FEATURES[plan.id] ?? []).slice(0,4).map((f: string) => (
                    <div key={f} className="flex items-center gap-1.5">
                      <CheckCircle className="w-3 h-3 text-emerald-500 shrink-0" />
                      <span className="text-xs text-gray-600">{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        {/* Payment form */}
        {status?.configured && (
          <div className="bg-white rounded-2xl border border-gray-100 p-5 max-w-md">
            <h3 className="font-bold text-gray-900 mb-3 text-sm">Subscribe to {selectedPlan} plan</h3>
            <div className="flex gap-2">
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="Billing email address"
                className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              <button onClick={handleSubscribe} disabled={!email || paying}
                className="px-4 py-2.5 text-white rounded-xl text-sm font-bold hover:opacity-90 disabled:opacity-60 transition-opacity whitespace-nowrap flex items-center gap-2"
                style={{background:'linear-gradient(135deg,#4F46E5,#0D9488)'}}>
                {paying ? '...' : <><ExternalLink className="w-3.5 h-3.5" /> Pay with Paystack</>}
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-2">You will be redirected to Paystack for secure payment. Recurring monthly billing.</p>
          </div>
        )}
      </div>

      {/* One-time fees */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Verification fees */}
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-1">Worker Verification Fees</h2>
          <p className="text-gray-500 text-sm mb-3">One-time per worker. Paid by institution or worker directly.</p>
          <div className="space-y-2">
            {verificationFees.map((fee: any) => (
              <div key={fee.id} className="bg-white rounded-xl border border-gray-100 p-4 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{fee.name}</p>
                </div>
                <div className="text-right">
                  <p className="font-black text-gray-900">₦{fee.amountNGN.toLocaleString()}</p>
                  <p className="text-xs text-gray-400">one-time</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Event module fees */}
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-1">Convention & Event Module</h2>
          <p className="text-gray-500 text-sm mb-3">Per-event pricing. Includes full workforce assignment and tracking.</p>
          <div className="space-y-2">
            {eventFees.map((fee: any) => (
              <div key={fee.id} className="bg-white rounded-xl border border-gray-100 p-4 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{fee.name}</p>
                </div>
                <div className="text-right">
                  <p className="font-black text-gray-900">₦{fee.amountNGN.toLocaleString()}</p>
                  <p className="text-xs text-gray-400">per event</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Paystack branding */}
      <div className="mt-10 text-center">
        <p className="text-xs text-gray-400">
          All payments processed securely by{' '}
          <a href="https://paystack.com" target="_blank" className="text-indigo-600 hover:underline font-semibold">Paystack</a>
          {' '}· Nigerian-built payment infrastructure
        </p>
      </div>
    </div>
  )
}
