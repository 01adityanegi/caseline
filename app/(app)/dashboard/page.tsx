import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { formatCurrency, formatDate, formatRelative, getRiskColor, getCaseStatusColor, STATUS_LABELS } from '@/lib/utils'
import { Suspense } from 'react'
import {
  Briefcase, AlertTriangle, Clock, DollarSign, Calendar,
  TrendingUp, ArrowRight, CheckCircle2, Activity,
  Sparkles, Users, FileText, Bell, ChevronRight, CircleDot,
} from 'lucide-react'
import Link from 'next/link'
import DashboardCharts from '@/components/dashboard/DashboardCharts'
import AIBriefingCard from '@/components/dashboard/AIBriefingCard'

import { getCaseFilter, getAgreementFilter, isClientUser } from '@/lib/rbac'

async function getDashboardData(user: any) {
  const orgId = user.organizationId
  const isClient = isClientUser(user)
  const caseFilter = await getCaseFilter(user)
  const agreementFilter = await getAgreementFilter(user)

  const now = new Date()
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000)
  const startOfWeek = new Date(now.getTime() - now.getDay() * 24 * 60 * 60 * 1000)
  const endOfWeek = new Date(startOfWeek.getTime() + 7 * 24 * 60 * 60 * 1000)
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)

  const [
    activeCases,
    hearingsThisWeek,
    overdueDeadlines,
    monthlyHours,
    todayHearings,
    todayDeadlines,
    atRiskDeadlines,
    recentActivity,
    casesByStatus,
    casesByArea,
    upcomingDeadlines,
    teamWorkload,
    pendingAgreements,
  ] = await Promise.all([
    prisma.case.count({ where: { ...caseFilter, status: { notIn: ['CLOSED'] } } }),
    prisma.hearing.count({ where: { case: caseFilter, date: { gte: startOfWeek, lte: endOfWeek }, status: 'SCHEDULED' } }),
    prisma.deadline.count({ where: { case: caseFilter, status: 'OVERDUE' } }),
    isClient
      ? Promise.resolve({ _sum: { hours: 0 } })
      : prisma.timeEntry.aggregate({ where: { case: { organizationId: orgId }, date: { gte: startOfMonth, lte: endOfMonth }, billable: true }, _sum: { hours: true } }),
    prisma.hearing.findMany({ where: { case: caseFilter, date: { gte: startOfDay, lt: endOfDay } }, include: { case: { select: { title: true, id: true } } }, orderBy: { date: 'asc' }, take: 5 }),
    prisma.deadline.findMany({ where: { case: caseFilter, date: { gte: startOfDay, lt: endOfDay }, status: { not: 'COMPLETED' } }, include: { case: { select: { title: true, id: true } } }, take: 5 }),
    prisma.deadline.findMany({ where: { case: caseFilter, status: { in: ['PENDING', 'OVERDUE'] }, riskScore: { gte: 70 } }, include: { case: { select: { title: true, id: true, caseNumber: true } } }, orderBy: { riskScore: 'desc' }, take: 5 }),
    prisma.auditLog.findMany({ where: { case: caseFilter }, include: { user: { select: { name: true } } }, orderBy: { createdAt: 'desc' }, take: 8 }),
    prisma.case.groupBy({ by: ['status'], where: caseFilter, _count: true }),
    prisma.case.groupBy({ by: ['practiceArea'], where: caseFilter, _count: true, orderBy: { _count: { practiceArea: 'desc' } }, take: 6 }),
    prisma.deadline.findMany({ where: { case: caseFilter, status: 'PENDING', date: { gte: now } }, include: { case: { select: { title: true, id: true, caseNumber: true } } }, orderBy: { date: 'asc' }, take: 6 }),
    isClient
      ? Promise.resolve([])
      : prisma.user.findMany({ where: { organizationId: orgId, role: { in: ['PARTNER', 'ASSOCIATE', 'PARALEGAL'] } }, include: { _count: { select: { assignedCases: true, tasks: true } } }, take: 6 }),
    prisma.agreement.count({ where: { ...agreementFilter, status: { in: ['SIGNING', 'DRAFT'] } } }),
  ])

  return {
    kpis: {
      activeCases,
      hearingsThisWeek,
      overdueDeadlines,
      billableHours: isClient ? pendingAgreements : (Math.round((monthlyHours._sum.hours || 0) * 10) / 10),
      isClient,
      pendingAgreements,
    },
    today: { hearings: todayHearings, deadlines: todayDeadlines },
    atRiskDeadlines,
    recentActivity,
    casesByStatus: casesByStatus.map(c => ({ status: STATUS_LABELS[c.status] || c.status, count: c._count })),
    casesByArea: casesByArea.map(c => ({ area: c.practiceArea.replace(' & ', '\n& '), count: c._count })),
    upcomingDeadlines,
    teamWorkload: teamWorkload.map(u => ({ name: u.name, cases: u._count.assignedCases, tasks: u._count.tasks })),
  }
}

function KPICard({ title, value, icon: Icon, trend, color, suffix = '', href }: {
  title: string
  value: string | number
  icon: React.ElementType
  trend?: string
  color: string
  suffix?: string
  href?: string
}) {
  const content = (
    <div className="kpi-card cursor-pointer">
      <div className="flex items-start justify-between">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        {trend && <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded-full">{trend}</span>}
      </div>
      <div>
        <p className="text-3xl font-bold text-gray-900 font-mono">{value}{suffix}</p>
        <p className="text-sm text-gray-500 mt-0.5">{title}</p>
      </div>
    </div>
  )
  return href ? <Link href={href}>{content}</Link> : content
}

function RiskBadge({ score }: { score: number }) {
  const color = score >= 90 ? 'bg-red-100 text-red-700' : score >= 70 ? 'bg-orange-100 text-orange-700' : 'bg-yellow-100 text-yellow-700'
  return <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${color}`}>{score}</span>
}

export default async function DashboardPage() {
  const session = await auth()
  if (!session) return null

  const isClient = isClientUser(session.user)
  const data = await getDashboardData(session.user)
  const greeting = new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 17 ? 'Good afternoon' : 'Good evening'
  const firstName = session.user.name?.split(' ')[0]

  return (
    <div className="space-y-6 max-w-[1400px]">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-2xl font-semibold text-gray-900">{greeting}, {firstName}</h1>
            {isClient && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                Client Portal
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-1">
            {formatDate(new Date(), 'EEEE, dd MMMM yyyy')} — {data.kpis.activeCases} active {isClient ? 'matter(s) with firm' : 'cases'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/arguments"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 border border-blue-500/20 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-500" />
            Argument AI
          </Link>
          {isClient ? (
            <Link href="/agreements" className="btn-primary">
              <FileText className="w-4 h-4" />
              My Agreements
            </Link>
          ) : (
            <Link href="/cases/new" className="btn-primary">
              <Briefcase className="w-4 h-4" />
              New Case
            </Link>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title={isClient ? "My Active Matters" : "Active Cases"} value={data.kpis.activeCases} icon={Briefcase} color="bg-blue-600" href="/cases" />
        <KPICard title="Hearings This Week" value={data.kpis.hearingsThisWeek} icon={Calendar} color="bg-purple-600" href="/cases" />
        <KPICard title="Overdue Deadlines" value={data.kpis.overdueDeadlines} icon={AlertTriangle} color={data.kpis.overdueDeadlines > 0 ? 'bg-red-600' : 'bg-green-600'} href="/cases" />
        {isClient ? (
          <KPICard title="Pending Agreements" value={data.kpis.pendingAgreements} icon={FileText} color="bg-amber-600" href="/agreements" />
        ) : (
          <KPICard title="Billable Hours (Month)" value={data.kpis.billableHours} icon={Clock} suffix="h" color="bg-amber-600" href="/billing" />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: AI Briefing + Charts */}
        <div className="lg:col-span-2 space-y-6">
          {/* AI Daily Briefing */}
          <Suspense fallback={<div className="h-28 skeleton rounded-xl" />}>
            <AIBriefingCard kpis={data.kpis} />
          </Suspense>

          {/* Charts */}
          <Suspense fallback={<div className="h-72 skeleton rounded-xl" />}>
            <DashboardCharts
              casesByStatus={data.casesByStatus}
              casesByArea={data.casesByArea}
              teamWorkload={data.teamWorkload}
            />
          </Suspense>

          {/* At-Risk Deadlines */}
          {data.atRiskDeadlines.length > 0 && (
            <div className="bg-card rounded-xl border border-border p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-orange-500" />
                  <h3 className="font-semibold text-gray-900 text-sm">At-Risk Deadlines</h3>
                </div>
                <Link href="/cases?view=guardian" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                  Run Guardian <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
              <div className="space-y-2">
                {data.atRiskDeadlines.map(d => (
                  <Link key={d.id} href={`/cases/${d.caseId}`} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group">
                    <RiskBadge score={d.riskScore} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{d.title}</p>
                      <p className="text-xs text-gray-500 truncate">{d.case.title} · Due {formatDate(d.date)}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500" />
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Today Panel + Activity */}
        <div className="space-y-6">
          {/* Today Panel */}
          <div className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-4 h-4 text-blue-600" />
              <h3 className="font-semibold text-gray-900 text-sm">Today</h3>
            </div>

            {data.today.hearings.length === 0 && data.today.deadlines.length === 0 ? (
              <div className="text-center py-6">
                <CheckCircle2 className="w-8 h-8 text-green-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No hearings or deadlines today</p>
              </div>
            ) : (
              <div className="space-y-3">
                {data.today.hearings.map(h => (
                  <Link key={h.id} href={`/cases/${h.caseId}`} className="flex items-start gap-3 group">
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 group-hover:text-blue-600 transition-colors truncate">{h.title}</p>
                      <p className="text-xs text-gray-500 truncate">{h.case.title}</p>
                    </div>
                  </Link>
                ))}
                {data.today.deadlines.map(d => (
                  <Link key={d.id} href={`/cases/${d.caseId}`} className="flex items-start gap-3 group">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 group-hover:text-blue-600 transition-colors truncate">{d.title}</p>
                      <p className="text-xs text-gray-500 truncate">{d.case.title}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Upcoming Deadlines */}
          <div className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500" />
                <h3 className="font-semibold text-gray-900 text-sm">Upcoming Deadlines</h3>
              </div>
              <Link href="/calendar" className="text-xs text-blue-600 hover:underline">View all</Link>
            </div>
            <div className="space-y-3">
              {data.upcomingDeadlines.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">No upcoming deadlines</p>
              ) : (
                data.upcomingDeadlines.map(d => (
                  <Link key={d.id} href={`/cases/${d.caseId}`} className="flex items-start gap-3 group">
                    <div className="text-right flex-shrink-0 w-16">
                      <p className="text-xs font-mono text-gray-900">{formatDate(d.date, 'dd MMM')}</p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-700 group-hover:text-blue-600 truncate">{d.title}</p>
                      <p className="text-xs text-gray-400 truncate font-mono">{d.case.caseNumber}</p>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>

          {/* Activity Feed */}
          <div className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-4 h-4 text-gray-400" />
              <h3 className="font-semibold text-gray-900 text-sm">Recent Activity</h3>
            </div>
            <div className="space-y-3">
              {data.recentActivity.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">No recent activity</p>
              ) : (
                data.recentActivity.map((log, i) => (
                  <div key={log.id} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CircleDot className="w-3 h-3 text-gray-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-700">
                        <span className="font-medium">{log.user?.name || 'System'}</span>{' '}
                        {log.action.toLowerCase().replace(/_/g, ' ')}
                      </p>
                      <p className="text-xs text-gray-400">{formatRelative(log.createdAt)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
