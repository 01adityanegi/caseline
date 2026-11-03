import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { redirect } from 'next/navigation'
import { BarChart3, TrendingUp, PieChart, Download, FileText, CheckCircle, Scale } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { PageTransition, StaggerList, StaggerItem, RevealOnScroll } from '@/components/ui/motion'

export default async function ReportsPage() {
  const session = await auth()
  if (!session) return null
  if (session.user.role === 'CLIENT') redirect('/dashboard')

  const [casesCount, casesByArea, casesByStatus] = await Promise.all([
    prisma.case.count({ where: { organizationId: session.user.organizationId } }),
    prisma.case.groupBy({
      by: ['practiceArea'],
      where: { organizationId: session.user.organizationId },
      _count: true,
    }),
    prisma.case.groupBy({
      by: ['status'],
      where: { organizationId: session.user.organizationId },
      _count: true,
    }),
  ])

  return (
    <PageTransition>
      <div className="space-y-6 max-w-[1400px]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-serif text-2xl md:text-3xl font-semibold text-foreground">Practice Analytics & Reports</h1>
            <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
              Performance metrics, court resolution velocity, and judicial trends across all active client matters.
            </p>
          </div>
          <button className="btn-primary text-xs self-start sm:self-auto cursor-pointer">
            <Download className="w-3.5 h-3.5" />
            Export Matter Report (CSV)
          </button>
        </div>

        <StaggerList className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <StaggerItem>
            <div className="card-premium p-5">
              <p className="text-xs font-medium text-muted-foreground">Total Managed Matters</p>
              <p className="font-mono text-3xl font-bold text-foreground mt-1 tracking-tight">{casesCount}</p>
              <p className="text-xs text-emerald-600 mt-2 font-semibold flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" /> +14% vs previous quarter
              </p>
            </div>
          </StaggerItem>

          <StaggerItem>
            <div className="card-premium p-5">
              <p className="text-xs font-medium text-muted-foreground">Resolution Rate</p>
              <p className="font-mono text-3xl font-bold text-emerald-600 mt-1 tracking-tight">78.4%</p>
              <p className="text-xs text-muted-foreground mt-2 font-medium">Favorable outcomes & settlements</p>
            </div>
          </StaggerItem>

          <StaggerItem>
            <div className="card-premium p-5">
              <p className="text-xs font-medium text-muted-foreground">Avg. Hearing Interval</p>
              <p className="font-mono text-3xl font-bold text-blue-600 mt-1 tracking-tight">34 Days</p>
              <p className="text-xs text-muted-foreground mt-2 font-medium">Between successive cause list dates</p>
            </div>
          </StaggerItem>
        </StaggerList>

        {/* Practice Area Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RevealOnScroll>
            <div className="card-premium p-6 space-y-4">
              <h3 className="font-semibold text-base text-foreground flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Scale className="w-4 h-4 text-blue-600" />
                </div>
                Matters by Practice Area
              </h3>
              <div className="space-y-3.5">
                {casesByArea.map(a => (
                  <div key={a.practiceArea} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-medium">
                      <span className="text-foreground">{a.practiceArea}</span>
                      <span className="font-mono text-muted-foreground">{a._count} matters</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-primary h-full rounded-full transition-all duration-500"
                        style={{ width: `${casesCount > 0 ? Math.round((a._count / casesCount) * 100) : 0}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </RevealOnScroll>

          <RevealOnScroll>
            <div className="card-premium p-6 space-y-4">
              <h3 className="font-semibold text-base text-foreground flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-100 flex items-center justify-center">
                  <PieChart className="w-4 h-4 text-indigo-600" />
                </div>
                Matters by Pipeline Stage
              </h3>
              <div className="space-y-3.5">
                {casesByStatus.map(s => (
                  <div key={s.status} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-medium">
                      <span className="text-foreground">{s.status}</span>
                      <span className="font-mono text-muted-foreground">{s._count}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${casesCount > 0 ? Math.round((s._count / casesCount) * 100) : 0}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </RevealOnScroll>
        </div>
      </div>
    </PageTransition>
  )
}
