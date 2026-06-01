'use client'

import { useState } from 'react'

/* ─── Dashboard mockup data ─────────────────────────────────── */
const WORKERS = [
  // Professionals — suit/office photos
  {
    name: 'Ngozi C.',
    role: 'Corporate Lawyer',
    grade: 'A+',
    score: 97,
    jobs: 42,
    verified: true,
    gradeColor: '#10B981',
    img: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop&crop=face',
  },
  {
    name: 'Chukwuemeka A.',
    role: 'Software Engineer',
    grade: 'A+',
    score: 91,
    jobs: 28,
    verified: true,
    gradeColor: '#10B981',
    img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
  },
  {
    name: 'Amaka E.',
    role: 'Accountant',
    grade: 'A',
    score: 88,
    jobs: 35,
    verified: true,
    gradeColor: '#14B8A6',
    img: 'https://images.unsplash.com/photo-1580489944761-15a19d674916?w=400&h=400&fit=crop&crop=face',
  },
  // Artisans — working photos
  {
    name: 'Babatunde O.',
    role: 'Electrician',
    grade: 'A',
    score: 87,
    jobs: 31,
    verified: true,
    gradeColor: '#14B8A6',
    img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face',
  },
  {
    name: 'Segun F.',
    role: 'Plumber',
    grade: 'B+',
    score: 74,
    jobs: 19,
    verified: false,
    gradeColor: '#6366F1',
    img: 'https://images.unsplash.com/photo-1522529599102-193c0d76b5b6?w=400&h=400&fit=crop&crop=face',
  },
  {
    name: 'Adaeze M.',
    role: 'Security Guard',
    grade: 'B',
    score: 68,
    jobs: 12,
    verified: false,
    gradeColor: '#6366F1',
    img: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face',
  },
]

/* ─── Dot-grid QR placeholder ───────────────────────────────── */
function QRDots() {
  const PATTERN = [
    [1,1,1,1,1,1,1,0,1,0,0,1,0,1,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,1,0,1,1,0,0,1,0,1,0,0,0,0,0,1],
    [1,0,1,1,1,0,1,0,0,0,1,0,0,0,1,0,1,1,1,0,1],
    [1,0,1,1,1,0,1,0,1,0,0,1,0,0,1,0,1,1,1,0,1],
    [1,0,0,0,0,0,1,0,0,1,1,0,0,0,1,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,0,1,0,1,0,1,0,1,1,1,1,1,1,1],
    [0,0,0,0,0,0,0,0,1,1,0,1,1,0,0,0,0,0,0,0,0],
    [1,0,1,1,0,1,0,1,0,1,1,0,0,1,1,0,1,1,0,1,0],
    [0,1,0,0,1,0,1,0,1,0,0,1,0,1,0,1,0,0,1,0,1],
    [0,0,1,0,0,1,0,1,1,0,1,0,1,0,0,1,0,1,0,0,1],
    [1,0,0,1,0,0,1,0,0,1,1,1,0,0,1,0,1,0,0,1,0],
    [0,1,1,0,1,0,0,1,0,0,0,1,1,0,0,1,1,0,1,0,1],
    [0,0,0,0,0,0,0,0,1,0,1,0,1,1,0,0,0,0,0,0,0],
    [1,1,1,1,1,1,1,0,0,1,0,1,0,0,1,0,1,0,1,0,1],
    [1,0,0,0,0,0,1,0,1,0,1,0,1,0,0,1,0,1,0,1,0],
    [1,0,1,1,1,0,1,0,0,1,0,1,0,1,1,0,1,0,1,0,1],
    [1,0,1,1,1,0,1,0,1,0,1,0,1,0,0,1,0,1,0,1,0],
    [1,0,0,0,0,0,1,0,0,1,0,1,0,1,1,0,1,0,1,0,1],
    [1,1,1,1,1,1,1,0,1,0,1,0,1,0,0,1,0,1,0,1,0],
  ]

  return (
    <div style={{ display: 'inline-grid', gridTemplateColumns: `repeat(${PATTERN[0].length}, 5px)`, gap: '2px' }}>
      {PATTERN.map((row, ri) =>
        row.map((cell, ci) => (
          <div
            key={`${ri}-${ci}`}
            style={{
              width: 5,
              height: 5,
              borderRadius: 1,
              background: cell ? '#fff' : 'transparent',
              opacity: cell ? 0.9 : 0,
            }}
          />
        ))
      )}
    </div>
  )
}

/* ─── Tab definitions ───────────────────────────────────────── */
const TABS = ['Dashboard', 'Trust Passport', 'Mobile App'] as const
type Tab = typeof TABS[number]

/* ─── Main component ────────────────────────────────────────── */
export default function Demo() {
  const [activeTab, setActiveTab] = useState<Tab>('Dashboard')

  return (
    <section className="py-24 px-6 mesh-bg">
      <div className="max-w-6xl mx-auto">
        {/* Section heading */}
        <div className="text-center mb-12">
          <span className="text-indigo-400 text-sm font-semibold uppercase tracking-widest">
            Product Preview
          </span>
          <h2 className="text-4xl md:text-5xl font-black text-white mt-3 mb-4">
            See TrustGrid in action
          </h2>
          <p className="text-white/50 max-w-xl mx-auto leading-relaxed">
            A purpose-built platform for community workforce governance — every screen designed around operational speed and trust.
          </p>
        </div>

        {/* Tab pills */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex rounded-full p-1" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="px-5 py-2 rounded-full text-sm font-semibold transition-all"
                style={{
                  background: activeTab === tab ? '#fff' : 'transparent',
                  color: activeTab === tab ? '#0A0A0F' : 'rgba(255,255,255,0.55)',
                }}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Content area */}
        <div className="flex justify-center">

          {/* ── DASHBOARD TAB ─────────────────────────────────── */}
          {activeTab === 'Dashboard' && (
            <div className="w-full max-w-4xl">
              {/* Browser chrome */}
              <div className="rounded-2xl overflow-hidden border border-white/10" style={{ background: '#111827', boxShadow: '0 32px 80px rgba(0,0,0,0.6)' }}>
                {/* Top bar */}
                <div className="flex items-center gap-2 px-4 py-3 border-b border-white/8" style={{ background: '#1a2133' }}>
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full" style={{ background: '#FF5F57' }} />
                    <div className="w-3 h-3 rounded-full" style={{ background: '#FEBC2E' }} />
                    <div className="w-3 h-3 rounded-full" style={{ background: '#28C840' }} />
                  </div>
                  <div className="flex-1 mx-4">
                    <div className="mx-auto max-w-xs rounded-md px-3 py-1 text-xs text-white/30 text-center" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                      app.trustgrid.ng/dashboard
                    </div>
                  </div>
                </div>

                {/* App body */}
                <div className="flex" style={{ minHeight: 420 }}>
                  {/* Sidebar */}
                  <div className="w-48 shrink-0 border-r border-white/6 flex flex-col py-4 gap-1 px-2" style={{ background: '#0e1525' }}>
                    <div className="flex items-center gap-2 px-3 py-2 mb-3">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black" style={{ background: 'linear-gradient(135deg,#4F46E5,#0D9488)' }}>T</div>
                      <span className="text-white text-xs font-bold">TrustGrid</span>
                    </div>
                    {[
                      { icon: '▦', label: 'Dashboard', active: true },
                      { icon: '👷', label: 'Workers', active: false },
                      { icon: '📋', label: 'Requests', active: false },
                      { icon: '⭐', label: 'Trust Scores', active: false },
                      { icon: '📊', label: 'Analytics', active: false },
                      { icon: '⚙️', label: 'Settings', active: false },
                    ].map(({ icon, label, active }) => (
                      <div
                        key={label}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs cursor-default transition-colors"
                        style={{
                          background: active ? 'rgba(79,70,229,0.2)' : 'transparent',
                          color: active ? '#a5b4fc' : 'rgba(255,255,255,0.35)',
                          fontWeight: active ? 600 : 400,
                        }}
                      >
                        <span className="text-sm">{icon}</span>
                        {label}
                      </div>
                    ))}
                  </div>

                  {/* Main area */}
                  <div className="flex-1 p-4 overflow-hidden">
                    {/* Stats row */}
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      {[
                        { label: 'Total Workers', value: '47', icon: '👷', color: '#6366F1' },
                        { label: 'Verified', value: '32', icon: '✓', color: '#10B981' },
                        { label: 'Avg Trust Score', value: '72', icon: '⭐', color: '#F59E0B' },
                      ].map(({ label, value, icon, color }) => (
                        <div key={label} className="rounded-xl p-3 border border-white/6" style={{ background: 'rgba(255,255,255,0.03)' }}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-white/40 text-[10px]">{label}</span>
                            <span className="text-base">{icon}</span>
                          </div>
                          <span className="text-xl font-black" style={{ color }}>{value}</span>
                        </div>
                      ))}
                    </div>

                    {/* Search bar */}
                    <div className="flex items-center gap-2 rounded-lg px-3 py-2 mb-4 border border-white/8 text-xs text-white/30" style={{ background: 'rgba(255,255,255,0.04)' }}>
                      <span>🔍</span>
                      <span>Search workers by name, skill, or trust score…</span>
                      <div className="ml-auto flex gap-1">
                        <span className="px-2 py-0.5 rounded text-[10px] border border-white/10" style={{ background: 'rgba(255,255,255,0.05)' }}>All Skills</span>
                        <span className="px-2 py-0.5 rounded text-[10px] border border-white/10" style={{ background: 'rgba(255,255,255,0.05)' }}>Score 60+</span>
                      </div>
                    </div>

                    {/* Worker cards grid */}
                    <div className="grid grid-cols-3 gap-3">
                      {WORKERS.map((w) => (
                        <div key={w.name} className="rounded-xl overflow-hidden border border-white/8 hover:border-indigo-500/40 transition-all duration-300 group" style={{ background: 'rgba(255,255,255,0.04)' }}>
                          <div className="relative h-28 overflow-hidden">
                            <img
                              src={w.img}
                              alt={w.name}
                              className="w-full h-full object-cover object-center opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                            />
                            <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent 30%, rgba(10,16,30,0.97))' }} />
                            {/* Trust grade badge */}
                            <div
                              className="absolute top-2 right-2 text-[11px] font-black px-2 py-0.5 rounded-lg shadow-lg"
                              style={{ background: w.gradeColor, color: '#fff' }}
                            >
                              {w.grade}
                            </div>
                            {/* Verified badge */}
                            {w.verified && (
                              <div className="absolute top-2 left-2 flex items-center gap-1 bg-emerald-500/90 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md">
                                ✓ NIN
                              </div>
                            )}
                          </div>
                          <div className="px-2.5 py-2.5">
                            <div className="text-white text-[11px] font-bold truncate">{w.name}</div>
                            <div className="text-white/50 text-[10px] truncate">{w.role}</div>
                            <div className="flex items-center justify-between mt-1.5">
                              <span className="text-[10px] text-white/30">{w.jobs} jobs</span>
                              <span className="text-[11px] font-black" style={{ color: w.gradeColor }}>{w.score}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── TRUST PASSPORT TAB ────────────────────────────── */}
          {activeTab === 'Trust Passport' && (
            <div className="flex flex-col md:flex-row items-start gap-10 w-full max-w-3xl">
              {/* Phone frame */}
              <div className="mx-auto shrink-0">
                <div
                  className="relative rounded-[2.5rem] overflow-hidden"
                  style={{
                    width: 280,
                    background: '#0d1117',
                    border: '8px solid #1e2433',
                    boxShadow: '0 40px 80px rgba(0,0,0,0.7), inset 0 0 0 1px rgba(255,255,255,0.06)',
                  }}
                >
                  {/* Notch */}
                  <div className="mx-auto mt-3 mb-1 w-20 h-5 rounded-full" style={{ background: '#1e2433' }} />

                  {/* App content */}
                  <div className="px-4 pb-6">
                    <div className="text-white/40 text-[10px] text-center mb-3 font-semibold uppercase tracking-widest">Trust Passport</div>

                    {/* Passport card */}
                    <div
                      className="rounded-2xl p-4 relative overflow-hidden mb-4"
                      style={{ background: 'linear-gradient(135deg,#1e1b4b,#0f172a,#0d2537)' }}
                    >
                      {/* Decorative circle */}
                      <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full opacity-10" style={{ background: 'radial-gradient(circle,#4F46E5,transparent)' }} />
                      {/* Logo row */}
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-black" style={{ background: 'linear-gradient(135deg,#4F46E5,#0D9488)' }}>T</div>
                        <span className="text-white/60 text-[9px] font-bold uppercase tracking-widest">TrustGrid — Worker Passport</span>
                      </div>
                      {/* Avatar */}
                      <div className="flex items-center gap-3 mb-3">
                        <img
                          src="https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=300&fit=crop"
                          alt="Worker"
                          className="w-12 h-12 rounded-xl object-cover object-top border-2 border-indigo-500/40"
                        />
                        <div>
                          <div className="text-white text-xs font-bold">Adaeze Mbadiwe</div>
                          <div className="text-white/40 text-[10px]">Electrician · Lagos</div>
                          <div className="text-emerald-400 text-[10px] font-semibold mt-0.5">✓ NIN Verified</div>
                        </div>
                        <div className="ml-auto text-right">
                          <div className="text-2xl font-black" style={{ color: '#10B981' }}>96</div>
                          <div className="text-white/30 text-[9px]">Trust Score</div>
                        </div>
                      </div>
                      {/* QR code */}
                      <div className="flex justify-center bg-white rounded-xl p-3 mb-2">
                        <QRDots />
                      </div>
                      <div className="text-center text-[9px] text-white/25">Scan to verify · TG-2024-ADZ-1847</div>
                    </div>

                    {/* Credential badges */}
                    <div className="space-y-2">
                      {[
                        { label: 'NIN Verified', icon: '🪪', color: '#10B981' },
                        { label: 'Parish Member', icon: '⛪', color: '#6366F1' },
                        { label: 'Convention Volunteer × 3', icon: '🏅', color: '#F59E0B' },
                        { label: 'No Incidents on Record', icon: '🛡️', color: '#14B8A6' },
                      ].map(({ label, icon, color }) => (
                        <div
                          key={label}
                          className="flex items-center gap-2 rounded-xl px-3 py-2 text-[11px] font-semibold border border-white/6"
                          style={{ background: 'rgba(255,255,255,0.03)', color }}
                        >
                          <span>{icon}</span>
                          <span>{label}</span>
                          <span className="ml-auto text-white/20">✓</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Explanatory text */}
              <div className="flex-1 pt-4">
                <h3 className="text-2xl font-black text-white mb-3">The worker&apos;s digital identity</h3>
                <p className="text-white/50 text-sm leading-relaxed mb-6">
                  Every verified worker gets a Trust Passport — a scannable digital credential containing their full employment history, trust score, endorsements, and incident record.
                </p>
                <div className="space-y-4">
                  {[
                    ['QR Code Verification', 'Gatekeepers scan on entry — instantly confirmed in &lt;1 second'],
                    ['Tamper-Proof Record', 'Blockchain-anchored. No one can fake or edit deployment history'],
                    ['Portable Across Jobs', 'Works across every institution on TrustGrid, not just one employer'],
                  ].map(([title, desc]) => (
                    <div key={String(title)} className="flex gap-3">
                      <div className="w-1.5 h-1.5 rounded-full mt-2 shrink-0" style={{ background: '#4F46E5' }} />
                      <div>
                        <div className="text-white text-sm font-semibold">{title}</div>
                        <div className="text-white/40 text-xs mt-0.5" dangerouslySetInnerHTML={{ __html: String(desc) }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── MOBILE APP TAB ────────────────────────────────── */}
          {activeTab === 'Mobile App' && (
            <div className="flex flex-col md:flex-row items-start gap-10 w-full max-w-3xl">
              {/* Phone frame */}
              <div className="mx-auto shrink-0">
                <div
                  className="relative rounded-[2.5rem] overflow-hidden"
                  style={{
                    width: 280,
                    background: '#0d1117',
                    border: '8px solid #1e2433',
                    boxShadow: '0 40px 80px rgba(0,0,0,0.7), inset 0 0 0 1px rgba(255,255,255,0.06)',
                  }}
                >
                  {/* Notch */}
                  <div className="mx-auto mt-3 mb-1 w-20 h-5 rounded-full" style={{ background: '#1e2433' }} />

                  {/* App content: onboarding community code screen */}
                  <div className="px-5 pb-8 pt-2">
                    {/* Logo */}
                    <div className="flex justify-center mb-6">
                      <div className="w-10 h-10 rounded-2xl flex items-center justify-center font-black text-lg" style={{ background: 'linear-gradient(135deg,#4F46E5,#0D9488)' }}>T</div>
                    </div>

                    {/* Heading */}
                    <div className="text-center mb-6">
                      <div className="text-white text-sm font-black leading-snug mb-1">Welcome to<br />Redemption City</div>
                      <div className="text-white/35 text-[10px]">Enter your community access code to continue</div>
                    </div>

                    {/* Input group */}
                    <div className="mb-4">
                      <div className="text-white/40 text-[10px] font-semibold mb-1.5">Community Code</div>
                      <div
                        className="flex items-center gap-2 rounded-xl px-3 py-2.5 border text-xs font-mono"
                        style={{ background: 'rgba(255,255,255,0.05)', borderColor: '#4F46E5', color: '#a5b4fc' }}
                      >
                        <span>🔑</span>
                        <span>rccg</span>
                        <span className="animate-pulse ml-0.5" style={{ borderRight: '2px solid #a5b4fc', paddingRight: 1, height: 12 }} />
                      </div>
                    </div>

                    {/* Community match card */}
                    <div
                      className="rounded-xl p-3 mb-5 flex items-center gap-3 border border-emerald-500/20"
                      style={{ background: 'rgba(16,185,129,0.07)' }}
                    >
                      <span className="text-xl">⛪</span>
                      <div>
                        <div className="text-white text-[11px] font-bold">RCCG — Redemption City</div>
                        <div className="text-emerald-400 text-[10px]">✓ Verified community · 1,200 members</div>
                      </div>
                    </div>

                    {/* Continue button */}
                    <button
                      className="w-full rounded-xl py-3 text-xs font-black tracking-wide text-white flex items-center justify-center gap-2"
                      style={{ background: 'linear-gradient(135deg,#E11D48,#F59E0B)' }}
                    >
                      Continue →
                    </button>

                    {/* Or divider */}
                    <div className="flex items-center gap-2 my-4">
                      <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
                      <span className="text-white/20 text-[10px]">or scan QR at the gate</span>
                      <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
                    </div>

                    {/* Scan QR button */}
                    <button
                      className="w-full rounded-xl py-2.5 text-[11px] font-semibold text-white/50 flex items-center justify-center gap-2 border border-white/8"
                      style={{ background: 'rgba(255,255,255,0.03)' }}
                    >
                      <span>📷</span> Scan QR Code
                    </button>
                  </div>
                </div>
              </div>

              {/* Explanatory text */}
              <div className="flex-1 pt-4">
                <h3 className="text-2xl font-black text-white mb-3">Mobile-first for field workers</h3>
                <p className="text-white/50 text-sm leading-relaxed mb-6">
                  Workers join their community with a 6-character code, scan in at gates via QR, and receive job notifications on WhatsApp — no app download required for basic features.
                </p>
                <div className="space-y-4">
                  {[
                    ['Works on any phone', 'Optimised for low-end Android devices. No high-spec phone required.'],
                    ['WhatsApp integration', 'Job alerts, confirmations and check-ins all happen in WhatsApp.'],
                    ['Offline QR scan', 'Gatekeepers can verify passes offline — syncs when connectivity returns.'],
                  ].map(([title, desc]) => (
                    <div key={String(title)} className="flex gap-3">
                      <div className="w-1.5 h-1.5 rounded-full mt-2 shrink-0" style={{ background: '#E11D48' }} />
                      <div>
                        <div className="text-white text-sm font-semibold">{title}</div>
                        <div className="text-white/40 text-xs mt-0.5">{desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Legacy scenario callout */}
        <div className="mt-16 rounded-3xl overflow-hidden border border-indigo-500/20" style={{ background: 'linear-gradient(135deg,rgba(79,70,229,0.08),rgba(13,148,136,0.08))' }}>
          <div className="p-8 md:p-10 grid md:grid-cols-2 gap-10 items-center">
            <div>
              <div className="text-xs text-indigo-400 font-bold uppercase tracking-widest mb-3">Live Scenario</div>
              <h3 className="text-2xl font-black text-white mb-3 leading-tight">
                RCCG Convention needs 50 electricians. Now.
              </h3>
              <p className="text-white/55 text-sm leading-relaxed mb-5">
                The operations team creates a service request, sets minimum trust score to 65, and sees 33 verified electricians ranked by trust score — with full deployment history, endorsements, and incident records on every profile.
              </p>
              <a
                href="https://app.trustgrid.ng/login"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-white text-sm hover:opacity-90 transition-opacity"
                style={{ background: 'linear-gradient(135deg,#4F46E5,#0D9488)' }}
              >
                See It Live →
              </a>
            </div>
            <div className="space-y-2">
              <div className="text-xs text-white/30 font-medium mb-3">What happens in 2 minutes</div>
              {[
                ['Workers assigned', 'Under 2 minutes'],
                ['Each worker notified', 'Via WhatsApp + SMS'],
                ['Post-event reviews', 'Auto-update trust scores'],
                ['Permanent record', 'Ready for next convention'],
              ].map(([action, result]) => (
                <div key={String(action)} className="flex items-center justify-between py-2.5 border-b border-white/5 last:border-0">
                  <span className="text-white/55 text-sm">{action}</span>
                  <span className="text-emerald-400 text-sm font-semibold">{result}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </section>
  )
}
