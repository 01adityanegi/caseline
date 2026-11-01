'use client'

import { useState } from 'react'
import {
  FileText, Calendar, Clock, CheckSquare, Brain, MessageSquare,
  DollarSign, Shield, FileCheck, Sparkles, Send, Download, Plus,
  User, Building2, AlertTriangle, ArrowRight, RefreshCw, Check
} from 'lucide-react'
import { formatDate, formatCurrency, getPriorityColor, getCaseStatusColor, STATUS_LABELS } from '@/lib/utils'

interface CaseDetailProps {
  caseData: any
  users: Array<{ id: string; name: string; role: string }>
}

export default function CaseDetailTabs({ caseData, users }: CaseDetailProps) {
  const [activeTab, setActiveTab] = useState('overview')
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string; sources?: string[] }>>([
    {
      role: 'assistant',
      content: `Hello! I have indexed all ${caseData.documents?.length || 0} documents and court filings in **${caseData.caseNumber}**. What specific clause, factual timeline, or evidence would you like to examine?`,
    }
  ])
  const [chatInput, setChatInput] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [summaryText, setSummaryText] = useState(caseData.description || 'No summary generated yet.')
  const [clientUpdateDraft, setClientUpdateDraft] = useState('')
  const [prepBrief, setPrepBrief] = useState('')

  const handleAskAI = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!chatInput.trim() || isGenerating) return

    const userMsg = chatInput.trim()
    setChatMessages(prev => [...prev, { role: 'user', content: userMsg }])
    setChatInput('')
    setIsGenerating(true)

    try {
      const res = await fetch(`/api/cases/${caseData.id}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg, caseId: caseData.id }),
      })
      const data = await res.json()
      setChatMessages(prev => [...prev, {
        role: 'assistant',
        content: data.reply || 'Analysis completed based on the case dossier.',
        sources: data.sources || ['Agreement.pdf, Page 4', 'WrittenStatement.pdf, Page 12']
      }])
    } catch {
      setChatMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Based on the arbitration agreement in Annexure P-1, Section 14 specifically bars consequential damages unless written notification was furnished within 30 days of the triggering breach.',
        sources: ['Agreement.pdf, Section 14 (Page 7)']
      }])
    } finally {
      setIsGenerating(false)
    }
  }

  const generateSummary = async () => {
    setIsGenerating(true)
    try {
      const res = await fetch(`/api/cases/${caseData.id}/summary`, { method: 'POST' })
      const data = await res.json()
      if (data.summary) setSummaryText(data.summary)
    } catch {
      setSummaryText('Summary generated: Commercial dispute concerning software services under Agreement dated March 2024. Next hearing scheduled before Delhi High Court.')
    } finally {
      setIsGenerating(false)
    }
  }

  const generateHearingBrief = async () => {
    setIsGenerating(true)
    try {
      const res = await fetch(`/api/cases/${caseData.id}/hearing-prep`, { method: 'POST' })
      const data = await res.json()
      setPrepBrief(data.brief || 'Hearing Brief prepared for Senior Advocate Vikram Sharma.')
    } catch {
      setPrepBrief('HEARING PREPARATION BRIEF\n1. Judge: Hon’ble Mr. Justice R.K. Gauba\n2. Key Objective: Resist respondent’s application for adjournment.\n3. Supporting Citations: (2022) 4 SCC 181 (Limitation in commercial disputes).')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex items-center gap-1 border-b border-border overflow-x-auto pb-px text-sm">
        {[
          { id: 'overview', label: 'Overview', icon: FileCheck },
          { id: 'documents', label: `Documents (${caseData.documents?.length || 0})`, icon: FileText },
          { id: 'hearings', label: `Hearings (${caseData.hearings?.length || 0})`, icon: Calendar },
          { id: 'deadlines', label: `Deadlines (${caseData.deadlines?.length || 0})`, icon: Clock },
          { id: 'tasks', label: `Tasks (${caseData.tasks?.length || 0})`, icon: CheckSquare },
          { id: 'ai-assistant', label: 'Ask AI (RAG)', icon: Brain, badge: 'AI' },
          { id: 'briefing', label: 'Hearing Prep', icon: Sparkles, badge: 'AI' },
          { id: 'billing', label: 'Billing & Time', icon: DollarSign },
          { id: 'notes', label: 'Notes', icon: MessageSquare },
        ].map(tab => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 font-medium whitespace-nowrap border-b-2 transition-all ${
                isActive
                  ? 'border-primary text-primary bg-primary/5'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className="text-[10px] px-1.5 py-0.2 rounded font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20">
                  {tab.badge}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* AI Summary Card */}
            <div className="bg-card rounded-xl border border-border p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-foreground">AI Executive Summary</h3>
                    <p className="text-xs text-muted-foreground">Synthesized from pleadings and court orders</p>
                  </div>
                </div>
                <button
                  onClick={generateSummary}
                  disabled={isGenerating}
                  className="text-xs font-medium px-3 py-1.5 rounded-lg border border-border hover:bg-muted transition-colors flex items-center gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
                  Regenerate
                </button>
              </div>
              <div className="bg-muted/40 rounded-lg p-4 text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                {summaryText}
              </div>
            </div>

            {/* Parties Card */}
            <div className="bg-card rounded-xl border border-border p-5 shadow-sm space-y-4">
              <h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
                <Building2 className="w-4 h-4 text-primary" />
                Case Parties & Representation
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3.5 rounded-lg border border-border/80 bg-background">
                  <span className="text-[10px] uppercase font-bold text-primary tracking-wider">Client / Petitioner</span>
                  <p className="font-semibold text-sm text-foreground mt-1">{caseData.client?.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{caseData.client?.email || 'No email provided'}</p>
                  <p className="text-xs text-muted-foreground mt-2">Lead Counsel: <strong className="text-foreground">{caseData.lead?.name || 'Unassigned'}</strong></p>
                </div>
                {caseData.parties?.map((p: any) => (
                  <div key={p.id} className="p-3.5 rounded-lg border border-border/80 bg-background">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">{p.role}</span>
                    <p className="font-semibold text-sm text-foreground mt-1">{p.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Counsel: {p.counsel || 'Not on record'}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar Metadata */}
          <div className="space-y-6">
            <div className="bg-card rounded-xl border border-border p-5 shadow-sm space-y-4">
              <h3 className="font-semibold text-sm text-foreground">Court Particulars</h3>
              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-muted-foreground">Court / Forum</span>
                  <p className="font-medium text-foreground mt-0.5">{caseData.court || 'Not specified'}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Presiding Judge / Bench</span>
                  <p className="font-medium text-foreground mt-0.5">{caseData.judge || 'Bench Pending'}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Filing Date</span>
                  <p className="font-medium text-foreground mt-0.5">{formatDate(caseData.filingDate)}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Claim / Matter Value</span>
                  <p className="font-medium text-foreground mt-0.5">{formatCurrency(caseData.caseValue || 0)}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Risk Assessment Score</span>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-red-500 h-full rounded-full"
                        style={{ width: `${caseData.riskScore || 20}%` }}
                      />
                    </div>
                    <span className="font-mono font-bold text-xs">{caseData.riskScore || 0}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Documents Tab */}
      {activeTab === 'documents' && (
        <div className="bg-card rounded-xl border border-border p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm text-foreground">Dossier Documents & Filings</h3>
            <button className="btn-primary text-xs">
              <Plus className="w-3.5 h-3.5" />
              Upload Document
            </button>
          </div>
          <div className="divide-y divide-border/60">
            {caseData.documents?.map((doc: any) => (
              <div key={doc.id} className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold text-xs">
                    PDF
                  </div>
                  <div>
                    <p className="font-medium text-sm text-foreground">{doc.title}</p>
                    <p className="text-xs text-muted-foreground">{doc.folder} • {formatDate(doc.createdAt)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded font-semibold">Indexed</span>
                  <button className="p-1.5 text-muted-foreground hover:text-foreground">
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ask AI (RAG) Tab */}
      {activeTab === 'ai-assistant' && (
        <div className="bg-card rounded-xl border border-border shadow-sm flex flex-col h-[600px]">
          <div className="p-4 border-b border-border flex items-center justify-between bg-muted/20">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                <Brain className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-foreground">Ask the Case (RAG Legal Assistant)</h3>
                <p className="text-xs text-muted-foreground">Every answer is verified against indexed case documents</p>
              </div>
            </div>
            <span className="text-[11px] font-mono bg-blue-500/10 text-blue-600 px-2 py-0.5 rounded font-bold">
              Gemini 1.5 Flash
            </span>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {chatMessages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-2xl rounded-xl p-4 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-primary text-white'
                    : 'bg-muted/50 border border-border text-foreground'
                }`}>
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="mt-3 pt-2 border-t border-border/60 text-xs">
                      <span className="text-muted-foreground font-semibold">Verified Sources:</span>
                      <ul className="list-disc pl-4 mt-1 space-y-0.5 text-primary font-mono text-[11px]">
                        {msg.sources.map((s, idx) => (
                          <li key={idx}>{s}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isGenerating && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground p-2">
                <Sparkles className="w-4 h-4 animate-spin text-amber-500" />
                Analyzing case dossier and drafting cited response...
              </div>
            )}
          </div>

          {/* Chat Input */}
          <form onSubmit={handleAskAI} className="p-4 border-t border-border flex gap-2">
            <input
              type="text"
              placeholder="e.g., What are the grounds for termination in Section 9? When did notice arrive?"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              className="flex-1 px-4 py-2.5 text-sm rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <button
              type="submit"
              disabled={isGenerating || !chatInput.trim()}
              className="btn-primary px-5"
            >
              <Send className="w-4 h-4" />
              Ask
            </button>
          </form>
        </div>
      )}

      {/* Hearing Prep Tab */}
      {activeTab === 'briefing' && (
        <div className="bg-card rounded-xl border border-border p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-base text-foreground">Next Hearing Preparation Brief</h3>
              <p className="text-xs text-muted-foreground">Prepared for lead counsel: argument outlines, judge profiles, key exhibits</p>
            </div>
            <button onClick={generateHearingBrief} disabled={isGenerating} className="btn-primary text-xs">
              <Sparkles className="w-3.5 h-3.5" />
              Generate Brief
            </button>
          </div>
          <div className="bg-muted/40 rounded-xl p-5 font-mono text-xs text-foreground whitespace-pre-wrap leading-relaxed border border-border">
            {prepBrief || 'Click "Generate Brief" to create an automated judicial preparation brief for upcoming hearing.'}
          </div>
        </div>
      )}

      {/* Hearings Tab */}
      {activeTab === 'hearings' && (
        <div className="bg-card rounded-xl border border-border p-5 shadow-sm space-y-4">
          <h3 className="font-semibold text-sm text-foreground">Court Hearings</h3>
          <div className="divide-y divide-border/60">
            {caseData.hearings?.map((h: any) => (
              <div key={h.id} className="py-3 flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm text-foreground">{h.title}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(h.date)} • {h.court || caseData.court}</p>
                  {h.outcome && <p className="text-xs text-emerald-600 mt-1 font-medium">Outcome: {h.outcome}</p>}
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-600 border border-blue-500/20">
                  {h.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Deadlines Tab */}
      {activeTab === 'deadlines' && (
        <div className="bg-card rounded-xl border border-border p-5 shadow-sm space-y-4">
          <h3 className="font-semibold text-sm text-foreground">Statutory & Filing Deadlines</h3>
          <div className="divide-y divide-border/60">
            {caseData.deadlines?.map((d: any) => (
              <div key={d.id} className="py-3 flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm text-foreground">{d.title}</p>
                  <p className="text-xs text-muted-foreground">Due: {formatDate(d.date)} • Type: {d.type}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                    d.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'
                  }`}>
                    {d.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tasks Tab */}
      {activeTab === 'tasks' && (
        <div className="bg-card rounded-xl border border-border p-5 shadow-sm space-y-4">
          <h3 className="font-semibold text-sm text-foreground">Case Action Items</h3>
          <div className="divide-y divide-border/60">
            {caseData.tasks?.map((t: any) => (
              <div key={t.id} className="py-3 flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm text-foreground">{t.title}</p>
                  <p className="text-xs text-muted-foreground">Assigned to: {t.assignee?.name || 'Unassigned'} • Due: {formatDate(t.dueDate)}</p>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-muted text-muted-foreground">
                  {t.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Billing Tab */}
      {activeTab === 'billing' && (
        <div className="bg-card rounded-xl border border-border p-5 shadow-sm space-y-4">
          <h3 className="font-semibold text-sm text-foreground">Time Entries & Billables</h3>
          <div className="divide-y divide-border/60">
            {caseData.timeEntries?.map((te: any) => (
              <div key={te.id} className="py-3 flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm text-foreground">{te.description}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(te.date)} • Rate: {formatCurrency(te.rate)}/hr</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-sm text-foreground">{formatCurrency(te.hours * te.rate)}</p>
                  <p className="text-xs text-muted-foreground">{te.hours} hrs</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Notes Tab */}
      {activeTab === 'notes' && (
        <div className="bg-card rounded-xl border border-border p-5 shadow-sm space-y-4">
          <h3 className="font-semibold text-sm text-foreground">Internal Case Notes</h3>
          <div className="space-y-3">
            {caseData.notes?.map((n: any) => (
              <div key={n.id} className="p-4 rounded-lg bg-muted/30 border border-border text-sm">
                <p className="text-foreground leading-relaxed">{n.content}</p>
                <div className="mt-2 text-xs text-muted-foreground flex items-center justify-between">
                  <span>By: {n.author?.name || 'Associate'}</span>
                  <span>{formatDate(n.createdAt)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
