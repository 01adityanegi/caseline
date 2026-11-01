import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { formatCurrency, formatDate } from '@/lib/utils'
import { DollarSign, Receipt, Clock, CheckCircle2, AlertCircle, Plus, Download } from 'lucide-react'

import { getInvoiceFilter, isClientUser } from '@/lib/rbac'

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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-foreground">
            {isClient ? 'My Invoices & Billing Statements' : 'Billing & Time Ledgers'}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isClient
              ? 'Review fee notes, payment receipts, and settled dues for your legal representation.'
              : 'Track billable attorney hours, generate GST invoices, and reconcile client disbursements.'}
          </p>
        </div>
        {!isClient && (
          <div className="flex items-center gap-2">
            <button className="btn-primary text-xs">
              <Plus className="w-3.5 h-3.5" />
              Generate Invoice
            </button>
          </div>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card p-5 rounded-xl border border-border shadow-sm">
          <p className="text-xs text-muted-foreground">Total Invoiced (FY 2026)</p>
          <p className="font-mono text-2xl font-bold text-foreground mt-1">{formatCurrency(totalInvoiced)}</p>
          <p className="text-[11px] text-muted-foreground mt-1">{invoices.length} invoices issued</p>
        </div>

        <div className="bg-card p-5 rounded-xl border border-border shadow-sm">
          <p className="text-xs text-muted-foreground">Collected Revenue</p>
          <p className="font-mono text-2xl font-bold text-emerald-600 mt-1">{formatCurrency(paidInvoiced)}</p>
          <p className="text-[11px] text-emerald-600/80 mt-1">Settled in full</p>
        </div>

        <div className="bg-card p-5 rounded-xl border border-border shadow-sm">
          <p className="text-xs text-muted-foreground">Outstanding Receivables</p>
          <p className="font-mono text-2xl font-bold text-amber-600 mt-1">{formatCurrency(pendingInvoiced)}</p>
          <p className="text-[11px] text-amber-600/80 mt-1">Awaiting client disbursement</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Invoices Table */}
        <div className="bg-card rounded-xl border border-border p-5 shadow-sm space-y-4">
          <h2 className="font-semibold text-base text-foreground flex items-center gap-2">
            <Receipt className="w-4 h-4 text-primary" />
            Recent Invoices
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/40 uppercase tracking-wider text-muted-foreground border-b border-border">
                <tr>
                  <th className="py-2.5 px-3">Invoice #</th>
                  <th className="py-2.5 px-3">Client</th>
                  <th className="py-2.5 px-3">Amount</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {invoices.map(inv => (
                  <tr key={inv.id} className="hover:bg-muted/30">
                    <td className="py-2.5 px-3 font-mono font-medium text-foreground">{inv.number}</td>
                    <td className="py-2.5 px-3 text-muted-foreground truncate max-w-[120px]">{inv.client.name}</td>
                    <td className="py-2.5 px-3 font-mono font-semibold text-foreground">{formatCurrency(inv.total)}</td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        inv.status === 'PAID' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'
                      }`}>
                        {inv.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Time Entries Table */}
        <div className="bg-card rounded-xl border border-border p-5 shadow-sm space-y-4">
          <h2 className="font-semibold text-base text-foreground flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            Unbilled & Logged Time Entries
          </h2>
          <div className="divide-y divide-border/60">
            {timeEntries.map(te => (
              <div key={te.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <p className="font-semibold text-foreground">{te.description}</p>
                  <p className="text-muted-foreground mt-0.5">{te.case.caseNumber} • {te.user.name}</p>
                </div>
                <div className="text-right">
                  <p className="font-mono font-bold text-foreground">{formatCurrency(te.hours * te.rate)}</p>
                  <p className="text-[11px] text-muted-foreground">{te.hours} hrs @ {formatCurrency(te.rate)}/hr</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
