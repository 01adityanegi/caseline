'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Search, Filter, LayoutGrid, List, ChevronRight, AlertTriangle,
  Calendar, User, ArrowUpDown, MoreHorizontal, ExternalLink, ShieldAlert,
  Clock, CheckCircle2, FileText, Scale
} from 'lucide-react'
import {
  formatDate, formatCurrency, getCaseStatusColor, getPriorityColor,
  STATUS_LABELS, getRiskColor
} from '@/lib/utils'

interface CaseItem {
  id: string
  caseNumber: string
  title: string
  description: string | null
  status: string
  priority: string
  practiceArea: string
  court: string | null
  judge: string | null
  filingDate: Date | string | null
  nextHearingDate: Date | string | null
  caseValue: number | null
  riskScore: number
  tags: string
  client: { name: string }
  lead: { name: string } | null
  _count: { tasks: number; documents: number; hearings: number }
}

interface CasesClientProps {
  cases: CaseItem[]
  users: Array<{ id: string; name: string }>
  initialView?: 'table' | 'pipeline'
}

const PIPELINE_COLUMNS = [
  { id: 'INTAKE', label: 'Intake' },
  { id: 'DISCOVERY', label: 'Discovery' },
  { id: 'PLEADINGS', label: 'Pleadings' },
  { id: 'TRIAL', label: 'Trial' },
  { id: 'JUDGMENT', label: 'Judgment' },
  { id: 'CLOSED', label: 'Closed' },
]

export default function CasesClient({ cases: initialCases, users, initialView = 'table' }: CasesClientProps) {
  const router = useRouter()
  const [view, setView] = useState<'table' | 'pipeline'>(initialView)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [priorityFilter, setPriorityFilter] = useState('ALL')
  const [sortBy, setSortBy] = useState<'risk' | 'date' | 'title'>('risk')
  const [casesList, setCasesList] = useState(initialCases)

  const filteredCases = useMemo(() => {
    return casesList.filter(c => {
      const matchesSearch =
        c.title.toLowerCase().includes(search.toLowerCase()) ||
        c.caseNumber.toLowerCase().includes(search.toLowerCase()) ||
        (c.court && c.court.toLowerCase().includes(search.toLowerCase())) ||
        c.client.name.toLowerCase().includes(search.toLowerCase())

      const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter
      const matchesPriority = priorityFilter === 'ALL' || c.priority === priorityFilter

      return matchesSearch && matchesStatus && matchesPriority
    }).sort((a, b) => {
      if (sortBy === 'risk') return b.riskScore - a.riskScore
      if (sortBy === 'date') {
        const dateA = a.nextHearingDate ? new Date(a.nextHearingDate).getTime() : 0
        const dateB = b.nextHearingDate ? new Date(b.nextHearingDate).getTime() : 0
        return dateB - dateA
      }
      return a.title.localeCompare(b.title)
    })
  }, [casesList, search, statusFilter, priorityFilter, sortBy])

  const handleStatusChange = async (caseId: string, newStatus: string) => {
    setCasesList(prev => prev.map(c => c.id === caseId ? { ...c, status: newStatus } : c))
    try {
      await fetch(`/api/cases/${caseId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-card p-4 rounded-xl border border-border shadow-sm">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by case name, number, court, client..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs font-medium px-3 py-2 rounded-lg border border-input bg-background text-foreground"
          >
            <option value="ALL">All Statuses</option>
            {Object.entries(STATUS_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="text-xs font-medium px-3 py-2 rounded-lg border border-input bg-background text-foreground"
          >
            <option value="ALL">All Priorities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'risk' | 'date' | 'title')}
            className="text-xs font-medium px-3 py-2 rounded-lg border border-input bg-background text-foreground"
          >
            <option value="risk">Sort by Risk Score</option>
            <option value="date">Sort by Hearing Date</option>
            <option value="title">Sort by Title</option>
          </select>
        </div>

        <div className="flex items-center gap-1 border border-border rounded-lg p-1 bg-muted/40">
          <button
            onClick={() => setView('table')}
            className={`p-1.5 rounded flex items-center gap-1.5 text-xs font-medium transition-colors ${
              view === 'table' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <List className="w-4 h-4" />
            Table
          </button>
          <button
            onClick={() => setView('pipeline')}
            className={`p-1.5 rounded flex items-center gap-1.5 text-xs font-medium transition-colors ${
              view === 'pipeline' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            Pipeline
          </button>
        </div>
      </div>

      {/* Table View */}
      {view === 'table' && (
        <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground border-b border-border">
                <tr>
                  <th className="py-3 px-4">Case & Client</th>
                  <th className="py-3 px-4">Court / Judge</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Risk</th>
                  <th className="py-3 px-4">Next Hearing</th>
                  <th className="py-3 px-4">Lead</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredCases.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-muted-foreground">
                      No cases found matching your filters.
                    </td>
                  </tr>
                ) : (
                  filteredCases.map(c => {
                    const statusStyle = getCaseStatusColor(c.status)
                    const priorityStyle = getPriorityColor(c.priority)
                    const riskStyle = getRiskColor(c.riskScore)

                    return (
                      <tr key={c.id} className="hover:bg-muted/30 transition-colors">
                        <td className="py-3.5 px-4">
                          <Link href={`/cases/${c.id}`} className="font-semibold text-foreground hover:text-primary transition-colors block">
                            {c.title}
                          </Link>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                            <span className="font-mono">{c.caseNumber}</span>
                            <span>•</span>
                            <span>{c.client.name}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-xs">
                          <p className="font-medium text-foreground">{c.court || 'Court not assigned'}</p>
                          <p className="text-muted-foreground">{c.judge || 'Bench Pending'}</p>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${statusStyle.bg} ${statusStyle.text}`}>
                            {STATUS_LABELS[c.status] || c.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${priorityStyle.bg} ${priorityStyle.text}`}>
                            {c.priority}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5">
                            <span className={`w-2 h-2 rounded-full ${riskStyle.dot}`} />
                            <span className="text-xs font-semibold font-mono">{c.riskScore}%</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-xs text-foreground">
                          {c.nextHearingDate ? (
                            <span className="inline-flex items-center gap-1 text-primary font-medium">
                              <Calendar className="w-3.5 h-3.5" />
                              {formatDate(c.nextHearingDate)}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">None scheduled</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-xs text-foreground">
                          <div className="flex items-center gap-1.5">
                            <div className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold">
                              {c.lead?.name?.charAt(0) || '?'}
                            </div>
                            <span>{c.lead?.name || 'Unassigned'}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <Link
                            href={`/cases/${c.id}`}
                            className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
                          >
                            Open <ChevronRight className="w-3.5 h-3.5" />
                          </Link>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pipeline Kanban View */}
      {view === 'pipeline' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {PIPELINE_COLUMNS.map(col => {
            const columnCases = filteredCases.filter(c => c.status === col.id)

            return (
              <div key={col.id} className="bg-muted/30 border border-border rounded-xl p-3 flex flex-col min-h-[500px]">
                <div className="flex items-center justify-between pb-3 mb-2 border-b border-border/80">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs text-foreground">{col.label}</span>
                    <span className="bg-card px-2 py-0.5 rounded-full text-[11px] font-bold text-muted-foreground border border-border">
                      {columnCases.length}
                    </span>
                  </div>
                </div>

                <div className="space-y-2.5 flex-1 overflow-y-auto">
                  {columnCases.map(c => {
                    const priorityStyle = getPriorityColor(c.priority)
                    const riskStyle = getRiskColor(c.riskScore)

                    return (
                      <div
                        key={c.id}
                        className="bg-card p-3 rounded-lg border border-border shadow-sm hover:border-primary/40 transition-all cursor-pointer group"
                      >
                        <div className="flex items-start justify-between gap-1 mb-1.5">
                          <span className="text-[10px] font-mono text-muted-foreground">{c.caseNumber}</span>
                          <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${priorityStyle.bg} ${priorityStyle.text}`}>
                            {c.priority}
                          </span>
                        </div>

                        <Link href={`/cases/${c.id}`} className="font-semibold text-xs text-foreground group-hover:text-primary line-clamp-2 mb-2 block">
                          {c.title}
                        </Link>

                        <div className="text-[11px] text-muted-foreground mb-2 flex items-center justify-between">
                          <span className="truncate">{c.client.name}</span>
                          <span className={`font-mono text-[10px] font-bold ${riskStyle.text}`}>{c.riskScore}% risk</span>
                        </div>

                        {c.nextHearingDate && (
                          <div className="text-[11px] text-primary/90 bg-primary/5 px-2 py-1 rounded flex items-center gap-1 mb-2">
                            <Clock className="w-3 h-3" />
                            <span>{formatDate(c.nextHearingDate)}</span>
                          </div>
                        )}

                        <div className="pt-2 border-t border-border/60 flex items-center justify-between text-[11px] text-muted-foreground">
                          <span>{c.lead?.name || 'Unassigned'}</span>
                          <div className="flex items-center gap-1">
                            <select
                              value={c.status}
                              onChange={(e) => handleStatusChange(c.id, e.target.value)}
                              className="text-[10px] bg-background border border-border rounded px-1 py-0.5"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {PIPELINE_COLUMNS.map(p => (
                                <option key={p.id} value={p.id}>{p.label}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                    )
                  })}

                  {columnCases.length === 0 && (
                    <div className="h-32 border-2 border-dashed border-border/60 rounded-lg flex items-center justify-center text-xs text-muted-foreground">
                      No cases
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
