'use client'

import { useState, useEffect } from 'react'
import { Bell, Search, Moon, Sun, Command } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import dynamic from 'next/dynamic'

const CommandBar = dynamic(() => import('./CommandBar'), { ssr: false })

interface HeaderProps {
  title?: string
  subtitle?: string
}

export default function Header({ title, subtitle }: HeaderProps) {
  const [showCommandBar, setShowCommandBar] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    setMounted(true)
    // Fetch unread notification count
    fetch('/api/notifications/count').then(r => r.json()).then(d => setUnreadCount(d.count || 0)).catch(() => {})
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setShowCommandBar(true)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const today = formatDate(new Date(), 'EEEE, dd MMMM yyyy')

  return (
    <>
      <header
        className="flex items-center gap-4 px-6 h-14 flex-shrink-0 border-b"
        style={{ background: '#FFFFFF', borderColor: '#E3E6EC' }}
      >
        {/* Title area */}
        <div className="flex-1 min-w-0">
          {title ? (
            <div>
              <h1 className="text-sm font-semibold text-gray-900 truncate">{title}</h1>
              {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
            </div>
          ) : (
            <p className="text-sm text-gray-500">{today}</p>
          )}
        </div>

        {/* Search bar */}
        <button
          onClick={() => setShowCommandBar(true)}
          className="hidden md:flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all hover:bg-gray-50 border"
          style={{ borderColor: '#E3E6EC', minWidth: '220px' }}
        >
          <Search className="w-4 h-4 text-gray-400" />
          <span className="text-gray-400 flex-1 text-left text-xs">Search anything...</span>
          <div className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 text-xs bg-gray-100 text-gray-500 rounded border border-gray-200 font-mono">
              <Command className="w-3 h-3 inline" />K
            </kbd>
          </div>
        </button>

        {/* Actions */}
        <div className="flex items-center gap-1">
          {mounted && (
            <button
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors relative"
              onClick={() => window.location.href = '/notifications'}
            >
              <Bell className="w-4 h-4 text-gray-600" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500" />
              )}
            </button>
          )}
          <button
            className="md:hidden w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
            onClick={() => setShowCommandBar(true)}
          >
            <Search className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </header>

      {showCommandBar && <CommandBar onClose={() => setShowCommandBar(false)} />}
    </>
  )
}
