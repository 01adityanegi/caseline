'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Scale, Eye, EyeOff, Sparkles, ShieldCheck, Zap,
  CheckCircle2, ArrowRight, Building2, Users, FileText,
  Clock, AlertTriangle, Lock, Award, Briefcase, Phone
} from 'lucide-react'

const DEMO_USERS = [
  { role: 'Admin', name: 'Rajesh Sharma', email: 'admin@caseline.in', password: 'caseline123', color: 'bg-red-500', badge: 'Chamber Head' },
  { role: 'Partner', name: 'Arjun Verma', email: 'arjun@caseline.in', password: 'caseline123', color: 'bg-blue-600', badge: 'Senior Litigator' },
  { role: 'Partner', name: 'Priya Mehta', email: 'priya@caseline.in', password: 'caseline123', color: 'bg-purple-600', badge: 'Corporate Head' },
  { role: 'Associate', name: 'Sanjeev Iyer', email: 'sanjeev@caseline.in', password: 'caseline123', color: 'bg-emerald-600', badge: 'Civil Litigator' },
  { role: 'Associate', name: 'Nisha Gupta', email: 'nisha@caseline.in', password: 'caseline123', color: 'bg-teal-600', badge: 'IP & Contracts' },
  { role: 'Paralegal', name: 'Rahul Joshi', email: 'rahul@caseline.in', password: 'caseline123', color: 'bg-amber-500', badge: 'Court Filing' },
  { role: 'Client', name: 'Rajesh Agarwal', email: 'client@caseline.in', password: 'caseline123', color: 'bg-slate-600', badge: 'Enterprise Client' },
]

const PROBLEMS_SOLVED = [
  {
    id: 'backlog',
    tag: 'Judicial Backlog',
    problem: '4.4 Crore Pending Indian Court Cases & 50-Page Petitions',
    problemDetail: 'Litigators waste 14+ hours weekly sifting through unindexed court scans, finding annexures, and piecing together prior orders.',
    solution: 'AI Smart Intake extracts parties, limitation dates, judge bench, and prayer clauses in 8 seconds with source-page citations.',
    stat: '8.4 hrs/week saved',
    icon: FileText,
  },
  {
    id: 'deadlines',
    tag: 'Limitation Act 1963',
    problem: 'Fatal Dismissals Due to Missed Filing Deadlines',
    problemDetail: 'Under Section 5 of the Limitation Act, a single day of unexcused delay can permanently extinguish an appeal or review.',
    solution: 'Deadline Guardian synchronizes daily cause lists, computes statutory limitation periods, and dispatches automated WhatsApp/email alerts.',
    stat: '99.4% on-time filing',
    icon: Clock,
  },
  {
    id: 'agreements',
    tag: 'Contract Ambiguity',
    problem: 'Defective Agreements, Unclear Clauses & Omitted Protections',
    problemDetail: 'Over 82% of commercial & rental disputes stem from vague deposit refunds, missing lock-in periods, or omitted arbitration seats.',
    solution: 'AgreementStudio drafts legally sound bilingual (Hindi + English) contracts, identifies missing details, and executes Section 65B IT Act e-signatures.',
    stat: '100% IT Act compliance',
    icon: Scale,
  },
  {
    id: 'leakage',
    tag: 'Billing & Client Anxiety',
    problem: 'Unbilled Drafting Hours & Client WhatsApp Floods',
    problemDetail: 'Independent advocates lose ₹18–25 Lakhs annually in unlogged drafting work while anxious clients constantly call "aaj court me kya hua?".',
    solution: 'Client Portal offers real-time hearing stage feeds while automated time-tracking logs billable work directly into GST-ready invoices.',
    stat: '₹38L+ recovered/firm',
    icon: Briefcase,
  },
]

export default function LoginPage() {
  const router = useRouter()
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin')

  // Sign In State
  const [signInEmail, setSignInEmail] = useState('')
  const [signInPassword, setSignInPassword] = useState('')
  const [showSignInPassword, setShowSignInPassword] = useState(false)
  const [signInLoading, setSignInLoading] = useState(false)
  const [signInError, setSignInError] = useState('')

  // Sign Up State
  const [signUpName, setSignUpName] = useState('')
  const [signUpFirmName, setSignUpFirmName] = useState('')
  const [signUpEmail, setSignUpEmail] = useState('')
  const [signUpPassword, setSignUpPassword] = useState('')
  const [showSignUpPassword, setShowSignUpPassword] = useState(false)
  const [signUpRole, setSignUpRole] = useState<'PARTNER' | 'ASSOCIATE' | 'ADMIN' | 'CLIENT'>('PARTNER')
  const [signUpPhone, setSignUpPhone] = useState('')
  const [agreeTerms, setAgreeTerms] = useState(true)
  const [signUpLoading, setSignUpLoading] = useState(false)
  const [signUpError, setSignUpError] = useState('')
  const [signUpSuccess, setSignUpSuccess] = useState('')

  // Problem tab selector for interactive showcase
  const [activeProblemIdx, setActiveProblemIdx] = useState(0)

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setSignInLoading(true)
    setSignInError('')

    try {
      const result = await signIn('credentials', {
        email: signInEmail.trim(),
        password: signInPassword,
        redirect: false,
      })

      if (result?.error) {
        setSignInError('Invalid credentials. Please verify your email and password.')
      } else {
        router.push('/dashboard')
        router.refresh()
      }
    } catch {
      setSignInError('An unexpected network error occurred. Please try again.')
    } finally {
      setSignInLoading(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!agreeTerms) {
      setSignUpError('Please confirm agreement to CaseLine Terms and IT Act 2000 data compliance.')
      return
    }

    setSignUpLoading(true)
    setSignUpError('')
    setSignUpSuccess('')

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: signUpName.trim(),
          firmName: signUpFirmName.trim(),
          email: signUpEmail.trim(),
          password: signUpPassword,
          role: signUpRole,
          phone: signUpPhone.trim() || undefined,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setSignUpError(data.error || 'Failed to create account. Please try again.')
        setSignUpLoading(false)
        return
      }

      setSignUpSuccess('Workspace created! Logging you in automatically...')

      // Auto sign-in
      const signInResult = await signIn('credentials', {
        email: signUpEmail.trim(),
        password: signUpPassword,
        redirect: false,
      })

      if (signInResult?.ok) {
        router.push('/dashboard')
        router.refresh()
      } else {
        // Fallback to signin tab with filled email
        setSignInEmail(signUpEmail)
        setSignInPassword(signUpPassword)
        setAuthMode('signin')
        setSignInError('Account created! Please sign in with your credentials.')
      }
    } catch (err: any) {
      setSignUpError(err?.message || 'Network error occurred during registration.')
    } finally {
      setSignUpLoading(false)
    }
  }

  const quickFill = (user: typeof DEMO_USERS[0]) => {
    setAuthMode('signin')
    setSignInEmail(user.email)
    setSignInPassword(user.password)
    setSignInError('')
  }

  return (
    <div className="min-h-screen text-slate-100 flex flex-col justify-between" style={{ background: 'linear-gradient(135deg, #071224 0%, #0c1c38 50%, #071224 100%)' }}>
      {/* Top Navigation Bar */}
      <header className="w-full border-b border-white/10 px-6 py-4 flex items-center justify-between backdrop-blur-md bg-black/20 sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/40" style={{ background: 'linear-gradient(135deg, #1F4FD8 0%, #173eb3 100%)' }}>
            <Scale className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight text-white font-sans">CaseLine</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                AI Legal OS
              </span>
            </div>
            <p className="text-[11px] text-white/50 hidden sm:block">Indian Case Management & Bilingual Agreement Studio</p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="hidden md:flex items-center gap-2 text-white/60 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>e-Courts Services API Active</span>
          </div>
          <Link
            href="/pitch"
            className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white font-medium transition-all flex items-center gap-1.5 shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Hackathon Pitch Deck</span>
          </Link>
        </div>
      </header>

      {/* Main Content: Split Showcase & Authentication */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* Left Column: Real Problems, Real Data & Solution Showcase (Span 7) */}
        <div className="lg:col-span-7 space-y-6 lg:pr-4">
          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold">
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <span>Built Specifically for Indian Law Chambers, Courts & Litigants</span>
          </div>

          {/* Headline */}
          <div className="space-y-3">
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-light text-white leading-tight tracking-tight">
              The intelligent{' '}
              <span className="font-normal italic" style={{ color: '#E5B869' }}>
                legal workspace
              </span>
              <br />
              that solves real court chaos.
            </h1>
            <p className="text-sm sm:text-base text-white/70 leading-relaxed max-w-2xl font-sans">
              Indian courts face a <span className="text-white font-semibold underline decoration-amber-400/60">4.4 Crore case backlog</span>.
              CaseLine replaces disorganized spreadsheets and paper files with AI-powered document intake,
              bilingual Hindi-English contract drafting, statutory limitation clocks, and secure client communication.
            </p>
          </div>

          {/* Hard Legal Problems We Solve (Interactive Tabbed Cards) */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-white/60 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                Key Indian Legal Problems Addressed:
              </span>
              <span className="text-[11px] text-white/40">Select a problem to inspect solution</span>
            </div>

            {/* Problem Navigation Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1 bg-white/5 rounded-xl border border-white/10">
              {PROBLEMS_SOLVED.map((item, idx) => (
                <button
                  key={item.id}
                  onClick={() => setActiveProblemIdx(idx)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all text-center truncate ${
                    activeProblemIdx === idx
                      ? 'bg-blue-600 text-white shadow-sm font-semibold'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {item.tag}
                </button>
              ))}
            </div>

            {/* Active Problem / Solution Spotlight Card */}
            {(() => {
              const active = PROBLEMS_SOLVED[activeProblemIdx]
              const Icon = active.icon
              return (
                <div className="p-5 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-md space-y-4 relative overflow-hidden transition-all animate-fade-in">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300">
                          Problem: {active.tag}
                        </span>
                        <h4 className="text-sm font-bold text-white mt-0.5 leading-snug">
                          {active.problem}
                        </h4>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-[11px] font-bold shrink-0">
                      {active.stat}
                    </span>
                  </div>

                  <p className="text-xs text-white/60 leading-relaxed pl-1 border-l-2 border-red-500/40">
                    <strong className="text-white/80">Pain Point:</strong> {active.problemDetail}
                  </p>

                  <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-100 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-blue-300 text-xs">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                      <span>CaseLine AI Solution</span>
                    </div>
                    <p className="text-white/80 leading-relaxed text-[11px]">
                      {active.solution}
                    </p>
                  </div>
                </div>
              )
            })()}
          </div>

          {/* Real Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            {[
              { value: '4.4 Cr+', label: 'Pending Cases Addressed', sub: 'National Backlog' },
              { value: '8.4 Hrs', label: 'Saved / Litigator / Wk', sub: 'Admin Time Eliminated' },
              { value: '8 Sec', label: 'AI Document Parsing', sub: 'Limitation Extraction' },
              { value: 'Sec 65B', label: 'IT Act E-Signatures', sub: 'Evidentiary Validity' },
            ].map((stat, i) => (
              <div key={i} className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 space-y-0.5">
                <div className="text-xl font-bold font-mono text-white tracking-tight" style={{ color: '#E5B869' }}>
                  {stat.value}
                </div>
                <div className="text-xs font-semibold text-white/90">{stat.label}</div>
                <div className="text-[10px] text-white/50">{stat.sub}</div>
              </div>
            ))}
          </div>

          {/* Litigator Endorsement */}
          <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-600/30 border border-blue-500/30 flex items-center justify-center font-bold text-white text-xs shrink-0">
              AS
            </div>
            <div className="text-xs text-white/70">
              <p className="italic">
                &ldquo;CaseLine replaced 4 separate tools for cause lists, bilingual deeds, and client briefs. Our chambers recovered ₹38 Lakhs in previously unbilled drafting hours.&rdquo;
              </p>
              <span className="font-semibold text-white mt-1 block text-[11px]">
                Adv. Arjun Sharma &mdash; Senior Litigator, High Court of Delhi
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Tabbed Sign In / Sign Up Form (Span 5) */}
        <div className="lg:col-span-5 w-full">
          <div className="bg-card text-foreground rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/20 bg-white dark:bg-slate-900 backdrop-blur-xl relative">
            {/* Form Mode Selector: Sign In vs Sign Up */}
            <div className="flex p-1 bg-muted rounded-2xl mb-6 border border-border">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('signin')
                  setSignInError('')
                }}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                  authMode === 'signin'
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('signup')
                  setSignUpError('')
                }}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                  authMode === 'signup'
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Create Firm Account
              </button>
            </div>

            {/* TAB 1: SIGN IN */}
            {authMode === 'signin' && (
              <div className="space-y-5 animate-fade-in">
                <div>
                  <h2 className="text-xl font-bold text-foreground">Sign in to CaseLine</h2>
                  <p className="text-muted-foreground text-xs mt-0.5">
                    Enter your credentials to access your firm&apos;s workspace
                  </p>
                </div>

                {signInError && (
                  <div className="p-3 rounded-xl text-xs bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{signInError}</span>
                  </div>
                )}

                <form onSubmit={handleSignIn} className="space-y-4 text-xs">
                  <div>
                    <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
                      Email address
                    </label>
                    <input
                      type="email"
                      value={signInEmail}
                      onChange={e => setSignInEmail(e.target.value)}
                      required
                      placeholder="you@firmname.in"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-foreground text-xs focus:ring-2 focus:ring-primary focus:outline-none transition-all"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={() => alert('For demo, select any demo account below to auto-fill (password: caseline123)')}
                        className="text-[11px] text-primary hover:underline"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type={showSignInPassword ? 'text' : 'password'}
                        value={signInPassword}
                        onChange={e => setSignInPassword(e.target.value)}
                        required
                        placeholder="Enter password"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-foreground text-xs focus:ring-2 focus:ring-primary focus:outline-none pr-10 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowSignInPassword(!showSignInPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showSignInPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={signInLoading}
                    className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-xs transition-all shadow-md active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {signInLoading ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Verifying Credentials...</span>
                      </>
                    ) : (
                      <>
                        <span>Sign In to Workspace</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </form>

                {/* Instant Demo Accounts Picker */}
                <div className="pt-4 border-t border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      One-Click Demo Roles (Auto-Fill & Sign In)
                    </span>
                  </div>
                  <div className="grid grid-cols-4 sm:grid-cols-4 gap-1.5">
                    {DEMO_USERS.map(user => (
                      <button
                        key={user.email}
                        type="button"
                        onClick={() => quickFill(user)}
                        className="p-2 rounded-xl border border-border hover:border-primary/50 hover:bg-muted transition-all text-center group flex flex-col items-center gap-1"
                        title={`${user.name} (${user.badge})`}
                      >
                        <div className={`w-6 h-6 rounded-full ${user.color} flex items-center justify-center text-white text-[10px] font-bold shadow-sm`}>
                          {user.role[0]}
                        </div>
                        <span className="text-[11px] font-semibold text-foreground group-hover:text-primary leading-tight">
                          {user.role}
                        </span>
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] text-muted-foreground text-center mt-2">
                    Click any role above to load credentials (password: <code className="font-mono text-primary font-bold">caseline123</code>)
                  </p>
                </div>
              </div>
            )}

            {/* TAB 2: SIGN UP / CREATE FIRM */}
            {authMode === 'signup' && (
              <div className="space-y-4 animate-fade-in">
                <div>
                  <h2 className="text-xl font-bold text-foreground">Create Firm Workspace</h2>
                  <p className="text-muted-foreground text-xs mt-0.5">
                    Set up your law chamber, legal department, or client account
                  </p>
                </div>

                {signUpError && (
                  <div className="p-3 rounded-xl text-xs bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{signUpError}</span>
                  </div>
                )}

                {signUpSuccess && (
                  <div className="p-3 rounded-xl text-xs bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{signUpSuccess}</span>
                  </div>
                )}

                <form onSubmit={handleSignUp} className="space-y-3.5 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                        Full Legal Name
                      </label>
                      <input
                        type="text"
                        value={signUpName}
                        onChange={e => setSignUpName(e.target.value)}
                        required
                        placeholder="Adv. Vikram Sethi"
                        className="w-full px-3 py-2 rounded-xl border border-input bg-background text-foreground text-xs focus:ring-1 focus:ring-primary focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                        Firm / Chamber Name
                      </label>
                      <input
                        type="text"
                        value={signUpFirmName}
                        onChange={e => setSignUpFirmName(e.target.value)}
                        required
                        placeholder="Sethi & Associates"
                        className="w-full px-3 py-2 rounded-xl border border-input bg-background text-foreground text-xs focus:ring-1 focus:ring-primary focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={signUpEmail}
                        onChange={e => setSignUpEmail(e.target.value)}
                        required
                        placeholder="vikram@sethilaw.in"
                        className="w-full px-3 py-2 rounded-xl border border-input bg-background text-foreground text-xs focus:ring-1 focus:ring-primary focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                        Phone (WhatsApp alerts)
                      </label>
                      <input
                        type="tel"
                        value={signUpPhone}
                        onChange={e => setSignUpPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full px-3 py-2 rounded-xl border border-input bg-background text-foreground text-xs focus:ring-1 focus:ring-primary focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                      Account Practice Role
                    </label>
                    <select
                      value={signUpRole}
                      onChange={e => setSignUpRole(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl border border-input bg-background text-foreground text-xs focus:ring-1 focus:ring-primary focus:outline-none"
                    >
                      <option value="PARTNER">Managing Partner / Senior Litigator</option>
                      <option value="ASSOCIATE">Associate Advocate</option>
                      <option value="ADMIN">Firm Operations / In-House Counsel</option>
                      <option value="CLIENT">Corporate / Individual Client</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                      Create Password
                    </label>
                    <div className="relative">
                      <input
                        type={showSignUpPassword ? 'text' : 'password'}
                        value={signUpPassword}
                        onChange={e => setSignUpPassword(e.target.value)}
                        required
                        minLength={6}
                        placeholder="Minimum 6 characters"
                        className="w-full px-3 py-2 rounded-xl border border-input bg-background text-foreground text-xs focus:ring-1 focus:ring-primary focus:outline-none pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showSignUpPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* IT Act Consent */}
                  <label className="flex items-start gap-2 pt-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={agreeTerms}
                      onChange={e => setAgreeTerms(e.target.checked)}
                      className="mt-0.5 rounded border-input text-primary focus:ring-primary"
                    />
                    <span className="text-[11px] text-muted-foreground leading-snug">
                      I agree to CaseLine Terms and consent to digital legal record processing under the Indian Information Technology Act 2000.
                    </span>
                  </label>

                  <button
                    type="submit"
                    disabled={signUpLoading || !agreeTerms}
                    className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-xs transition-all shadow-md active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {signUpLoading ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Provisioning Workspace...</span>
                      </>
                    ) : (
                      <>
                        <span>Create Firm Workspace & Start</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </form>

                <p className="text-[11px] text-muted-foreground text-center pt-2">
                  Already registered?{' '}
                  <button
                    onClick={() => setAuthMode('signin')}
                    className="text-primary font-semibold hover:underline"
                  >
                    Sign in here
                  </button>
                </p>
              </div>
            )}

            {/* Bottom Security Assurance */}
            <div className="mt-6 pt-4 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-emerald-500" />
                256-Bit SSL Encryption
              </span>
              <span>Data Residency: Mumbai, India</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-white/10 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/50 backdrop-blur-sm bg-black/30">
        <div className="flex items-center gap-4">
          <span>&copy; {new Date().getFullYear()} CaseLine Legal Tech India Pvt. Ltd.</span>
          <span className="hidden sm:inline">&bull;</span>
          <span className="hidden sm:inline">Section 65B &amp; IT Act 2000 Compliant</span>
        </div>
        <div className="flex items-center gap-4 text-[11px]">
          <Link href="/agreements/templates" className="hover:text-white transition-colors">
            Agreement Templates
          </Link>
          <Link href="/pitch" className="hover:text-white transition-colors">
            Hackathon Slide Deck
          </Link>
          <Link href="/dashboard" className="text-blue-400 hover:text-blue-300 font-semibold transition-colors">
            Direct Workspace Access &rarr;
          </Link>
        </div>
      </footer>
    </div>
  )
}
