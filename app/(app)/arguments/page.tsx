import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { redirect } from 'next/navigation'
import ArgumentAnalyzerClient from '@/components/arguments/ArgumentAnalyzerClient'
import { getCaseFilter } from '@/lib/rbac'

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <ArgumentAnalyzerClient cases={cases} />
    </div>
  )
}

