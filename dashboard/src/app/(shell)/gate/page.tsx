'use client'
import { useState, useRef } from 'react'
import { Shield, ShieldCheck, ShieldX, ShieldAlert, RotateCcw, Search } from 'lucide-react'
import { api } from '@/lib/api'

type Mode = 'idle' | 'loading' | 'allow' | 'caution' | 'deny'

interface CheckResult {
  valid: boolean
  displayName?: string
  primarySkill?: string
  profilePhotoUrl?: string
  trustScore?: { score: number; grade: string; label: string; color: string }
  idVerified?: boolean
  biometricVerified?: boolean
  primaryCommunity?: string
  message?: string
}

const VERDICT = {
  allow:   { bg: '#064e3b', border: '#10b981', icon: ShieldCheck,  text: '#34d399', label: 'ALLOW ENTRY' },
  caution: { bg: '#78350f', border: '#f59e0b', icon: ShieldAlert,  text: '#fcd34d', label: 'VERIFY MANUALLY' },
  deny:    { bg: '#7f1d1d', border: '#ef4444', icon: ShieldX,      text: '#f87171', label: 'DENY ENTRY' },
}

export default function GatePage() {
  const [code, setCode] = useState('')
  const [mode, setMode] = useState<Mode>('idle')
  const [result, setResult] = useState<CheckResult | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  async function check() {
    const q = code.trim().toUpperCase()
    if (!q) return
    setMode('loading')

    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1'
      let data: CheckResult

      if (/^0[7-9][0-1]\d{8}$/.test(code.trim())) {
        // Phone number — use authenticated worker search
        const { data: workerData } = await api.get(`/workers?search=${code.trim()}&limit=1`)
        const w = workerData?.data?.[0]
        if (!w) {
          data = { valid: false, message: 'No worker found with this phone number.' }
        } else {
          data = {
            valid: true,
            displayName: `${w.firstName} ${w.lastName}`,
            primarySkill: w.primarySkill,
            profilePhotoUrl: w.profilePhotoUrl,
            trustScore: { score: w.trustScore, grade: w.trustGrade, label: '', color: w.trustGradeColor ?? '#64748b' },
            idVerified: ['FULLY_VERIFIED', 'PARTIALLY_VERIFIED'].includes(w.verificationStatus),
          }
        }
      } else {
        // Passport code — public endpoint
        const res = await fetch(`${apiBase}/passport/verify/${q}`)
        data = await res.json()
      }

      setResult(data)
      if (!data.valid) { setMode('deny'); return }

      const score = data.trustScore?.score ?? 0
      const verified = data.idVerified || data.biometricVerified
      if (score >= 60 && verified) setMode('allow')
      else if (score >= 40) setMode('caution')
      else setMode('deny')
    } catch {
      setResult({ valid: false, message: 'Could not connect to TrustGrid. Check your internet connection.' })
      setMode('deny')
    }
  }

  function reset() {
    setCode('')
    setMode('idle')
    setResult(null)
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  function pad(key: string) {
    if (key === '⌫') { setCode(c => c.slice(0, -1)); return }
    setCode(c => (c + key).slice(0, 20))
  }

  const cfg = mode !== 'idle' && mode !== 'loading' ? VERDICT[mode] : null

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#0a0a0f' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <Shield className="w-5 h-5 text-indigo-400" />
          <span className="text-white font-black text-lg tracking-tight">Gate Check-In</span>
        </div>
        {mode !== 'idle' && mode !== 'loading' && (
          <button onClick={reset} className="flex items-center gap-1.5 text-white/40 hover:text-white text-sm transition-colors">
            <RotateCcw className="w-4 h-4" /> New Check
          </button>
        )}
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 max-w-lg mx-auto w-full gap-5">

        {/* Input section */}
        {(mode === 'idle' || mode === 'loading') && (
          <>
            <p className="text-white/40 text-sm text-center">Enter passport code (TGP-...) or phone number</p>

            <div className="w-full relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
              <input
                ref={inputRef}
                autoFocus
                value={code}
                onChange={e => setCode(e.target.value.toUpperCase())}
                onKeyDown={e => e.key === 'Enter' && check()}
                placeholder="TGP-XXXXXXXX"
                className="w-full pl-12 pr-4 py-5 rounded-2xl text-xl font-mono tracking-widest text-white placeholder:text-white/15 focus:outline-none focus:border-indigo-500 border border-white/10 transition-colors"
                style={{ background: 'rgba(255,255,255,0.04)' }}
              />
            </div>

            {/* Number pad */}
            <div className="grid grid-cols-3 gap-3 w-full">
              {['1','2','3','4','5','6','7','8','9','TGP-','0','⌫'].map(k => (
                <button key={k} onClick={() => pad(k)}
                  className={`py-5 rounded-2xl text-white font-bold text-lg transition-colors active:scale-95 ${
                    k === '⌫'   ? 'bg-red-900/40 hover:bg-red-900/70 text-red-300' :
                    k === 'TGP-' ? 'bg-indigo-900/50 hover:bg-indigo-900/80 text-indigo-300 text-sm' :
                    'hover:bg-white/15'
                  }`}
                  style={k !== '⌫' && k !== 'TGP-' ? { background: 'rgba(255,255,255,0.06)' } : undefined}>
                  {k}
                </button>
              ))}
            </div>

            <button onClick={check} disabled={!code.trim() || mode === 'loading'}
              className="w-full py-5 rounded-2xl text-white font-black text-xl disabled:opacity-30 flex items-center justify-center gap-2 transition-opacity"
              style={{ background: 'linear-gradient(135deg,#4F46E5,#0D9488)' }}>
              {mode === 'loading' ? (
                <><svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> Checking…</>
              ) : 'CHECK'}
            </button>
          </>
        )}

        {/* Verdict */}
        {cfg && (
          <>
            {/* Big verdict card */}
            <div className="w-full rounded-3xl p-8 text-center border-2"
              style={{ background: cfg.bg, borderColor: cfg.border }}>
              <cfg.icon style={{ color: cfg.text }} className="w-16 h-16 mx-auto mb-3" />
              <p className="text-3xl font-black" style={{ color: cfg.text }}>{cfg.label}</p>
            </div>

            {/* Worker identity card */}
            {result?.valid && (
              <div className="w-full rounded-2xl p-5 border border-white/8 flex items-start gap-4"
                style={{ background: 'rgba(255,255,255,0.04)' }}>
                {result.profilePhotoUrl ? (
                  <img src={result.profilePhotoUrl} className="w-16 h-16 rounded-2xl object-cover shrink-0" alt="" />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center text-2xl font-black text-white/50 shrink-0">
                    {result.displayName?.[0] ?? '?'}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-white font-black text-lg truncate">{result.displayName}</p>
                  {result.primarySkill && <p className="text-white/50 text-sm truncate">{result.primarySkill}</p>}
                  <div className="flex flex-wrap gap-2 mt-2">
                    {result.idVerified && (
                      <span className="text-[11px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 px-2.5 py-0.5 rounded-full font-bold">✓ ID Verified</span>
                    )}
                    {result.trustScore && (
                      <span className="text-[11px] bg-white/8 text-white/60 px-2.5 py-0.5 rounded-full font-bold">
                        {result.trustScore.grade} · {Math.round(result.trustScore.score)}
                      </span>
                    )}
                    {result.primaryCommunity && (
                      <span className="text-[11px] bg-white/8 text-white/40 px-2.5 py-0.5 rounded-full">{result.primaryCommunity}</span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {!result?.valid && (
              <div className="w-full rounded-2xl p-5 border border-white/8 text-center" style={{ background: 'rgba(255,255,255,0.04)' }}>
                <p className="text-white/40 text-sm">{result?.message ?? 'Passport not found or has been revoked.'}</p>
              </div>
            )}

            <button onClick={reset}
              className="w-full py-4 rounded-2xl font-bold text-white/70 hover:text-white flex items-center justify-center gap-2 transition-colors border border-white/10 hover:border-white/20">
              <RotateCcw className="w-4 h-4" /> Check Another Person
            </button>
          </>
        )}
      </div>
    </div>
  )
}
