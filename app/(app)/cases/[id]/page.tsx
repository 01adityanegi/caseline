import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
  ChevronLeft, Calendar, User, Clock, AlertTriangle, ShieldCheck,
  Building, Sparkles, Edit3, Share2, Scale
} from 'lucide-react'
import { formatDate, formatCurrency, getCaseStatusColor, getPriorityColor, STATUS_LABELS, getRiskColor } from '@/lib/utils'
import CaseDetailTabs from '@/components/cases/CaseDetailTabs'

import { getClientForUser, isClientUser } from '@/lib/rbac'

export default async function CaseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()
  if (!session) return null

  const { id } = await params
  const isClient = isClientUser(session.user)
  const clientRecord = isClient ? await getClientForUser(session.user) : null

  const caseData = await prisma.case.findUnique({
    where: { id },
    include: {
      client: true,
      lead: true,
      parties: true,
      documents: { orderBy: { createdAt: 'desc' } },
      tasks: { include: { assignee: true }, orderBy: { dueDate: 'asc' } },
      hearings: { orderBy: { date: 'asc' } },
      deadlines: { orderBy: { date: 'asc' } },
      timeEntries: isClient ? false : { include: { user: true }, orderBy: { date: 'desc' } },
      notes: isClient ? false : { include: { author: true }, orderBy: { createdAt: 'desc' } },
      communications: { include: { user: true }, orderBy: { sentAt: 'desc' } },
      aiInsights: isClient ? false : { orderBy: { createdAt: 'desc' } },
      auditLogs: isClient ? false : { include: { user: true }, orderBy: { createdAt: 'desc' } },
    },
  })

  // Strict tenant and client security gate
  if (!caseData || caseData.organizationId !== session.user.organizationId) {
    notFound()
  }

  if (isClient && caseData.clientId !== clientRecord?.id) {
    notFound()
  }

  const users = isClient
    ? []
    : await prisma.user.findMany({
        where: { organizationId: session.user.organizationId },
        select: { id: true, name: true, role: true },
      })

  const statusStyle = getCaseStatusColor(caseData.status)
  const priorityStyle = getPriorityColor(caseData.priority)
  const riskStyle = getRiskColor(caseData.riskScore)

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div>
        <Link
          href="/cases"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to all cases
        </Link>
      </div>

      {/* Case Header Banner */}
      <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="font-mono text-xs font-semibold px-2.5 py-1 rounded bg-muted text-muted-foreground">
                {caseData.caseNumber}
              </span>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusStyle.bg} ${statusStyle.text}`}>
                {STATUS_LABELS[caseData.status] || caseData.status}
              </span>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${priorityStyle.bg} ${priorityStyle.text}`}>
                {caseData.priority} Priority
              </span>
              <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-600 border border-blue-500/20">
                {caseData.practiceArea}
              </span>
            </div>

            <h1 className="font-serif text-2xl md:text-3xl font-bold text-foreground">
              {caseData.title}
            </h1>

            <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap pt-1">
              <span>Client: <strong className="text-foreground">{caseData.client.name}</strong></span>
              <span>•</span>
              <span>Court: <strong className="text-foreground">{caseData.court || 'Not Assigned'}</strong></span>
              <span>•</span>
              <span>Lead: <strong className="text-foreground">{caseData.lead?.name || 'Unassigned'}</strong></span>
              {caseData.nextHearingDate && (
                <>
                  <span>•</span>
                  <span className="text-primary font-semibold flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    Next Hearing: {formatDate(caseData.nextHearingDate)}
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right pr-4 border-r border-border">
              <div className="text-xs text-muted-foreground">Risk Metric</div>
              <div className={`font-mono text-lg font-bold ${riskStyle.text}`}>{caseData.riskScore}%</div>
            </div>
            <button className="btn-primary text-xs">
              <Edit3 className="w-3.5 h-3.5" />
              Edit Matter
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <CaseDetailTabs caseData={caseData} users={users} />
    </div>
  )
}
