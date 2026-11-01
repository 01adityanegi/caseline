import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'
import MobileNav from '@/components/layout/MobileNav'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session) {
    redirect('/login')
  }

  const userData = {
    name: session.user.name || 'User',
    email: session.user.email || '',
    role: session.user.role,
    organizationName: session.user.organizationName,
  }

  return (
    <div className="app-shell flex h-screen overflow-hidden bg-background">
      <div className="hidden md:flex">
        <Sidebar user={userData} />
      </div>
      <div className="main-content flex-1 flex flex-col overflow-hidden w-full">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-24 md:pb-6 bg-background">
          {children}
        </main>
      </div>
      <MobileNav user={userData} />
    </div>
  )
}
