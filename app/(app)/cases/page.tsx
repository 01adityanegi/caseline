import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { formatDate, getCaseStatusColor, getPriorityColor, STATUS_LABELS, formatCurrency } from '@/lib/utils'
import { Suspense } from 'react'
import Link from 'next/link'
import { Briefcase, Plus, Scale } from 'lucide-react'
import CasesClient from '@/components/cases/CasesClient'
import { getCaseFilter, isClientUser } from '@/lib/rbac'
import { PageTransition, StaggerList, StaggerItem } from '@/components/ui/motion'

async function getCases(user: any, params: Record<string, string>) {
  const baseFilter = await getCaseFilter(user)
  const where: Record<string, unknown> = { ...baseFilter }

  if (params.status) where.status = params.status
  if (params.priority) where.priority = params.priority
  if (params.practiceArea) where.practiceArea = { contains: params.practiceArea }
  if (params.search) {
    where.OR = [
      { title: { contains: params.search } },
      { caseNumber: { contains: params.search } },
      { court: { contains: params.search } },
    ]
  }

  const cases = await prisma.case.findMany({
    where,
    include: {
      client: { select: { name: true } },
      lead: { select: { name: true } },
      _count: { select: { tasks: true, documents: true, hearings: true } },
    },
    orderBy: [{ riskScore: 'desc' }, { updatedAt: 'desc' }],
    take: 50,
  })

  return cases
}

export default async function CasesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>
}) {
  const session = await auth()
  if (!session) return null

  const isClient = isClientUser(session.user)
  const baseFilter = await getCaseFilter(session.user)
  const params = await searchParams
  const cases = await getCases(session.user, params)

  const [users, statusCounts] = await Promise.all([
    prisma.user.findMany({
      where: { organizationId: session.user.organizationId, role: { in: ['PARTNER', 'ASSOCIATE', 'PARALEGAL'] } },
      select: { id: true, name: true },
    }),
    prisma.case.groupBy({
      by: ['status'],
      where: baseFilter,
      _count: true,
    }),
  ])

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-serif text-2xl md:text-3xl font-semibold text-foreground">
              {isClient ? 'My Legal Matters' : 'Cases'}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {isClient
                ? `${cases.length} active legal matters represented by the firm`
                : `${cases.length} cases`}
            </p>
          </div>
          {!isClient && (
            <Link href="/cases/new" className="btn-primary self-start sm:self-auto">
              <Plus className="w-4 h-4" />
              New Case
            </Link>
          )}
        </div>

        {/* Status filter pills */}
        <div className="flex items-center gap-2 flex-wrap">
          <Link
            href="/cases"
            className={`text-xs font-semibold px-3.5 py-1.5 rounded-full border transition-all duration-200 ${!params.status ? 'bg-blue-600 text-white border-blue-600 shadow-sm' : 'bg-card text-muted-foreground border-border hover:border-blue-300 hover:text-blue-600'}`}
          >
            All Cases ({cases.length})
          </Link>
          {statusCounts.map(s => (
            <Link
              key={s.status}
              href={`/cases?status=${s.status}`}
              className={`text-xs font-semibold px-3.5 py-1.5 rounded-full border transition-all duration-200 ${params.status === s.status ? 'bg-blue-600 text-white border-blue-600 shadow-sm' : 'bg-card text-muted-foreground border-border hover:border-blue-300 hover:text-blue-600'}`}
            >
              {STATUS_LABELS[s.status]} ({s._count})
            </Link>
          ))}
        </div>

        <Suspense fallback={<div className="h-96 skeleton rounded-xl" />}>
          <CasesClient cases={cases} users={users} initialView="table" />
        </Suspense>
      </div>
    </PageTransition>
  )
}
