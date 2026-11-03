import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { redirect } from 'next/navigation'
import ArgumentAnalyzerClient from '@/components/arguments/ArgumentAnalyzerClient'
import { getCaseFilter } from '@/lib/rbac'
import { PageTransition } from '@/components/ui/motion'

export const metadata = {
  title: 'AI Argument Evaluator | CaseLine',
  description: 'Evaluate legal dispute arguments from both client and owner perspectives, assess advantages and disadvantages, and discover actionable improvements.'
}

export default async function ArgumentsPage() {
  const session = await auth()
  if (!session?.user) {
    redirect('/login')
  }

  const caseFilter = await getCaseFilter(session.user)

  // Fetch active cases for quick attachment
  const cases = await prisma.case.findMany({
    where: caseFilter,
    select: {
      id: true,
      title: true,
      caseNumber: true
    },
    orderBy: { updatedAt: 'desc' },
    take: 20
  })

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-4 sm:py-6">
        <ArgumentAnalyzerClient cases={cases} />
      </div>
    </PageTransition>
  )
}
