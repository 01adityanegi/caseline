'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  ChevronLeft, ChevronRight, Download, Maximize2, Scale, Sparkles,
  ShieldAlert, Clock, Brain, Users, BarChart3, CheckCircle2, ArrowRight,
  Check, X, AlertTriangle
} from 'lucide-react'

const SLIDES = [
  {
    id: 1,
    tag: 'HACKINDIA 2026 | PROBLEM STATEMENT PS-01',
    title: 'CaseLine',
    subtitle: 'The Autonomous AI Legal OS for High-Stakes Litigation',
    content: (
      <div className="space-y-8 max-w-4xl">
        <p className="text-xl md:text-2xl text-slate-300 font-light leading-relaxed">
          Transforming fragmented paper files, missed court limitation deadlines, and manual administrative chaos into a unified, cited, high-velocity legal workspace.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-blue-500/30">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-3">
              <Brain className="w-5 h-5" />
            </div>
            <h4 className="font-semibold text-white text-base">Ask the Case (RAG)</h4>
            <p className="text-xs text-slate-400 mt-1">Grounded analysis with verbatim clause & page citations</p>
          </div>
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-amber-500/30">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-3">
              <Clock className="w-5 h-5" />
            </div>
            <h4 className="font-semibold text-white text-base">Deadline Guardian</h4>
            <p className="text-xs text-slate-400 mt-1">Limitation Act compliance & statutory risk scoring (0-100%)</p>
          </div>
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-emerald-500/30">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-3">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <h4 className="font-semibold text-white text-base">Conflict Clearance</h4>
            <p className="text-xs text-slate-400 mt-1">Real-time warning when opposing parties match existing clients</p>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 2,
    tag: 'THE PROBLEM STATEMENT',
    title: 'The Crisis in Litigation Management',
    subtitle: 'Lawyers spend 35% of every billable day on administrative overhead, not law',
    content: (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl">
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-red-500/30 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-red-400 font-bold text-xs uppercase tracking-wider">Fatal Risk #1</span>
            <span className="text-red-400 font-mono text-sm font-bold">Irreversible</span>
          </div>
          <h3 className="text-xl font-bold text-white">Statutory Limitation Lapses</h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            Deadlines currently live in spreadsheets and paper diaries. A single missed filing date or limitation expiry under the Limitation Act results in immediate and irreversible case dismissal.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900/80 border border-amber-500/30 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-amber-400 font-bold text-xs uppercase tracking-wider">Operational Drag #2</span>
            <span className="text-amber-400 font-mono text-sm font-bold">100s of Pages</span>
          </div>
          <h3 className="text-xl font-bold text-white">Document & Evidence Fragmentation</h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            Case files are scattered across emails, paper briefs, WhatsApp chats, and court registries. Finding the right clause or historical order during trial takes hours of manual frantic searching.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900/80 border border-purple-500/30 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-purple-400 font-bold text-xs uppercase tracking-wider">Ethical Hazard #3</span>
            <span className="text-purple-400 font-mono text-sm font-bold">Severe Liability</span>
          </div>
          <h3 className="text-xl font-bold text-white">Unchecked Conflicts of Interest</h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            Law firms frequently take on matters against existing clients because there is no automated system cross-referencing opposing counsels and parties during urgent late-night intake.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900/80 border border-blue-500/30 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-blue-400 font-bold text-xs uppercase tracking-wider">Revenue Leakage #4</span>
            <span className="text-blue-400 font-mono text-sm font-bold">20% Unbilled</span>
          </div>
          <h3 className="text-xl font-bold text-white">Billing & Drafting Chaos</h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            Court appearances and drafting time are logged days or weeks late. Manual invoice generation causes client payment friction and severe associate burnout.
          </p>
        </div>
      </div>
    )
  },
  {
    id: 3,
    tag: 'THE SOLUTION',
    title: 'CaseLine: Unified Legal Intelligence',
    subtitle: 'Centralizing every matter into a single, proactive AI workspace',
    content: (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl">
        <div className="p-6 rounded-2xl bg-slate-900/90 border border-blue-500/40 space-y-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold text-lg">
            1
          </div>
          <h3 className="text-lg font-bold text-white">Unified Case Dossier</h3>
          <ul className="space-y-2 text-xs text-slate-300 leading-relaxed">
            <li className="flex items-start gap-2"><Check className="w-3.5 h-3.5 text-blue-400 mt-0.5 shrink-0" /> Auto-indexing of petitions, notices & orders</li>
            <li className="flex items-start gap-2"><Check className="w-3.5 h-3.5 text-blue-400 mt-0.5 shrink-0" /> Multi-document OCR & semantic vector chunking</li>
            <li className="flex items-start gap-2"><Check className="w-3.5 h-3.5 text-blue-400 mt-0.5 shrink-0" /> Complete historical audit log and version trail</li>
          </ul>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900/90 border border-amber-500/40 space-y-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold text-lg">
            2
          </div>
          <h3 className="text-lg font-bold text-white">Judicial AI Copilot</h3>
          <ul className="space-y-2 text-xs text-slate-300 leading-relaxed">
            <li className="flex items-start gap-2"><Check className="w-3.5 h-3.5 text-amber-400 mt-0.5 shrink-0" /> Ask the Case: Exact page & clause citations</li>
            <li className="flex items-start gap-2"><Check className="w-3.5 h-3.5 text-amber-400 mt-0.5 shrink-0" /> Hearing preparation briefs for arguing counsel</li>
            <li className="flex items-start gap-2"><Check className="w-3.5 h-3.5 text-amber-400 mt-0.5 shrink-0" /> Plain-language client updates generated in 1 click</li>
          </ul>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900/90 border border-emerald-500/40 space-y-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-lg">
            3
          </div>
          <h3 className="text-lg font-bold text-white">Operations & Governance</h3>
          <ul className="space-y-2 text-xs text-slate-300 leading-relaxed">
            <li className="flex items-start gap-2"><Check className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" /> Real-time conflict clearance check on keystroke</li>
            <li className="flex items-start gap-2"><Check className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" /> Team workload balancer eliminating burnout</li>
            <li className="flex items-start gap-2"><Check className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" /> LEDES-compliant time logs & GST invoices</li>
          </ul>
        </div>
      </div>
    )
  },
  {
    id: 4,
    tag: 'SYSTEM ARCHITECTURE',
    title: 'Full-Stack Architecture & Engineering',
    subtitle: 'Enterprise-grade speed, offline resilience, and strict RBAC security',
    content: (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-6xl">
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
          <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">Frontend Layer</span>
          <h4 className="text-base font-bold text-white">Next.js 16 + React 19</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Sub-second Turbopack compilation, Server Components, client-side optimistic UI, and curated design system.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Data Persistence</span>
          <h4 className="text-base font-bold text-white">SQLite + Prisma ORM</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            17 comprehensive relational models covering users, cases, chunks, hearings, deadlines, invoices, and audit trails.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
          <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">AI Service Layer</span>
          <h4 className="text-base font-bold text-white">Google Gemini 1.5</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Multimodal OCR extraction, structured JSON outputs, grounded RAG prompts, and seamless fallback mocks.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
          <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">Access Security</span>
          <h4 className="text-base font-bold text-white">NextAuth v5 + RBAC</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            5 hierarchical role tiers (Admin, Partner, Associate, Paralegal, Client) ensuring ethical privilege & confidentiality.
          </p>
        </div>
      </div>
    )
  },
  {
    id: 5,
    tag: 'MARKET & ROI',
    title: 'Market Opportunity & Economic Impact',
    subtitle: 'Serving 1.7 million registered advocates and 70,000+ law firms in India',
    content: (
      <div className="space-y-6 max-w-5xl">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 text-center">
            <p className="font-mono text-3xl font-bold text-blue-400">1.7M+</p>
            <p className="text-xs text-slate-400 mt-1 font-medium">Advocates in India</p>
          </div>
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 text-center">
            <p className="font-mono text-3xl font-bold text-emerald-400">80%</p>
            <p className="text-xs text-slate-400 mt-1 font-medium">Faster Intake Time</p>
          </div>
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 text-center">
            <p className="font-mono text-3xl font-bold text-amber-400">0</p>
            <p className="text-xs text-slate-400 mt-1 font-medium">Missed Limitations</p>
          </div>
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 text-center">
            <p className="font-mono text-3xl font-bold text-purple-400">₹12L+</p>
            <p className="text-xs text-slate-400 mt-1 font-medium">Annual Recovery/Advocate</p>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 text-sm text-slate-300 leading-relaxed">
          <strong className="text-white">Why Law Firms Pay for CaseLine:</strong> Law firm economics depend on billable realization and avoiding procedural negligence. By automating intake extraction, preventing limitation defaults, and capturing every minute of court drafting, CaseLine pays for itself within the first 14 days of adoption.
        </div>
      </div>
    )
  },
  {
    id: 6,
    tag: 'COMPETITIVE MOAT',
    title: 'Why CaseLine Wins Against Incumbents',
    subtitle: 'Legacy software is a glorified database; generic AI hallucinates without case context',
    content: (
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 overflow-hidden max-w-5xl">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider border-b border-slate-800">
            <tr>
              <th className="py-3.5 px-4">Dimension</th>
              <th className="py-3.5 px-4">Legacy Practice Tools (Clio)</th>
              <th className="py-3.5 px-4">Generic LLMs (ChatGPT)</th>
              <th className="py-3.5 px-4 text-blue-400 font-bold">CaseLine</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            <tr>
              <td className="py-3.5 px-4 font-semibold text-white">Dossier RAG with Citations</td>
              <td className="py-3.5 px-4 text-slate-400 flex items-center gap-1.5"><X className="w-4 h-4 text-rose-500" /> None (manual file browsing)</td>
              <td className="py-3.5 px-4 text-amber-400"><span className="inline-flex items-center gap-1.5"><AlertTriangle className="w-4 h-4 text-amber-500" /> Hallucinates clauses</span></td>
              <td className="py-3.5 px-4 text-emerald-400 font-bold"><span className="inline-flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Page-exact citations</span></td>
            </tr>
            <tr>
              <td className="py-3.5 px-4 font-semibold text-white">Court Limitation Guardian</td>
              <td className="py-3.5 px-4 text-slate-400"><span className="inline-flex items-center gap-1.5"><X className="w-4 h-4 text-rose-500" /> Manual date entry only</span></td>
              <td className="py-3.5 px-4 text-slate-400"><span className="inline-flex items-center gap-1.5"><X className="w-4 h-4 text-rose-500" /> No case calendar context</span></td>
              <td className="py-3.5 px-4 text-emerald-400 font-bold"><span className="inline-flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Auto-rules calculation (0-100%)</span></td>
            </tr>
            <tr>
              <td className="py-3.5 px-4 font-semibold text-white">Live Conflict Clearance</td>
              <td className="py-3.5 px-4 text-amber-400"><span className="inline-flex items-center gap-1.5"><AlertTriangle className="w-4 h-4 text-amber-500" /> Slow manual query</span></td>
              <td className="py-3.5 px-4 text-slate-400"><span className="inline-flex items-center gap-1.5"><X className="w-4 h-4 text-rose-500" /> Zero firm client awareness</span></td>
              <td className="py-3.5 px-4 text-emerald-400 font-bold"><span className="inline-flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Real-time warning on input</span></td>
            </tr>
            <tr>
              <td className="py-3.5 px-4 font-semibold text-white">Client Privilege & Security</td>
              <td className="py-3.5 px-4 text-slate-400"><span className="inline-flex items-center gap-1.5"><AlertTriangle className="w-4 h-4 text-amber-500" /> Basic permissions</span></td>
              <td className="py-3.5 px-4 text-red-400"><span className="inline-flex items-center gap-1.5"><X className="w-4 h-4 text-rose-500" /> Data leakage to public LLMs</span></td>
              <td className="py-3.5 px-4 text-emerald-400 font-bold"><span className="inline-flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> 5-tier NextAuth RBAC</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    )
  },
  {
    id: 7,
    tag: 'EVALUATION & DEMO',
    title: 'Experience CaseLine Live',
    subtitle: 'Seeded with realistic litigation matters ready for judge evaluation',
    content: (
      <div className="space-y-6 max-w-4xl">
        <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-900/40 to-indigo-900/40 border border-blue-500/30 space-y-4">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            Live Demo Access Details
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-slate-400 block">Senior Partner:</span>
              <strong className="text-white block mt-1">admin@caseline.in</strong>
              <span className="text-slate-500 font-mono">caseline123</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-slate-400 block">Litigation Associate:</span>
              <strong className="text-white block mt-1">sanjeev@caseline.in</strong>
              <span className="text-slate-500 font-mono">caseline123</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-slate-400 block">Corporate Client:</span>
              <strong className="text-white block mt-1">client@caseline.in</strong>
              <span className="text-slate-500 font-mono">caseline123</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm shadow-lg shadow-blue-600/30 transition-all hover:scale-[1.02]"
          >
            Launch CaseLine App <ArrowRight className="w-4 h-4" />
          </Link>
          <a
            href="/CaseLine_Pitch_Deck.pptx"
            download
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 font-semibold text-sm transition-all"
          >
            <Download className="w-4 h-4 text-amber-400" />
            Download PowerPoint (.pptx)
          </a>
        </div>
      </div>
    )
  }
]

export default function PresentationPage() {
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        setCurrentSlide(prev => Math.min(SLIDES.length - 1, prev + 1))
      } else if (e.key === 'ArrowLeft') {
        setCurrentSlide(prev => Math.max(0, prev - 1))
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const slide = SLIDES[currentSlide]

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between selection:bg-blue-600 selection:text-white">
      {/* Top Bar */}
      <header className="h-16 border-b border-slate-800 px-6 flex items-center justify-between bg-slate-950/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
            <Scale className="w-4 h-4 text-blue-400" />
            <span className="font-serif font-bold text-white">CaseLine</span>
            <span className="text-xs bg-slate-900 border border-slate-800 px-2 py-0.5 rounded text-slate-400 font-mono">
              PITCH DECK
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-slate-400">
            Slide {currentSlide + 1} of {SLIDES.length}
          </span>
          <a
            href="/CaseLine_Pitch_Deck.pptx"
            download
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30 hover:bg-blue-600/30 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Download .PPTX
          </a>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-900 text-slate-300 border border-slate-800 hover:bg-slate-800 transition-colors"
          >
            Open App
          </Link>
        </div>
      </header>

      {/* Main Slide Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-8 py-12 flex flex-col justify-center">
        <div className="space-y-3 mb-6">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-amber-400">
            {slide.tag}
          </span>
          <h1 className="font-serif text-3xl md:text-5xl font-bold tracking-tight text-white leading-tight">
            {slide.title}
          </h1>
          <p className="text-base md:text-lg text-slate-400 font-light">
            {slide.subtitle}
          </p>
        </div>

        <div className="mt-4">
          {slide.content}
        </div>
      </main>

      {/* Bottom Controls */}
      <footer className="h-16 border-t border-slate-800 px-8 flex items-center justify-between bg-slate-950/80">
        <div className="flex items-center gap-2">
          {SLIDES.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => setCurrentSlide(idx)}
              className={`h-1.5 rounded-full transition-all ${
                idx === currentSlide ? 'w-8 bg-blue-500' : 'w-2 bg-slate-800 hover:bg-slate-700'
              }`}
              title={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500 hidden sm:inline">Use arrow keys (← / →) to navigate</span>
          <button
            onClick={() => setCurrentSlide(prev => Math.max(0, prev - 1))}
            disabled={currentSlide === 0}
            className="p-2 rounded-lg border border-slate-800 hover:bg-slate-900 disabled:opacity-30 disabled:pointer-events-none transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-slate-300" />
          </button>
          <button
            onClick={() => setCurrentSlide(prev => Math.min(SLIDES.length - 1, prev + 1))}
            disabled={currentSlide === SLIDES.length - 1}
            className="p-2 rounded-lg border border-slate-800 hover:bg-slate-900 disabled:opacity-30 disabled:pointer-events-none transition-colors"
          >
            <ChevronRight className="w-4 h-4 text-slate-300" />
          </button>
        </div>
      </footer>
    </div>
  )
}
