'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { useState } from 'react'
import {
  LayoutDashboard,
  Scale,
  FolderOpen,
  Calendar,
  Users,
  Receipt,
  BarChart3,
  Settings,
  Bell,
  ChevronLeft,
  ChevronRight,
  LogOut,
  UserCircle,
  Briefcase,
  FileText,
  ChevronDown,
  HelpCircle,
  Sparkles,
} from 'lucide-react'
import { cn, getInitials, ROLE_LABELS } from '@/lib/utils'

interface SidebarProps {
  user: {
    name: string
    email: string
    role: string
    organizationName: string
  }
}

const FIRM_NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/cases', label: 'Cases', icon: Briefcase },
  { href: '/agreements', label: 'AgreementStudio', icon: FileText, badge: 'AI' },
  { href: '/agreements/templates', label: 'Templates', icon: Scale },
  { href: '/documents', label: 'Documents', icon: FolderOpen },
  { href: '/calendar', label: 'Calendar', icon: Calendar },
  { href: '/clients', label: 'Clients', icon: Users },
  { href: '/billing', label: 'Billing', icon: Receipt },
  { href: '/team', label: 'Team', icon: UserCircle },
  { href: '/reports', label: 'Reports', icon: BarChart3 },
  { href: '/pitch', label: 'Pitch Deck', icon: Sparkles },
]

const CLIENT_NAV_ITEMS = [
  { href: '/dashboard', label: 'Client Portal', icon: LayoutDashboard },
  { href: '/cases', label: 'My Cases', icon: Briefcase },
  { href: '/agreements', label: 'My Agreements', icon: FileText, badge: 'E-Sign' },
  { href: '/documents', label: 'My Documents', icon: FolderOpen },
  { href: '/billing', label: 'My Invoices', icon: Receipt },
]

export default function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const isClient = user.role === 'CLIENT'
  const navItems = isClient ? CLIENT_NAV_ITEMS : FIRM_NAV_ITEMS

  return (
    <aside
      className={cn(
        'flex flex-col h-screen transition-all duration-200 flex-shrink-0',
        collapsed ? 'w-16' : 'w-60'
      )}
      style={{ background: '#0B1B33', borderRight: '1px solid rgba(255,255,255,0.08)' }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#1F4FD8' }}>
          <Scale className="w-4 h-4 text-white" />
        </div>
        {!collapsed && (
          <div className="flex-1 min-w-0">
            <span className="text-white font-bold text-base tracking-tight">CaseLine</span>
            <p className="text-xs truncate" style={{ color: 'rgba(255,255,255,0.35)' }}>{user.organizationName}</p>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-white/40 hover:text-white/80 transition-colors p-1 rounded"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 space-y-0.5 overflow-y-auto no-scrollbar">
        {navItems.map(({ href, label, icon: Icon, badge }) => {
          const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href + '/'))
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'sidebar-nav-item flex items-center justify-between',
                isActive && 'active'
              )}
              title={collapsed ? label : undefined}
            >
              <div className="flex items-center gap-3 min-w-0">
                <Icon className="w-4 h-4 flex-shrink-0" />
                {!collapsed && <span className="truncate">{label}</span>}
              </div>
              {!collapsed && badge && (
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  {badge}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Bottom section */}
      <div className="py-4 px-2 border-t space-y-0.5" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
        <Link href="/notifications" className="sidebar-nav-item" title={collapsed ? 'Notifications' : undefined}>
          <Bell className="w-4 h-4 flex-shrink-0" />
          {!collapsed && <span>Notifications</span>}
        </Link>
        <Link href="/settings" className="sidebar-nav-item" title={collapsed ? 'Settings' : undefined}>
          <Settings className="w-4 h-4 flex-shrink-0" />
          {!collapsed && <span>Settings</span>}
        </Link>

        {/* User Profile */}
        <div
          className="flex items-center gap-3 px-3 py-2 rounded-lg mt-2"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold text-white"
            style={{ background: '#1F4FD8' }}
          >
            {getInitials(user.name)}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-medium truncate">{user.name}</p>
              <p className="text-xs truncate flex items-center gap-1.5" style={{ color: isClient ? '#34D399' : 'rgba(255,255,255,0.4)' }}>
                {isClient && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
                {isClient ? 'Client Portal' : (ROLE_LABELS[user.role] || user.role)}
              </p>
            </div>
          )}
          {!collapsed && (
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="text-white/30 hover:text-white/70 transition-colors"
              title="Sign out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </aside>
  )
}
