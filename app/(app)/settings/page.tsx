import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { Settings as SettingsIcon, Shield, Key, Bell, Building, Sparkles } from 'lucide-react'

export default async function SettingsPage() {
  const session = await auth()
  if (!session) return null

  const org = await prisma.organization.findUnique({
    where: { id: session.user.organizationId },
  })

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold text-foreground">Organization & System Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage firm profile, judicial rules, Gemini AI configuration, and security parameters.
        </p>
      </div>

      <div className="bg-card rounded-xl border border-border p-6 shadow-sm space-y-6">
        <h2 className="font-semibold text-base text-foreground flex items-center gap-2">
          <Building className="w-4 h-4 text-primary" />
          Firm Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <label className="text-xs font-semibold text-muted-foreground">Firm Name</label>
            <input
              type="text"
              defaultValue={org?.name || 'Sharma & Mehta Associates'}
              className="mt-1 w-full px-3 py-2 text-sm rounded-lg border border-input bg-background"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground">Organization Slug</label>
            <input
              type="text"
              defaultValue={org?.slug || 'sharma-mehta'}
              disabled
              className="mt-1 w-full px-3 py-2 text-sm rounded-lg border border-input bg-muted text-muted-foreground"
            />
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border p-6 shadow-sm space-y-6">
        <h2 className="font-semibold text-base text-foreground flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          Google Gemini AI Model Configuration
        </h2>
        <div className="space-y-4 text-sm">
          <div>
            <label className="text-xs font-semibold text-muted-foreground">Active Model</label>
            <select className="mt-1 w-full px-3 py-2 text-sm rounded-lg border border-input bg-background">
              <option>Gemini 1.5 Flash (Recommended - Ultra Fast OCR & Citation Retrieval)</option>
              <option>Gemini 1.5 Pro (Deep Judicial Precedent Reasoning)</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground">Custom Gemini API Key (Optional)</label>
            <input
              type="password"
              placeholder="AIzaSy... (Leave blank to use default hackathon key or mock service)"
              className="mt-1 w-full px-3 py-2 text-sm rounded-lg border border-input bg-background"
            />
            <p className="text-[11px] text-muted-foreground mt-1">
              CaseLine includes comprehensive offline mock generation if no API key is supplied.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border p-6 shadow-sm space-y-6">
        <h2 className="font-semibold text-base text-foreground flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-600" />
          Role-Based Access Control (RBAC)
        </h2>
        <p className="text-xs text-muted-foreground">
          Current session role: <strong className="text-primary">{session.user.role}</strong> with full clearance.
        </p>
      </div>
    </div>
  )
}
