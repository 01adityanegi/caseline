import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { ALL_TEMPLATES } from '@/templates'
import AgreementWizard from '@/components/agreements/AgreementWizard'

export default async function NewAgreementPage({
  searchParams,
}: {
  searchParams: Promise<{ template?: string; clientId?: string }>
}) {
  const session = await auth()
  if (!session) return null

  const { template: preselectedCode, clientId: preselectedClientId } = await searchParams

  const [savedParties, cases, clients] = await Promise.all([
    prisma.savedParty.findMany({
      where: { organizationId: session.user.organizationId },
      orderBy: { nameEn: 'asc' },
    }),
    prisma.case.findMany({
      where: { organizationId: session.user.organizationId },
      select: { id: true, title: true, caseNumber: true },
      take: 50,
    }),
    prisma.client.findMany({
      where: { organizationId: session.user.organizationId },
      select: { id: true, name: true, email: true, phone: true, city: true },
      orderBy: { name: 'asc' },
      take: 100,
    }),
  ])

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <AgreementWizard
        templates={ALL_TEMPLATES}
        preselectedTemplateCode={preselectedCode}
        preselectedClientId={preselectedClientId}
        savedParties={savedParties}
        cases={cases}
        clients={clients}
        user={session.user}
      />
    </div>
  )
}
