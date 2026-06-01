'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { clearAuth } from '@/lib/api'
import {
  LayoutDashboard, Users, ClipboardList,
  AlertTriangle, BarChart2, Settings,
  LogOut, UserPlus, Building2, Heart, Home,
} from 'lucide-react'

const NAV = [
  { href: '/dashboard',        label: 'Overview',         icon: LayoutDashboard },
  { href: '/workers',          label: 'Workforce',        icon: Users },
  { href: '/volunteers',       label: 'Volunteers',       icon: Heart },
  { href: '/organisations',    label: 'Organisations',    icon: Building2 },
  { href: '/onboarding',       label: 'Applications',     icon: UserPlus },
  { href: '/service-requests', label: 'Service Requests', icon: ClipboardList },
  { href: '/incidents',        label: 'Incidents',        icon: AlertTriangle },
  { href: '/analytics',        label: 'Analytics',        icon: BarChart2 },
  { href: '/residents',        label: 'Residents',        icon: Home },
]

/** Network G — the TrustGrid brand mark, inline SVG */
function NetworkG({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="sidebar-g" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="#a5b4fc" />
          <stop offset="100%" stopColor="#67e8f9" />
        </linearGradient>
      </defs>
      <path d="M 21 26 C 12 38, 12 62, 24 80 C 32 88, 42 92, 52 92 C 62 92, 72 88, 80 80 C 88 72, 90 62, 90 50"
        stroke="url(#sidebar-g)" strokeWidth="3.5" strokeLinecap="round" fill="none"/>
      <path d="M 21 26 C 28 16, 40 10, 52 10"
        stroke="url(#sidebar-g)" strokeWidth="3.5" strokeLinecap="round" fill="none" opacity="0.45"/>
      <path d="M 90 50 L 52 50 L 76 50"
        stroke="url(#sidebar-g)" strokeWidth="3.5" strokeLinecap="round" fill="none"/>
      <circle cx="21"  cy="26" r="4"   fill="url(#sidebar-g)"/>
      <circle cx="52"  cy="92" r="4"   fill="url(#sidebar-g)"/>
      <circle cx="90"  cy="50" r="4.5" fill="url(#sidebar-g)"/>
      <circle cx="52"  cy="50" r="5"   fill="url(#sidebar-g)"/>
      <circle cx="76"  cy="50" r="3.5" fill="url(#sidebar-g)"/>
    </svg>
  )
}

export function Sidebar() {
  const path = usePathname()
  const router = useRouter()

  return (
    <aside
      className="w-60 shrink-0 min-h-screen flex flex-col"
      style={{ background: 'linear-gradient(180deg, #1e1b4b 0%, #0f172a 100%)' }}
    >
      {/* Logo */}
      <div className="px-5 py-6 border-b border-white/5">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(255,255,255,0.08)' }}>
            <NetworkG size={24} />
          </div>
          <div>
            <p className="font-black text-sm leading-none tracking-tight">
              <span className="text-white">Trust</span>
              <span style={{
                background: 'linear-gradient(90deg, #a5b4fc, #67e8f9)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>Grid</span>
            </p>
            <p className="text-white/25 text-xs mt-0.5">Governance Platform</p>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-5 space-y-0.5">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = path.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                active
                  ? 'bg-white/10 text-white'
                  : 'text-white/40 hover:text-white/75 hover:bg-white/5',
              )}
            >
              <Icon className={cn('w-4 h-4 shrink-0 transition-colors',
                active ? 'text-indigo-300' : 'text-white/30')} />
              <span className="flex-1">{label}</span>
              {active && (
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Bottom actions */}
      <div className="px-3 py-4 border-t border-white/5 space-y-0.5">
        <Link
          href="/my-organisation"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/35 hover:text-white/65 hover:bg-white/5 transition-all"
        >
          <Building2 className="w-4 h-4" />
          My Organisation
        </Link>
        <Link
          href="/settings"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/35 hover:text-white/65 hover:bg-white/5 transition-all"
        >
          <Settings className="w-4 h-4" />
          Settings
        </Link>
        <button
          onClick={() => { clearAuth(); router.push('/login') }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/35 hover:text-white/65 hover:bg-white/5 transition-all"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </aside>
  )
}
