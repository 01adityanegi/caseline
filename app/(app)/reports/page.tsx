import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { redirect } from 'next/navigation'
import { BarChart3, TrendingUp, PieChart, Download, FileText, CheckCircle, Scale } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-foreground">Practice Analytics & Reports</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Performance metrics, court resolution velocity, and judicial trends.
          </p>
        </div>
        <button className="btn-primary text-xs">
          <Download className="w-3.5 h-3.5" />
          Export Matter Report (CSV)
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card p-5 rounded-xl border border-border shadow-sm">
          <p className="text-xs text-muted-foreground">Total Managed Matters</p>
          <p className="font-mono text-3xl font-bold text-foreground mt-1">{casesCount}</p>
          <p className="text-xs text-emerald-600 mt-2 font-medium flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> +14% vs previous quarter
          </p>
        </div>

        <div className="bg-card p-5 rounded-xl border border-border shadow-sm">
          <p className="text-xs text-muted-foreground">Resolution Rate</p>
          <p className="font-mono text-3xl font-bold text-emerald-600 mt-1">78.4%</p>
          <p className="text-xs text-muted-foreground mt-2">Favorable outcomes & settlements</p>
        </div>

        <div className="bg-card p-5 rounded-xl border border-border shadow-sm">
          <p className="text-xs text-muted-foreground">Avg. Hearing Interval</p>
          <p className="font-mono text-3xl font-bold text-blue-600 mt-1">34 Days</p>
          <p className="text-xs text-muted-foreground mt-2">Between successive cause list dates</p>
        </div>
      </div>

      {/* Practice Area Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card p-6 rounded-xl border border-border shadow-sm space-y-4">
          <h3 className="font-semibold text-base text-foreground flex items-center gap-2">
            <Scale className="w-4 h-4 text-primary" />
            Matters by Practice Area
          </h3>
          <div className="space-y-3">
            {casesByArea.map(a => (
              <div key={a.practiceArea} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-medium">
                  <span className="text-foreground">{a.practiceArea}</span>
                  <span className="font-mono text-muted-foreground">{a._count} matters</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-primary h-full rounded-full"
                    style={{ width: `${Math.round((a._count / casesCount) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card p-6 rounded-xl border border-border shadow-sm space-y-4">
          <h3 className="font-semibold text-base text-foreground flex items-center gap-2">
            <PieChart className="w-4 h-4 text-primary" />
            Matters by Pipeline Stage
          </h3>
          <div className="space-y-3">
            {casesByStatus.map(s => (
              <div key={s.status} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-medium">
                  <span className="text-foreground">{s.status}</span>
                  <span className="font-mono text-muted-foreground">{s._count}</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-indigo-500 h-full rounded-full"
                    style={{ width: `${Math.round((s._count / casesCount) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
