'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { clearAdminAuth } from '@/lib/api'
import {
  LayoutDashboard, Building2, Users, Briefcase,
  ClipboardList, Settings, Shield, LogOut, Tag, Mail,
} from 'lucide-react'

const NAV = [
  { href: '/dashboard',      label: 'Overview',        icon: LayoutDashboard, badge: null },
  { href: '/demo-requests',  label: 'Demo Requests',   icon: Mail,            badge: 'new' },
  { href: '/applications',   label: 'Applications',    icon: ClipboardList,   badge: null },
  { href: '/catalog',        label: 'Service Catalog', icon: Tag,             badge: null },
  { href: '/institutions',   label: 'Institutions',    icon: Building2,       badge: null },
  { href: '/organisations',  label: 'Organisations',   icon: Briefcase,       badge: null },
  { href: '/workers',        label: 'Workers',         icon: Users,           badge: null },
  { href: '/passports',      label: 'Trust Passports', icon: Shield,          badge: null },
]

export function AdminSidebar() {
  const path = usePathname()
  const router = useRouter()

  return (
    <aside className="w-56 shrink-0 bg-slate-900 border-r border-white/5 min-h-screen flex flex-col">
      <div className="px-5 py-5 border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-white/10 rounded-lg flex items-center justify-center">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <span className="text-white font-bold text-sm">TrustGrid</span>
        </div>
        <p className="text-slate-500 text-xs mt-1">Super Admin Console</p>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV.map(({ href, label, icon: Icon, badge }) => {
          const active = path.startsWith(href)
          return (
            <Link key={href} href={href}
              className={cn(
                'flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors',
                active ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5',
              )}>
              <div className="flex items-center gap-2.5">
                <Icon className="w-4 h-4 shrink-0" />
                {label}
              </div>
              {badge === 'new' && (
                <span className="w-2 h-2 bg-blue-400 rounded-full" />
              )}
            </Link>
          )
        })}
      </nav>

      <div className="px-3 py-4 border-t border-white/5 space-y-0.5">
        <Link href="/settings"
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-colors">
          <Settings className="w-4 h-4" /> Settings
        </Link>
        <button onClick={() => { clearAdminAuth(); router.push('/login') }}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-colors">
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </div>
    </aside>
  )
}
