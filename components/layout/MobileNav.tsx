'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import {
  LayoutDashboard,
  Briefcase,
  FileCheck,
  Calendar,
  Menu,
  X,
  FileText,
  Users,
  Receipt,
  UserCircle,
  BarChart3,
  Settings,
  Bell,
  LogOut,
  Scale,
  Sparkles,
  ChevronRight
} from 'lucide-react'

interface MobileNavProps {
  user: {
    name: string
    email: string
    role: string
    organizationName: string
  }
}

export default function MobileNav({ user }: MobileNavProps) {
  const pathname = usePathname()
  const [drawerOpen, setDrawerOpen] = useState(false)

  const TABS = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/cases', label: 'Cases', icon: Briefcase },
    { href: '/agreements', label: 'Agreements', icon: FileCheck, badge: 'AI' },
    { href: '/calendar', label: 'Calendar', icon: Calendar },
  ]

  const MORE_ITEMS = [
    { href: '/agreements/templates', label: 'Template Library', icon: Scale },
    { href: '/documents', label: 'Document Vault', icon: FileText },
    { href: '/clients', label: 'Clients Directory', icon: Users },
    { href: '/billing', label: 'Billing & Invoices', icon: Receipt },
    { href: '/team', label: 'Team Workload', icon: UserCircle },
    { href: '/reports', label: 'Practice Analytics', icon: BarChart3 },
    { href: '/notifications', label: 'Notifications', icon: Bell },
    { href: '/settings', label: 'Firm Settings', icon: Settings },
    { href: '/pitch', label: 'Pitch Deck (PPT)', icon: Sparkles },
  ]

  return (
    <>
      {/* Bottom Tab Bar (Visible on mobile screens < 768px) */}
      <nav
        aria-label="Mobile Bottom Navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0B1B33] border-t border-slate-800/80 px-2 pt-2 pb-safe shadow-2xl backdrop-blur-lg flex items-center justify-around h-16"
      >
        {TABS.map(tab => {
          const Icon = tab.icon
          const isActive = pathname === tab.href || pathname.startsWith(tab.href + '/')
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center justify-center flex-1 py-1 min-h-[44px] transition-all relative ${
                isActive ? 'text-blue-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'scale-110' : ''} transition-transform`} />
                {tab.badge && (
                  <span className="absolute -top-1 -right-2.5 bg-amber-500 text-slate-950 font-black text-[9px] px-1 rounded-full leading-tight">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-1 tracking-tight truncate max-w-[64px]">{tab.label}</span>
              {isActive && (
                <span className="absolute bottom-0 w-8 h-0.5 bg-blue-500 rounded-full" />
              )}
            </Link>
          )
        })}

        {/* More button */}
        <button
          onClick={() => setDrawerOpen(true)}
          className={`flex flex-col items-center justify-center flex-1 py-1 min-h-[44px] transition-all ${
            drawerOpen ? 'text-blue-400' : 'text-slate-400 hover:text-slate-200'
          }`}
          aria-label="Open More Menu"
        >
          <Menu className="w-5 h-5" />
          <span className="text-[10px] mt-1 tracking-tight">More</span>
        </button>
      </nav>

      {/* Slide-over Drawer for "More" Navigation */}
      {drawerOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex justify-end animate-in fade-in duration-200">
          <div
            className="w-[82%] max-w-sm h-full bg-[#0B1B33] border-l border-slate-800 p-5 flex flex-col justify-between overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
                    CL
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-white text-sm">CaseLine</h3>
                    <p className="text-[10px] text-slate-400 truncate max-w-[150px]">{user.organizationName}</p>
                  </div>
                </div>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 min-h-[44px] min-w-[44px] flex items-center justify-center"
                  aria-label="Close Menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* User Card */}
              <div className="p-3 my-4 rounded-xl bg-slate-900/80 border border-slate-800">
                <p className="text-xs font-semibold text-white">{user.name}</p>
                <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                <span className="inline-block mt-1.5 px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  {user.role}
                </span>
              </div>

              {/* Navigation Links */}
              <div className="space-y-1">
                {MORE_ITEMS.map(item => {
                  const Icon = item.icon
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setDrawerOpen(false)}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium min-h-[44px] transition-colors ${
                        isActive
                          ? 'bg-blue-600/20 text-blue-400 font-semibold'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                    </Link>
                  )
                })}
              </div>
            </div>

            {/* Logout button */}
            <div className="pt-4 border-t border-slate-800">
              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-red-400 bg-red-500/10 hover:bg-red-500/20 transition-colors min-h-[44px]"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
