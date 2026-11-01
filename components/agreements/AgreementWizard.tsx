'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Sparkles, Check, ArrowRight, ArrowLeft, Mic, MicOff, Plus,
  Trash2, User, Building, Scale, AlertCircle, FileText, Languages,
  HelpCircle, RefreshCw, CheckCircle2, Shield, UserPlus, Zap, Briefcase
} from 'lucide-react'
import { AgreementTemplateDefinition } from '@/templates/types'
import { amountToWordsEn, amountToWordsHi } from '@/lib/agreement/amount-to-words'
import { transliterateToDevanagari } from '@/lib/agreement/glossary'
import OnboardClientModal from '@/components/clients/OnboardClientModal'

interface AgreementWizardProps {
  templates: AgreementTemplateDefinition[]
  preselectedTemplateCode?: string
  preselectedClientId?: string
  savedParties: any[]
  cases: Array<{ id: string; title: string; caseNumber: string }>
  clients: Array<{ id: string; name: string }>
  user: any
}

interface PartyState {
  role: string
  nameEn: string
  nameHi: string
  fatherSpouseNameEn: string
  fatherSpouseNameHi: string
  age: string
  addressEn: string
  addressHi: string
  pan: string
  aadhaarMasked: string
  phone: string
  email: string
  isWitness: boolean
}

export default function AgreementWizard({
  templates,
  preselectedTemplateCode,
  preselectedClientId,
  savedParties,
  cases,
  clients,
  user,
}: AgreementWizardProps) {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [describeLoading, setDescribeLoading] = useState(false)
  const [instantDraftLoading, setInstantDraftLoading] = useState(false)

  // Describe deal input
  const [dealPrompt, setDealPrompt] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [clientsList, setClientsList] = useState(clients)
  const [isOnboardModalOpen, setIsOnboardModalOpen] = useState(false)

  // Selected Template
  const initialTemplate = templates.find(t => t.code === preselectedTemplateCode) || templates[0]
  const [selectedTemplate, setSelectedTemplate] = useState<AgreementTemplateDefinition>(initialTemplate)

  // Parties State
  const [parties, setParties] = useState<PartyState[]>([
    {
      role: 'FIRST PARTY (Landlord/Owner/Client)',
      nameEn: 'Vikram Sharma',
      nameHi: 'विक्रम शर्मा',
      fatherSpouseNameEn: 'Late R.N. Sharma',
      fatherSpouseNameHi: 'स्व. आर.एन. शर्मा',
      age: '48',
      addressEn: 'D-14, Defence Colony, New Delhi - 110024',
      addressHi: 'डी-14, डिफेंस कॉलोनी, नई दिल्ली - 110024',
      pan: 'ABCPS1234F',
      aadhaarMasked: 'XXXX-XXXX-8921',
      phone: '+91 98110 00001',
      email: 'vikram.sharma@gmail.com',
      isWitness: false,
    },
    {
      role: 'SECOND PARTY (Tenant/Contractor/Buyer)',
      nameEn: 'Rahul Mehta',
      nameHi: 'राहुल मेहता',
      fatherSpouseNameEn: 'S.K. Mehta',
      fatherSpouseNameHi: 'एस.के. मेहता',
      age: '32',
      addressEn: 'Flat 402, Tower B, Palm Heights, Sector 62, Noida',
      addressHi: 'फ्लैट 402, टावर बी, पाम हाइट्स, सेक्टर 62, नोएडा',
      pan: 'XYZPM5678K',
      aadhaarMasked: 'XXXX-XXXX-4512',
      phone: '+91 98290 12345',
      email: 'rahul.mehta@outlook.com',
      isWitness: false,
    },
    {
      role: 'WITNESS 1',
      nameEn: 'Anil Kumar',
      nameHi: 'अनिल कुमार',
      fatherSpouseNameEn: '',
      fatherSpouseNameHi: '',
      age: '35',
      addressEn: 'Sector 62, Noida',
      addressHi: 'सेक्टर 62, नोएडा',
      pan: '',
      aadhaarMasked: '',
      phone: '+91 98100 11223',
      email: '',
      isWitness: true,
    },
  ])

  // Terms Form Data
  const [formData, setFormData] = useState<Record<string, any>>(selectedTemplate.sampleData)

  // Optional clauses toggle state
  const [optionalClauses, setOptionalClauses] = useState({
    arbitration: true,
    lateInterest: true,
    petPolicy: false,
    forceMajeure: true,
  })

  // Language choice
  const [languageMode, setLanguageMode] = useState<'EN' | 'HI' | 'BOTH_SIDE_BY_SIDE' | 'BOTH_SEQUENTIAL'>('BOTH_SIDE_BY_SIDE')
  const [selectedState, setSelectedState] = useState('Delhi')
  const [selectedCaseId, setSelectedCaseId] = useState('')
  const [selectedClientId, setSelectedClientId] = useState(preselectedClientId || '')

  // Inline validation errors
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Web Speech API Voice Input
  const startSpeechRecognition = (targetSetter: (val: string) => void) => {
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRec) {
      alert('Speech recognition is not supported in this browser. Please type directly.')
      return
    }

    const recognition = new SpeechRec()
    recognition.lang = 'en-IN'
    recognition.interimResults = false

    recognition.onstart = () => setIsListening(true)
    recognition.onend = () => setIsListening(false)
    recognition.onerror = () => setIsListening(false)

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript
      targetSetter(transcript)
    }

    recognition.start()
  }

  // AI Describe-to-Agreement (Auto-Fill Wizard)
  const handleDescribeDeal = async () => {
    if (!dealPrompt.trim()) return
    setDescribeLoading(true)
    try {
      const res = await fetch('/api/agreements/describe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: dealPrompt }),
      })
      const data = await res.json()
      if (data.templateCode) {
        const found = templates.find(t => t.code === data.templateCode)
        if (found) {
          setSelectedTemplate(found)
          setFormData({ ...found.sampleData, ...data.extractedFields })
          if (data.extractedFields?.tenantName || data.extractedFields?.clientName) {
            setParties(prev => [
              prev[0],
              {
                ...prev[1],
                nameEn: data.extractedFields.tenantName || data.extractedFields.clientName || prev[1].nameEn,
                nameHi: transliterateToDevanagari(data.extractedFields.tenantName || data.extractedFields.clientName || prev[1].nameEn)
              },
              prev[2]
            ])
          }
        }
      }
      setStep(2)
    } catch {
      setStep(2)
    } finally {
      setDescribeLoading(false)
    }
  }

  // AI Instant Auto-Draft: Parse deal, compile contract, assign to client, and open editor directly
  const handleInstantAiDraft = async () => {
    if (!dealPrompt.trim()) return
    setInstantDraftLoading(true)
    try {
      const res = await fetch('/api/agreements/describe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: dealPrompt }),
      })
      const data = await res.json()
      const code = data.templateCode || selectedTemplate.code
      const template = templates.find(t => t.code === code) || selectedTemplate
      const compiledFormData = { ...template.sampleData, ...(data.extractedFields || {}) }

      const partyList = [
        parties[0],
        {
          ...parties[1],
          nameEn: data.extractedFields?.tenantName || data.extractedFields?.clientName || parties[1].nameEn,
          nameHi: transliterateToDevanagari(data.extractedFields?.tenantName || data.extractedFields?.clientName || parties[1].nameEn)
        },
        parties[2]
      ]

      const createRes = await fetch('/api/agreements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateCode: template.code,
          title: template.titleEn,
          titleHi: template.titleHi,
          language: languageMode,
          state: selectedState,
          city: compiledFormData.city || 'New Delhi',
          formData: compiledFormData,
          parties: partyList,
          caseId: selectedCaseId || undefined,
          clientId: selectedClientId || undefined,
        }),
      })
      const agreementCreated = await createRes.json()
      if (agreementCreated.id) {
        router.push(`/agreements/${agreementCreated.id}`)
      } else {
        router.push('/agreements')
      }
    } catch (err) {
      console.error('Instant draft error:', err)
      setStep(2)
    } finally {
      setInstantDraftLoading(false)
    }
  }

  // 1-Click "Fill with Sample Data"
  const fillSampleData = () => {
    setFormData(selectedTemplate.sampleData)
    setErrors({})
  }

  // Handle template change
  const handleTemplateSelect = (t: AgreementTemplateDefinition) => {
    setSelectedTemplate(t)
    setFormData(t.sampleData)
  }

  // Add party
  const addParty = (isWitness: boolean = false) => {
    setParties(prev => [
      ...prev,
      {
        role: isWitness ? `WITNESS ${prev.filter(p => p.isWitness).length + 1}` : 'ADDITIONAL PARTY',
        nameEn: '',
        nameHi: '',
        fatherSpouseNameEn: '',
        fatherSpouseNameHi: '',
        age: '',
        addressEn: '',
        addressHi: '',
        pan: '',
        aadhaarMasked: '',
        phone: '',
        email: '',
        isWitness,
      }
    ])
  }

  const removeParty = (index: number) => {
    setParties(prev => prev.filter((_, idx) => idx !== index))
  }

  const updateParty = (index: number, field: keyof PartyState, val: any) => {
    setParties(prev => prev.map((p, idx) => {
      if (idx !== index) return p
      const updated = { ...p, [field]: val }
      if (field === 'nameEn' && !p.nameHi) {
        updated.nameHi = transliterateToDevanagari(val)
      }
      return updated
    }))
  }

  // Validate current step
  const validateStep = (): boolean => {
    const errs: Record<string, string> = {}
    if (step === 2) {
      if (!parties[0]?.nameEn.trim()) errs['party0'] = 'Primary party name is required'
      if (!parties[1]?.nameEn.trim()) errs['party1'] = 'Counterparty name is required'
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleNext = () => {
    if (validateStep()) {
      setStep(prev => Math.min(5, prev + 1))
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  // Generate agreement
  const handleGenerate = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/agreements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateCode: selectedTemplate.code,
          title: selectedTemplate.titleEn,
          titleHi: selectedTemplate.titleHi,
          language: languageMode,
          state: selectedState,
          city: formData.city || 'New Delhi',
          formData,
          parties,
          caseId: selectedCaseId || undefined,
          clientId: selectedClientId || undefined,
        }),
      })
      const data = await res.json()
      if (data.id) {
        router.push(`/agreements/${data.id}`)
      } else {
        router.push('/agreements')
      }
    } catch {
      router.push('/agreements')
    } finally {
      setLoading(false)
    }
  }

  const STEPS = [
    { num: 1, label: 'Deal & Template' },
    { num: 2, label: 'Parties' },
    { num: 3, label: 'Terms' },
    { num: 4, label: 'Clauses' },
    { num: 5, label: 'Review' },
  ]

  return (
    <div className="space-y-6">
      {/* Wizard Header & Progress */}
      <div className="bg-card rounded-xl border border-border p-4 md:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-border">
          <div>
            <h1 className="font-serif text-xl md:text-2xl font-bold text-foreground">
              Agreement Generation Wizard
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Step {step} of 5: {STEPS[step - 1].label} • Bilingual Indian Law Framework
            </p>
          </div>

          <button
            onClick={fillSampleData}
            className="self-start sm:self-auto px-3 py-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 text-xs font-semibold flex items-center gap-1.5 transition-colors min-h-[38px]"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Fill with sample data
          </button>
        </div>

        {/* Step Indicator */}
        <div className="grid grid-cols-5 gap-2 pt-4">
          {STEPS.map(s => {
            const isCompleted = step > s.num
            const isCurrent = step === s.num
            return (
              <button
                key={s.num}
                onClick={() => isCompleted && setStep(s.num)}
                disabled={!isCompleted && !isCurrent}
                className={`flex flex-col items-center gap-1.5 text-center group transition-all ${
                  isCurrent ? 'text-primary font-bold' : isCompleted ? 'text-foreground' : 'text-muted-foreground'
                }`}
              >
                <div className={`w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  isCurrent
                    ? 'bg-primary text-white shadow-md shadow-primary/25 ring-2 ring-primary/30'
                    : isCompleted
                    ? 'bg-emerald-500 text-white'
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {isCompleted ? <Check className="w-3.5 h-3.5 md:w-4 md:h-4" /> : s.num}
                </div>
                <span className="text-[10px] md:text-xs truncate w-full hidden sm:inline">{s.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* STEP 1: CHOOSE TEMPLATE OR DESCRIBE DEAL */}
      {step === 1 && (
        <div className="space-y-6">
          {/* AI Describe Deal & Client Assignment Box */}
          <div className="bg-card rounded-2xl border border-primary/20 p-5 md:p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-border/80">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">
                    Lawyer AI Co-Pilot: Describe Deal & Assign Client
                  </h3>
                  <p className="text-[11px] text-muted-foreground">
                    प्रॉम्प्ट या बोलकर बताएं — AI अनुबंध तैयार करेगा और क्लाइंट पोर्टल में जोड़ देगा
                  </p>
                </div>
              </div>
              <span className="self-start sm:self-auto text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary uppercase tracking-wider">
                Bilingual AI Engine
              </span>
            </div>

            {/* Client and Case Selectors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-semibold text-foreground flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-primary" />
                    <span>Assign to Client (क्लाइंट चयन):</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsOnboardModalOpen(true)}
                    className="text-primary hover:underline text-[11px] font-bold inline-flex items-center gap-1"
                  >
                    <UserPlus className="w-3 h-3" /> Onboard Client
                  </button>
                </div>
                <select
                  value={selectedClientId}
                  onChange={e => setSelectedClientId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-input bg-background text-foreground focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">No Client (Firm Draft Only)</option>
                  {clientsList.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-primary" />
                  <span>Link to CaseLine Matter (Optional):</span>
                </label>
                <select
                  value={selectedCaseId}
                  onChange={e => setSelectedCaseId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-input bg-background text-foreground focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">None (Independent Agreement)</option>
                  {cases.map(c => (
                    <option key={c.id} value={c.id}>{c.caseNumber} - {c.title}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Natural Language Prompt Area */}
            <div className="relative">
              <textarea
                rows={3}
                value={dealPrompt}
                onChange={e => setDealPrompt(e.target.value)}
                placeholder="Tell the AI deal parameters, parties, tenure, rent/fees, deposit, and custom conditions in plain English or Hindi (e.g. Commercial lease with Rajesh Agarwal for office in Sector 62 Noida, ₹65,000 rent, 3 months deposit, 3 years lease, 5% annual escalation)..."
                className="w-full p-3.5 text-xs sm:text-sm rounded-xl border border-input bg-background text-foreground pr-12 focus:ring-2 focus:ring-primary/20 leading-relaxed"
              />
              <button
                type="button"
                onClick={() => startSpeechRecognition(setDealPrompt)}
                className={`absolute right-3 bottom-3 p-2 rounded-lg transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center ${
                  isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-muted text-muted-foreground hover:text-foreground'
                }`}
                title="Voice input (English / Hindi)"
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
            </div>

            {/* Quick Prompt Chips */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Quick Deal Templates / त्वरित प्रॉम्प्ट:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  {
                    label: 'Commercial Lease (Gurugram)',
                    prompt: 'Commercial office lease with client Rajesh Agarwal in Cyber City Gurugram for 3 years, monthly rent ₹1,20,000, 3 months security deposit, 2 months lock-in period, 5% annual escalation, Haryana stamp duty.'
                  },
                  {
                    label: 'Residential Rent (Noida)',
                    prompt: 'Residential tenancy agreement for 2BHK flat in Sector 62 Noida for 11 months, monthly rent ₹28,000, 2 months deposit, 1 month notice period.'
                  },
                  {
                    label: 'Freelance IT Contract',
                    prompt: 'Freelance software development service contract for full-stack web platform, total consideration ₹2,50,000 across 3 milestone deliverables, complete IP assignment upon final settlement.'
                  },
                  {
                    label: 'Mutual NDA',
                    prompt: 'Mutual non-disclosure agreement for confidential business evaluations, 2 years confidentiality tenure, Delhi arbitration jurisdiction.'
                  }
                ].map((chip, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setDealPrompt(chip.prompt)}
                    className="text-[11px] px-2.5 py-1 rounded-lg border border-border bg-background hover:border-primary/40 text-foreground transition-all"
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <span className="text-[11px] text-muted-foreground">
                Voice typing and bilingual Hindi/English prompt parsing enabled
              </span>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleDescribeDeal}
                  disabled={describeLoading || instantDraftLoading || !dealPrompt.trim()}
                  className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl border border-border hover:bg-muted font-semibold text-xs text-foreground flex items-center justify-center gap-1.5 transition-colors"
                >
                  {describeLoading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Parsing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      Auto-Fill Wizard
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleInstantAiDraft}
                  disabled={instantDraftLoading || describeLoading || !dealPrompt.trim()}
                  className="flex-1 sm:flex-none btn-primary text-xs flex items-center justify-center gap-1.5"
                >
                  {instantDraftLoading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Generating Structured Contract...
                    </>
                  ) : (
                    <>
                      <Zap className="w-3.5 h-3.5" />
                      Tell AI & Instant Draft
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Manual Template Selection */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm text-foreground">Or Select From 14 Standard Templates</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {templates.map(t => {
                const isSelected = selectedTemplate.code === t.code
                return (
                  <div
                    key={t.code}
                    onClick={() => handleTemplateSelect(t)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-primary bg-primary/5 ring-1 ring-primary shadow-sm'
                        : 'border-border bg-card hover:border-primary/40'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                        {t.category}
                      </span>
                      {isSelected && <Check className="w-4 h-4 text-primary" />}
                    </div>
                    <h4 className="font-semibold text-xs text-foreground line-clamp-1">{t.titleEn}</h4>
                    <p className="font-hindi text-[11px] text-muted-foreground line-clamp-1 mt-0.5" lang="hi">{t.titleHi}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: PARTIES */}
      {step === 2 && (
        <div className="bg-card rounded-xl border border-border p-5 md:p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-base text-foreground">Contracting Parties & Witnesses</h3>
              <p className="text-xs text-muted-foreground">Names are automatically transliterated to legal Devanagari Hindi.</p>
            </div>
            <button
              onClick={() => addParty(false)}
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 min-h-[38px]"
            >
              <Plus className="w-3.5 h-3.5" /> Add Party
            </button>
          </div>

          <div className="space-y-4">
            {parties.map((party, index) => (
              <div key={index} className="p-4 rounded-xl border border-border bg-muted/20 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-primary">
                    {party.role}
                  </span>
                  {parties.length > 2 && (
                    <button
                      onClick={() => removeParty(index)}
                      className="text-red-500 hover:text-red-600 p-1"
                      title="Remove party"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="font-medium text-foreground">Full Legal Name (English)</label>
                    <input
                      type="text"
                      value={party.nameEn}
                      onChange={e => updateParty(index, 'nameEn', e.target.value)}
                      className="mt-1 w-full px-3 py-2 rounded-lg border border-input bg-background"
                      placeholder="e.g. Vikram Sharma"
                    />
                  </div>

                  <div>
                    <label className="font-medium text-foreground font-hindi">नाम (हिंदी देवनागरी - स्वतः अनुवादित)</label>
                    <input
                      type="text"
                      value={party.nameHi}
                      onChange={e => updateParty(index, 'nameHi', e.target.value)}
                      className="mt-1 w-full px-3 py-2 rounded-lg border border-input bg-background font-hindi"
                      placeholder="उदा. विक्रम शर्मा"
                      lang="hi"
                    />
                  </div>

                  <div>
                    <label className="font-medium text-foreground">Father's / Spouse's Name</label>
                    <input
                      type="text"
                      value={party.fatherSpouseNameEn}
                      onChange={e => updateParty(index, 'fatherSpouseNameEn', e.target.value)}
                      className="mt-1 w-full px-3 py-2 rounded-lg border border-input bg-background"
                      placeholder="e.g. Late R.N. Sharma"
                    />
                  </div>

                  <div>
                    <label className="font-medium text-foreground">Age (Years)</label>
                    <input
                      type="number"
                      inputMode="numeric"
                      value={party.age}
                      onChange={e => updateParty(index, 'age', e.target.value)}
                      className="mt-1 w-full px-3 py-2 rounded-lg border border-input bg-background"
                      placeholder="e.g. 45"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="font-medium text-foreground">Registered Residential / Office Address</label>
                    <input
                      type="text"
                      value={party.addressEn}
                      onChange={e => updateParty(index, 'addressEn', e.target.value)}
                      className="mt-1 w-full px-3 py-2 rounded-lg border border-input bg-background"
                      placeholder="Full residential address with city, state & pin"
                    />
                  </div>

                  {!party.isWitness && (
                    <>
                      <div>
                        <label className="font-medium text-foreground">PAN Number</label>
                        <input
                          type="text"
                          value={party.pan}
                          onChange={e => updateParty(index, 'pan', e.target.value.toUpperCase())}
                          className="mt-1 w-full px-3 py-2 rounded-lg border border-input bg-background font-mono uppercase"
                          placeholder="ABCDE1234F"
                          maxLength={10}
                        />
                      </div>
                      <div>
                        <label className="font-medium text-foreground">Aadhaar (Masked: XXXX-XXXX-1234)</label>
                        <input
                          type="text"
                          value={party.aadhaarMasked}
                          onChange={e => updateParty(index, 'aadhaarMasked', e.target.value)}
                          className="mt-1 w-full px-3 py-2 rounded-lg border border-input bg-background font-mono"
                          placeholder="XXXX-XXXX-8921"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => addParty(true)}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-border hover:bg-muted text-foreground flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Witness Block
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: TERMS (Schema-driven fields) */}
      {step === 3 && (
        <div className="bg-card rounded-xl border border-border p-5 md:p-6 shadow-sm space-y-6">
          <div>
            <h3 className="font-semibold text-base text-foreground">
              {selectedTemplate.titleEn} — Deal Terms
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Amounts automatically convert to words in both English and Hindi.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {selectedTemplate.fields.map(field => {
              const val = formData[field.id] !== undefined ? formData[field.id] : (field.defaultValue || '')

              return (
                <div key={field.id} className={field.type === 'textarea' ? 'sm:col-span-2' : ''}>
                  <label className="font-medium text-foreground flex items-center justify-between">
                    <span>{field.labelEn}</span>
                    <span className="font-hindi text-[11px] text-muted-foreground" lang="hi">{field.labelHi}</span>
                  </label>

                  {field.type === 'textarea' ? (
                    <div className="relative mt-1">
                      <textarea
                        rows={3}
                        value={val}
                        onChange={e => setFormData({ ...formData, [field.id]: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm"
                      />
                      <button
                        onClick={() => startSpeechRecognition((t) => setFormData({ ...formData, [field.id]: t }))}
                        className="absolute right-2 bottom-2 p-1.5 rounded bg-muted hover:bg-muted/80 text-muted-foreground"
                        title="Voice dictation"
                      >
                        <Mic className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : field.type === 'select' ? (
                    <select
                      value={val}
                      onChange={e => setFormData({ ...formData, [field.id]: e.target.value })}
                      className="mt-1 w-full px-3 py-2 rounded-lg border border-input bg-background text-sm"
                    >
                      {field.options?.map(opt => (
                        <option key={opt.value} value={opt.value}>
                          {opt.labelEn} ({opt.labelHi})
                        </option>
                      ))}
                    </select>
                  ) : field.type === 'currency' ? (
                    <div className="mt-1 space-y-1">
                      <input
                        type="number"
                        inputMode="numeric"
                        value={val}
                        onChange={e => setFormData({ ...formData, [field.id]: parseFloat(e.target.value) || 0 })}
                        className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm font-mono"
                      />
                      {val > 0 && (
                        <div className="p-2 rounded bg-muted/40 text-[11px] space-y-0.5">
                          <p className="text-primary font-medium">{amountToWordsEn(val)}</p>
                          <p className="font-hindi text-muted-foreground" lang="hi">{amountToWordsHi(val)}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <input
                      type={field.type === 'date' ? 'date' : 'text'}
                      value={val}
                      onChange={e => setFormData({ ...formData, [field.id]: e.target.value })}
                      className="mt-1 w-full px-3 py-2 rounded-lg border border-input bg-background text-sm"
                    />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* STEP 4: OPTIONAL CLAUSES */}
      {step === 4 && (
        <div className="bg-card rounded-xl border border-border p-5 md:p-6 shadow-sm space-y-6">
          <div>
            <h3 className="font-semibold text-base text-foreground">Standard & Optional Legal Clauses</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Toggle protective provisions tailored to Indian judicial enforcement.
            </p>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-xl border border-border bg-muted/20 flex items-start justify-between gap-4">
              <div>
                <h4 className="font-semibold text-sm text-foreground">Arbitration & Dispute Resolution</h4>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Fast-track dispute settlement under the Arbitration & Conciliation Act 1996 in lieu of lengthy court litigation.
                </p>
              </div>
              <input
                type="checkbox"
                checked={optionalClauses.arbitration}
                onChange={e => setOptionalClauses({ ...optionalClauses, arbitration: e.target.checked })}
                className="w-5 h-5 rounded border-input text-primary mt-1"
              />
            </div>

            <div className="p-4 rounded-xl border border-border bg-muted/20 flex items-start justify-between gap-4">
              <div>
                <h4 className="font-semibold text-sm text-foreground">Force Majeure (Act of God / Epidemic)</h4>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Shields both parties from breach penalties during unforeseen national emergencies, floods, or statutory shutdowns.
                </p>
              </div>
              <input
                type="checkbox"
                checked={optionalClauses.forceMajeure}
                onChange={e => setOptionalClauses({ ...optionalClauses, forceMajeure: e.target.checked })}
                className="w-5 h-5 rounded border-input text-primary mt-1"
              />
            </div>

            <div className="p-4 rounded-xl border border-border bg-muted/20 flex items-start justify-between gap-4">
              <div>
                <h4 className="font-semibold text-sm text-foreground">Late Payment Interest</h4>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Specifies 18% per annum commercial interest on delayed rent or milestone payments past the grace period.
                </p>
              </div>
              <input
                type="checkbox"
                checked={optionalClauses.lateInterest}
                onChange={e => setOptionalClauses({ ...optionalClauses, lateInterest: e.target.checked })}
                className="w-5 h-5 rounded border-input text-primary mt-1"
              />
            </div>

            <div className="p-4 rounded-xl border border-border bg-muted/20 flex items-start justify-between gap-4">
              <div>
                <h4 className="font-semibold text-sm text-foreground">Pet Ownership & Society Rule Compliance</h4>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Explicitly permits domestic pets in accordance with Animal Welfare Board of India (AWBI) guidelines.
                </p>
              </div>
              <input
                type="checkbox"
                checked={optionalClauses.petPolicy}
                onChange={e => setOptionalClauses({ ...optionalClauses, petPolicy: e.target.checked })}
                className="w-5 h-5 rounded border-input text-primary mt-1"
              />
            </div>
          </div>
        </div>
      )}

      {/* STEP 5: REVIEW & LANGUAGE SELECTION */}
      {step === 5 && (
        <div className="bg-card rounded-xl border border-border p-5 md:p-6 shadow-sm space-y-6">
          <div>
            <h3 className="font-semibold text-base text-foreground">Review & Language Output Choice</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Select output language mode and associate with a CaseLine client or case dossier.
            </p>
          </div>

          {/* Language Options */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-foreground uppercase tracking-wider">
              Output Language Mode
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { id: 'BOTH_SIDE_BY_SIDE', label: 'Bilingual Side-by-Side', desc: 'English & Hindi columns side by side on desktop, stacked on mobile.' },
                { id: 'BOTH_SEQUENTIAL', label: 'Bilingual Sequential', desc: 'Full English contract followed immediately by Hindi version.' },
                { id: 'EN', label: 'English Only', desc: 'Standard English judicial drafting.' },
                { id: 'HI', label: 'Hindi Only (हिन्दी)', desc: 'Formal Devanagari Hindi translation.' },
              ].map(opt => (
                <div
                  key={opt.id}
                  onClick={() => setLanguageMode(opt.id as any)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    languageMode === opt.id
                      ? 'border-primary bg-primary/5 ring-1 ring-primary'
                      : 'border-border bg-background hover:border-primary/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-foreground">{opt.label}</span>
                    {languageMode === opt.id && <Check className="w-4 h-4 text-primary" />}
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1">{opt.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Client & Case Assignment + Stamp State */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <div className="flex items-center justify-between">
                <label className="font-semibold text-foreground">Assign to Client (Portal Access)</label>
                <button
                  type="button"
                  onClick={() => setIsOnboardModalOpen(true)}
                  className="text-primary hover:underline text-[11px] font-bold inline-flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> New
                </button>
              </div>
              <select
                value={selectedClientId}
                onChange={e => setSelectedClientId(e.target.value)}
                className="mt-1 w-full px-3 py-2 rounded-lg border border-input bg-background"
              >
                <option value="">No Client (Firm Draft Only)</option>
                {clientsList.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <p className="text-[10px] text-muted-foreground mt-1">
                Client will be able to review, edit, and sign this contract in their portal.
              </p>
            </div>

            <div>
              <label className="font-semibold text-foreground">State for Stamp Duty</label>
              <select
                value={selectedState}
                onChange={e => setSelectedState(e.target.value)}
                className="mt-1 w-full px-3 py-2 rounded-lg border border-input bg-background"
              >
                <option value="Delhi">Delhi (NCT)</option>
                <option value="Maharashtra">Maharashtra (Compulsory E-Registration)</option>
                <option value="Karnataka">Karnataka (Bengaluru)</option>
                <option value="Uttar Pradesh">Uttar Pradesh (Noida/Lucknow)</option>
                <option value="Haryana">Haryana (Gurugram)</option>
                <option value="Tamil Nadu">Tamil Nadu (Chennai)</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-foreground">Link to CaseLine Matter (Optional)</label>
              <select
                value={selectedCaseId}
                onChange={e => setSelectedCaseId(e.target.value)}
                className="mt-1 w-full px-3 py-2 rounded-lg border border-input bg-background"
              >
                <option value="">None (Standalone Agreement)</option>
                {cases.map(c => (
                  <option key={c.id} value={c.id}>{c.caseNumber} - {c.title}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Review Summary Box */}
          <div className="p-4 rounded-xl bg-muted/30 border border-border space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Template:</span>
              <strong className="text-foreground">{selectedTemplate.titleEn}</strong>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Parties:</span>
              <strong className="text-foreground">{parties[0]?.nameEn} & {parties[1]?.nameEn}</strong>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Assigned Client:</span>
              <strong className="text-primary font-bold">
                {clientsList.find(c => c.id === selectedClientId)?.name || 'None (Internal Firm Draft)'}
              </strong>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">City & State:</span>
              <strong className="text-foreground">{formData.city || 'New Delhi'}, {selectedState}</strong>
            </div>
          </div>
        </div>
      )}

      {/* STICKY BOTTOM ACTION BAR (Touch-friendly 44px min targets) */}
      <div className="sticky bottom-0 bg-card/95 backdrop-blur-md p-4 rounded-xl border border-border shadow-lg flex items-center justify-between gap-3 z-30">
        {step > 1 ? (
          <button
            onClick={() => setStep(step - 1)}
            className="px-4 py-2.5 rounded-xl border border-border hover:bg-muted text-foreground text-xs font-semibold flex items-center gap-1.5 transition-colors min-h-[44px]"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
        ) : <div />}

        {step < 5 ? (
          <button
            onClick={handleNext}
            className="btn-primary text-xs min-h-[44px] px-6"
          >
            Next: {STEPS[step].label} <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="btn-primary text-xs min-h-[44px] px-6"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Compiling Bilingual Document...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-300" />
                Generate Agreement & Open Editor
              </>
            )}
          </button>
        )}
      </div>

      {/* Quick Client Onboard Modal */}
      <OnboardClientModal
        isOpen={isOnboardModalOpen}
        onClose={() => setIsOnboardModalOpen(false)}
        onSuccess={(newClient) => {
          setClientsList(prev => [newClient, ...prev])
          setSelectedClientId(newClient.id)
        }}
      />
    </div>
  )
}
