'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  Users,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Plus,
  Search,
  Building,
  FileSignature,
  FileText,
  CreditCard,
  UserCheck
} from 'lucide-react'
import OnboardClientModal from './OnboardClientModal'

interface ClientItem {
  id: string
  name: string
  email: string | null
  phone: string | null
  type: string
  address: string | null
  city: string | null
  state: string | null
  pan: string | null
  gstin: string | null
  cases: Array<{ id: string; title: string; caseNumber: string; status: string }>
  invoices: Array<{ id?: string; total: number; status: string }>
  agreements?: Array<{ id: string; title: string; agreementNumber: string; status: string }>
}

interface ClientDirectoryViewProps {
  initialClients: ClientItem[]
}

export default function ClientDirectoryView({ initialClients }: ClientDirectoryViewProps) {
  const [clients, setClients] = useState<ClientItem[]>(initialClients)
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('ALL')
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleClientAdded = (newClient: any) => {
    setClients(prev => [
      {
        ...newClient,
        cases: [],
        invoices: [],
        agreements: [],
      },
      ...prev,
    ])
  }

  const filtered = clients.filter(c => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.email && c.email.toLowerCase().includes(search.toLowerCase())) ||
      (c.city && c.city.toLowerCase().includes(search.toLowerCase())) ||
      (c.phone && c.phone.includes(search))

    const matchesType = filterType === 'ALL' || c.type === filterType
    return matchesSearch && matchesType
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-foreground">Client Directory</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Corporations, public institutions, and individuals represented by the firm.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn-primary text-xs flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          Onboard Client
        </button>
      </div>

      {/* Controls Bar: Search & Filter */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-card border border-border p-3.5 rounded-xl shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by client name, email, phone, city..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-input bg-background text-foreground focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-muted-foreground shrink-0">Entity Type:</span>
          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            className="text-xs px-2.5 py-1.5 rounded-lg border border-input bg-background text-foreground focus:ring-2 focus:ring-primary/20"
          >
            <option value="ALL">All Types</option>
            <option value="INDIVIDUAL">Individual</option>
            <option value="CORPORATE">Corporate</option>
            <option value="LLP">LLP</option>
            <option value="PARTNERSHIP">Partnership</option>
            <option value="GOVERNMENT">Government</option>
          </select>
        </div>
      </div>

      {/* Clients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(client => {
          const totalBilled = client.invoices.reduce((acc, inv) => acc + inv.total, 0)
          const agreementsCount = client.agreements ? client.agreements.length : 0

          return (
            <div
              key={client.id}
              className="bg-card rounded-xl border border-border p-5 shadow-sm space-y-4 hover:border-primary/40 transition-all flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-base text-foreground">{client.name}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] uppercase font-bold text-primary tracking-wider">
                        {client.type}
                      </span>
                      {client.pan && (
                        <span className="text-[10px] font-mono bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
                          PAN: {client.pan}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0">
                    {client.name.charAt(0)}
                  </div>
                </div>

                <div className="space-y-2 text-xs text-muted-foreground">
                  {client.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      <span className="truncate">{client.email}</span>
                    </div>
                  )}
                  {client.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      <span>{client.phone}</span>
                    </div>
                  )}
                  {client.city && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      <span>{client.city}, {client.state}</span>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-border/80 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-muted-foreground">Active Matters</span>
                    <p className="font-bold text-foreground">{client.cases.length} Cases</p>
                  </div>
                  <div className="text-right">
                    <span className="text-muted-foreground">Invoiced Volume</span>
                    <p className="font-mono font-bold text-foreground">₹{totalBilled.toLocaleString('en-IN')}</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-border/60 flex items-center justify-between gap-2">
                <Link
                  href={`/agreements/new?clientId=${client.id}`}
                  className="flex-1 py-1.5 px-2.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <FileSignature className="w-3.5 h-3.5" />
                  Draft Agreement
                </Link>
                <Link
                  href={`/cases?search=${encodeURIComponent(client.name)}`}
                  className="py-1.5 px-2.5 rounded-lg border border-border hover:bg-muted text-foreground font-semibold text-xs flex items-center justify-center gap-1 transition-colors"
                >
                  <Briefcase className="w-3.5 h-3.5" />
                  Matters
                </Link>
              </div>
            </div>
          )
        })}

        {filtered.length === 0 && (
          <div className="col-span-full p-12 text-center bg-card rounded-2xl border border-dashed border-border space-y-3">
            <Users className="w-8 h-8 mx-auto text-muted-foreground" />
            <h3 className="font-semibold text-sm text-foreground">No clients found</h3>
            <p className="text-xs text-muted-foreground">
              {search ? 'No clients match your search criteria.' : 'Start by onboarding your first client.'}
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="btn-primary text-xs mx-auto inline-flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              Onboard Client Now
            </button>
          </div>
        )}
      </div>

      {/* Onboard Client Modal */}
      <OnboardClientModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleClientAdded}
      />
    </div>
  )
}
