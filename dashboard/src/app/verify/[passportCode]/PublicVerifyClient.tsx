'use client'
import { useEffect, useState } from 'react'
import { Shield, ShieldCheck, ShieldX, ShieldAlert, Star, Award, Users, CheckCircle, XCircle, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useBrand } from '@/hooks/useBrand'
import { QRCodeSVG } from 'qrcode.react'

interface VerifyResult {
  valid: boolean
  passportCode?: string
  status?: string
  message?: string
  isPrivate?: boolean
  displayName?: string
  primarySkill?: string
  trustScore?: { score: number; grade: string; label: string; color: string }
  idVerified?: boolean
  biometricVerified?: boolean
  primaryCommunity?: string
  communityType?: string
  activeCommunities?: number
  credentials?: Array<{ type: string; label: string; status: string; validUntil?: string }>
  reputation?: { jobsCompleted: number; averageRating?: number; endorsements: number }
  issuedAt?: string
  expiresAt?: string
  lastVerifiedAt?: string
}

const GRADE_STYLES: Record<string, { bg: string; ring: string; text: string }> = {
  'A+': { bg: 'from-emerald-500 to-green-600',  ring: 'ring-emerald-400', text: 'text-emerald-600' },
  'A':  { bg: 'from-emerald-500 to-teal-600',   ring: 'ring-emerald-400', text: 'text-emerald-600' },
  'B+': { bg: 'from-green-500 to-lime-600',     ring: 'ring-green-400',   text: 'text-green-600'   },
  'B':  { bg: 'from-lime-500 to-yellow-500',    ring: 'ring-lime-400',    text: 'text-lime-600'    },
  'C':  { bg: 'from-yellow-500 to-orange-500',  ring: 'ring-yellow-400',  text: 'text-yellow-600'  },
  'D':  { bg: 'from-orange-500 to-red-500',     ring: 'ring-orange-400',  text: 'text-orange-600'  },
  'F':  { bg: 'from-gray-400 to-gray-500',      ring: 'ring-gray-300',    text: 'text-gray-500'    },
}

export default function PublicVerifyClient({ passportCode }: { passportCode: string }) {
  const [result, setResult] = useState<VerifyResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { effective } = useBrand()

  useEffect(() => {
    const apiBase = process.env.NEXT_PUBLIC_API_URL ?? 'https://trustgrid-backend.onrender.com/api/v1'
    fetch(`${apiBase}/passport/verify/${passportCode}`)
      .then(r => r.json())
      .then(data => { setResult(data); setLoading(false) })
      .catch(() => { setError('Could not reach verification server.'); setLoading(false) })
  }, [passportCode])

  const bgStyle = {
    background: `linear-gradient(135deg, ${effective.primaryColor ?? '#312e81'} 0%, ${effective.accentColor ?? '#134e4a'} 100%)`,
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={bgStyle}>
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-2 border-white/30 border-t-white rounded-full mx-auto mb-4" />
          <p className="text-white/60 text-sm font-medium">Verifying trust passport…</p>
        </div>
      </div>
    )
  }

  if (error || !result?.valid) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={bgStyle}>
        <div className="bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 p-10 text-center max-w-md w-full">
          <ShieldX className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-black text-white mb-2">Passport Not Found</h1>
          <p className="text-white/60 text-sm">
            {error ?? result?.message ?? 'This QR code is invalid or the passport has been revoked.'}
          </p>
          <p className="text-white/30 font-mono text-xs mt-4">{passportCode}</p>
        </div>
      </div>
    )
  }

  if (result.isPrivate) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={bgStyle}>
        <div className="bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 p-10 text-center max-w-md w-full">
          <ShieldAlert className="w-16 h-16 text-amber-400 mx-auto mb-4" />
          <h1 className="text-2xl font-black text-white mb-2">Passport is Private</h1>
          <p className="text-white/60 text-sm">{result.message}</p>
          <div className="mt-4 bg-emerald-500/10 border border-emerald-400/20 rounded-xl px-4 py-2">
            <p className="text-emerald-300 text-xs font-semibold">Status: {result.status ?? 'ACTIVE'}</p>
          </div>
        </div>
      </div>
    )
  }

  const grade   = result.trustScore?.grade ?? 'F'
  const gStyle  = GRADE_STYLES[grade] ?? GRADE_STYLES['F']

  return (
    <div className="min-h-screen p-4 flex flex-col items-center justify-start py-12" style={bgStyle}>
      <div className="w-full max-w-md">

        {/* Header — community branding */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {effective.logoUrl ? (
            <img src={effective.logoUrl} alt={effective.displayName ?? 'Logo'} className="h-8 w-auto object-contain" />
          ) : (
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
          )}
          <span className="text-white font-black text-xl tracking-tight">{effective.displayName ?? 'TrustGrid'}</span>
        </div>

        {/* Main verification card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden mb-4">
          {/* Top status bar */}
          <div className={cn('bg-gradient-to-r px-6 py-4 flex items-center gap-3', gStyle.bg)}>
            <ShieldCheck className="w-6 h-6 text-white shrink-0" />
            <div>
              <p className="font-black text-white text-base">Trust Passport Verified</p>
              <p className="text-white/80 text-xs">{result.passportCode}</p>
            </div>
            <div className="ml-auto text-right">
              <p className="text-3xl font-black text-white">{grade}</p>
              <p className="text-white/70 text-xs">{result.trustScore?.score} pts</p>
            </div>
          </div>

          <div className="p-6">
            {/* Identity */}
            <div className="flex items-center gap-4 mb-5 pb-5 border-b border-gray-100">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-100 to-cyan-100 flex items-center justify-center shrink-0">
                <span className="text-2xl font-black text-indigo-600">{result.displayName?.[0] ?? '?'}</span>
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-black text-gray-900 truncate">{result.displayName}</h2>
                {result.primarySkill && (
                  <p className="text-sm text-gray-500 truncate">{result.primarySkill}</p>
                )}
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {result.biometricVerified && (
                    <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                      <CheckCircle className="w-2.5 h-2.5" /> Biometric Verified
                    </span>
                  )}
                  {result.idVerified && !result.biometricVerified && (
                    <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-200">
                      <CheckCircle className="w-2.5 h-2.5" /> ID Verified
                    </span>
                  )}
                  {!result.idVerified && (
                    <span className="inline-flex items-center gap-1 bg-gray-50 text-gray-500 text-[10px] font-medium px-2 py-0.5 rounded-full border border-gray-200">
                      <XCircle className="w-2.5 h-2.5" /> Unverified
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* QR code — holder can screenshot and share */}
            <div className="flex justify-center pt-4 pb-2">
              <div className="bg-white p-3 rounded-2xl shadow-sm inline-block">
                <QRCodeSVG
                  value={`https://verify.trustgrid.ng/${result.passportCode}`}
                  size={120}
                  level="M"
                  includeMargin={false}
                />
                <p className="text-center text-[10px] text-gray-400 mt-2 font-mono">{result.passportCode}</p>
              </div>
            </div>

            {/* Community */}
            {result.primaryCommunity && (
              <div className="flex items-center gap-2 mb-3">
                <Users className="w-4 h-4 text-indigo-400 shrink-0" />
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">{result.primaryCommunity}</span>
                  {result.communityType && <span className="text-gray-400"> · {result.communityType}</span>}
                </p>
                {result.activeCommunities && result.activeCommunities > 1 && (
                  <span className="text-xs text-indigo-400 ml-auto">+{result.activeCommunities - 1} more</span>
                )}
              </div>
            )}

            {/* Reputation stats */}
            {result.reputation && (
              <div className="grid grid-cols-3 gap-3 mb-5 mt-4">
                {[
                  { label: 'Jobs Done',    value: result.reputation.jobsCompleted,                     color: 'text-emerald-600' },
                  { label: 'Rating',       value: result.reputation.averageRating?.toFixed(1) ?? '—',  color: 'text-amber-500'   },
                  { label: 'Endorsements', value: result.reputation.endorsements,                       color: 'text-indigo-600'  },
                ].map(({ label, value, color }) => (
                  <div key={label} className="bg-gray-50 rounded-xl p-3 text-center">
                    <p className={cn('text-xl font-black', color)}>{value}</p>
                    <p className="text-[10px] text-gray-500 mt-0.5 font-medium">{label}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Credentials */}
            {result.credentials && result.credentials.length > 0 && (
              <div className="mb-4">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Active Credentials</p>
                <div className="space-y-1.5">
                  {result.credentials.slice(0,4).map((cred, i) => (
                    <div key={i} className="flex items-center gap-2.5 bg-emerald-50 rounded-xl px-3 py-2 border border-emerald-100">
                      <Award className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <p className="text-xs font-semibold text-emerald-800 flex-1">{cred.label}</p>
                      {cred.validUntil && (
                        <p className="text-[10px] text-emerald-600">
                          Until {new Date(cred.validUntil).toLocaleDateString('en-NG', { month: 'short', year: 'numeric' })}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Last verified timestamp */}
            <p className="text-[10px] text-gray-400 text-center">
              Verified on TrustGrid · {result.lastVerifiedAt ? new Date(result.lastVerifiedAt).toLocaleDateString('en-NG', { dateStyle: 'long' }) : '—'}
            </p>
          </div>
        </div>

        {/* Footer */}
        {effective.poweredByVisible !== false && (
          <div className="text-center">
            <a href="https://trustgrid.ng" target="_blank" rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-white/50 hover:text-white/80 transition-colors text-xs font-medium">
              <Shield className="w-3.5 h-3.5" />
              Powered by TrustGrid · Community Trust Infrastructure
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
