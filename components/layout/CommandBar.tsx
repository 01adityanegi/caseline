'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Command, X, Briefcase, FileText, Users, Calendar, Sparkles, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

import { useSession } from 'next-auth/react'

interface CommandBarProps {
  onClose: () => void
}

const FIRM_QUICK_ACTIONS = [
  { label: 'New Rent Agreement', icon: FileText, href: '/agreements/new?template=rent_residential', shortcut: 'R' },
  { label: 'Generate Freelance Agreement', icon: Sparkles, href: '/agreements/new?template=freelance_service', shortcut: 'F' },
  { label: '14 Agreement Templates', icon: FileText, href: '/agreements/templates', shortcut: 'T' },
  { label: 'AgreementStudio Dashboard', icon: FileText, href: '/agreements', shortcut: 'A' },
  { label: 'New Case', icon: Briefcase, href: '/cases/new', shortcut: 'N' },
  { label: 'Upload Document', icon: FileText, href: '/documents?upload=1', shortcut: 'U' },
  { label: 'View Calendar', icon: Calendar, href: '/calendar', shortcut: 'C' },
  { label: 'Clients', icon: Users, href: '/clients', shortcut: 'L' },
]

const CLIENT_QUICK_ACTIONS = [
  { label: 'My Agreements & Contracts', icon: FileText, href: '/agreements', shortcut: 'A' },
  { label: 'Draft Rent Agreement', icon: FileText, href: '/agreements/new?template=rent_residential', shortcut: 'R' },
  { label: 'My Legal Matters', icon: Briefcase, href: '/cases', shortcut: 'C' },
  { label: 'My Invoices & Statements', icon: FileText, href: '/billing', shortcut: 'B' },
  { label: 'My Case Documents', icon: FileText, href: '/documents', shortcut: 'D' },
]

export default function CommandBar({ onClose }: CommandBarProps) {
  const router = useRouter()
  const { data: session } = useSession()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Array<{ id: string; title: string; type: string; href: string; subtitle?: string }>>([])
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const isClient = (session?.user as any)?.role === 'CLIENT'
  const quickActions = isClient ? CLIENT_QUICK_ACTIONS : FIRM_QUICK_ACTIONS

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      return
    }

    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&limit=8`)
        if (res.ok) {
          const data = await res.json()
          setResults(data.results || [])
        }
      } catch {
        setResults([])
      } finally {
        setLoading(false)
      }
    }, 200)

    return () => clearTimeout(timer)
  }, [query])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    const items = query ? results : quickActions
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelected(s => Math.min(s + 1, items.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelected(s => Math.max(s - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (query && results[selected]) {
        router.push(results[selected].href)
        onClose()
      } else if (!query && quickActions[selected]) {
        router.push(quickActions[selected].href)
        onClose()
      }
    } else if (e.key === 'Escape') {
      onClose()
    }
  }, [query, results, selected, router, onClose, quickActions])

  const TYPE_ICONS: Record<string, React.ElementType> = {
    case: Briefcase,
    document: FileText,
    client: Users,
  }

  return (
    <div className="command-bar-overlay" onClick={onClose}>
      <div
        className="absolute top-[20%] left-1/2 -translate-x-1/2 w-full max-w-xl mx-4 rounded-2xl overflow-hidden animate-scale-in"
        style={{ background: '#FFFFFF', boxShadow: '0 25px 50px rgba(0,0,0,0.25)', border: '1px solid #E3E6EC' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-4 border-b" style={{ borderColor: '#E3E6EC' }}>
          <Search className="w-4 h-4 flex-shrink-0" style={{ color: '#667085' }} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => { setQuery(e.target.value); setSelected(0) }}
            onKeyDown={handleKeyDown}
            placeholder="Search cases, documents, clients... or run AI actions"
            className="flex-1 text-sm bg-transparent outline-none text-gray-900 placeholder:text-gray-400"
          />
          {loading && (
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          )}
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results or Quick Actions */}
        <div className="max-h-80 overflow-y-auto">
          {!query && (
            <div className="p-2">
              <p className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                {isClient ? 'Client Quick Actions' : 'Quick Actions'}
              </p>
              {quickActions.map((action, i) => {
                const Icon = action.icon
                return (
                  <button
                    key={action.label}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors',
                      selected === i ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'
                    )}
                    onClick={() => { router.push(action.href); onClose() }}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span className="flex-1 text-left">{action.label}</span>
                    <ArrowRight className="w-3.5 h-3.5 opacity-40" />
                  </button>
                )
              })}

              {!isClient && (
                <div className="mt-2 pt-2 border-t" style={{ borderColor: '#E3E6EC' }}>
                  <p className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">AI Actions</p>
                  <button
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-amber-700 hover:bg-amber-50 transition-colors"
                    onClick={() => { router.push('/dashboard#briefing'); onClose() }}
                  >
                    <Sparkles className="w-4 h-4 flex-shrink-0" style={{ color: '#B8893B' }} />
                    <span>Generate AI Daily Briefing</span>
                  </button>
                  <button
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-amber-700 hover:bg-amber-50 transition-colors"
                    onClick={() => { router.push('/cases?view=guardian'); onClose() }}
                  >
                    <Sparkles className="w-4 h-4 flex-shrink-0" style={{ color: '#B8893B' }} />
                    <span>Run Deadline Guardian</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {query && results.length > 0 && (
            <div className="p-2">
              {results.map((result, i) => {
                const Icon = TYPE_ICONS[result.type] || Briefcase
                return (
                  <button
                    key={result.id}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors',
                      selected === i ? 'bg-blue-50' : 'hover:bg-gray-50'
                    )}
                    onClick={() => { router.push(result.href); onClose() }}
                  >
                    <Icon className={cn('w-4 h-4 flex-shrink-0', selected === i ? 'text-blue-600' : 'text-gray-400')} />
                    <div className="flex-1 text-left">
                      <p className={cn('font-medium', selected === i ? 'text-blue-700' : 'text-gray-800')}>{result.title}</p>
                      {result.subtitle && <p className="text-xs text-gray-400">{result.subtitle}</p>}
                    </div>
                    <span className="text-xs px-1.5 py-0.5 rounded text-gray-400 border border-gray-200 capitalize">{result.type}</span>
                  </button>
                )
              })}
            </div>
          )}

          {query && results.length === 0 && !loading && (
            <div className="flex flex-col items-center py-10 text-gray-400">
              <Search className="w-8 h-8 mb-3 opacity-30" />
              <p className="text-sm">No results for &quot;{query}&quot;</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t flex items-center gap-4 text-xs text-gray-400" style={{ borderColor: '#E3E6EC', background: '#F6F7F9' }}>
          <span className="flex items-center gap-1.5"><kbd className="px-1.5 py-0.5 bg-white border border-gray-200 rounded text-gray-500">Esc</kbd> Close</span>
          <span className="flex items-center gap-1.5"><kbd className="px-1.5 py-0.5 bg-white border border-gray-200 rounded text-gray-500">Enter</kbd> Open</span>
          <span className="flex items-center gap-1.5"><kbd className="px-1.5 py-0.5 bg-white border border-gray-200 rounded text-gray-500">↑↓</kbd> Navigate</span>
        </div>
      </div>
    </div>
  )
}
