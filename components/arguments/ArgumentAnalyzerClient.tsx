'use client'

import React, { useState } from 'react'
import {
  Scale,
  Sparkles,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Copy,
  Check,
  RotateCcw,
  BookOpen,
  Printer,
  ChevronRight,
  TrendingUp,
  FileText,
  User,
  Building,
  HelpCircle,
  Lightbulb,
  FileCheck,
  Layers,
  Languages,
  Briefcase
} from 'lucide-react'
import { ArgumentAnalysisResult } from '@/lib/ai/service'

interface PresetArgument {
  id: string
  title: string
  category: string
  label: string
  text: string
  context: string
}

const PRESET_ARGUMENTS: PresetArgument[] = [
  {
    id: 'lease-lockout',
    title: 'Commercial Lease Eviction & Lockout',
    category: 'Tenancy & Real Estate',
    label: 'Tenant vs Commercial Landlord',
    text: 'The commercial landlord padlocked our retail shop and disconnected the power after our rent payment was delayed by 12 days. Our signed lease agreement explicitly specifies that the landlord must furnish a 30-day written cure notice before taking any termination action or re-entering the premises.',
    context: 'Transfer of Property Act 1882, Commercial Tenancy Lease Dispute'
  },
  {
    id: 'software-withholding',
    title: 'Software Deliverable Withholding',
    category: 'IT & Commercial Services',
    label: 'Agency vs Enterprise Client',
    text: 'The client accepted and deployed Milestone 1 and 2 to their production environment, but is now withholding the final 40% payment of INR 18,00,000 citing minor cosmetic UI bugs and new feature requests that were never part of the original agreed Statement of Work (SOW).',
    context: 'Indian Contract Act 1872, MSMED Act 2006, Commercial Services'
  },
  {
    id: 'non-compete-injunction',
    title: 'Post-Employment Non-Compete Covenant',
    category: 'Employment & Labor',
    label: 'Software Engineer vs Ex-Employer',
    text: 'My previous employer sent a legal notice threatening an injunction and refusing to issue my experience letter and relieving certificate because I joined a competing software firm. They claim I breached a 2-year non-compete clause in my employment contract.',
    context: 'Section 27 Indian Contract Act 1872, Employment Restraint of Trade'
  },
  {
    id: 'bayana-forfeiture',
    title: 'Advance Bayana Forfeiture in Property Sale',
    category: 'Property Sale & Bayana',
    label: 'Property Buyer vs Seller',
    text: 'The seller unilaterally forfeited our token earnest money (bayana) of INR 10,00,000 because our home loan sanction from the bank took 20 days longer than the tentative closing date. The seller never sent a formal notice requiring attendance at the Sub-Registrar office.',
    context: 'Specific Relief Act 1963, Section 74 Indian Contract Act 1872'
  },
  {
    id: 'consumer-defect',
    title: 'Defective Industrial Machine & Refund Denial',
    category: 'Consumer & Commercial Supply',
    label: 'Business Buyer vs Manufacturer',
    text: 'The equipment manufacturer delivered an industrial packaging machine that broke down within 14 days of installation. They refuse to replace the unit or issue a refund, pointing to a fine-print clause stating all sales are final and warranties only cover minor replacement parts.',
    context: 'Consumer Protection Act 2019, Sale of Goods Act 1930'
  }
]

interface CaseOption {
  id: string
  title: string
  caseNumber: string
}

interface ArgumentAnalyzerClientProps {
  cases?: CaseOption[]
  initialArgument?: string
  initialCaseId?: string
}

export default function ArgumentAnalyzerClient({
  cases = [],
  initialArgument = '',
  initialCaseId = ''
}: ArgumentAnalyzerClientProps) {
  const [argumentText, setArgumentText] = useState(initialArgument || PRESET_ARGUMENTS[0].text)
  const [selectedCaseId, setSelectedCaseId] = useState(initialCaseId)
  const [contextInput, setContextInput] = useState(PRESET_ARGUMENTS[0].context)
  const [roleFocus, setRoleFocus] = useState<'BOTH' | 'CLIENT' | 'OWNER'>('BOTH')
  const [activeTab, setActiveTab] = useState<'all' | 'client' | 'owner' | 'improvements'>('all')
  const [showHindi, setShowHindi] = useState(false)
  const [loading, setLoading] = useState(false)
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const [result, setResult] = useState<ArgumentAnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSelectPreset = (preset: PresetArgument) => {
    setArgumentText(preset.text)
    setContextInput(preset.context)
  }

  const handleAnalyze = async () => {
    if (!argumentText.trim()) return
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/ai/analyze-argument', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          argument: argumentText.trim(),
          context: contextInput.trim(),
          role: roleFocus,
          caseId: selectedCaseId || undefined
        })
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error || 'Failed to analyze argument')
      }

      const data = (await res.json()) as ArgumentAnalysisResult
      setResult(data)
    } catch (err: any) {
      console.error('Analysis error:', err)
      setError(err?.message || 'Error occurred while evaluating argument.')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  const getScoreColor = (score: number) => {
    if (score >= 75) return { bg: 'bg-emerald-500/10', text: 'text-emerald-700 dark:text-emerald-400', border: 'border-emerald-500/30', bar: 'bg-emerald-600' }
    if (score >= 50) return { bg: 'bg-amber-500/10', text: 'text-amber-700 dark:text-amber-400', border: 'border-amber-500/30', bar: 'bg-amber-600' }
    return { bg: 'bg-rose-500/10', text: 'text-rose-700 dark:text-rose-400', border: 'border-rose-500/30', bar: 'bg-rose-600' }
  }

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case 'LOW':
        return { label: 'Low Risk', bg: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30' }
      case 'MEDIUM':
        return { label: 'Moderate Risk', bg: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30' }
      case 'HIGH':
        return { label: 'High Exposure', bg: 'bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/30' }
      case 'CRITICAL':
        return { label: 'Critical Legal Risk', bg: 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/30' }
      default:
        return { label: risk, bg: 'bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-500/30' }
    }
  }

  return (
    <div className="space-y-8">
      {/* Page Title & Mission Banner */}
      <div className="bg-gradient-to-r from-blue-900/40 via-indigo-900/20 to-slate-900/40 border border-blue-500/20 rounded-2xl p-6 md:p-8 backdrop-blur-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-600 dark:text-blue-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Argument Dissector & Legal Optimizer</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-foreground tracking-tight">
              Evaluate Arguments for Clients & Owners
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Examine any dispute claim or contractual stance in plain simple language. Compare advantages and disadvantages from both the <strong className="text-foreground">Client</strong> and <strong className="text-foreground">Owner</strong> perspectives, and discover actionable improvements to bolster your position.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-center">
            <button
              onClick={() => setShowHindi(!showHindi)}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
                showHindi
                  ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/40 shadow-sm'
                  : 'bg-card text-muted-foreground border-border hover:text-foreground'
              }`}
              title="Toggle Hindi Translations"
            >
              <Languages className="w-4 h-4 text-amber-500" />
              <span>{showHindi ? 'सरल हिंदी सक्रिय है' : 'सरल हिंदी देखें (Hindi)'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Input Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Preset Templates */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-500" />
              Quick Dispute Presets
            </h2>
            <span className="text-[11px] text-muted-foreground">Select to test</span>
          </div>

          <div className="space-y-2.5">
            {PRESET_ARGUMENTS.map((preset) => {
              const isSelected = argumentText === preset.text
              return (
                <button
                  key={preset.id}
                  onClick={() => handleSelectPreset(preset)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all text-xs space-y-1.5 ${
                    isSelected
                      ? 'bg-blue-500/10 border-blue-500/40 text-foreground ring-1 ring-blue-500/30 shadow-sm'
                      : 'bg-card border-border hover:border-border/80 text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground truncate">{preset.title}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-muted font-medium text-muted-foreground">
                      {preset.category}
                    </span>
                  </div>
                  <p className="text-[11px] line-clamp-2 leading-relaxed opacity-90">{preset.text}</p>
                  <div className="flex items-center gap-1.5 text-[10px] text-blue-500 font-medium pt-0.5">
                    <Layers className="w-3 h-3" />
                    <span>{preset.label}</span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Right Column: Argument Input & Configuration */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <label htmlFor="argument-textarea" className="text-sm font-semibold text-foreground flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                Argument / Claim Under Analysis
              </label>

              <div className="flex items-center gap-2">
                {cases.length > 0 && (
                  <select
                    value={selectedCaseId}
                    onChange={(e) => setSelectedCaseId(e.target.value)}
                    className="text-xs rounded-lg border border-border bg-background px-2.5 py-1 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="">Attach to Case (Optional)</option>
                    {cases.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.caseNumber} - {c.title.slice(0, 30)}...
                      </option>
                    ))}
                  </select>
                )}
                <button
                  onClick={() => {
                    setArgumentText('')
                    setContextInput('')
                    setResult(null)
                  }}
                  className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors px-2 py-1 rounded"
                >
                  <RotateCcw className="w-3 h-3" />
                  Clear
                </button>
              </div>
            </div>

            <textarea
              id="argument-textarea"
              rows={5}
              value={argumentText}
              onChange={(e) => setArgumentText(e.target.value)}
              placeholder="Paste or describe any legal argument, claim, demand letter grievance, or contract dispute clause here..."
              className="w-full text-sm rounded-xl border border-border bg-background p-3.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all leading-relaxed"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                  Dispute Context / Applicable Law
                </label>
                <input
                  type="text"
                  value={contextInput}
                  onChange={(e) => setContextInput(e.target.value)}
                  placeholder="e.g. Indian Contract Act 1872, Delhi Tenancy Act"
                  className="w-full text-xs rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                  Perspective Analysis Mode
                </label>
                <div className="grid grid-cols-3 gap-1.5 p-1 bg-muted rounded-lg text-xs font-medium">
                  <button
                    type="button"
                    onClick={() => setRoleFocus('BOTH')}
                    className={`py-1 rounded text-center transition-all ${
                      roleFocus === 'BOTH'
                        ? 'bg-card text-foreground shadow-sm font-semibold'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Both Sides
                  </button>
                  <button
                    type="button"
                    onClick={() => setRoleFocus('CLIENT')}
                    className={`py-1 rounded text-center transition-all ${
                      roleFocus === 'CLIENT'
                        ? 'bg-card text-foreground shadow-sm font-semibold'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Client
                  </button>
                  <button
                    type="button"
                    onClick={() => setRoleFocus('OWNER')}
                    className={`py-1 rounded text-center transition-all ${
                      roleFocus === 'OWNER'
                        ? 'bg-card text-foreground shadow-sm font-semibold'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Owner
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between flex-wrap gap-3">
              <span className="text-xs text-muted-foreground">
                {argumentText.length} characters &bull; AI evaluates legal standing, vulnerabilities, and improvements
              </span>

              <button
                onClick={handleAnalyze}
                disabled={loading || !argumentText.trim()}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-md shadow-blue-500/20 disabled:opacity-50 disabled:pointer-events-none transition-all hover:scale-[1.01] active:scale-[0.99]"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Analyzing Argument...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Analyze Argument with AI</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-400 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>
      </div>

      {/* Results View */}
      {result && (
        <div className="space-y-6 pt-2">
          {/* Header Executive Card */}
          <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-sm space-y-6">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 border-b border-border pb-6">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 border border-blue-500/20">
                    Evaluation Complete
                  </span>
                  <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${getRiskBadge(result.riskLevel).bg}`}>
                    {getRiskBadge(result.riskLevel).label}
                  </span>
                </div>

                <h2 className="text-xl md:text-2xl font-serif font-bold text-foreground">
                  {result.title}
                </h2>

                <p className="text-sm text-muted-foreground leading-relaxed">
                  {result.summary}
                </p>

                {showHindi && result.summaryHi && (
                  <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-900 dark:text-amber-200 mt-2">
                    <strong className="font-semibold block mb-1">सरल हिंदी में सार:</strong>
                    {result.summaryHi}
                  </div>
                )}
              </div>

              {/* Viability Gauge */}
              <div className="flex md:flex-col items-center justify-between md:justify-center p-4 rounded-xl bg-background border border-border min-w-[160px] text-center gap-2">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Viability Score
                </span>
                <div className="flex items-baseline gap-1">
                  <span className={`text-3xl font-extrabold font-mono ${getScoreColor(result.viabilityScore).text}`}>
                    {result.viabilityScore}%
                  </span>
                </div>
                <div className="w-full bg-muted h-2 rounded-full overflow-hidden mt-1">
                  <div
                    className={`h-full rounded-full ${getScoreColor(result.viabilityScore).bar}`}
                    style={{ width: `${result.viabilityScore}%` }}
                  />
                </div>
                <span className="text-[10px] text-muted-foreground">
                  {result.viabilityScore >= 75 ? 'Strong Position' : result.viabilityScore >= 50 ? 'Moderate Stance' : 'Fragile Argument'}
                </span>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-1.5 p-1 bg-muted rounded-xl text-xs font-medium">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    activeTab === 'all'
                      ? 'bg-card text-foreground font-semibold shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Full Breakdown
                </button>
                <button
                  onClick={() => setActiveTab('client')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    activeTab === 'client'
                      ? 'bg-card text-foreground font-semibold shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  As a Client
                </button>
                <button
                  onClick={() => setActiveTab('owner')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    activeTab === 'owner'
                      ? 'bg-card text-foreground font-semibold shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  As an Owner
                </button>
                <button
                  onClick={() => setActiveTab('improvements')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    activeTab === 'improvements'
                      ? 'bg-card text-foreground font-semibold shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  What Will Improve ✨
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    copyToClipboard(
                      `${result.title}\n\nSUMMARY:\n${result.summary}\n\nCLIENT PERSPECTIVE:\n${result.clientPerspective.simpleTakeaway}\n\nOWNER PERSPECTIVE:\n${result.ownerPerspective.simpleTakeaway}\n\nIMPROVEMENTS:\n${result.whatWillImprove.strategicImprovements.map((s) => `- ${s.area}: ${s.action}`).join('\n')}`,
                      'full-report'
                    )
                  }
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  {copiedKey === 'full-report' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Copied Report</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Report</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print</span>
                </button>
              </div>
            </div>
          </div>

          {/* SECTION: GENERAL ADVANTAGES & DISADVANTAGES */}
          {(activeTab === 'all') && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Advantages Card */}
              <div className="bg-card border border-emerald-500/20 rounded-2xl p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-semibold text-sm">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  </div>
                  <span>Core Advantages & Strengths ({result.advantages.length})</span>
                </div>

                <div className="space-y-3">
                  {result.advantages.map((adv, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-emerald-500/5 border border-emerald-500/10 space-y-1">
                      <div className="flex items-center gap-2 font-medium text-xs text-foreground">
                        <Check className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                        <span>{adv.point}</span>
                      </div>
                      <p className="text-xs text-muted-foreground pl-5 leading-relaxed">
                        {adv.detail}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Disadvantages Card */}
              <div className="bg-card border border-rose-500/20 rounded-2xl p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400 font-semibold text-sm">
                  <div className="w-7 h-7 rounded-lg bg-rose-500/10 flex items-center justify-center">
                    <AlertTriangle className="w-4 h-4 text-rose-500" />
                  </div>
                  <span>Core Disadvantages & Vulnerabilities ({result.disadvantages.length})</span>
                </div>

                <div className="space-y-3">
                  {result.disadvantages.map((dis, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-rose-500/5 border border-rose-500/10 space-y-1">
                      <div className="flex items-center gap-2 font-medium text-xs text-foreground">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />
                        <span>{dis.point}</span>
                      </div>
                      <p className="text-xs text-muted-foreground pl-5 leading-relaxed">
                        {dis.detail}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* SECTION: CLIENT VS OWNER PERSPECTIVES */}
          {(activeTab === 'all' || activeTab === 'client' || activeTab === 'owner') && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* AS A CLIENT */}
              {(activeTab === 'all' || activeTab === 'client') && (
                <div className="bg-card border border-blue-500/20 rounded-2xl p-6 shadow-sm space-y-5">
                  <div className="flex items-center justify-between border-b border-border pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600">
                        <User className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm text-foreground">Perspective as a Client</h3>
                        <p className="text-[11px] text-muted-foreground">{result.clientPerspective.roleDescription}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 border border-blue-500/20">
                      Client View
                    </span>
                  </div>

                  {/* Client Advantages */}
                  <div className="space-y-2">
                    <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 block">
                      Client Advantages (What benefits you):
                    </span>
                    {result.clientPerspective.advantages.map((item, idx) => (
                      <div key={idx} className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10 text-xs space-y-0.5">
                        <p className="font-semibold text-foreground flex items-center gap-1.5">
                          <Check className="w-3 h-3 text-emerald-500" />
                          {item.title}
                        </p>
                        <p className="text-muted-foreground pl-4 leading-relaxed">{item.explanation}</p>
                      </div>
                    ))}
                  </div>

                  {/* Client Disadvantages */}
                  <div className="space-y-2">
                    <span className="text-xs font-semibold text-rose-700 dark:text-rose-400 block">
                      Client Disadvantages & Risks (What to watch out for):
                    </span>
                    {result.clientPerspective.disadvantages.map((item, idx) => (
                      <div key={idx} className="p-3 rounded-lg bg-rose-500/5 border border-rose-500/10 text-xs space-y-1">
                        <p className="font-semibold text-foreground flex items-center gap-1.5">
                          <AlertTriangle className="w-3 h-3 text-rose-500" />
                          {item.title}
                        </p>
                        <p className="text-muted-foreground pl-4 leading-relaxed">{item.explanation}</p>
                        {item.riskNote && (
                          <div className="ml-4 mt-1 p-2 rounded bg-rose-500/10 text-[11px] text-rose-800 dark:text-rose-300 font-medium">
                            Caution: {item.riskNote}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Client Plain Takeaway */}
                  <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs space-y-1.5">
                    <span className="font-semibold text-blue-700 dark:text-blue-300 flex items-center gap-1.5">
                      <Lightbulb className="w-3.5 h-3.5 text-blue-500" />
                      Client Plain-Language Takeaway:
                    </span>
                    <p className="text-foreground leading-relaxed font-medium">
                      {result.clientPerspective.simpleTakeaway}
                    </p>
                    {showHindi && result.clientPerspective.simpleTakeawayHi && (
                      <p className="text-muted-foreground text-[11px] pt-1 border-t border-blue-500/20">
                        {result.clientPerspective.simpleTakeawayHi}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* AS AN OWNER */}
              {(activeTab === 'all' || activeTab === 'owner') && (
                <div className="bg-card border border-purple-500/20 rounded-2xl p-6 shadow-sm space-y-5">
                  <div className="flex items-center justify-between border-b border-border pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-600">
                        <Building className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm text-foreground">Perspective as an Owner</h3>
                        <p className="text-[11px] text-muted-foreground">{result.ownerPerspective.roleDescription}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-500/10 text-purple-600 border border-purple-500/20">
                      Owner View
                    </span>
                  </div>

                  {/* Owner Advantages */}
                  <div className="space-y-2">
                    <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 block">
                      Owner Advantages & Control Leverage:
                    </span>
                    {result.ownerPerspective.advantages.map((item, idx) => (
                      <div key={idx} className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10 text-xs space-y-0.5">
                        <p className="font-semibold text-foreground flex items-center gap-1.5">
                          <Check className="w-3 h-3 text-emerald-500" />
                          {item.title}
                        </p>
                        <p className="text-muted-foreground pl-4 leading-relaxed">{item.explanation}</p>
                      </div>
                    ))}
                  </div>

                  {/* Owner Disadvantages */}
                  <div className="space-y-2">
                    <span className="text-xs font-semibold text-rose-700 dark:text-rose-400 block">
                      Owner Disadvantages & Exposure Risks:
                    </span>
                    {result.ownerPerspective.disadvantages.map((item, idx) => (
                      <div key={idx} className="p-3 rounded-lg bg-rose-500/5 border border-rose-500/10 text-xs space-y-1">
                        <p className="font-semibold text-foreground flex items-center gap-1.5">
                          <AlertTriangle className="w-3 h-3 text-rose-500" />
                          {item.title}
                        </p>
                        <p className="text-muted-foreground pl-4 leading-relaxed">{item.explanation}</p>
                        {item.riskNote && (
                          <div className="ml-4 mt-1 p-2 rounded bg-rose-500/10 text-[11px] text-rose-800 dark:text-rose-300 font-medium">
                            Caution: {item.riskNote}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Owner Plain Takeaway */}
                  <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs space-y-1.5">
                    <span className="font-semibold text-purple-700 dark:text-purple-300 flex items-center gap-1.5">
                      <Lightbulb className="w-3.5 h-3.5 text-purple-500" />
                      Owner Plain-Language Takeaway:
                    </span>
                    <p className="text-foreground leading-relaxed font-medium">
                      {result.ownerPerspective.simpleTakeaway}
                    </p>
                    {showHindi && result.ownerPerspective.simpleTakeawayHi && (
                      <p className="text-muted-foreground text-[11px] pt-1 border-t border-purple-500/20">
                        {result.ownerPerspective.simpleTakeawayHi}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* SECTION: WHAT WILL IMPROVE (THE OPTIMIZER) */}
          {(activeTab === 'all' || activeTab === 'improvements') && (
            <div className="bg-card border border-amber-500/30 rounded-2xl p-6 md:p-8 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-500 flex items-center justify-center text-white shadow-md shadow-amber-500/20">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-bold text-foreground">
                      What Will Improve: Actionable Upgrades
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Strategic changes, missing evidence, and a legally airtight reformulation of the argument.
                    </p>
                  </div>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30">
                  Strategic Optimization
                </span>
              </div>

              {/* 1. Strategic Improvements */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-amber-500" />
                  Key Strategic Actions to Win This Argument
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {result.whatWillImprove.strategicImprovements.map((imp, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-muted/50 border border-border space-y-2">
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-primary/10 text-primary">
                        {imp.area}
                      </span>
                      <p className="text-xs font-medium text-foreground leading-relaxed">
                        {imp.action}
                      </p>
                      <p className="text-[11px] text-muted-foreground leading-relaxed pt-1 border-t border-border/60">
                        <strong className="text-foreground">Why it helps:</strong> {imp.whyItHelps}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 2. Evidence Checklist */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <FileCheck className="w-3.5 h-3.5 text-blue-500" />
                  Crucial Evidence to Gather & Present
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {result.whatWillImprove.recommendedEvidence.map((ev, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-background border border-border flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                          {ev.item}
                        </p>
                        <p className="text-[11px] text-muted-foreground pl-5">{ev.purpose}</p>
                      </div>
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded flex-shrink-0 ${
                          ev.urgency === 'HIGH'
                            ? 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20'
                            : ev.urgency === 'MEDIUM'
                            ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20'
                            : 'bg-slate-500/10 text-slate-700 dark:text-slate-400 border border-slate-500/20'
                        }`}
                      >
                        {ev.urgency} URGENCY
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3. Stronger Revised Argument (Before vs After) */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Scale className="w-3.5 h-3.5 text-emerald-500" />
                    Watertight Reformed Argument (Before vs. After)
                  </h4>
                  <button
                    onClick={() =>
                      copyToClipboard(
                        result.whatWillImprove.strongerRevisedArgumentEn,
                        'revised-argument'
                      )
                    }
                    className="text-xs text-primary hover:underline flex items-center gap-1 font-medium"
                  >
                    {copiedKey === 'revised-argument' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Copied Revised Stance</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Revised Argument</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Original */}
                  <div className="p-4 rounded-xl bg-muted/40 border border-border text-xs space-y-1.5">
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide block">
                      Original Formulation
                    </span>
                    <p className="text-muted-foreground leading-relaxed italic line-clamp-6">
                      &ldquo;{argumentText}&rdquo;
                    </p>
                  </div>

                  {/* Reformed */}
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs space-y-2 relative">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide">
                        AI-Optimized Legal Formulation
                      </span>
                      <span className="text-[10px] text-emerald-600 bg-emerald-500/20 px-2 py-0.5 rounded font-medium">
                        Watertight
                      </span>
                    </div>
                    <p className="text-foreground leading-relaxed font-serif font-medium">
                      {result.whatWillImprove.strongerRevisedArgumentEn}
                    </p>
                    {showHindi && result.whatWillImprove.strongerRevisedArgumentHi && (
                      <p className="text-[11px] text-muted-foreground pt-2 border-t border-emerald-500/20">
                        {result.whatWillImprove.strongerRevisedArgumentHi}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* 4. Preempting Counter-Arguments */}
              {result.whatWillImprove.keyCounterArgumentsToPrepare.length > 0 && (
                <div className="space-y-2 pt-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-purple-500" />
                    Opposing Counter-Arguments to Anticipate & Deflect
                  </h4>
                  <div className="space-y-2">
                    {result.whatWillImprove.keyCounterArgumentsToPrepare.map((ca, idx) => (
                      <div key={idx} className="p-3 rounded-lg bg-background border border-border text-xs flex items-start gap-2">
                        <ChevronRight className="w-4 h-4 text-purple-500 flex-shrink-0 mt-0.5" />
                        <span className="text-foreground leading-relaxed">{ca}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Disclaimer Footer */}
          <div className="text-center text-[11px] text-muted-foreground pt-4 border-t border-border">
            <p>{result.disclaimer}</p>
          </div>
        </div>
      )}
    </div>
  )
}
