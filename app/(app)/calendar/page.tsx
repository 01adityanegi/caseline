import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { formatDate } from '@/lib/utils'
import { Calendar as CalendarIcon, Clock, Scale, AlertTriangle, Plus, ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'

export default async function CalendarPage() {
  const session = await auth()
  if (!session) return null

  const [hearings, deadlines] = await Promise.all([
    prisma.hearing.findMany({
      where: { case: { organizationId: session.user.organizationId } },
      include: { case: { select: { id: true, title: true, caseNumber: true, court: true } } },
      orderBy: { date: 'asc' },
      take: 20,
    }),
    prisma.deadline.findMany({
      where: { case: { organizationId: session.user.organizationId } },
      include: { case: { select: { id: true, title: true, caseNumber: true } } },
      orderBy: { date: 'asc' },
      take: 20,
    }),
  ])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-foreground">Court Calendar & Deadlines</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track daily cause lists, upcoming judicial hearings, and limitation deadlines across benches.
          </p>
        </div>
        <button className="btn-primary text-xs">
          <Plus className="w-3.5 h-3.5" />
          Schedule Hearing
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Hearings */}
        <div className="bg-card rounded-xl border border-border p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h2 className="font-semibold text-base text-foreground flex items-center gap-2">
              <Scale className="w-4 h-4 text-primary" />
              Court Hearings Schedule ({hearings.length})
            </h2>
            <span className="text-xs text-muted-foreground">High Courts & Tribunals</span>
          </div>

          <div className="space-y-3">
            {hearings.map(h => (
              <div key={h.id} className="p-3.5 rounded-lg border border-border bg-background hover:border-primary/40 transition-all">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <Link href={`/cases/${h.case.id}`} className="font-semibold text-sm text-foreground hover:text-primary transition-colors block">
                      {h.title}
                    </Link>
                    <p className="text-xs text-muted-foreground mt-0.5">{h.case.title}</p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                      <span className="font-mono text-[11px] font-bold text-primary">{h.case.court || 'Court Pending'}</span>
                      <span>•</span>
                      <span>Time: {h.time || '10:30 AM'}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-600">
                      <CalendarIcon className="w-3 h-3" />
                      {formatDate(h.date)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Limitation & Statutory Deadlines */}
        <div className="bg-card rounded-xl border border-border p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h2 className="font-semibold text-base text-foreground flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500" />
              Statutory Deadlines & Limitation Tracker ({deadlines.length})
            </h2>
            <span className="text-xs text-muted-foreground">Automated Guardian</span>
          </div>

          <div className="space-y-3">
            {deadlines.map(d => (
              <div key={d.id} className="p-3.5 rounded-lg border border-border bg-background hover:border-amber-500/40 transition-all">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <Link href={`/cases/${d.case.id}`} className="font-semibold text-sm text-foreground hover:text-amber-600 transition-colors block">
                      {d.title}
                    </Link>
                    <p className="text-xs text-muted-foreground mt-0.5">{d.case.title}</p>
                    <div className="flex items-center gap-2 mt-2 text-xs">
                      <span className="font-mono text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground">Type: {d.type}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600">
                      <Clock className="w-3 h-3" />
                      {formatDate(d.date)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
