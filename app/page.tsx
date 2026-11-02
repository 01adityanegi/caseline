import { auth } from '@/lib/auth'
import UnifiedLandingPage from '@/components/landing/UnifiedLandingPage'

export const metadata = {
  title: 'CaseLine — AI Legal OS & AgreementStudio',
  description: 'The intelligent workspace for high-stakes legal matters. Centralize cases, court hearings, deadlines, and bilingual agreements.'
}

export default async function LandingPage() {
  const session = await auth()
  return <UnifiedLandingPage currentUser={session?.user || null} />
}
