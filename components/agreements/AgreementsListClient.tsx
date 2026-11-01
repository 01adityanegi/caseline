'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  Search, FileText, CheckCircle2, Clock, AlertCircle,
  Eye, Edit3, ChevronRight, Languages, Sparkles, LayoutGrid,
  List, Calendar, Users, ShieldCheck, PenTool, Printer,
  ArrowUpRight, X, ArrowRight
} from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface AgreementPartyItem {
  id: string
  nameEn: string
  nameHi?: string | null
  role: string
  signatureStatus: string
}

interface AgreementItem {
  id: string
  agreementNumber: string
  title: string
  titleHi: string | null
  category: string
  language: string
  status: string
  state: string
  executionDate: Date | string
  riskScore: number
  parties: AgreementPartyItem[]
  case: { id: string; title: string; caseNumber: string } | null
  client: { id: string; name: string } | null
  signatures: Array<{ id: string; partyId?: string }>
}

interface AgreementsListClientProps {
  initialAgreements: AgreementItem[]
}

const STATUS_LABELS: Record<string, { label: string; bg: string; text: string; border: string; accent: string }> = {
  DRAFT: {
    label: 'Draft',
    bg: 'bg-amber-500/10',
    text: 'text-amber-600 dark:text-amber-400',
    border: 'border-amber-500/20',
    accent: 'from-amber-500 to-amber-600',
  },
  REVIEW: {
    label: 'Under Review',
    bg: 'bg-blue-500/10',
    text: 'text-blue-600 dark:text-blue-400',
    border: 'border-blue-500/20',
    accent: 'from-blue-500 to-blue-600',
  },
  SIGNING: {
    label: 'In Signing',
    bg: 'bg-purple-500/10',
    text: 'text-purple-600 dark:text-purple-400',
    border: 'border-purple-500/20',
    accent: 'from-purple-500 to-indigo-600',
  },
  COMPLETED: {
    label: 'Fully Signed',
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-600 dark:text-emerald-400',
    border: 'border-emerald-500/20',
    accent: 'from-emerald-500 to-teal-600',
  },
}

export default function AgreementsListClient({ initialAgreements }: AgreementsListClientProps) {
  const [agreements] = useState<AgreementItem[]>(initialAgreements)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [categoryFilter, setCategoryFilter] = useState('ALL')
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards')

  const counts = useMemo(() => {
    return {
      all: agreements.length,
      draft: agreements.filter(a => a.status === 'DRAFT').length,
      signing: agreements.filter(a => a.status === 'SIGNING').length,
      completed: agreements.filter(a => a.status === 'COMPLETED').length,
    }
  }, [agreements])

  const filtered = useMemo(() => {
    return agreements.filter(a => {
      const q = search.toLowerCase()
      const matchesSearch = !q ||
        a.title.toLowerCase().includes(q) ||
        (a.titleHi && a.titleHi.toLowerCase().includes(q)) ||
        a.agreementNumber.toLowerCase().includes(q) ||
        a.parties.some(p => p.nameEn.toLowerCase().includes(q) || (p.nameHi && p.nameHi.toLowerCase().includes(q)))

      const matchesStatus = statusFilter === 'ALL' || a.status === statusFilter
      const matchesCategory = categoryFilter === 'ALL' || a.category === categoryFilter

      return matchesSearch && matchesStatus && matchesCategory
    })
  }, [agreements, search, statusFilter, categoryFilter])

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="bg-card p-4 rounded-2xl border border-border shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[260px] max-w-lg">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search agreements, parties, registration IDs..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-9 py-2 text-sm rounded-xl border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Category Dropdown */}
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="text-xs font-semibold px-3 py-2 rounded-xl border border-input bg-background text-foreground min-h-[38px] shadow-sm cursor-pointer"
            >
              <option value="ALL">All Categories</option>
              <option value="Rental & Property">Rental & Property</option>
              <option value="Business & Work">Business & Work</option>
              <option value="Personal">Personal</option>
            </select>

            {/* View Mode Toggle: Cards (Default) vs Table */}
            <div className="inline-flex items-center p-1 bg-muted/60 rounded-xl border border-border shadow-inner">
              <button
                onClick={() => setViewMode('cards')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  viewMode === 'cards'
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                title="Grid Cards View"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Cards</span>
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  viewMode === 'table'
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                title="Table View"
              >
                <List className="w-3.5 h-3.5" />
                <span>Table</span>
              </button>
            </div>
          </div>
        </div>

        {/* Status Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-semibold">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg border transition-all shrink-0 ${
              statusFilter === 'ALL'
                ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                : 'bg-background hover:bg-muted text-muted-foreground border-border'
            }`}
          >
            All Instruments ({counts.all})
          </button>
          <button
            onClick={() => setStatusFilter('SIGNING')}
            className={`px-3 py-1.5 rounded-lg border transition-all shrink-0 inline-flex items-center gap-1.5 ${
              statusFilter === 'SIGNING'
                ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                : 'bg-background hover:bg-muted text-muted-foreground border-border'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-purple-500" />
            In Signing ({counts.signing})
          </button>
          <button
            onClick={() => setStatusFilter('COMPLETED')}
            className={`px-3 py-1.5 rounded-lg border transition-all shrink-0 inline-flex items-center gap-1.5 ${
              statusFilter === 'COMPLETED'
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                : 'bg-background hover:bg-muted text-muted-foreground border-border'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            Fully Signed ({counts.completed})
          </button>
          <button
            onClick={() => setStatusFilter('DRAFT')}
            className={`px-3 py-1.5 rounded-lg border transition-all shrink-0 inline-flex items-center gap-1.5 ${
              statusFilter === 'DRAFT'
                ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                : 'bg-background hover:bg-muted text-muted-foreground border-border'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5 text-amber-500" />
            Drafts ({counts.draft})
          </button>
        </div>
      </div>

      {/* CARDS GRID VIEW (Primary & Default) */}
      {viewMode === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(agr => {
            const statusMeta = STATUS_LABELS[agr.status] || STATUS_LABELS.DRAFT
            const totalParties = agr.parties.length
            const signedCount = agr.parties.filter(p => p.signatureStatus === 'SIGNED').length
            const isCompleted = agr.status === 'COMPLETED' || (totalParties > 0 && signedCount >= totalParties)

            return (
              <div
                key={agr.id}
                className="group relative bg-card rounded-2xl border border-border/80 hover:border-primary/50 shadow-sm hover:shadow-xl transition-all duration-200 flex flex-col justify-between overflow-hidden"
              >
                {/* Top Colored Accent Stripe */}
                <div className={`h-1.5 w-full bg-gradient-to-r ${statusMeta.accent}`} />

                <div className="p-5 space-y-4 flex-1">
                  {/* Card Header: Identifier, Status & Category */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[11px] font-bold text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-md border border-border/60">
                      {agr.agreementNumber}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${statusMeta.bg} ${statusMeta.text} ${statusMeta.border}`}>
                        {agr.status === 'COMPLETED' ? (
                          <CheckCircle2 className="w-3 h-3" />
                        ) : agr.status === 'SIGNING' ? (
                          <Clock className="w-3 h-3" />
                        ) : agr.status === 'REVIEW' ? (
                          <Eye className="w-3 h-3" />
                        ) : (
                          <Edit3 className="w-3 h-3" />
                        )}
                        {statusMeta.label}
                      </span>
                    </div>
                  </div>

                  {/* Title & Bilingual Subtitle */}
                  <div className="space-y-1">
                    <Link
                      href={`/agreements/${agr.id}`}
                      className="font-bold text-base text-foreground group-hover:text-primary transition-colors block leading-snug line-clamp-2"
                    >
                      {agr.title}
                    </Link>
                    {agr.titleHi && (
                      <p className="font-hindi text-xs text-muted-foreground line-clamp-1" lang="hi">
                        {agr.titleHi}
                      </p>
                    )}
                  </div>

                  {/* Parties & Signature Progress */}
                  <div className="bg-muted/30 rounded-xl p-3 border border-border/60 space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" /> Parties ({totalParties})
                      </span>
                      <span className="font-mono text-[10px] text-foreground font-bold">
                        {signedCount}/{totalParties} Signed
                      </span>
                    </div>

                    {/* Progress Bar for Signatures */}
                    {totalParties > 0 && (
                      <div className="w-full bg-border/60 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${
                            isCompleted ? 'bg-emerald-500' : 'bg-purple-500'
                          }`}
                          style={{ width: `${Math.round((signedCount / totalParties) * 100)}%` }}
                        />
                      </div>
                    )}

                    {/* Party Badges List */}
                    <div className="space-y-1.5 pt-1">
                      {agr.parties.slice(0, 3).map(party => (
                        <div
                          key={party.id}
                          className="flex items-center justify-between text-xs bg-card px-2.5 py-1.5 rounded-lg border border-border/40"
                        >
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className="text-[10px] uppercase font-bold text-muted-foreground bg-muted px-1.5 py-0.5 rounded shrink-0">
                              {party.role}
                            </span>
                            <span className="font-medium text-foreground truncate text-[11px]">
                              {party.nameEn}
                            </span>
                          </div>

                          {party.signatureStatus === 'SIGNED' ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded shrink-0">
                              <CheckCircle2 className="w-2.5 h-2.5" /> Signed
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded shrink-0">
                              <Clock className="w-2.5 h-2.5" /> Pending
                            </span>
                          )}
                        </div>
                      ))}

                      {agr.parties.length > 3 && (
                        <div className="text-[10px] text-muted-foreground text-center font-medium">
                          +{agr.parties.length - 3} more parties
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Metadata Row: Category, Language & Risk Score */}
                  <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Calendar className="w-3.5 h-3.5 shrink-0 text-muted-foreground" />
                      <span className="text-[11px] truncate">{formatDate(agr.executionDate)}</span>
                    </div>

                    <div className="flex items-center justify-end gap-1.5 text-muted-foreground">
                      <Languages className="w-3.5 h-3.5 shrink-0 text-blue-500" />
                      <span className="text-[11px] font-semibold text-foreground truncate">
                        {agr.language === 'BOTH' ? 'Bilingual EN+HI' : agr.language}
                      </span>
                    </div>
                  </div>

                  {/* Risk Metric Bar */}
                  <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-card border border-border/60 text-xs">
                    <div className="flex items-center gap-1.5">
                      <ShieldCheck className={`w-3.5 h-3.5 ${agr.riskScore >= 70 ? 'text-emerald-500' : 'text-amber-500'}`} />
                      <span className="text-[11px] text-muted-foreground font-medium">Risk Score:</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-xs font-bold text-foreground">{agr.riskScore}%</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        agr.riskScore >= 70
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                      }`}>
                        {agr.riskScore >= 70 ? 'Balanced' : 'Review Advised'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Footer: Quick Actions */}
                <div className="p-4 bg-muted/20 border-t border-border flex items-center justify-between gap-2">
                  <span className="text-[11px] text-muted-foreground font-medium">
                    {agr.category}
                  </span>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/agreements/${agr.id}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-all shadow-sm active:scale-95"
                    >
                      <span>Open Workspace</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* TABLE VIEW (Alternative dense format) */}
      {viewMode === 'table' && (
        <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground border-b border-border">
                <tr>
                  <th className="py-3.5 px-4">Agreement Instrument</th>
                  <th className="py-3.5 px-4">Parties & Signatures</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Language</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Risk Metric</th>
                  <th className="py-3.5 px-4">Execution Date</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filtered.map(agr => {
                  const statusMeta = STATUS_LABELS[agr.status] || STATUS_LABELS.DRAFT
                  const totalParties = agr.parties.length
                  const signedCount = agr.parties.filter(p => p.signatureStatus === 'SIGNED').length

                  return (
                    <tr key={agr.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3.5 px-4">
                        <Link
                          href={`/agreements/${agr.id}`}
                          className="font-bold text-foreground hover:text-primary transition-colors block leading-tight"
                        >
                          {agr.title}
                        </Link>
                        {agr.titleHi && (
                          <p className="font-hindi text-xs text-muted-foreground mt-0.5" lang="hi">
                            {agr.titleHi}
                          </p>
                        )}
                        <span className="font-mono text-[10px] text-muted-foreground font-semibold mt-1 inline-block">
                          {agr.agreementNumber}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <div className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                            <span className="font-mono text-[11px] font-bold text-primary">
                              {signedCount}/{totalParties}
                            </span>
                            <span>Signed</span>
                          </div>
                          <p className="text-[11px] text-muted-foreground truncate max-w-[200px]">
                            {agr.parties.map(p => p.nameEn).join(', ')}
                          </p>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-xs font-medium text-foreground">
                        {agr.category}
                      </td>
                      <td className="py-3.5 px-4 text-xs">
                        <span className="inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-600 text-[10px]">
                          <Languages className="w-3 h-3" />
                          {agr.language.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${statusMeta.bg} ${statusMeta.text} ${statusMeta.border}`}>
                          {statusMeta.label}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-xs font-bold text-foreground">
                            {agr.riskScore}%
                          </span>
                          <span className={`w-2 h-2 rounded-full ${
                            agr.riskScore >= 70 ? 'bg-emerald-500' : 'bg-amber-500'
                          }`} />
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-muted-foreground">
                        {formatDate(agr.executionDate)}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Link
                          href={`/agreements/${agr.id}`}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary/80 transition-colors p-1"
                        >
                          <span>Open</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {filtered.length === 0 && (
        <div className="bg-card rounded-2xl border border-dashed border-border p-12 text-center space-y-3">
          <FileText className="w-10 h-10 text-muted-foreground mx-auto stroke-1" />
          <h3 className="font-bold text-base text-foreground">No agreements found</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            No agreements match your search or filters. Clear the search query or generate a new agreement.
          </p>
          <div className="pt-2">
            <Link
              href="/agreements/new"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-all shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5" /> Create Agreement
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
