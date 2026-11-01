import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import Link from 'next/link'
import {
  FileText, Plus, Search, Sparkles, Scale, CheckCircle2,
  Clock, ShieldAlert, ArrowRight, ChevronRight, Download, Eye, Edit3
} from 'lucide-react'
import { formatDate } from '@/lib/utils'
import AgreementsListClient from '@/components/agreements/AgreementsListClient'

import AnimatedAgreementHero from '@/components/agreements/AnimatedAgreementHero'

import { getAgreementFilter, isClientUser } from '@/lib/rbac'

export default async function AgreementsDashboardPage() {
  const session = await auth()
  if (!session) return null

  const isClient = isClientUser(session.user)
  const agreementFilter = await getAgreementFilter(session.user)

  const agreements = await prisma.agreement.findMany({
    where: agreementFilter,
    include: {
      parties: true,
      case: { select: { id: true, title: true, caseNumber: true } },
      client: { select: { id: true, name: true } },
      signatures: true,
    },
    orderBy: { updatedAt: 'desc' },
  })

  const totalCount = agreements.length
  const draftCount = agreements.filter(a => a.status === 'DRAFT').length
  const signingCount = agreements.filter(a => a.status === 'SIGNING').length
  const completedCount = agreements.filter(a => a.status === 'COMPLETED').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-2xl md:text-3xl font-bold text-foreground">
              {isClient ? 'My Agreements & Contracts' : 'AgreementStudio'}
            </h1>
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20">
              {isClient ? 'Client Portal' : 'Judicial AI'}
            </span>
          </div>
          <p className="text-xs md:text-sm text-muted-foreground mt-1">
            {isClient
              ? 'Review, track execution, and digitally e-sign your legal deeds and conveyance drafts.'
              : 'Bilingual contract generator with instant legal Hindi drafting, statutory risk audit, and digital e-signatures.'}
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {!isClient && (
            <Link
              href="/agreements/templates"
              className="px-3.5 py-2 rounded-lg text-xs font-semibold border border-border bg-card hover:bg-muted text-foreground transition-colors inline-flex items-center gap-1.5 min-h-[40px]"
            >
              <Scale className="w-4 h-4 text-primary" />
              14 Templates
            </Link>
          )}
          <Link
            href="/agreements/new"
            className="btn-primary text-xs whitespace-nowrap min-h-[40px]"
          >
            <Plus className="w-4 h-4" />
            {isClient ? 'Draft Agreement' : 'Create Agreement'}
          </Link>
        </div>
      </div>

      {/* Animated Hero Section */}
      <AnimatedAgreementHero />

      {/* KPI Cards (Responsive grid) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <div className="bg-card p-4 rounded-xl border border-border shadow-sm">
          <p className="text-xs text-muted-foreground">Total Agreements</p>
          <p className="font-mono text-2xl md:text-3xl font-bold text-foreground mt-1">{totalCount}</p>
          <p className="text-[11px] text-muted-foreground mt-1">Managed dossiers</p>
        </div>
        <div className="bg-card p-4 rounded-xl border border-border shadow-sm">
          <p className="text-xs text-muted-foreground">Drafts in Progress</p>
          <p className="font-mono text-2xl md:text-3xl font-bold text-amber-500 mt-1">{draftCount}</p>
          <p className="text-[11px] text-amber-600/80 mt-1">Editable</p>
        </div>
        <div className="bg-card p-4 rounded-xl border border-border shadow-sm">
          <p className="text-xs text-muted-foreground">Awaiting Signature</p>
          <p className="font-mono text-2xl md:text-3xl font-bold text-blue-500 mt-1">{signingCount}</p>
          <p className="text-[11px] text-blue-600/80 mt-1">E-Sign dispatched</p>
        </div>
        <div className="bg-card p-4 rounded-xl border border-border shadow-sm">
          <p className="text-xs text-muted-foreground">Fully Executed</p>
          <p className="font-mono text-2xl md:text-3xl font-bold text-emerald-500 mt-1">{completedCount}</p>
          <p className="text-[11px] text-emerald-600/80 mt-1">Legally binding</p>
        </div>
      </div>

      {/* Main Interactive Agreements Listing Component */}
      <AgreementsListClient initialAgreements={agreements} />
    </div>
  )
}
