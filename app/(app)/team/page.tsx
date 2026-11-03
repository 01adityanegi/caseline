import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { redirect } from 'next/navigation'
import { Users, Scale, Clock, CheckCircle2, AlertTriangle, Sparkles, Plus } from 'lucide-react'
import { PageTransition, StaggerList, StaggerItem } from '@/components/ui/motion'

export default async function TeamPage() {
  const session = await auth()
  if (!session) return null
  if (session.user.role === 'CLIENT') redirect('/dashboard')

  const users = await prisma.user.findMany({
    where: { organizationId: session.user.organizationId },
    include: {
      assignedCases: { select: { id: true, title: true, status: true, riskScore: true } },
      tasks: { select: { id: true, status: true } },
      timeEntries: { select: { hours: true } },
    },
    orderBy: { role: 'asc' },
  })

  return (
    <PageTransition>
      <div className="space-y-6 max-w-[1400px]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-serif text-2xl md:text-3xl font-semibold text-foreground">Team & Workload Balancer</h1>
            <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
              Real-time capacity tracking across Partners, Associates, and Paralegals to avoid attorney burnout.
            </p>
          </div>
          <button className="btn-primary text-xs self-start sm:self-auto cursor-pointer">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            AI Workload Rebalance
          </button>
        </div>

        <StaggerList className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {users.map(u => {
            const activeCases = u.assignedCases.filter(c => c.status !== 'CLOSED').length
            const totalHours = u.timeEntries.reduce((acc, t) => acc + t.hours, 0)
            const openTasks = u.tasks.filter(t => t.status !== 'COMPLETED').length

            // Utilization score (e.g. 6 cases = 100%)
            const utilization = Math.min(100, Math.round((activeCases / 6) * 100))
            const isOverloaded = utilization > 80

            return (
              <StaggerItem key={u.id}>
                <div className="card-premium p-5 space-y-4 hover:border-primary/40 transition-all flex flex-col justify-between h-full">
                  <div>
                    <div className="flex items-start justify-between">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-base text-foreground truncate">{u.name}</h3>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 mt-1 inline-block border border-blue-500/20">
                          {u.role}
                        </span>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-sm flex-shrink-0">
                        {u.name.charAt(0)}
                      </div>
                    </div>

                    <div className="space-y-2 text-xs mt-4">
                      <div>
                        <div className="flex items-center justify-between text-muted-foreground mb-1.5">
                          <span className="font-medium">Workload Capacity</span>
                          <span className={`font-mono font-bold ${isOverloaded ? 'text-red-500' : 'text-foreground'}`}>
                            {utilization}%
                          </span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              isOverloaded ? 'bg-red-500' : utilization > 50 ? 'bg-amber-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${utilization}%` }}
                          />
                        </div>
                      </div>

                      <div className="pt-3 border-t border-border/80 grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-muted-foreground font-medium">Active Cases</span>
                          <p className="font-bold text-foreground text-base font-mono mt-0.5">{activeCases}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground font-medium">Open Tasks</span>
                          <p className="font-bold text-foreground text-base font-mono mt-0.5">{openTasks}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {isOverloaded && (
                    <div className="text-[11px] bg-red-500/10 text-red-600 p-2.5 rounded-xl flex items-center gap-1.5 font-medium border border-red-500/20">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span>High capacity: Consider reassigning filings</span>
                    </div>
                  )}
                </div>
              </StaggerItem>
            )
          })}
        </StaggerList>
      </div>
    </PageTransition>
  )
}
