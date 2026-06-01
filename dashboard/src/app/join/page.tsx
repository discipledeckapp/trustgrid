'use client'
import { useEffect, useState } from 'react'
import { Shield, ShieldCheck, Users, Briefcase, ArrowRight, Smartphone } from 'lucide-react'
import { useBrand } from '@/hooks/useBrand'

export default function JoinPage() {
  const { effective, found, name } = useBrand()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const communityName = name ?? effective.displayName ?? 'TrustGrid'
  const primaryColor  = effective.primaryColor ?? '#4F46E5'
  const accentColor   = effective.accentColor  ?? '#0D9488'

  const bgStyle = { background: `linear-gradient(135deg, ${primaryColor} 0%, ${accentColor} 100%)` }

  return (
    <div className="min-h-screen flex flex-col" style={bgStyle}>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2.5">
          {effective.logoUrl ? (
            <img src={effective.logoUrl} alt={communityName} className="h-8 w-auto object-contain" />
          ) : (
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
          )}
          <span className="text-white font-black text-lg">{communityName}</span>
        </div>
        <span className="text-white/40 text-xs font-medium">Powered by TrustGrid</span>
      </div>

      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 text-center">
        <div className="w-20 h-20 rounded-3xl bg-white/15 flex items-center justify-center mb-8 border border-white/20">
          <ShieldCheck className="w-10 h-10 text-white" />
        </div>

        <h1 className="text-4xl font-black text-white leading-tight mb-4 max-w-md">
          Join {communityName}
        </h1>
        <p className="text-white/70 text-lg max-w-md leading-relaxed mb-10">
          Get your verified Trust Passport and become a trusted member of {communityName}.
        </p>

        {/* What you get */}
        <div className="grid grid-cols-3 gap-4 max-w-md w-full mb-10">
          {[
            { icon: ShieldCheck, label: 'Verified Identity' },
            { icon: Users,       label: 'Community Member' },
            { icon: Briefcase,   label: 'Trust Passport' },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="bg-white/10 rounded-2xl p-4 border border-white/10">
              <Icon className="w-6 h-6 text-white mx-auto mb-2" />
              <p className="text-white/80 text-xs font-semibold">{label}</p>
            </div>
          ))}
        </div>

        {/* CTAs */}
        <div className="flex flex-col gap-3 w-full max-w-sm">
          <a href="/onboarding/apply"
            className="flex items-center justify-center gap-2 bg-white text-gray-900 font-black py-4 rounded-2xl text-base shadow-xl hover:shadow-2xl transition-shadow">
            Apply to Join <ArrowRight className="w-5 h-5" />
          </a>
          <a href="/login"
            className="flex items-center justify-center gap-2 bg-white/10 text-white font-semibold py-4 rounded-2xl text-base border border-white/20 hover:bg-white/20 transition-colors">
            Already a member? Sign in
          </a>
        </div>

        {/* App download hint */}
        <div className="mt-8 flex items-center gap-2 text-white/40 text-sm">
          <Smartphone className="w-4 h-4" />
          <span>Download the TrustGrid app for the best experience</span>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 text-center">
        <p className="text-white/30 text-xs">
          Trusted by communities across Nigeria &middot;{' '}
          <a href="https://trustgrid.ng" className="hover:text-white/60 transition-colors">trustgrid.ng</a>
        </p>
      </div>
    </div>
  )
}
