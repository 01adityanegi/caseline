'use client'

import { useEffect, useState } from 'react'
import { Sparkles, RefreshCw } from 'lucide-react'

interface AIBriefingCardProps {
  kpis: {
    activeCases: number
    hearingsThisWeek: number
    overdueDeadlines: number
    billableHours: number
  }
}

export default function AIBriefingCard({ kpis }: AIBriefingCardProps) {
  const [briefing, setBriefing] = useState('')
  const [loading, setLoading] = useState(true)

  const fetchBriefing = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/ai/daily-briefing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kpis }),
      })
      const data = await res.json()
      setBriefing(data.briefing || '')
    } catch {
      setBriefing(`You have ${kpis.hearingsThisWeek} hearing${kpis.hearingsThisWeek !== 1 ? 's' : ''} this week and ${kpis.overdueDeadlines} overdue deadline${kpis.overdueDeadlines !== 1 ? 's' : ''} requiring attention. Focus on deadline compliance and client updates today across ${kpis.activeCases} active cases.`)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchBriefing() }, [])

  return (
    <div className="ai-surface p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: 'hsl(var(--accent) / 0.15)' }}>
            <Sparkles className="w-4 h-4" style={{ color: '#B8893B' }} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-900">AI Daily Briefing</span>
              <span className="ai-badge">AI</span>
            </div>
            <p className="text-xs text-gray-500">Generated for today based on your caseload</p>
          </div>
        </div>
        <button
          onClick={fetchBriefing}
          disabled={loading}
          className="text-amber-600 hover:text-amber-700 transition-colors p-1 rounded"
          title="Regenerate"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="mt-4">
        {loading ? (
          <div className="space-y-2">
            <div className="h-4 skeleton rounded w-full" />
            <div className="h-4 skeleton rounded w-5/6" />
          </div>
        ) : (
          <p className="text-sm leading-relaxed" style={{ color: '#5C4A1E' }}>{briefing}</p>
        )}
      </div>

      <p className="mt-3 text-xs" style={{ color: '#B8893B', opacity: 0.7 }}>
        AI-generated — review before acting on this information.
      </p>
    </div>
  )
}
