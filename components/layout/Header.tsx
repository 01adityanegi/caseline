'use client'

import { useState, useEffect } from 'react'
import { Bell, Search, Command } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import dynamic from 'next/dynamic'
import { motion, AnimatePresence } from 'framer-motion'

const CommandBar = dynamic(() => import('./CommandBar'), { ssr: false })

interface HeaderProps {
  title?: string
  subtitle?: string
}

export default function Header({ title, subtitle }: HeaderProps) {
  const [showCommandBar, setShowCommandBar] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    setMounted(true)
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

  useEffect(() => {
    const handleScroll = (e: Event) => {
      const target = e.target as HTMLElement
      setScrolled(target.scrollTop > 10)
    }
    const main = document.querySelector('main')
    main?.addEventListener('scroll', handleScroll)
    return () => main?.removeEventListener('scroll', handleScroll)
  }, [])

  const today = formatDate(new Date(), 'EEEE, dd MMMM yyyy')

  return (
    <>
      <motion.header
        className="flex items-center gap-4 px-4 md:px-6 h-14 flex-shrink-0 border-b transition-all duration-200 z-20"
        style={{
          background: scrolled ? 'rgba(255,255,255,0.96)' : '#FFFFFF',
          borderColor: '#E3E6EC',
          backdropFilter: scrolled ? 'blur(12px)' : 'none',
        }}
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Title area */}
        <div className="flex-1 min-w-0">
          {title ? (
            <div>
              <h1 className="text-sm font-semibold text-foreground truncate">{title}</h1>
              {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground font-medium hidden sm:block">{today}</p>
          )}
        </div>

        {/* Search bar */}
        <motion.button
          onClick={() => setShowCommandBar(true)}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          className="hidden md:flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all hover:bg-gray-50 border shadow-2xs"
          style={{ borderColor: '#E3E6EC', minWidth: '220px' }}
        >
          <Search className="w-4 h-4 text-muted-foreground" />
          <span className="text-muted-foreground flex-1 text-left text-xs font-medium">Search anything...</span>
          <div className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 text-xs bg-gray-100 text-gray-500 rounded border border-gray-200 font-mono flex items-center gap-0.5">
              <Command className="w-2.5 h-2.5" />K
            </kbd>
          </div>
        </motion.button>

        {/* Actions */}
        <div className="flex items-center gap-1.5">
          {mounted && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors relative cursor-pointer"
              onClick={() => window.location.href = '/notifications'}
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4 text-muted-foreground" />
              <AnimatePresence>
                {unreadCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500"
                  />
                )}
              </AnimatePresence>
            </motion.button>
          )}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
            onClick={() => setShowCommandBar(true)}
            aria-label="Search"
          >
            <Search className="w-4 h-4 text-muted-foreground" />
          </motion.button>
        </div>
      </motion.header>

      <AnimatePresence>
        {showCommandBar && <CommandBar onClose={() => setShowCommandBar(false)} />}
      </AnimatePresence>
    </>
  )
}
