import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import NewCaseWizard from '@/components/cases/NewCaseWizard'

export default async function NewCasePage() {
  const session = await auth()
  if (!session) return null

  const [clients, users] = await Promise.all([
    prisma.client.findMany({
      where: { organizationId: session.user.organizationId },
      select: { id: true, name: true, email: true },
      orderBy: { name: 'asc' },
    }),
    prisma.user.findMany({
      where: { organizationId: session.user.organizationId, role: { in: ['PARTNER', 'ASSOCIATE'] } },
      select: { id: true, name: true, role: true },
    }),
  ])

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold text-foreground">New Case Registration</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Open a new case matter with automatic conflict check and optional AI document intake.
        </p>
      </div>

      <NewCaseWizard clients={clients} users={users} orgId={session.user.organizationId} />
    </div>
  )
}
