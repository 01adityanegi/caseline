'use client'

import React, { useState } from 'react'
import {
  X,
  UserPlus,
  Building,
  Mail,
  Phone,
  MapPin,
  FileText,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Loader2
} from 'lucide-react'

interface OnboardClientModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: (newClient: any) => void
}

export default function OnboardClientModal({
  isOpen,
  onClose,
  onSuccess,
}: OnboardClientModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    type: 'INDIVIDUAL',
    email: '',
    phone: '',
    address: '',
    city: 'New Delhi',
    state: 'Delhi',
    pin: '',
    pan: '',
    gstin: '',
    notes: '',
    createPortalLogin: true,
    portalPassword: 'client123',
  })

  if (!isOpen) return null

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData(prev => ({ ...prev, [name]: checked }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) {
      setError('Client name is required')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to onboard client')
      }

      setSuccessMessage(`Client ${data.client.name} onboarded successfully!${data.portalUserCreated ? ' Portal login created.' : ''}`)
      setTimeout(() => {
        onSuccess?.(data.client)
        onClose()
      }, 1000)
    } catch (err: any) {
      setError(err.message || 'Error onboarding client')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-card w-full max-w-2xl rounded-2xl border border-border shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border bg-muted/20">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-bold text-foreground">Onboard New Client</h2>
              <p className="text-xs text-muted-foreground">Add client profile and optionally create portal access</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1 text-xs">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5 md:col-span-2">
              <label className="font-semibold text-foreground">
                Client / Company Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Vikramaditya Realtech Pvt Ltd or Sunita Devi"
                required
                className="w-full px-3 py-2 rounded-xl border border-input bg-background text-foreground text-xs focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">Client Entity Type</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-xl border border-input bg-background text-foreground text-xs focus:ring-2 focus:ring-primary/20"
              >
                <option value="INDIVIDUAL">Individual Person</option>
                <option value="CORPORATE">Private Limited / Public Ltd</option>
                <option value="LLP">Limited Liability Partnership (LLP)</option>
                <option value="PARTNERSHIP">Partnership Firm</option>
                <option value="PROPRIETORSHIP">Sole Proprietorship</option>
                <option value="GOVERNMENT">PSU / Government Entity</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">Email Address</label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 absolute left-3 top-2.5 text-muted-foreground" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="client@domain.com"
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-input bg-background text-foreground text-xs focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">Contact Phone</label>
              <div className="relative">
                <Phone className="w-3.5 h-3.5 absolute left-3 top-2.5 text-muted-foreground" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91 98765 43210"
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-input bg-background text-foreground text-xs focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">PAN Number (Permanent Account No.)</label>
              <input
                type="text"
                name="pan"
                value={formData.pan}
                onChange={handleChange}
                placeholder="e.g. ABCDE1234F"
                maxLength={10}
                className="w-full px-3 py-2 uppercase font-mono rounded-xl border border-input bg-background text-foreground text-xs focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">GSTIN (Optional)</label>
              <input
                type="text"
                name="gstin"
                value={formData.gstin}
                onChange={handleChange}
                placeholder="07AAAAA0000A1Z5"
                maxLength={15}
                className="w-full px-3 py-2 uppercase font-mono rounded-xl border border-input bg-background text-foreground text-xs focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">City & State</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="City"
                  className="px-3 py-2 rounded-xl border border-input bg-background text-foreground text-xs"
                />
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="State"
                  className="px-3 py-2 rounded-xl border border-input bg-background text-foreground text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="font-semibold text-foreground">Registered Office / Residential Address</label>
              <textarea
                name="address"
                rows={2}
                value={formData.address}
                onChange={handleChange}
                placeholder="Complete street address, premise number, landmark, PIN code"
                className="w-full px-3 py-2 rounded-xl border border-input bg-background text-foreground text-xs focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          {/* Client Portal Access Toggle */}
          <div className="p-3.5 rounded-xl bg-primary/5 border border-primary/20 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-primary" />
                <div>
                  <span className="font-bold text-foreground block">Client Portal Account Access</span>
                  <span className="text-[11px] text-muted-foreground">
                    Allow client to log in directly to review, sign, and download their agreements
                  </span>
                </div>
              </div>
              <input
                type="checkbox"
                name="createPortalLogin"
                checked={formData.createPortalLogin}
                onChange={handleChange}
                className="w-4 h-4 rounded text-primary focus:ring-primary"
              />
            </div>

            {formData.createPortalLogin && (
              <div className="pt-2 border-t border-primary/10 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase font-bold">Portal Username</span>
                  <p className="font-mono text-foreground font-semibold mt-0.5">
                    {formData.email || '(Requires valid email above)'}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase font-bold">Default Password</span>
                  <input
                    type="text"
                    name="portalPassword"
                    value={formData.portalPassword}
                    onChange={handleChange}
                    className="w-full mt-0.5 px-2.5 py-1 text-xs font-mono rounded-lg border border-input bg-background"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-xl border border-border bg-card hover:bg-muted text-foreground font-semibold text-xs transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary text-xs flex items-center gap-1.5"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Onboarding Client...
                </>
              ) : (
                <>
                  <UserPlus className="w-3.5 h-3.5" />
                  Save & Onboard Client
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
