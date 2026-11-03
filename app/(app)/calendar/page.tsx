import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { formatDate } from '@/lib/utils'
import { Calendar as CalendarIcon, Clock, Scale, AlertTriangle, Plus, ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { PageTransition, RevealOnScroll } from '@/components/ui/motion'

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
    <PageTransition>
      <div className="space-y-6 max-w-[1400px]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-serif text-2xl md:text-3xl font-semibold text-foreground">Court Calendar & Deadlines</h1>
            <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
              Track daily cause lists, upcoming judicial hearings, and limitation deadlines across benches.
            </p>
          </div>
          <button className="btn-primary text-xs self-start sm:self-auto cursor-pointer">
            <Plus className="w-3.5 h-3.5" />
            Schedule Hearing
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upcoming Hearings */}
          <RevealOnScroll>
            <div className="card-premium p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h2 className="font-semibold text-base text-foreground flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Scale className="w-4 h-4 text-blue-600" />
                  </div>
                  Court Hearings Schedule ({hearings.length})
                </h2>
                <span className="text-xs text-muted-foreground font-medium hidden sm:inline">High Courts & Tribunals</span>
              </div>

              <div className="space-y-3">
                {hearings.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">No scheduled hearings</p>
                ) : (
                  hearings.map(h => (
                    <div key={h.id} className="p-3.5 rounded-xl border border-border bg-background hover:border-primary/40 hover:shadow-xs transition-all">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <Link href={`/cases/${h.case.id}`} className="font-semibold text-sm text-foreground hover:text-primary transition-colors block truncate">
                            {h.title}
                          </Link>
                          <p className="text-xs text-muted-foreground mt-0.5 truncate">{h.case.title}</p>
                          <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground flex-wrap">
                            <span className="font-mono text-[11px] font-bold text-primary">{h.case.court || 'Court Pending'}</span>
                            <span>•</span>
                            <span>Time: {h.time || '10:30 AM'}</span>
                          </div>
                        </div>

                        <div className="self-start sm:self-auto flex-shrink-0">
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-600 border border-blue-500/20">
                            <CalendarIcon className="w-3 h-3" />
                            {formatDate(h.date)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </RevealOnScroll>

          {/* Limitation & Statutory Deadlines */}
          <RevealOnScroll>
            <div className="card-premium p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h2 className="font-semibold text-base text-foreground flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center">
                    <Clock className="w-4 h-4 text-amber-600" />
                  </div>
                  Statutory Deadlines & Limitation ({deadlines.length})
                </h2>
                <span className="text-xs text-muted-foreground font-medium hidden sm:inline">Automated Guardian</span>
              </div>

              <div className="space-y-3">
                {deadlines.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">No statutory deadlines recorded</p>
                ) : (
                  deadlines.map(d => (
                    <div key={d.id} className="p-3.5 rounded-xl border border-border bg-background hover:border-amber-500/40 hover:shadow-xs transition-all">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <Link href={`/cases/${d.case.id}`} className="font-semibold text-sm text-foreground hover:text-amber-600 transition-colors block truncate">
                            {d.title}
                          </Link>
                          <p className="text-xs text-muted-foreground mt-0.5 truncate">{d.case.title}</p>
                          <div className="flex items-center gap-2 mt-2 text-xs">
                            <span className="font-mono text-[10px] bg-muted px-2 py-0.5 rounded text-muted-foreground font-medium">Type: {d.type}</span>
                          </div>
                        </div>

                        <div className="self-start sm:self-auto flex-shrink-0">
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20">
                            <Clock className="w-3 h-3" />
                            {formatDate(d.date)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </RevealOnScroll>
        </div>
      </div>
    </PageTransition>
  )
}
