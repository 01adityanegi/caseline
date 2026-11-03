'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
  { href: '/arguments', label: 'Argument AI', icon: Scale, badge: 'New AI' },
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
  { href: '/arguments', label: 'Argument AI', icon: Scale, badge: 'New AI' },
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
    <motion.aside
      animate={{ width: collapsed ? 64 : 240 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className="hidden md:flex flex-col h-screen flex-shrink-0 overflow-hidden select-none z-30"
      style={{ background: '#0B1B33', borderRight: '1px solid rgba(255,255,255,0.08)' }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm" style={{ background: '#1F4FD8' }}>
          <Scale className="w-4 h-4 text-white" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.2 }}
              className="flex-1 min-w-0 overflow-hidden"
            >
              <span className="text-white font-bold text-base tracking-tight whitespace-nowrap">CaseLine</span>
              <p className="text-xs truncate font-medium" style={{ color: 'rgba(255,255,255,0.45)' }}>{user.organizationName}</p>
            </motion.div>
          )}
        </AnimatePresence>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-white/40 hover:text-white/80 transition-colors p-1 rounded-lg hover:bg-white/10 flex-shrink-0"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <motion.div animate={{ rotate: collapsed ? 0 : 180 }} transition={{ duration: 0.25 }}>
            <ChevronLeft className="w-4 h-4" />
          </motion.div>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 space-y-0.5 overflow-y-auto no-scrollbar">
        {navItems.map(({ href, label, icon: Icon, badge }, idx) => {
          const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href + '/'))
          return (
            <motion.div
              key={href}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.03, duration: 0.25 }}
            >
              <Link
                href={href}
                className={cn(
                  'sidebar-nav-item flex items-center justify-between relative overflow-hidden text-sm font-medium rounded-lg px-3 py-2 transition-all',
                  isActive && 'active text-white'
                )}
                title={collapsed ? label : undefined}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute inset-0 rounded-lg"
                    style={{ background: 'rgba(255,255,255,0.12)' }}
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <div className="flex items-center gap-3 min-w-0 relative z-10">
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <AnimatePresence>
                    {!collapsed && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: 'auto' }}
                        exit={{ opacity: 0, width: 0 }}
                        transition={{ duration: 0.2 }}
                        className="truncate whitespace-nowrap overflow-hidden text-sm"
                      >
                        {label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
                <AnimatePresence>
                  {!collapsed && badge && (
                    <motion.span
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 relative z-10 flex-shrink-0"
                    >
                      {badge}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            </motion.div>
          )
        })}
      </nav>

      {/* Bottom section */}
      <div className="py-4 px-2 border-t space-y-0.5" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
        <Link href="/notifications" className="sidebar-nav-item" title={collapsed ? 'Notifications' : undefined}>
          <Bell className="w-4 h-4 flex-shrink-0" />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="whitespace-nowrap"
              >
                Notifications
              </motion.span>
            )}
          </AnimatePresence>
        </Link>
        <Link href="/settings" className="sidebar-nav-item" title={collapsed ? 'Settings' : undefined}>
          <Settings className="w-4 h-4 flex-shrink-0" />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="whitespace-nowrap"
              >
                Settings
              </motion.span>
            )}
          </AnimatePresence>
        </Link>

        {/* User Profile */}
        <div
          className="flex items-center gap-3 px-3 py-2 rounded-lg mt-2"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold text-white shadow-sm"
            style={{ background: '#1F4FD8' }}
          >
            {getInitials(user.name)}
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                className="flex-1 min-w-0 overflow-hidden flex items-center gap-1"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-white text-xs font-semibold truncate">{user.name}</p>
                  <p className="text-xs truncate flex items-center gap-1.5" style={{ color: isClient ? '#34D399' : 'rgba(255,255,255,0.45)' }}>
                    {isClient && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />}
                    {isClient ? 'Client Portal' : (ROLE_LABELS[user.role] || user.role)}
                  </p>
                </div>
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="text-white/30 hover:text-white/70 transition-colors flex-shrink-0 p-1 rounded"
                  title="Sign out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.aside>
  )
}
