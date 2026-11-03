import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { Settings as SettingsIcon, Shield, Key, Bell, Building, Sparkles } from 'lucide-react'
import { PageTransition } from '@/components/ui/motion'

export default async function SettingsPage() {
  const session = await auth()
  if (!session) return null

  const org = await prisma.organization.findUnique({
    where: { id: session.user.organizationId },
  })

  return (
    <PageTransition>
      <div className="max-w-4xl space-y-6">
        <div>
          <h1 className="font-serif text-2xl md:text-3xl font-semibold text-foreground">Organization & System Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage firm profile, judicial rules, Gemini AI configuration, and security parameters.
          </p>
        </div>

        <div className="card-premium p-6 space-y-5">
          <h2 className="font-semibold text-base text-foreground flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center">
              <Building className="w-4 h-4 text-primary" />
            </div>
            Firm Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <label className="text-xs font-semibold text-muted-foreground">Firm Name</label>
              <input
                type="text"
                defaultValue={org?.name || 'Sharma & Mehta Associates'}
                className="mt-1.5 w-full px-3.5 py-2 text-sm rounded-xl border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground">Organization Slug</label>
              <input
                type="text"
                defaultValue={org?.slug || 'sharma-mehta'}
                disabled
                className="mt-1.5 w-full px-3.5 py-2 text-sm rounded-xl border border-input bg-muted text-muted-foreground cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        <div className="card-premium p-6 space-y-5">
          <h2 className="font-semibold text-base text-foreground flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-amber-600" />
            </div>
            Google Gemini AI Model Configuration
          </h2>
          <div className="space-y-4 text-sm">
            <div>
              <label className="text-xs font-semibold text-muted-foreground">Active Model</label>
              <select className="mt-1.5 w-full px-3.5 py-2 text-sm rounded-xl border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
                <option>Gemini 1.5 Flash (Recommended - Ultra Fast OCR & Citation Retrieval)</option>
                <option>Gemini 1.5 Pro (Deep Judicial Precedent Reasoning)</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground">Custom Gemini API Key (Optional)</label>
              <input
                type="password"
                placeholder="AIzaSy... (Leave blank to use default mock or fallback AI service)"
                className="mt-1.5 w-full px-3.5 py-2 text-sm rounded-xl border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
              />
              <p className="text-[11px] text-muted-foreground mt-1.5">
                CaseLine includes comprehensive offline mock generation if no API key is supplied.
              </p>
            </div>
          </div>
        </div>

        <div className="card-premium p-6 space-y-4">
          <h2 className="font-semibold text-base text-foreground flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center">
              <Shield className="w-4 h-4 text-emerald-600" />
            </div>
            Role-Based Access Control (RBAC)
          </h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Current session role: <strong className="text-primary font-bold">{session.user.role}</strong> with full clearance and court document audit capabilities.
          </p>
        </div>
      </div>
    </PageTransition>
  )
}
