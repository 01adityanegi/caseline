import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { redirect } from 'next/navigation'
import ClientDirectoryView from '@/components/clients/ClientDirectoryView'

export default async function ClientsPage() {
  const session = await auth()
  if (!session) return null
  if (session.user.role === 'CLIENT') redirect('/dashboard')

  const clients = await prisma.client.findMany({
    where: { organizationId: session.user.organizationId },
    include: {
      cases: { select: { id: true, title: true, caseNumber: true, status: true } },
      invoices: { select: { total: true, status: true } },
      agreements: { select: { id: true, title: true, agreementNumber: true, status: true } },
    },
    orderBy: { name: 'asc' },
  })

  return <ClientDirectoryView initialClients={clients} />
}
