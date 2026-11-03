'use client'

import React, { useState, useEffect, useRef, Suspense } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Scale,
  Sparkles,
  Shield,
  Clock,
  Brain,
  FileText,
  CheckCircle2,
  ArrowRight,
  Users,
  Calendar,
  ChevronRight,
  BarChart3,
  Lock,
  Eye,
  EyeOff,
  AlertTriangle,
  Building2,
  Briefcase,
  Award,
  Zap,
  Check,
  UserPlus,
  LogIn
} from 'lucide-react'

interface DemoUser {
  role: string
  name: string
  email: string
  password: string
  color: string
  badge: string
}

const DEMO_USERS: DemoUser[] = [
  { role: 'Admin', name: 'Rajesh Sharma', email: 'admin@caseline.in', password: 'caseline123', color: 'bg-red-500', badge: 'Chamber Head' },
  { role: 'Partner', name: 'Arjun Verma', email: 'arjun@caseline.in', password: 'caseline123', color: 'bg-blue-600', badge: 'Senior Litigator' },
  { role: 'Partner', name: 'Priya Mehta', email: 'priya@caseline.in', password: 'caseline123', color: 'bg-purple-600', badge: 'Corporate Head' },
  { role: 'Associate', name: 'Sanjeev Iyer', email: 'sanjeev@caseline.in', password: 'caseline123', color: 'bg-emerald-600', badge: 'Civil Litigator' },
  { role: 'Associate', name: 'Nisha Gupta', email: 'nisha@caseline.in', password: 'caseline123', color: 'bg-teal-600', badge: 'IP & Contracts' },
  { role: 'Paralegal', name: 'Rahul Joshi', email: 'rahul@caseline.in', password: 'caseline123', color: 'bg-amber-500', badge: 'Court Filing' },
  { role: 'Client', name: 'Rajesh Agarwal', email: 'client@caseline.in', password: 'caseline123', color: 'bg-slate-600', badge: 'Enterprise Client' },
]

interface UnifiedLandingPageProps {
  currentUser?: {
    id: string
    name?: string | null
    email?: string | null
    role?: string | null
  } | null
}

function UnifiedLandingPageContent({ currentUser }: UnifiedLandingPageProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const authSectionRef = useRef<HTMLDivElement>(null)

  const initialMode = searchParams.get('mode') === 'signup' || searchParams.get('auth') === 'signup' ? 'signup' : 'signin'
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>(initialMode)

  // Sign In State
  const [signInEmail, setSignInEmail] = useState('admin@caseline.in')
  const [signInPassword, setSignInPassword] = useState('caseline123')
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

  useEffect(() => {
    const mode = searchParams.get('mode') || searchParams.get('auth')
    if (mode === 'signup') {
      setAuthMode('signup')
      authSectionRef.current?.scrollIntoView({ behavior: 'smooth' })
    } else if (mode === 'signin' || mode === 'login') {
      setAuthMode('signin')
      authSectionRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [searchParams])

  const scrollToAuth = (mode: 'signin' | 'signup') => {
    setAuthMode(mode)
    authSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  // Instant Sign In handler
  const handleSignIn = async (e?: React.FormEvent, customEmail?: string, customPassword?: string) => {
    if (e) e.preventDefault()
    setSignInLoading(true)
    setSignInError('')

    const email = (customEmail || signInEmail).trim()
    const password = customPassword || signInPassword

    try {
      const result = await signIn('credentials', {
        email,
        password,
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

  // 1-Click Demo Login
  const handleQuickDemo = async (user: DemoUser) => {
    setAuthMode('signin')
    setSignInEmail(user.email)
    setSignInPassword(user.password)
    await handleSignIn(undefined, user.email, user.password)
  }

  // Sign Up handler
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

      // Auto sign in upon successful registration
      const signInResult = await signIn('credentials', {
        email: signUpEmail.trim(),
        password: signUpPassword,
        redirect: false,
      })

      if (signInResult?.ok) {
        router.push('/dashboard')
        router.refresh()
      } else {
        setSignInEmail(signUpEmail)
        setSignInPassword(signUpPassword)
        setAuthMode('signin')
        setSignInError('Account created! Please sign in with your password.')
      }
    } catch (err: any) {
      setSignUpError(err?.message || 'Network error occurred during registration.')
    } finally {
      setSignUpLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-blue-600 selection:text-white">
      {/* Navigation */}
      <nav className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/25 group-hover:scale-105 transition-transform">
                <Scale className="w-5 h-5" />
              </div>
              <div>
                <span className="font-serif text-xl font-bold tracking-tight text-white">CaseLine</span>
                <span className="text-[10px] ml-1.5 px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-semibold tracking-wide uppercase">AI Legal OS</span>
              </div>
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <a href="#auth-section" className="hover:text-white transition-colors">Sign In &amp; Register</a>
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#argument-ai" className="hover:text-white transition-colors">Argument AI</a>
            <a href="#security" className="hover:text-white transition-colors">Security</a>
          </div>

          <div className="flex items-center gap-3">
            {currentUser ? (
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-400 hidden sm:inline">
                  Signed in as <strong className="text-white">{currentUser.name}</strong>
                </span>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  Open Workspace
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              <>
                <button
                  onClick={() => scrollToAuth('signin')}
                  className="px-4 py-2 text-sm font-medium text-slate-200 hover:text-white transition-colors cursor-pointer"
                >
                  Sign In
                </button>
                <button
                  onClick={() => scrollToAuth('signup')}
                  className="px-4 py-2 text-sm font-medium text-blue-400 hover:text-blue-300 border border-blue-500/30 rounded-xl hover:bg-blue-500/10 transition-colors cursor-pointer"
                >
                  Sign Up
                </button>
                <Link
                  href="/dashboard"
                  className="hidden sm:inline-flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  Open Workspace
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-16 sm:pt-24 pb-12 overflow-hidden">
        {/* Glow gradients */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-gradient-to-tr from-blue-600/20 to-purple-600/20 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-slate-300 text-xs font-medium mb-6 sm:mb-8 shadow-inner"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Built for Modern Law Firms, Advocates & In-House Legal Counsel</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="font-serif text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.15] sm:leading-[1.1] mb-6"
          >
            The Intelligent Workspace for <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
              High-Stakes Legal Matters
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-base sm:text-lg md:text-xl text-slate-400 max-w-3xl mx-auto mb-8 sm:mb-10 leading-relaxed font-light"
          >
            Centralize your cases, documents, court hearings, and deadlines. Powered by judicial AI that parses contracts, predicts limitation risks, drafts briefs, and automates administrative burden.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => scrollToAuth('signin')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl text-base font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-xl shadow-blue-600/30 transition-all cursor-pointer"
            >
              Explore Interactive Demo
              <ArrowRight className="w-4 h-4" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => scrollToAuth('signup')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl text-base font-semibold bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 transition-all cursor-pointer"
            >
              <UserPlus className="w-4 h-4 text-blue-400" />
              Create Firm Account
            </motion.button>
          </motion.div>

          {/* Instant Test Login Banner (Direct 1-Click Sign In) */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-8 sm:mt-10 p-4 rounded-xl bg-slate-900/80 border border-slate-800 max-w-2xl mx-auto text-left text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg"
          >
            <div className="flex items-center gap-2.5">
              <Lock className="w-4 h-4 text-blue-400 flex-shrink-0" />
              <span>
                Instant Test Login: <strong className="text-white">admin@caseline.in</strong> / <strong className="text-white">caseline123</strong>
              </span>
            </div>
            <button
              onClick={() => handleSignIn(undefined, 'admin@caseline.in', 'caseline123')}
              disabled={signInLoading}
              className="text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1 cursor-pointer transition-colors px-3 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 self-start sm:self-auto"
            >
              {signInLoading ? 'Signing in...' : '1-Click Sign In'} <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* INTEGRATED AUTHENTICATION SECTION (LOGIN & SIGNUP ON THIS PAGE) */}
      <section id="auth-section" ref={authSectionRef} className="py-12 bg-slate-950 relative z-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

            {/* Header with Mode Tabs */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6 mb-6">
              <div>
                <h2 className="text-2xl font-serif font-bold text-white">
                  {authMode === 'signin' ? 'Sign In to CaseLine' : 'Create Firm Workspace (Sign Up)'}
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  {authMode === 'signin'
                    ? 'Access your legal chamber, manage matters, or click a demo role below.'
                    : 'Set up your practice chamber or client account with instant digital onboarding.'}
                </p>
              </div>

              {/* Tabs Switcher */}
              <div className="flex p-1 bg-slate-950 rounded-2xl border border-slate-800 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('signin')
                    setSignInError('')
                  }}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    authMode === 'signin'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('signup')
                    setSignUpError('')
                  }}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    authMode === 'signup'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Sign Up</span>
                </button>
              </div>
            </div>

            {/* TAB 1: SIGN IN */}
            {authMode === 'signin' && (
              <div className="space-y-6">
                {signInError && (
                  <div className="p-3.5 rounded-xl text-xs bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{signInError}</span>
                  </div>
                )}

                <form onSubmit={handleSignIn} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={signInEmail}
                        onChange={(e) => setSignInEmail(e.target.value)}
                        required
                        placeholder="you@firmname.in"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-950 text-white text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all placeholder:text-slate-500"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                          Password
                        </label>
                        <span className="text-[10px] text-slate-500 font-mono">Demo: caseline123</span>
                      </div>
                      <div className="relative">
                        <input
                          type={showSignInPassword ? 'text' : 'password'}
                          value={signInPassword}
                          onChange={(e) => setSignInPassword(e.target.value)}
                          required
                          placeholder="Enter password"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-950 text-white text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none pr-10 transition-all placeholder:text-slate-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowSignInPassword(!showSignInPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                        >
                          {showSignInPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-[11px] text-slate-400">
                      Need a new chamber workspace?{' '}
                      <button
                        type="button"
                        onClick={() => setAuthMode('signup')}
                        className="text-blue-400 hover:underline font-semibold cursor-pointer"
                      >
                        Create account here
                      </button>
                    </span>

                    <button
                      type="submit"
                      disabled={signInLoading}
                      className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-lg shadow-blue-600/30 transition-all active:scale-95 disabled:opacity-60 cursor-pointer"
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
                  </div>
                </form>

                {/* Instant 1-Click Demo Roles */}
                <div className="pt-6 border-t border-slate-800">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-amber-400" />
                      1-Click Instant Demo Roles (Click any role to log in immediately):
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">Password: caseline123</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                    {DEMO_USERS.map((user) => (
                      <button
                        key={user.email}
                        type="button"
                        onClick={() => handleQuickDemo(user)}
                        disabled={signInLoading}
                        className="p-2.5 rounded-xl border border-slate-800 bg-slate-950/60 hover:border-blue-500/50 hover:bg-blue-600/10 transition-all text-center group flex flex-col items-center gap-1 cursor-pointer disabled:opacity-50"
                        title={`${user.name} - ${user.badge} (${user.email})`}
                      >
                        <div className={`w-7 h-7 rounded-full ${user.color} flex items-center justify-center text-white text-xs font-bold shadow-sm group-hover:scale-110 transition-transform`}>
                          {user.role[0]}
                        </div>
                        <span className="text-xs font-semibold text-white group-hover:text-blue-300 leading-tight">
                          {user.role}
                        </span>
                        <span className="text-[9px] text-slate-400 truncate max-w-full font-medium">
                          {user.badge}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: SIGN UP */}
            {authMode === 'signup' && (
              <div className="space-y-5">
                {signUpError && (
                  <div className="p-3.5 rounded-xl text-xs bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{signUpError}</span>
                  </div>
                )}

                {signUpSuccess && (
                  <div className="p-3.5 rounded-xl text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{signUpSuccess}</span>
                  </div>
                )}

                <form onSubmit={handleSignUp} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                        Full Legal Name
                      </label>
                      <input
                        type="text"
                        value={signUpName}
                        onChange={(e) => setSignUpName(e.target.value)}
                        required
                        placeholder="Adv. Vikram Sethi"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-950 text-white text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all placeholder:text-slate-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                        Firm / Chamber Name
                      </label>
                      <input
                        type="text"
                        value={signUpFirmName}
                        onChange={(e) => setSignUpFirmName(e.target.value)}
                        required
                        placeholder="Sethi & Associates"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-950 text-white text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all placeholder:text-slate-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={signUpEmail}
                        onChange={(e) => setSignUpEmail(e.target.value)}
                        required
                        placeholder="vikram@sethilaw.in"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-950 text-white text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all placeholder:text-slate-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                        Phone (WhatsApp alerts)
                      </label>
                      <input
                        type="tel"
                        value={signUpPhone}
                        onChange={(e) => setSignUpPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-950 text-white text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all placeholder:text-slate-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                        Account Practice Role
                      </label>
                      <select
                        value={signUpRole}
                        onChange={(e) => setSignUpRole(e.target.value as any)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-950 text-white text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                      >
                        <option value="PARTNER">Managing Partner / Senior Litigator</option>
                        <option value="ASSOCIATE">Associate Advocate</option>
                        <option value="ADMIN">Firm Operations / In-House Counsel</option>
                        <option value="CLIENT">Corporate / Individual Client</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                      Create Password
                    </label>
                    <div className="relative">
                      <input
                        type={showSignUpPassword ? 'text' : 'password'}
                        value={signUpPassword}
                        onChange={(e) => setSignUpPassword(e.target.value)}
                        required
                        minLength={6}
                        placeholder="Minimum 6 characters"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-950 text-white text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none pr-10 transition-all placeholder:text-slate-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
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
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      className="mt-0.5 rounded border-slate-700 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-[11px] text-slate-400 leading-snug">
                      I agree to CaseLine Terms and consent to digital legal record processing under the Indian Information Technology Act 2000.
                    </span>
                  </label>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-[11px] text-slate-400">
                      Already registered?{' '}
                      <button
                        type="button"
                        onClick={() => setAuthMode('signin')}
                        className="text-blue-400 hover:underline font-semibold cursor-pointer"
                      >
                        Sign in here
                      </button>
                    </span>

                    <button
                      type="submit"
                      disabled={signUpLoading || !agreeTerms}
                      className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-lg shadow-blue-600/30 transition-all active:scale-95 disabled:opacity-60 cursor-pointer"
                    >
                      {signUpLoading ? (
                        <>
                          <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Provisioning Workspace...</span>
                        </>
                      ) : (
                        <>
                          <span>Create Firm Workspace &amp; Start</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Bottom Security Assurance */}
            <div className="mt-8 pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-500">
              <span className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                256-Bit SSL Encryption &bull; Section 65B &amp; IT Act 2000 Compliant
              </span>
              <span>Data Residency: Mumbai, India</span>
            </div>
          </div>
        </div>
      </section>

      {/* Flagship Feature: AI Agreement & Argument Inspector */}
      <section id="argument-ai" className="py-16 bg-slate-900/60 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-blue-950/40 to-slate-900 border border-blue-500/30 shadow-xl relative overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-3 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-semibold">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Flagship AI Feature: Upload &amp; Inspect</span>
                </div>
                <h3 className="text-2xl font-bold text-white font-serif">
                  Upload Agreement Picture / PDF &bull; Check Right or Wrong
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Both <strong>clients</strong> and <strong>lawyers</strong> can upload an agreement photo or PDF. Our judicial AI instantly verifies whether the agreement is <strong>Right or Wrong</strong> under Indian law, highlights <strong>Advantages &amp; Disadvantages</strong> from both perspectives, provides actionable <strong>Suggestions to Improve</strong> with redline amendments, saves it as a <strong>Reusable Template</strong>, and can <strong>Create the Same Agreement</strong> with 1-click for digital e-signing!
                </p>
                <div className="flex items-center gap-3 pt-2 text-xs text-slate-400 flex-wrap">
                  <span className="flex items-center gap-1"><Check className="w-3.5 h-3.5 text-emerald-400" /> PDF &amp; Picture Upload (OCR)</span>
                  <span className="flex items-center gap-1"><Check className="w-3.5 h-3.5 text-emerald-400" /> Right vs Wrong Validity Verdict</span>
                  <span className="flex items-center gap-1"><Check className="w-3.5 h-3.5 text-emerald-400" /> 1-Click Save as Template</span>
                  <span className="flex items-center gap-1"><Check className="w-3.5 h-3.5 text-emerald-400" /> 1-Click Generate Agreement</span>
                </div>
              </div>
              <div className="flex-shrink-0">
                <Link
                  href="/arguments"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-500/25 transition-all"
                >
                  Upload &amp; Inspect Agreement
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section id="features" className="py-20 bg-slate-900/30 border-t border-slate-800/60">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-white mb-4">
              Designed from the Ground Up for Legal Workflows
            </h2>
            <p className="text-slate-400 text-base">
              Say goodbye to fragmented paper briefs, lost court dates, and billing chaos.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-blue-500/40 hover:-translate-y-1 transition-all duration-200 shadow-sm hover:shadow-md">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-5 border border-blue-500/20">
                <Brain className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Smart Case Intake</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Upload case filings or notices. AI automatically extracts parties, opposing counsels, claim value, court benches, and procedural timeline.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/40 hover:-translate-y-1 transition-all duration-200 shadow-sm hover:shadow-md">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-5 border border-amber-500/20">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Deadline Guardian</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Rules-based limitation calculator and hearing tracker. Proactively flags limitation lapses, written argument deadlines, and pending compliances.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-purple-500/40 hover:-translate-y-1 transition-all duration-200 shadow-sm hover:shadow-md">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-5 border border-purple-500/20">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Ask the Case (RAG)</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Chat with your entire dossier. Ask complex factual or evidentiary questions with page-exact citations across hundreds of discovery pages.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-indigo-500/40 hover:-translate-y-1 transition-all duration-200 shadow-sm hover:shadow-md">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-5 border border-indigo-500/20">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Court Hearing Sync</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Calendar designed specifically for High Courts, District Courts, and Tribunals (NCLT, DRT) with daily cause list alerts.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-emerald-500/40 hover:-translate-y-1 transition-all duration-200 shadow-sm hover:shadow-md">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-5 border border-emerald-500/20">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Workload Balancer</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Monitor team capacity across Partners, Associates, and Paralegals to ensure equitable distribution and eliminate attorney burnout.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-sky-500/40 hover:-translate-y-1 transition-all duration-200 shadow-sm hover:shadow-md">
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

      {/* Security Section */}
      <section id="security" className="py-16 bg-slate-950 border-t border-slate-800/80">
        <div className="max-w-5xl mx-auto px-6 text-center space-y-6">
          <div className="w-12 h-12 rounded-2xl bg-blue-600/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mx-auto">
            <Shield className="w-6 h-6" />
          </div>
          <h2 className="font-serif text-3xl font-bold text-white">
            Enterprise Security &amp; Judicial Compliance
          </h2>
          <p className="text-slate-400 text-sm max-w-2xl mx-auto leading-relaxed">
            CaseLine complies strictly with the Indian Information Technology Act 2000, Section 65B Indian Evidence Act digital records evidentiary standards, and role-based access control.
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-xs text-slate-400 pt-2">
            <span className="px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-800 flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              IT Act 2000 Compliant
            </span>
            <span className="px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-800 flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              Section 65B Electronic Proof
            </span>
            <span className="px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-800 flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              Tenant-Isolated DB Schemas
            </span>
            <span className="px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-800 flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              256-Bit SSL Data Encryption
            </span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-12 text-center text-xs text-slate-500 bg-slate-950">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>&copy; {new Date().getFullYear()} CaseLine Legal Technologies. Built for HackIndia.</p>
          <div className="flex items-center gap-4 text-slate-400">
            <button onClick={() => scrollToAuth('signin')} className="hover:text-white transition-colors cursor-pointer">
              Sign In
            </button>
            <button onClick={() => scrollToAuth('signup')} className="hover:text-white transition-colors cursor-pointer">
              Sign Up
            </button>
            <Link href="/arguments" className="hover:text-white transition-colors">
              Argument AI
            </Link>
            <Link href="/agreements/templates" className="hover:text-white transition-colors">
              Agreement Templates
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default function UnifiedLandingPage(props: UnifiedLandingPageProps) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">Loading...</div>}>
      <UnifiedLandingPageContent {...props} />
    </Suspense>
  )
}
