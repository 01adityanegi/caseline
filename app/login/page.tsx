import { auth } from '@/lib/auth'
import UnifiedLandingPage from '@/components/landing/UnifiedLandingPage'

export const metadata = {
  title: 'Sign In & Sign Up | CaseLine',
  description: 'Sign in to CaseLine or create your firm workspace.'
}

export default async function LoginPage() {
  const session = await auth()
  return <UnifiedLandingPage currentUser={session?.user || null} />
}
