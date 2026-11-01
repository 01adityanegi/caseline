import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { formatDate } from '@/lib/utils'
import { Bell, CheckCircle2, AlertTriangle, Info, Calendar, Clock, ExternalLink } from 'lucide-react'
import Link from 'next/link'

export default async function NotificationsPage() {
  const session = await auth()
  if (!session) return null

  const notifications = await prisma.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-foreground">Notification Dispatch</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Urgent cause list updates, limitation warnings, and document processing alerts.
          </p>
        </div>
        <button className="text-xs font-medium px-3 py-1.5 rounded-lg border border-border hover:bg-muted transition-colors">
          Mark all as read
        </button>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-sm divide-y divide-border/60">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-xs text-muted-foreground">
            No active alerts in dispatch.
          </div>
        ) : (
          notifications.map(n => (
            <div key={n.id} className="p-4 flex items-start gap-3 hover:bg-muted/20 transition-colors">
              <div className="w-8 h-8 rounded-full bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                <Bell className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-sm text-foreground">{n.title}</h4>
                  <span className="text-[11px] text-muted-foreground">{formatDate(n.createdAt)}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{n.body}</p>
                {n.link && (
                  <Link href={n.link} className="inline-flex items-center gap-1 text-xs text-primary font-medium mt-2 hover:underline">
                    Inspect Matter <ExternalLink className="w-3 h-3" />
                  </Link>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
