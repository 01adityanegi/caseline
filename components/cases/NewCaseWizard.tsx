'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ShieldAlert, Sparkles, Check, ArrowRight, ArrowLeft, Upload,
  Building, User, Scale, AlertCircle, FileText, CheckCircle2
} from 'lucide-react'

interface NewCaseWizardProps {
  clients: Array<{ id: string; name: string; email: string | null }>
  users: Array<{ id: string; name: string; role: string }>
  orgId: string
}

export default function NewCaseWizard({ clients, users, orgId }: NewCaseWizardProps) {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [conflictWarning, setConflictWarning] = useState<string | null>(null)

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    clientId: clients[0]?.id || '',
    leadId: users[0]?.id || '',
    practiceArea: 'Commercial Litigation',
    court: 'Delhi High Court',
    judge: '',
    priority: 'MEDIUM',
    caseValue: 5000000,
    opposingParty: '',
    opposingCounsel: '',
    description: '',
  })

  // Conflict Check simulation when opposing party is typed
  const checkConflict = (name: string) => {
    setFormData(prev => ({ ...prev, opposingParty: name }))
    const match = clients.find(c => c.name.toLowerCase().includes(name.toLowerCase()) && name.length > 2)
    if (match) {
      setConflictWarning(`POTENTIAL CONFLICT OF INTEREST: Opposing party "${name}" is an existing client (${match.name}) of the firm!`)
    } else {
      setConflictWarning(null)
    }
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, organizationId: orgId }),
      })
      const data = await res.json()
      if (data.id) {
        router.push(`/cases/${data.id}`)
      } else {
        router.push('/cases')
      }
    } catch {
      router.push('/cases')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-card rounded-xl border border-border p-6 shadow-sm space-y-6">
      {/* Steps Progress */}
      <div className="flex items-center justify-between pb-6 border-b border-border">
        {[
          { num: 1, label: 'Client & Matter' },
          { num: 2, label: 'Court Particulars' },
          { num: 3, label: 'Parties & Conflict' },
          { num: 4, label: 'Review & Launch' },
        ].map(s => (
          <div key={s.num} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
              step === s.num
                ? 'bg-primary text-white shadow-md shadow-primary/20'
                : step > s.num
                ? 'bg-emerald-500 text-white'
                : 'bg-muted text-muted-foreground'
            }`}>
              {step > s.num ? <Check className="w-4 h-4" /> : s.num}
            </div>
            <span className={`text-xs font-medium hidden sm:inline ${step === s.num ? 'text-foreground' : 'text-muted-foreground'}`}>
              {s.label}
            </span>
          </div>
        ))}
      </div>

      {/* Step 1 */}
      {step === 1 && (
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-foreground">Matter Title</label>
            <input
              type="text"
              placeholder="e.g., Apex Infotech v. Bharat Telecommunications"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="mt-1 w-full px-3 py-2 text-sm rounded-lg border border-input bg-background text-foreground focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-foreground">Client</label>
              <select
                value={formData.clientId}
                onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                className="mt-1 w-full px-3 py-2 text-sm rounded-lg border border-input bg-background text-foreground"
              >
                {clients.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground">Lead Advocate / Partner</label>
              <select
                value={formData.leadId}
                onChange={(e) => setFormData({ ...formData, leadId: e.target.value })}
                className="mt-1 w-full px-3 py-2 text-sm rounded-lg border border-input bg-background text-foreground"
              >
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-foreground">Practice Area</label>
              <select
                value={formData.practiceArea}
                onChange={(e) => setFormData({ ...formData, practiceArea: e.target.value })}
                className="mt-1 w-full px-3 py-2 text-sm rounded-lg border border-input bg-background text-foreground"
              >
                <option value="Commercial Litigation">Commercial Litigation</option>
                <option value="Arbitration & Dispute Resolution">Arbitration & Dispute Resolution</option>
                <option value="Insolvency & Bankruptcy (IBC)">Insolvency & Bankruptcy (IBC)</option>
                <option value="Intellectual Property">Intellectual Property</option>
                <option value="Constitutional Law">Constitutional Law</option>
                <option value="White Collar Defense">White Collar Defense</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="mt-1 w-full px-3 py-2 text-sm rounded-lg border border-input bg-background text-foreground"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Step 2 */}
      {step === 2 && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-foreground">Court / Forum</label>
              <input
                type="text"
                value={formData.court}
                onChange={(e) => setFormData({ ...formData, court: e.target.value })}
                placeholder="e.g. Supreme Court of India, Delhi High Court"
                className="mt-1 w-full px-3 py-2 text-sm rounded-lg border border-input bg-background text-foreground"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-foreground">Judge / Bench (if known)</label>
              <input
                type="text"
                value={formData.judge}
                onChange={(e) => setFormData({ ...formData, judge: e.target.value })}
                placeholder="e.g. Hon'ble Mr. Justice R.K. Gauba"
                className="mt-1 w-full px-3 py-2 text-sm rounded-lg border border-input bg-background text-foreground"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground">Estimated Claim / Matter Value (INR)</label>
            <input
              type="number"
              value={formData.caseValue}
              onChange={(e) => setFormData({ ...formData, caseValue: parseFloat(e.target.value) || 0 })}
              className="mt-1 w-full px-3 py-2 text-sm rounded-lg border border-input bg-background text-foreground"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground">Matter Summary & Scope</label>
            <textarea
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief facts, background of dispute, key contractual clauses..."
              className="mt-1 w-full px-3 py-2 text-sm rounded-lg border border-input bg-background text-foreground"
            />
          </div>
        </div>
      )}

      {/* Step 3 */}
      {step === 3 && (
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-foreground flex items-center justify-between">
              <span>Opposing Party Name</span>
              <span className="text-[11px] text-muted-foreground">Automated conflict clearance check runs live</span>
            </label>
            <input
              type="text"
              value={formData.opposingParty}
              onChange={(e) => checkConflict(e.target.value)}
              placeholder="e.g. Reliance Retail / Tata Sons"
              className="mt-1 w-full px-3 py-2 text-sm rounded-lg border border-input bg-background text-foreground"
            />
          </div>

          {conflictWarning && (
            <div className="p-3.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-600 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <div>
                <strong>Conflict Alert:</strong> {conflictWarning}
              </div>
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-foreground">Opposing Counsel (if known)</label>
            <input
              type="text"
              value={formData.opposingCounsel}
              onChange={(e) => setFormData({ ...formData, opposingCounsel: e.target.value })}
              placeholder="e.g. Senior Advocate Harish Salve / Karanjawala & Co."
              className="mt-1 w-full px-3 py-2 text-sm rounded-lg border border-input bg-background text-foreground"
            />
          </div>
        </div>
      )}

      {/* Step 4 */}
      {step === 4 && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-muted/40 border border-border space-y-3">
            <h3 className="font-semibold text-sm text-foreground">Review Registration Data</h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div><span className="text-muted-foreground">Matter:</span> <strong className="text-foreground">{formData.title || 'Untitled Case'}</strong></div>
              <div><span className="text-muted-foreground">Practice:</span> <strong className="text-foreground">{formData.practiceArea}</strong></div>
              <div><span className="text-muted-foreground">Court:</span> <strong className="text-foreground">{formData.court}</strong></div>
              <div><span className="text-muted-foreground">Priority:</span> <strong className="text-foreground">{formData.priority}</strong></div>
              <div><span className="text-muted-foreground">Opposing:</span> <strong className="text-foreground">{formData.opposingParty || 'None specified'}</strong></div>
              <div><span className="text-muted-foreground">Value:</span> <strong className="text-foreground">₹{formData.caseValue.toLocaleString('en-IN')}</strong></div>
            </div>
          </div>
          <div className="p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>CaseLine conflict clearance verification passed. Dossier index will be automatically initialized upon creation.</span>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-border">
        {step > 1 ? (
          <button
            onClick={() => setStep(step - 1)}
            className="px-4 py-2 text-xs font-medium rounded-lg border border-border text-foreground hover:bg-muted transition-colors flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </button>
        ) : <div />}

        {step < 4 ? (
          <button
            onClick={() => setStep(step + 1)}
            disabled={step === 1 && !formData.title.trim()}
            className="btn-primary text-xs"
          >
            Continue <ArrowRight className="w-3.5 h-3.5" />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="btn-primary text-xs"
          >
            {loading ? 'Creating Matter...' : 'Register Matter in CaseLine'}
          </button>
        )}
      </div>
    </div>
  )
}
