import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { formatDate } from '@/lib/utils'
import { Bell, CheckCircle2, AlertTriangle, Info, Calendar, Clock, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { PageTransition } from '@/components/ui/motion'

export default async function NotificationsPage() {
  const session = await auth()
  if (!session) return null

  const notifications = await prisma.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <PageTransition>
      <div className="max-w-4xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="font-serif text-2xl md:text-3xl font-semibold text-foreground">Notification Dispatch</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Urgent cause list updates, limitation warnings, and document processing alerts.
            </p>
          </div>
          <button className="text-xs font-semibold px-3.5 py-1.5 rounded-xl border border-border hover:bg-muted transition-colors self-start sm:self-auto cursor-pointer">
            Mark all as read
          </button>
        </div>

        <div className="card-premium divide-y divide-border/60 overflow-hidden">
          {notifications.length === 0 ? (
            <div className="p-12 text-center text-sm text-muted-foreground flex flex-col items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                <Bell className="w-5 h-5 text-muted-foreground" />
              </div>
              <p className="font-medium text-foreground">No active alerts in dispatch</p>
              <p className="text-xs text-muted-foreground mt-1">All judicial notifications and filings are up to date.</p>
            </div>
          ) : (
            notifications.map(n => (
              <div key={n.id} className="p-4 sm:p-5 flex items-start gap-3.5 hover:bg-muted/30 transition-colors">
                <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                  <Bell className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <h4 className="font-semibold text-sm text-foreground truncate">{n.title}</h4>
                    <span className="text-[11px] text-muted-foreground font-mono flex-shrink-0">{formatDate(n.createdAt)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{n.body}</p>
                  {n.link && (
                    <Link href={n.link} className="inline-flex items-center gap-1.5 text-xs text-primary font-semibold mt-2.5 hover:underline">
                      Inspect Matter <ExternalLink className="w-3 h-3" />
                    </Link>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </PageTransition>
  )
}
