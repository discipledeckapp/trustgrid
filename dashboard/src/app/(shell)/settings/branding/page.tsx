'use client'
import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Globe, Palette, Smartphone, ExternalLink, Copy, CheckCircle, Shield, RefreshCw, Save, Eye } from 'lucide-react'

interface BrandConfig {
  displayName?: string
  tagline?: string
  primaryColor?: string
  accentColor?: string
  logoUrl?: string
  faviconUrl?: string
  poweredByVisible?: boolean
  appName?: string
}

interface InstitutionData {
  id?: string
  name?: string
  subdomain?: string
  customDomain?: string
  brandConfig?: BrandConfig
  plan?: string
}

export default function BrandingPage() {
  const qc = useQueryClient()

  const { data: institution, isLoading } = useQuery<InstitutionData>({
    queryKey: ['my-institution'],
    queryFn: () => api.get('/institutions/mine').then(r => r.data),
    retry: false,
  })

  const [subdomain, setSubdomain] = useState('')
  const [customDomain, setCustomDomain] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [tagline, setTagline] = useState('')
  const [appName, setAppName] = useState('')
  const [primaryColor, setPrimaryColor] = useState('#4F46E5')
  const [accentColor, setAccentColor] = useState('#0D9488')
  const [logoUrl, setLogoUrl] = useState('')
  const [backgroundImageUrl, setBackgroundImageUrl] = useState('')
  const [copied, setCopied] = useState(false)
  const [saved, setSaved] = useState(false)

  // Sync form from fetched data
  useEffect(() => {
    if (institution) {
      setSubdomain(institution.subdomain ?? '')
      setCustomDomain(institution.customDomain ?? '')
      setDisplayName(institution.brandConfig?.displayName ?? institution.name ?? '')
      setTagline(institution.brandConfig?.tagline ?? '')
      setAppName(institution.brandConfig?.appName ?? '')
      setPrimaryColor(institution.brandConfig?.primaryColor ?? '#4F46E5')
      setAccentColor(institution.brandConfig?.accentColor ?? '#0D9488')
      setLogoUrl(institution.brandConfig?.logoUrl ?? '')
      setBackgroundImageUrl((institution.brandConfig as any)?.backgroundImageUrl ?? '')
    }
  }, [institution])

  const saveMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      api.patch('/institutions/brand', data).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-institution'] })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    },
  })

  function handleSave() {
    saveMutation.mutate({
      subdomain: subdomain || undefined,
      customDomain: customDomain || undefined,
      brandConfig: {
        displayName,
        tagline,
        appName,
        primaryColor,
        accentColor,
        logoUrl: logoUrl || undefined,
        backgroundImageUrl: backgroundImageUrl || undefined,
      },
    })
  }

  function handleCopyCname() {
    navigator.clipboard.writeText('cname.vercel-dns.com').then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const isEnterprise = institution?.plan === 'enterprise' || institution?.plan === 'Enterprise'
  const isGrowth = isEnterprise || institution?.plan === 'growth' || institution?.plan === 'Growth'

  if (isLoading) return (
    <div className="flex justify-center py-16">
      <div className="animate-spin w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full" />
    </div>
  )

  return (
    <div className="max-w-5xl mx-auto p-6 pb-16">
      {/* Page header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Community Branding</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Customise your subdomain, colours, logo and public-facing identity
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saveMutation.isPending}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-60"
          style={{
            background: saved
              ? '#059669'
              : 'linear-gradient(135deg,#4F46E5,#0D9488)',
          }}
        >
          {saveMutation.isPending ? (
            <><RefreshCw className="w-4 h-4 animate-spin" /> Saving…</>
          ) : saved ? (
            <><CheckCircle className="w-4 h-4" /> Saved!</>
          ) : (
            <><Save className="w-4 h-4" /> Save Changes</>
          )}
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left column — settings */}
        <div className="lg:col-span-2 space-y-5">

          {/* Community Subdomain */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-7 h-7 rounded-lg bg-indigo-100 flex items-center justify-center">
                <Globe className="w-4 h-4 text-indigo-600" />
              </div>
              <h2 className="font-bold text-gray-900">Community Subdomain</h2>
            </div>
            <p className="text-sm text-gray-500 mb-5 ml-9">
              Your community is accessible at{' '}
              <span className="font-semibold text-indigo-600">
                {subdomain ? `${subdomain}.trustgrid.ng` : '—.trustgrid.ng'}
              </span>
            </p>
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-700">Subdomain slug</label>
              <div className="flex items-center gap-2">
                <div className="flex-1 flex items-center rounded-xl border border-gray-200 overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500 transition-all">
                  <input
                    type="text"
                    value={subdomain}
                    onChange={e => setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                    placeholder="yourorg"
                    className="flex-1 px-4 py-2.5 text-sm bg-transparent outline-none"
                  />
                  <span className="px-3 py-2.5 bg-gray-50 text-gray-400 text-sm font-medium border-l border-gray-200 shrink-0">
                    .trustgrid.ng
                  </span>
                </div>
              </div>
              {!isGrowth && (
                <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                  Custom subdomains require the Growth plan or above.
                </p>
              )}
            </div>
          </div>

          {/* Custom Domain */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-7 h-7 rounded-lg bg-violet-100 flex items-center justify-center">
                <ExternalLink className="w-4 h-4 text-violet-600" />
              </div>
              <h2 className="font-bold text-gray-900">Custom Domain</h2>
              <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 uppercase tracking-wide">
                Enterprise
              </span>
            </div>
            <p className="text-sm text-gray-500 mb-5 ml-9">
              Point your own domain (e.g. <span className="font-mono text-gray-700">portal.yourorg.com</span>) to TrustGrid.
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Domain</label>
                <input
                  type="text"
                  value={customDomain}
                  onChange={e => setCustomDomain(e.target.value.toLowerCase().trim())}
                  placeholder="portal.yourorg.com"
                  disabled={!isEnterprise}
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed"
                />
              </div>

              {/* CNAME instructions */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                <p className="text-xs font-bold text-gray-600 uppercase tracking-wider">DNS Instructions</p>
                <p className="text-xs text-gray-500">
                  Add the following CNAME record to your DNS provider:
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex-1 bg-white rounded-lg border border-gray-200 px-3 py-2 flex items-center gap-3 text-xs font-mono">
                    <span className="text-gray-400 shrink-0">CNAME</span>
                    <span className="text-gray-300">→</span>
                    <span className="text-gray-800 font-semibold">cname.vercel-dns.com</span>
                  </div>
                  <button
                    onClick={handleCopyCname}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors shrink-0"
                  >
                    {copied ? (
                      <><CheckCircle className="w-3.5 h-3.5" /> Copied</>
                    ) : (
                      <><Copy className="w-3.5 h-3.5" /> Copy</>
                    )}
                  </button>
                </div>
                <p className="text-[11px] text-gray-400">
                  DNS changes can take up to 48 hours to propagate globally.
                </p>
              </div>

              {!isEnterprise && (
                <p className="text-xs text-violet-600 bg-violet-50 border border-violet-200 rounded-lg px-3 py-2">
                  Custom domains require the Enterprise plan. Contact us to upgrade.
                </p>
              )}
            </div>
          </div>

          {/* Brand Colors */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-7 h-7 rounded-lg bg-pink-100 flex items-center justify-center">
                <Palette className="w-4 h-4 text-pink-600" />
              </div>
              <h2 className="font-bold text-gray-900">Brand Colours</h2>
            </div>
            <p className="text-sm text-gray-500 mb-5 ml-9">
              These colours are applied to your public-facing passport verify page and community portal.
            </p>
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Primary colour</label>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={e => setPrimaryColor(e.target.value)}
                      className="w-10 h-10 rounded-lg border-2 border-gray-200 cursor-pointer p-0.5 bg-transparent"
                    />
                  </div>
                  <input
                    type="text"
                    value={primaryColor}
                    onChange={e => {
                      const val = e.target.value
                      if (/^#[0-9A-Fa-f]{0,6}$/.test(val)) setPrimaryColor(val)
                    }}
                    maxLength={7}
                    className="flex-1 px-3 py-2 text-sm font-mono rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                    placeholder="#4F46E5"
                  />
                </div>
                <div
                  className="h-2 rounded-full mt-1"
                  style={{ background: primaryColor }}
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Accent colour</label>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <input
                      type="color"
                      value={accentColor}
                      onChange={e => setAccentColor(e.target.value)}
                      className="w-10 h-10 rounded-lg border-2 border-gray-200 cursor-pointer p-0.5 bg-transparent"
                    />
                  </div>
                  <input
                    type="text"
                    value={accentColor}
                    onChange={e => {
                      const val = e.target.value
                      if (/^#[0-9A-Fa-f]{0,6}$/.test(val)) setAccentColor(val)
                    }}
                    maxLength={7}
                    className="flex-1 px-3 py-2 text-sm font-mono rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                    placeholder="#0D9488"
                  />
                </div>
                <div
                  className="h-2 rounded-full mt-1"
                  style={{ background: accentColor }}
                />
              </div>
            </div>
          </div>

          {/* Identity */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-7 h-7 rounded-lg bg-teal-100 flex items-center justify-center">
                <Smartphone className="w-4 h-4 text-teal-600" />
              </div>
              <h2 className="font-bold text-gray-900">Identity</h2>
            </div>
            <p className="text-sm text-gray-500 mb-5 ml-9">
              Name and description shown on your public portal and mobile app.
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Display name</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  placeholder="My Organisation"
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tagline</label>
                <input
                  type="text"
                  value={tagline}
                  onChange={e => setTagline(e.target.value)}
                  placeholder="Your mission in one line"
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  App name{' '}
                  <span className="text-gray-400 font-normal">(shown in mobile app)</span>
                </label>
                <input
                  type="text"
                  value={appName}
                  onChange={e => setAppName(e.target.value)}
                  placeholder="MyOrg Passport"
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Logo URL</label>
                <input
                  type="url"
                  value={logoUrl}
                  onChange={e => setLogoUrl(e.target.value)}
                  placeholder="https://yourorg.com/logo.png"
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                />
                <p className="text-xs text-gray-400 mt-1.5">
                  Recommended: transparent PNG, minimum 200×60 px, under 500 KB.
                </p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Login / Signup Background Image
                </label>
                <input
                  type="url"
                  value={backgroundImageUrl}
                  onChange={e => setBackgroundImageUrl(e.target.value)}
                  placeholder="https://yourorg.com/background.jpg"
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                />
                <p className="text-xs text-gray-400 mt-1.5">
                  Shown behind the login and signup forms. Your brand colors are overlaid on top. Use a high-quality image (min 1920×1080 px).
                </p>
                {backgroundImageUrl && (
                  <div className="mt-2 rounded-xl overflow-hidden h-20 relative">
                    <img src={backgroundImageUrl} alt="Background preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-indigo-900/60" />
                    <p className="absolute inset-0 flex items-center justify-center text-white text-xs font-semibold">Preview</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Powered by TrustGrid */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center">
                  <Shield className="w-4 h-4 text-gray-500" />
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">"Powered by TrustGrid" badge</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Shown in the footer of your public passport verify page
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative inline-flex items-center cursor-not-allowed opacity-50">
                  <div className="w-10 h-6 bg-indigo-600 rounded-full" />
                  <div className="absolute right-1 w-4 h-4 bg-white rounded-full shadow" />
                </div>
                <span className="text-xs font-medium text-gray-500">On</span>
              </div>
            </div>
            {!isEnterprise && (
              <p className="text-xs text-gray-400 bg-gray-50 rounded-lg px-3 py-2 mt-4 border border-gray-100">
                The "Powered by TrustGrid" badge cannot be disabled on your current plan. Upgrade to Enterprise to remove it.
              </p>
            )}
          </div>

          {/* Save button (bottom) */}
          <div className="flex justify-end pt-2">
            <button
              onClick={handleSave}
              disabled={saveMutation.isPending}
              className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-60"
              style={{
                background: saved
                  ? '#059669'
                  : 'linear-gradient(135deg,#4F46E5,#0D9488)',
              }}
            >
              {saveMutation.isPending ? (
                <><RefreshCw className="w-4 h-4 animate-spin" /> Saving…</>
              ) : saved ? (
                <><CheckCircle className="w-4 h-4" /> Saved!</>
              ) : (
                <><Save className="w-4 h-4" /> Save Changes</>
              )}
            </button>
          </div>

          {saveMutation.isError && (
            <p className="text-sm text-red-500 text-right -mt-2">
              Failed to save. Please try again.
            </p>
          )}
        </div>

        {/* Right column — live preview */}
        <div className="lg:col-span-1">
          <div className="sticky top-6 space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <Eye className="w-4 h-4 text-gray-400" />
              <p className="text-sm font-bold text-gray-600">Live Preview</p>
            </div>
            <p className="text-xs text-gray-400 -mt-1">
              How your verify page header will look
            </p>

            {/* Preview card */}
            <div
              className="rounded-2xl overflow-hidden shadow-lg"
              style={{
                background: `linear-gradient(135deg, ${primaryColor} 0%, ${accentColor} 100%)`,
              }}
            >
              {/* Preview header */}
              <div className="px-5 py-4 flex items-center gap-2.5">
                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt={displayName || 'Logo'}
                    className="h-7 w-auto object-contain"
                    onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
                  />
                ) : (
                  <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                    <Shield className="w-4 h-4 text-white" />
                  </div>
                )}
                <span className="text-white font-black text-base tracking-tight">
                  {displayName || 'TrustGrid'}
                </span>
              </div>

              {/* Preview body */}
              <div className="bg-white/10 mx-3 mb-3 rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                    <span className="text-white text-xs font-black">A</span>
                  </div>
                  <div>
                    <div className="h-2.5 w-24 bg-white/40 rounded-full" />
                    <div className="h-2 w-16 bg-white/25 rounded-full mt-1.5" />
                  </div>
                  <div className="ml-auto text-right">
                    <p className="text-white font-black text-xl">A+</p>
                    <div className="h-1.5 w-10 bg-white/25 rounded-full ml-auto mt-0.5" />
                  </div>
                </div>
              </div>

              {/* Preview footer */}
              <div className="px-4 pb-3 text-center">
                <p className="text-white/50 text-[10px] font-medium">
                  Powered by TrustGrid · Community Trust Infrastructure
                </p>
              </div>
            </div>

            {/* Gradient swatch */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 space-y-3">
              <p className="text-xs font-bold text-gray-600 uppercase tracking-wide">Colour swatch</p>
              <div className="flex gap-2">
                <div className="flex-1 text-center">
                  <div
                    className="h-10 rounded-lg mb-1 shadow-sm"
                    style={{ background: primaryColor }}
                  />
                  <p className="text-[10px] text-gray-400 font-mono">{primaryColor}</p>
                  <p className="text-[10px] text-gray-500">Primary</p>
                </div>
                <div className="flex-1 text-center">
                  <div
                    className="h-10 rounded-lg mb-1 shadow-sm"
                    style={{ background: accentColor }}
                  />
                  <p className="text-[10px] text-gray-400 font-mono">{accentColor}</p>
                  <p className="text-[10px] text-gray-500">Accent</p>
                </div>
                <div className="flex-1 text-center">
                  <div
                    className="h-10 rounded-lg mb-1 shadow-sm"
                    style={{
                      background: `linear-gradient(135deg, ${primaryColor}, ${accentColor})`,
                    }}
                  />
                  <p className="text-[10px] text-gray-500">Gradient</p>
                </div>
              </div>
            </div>

            {/* Public link */}
            {subdomain && (
              <a
                href={`https://${subdomain}.trustgrid.ng`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 text-xs text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                {subdomain}.trustgrid.ng
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
