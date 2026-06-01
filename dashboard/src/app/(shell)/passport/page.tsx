'use client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Shield, ShieldCheck, QrCode, Star, Award, Users, Clock, CheckCircle, XCircle, AlertCircle, ExternalLink, Copy, Download } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'

function TrustGrade({ grade, score, label, color }: { grade: string; score: number; label: string; color: string }) {
  const ring = color === 'emerald' ? 'ring-emerald-400 text-emerald-600' :
               color === 'green'   ? 'ring-green-400 text-green-600' :
               color === 'lime'    ? 'ring-lime-400 text-lime-600' :
               color === 'yellow'  ? 'ring-yellow-400 text-yellow-600' :
               color === 'orange'  ? 'ring-orange-400 text-orange-600' : 'ring-gray-300 text-gray-500'

  return (
    <div className={cn('w-24 h-24 rounded-full ring-4 flex flex-col items-center justify-center', ring)}>
      <span className="text-3xl font-black">{grade}</span>
      <span className="text-[10px] font-bold opacity-70">{score}</span>
    </div>
  )
}

function VerifiedBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-xs font-semibold px-2.5 py-1 rounded-full border border-emerald-200">
      <ShieldCheck className="w-3 h-3" /> {label}
    </span>
  )
}

function UnverifiedBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1 bg-gray-50 text-gray-500 text-xs font-medium px-2.5 py-1 rounded-full border border-gray-200">
      <AlertCircle className="w-3 h-3" /> {label}
    </span>
  )
}

export default function PassportPage() {
  const qc = useQueryClient()
  const [copied, setCopied] = useState(false)

  const { data: passport, isLoading } = useQuery({
    queryKey: ['my-passport'],
    queryFn: () => api.get('/passport/me').then(r => r.data),
  })

  function copyPassportUrl() {
    const url = passport?.passport?.verifyUrl ?? ''
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!passport) {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center py-24">
        <Shield className="w-16 h-16 text-gray-200 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-400">No passport yet</h2>
        <p className="text-gray-400 text-sm mt-2">Complete onboarding to generate your Trust Passport.</p>
      </div>
    )
  }

  const { identity, community, authority, credentials, trustScore, reputation } = passport
  const passportCode = passport?.passport?.passportCode
  const verifyUrl    = passport?.passport?.verifyUrl

  return (
    <div className="max-w-4xl mx-auto p-6 pb-16">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            <Shield className="w-6 h-6 text-indigo-600" /> Trust Passport
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Your verifiable identity on the TrustGrid network.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {passportCode && (
            <button onClick={copyPassportUrl}
              className="flex items-center gap-1.5 border border-gray-200 rounded-xl px-4 py-2 text-sm font-semibold text-gray-600 hover:border-indigo-300 transition-colors">
              {copied ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy Link'}
            </button>
          )}
          {verifyUrl && (
            <a href={verifyUrl} target="_blank" rel="noreferrer"
              className="flex items-center gap-1.5 text-white px-4 py-2 rounded-xl text-sm font-bold"
              style={{background:'linear-gradient(135deg,#4F46E5,#0D9488)'}}>
              <ExternalLink className="w-4 h-4" /> View Public Page
            </a>
          )}
        </div>
      </div>

      {/* Main passport card */}
      <div className="bg-gradient-to-br from-indigo-950 via-indigo-900 to-cyan-900 rounded-3xl p-8 text-white mb-6 relative overflow-hidden">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-4 right-4 w-64 h-64 rounded-full border-2 border-white" />
          <div className="absolute -bottom-8 -left-8 w-48 h-48 rounded-full border border-white" />
        </div>

        <div className="relative flex items-start justify-between gap-6">
          <div className="flex items-start gap-5">
            {identity?.profilePhotoUrl ? (
              <img src={identity.profilePhotoUrl} alt="" className="w-20 h-20 rounded-2xl object-cover border-2 border-white/20 shrink-0" />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
                <span className="text-3xl font-black text-white/60">
                  {identity?.displayName?.[0] ?? '?'}
                </span>
              </div>
            )}
            <div>
              <div className="flex items-center gap-2 mb-1">
                {identity?.biometricVerified && <VerifiedBadge label="Biometric" />}
                {identity?.idVerified && !identity?.biometricVerified && <VerifiedBadge label="ID Verified" />}
                {!identity?.idVerified && <UnverifiedBadge label="Unverified" />}
              </div>
              <h2 className="text-2xl font-black text-white">{identity?.displayName}</h2>
              {identity?.primarySkill && (
                <p className="text-indigo-200 text-sm mt-0.5">{identity.primarySkill}</p>
              )}
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                {community?.primaryCommunity && (
                  <span className="text-xs bg-white/10 px-2.5 py-1 rounded-full text-indigo-100 border border-white/10">
                    {community.primaryCommunityType && `${community.primaryCommunityType} · `}{community.primaryCommunity}
                  </span>
                )}
                {authority?.hasAuthority && authority?.primaryRole && (
                  <span className="text-xs bg-cyan-400/20 border border-cyan-400/30 px-2.5 py-1 rounded-full text-cyan-100">
                    {authority.primaryRole.roleName}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-3 shrink-0">
            <TrustGrade
              grade={trustScore?.grade ?? 'F'}
              score={Math.round(trustScore?.score ?? 0)}
              label={trustScore?.label ?? ''}
              color={trustScore?.color ?? 'gray'}
            />
            <div className="text-center">
              <p className="text-xs text-indigo-200 font-semibold">Trust Grade</p>
            </div>
          </div>
        </div>

        {/* Passport code */}
        <div className="relative mt-6 pt-5 border-t border-white/10 flex items-center justify-between">
          <div>
            <p className="text-[10px] text-indigo-300 uppercase tracking-widest font-bold mb-1">Passport Code</p>
            <p className="text-xl font-mono font-black text-white tracking-widest">{passportCode}</p>
          </div>
          <div className="bg-white rounded-xl p-2 shadow-lg">
            <QRCodeSVG
              value={verifyUrl ?? `https://verify.trustgrid.ng/${passportCode}`}
              size={80}
              level="M"
              includeMargin={false}
            />
          </div>
        </div>
      </div>

      {/* Download QR / View verify page */}
      {verifyUrl && (
        <div className="flex justify-end mb-4">
          <button onClick={() => {
            // Open the verify URL in new tab for now — PDF download is future work
            window.open(verifyUrl, '_blank')
          }} className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
            <ExternalLink className="w-3 h-3" /> View public verify page
          </button>
        </div>
      )}

      {/* Stats row */}
      {reputation && (
        <div className="grid grid-cols-4 gap-3 mb-6">
          {[
            { icon: CheckCircle, label: 'Jobs Done',    value: reputation.totalDeployments,  color: 'text-emerald-600' },
            { icon: Star,        label: 'Avg Rating',   value: reputation.averageRating?.toFixed(1) ?? '—', color: 'text-amber-500' },
            { icon: Award,       label: 'Endorsements', value: reputation.totalEndorsements, color: 'text-indigo-600' },
            { icon: Users,       label: 'Communities',  value: community?.memberships?.length ?? 0, color: 'text-cyan-600' },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="bg-white rounded-2xl border border-gray-100 p-4 text-center">
              <Icon className={cn('w-5 h-5 mx-auto mb-1', color)} />
              <p className="text-xl font-black text-gray-900">{value}</p>
              <p className="text-xs text-gray-500">{label}</p>
            </div>
          ))}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-5">
        {/* Credentials */}
        <div>
          <h2 className="font-bold text-gray-900 text-base mb-3 flex items-center gap-2">
            <Award className="w-4 h-4 text-indigo-600" /> Trust Credentials
          </h2>
          {credentials?.length > 0 ? (
            <div className="space-y-2">
              {credentials.map((cred: any) => (
                <div key={cred.id} className="bg-white rounded-xl border border-gray-100 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{cred.label}</p>
                      {cred.description && <p className="text-xs text-gray-500 mt-0.5">{cred.description}</p>}
                      {cred.issuingNode && (
                        <p className="text-xs text-indigo-500 mt-0.5">Issued by {cred.issuingNode.name}</p>
                      )}
                    </div>
                    <span className={cn('text-[10px] px-2 py-0.5 rounded-full font-semibold shrink-0',
                      cred.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600')}>
                      {cred.status}
                    </span>
                  </div>
                  {cred.expiresAt && (
                    <p className="text-[10px] text-gray-400 mt-1.5 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Expires {new Date(cred.expiresAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-dashed border-gray-200 p-6 text-center">
              <Award className="w-8 h-8 text-gray-200 mx-auto mb-2" />
              <p className="text-sm text-gray-400">No credentials yet</p>
              <p className="text-xs text-gray-400 mt-1">Get verified by your community leaders to earn credentials.</p>
            </div>
          )}
        </div>

        {/* Community memberships + authority */}
        <div className="space-y-5">
          <div>
            <h2 className="font-bold text-gray-900 text-base mb-3 flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-600" /> Community Memberships
            </h2>
            {community?.memberships?.length > 0 ? (
              <div className="space-y-2">
                {community.memberships.map((m: any) => (
                  <div key={m.nodeId} className="bg-white rounded-xl border border-gray-100 p-3 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{m.nodeName}</p>
                      <p className="text-xs text-gray-500">{m.nodeType} · {m.type}</p>
                    </div>
                    <div className="text-right">
                      <span className={cn('text-[10px] px-2 py-0.5 rounded-full font-bold',
                        m.verificationLevel === 'VERIFIED' ? 'bg-emerald-50 text-emerald-700' :
                        m.verificationLevel === 'PENDING'  ? 'bg-amber-50 text-amber-600' : 'bg-gray-50 text-gray-500')}>
                        {m.verificationLevel}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-dashed border-gray-200 p-6 text-center">
                <Users className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                <p className="text-sm text-gray-400">Not a member of any community</p>
              </div>
            )}
          </div>

          {authority?.allRoles?.length > 0 && (
            <div>
              <h2 className="font-bold text-gray-900 text-base mb-3 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-cyan-600" /> Authority Roles
              </h2>
              <div className="space-y-2">
                {authority.allRoles.map((role: any, i: number) => (
                  <div key={i} className="bg-white rounded-xl border border-gray-100 p-3 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{role.roleName}</p>
                      <p className="text-xs text-gray-500">{role.nodeType} · {role.nodeName}</p>
                    </div>
                    <span className="text-xs bg-cyan-50 text-cyan-700 px-2 py-0.5 rounded-full font-semibold">
                      Level {role.level}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
