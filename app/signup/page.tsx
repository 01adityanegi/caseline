import { auth } from '@/lib/auth'
import UnifiedLandingPage from '@/components/landing/UnifiedLandingPage'

export const metadata = {
  title: 'Sign Up & Create Firm Workspace | CaseLine',
  description: 'Create your firm workspace on CaseLine with instant digital onboarding.'
}

export default async function SignUpPage() {
  const session = await auth()
  return <UnifiedLandingPage currentUser={session?.user || null} />
}

