'use client'

import React, { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Scale,
  Sparkles,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Copy,
  Check,
  RotateCcw,
  BookOpen,
  Printer,
  ChevronRight,
  TrendingUp,
  FileText,
  User,
  Building,
  HelpCircle,
  Lightbulb,
  FileCheck,
  Layers,
  Languages,
  Briefcase,
  Upload,
  FileUp,
  X,
  File as FileIcon,
  Image as ImageIcon,
  CheckCheck,
  AlertCircle,
  PlusCircle,
  ExternalLink,
  Save,
  Wand2
} from 'lucide-react'
import { ArgumentAnalysisResult, DocumentInspectionResult } from '@/lib/ai/service'

interface PresetArgument {
  id: string
  title: string
  category: string
  label: string
  text: string
  context: string
}

const PRESET_ARGUMENTS: PresetArgument[] = [
  {
    id: 'lease-lockout',
    title: 'Commercial Lease Eviction & Lockout',
    category: 'Tenancy & Real Estate',
    label: 'Tenant vs Commercial Landlord',
    text: 'The commercial landlord padlocked our retail shop and disconnected the power after our rent payment was delayed by 12 days. Our signed lease agreement explicitly specifies that the landlord must furnish a 30-day written cure notice before taking any termination action or re-entering the premises.',
    context: 'Transfer of Property Act 1882, Commercial Tenancy Lease Dispute'
  },
  {
    id: 'software-withholding',
    title: 'Software Deliverable Withholding',
    category: 'IT & Commercial Services',
    label: 'Agency vs Enterprise Client',
    text: 'The client accepted and deployed Milestone 1 and 2 to their production environment, but is now withholding the final 40% payment of INR 18,00,000 citing minor cosmetic UI bugs and new feature requests that were never part of the original agreed Statement of Work (SOW).',
    context: 'Indian Contract Act 1872, MSMED Act 2006, Commercial Services'
  },
  {
    id: 'non-compete-injunction',
    title: 'Post-Employment Non-Compete Covenant',
    category: 'Employment & Labor',
    label: 'Software Engineer vs Ex-Employer',
    text: 'My previous employer sent a legal notice threatening an injunction and refusing to issue my experience letter and relieving certificate because I joined a competing software firm. They claim I breached a 2-year non-compete clause in my employment contract.',
    context: 'Section 27 Indian Contract Act 1872, Employment Restraint of Trade'
  },
  {
    id: 'bayana-forfeiture',
    title: 'Advance Bayana Forfeiture in Property Sale',
    category: 'Property Sale & Bayana',
    label: 'Property Buyer vs Seller',
    text: 'The seller unilaterally forfeited our token earnest money (bayana) of INR 10,00,000 because our home loan sanction from the bank took 20 days longer than the tentative closing date. The seller never sent a formal notice requiring attendance at the Sub-Registrar office.',
    context: 'Specific Relief Act 1963, Section 74 Indian Contract Act 1872'
  },
  {
    id: 'consumer-defect',
    title: 'Defective Industrial Machine & Refund Denial',
    category: 'Consumer & Commercial Supply',
    label: 'Business Buyer vs Manufacturer',
    text: 'The equipment manufacturer delivered an industrial packaging machine that broke down within 14 days of installation. They refuse to replace the unit or issue a refund, pointing to a fine-print clause stating all sales are final and warranties only cover minor replacement parts.',
    context: 'Consumer Protection Act 2019, Sale of Goods Act 1930'
  }
]

interface SampleDocumentPreset {
  id: string
  title: string
  category: string
  fileName: string
  fileType: string
  snippet: string
}

const SAMPLE_DOCUMENT_PRESETS: SampleDocumentPreset[] = [
  {
    id: 'sample-rent-deed',
    title: 'Residential Lease Deed with Unlawful Lockout Clause',
    category: 'Rental & Property',
    fileName: 'Delhi_Apartment_Rent_Agreement_2026.pdf',
    fileType: 'application/pdf',
    snippet: 'Residential Lease Deed executed between Rajesh Sharma (Landlord) and Vikram Sethi (Tenant) for Flat 402, Green Avenue, New Delhi. Clause 8 states that in the event of any default exceeding 7 days, the Landlord reserves the absolute right to padlock premises and disconnect power without judicial intervention. Security deposit of INR 75,000 is deemed non-refundable if tenant vacates within 12 months.'
  },
  {
    id: 'sample-freelance-sow',
    title: 'Software Development Agreement with Withheld Deliverable',
    category: 'Business & Work',
    fileName: 'Enterprise_SDA_Agreement_Milestones.pdf',
    fileType: 'application/pdf',
    snippet: 'Master Software Development Agreement between Acme Technologies Pvt Ltd (Client) and CodeCraft Solutions LLP (Developer). Total fee INR 48,00,000. Client deployed Milestone 1 & 2 to live production but withheld final 40% milestone of INR 18,00,000 citing cosmetic changes. All IP was assigned upfront without deemed acceptance protocol.'
  },
  {
    id: 'sample-noncompete',
    title: 'Employment Covenant with 2-Year Non-Compete Restraint',
    category: 'Employment & Labor',
    fileName: 'Senior_Engineer_Employment_Covenant.png',
    fileType: 'image/png',
    snippet: 'Appointment Agreement and Restrictive Covenant for Lead Software Architect. Clause 14 imposes an absolute 24-month post-employment restraint prohibiting employee from joining or advising any competing technology enterprise, with forfeiture of experience and relieving letters on breach.'
  },
  {
    id: 'sample-bayana-receipt',
    title: 'Property Bayana Contract with Unilateral Forfeiture',
    category: 'Property Sale',
    fileName: 'Gurugram_Plot_Bayana_Receipt_Scanned.jpg',
    fileType: 'image/jpeg',
    snippet: 'Agreement to Sell and Bayana Receipt for Plot No. 12, Sector 15, Gurugram. Total price INR 95,00,000. Buyer paid advance token money of INR 10,00,000. Clause 4 states if balance is not paid by the 30th day, the entire token money is unconditionally forfeited without requirement of Sub-Registrar notice.'
  }
]

interface CaseOption {
  id: string
  title: string
  caseNumber: string
}

interface ArgumentAnalyzerClientProps {
  cases?: CaseOption[]
  initialArgument?: string
  initialCaseId?: string
}

export default function ArgumentAnalyzerClient({
  cases = [],
  initialArgument = '',
  initialCaseId = ''
}: ArgumentAnalyzerClientProps) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Top mode: 'upload' (PDF / Image) vs 'text' (Manual Argument Text)
  const [analysisMode, setAnalysisMode] = useState<'upload' | 'text'>('upload')

  // Document Upload State
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [uploadedFileBase64, setUploadedFileBase64] = useState<string>('')
  const [uploadedFileType, setUploadedFileType] = useState<string>('')
  const [uploadedFileName, setUploadedFileName] = useState<string>('')
  const [extractedDocText, setExtractedDocText] = useState<string>(SAMPLE_DOCUMENT_PRESETS[0].snippet)
  const [selectedSampleId, setSelectedSampleId] = useState<string>(SAMPLE_DOCUMENT_PRESETS[0].id)
  const [docInspectionResult, setDocInspectionResult] = useState<DocumentInspectionResult | null>(null)
  const [docLoading, setDocLoading] = useState(false)
  const [savingTemplate, setSavingTemplate] = useState(false)
  const [creatingAgreement, setCreatingAgreement] = useState(false)
  const [templateSavedMsg, setTemplateSavedMsg] = useState<string | null>(null)

  // Text Argument Analyzer State
  const [argumentText, setArgumentText] = useState(initialArgument || PRESET_ARGUMENTS[0].text)
  const [selectedCaseId, setSelectedCaseId] = useState(initialCaseId)
  const [contextInput, setContextInput] = useState(PRESET_ARGUMENTS[0].context)
  const [roleFocus, setRoleFocus] = useState<'BOTH' | 'CLIENT' | 'OWNER'>('BOTH')
  const [activeTab, setActiveTab] = useState<'all' | 'client' | 'owner' | 'improvements'>('all')
  const [showHindi, setShowHindi] = useState(false)
  const [textLoading, setTextLoading] = useState(false)
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const [textResult, setTextResult] = useState<ArgumentAnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  // File selection handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    processFile(file)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (!file) return
    processFile(file)
  }

  const processFile = (file: File) => {
    setUploadedFile(file)
    setUploadedFileName(file.name)
    setUploadedFileType(file.type || (file.name.endsWith('.pdf') ? 'application/pdf' : 'image/png'))
    setSelectedSampleId('')

    const reader = new FileReader()
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1] || ''
      setUploadedFileBase64(base64)
    }
    reader.readAsDataURL(file)
  }

  const handleSelectSampleDoc = (sample: SampleDocumentPreset) => {
    setSelectedSampleId(sample.id)
    setUploadedFile(null)
    setUploadedFileName(sample.fileName)
    setUploadedFileType(sample.fileType)
    setExtractedDocText(sample.snippet)
    setUploadedFileBase64('')
  }

  // Trigger Document Inspection (PDF / Image / Text)
  const handleInspectDocument = async () => {
    setDocLoading(true)
    setError(null)
    setTemplateSavedMsg(null)

    try {
      const res = await fetch('/api/ai/inspect-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: uploadedFileName || 'Inspected_Agreement.pdf',
          fileType: uploadedFileType || 'application/pdf',
          fileBase64: uploadedFileBase64 || undefined,
          extractedText: extractedDocText.trim() || undefined,
          role: roleFocus,
        })
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error || 'Failed to inspect document')
      }

      const data = (await res.json()) as DocumentInspectionResult
      setDocInspectionResult(data)
    } catch (err: any) {
      console.error('Inspection error:', err)
      setError(err?.message || 'Error occurred while evaluating document.')
    } finally {
      setDocLoading(false)
    }
  }

  // Save as Reusable Agreement Template
  const handleSaveAsTemplate = async () => {
    if (!docInspectionResult?.extractedTemplate) return
    setSavingTemplate(true)
    setError(null)

    try {
      const res = await fetch('/api/agreements/save-inspected-template', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          template: docInspectionResult.extractedTemplate
        })
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error || 'Failed to save template')
      }

      const data = await res.json()
      setTemplateSavedMsg(`Template "${data.title}" saved successfully! You can find it in the Template Library.`)
    } catch (err: any) {
      console.error('Save template error:', err)
      setError(err?.message || 'Error saving template.')
    } finally {
      setSavingTemplate(false)
    }
  }

  // Create the Same Agreement Now (1-click generation)
  const handleCreateSameAgreement = async () => {
    if (!docInspectionResult) return
    setCreatingAgreement(true)
    setError(null)

    try {
      const res = await fetch('/api/agreements/create-from-inspected', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: docInspectionResult.extractedTemplate.suggestedTitle || 'Inspected Agreement',
          titleHi: docInspectionResult.extractedTemplate.suggestedTitleHi,
          compiledEn: docInspectionResult.suggestionsToImprove.watertightRevisedAgreementEn,
          compiledHi: docInspectionResult.suggestionsToImprove.watertightRevisedAgreementHi,
          caseId: selectedCaseId || undefined,
        })
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error || 'Failed to create agreement')
      }

      const data = await res.json()
      if (data.agreementId) {
        router.push(`/agreements/${data.agreementId}`)
      }
    } catch (err: any) {
      console.error('Create agreement error:', err)
      setError(err?.message || 'Error creating agreement.')
    } finally {
      setCreatingAgreement(false)
    }
  }

  // Text Argument Analysis Handler
  const handleAnalyzeText = async () => {
    if (!argumentText.trim()) return
    setTextLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/ai/analyze-argument', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          argument: argumentText.trim(),
          context: contextInput.trim(),
          role: roleFocus,
          caseId: selectedCaseId || undefined
        })
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error || 'Failed to analyze argument')
      }

      const data = (await res.json()) as ArgumentAnalysisResult
      setTextResult(data)
    } catch (err: any) {
      console.error('Analysis error:', err)
      setError(err?.message || 'Error occurred while evaluating argument.')
    } finally {
      setTextLoading(false)
    }
  }

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  const getVerdictStyle = (verdict: 'RIGHT' | 'WRONG' | 'AT_RISK') => {
    switch (verdict) {
      case 'RIGHT':
        return {
          bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400',
          badgeBg: 'bg-emerald-600 text-white',
          title: 'RIGHT: Legally Sound & Enforceable',
          icon: ShieldCheck
        }
      case 'WRONG':
        return {
          bg: 'bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-400',
          badgeBg: 'bg-rose-600 text-white',
          title: 'WRONG: Legally Flawed / Unenforceable Covenants Found',
          icon: ShieldAlert
        }
      case 'AT_RISK':
      default:
        return {
          bg: 'bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-400',
          badgeBg: 'bg-amber-600 text-white',
          title: 'AT-RISK: Critical Statutory Omissions & Ambiguities',
          icon: AlertTriangle
        }
    }
  }

  return (
    <div className="space-y-8">
      {/* Page Title & Mission Banner */}
      <div className="bg-gradient-to-r from-blue-900/40 via-indigo-900/20 to-slate-900/40 border border-blue-500/20 rounded-2xl p-6 md:p-8 backdrop-blur-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-600 dark:text-blue-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>AI Document &amp; Agreement Inspector + Template Creator</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-foreground tracking-tight">
              Upload Agreement Picture / PDF &amp; Check Right or Wrong
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Upload scanned agreements, court arguments, or deed pictures. AI audits whether provisions are <strong className="text-foreground">Right or Wrong</strong> under Indian law, highlights <strong className="text-foreground">Advantages &amp; Disadvantages</strong> for clients and owners, provides concrete <strong className="text-foreground">Suggestions to Improve</strong>, saves it as a <strong className="text-foreground">Reusable Template</strong>, and can <strong className="text-foreground">Create the Same Agreement</strong> with 1-click!
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-center flex-wrap">
            <button
              onClick={() => setShowHindi(!showHindi)}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                showHindi
                  ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/40 shadow-sm'
                  : 'bg-card text-muted-foreground border-border hover:text-foreground'
              }`}
            >
              <Languages className="w-4 h-4" />
              <span>{showHindi ? 'हिंदी दृश्य (Hindi View Active)' : 'Bilingual Hindi/English'}</span>
            </button>
          </div>
        </div>

        {/* MODE TOGGLE TABS */}
        <div className="flex items-center gap-2 mt-6 pt-5 border-t border-border/40">
          <button
            onClick={() => {
              setAnalysisMode('upload')
              setError(null)
            }}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              analysisMode === 'upload'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'bg-background/80 text-muted-foreground hover:text-foreground hover:bg-background border border-border/50'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Upload Agreement Picture / PDF (Scan &amp; Audit)</span>
          </button>

          <button
            onClick={() => {
              setAnalysisMode('text')
              setError(null)
            }}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              analysisMode === 'text'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'bg-background/80 text-muted-foreground hover:text-foreground hover:bg-background border border-border/50'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Type / Paste Dispute Argument</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {templateSavedMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <CheckCheck className="w-4 h-4 shrink-0 text-emerald-600" />
            <span className="font-medium">{templateSavedMsg}</span>
          </div>
          <Link
            href="/agreements/templates"
            className="font-semibold underline hover:text-emerald-800 dark:hover:text-emerald-300 flex items-center gap-1"
          >
            View in Templates <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODE 1: UPLOAD AGREEMENT PICTURE & PDF */}
      {/* ============================================================ */}
      {analysisMode === 'upload' && (
        <div className="space-y-6">
          <div className="card-premium p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
              <div>
                <h3 className="font-serif font-bold text-lg text-foreground flex items-center gap-2">
                  <FileUp className="w-5 h-5 text-primary" />
                  Select or Drop Agreement Document (PDF, PNG, JPG, WebP)
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Both client and lawyer can upload agreement pictures or PDFs for instant validity verification.
                </p>
              </div>

              {cases.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Link Matter:</span>
                  <select
                    value={selectedCaseId}
                    onChange={(e) => setSelectedCaseId(e.target.value)}
                    className="text-xs px-2.5 py-1.5 rounded-lg border border-input bg-background text-foreground"
                  >
                    <option value="">No Matter Linked</option>
                    {cases.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.caseNumber} - {c.title.slice(0, 25)}...
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Drag and Drop Upload Zone */}
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-border hover:border-primary/50 bg-muted/20 hover:bg-muted/40 rounded-2xl p-8 text-center cursor-pointer transition-all space-y-3 group"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf,image/png,image/jpeg,image/webp,image/jpg"
                onChange={handleFileChange}
                className="hidden"
              />

              <div className="w-14 h-14 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center mx-auto group-hover:scale-105 transition-transform">
                {uploadedFileType?.startsWith('image/') ? (
                  <ImageIcon className="w-7 h-7" />
                ) : (
                  <FileIcon className="w-7 h-7" />
                )}
              </div>

              {uploadedFile ? (
                <div>
                  <p className="text-sm font-bold text-foreground flex items-center justify-center gap-2">
                    <span>{uploadedFileName}</span>
                    <span className="text-xs font-mono font-normal text-muted-foreground">
                      ({(uploadedFile.size / 1024).toFixed(1)} KB)
                    </span>
                  </p>
                  <p className="text-xs text-emerald-600 font-semibold mt-1">Ready for Judicial Audit</p>
                </div>
              ) : (
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    Click to browse or drag and drop your agreement file here
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Supports Scanned Deeds, Contract PDFs, Camera Photos, Rent Receipts, SOWs (Max 15MB)
                  </p>
                </div>
              )}
            </div>

            {/* Sample Presets to Test Instantly */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Or Test Immediately with 1-Click Sample Legal Agreements:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                {SAMPLE_DOCUMENT_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleSelectSampleDoc(preset)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      selectedSampleId === preset.id
                        ? 'border-blue-500 bg-blue-500/10 shadow-sm'
                        : 'border-border bg-card hover:border-primary/30 hover:bg-muted/30'
                    }`}
                  >
                    <div>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-mono">
                        {preset.category}
                      </span>
                      <p className="text-xs font-semibold text-foreground mt-1 line-clamp-2">
                        {preset.title}
                      </p>
                    </div>
                    <span className="text-[10px] text-primary font-mono mt-2 truncate flex items-center gap-1">
                      <FileText className="w-3 h-3 shrink-0" />
                      {preset.fileName}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Extracted Text Box Preview & Editor */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-foreground">
                  Document Content / Extracted Agreement Text
                </label>
                <span className="text-[10px] text-muted-foreground">
                  OCR / PDF Text Extraction Active
                </span>
              </div>
              <textarea
                rows={4}
                value={extractedDocText}
                onChange={(e) => setExtractedDocText(e.target.value)}
                placeholder="Paste contract clauses or let the file reader extract automatically..."
                className="w-full p-3 rounded-xl border border-input bg-background text-xs font-mono text-foreground leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Submit Action */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Audited against Indian Contract Act 1872 &amp; Specific Relief Act 1963</span>
              </div>

              <button
                onClick={handleInspectDocument}
                disabled={docLoading}
                className="btn-primary text-xs font-bold px-6 py-2.5 shadow-md self-start sm:self-auto cursor-pointer"
              >
                {docLoading ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Auditing Agreement Legality...</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4 text-amber-300" />
                    <span>Inspect Agreement (Right or Wrong?)</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* ============================================================ */}
          {/* DOCUMENT INSPECTION RESULT VIEW */}
          {/* ============================================================ */}
          {docInspectionResult && (
            <div className="space-y-6 animate-fade-up">
              {/* Verdict Banner */}
              {(() => {
                const style = getVerdictStyle(docInspectionResult.verdict)
                const Icon = style.icon
                return (
                  <div className={`p-6 rounded-2xl border ${style.bg} space-y-4 shadow-sm`}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white ${style.badgeBg} shadow-sm shrink-0`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className={`text-[11px] font-black px-2.5 py-0.5 rounded-full ${style.badgeBg}`}>
                              {docInspectionResult.verdict === 'RIGHT' ? 'RIGHT / ENFORCEABLE' : docInspectionResult.verdict === 'WRONG' ? 'WRONG / VOID COVENANTS' : 'AT-RISK / DEFECTIVE'}
                            </span>
                            <span className="text-xs font-bold text-foreground">
                              Statutory Score: {docInspectionResult.statutoryValidityScore}/100
                            </span>
                          </div>
                          <h2 className="text-lg md:text-xl font-bold font-serif text-foreground mt-1">
                            {docInspectionResult.verdictBadge}
                          </h2>
                        </div>
                      </div>

                      {/* Flagship Action Buttons */}
                      <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
                        <button
                          onClick={handleSaveAsTemplate}
                          disabled={savingTemplate}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-card border border-border hover:bg-muted text-foreground transition-all cursor-pointer shadow-xs"
                          title="Save this inspected agreement as a reusable template"
                        >
                          <Save className="w-3.5 h-3.5 text-blue-600" />
                          <span>{savingTemplate ? 'Saving...' : 'Save as Template'}</span>
                        </button>

                        <button
                          onClick={handleCreateSameAgreement}
                          disabled={creatingAgreement}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-primary hover:bg-primary/90 text-white transition-all cursor-pointer shadow-md shadow-primary/20"
                          title="Generate a fresh, legally compliant draft from this document"
                        >
                          <PlusCircle className="w-3.5 h-3.5 text-amber-300" />
                          <span>{creatingAgreement ? 'Generating...' : 'Create the Same'}</span>
                        </button>
                      </div>
                    </div>

                    <p className="text-sm text-foreground/90 leading-relaxed font-medium">
                      {showHindi ? docInspectionResult.verdictSummaryHi : docInspectionResult.verdictSummary}
                    </p>

                    <div className="text-[11px] text-muted-foreground flex items-center gap-2 pt-2 border-t border-border/40 font-mono">
                      <span>Statutory Benchmark:</span>
                      <strong className="text-foreground">{docInspectionResult.statutoryGrounds}</strong>
                    </div>
                  </div>
                )
              })()}

              {/* WHY RIGHT OR WRONG (Statutory Audit Checklist) */}
              <div className="card-premium p-6 space-y-4">
                <h3 className="font-semibold text-base text-foreground flex items-center gap-2">
                  <Scale className="w-4 h-4 text-primary" />
                  Statutory Audit: Why is this Agreement Right or Wrong?
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {docInspectionResult.whyRightOrWrong.map((item, idx) => (
                    <div
                      key={idx}
                      className={`p-3.5 rounded-xl border flex items-start gap-3 ${
                        item.status === 'PASS'
                          ? 'border-emerald-500/30 bg-emerald-500/5'
                          : item.status === 'FAIL'
                          ? 'border-rose-500/30 bg-rose-500/5'
                          : 'border-amber-500/30 bg-amber-500/5'
                      }`}
                    >
                      <div className="mt-0.5 shrink-0">
                        {item.status === 'PASS' ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        ) : item.status === 'FAIL' ? (
                          <ShieldAlert className="w-4 h-4 text-rose-600" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-amber-600" />
                        )}
                      </div>
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs font-bold text-foreground truncate">{item.clauseOrIssue}</p>
                          <span
                            className={`text-[9px] font-black px-1.5 py-0.2 rounded ${
                              item.status === 'PASS'
                                ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                                : item.status === 'FAIL'
                                ? 'bg-rose-500/20 text-rose-700 dark:text-rose-300'
                                : 'bg-amber-500/20 text-amber-700 dark:text-amber-300'
                            }`}
                          >
                            {item.status}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">{item.reason}</p>
                        {item.statuteRef && (
                          <p className="text-[10px] font-mono text-primary font-semibold mt-1">
                            Ref: {item.statuteRef}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ADVANTAGES & DISADVANTAGES (Client vs Owner Perspective) */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Client View */}
                <div className="card-premium p-6 space-y-4 border-l-4 border-l-blue-600">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-base text-foreground flex items-center gap-2">
                      <User className="w-4 h-4 text-blue-600" />
                      {docInspectionResult.clientPerspective.roleTitle}
                    </h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600">
                      Client View
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-600 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Advantages for Client
                      </h4>
                      {docInspectionResult.clientPerspective.advantages.map((adv, i) => (
                        <div key={i} className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-xs">
                          <p className="font-bold text-foreground">{adv.title}</p>
                          <p className="text-muted-foreground mt-0.5 leading-relaxed">{adv.explanation}</p>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-2 pt-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-rose-600 flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" /> Disadvantages &amp; Risks for Client
                      </h4>
                      {docInspectionResult.clientPerspective.disadvantages.map((dis, i) => (
                        <div key={i} className="p-3 rounded-xl bg-rose-500/5 border border-rose-500/20 text-xs">
                          <p className="font-bold text-foreground">{dis.title}</p>
                          <p className="text-muted-foreground mt-0.5 leading-relaxed">{dis.explanation}</p>
                          {dis.riskNote && (
                            <p className="text-[10px] text-rose-600 font-semibold mt-1">Caution: {dis.riskNote}</p>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="p-3 rounded-xl bg-muted/30 border border-border text-xs">
                      <span className="font-bold text-foreground block mb-0.5">Summary Advice for Client:</span>
                      <p className="text-muted-foreground leading-relaxed">
                        {showHindi
                          ? docInspectionResult.clientPerspective.simpleTakeawayHi
                          : docInspectionResult.clientPerspective.simpleTakeaway}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Owner / Lawyer View */}
                <div className="card-premium p-6 space-y-4 border-l-4 border-l-purple-600">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-base text-foreground flex items-center gap-2">
                      <Building className="w-4 h-4 text-purple-600" />
                      {docInspectionResult.ownerPerspective.roleTitle}
                    </h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600">
                      Owner/Lawyer View
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-600 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Advantages for Owner
                      </h4>
                      {docInspectionResult.ownerPerspective.advantages.map((adv, i) => (
                        <div key={i} className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-xs">
                          <p className="font-bold text-foreground">{adv.title}</p>
                          <p className="text-muted-foreground mt-0.5 leading-relaxed">{adv.explanation}</p>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-2 pt-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-rose-600 flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" /> Disadvantages &amp; Risks for Owner
                      </h4>
                      {docInspectionResult.ownerPerspective.disadvantages.map((dis, i) => (
                        <div key={i} className="p-3 rounded-xl bg-rose-500/5 border border-rose-500/20 text-xs">
                          <p className="font-bold text-foreground">{dis.title}</p>
                          <p className="text-muted-foreground mt-0.5 leading-relaxed">{dis.explanation}</p>
                          {dis.riskNote && (
                            <p className="text-[10px] text-rose-600 font-semibold mt-1">Caution: {dis.riskNote}</p>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="p-3 rounded-xl bg-muted/30 border border-border text-xs">
                      <span className="font-bold text-foreground block mb-0.5">Summary Advice for Owner:</span>
                      <p className="text-muted-foreground leading-relaxed">
                        {showHindi
                          ? docInspectionResult.ownerPerspective.simpleTakeawayHi
                          : docInspectionResult.ownerPerspective.simpleTakeaway}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* SUGGESTIONS TO IMPROVE (Redline Amendments & Watertight Draft) */}
              <div className="card-premium p-6 space-y-6">
                <div>
                  <h3 className="font-semibold text-base text-foreground flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-amber-500" />
                    Actionable Suggestions to Improve (Make It Legally Watertight)
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Specific redlines to replace void clauses with enforceable legal language under Indian law.
                  </p>
                </div>

                {/* Recommended Redlines */}
                <div className="space-y-4">
                  {docInspectionResult.suggestionsToImprove.recommendedChanges.map((change, i) => (
                    <div key={i} className="p-4 rounded-xl border border-border bg-muted/10 space-y-2 text-xs">
                      <span className="font-bold text-foreground">{change.clauseName}</span>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                        <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-300">
                          <span className="font-bold text-[10px] uppercase block mb-1">Current Flaw / Void Clause:</span>
                          <p className="italic">{change.currentFlaw}</p>
                        </div>
                        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                          <span className="font-bold text-[10px] uppercase block mb-1">Watertight Replacement:</span>
                          <p>{change.improvedReplacement}</p>
                        </div>
                      </div>
                      <p className="text-[11px] text-muted-foreground font-medium pt-1">
                        Why this helps: <span className="text-foreground">{change.whyItHelps}</span>
                      </p>
                    </div>
                  ))}
                </div>

                {/* Missing Mandatory Clauses */}
                {docInspectionResult.suggestionsToImprove.missingMandatoryClauses.length > 0 && (
                  <div className="space-y-3 pt-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
                      Mandatory Missing Clauses to Add:
                    </h4>
                    <div className="space-y-2">
                      {docInspectionResult.suggestionsToImprove.missingMandatoryClauses.map((missing, i) => (
                        <div key={i} className="p-3.5 rounded-xl border border-border bg-background space-y-1 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-foreground">{missing.clauseName}</span>
                            <span className="text-[10px] font-mono text-primary font-semibold">Recommended</span>
                          </div>
                          <p className="text-muted-foreground">{missing.purpose}</p>
                          <div className="p-2.5 rounded-lg bg-muted/30 font-mono text-[11px] text-foreground mt-2">
                            {missing.suggestedDraft}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Watertight Revised Agreement Text */}
                <div className="space-y-2 pt-2 border-t border-border">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                      <FileCheck className="w-4 h-4 text-emerald-600" />
                      Watertight Revised Agreement Draft
                    </h4>
                    <button
                      onClick={() =>
                        copyToClipboard(
                          showHindi
                            ? docInspectionResult.suggestionsToImprove.watertightRevisedAgreementHi
                            : docInspectionResult.suggestionsToImprove.watertightRevisedAgreementEn,
                          'full-draft'
                        )
                      }
                      className="text-xs text-primary hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      {copiedKey === 'full-draft' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey === 'full-draft' ? 'Copied Draft!' : 'Copy Full Draft'}</span>
                    </button>
                  </div>

                  <pre className="p-4 rounded-xl border border-border bg-background text-xs font-mono text-foreground whitespace-pre-wrap leading-relaxed max-h-80 overflow-y-auto no-scrollbar">
                    {showHindi
                      ? docInspectionResult.suggestionsToImprove.watertightRevisedAgreementHi
                      : docInspectionResult.suggestionsToImprove.watertightRevisedAgreementEn}
                  </pre>
                </div>

                {/* Bottom Action Footer */}
                <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="text-xs">
                    <p className="font-bold text-foreground">Ready to use this agreement?</p>
                    <p className="text-muted-foreground">
                      Save as a reusable template for your practice, or generate a fresh agreement for immediate digital e-signature.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={handleSaveAsTemplate}
                      disabled={savingTemplate}
                      className="px-4 py-2 rounded-xl text-xs font-bold border border-blue-500/40 bg-card hover:bg-muted text-foreground transition-all cursor-pointer shadow-xs"
                    >
                      {savingTemplate ? 'Saving...' : '💾 Save as Template'}
                    </button>
                    <button
                      onClick={handleCreateSameAgreement}
                      disabled={creatingAgreement}
                      className="btn-primary text-xs font-bold px-4 py-2 shadow-md cursor-pointer"
                    >
                      {creatingAgreement ? 'Creating...' : '⚡ Create the Same Agreement'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* MODE 2: TYPE / PASTE DISPUTE ARGUMENT TEXT */}
      {/* ============================================================ */}
      {analysisMode === 'text' && (
        <div className="space-y-6">
          <div className="card-premium p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
              <div>
                <h3 className="font-serif font-bold text-lg text-foreground flex items-center gap-2">
                  <Scale className="w-5 h-5 text-primary" />
                  Dispute Claim &amp; Argument Input
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Type your legal argument or select from Indian commercial dispute presets.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Focus:</span>
                <select
                  value={roleFocus}
                  onChange={(e) => setRoleFocus(e.target.value as any)}
                  className="text-xs px-2.5 py-1.5 rounded-lg border border-input bg-background text-foreground"
                >
                  <option value="BOTH">Client &amp; Owner Both</option>
                  <option value="CLIENT">Client Focus</option>
                  <option value="OWNER">Owner / Firm Focus</option>
                </select>
              </div>
            </div>

            {/* Presets */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Select Dispute Preset:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {PRESET_ARGUMENTS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => {
                      setArgumentText(preset.text)
                      setContextInput(preset.context)
                    }}
                    className="p-3 rounded-xl border border-border bg-card hover:border-primary/40 hover:bg-muted/30 text-left transition-all cursor-pointer"
                  >
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-mono">
                      {preset.category}
                    </span>
                    <p className="text-xs font-semibold text-foreground mt-1 line-clamp-1">{preset.title}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{preset.label}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Textarea */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-foreground">Dispute Claim / Argument Text</label>
              <textarea
                rows={5}
                value={argumentText}
                onChange={(e) => setArgumentText(e.target.value)}
                placeholder="Describe the contractual dispute or argument..."
                className="w-full p-3.5 rounded-xl border border-input bg-background text-xs font-mono text-foreground leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="flex items-center justify-between gap-3 pt-2">
              <span className="text-xs text-muted-foreground">
                Evaluates strengths, vulnerabilities, and counter-arguments.
              </span>
              <button
                onClick={handleAnalyzeText}
                disabled={textLoading}
                className="btn-primary text-xs font-bold px-6 py-2.5 shadow-md cursor-pointer"
              >
                {textLoading ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Analyzing Legal Viability...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Analyze Argument (Client &amp; Owner)</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* TEXT ARGUMENT RESULTS */}
          {textResult && (
            <div className="space-y-6 animate-fade-up">
              <div className="card-premium p-6 space-y-4">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div>
                    <span className="text-xs font-bold text-primary font-mono uppercase">
                      Viability Score: {textResult.viabilityScore}/100
                    </span>
                    <h2 className="text-xl font-bold font-serif text-foreground mt-0.5">{textResult.title}</h2>
                  </div>
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 border border-blue-500/20">
                    Risk Level: {textResult.riskLevel}
                  </span>
                </div>
                <p className="text-sm text-foreground/90 leading-relaxed">
                  {showHindi ? textResult.summaryHi : textResult.summary}
                </p>
              </div>

              {/* Client & Owner Perspectives */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="card-premium p-6 space-y-4 border-l-4 border-l-blue-600">
                  <h3 className="font-semibold text-base text-foreground flex items-center gap-2">
                    <User className="w-4 h-4 text-blue-600" />
                    {textResult.clientPerspective.roleDescription}
                  </h3>
                  <div className="space-y-2 text-xs">
                    <span className="font-bold text-emerald-600 block">Advantages for Client:</span>
                    {textResult.clientPerspective.advantages.map((a, i) => (
                      <div key={i} className="p-2.5 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                        <p className="font-bold text-foreground">{a.title}</p>
                        <p className="text-muted-foreground mt-0.5">{a.explanation}</p>
                      </div>
                    ))}

                    <span className="font-bold text-rose-600 block pt-2">Disadvantages &amp; Vulnerabilities:</span>
                    {textResult.clientPerspective.disadvantages.map((d, i) => (
                      <div key={i} className="p-2.5 rounded-lg bg-rose-500/5 border border-rose-500/20">
                        <p className="font-bold text-foreground">{d.title}</p>
                        <p className="text-muted-foreground mt-0.5">{d.explanation}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="card-premium p-6 space-y-4 border-l-4 border-l-purple-600">
                  <h3 className="font-semibold text-base text-foreground flex items-center gap-2">
                    <Building className="w-4 h-4 text-purple-600" />
                    {textResult.ownerPerspective.roleDescription}
                  </h3>
                  <div className="space-y-2 text-xs">
                    <span className="font-bold text-emerald-600 block">Advantages for Owner:</span>
                    {textResult.ownerPerspective.advantages.map((a, i) => (
                      <div key={i} className="p-2.5 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                        <p className="font-bold text-foreground">{a.title}</p>
                        <p className="text-muted-foreground mt-0.5">{a.explanation}</p>
                      </div>
                    ))}

                    <span className="font-bold text-rose-600 block pt-2">Disadvantages &amp; Vulnerabilities:</span>
                    {textResult.ownerPerspective.disadvantages.map((d, i) => (
                      <div key={i} className="p-2.5 rounded-lg bg-rose-500/5 border border-rose-500/20">
                        <p className="font-bold text-foreground">{d.title}</p>
                        <p className="text-muted-foreground mt-0.5">{d.explanation}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* What Will Improve */}
              <div className="card-premium p-6 space-y-4">
                <h3 className="font-semibold text-base text-foreground flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-amber-500" />
                  What Will Improve (Strategic Steps &amp; Revised Argument)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {textResult.whatWillImprove.strategicImprovements.map((s, i) => (
                    <div key={i} className="p-3.5 rounded-xl border border-border bg-muted/20 text-xs space-y-1">
                      <span className="font-bold text-primary">{s.area}</span>
                      <p className="font-medium text-foreground">{s.action}</p>
                      <p className="text-muted-foreground text-[11px]">{s.whyItHelps}</p>
                    </div>
                  ))}
                </div>

                <div className="space-y-2 pt-2 border-t border-border">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                      Stronger Revised Argument:
                    </span>
                    <button
                      onClick={() =>
                        copyToClipboard(
                          showHindi
                            ? textResult.whatWillImprove.strongerRevisedArgumentHi
                            : textResult.whatWillImprove.strongerRevisedArgumentEn,
                          'arg-draft'
                        )
                      }
                      className="text-xs text-primary hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      {copiedKey === 'arg-draft' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey === 'arg-draft' ? 'Copied!' : 'Copy Argument'}</span>
                    </button>
                  </div>
                  <p className="p-3.5 rounded-xl bg-background border border-border text-xs leading-relaxed font-mono">
                    {showHindi
                      ? textResult.whatWillImprove.strongerRevisedArgumentHi
                      : textResult.whatWillImprove.strongerRevisedArgumentEn}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
