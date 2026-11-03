import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { formatCurrency, formatDate } from '@/lib/utils'
import { DollarSign, Receipt, Clock, CheckCircle2, AlertCircle, Plus, Download } from 'lucide-react'
import { getInvoiceFilter, isClientUser } from '@/lib/rbac'
import { PageTransition, StaggerList, StaggerItem, RevealOnScroll } from '@/components/ui/motion'

export default async function BillingPage() {
  const session = await auth()
  if (!session) return null

  const isClient = isClientUser(session.user)
  const invoiceFilter = await getInvoiceFilter(session.user)

  const [invoices, timeEntries] = await Promise.all([
    prisma.invoice.findMany({
      where: invoiceFilter,
      include: { client: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
      take: 20,
    }),
    isClient
      ? Promise.resolve([])
      : prisma.timeEntry.findMany({
          where: { case: { organizationId: session.user.organizationId } },
          include: { case: { select: { title: true, caseNumber: true } }, user: { select: { name: true } } },
          orderBy: { date: 'desc' },
          take: 20,
        }),
  ])

  const totalInvoiced = invoices.reduce((acc, i) => acc + i.total, 0)
  const paidInvoiced = invoices.filter(i => i.status === 'PAID').reduce((acc, i) => acc + i.total, 0)
  const pendingInvoiced = invoices.filter(i => i.status !== 'PAID').reduce((acc, i) => acc + i.total, 0)

  return (
    <PageTransition>
      <div className="space-y-6 max-w-[1400px]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-serif text-2xl md:text-3xl font-semibold text-foreground">
              {isClient ? 'My Invoices & Billing Statements' : 'Billing & Time Ledgers'}
            </h1>
            <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
              {isClient
                ? 'Review fee notes, payment receipts, and settled dues for your legal representation.'
                : 'Track billable attorney hours, generate GST invoices, and reconcile client disbursements.'}
            </p>
          </div>
          {!isClient && (
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button className="btn-primary text-xs">
                <Plus className="w-3.5 h-3.5" />
                Generate Invoice
              </button>
            </div>
          )}
        </div>

        {/* KPI Cards */}
        <StaggerList className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StaggerItem>
            <div className="card-premium p-5">
              <p className="text-xs font-medium text-muted-foreground">Total Invoiced (FY 2026)</p>
              <p className="font-mono text-2xl md:text-3xl font-bold text-foreground mt-1 tracking-tight">{formatCurrency(totalInvoiced)}</p>
              <p className="text-[11px] text-muted-foreground mt-1.5 font-medium">{invoices.length} invoices issued</p>
            </div>
          </StaggerItem>

          <StaggerItem>
            <div className="card-premium p-5">
              <p className="text-xs font-medium text-muted-foreground">Collected Revenue</p>
              <p className="font-mono text-2xl md:text-3xl font-bold text-emerald-600 mt-1 tracking-tight">{formatCurrency(paidInvoiced)}</p>
              <p className="text-[11px] text-emerald-600/90 mt-1.5 font-medium">Settled in full</p>
            </div>
          </StaggerItem>

          <StaggerItem>
            <div className="card-premium p-5">
              <p className="text-xs font-medium text-muted-foreground">Outstanding Receivables</p>
              <p className="font-mono text-2xl md:text-3xl font-bold text-amber-600 mt-1 tracking-tight">{formatCurrency(pendingInvoiced)}</p>
              <p className="text-[11px] text-amber-600/90 mt-1.5 font-medium">Awaiting client disbursement</p>
            </div>
          </StaggerItem>
        </StaggerList>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Invoices Table */}
          <RevealOnScroll>
            <div className="card-premium p-5 space-y-4">
              <h2 className="font-semibold text-base text-foreground flex items-center gap-2">
                <Receipt className="w-4 h-4 text-primary" />
                Recent Invoices
              </h2>
              <div className="overflow-x-auto no-scrollbar">
                <table className="w-full text-left text-xs min-w-[400px]">
                  <thead className="bg-muted/40 uppercase tracking-wider text-muted-foreground border-b border-border text-[10px] font-semibold">
                    <tr>
                      <th className="py-2.5 px-3">Invoice #</th>
                      <th className="py-2.5 px-3">Client</th>
                      <th className="py-2.5 px-3">Amount</th>
                      <th className="py-2.5 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {invoices.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-6 text-center text-muted-foreground text-xs">
                          No invoices found
                        </td>
                      </tr>
                    ) : (
                      invoices.map(inv => (
                        <tr key={inv.id} className="hover:bg-muted/30 transition-colors">
                          <td className="py-3 px-3 font-mono font-medium text-foreground">{inv.number}</td>
                          <td className="py-3 px-3 text-muted-foreground truncate max-w-[120px] font-medium">{inv.client.name}</td>
                          <td className="py-3 px-3 font-mono font-semibold text-foreground">{formatCurrency(inv.total)}</td>
                          <td className="py-3 px-3">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              inv.status === 'PAID' ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                            }`}>
                              {inv.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </RevealOnScroll>

          {/* Time Entries Table */}
          <RevealOnScroll>
            <div className="card-premium p-5 space-y-4">
              <h2 className="font-semibold text-base text-foreground flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                Unbilled & Logged Time Entries
              </h2>
              <div className="divide-y divide-border/60 max-h-[380px] overflow-y-auto no-scrollbar">
                {timeEntries.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-6">No time entries recorded</p>
                ) : (
                  timeEntries.map(te => (
                    <div key={te.id} className="py-3 flex items-center justify-between text-xs gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-foreground truncate">{te.description}</p>
                        <p className="text-muted-foreground mt-0.5 truncate">{te.case.caseNumber} • {te.user.name}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-mono font-bold text-foreground">{formatCurrency(te.hours * te.rate)}</p>
                        <p className="text-[11px] text-muted-foreground">{te.hours} hrs @ {formatCurrency(te.rate)}/hr</p>
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
