import Link from 'next/link'
import {
  Scale, Sparkles, Shield, Clock, Brain, FileText, CheckCircle2,
  ArrowRight, Users, Calendar, ChevronRight, BarChart3, Lock
} from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-blue-600 selection:text-white">
      {/* Navigation */}
      <nav className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/25">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <span className="font-serif text-xl font-bold tracking-tight text-white">CaseLine</span>
              <span className="text-[10px] ml-1.5 px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-semibold tracking-wide uppercase">AI Legal OS</span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#workflow" className="hover:text-white transition-colors">How it works</a>
            <a href="#security" className="hover:text-white transition-colors">Security</a>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-medium text-slate-200 hover:text-white transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Open Workspace
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-24 pb-20 overflow-hidden">
        {/* Glow gradients */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-gradient-to-tr from-blue-600/20 to-purple-600/20 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-slate-300 text-xs font-medium mb-8 shadow-inner">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Built for Modern Law Firms, Advocates & In-House Legal Counsel</span>
          </div>

          <h1 className="font-serif text-5xl md:text-7xl font-bold tracking-tight text-white leading-[1.1] mb-6">
            The Intelligent Workspace for <br />
            <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
              High-Stakes Legal Matters
            </span>
          </h1>

          <p className="text-lg md:text-xl text-slate-400 max-w-3xl mx-auto mb-10 leading-relaxed font-light">
            Centralize your cases, documents, court hearings, and deadlines. Powered by judicial AI that parses contracts, predicts limitation risks, drafts briefs, and automates administrative burden.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl text-base font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-xl shadow-blue-600/30 transition-all hover:scale-[1.02]"
            >
              Explore Interactive Demo
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/cases"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl text-base font-semibold bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 transition-all"
            >
              View Pipeline
            </Link>
          </div>

          {/* Quick Demo Credentials Banner */}
          <div className="mt-12 p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 max-w-2xl mx-auto text-left text-xs text-slate-400 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-blue-400" />
              <span>Instant Test Login: <strong className="text-white">admin@caseline.in</strong> / <strong className="text-white">caseline123</strong></span>
            </div>
            <Link href="/login" className="text-blue-400 hover:underline font-semibold flex items-center gap-1">
              Quick Sign In <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section id="features" className="py-20 bg-slate-900/50 border-t border-slate-800/60">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-white mb-4">
              Designed from the Ground Up for Legal Workflows
            </h2>
            <p className="text-slate-400 text-base">
              Say goodbye to fragmented paper briefs, lost court dates, and billing chaos.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-blue-500/40 transition-all">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-5 border border-blue-500/20">
                <Brain className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Smart Case Intake</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Upload case filings or notices. AI automatically extracts parties, opposing counsels, claim value, court benches, and procedural timeline.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/40 transition-all">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-5 border border-amber-500/20">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Deadline Guardian</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Rules-based limitation calculator and hearing tracker. Proactively flags limitation lapses, written argument deadlines, and pending compliances.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-purple-500/40 transition-all">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-5 border border-purple-500/20">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Ask the Case (RAG)</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Chat with your entire dossier. Ask complex factual or evidentiary questions with page-exact citations across hundreds of discovery pages.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-indigo-500/40 transition-all">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-5 border border-indigo-500/20">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Court Hearing Sync</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Calendar designed specifically for High Courts, District Courts, and Tribunals (NCLT, DRT) with daily cause list alerts.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-emerald-500/40 transition-all">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-5 border border-emerald-500/20">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Workload Balancer</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Monitor team capacity across Partners, Associates, and Paralegals to ensure equitable distribution and eliminate attorney burnout.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-sky-500/40 transition-all">
              <div className="w-12 h-12 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center mb-5 border border-sky-500/20">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Time & LEDES Billing</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Convert billable court hours and drafting time directly into client invoices with GST compliance and automated tracking.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-12 text-center text-xs text-slate-500">
        <p>© 2026 CaseLine Legal Technologies. Built for HackIndia.</p>
      </footer>
    </div>
  )
}
