'use client'

import React, { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  FileText,
  Sparkles,
  ChevronLeft,
  Share2,
  Download,
  Printer,
  PenTool,
  CheckCircle2,
  AlertTriangle,
  Scale,
  ShieldAlert,
  HelpCircle,
  Copy,
  ExternalLink,
  MessageSquare,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  History,
  RotateCcw,
  BookOpen,
  Link2,
  Building,
  Briefcase,
  Check,
  QrCode,
  Eye,
  SlidersHorizontal,
  X,
  ShieldCheck,
  ChevronRight,
  Search,
  Zap
} from 'lucide-react'
import { getLegalNotesForTemplate, STATE_LEGAL_NOTES } from '@/lib/agreement/legal-notes'
import { generateAgreementQrSvg } from '@/lib/agreement/qrcode'

interface Party {
  id: string
  role: string
  nameEn: string
  nameHi?: string | null
  fatherSpouseNameEn?: string | null
  fatherSpouseNameHi?: string | null
  age?: number | null
  addressEn: string
  addressHi?: string | null
  pan?: string | null
  aadhaarMasked?: string | null
  phone?: string | null
  email?: string | null
  isWitness: boolean
  signatureStatus: string
}

interface Signature {
  id: string
  partyId: string
  signerName: string
  signatureType: string
  signatureData: string
  signedAt: string
  ipAddress?: string | null
}

interface Version {
  id: string
  versionNumber: number
  compiledEn: string
  compiledHi?: string | null
  changeSummary?: string | null
  createdBy?: string | null
  createdAt: string
}

interface AgreementData {
  id: string
  agreementNumber: string
  templateCode: string
  title: string
  titleHi?: string | null
  category: string
  language: string
  status: string
  state: string
  city?: string | null
  executionDate: string
  considerationAmount?: number | null
  formData: string
  customClauses: string
  compiledEn?: string | null
  compiledHi?: string | null
  riskScore: number
  riskAnalysis?: string | null
  caseId?: string | null
  clientId?: string | null
  parties: Party[]
  versions: Version[]
  signatures: Signature[]
  case?: { id: string; title: string; caseNumber: string } | null
  client?: { id: string; name: string } | null
}

interface Props {
  initialAgreement: AgreementData
  casesList: Array<{ id: string; title: string; caseNumber: string }>
  clientsList: Array<{ id: string; name: string }>
}

type ViewMode = 'EN' | 'HI' | 'SIDE_BY_SIDE' | 'SEQUENTIAL'

export default function AgreementDetailWorkspace({
  initialAgreement,
  casesList,
  clientsList
}: Props) {
  const router = useRouter()
  const [agreement, setAgreement] = useState<AgreementData>(initialAgreement)
  const [viewMode, setViewMode] = useState<ViewMode>(
    (initialAgreement.language as ViewMode) || 'SIDE_BY_SIDE'
  )
  const [selectedState, setSelectedState] = useState<string>(initialAgreement.state || 'Delhi')
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  // Side panels & Drawer tabs
  const [activeTab, setActiveTab] = useState<'legal' | 'ai' | 'glossary' | 'clauses' | 'versions'>('legal')
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false)

  // Clause Editing State
  const [editingClauseId, setEditingClauseId] = useState<string | null>(null)
  const [editClauseEn, setEditClauseEn] = useState('')
  const [editClauseHi, setEditClauseHi] = useState('')

  // Modals
  const [showSignModal, setShowSignModal] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [showExportModal, setShowExportModal] = useState(false)
  const [showAttachModal, setShowAttachModal] = useState(false)
  const [showNegotiateModal, setShowNegotiateModal] = useState(false)
  const [showExplainModal, setShowExplainModal] = useState(false)
  const [showDiffModal, setShowDiffModal] = useState(false)
  const [selectedVersionForDiff, setSelectedVersionForDiff] = useState<Version | null>(null)

  // Clause Clarity Improver Modal
  const [showImproveModal, setShowImproveModal] = useState(false)
  const [clauseToImprove, setClauseToImprove] = useState<{ title: string; en: string; hi?: string } | null>(null)
  const [improveResult, setImproveResult] = useState<any>(null)
  const [isImproving, setIsImproving] = useState(false)

  // Bilingual Legal Glossary Explainer
  const [glossaryTerm, setGlossaryTerm] = useState('Indemnity')
  const [glossaryResult, setGlossaryResult] = useState<any>({
    term: 'Indemnity',
    termHi: 'क्षतिपूर्ति (हानि से सुरक्षा)',
    plainEnglish: 'A legal promise where one party agrees to pay for any financial loss, damages, or lawsuit expenses suffered by the other party.',
    plainHindi: 'यह एक कानूनी वादा है जिसमें एक पक्ष दूसरे पक्ष को होने वाले किसी भी आर्थिक नुकसान, हर्जाने या कोर्ट-कचहरी के खर्च की भरपाई करने की गारंटी देता है।',
    exampleScenario: 'If a tenant damages an expensive electrical fitting, the indemnity clause obliges them to pay for repairs so the owner suffers no financial loss.',
    practicalTip: 'Always limit indemnity to "actual direct losses" and exclude indirect or consequential damages before signing.'
  })
  const [isSearchingGlossary, setIsSearchingGlossary] = useState(false)

  // E-Sign Form
  const [signingPartyId, setSigningPartyId] = useState<string>(
    initialAgreement.parties.find(p => p.signatureStatus === 'PENDING')?.id || initialAgreement.parties[0]?.id || ''
  )
  const [signatureType, setSignatureType] = useState<'TYPED' | 'DRAWN'>('TYPED')
  const [typedSignName, setTypedSignName] = useState(
    initialAgreement.parties[0]?.nameEn || ''
  )
  const [aadhaarConsent, setAadhaarConsent] = useState(false)
  const [isSigningLoading, setIsSigningLoading] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [isDrawing, setIsDrawing] = useState(false)

  // AI states
  const [riskPerspective, setRiskPerspective] = useState<string>('TENANT')
  const [riskData, setRiskData] = useState<any>(null)
  const [isAnalyzingRisk, setIsAnalyzingRisk] = useState(false)
  const [missingClauses, setMissingClauses] = useState<any[]>([])
  const [isCheckingMissing, setIsCheckingMissing] = useState(false)
  const [activeExplainClause, setActiveExplainClause] = useState<{ title: string; en: string; hi?: string } | null>(null)
  const [explainResult, setExplainResult] = useState<any>(null)
  const [isExplaining, setIsExplaining] = useState(false)
  const [activeNegotiateClause, setActiveNegotiateClause] = useState<string>('')
  const [negotiateGoal, setNegotiateGoal] = useState<string>('Request 5-day grace period on security deposit return')
  const [negotiateResult, setNegotiateResult] = useState<any>(null)
  const [isNegotiating, setIsNegotiating] = useState(false)

  // Parse Clauses from Compiled text
  const parseClauses = (fullText: string) => {
    if (!fullText) return []
    const lines = fullText.split('\n\n')
    const clauses: Array<{ id: string; title: string; text: string }> = []
    let currentClause: { id: string; title: string; text: string } | null = null

    lines.forEach((paragraph, idx) => {
      // Check if line starts with numbered clause pattern e.g. "1. Term" or "1. अवधि"
      const match = paragraph.match(/^(\d+[\.\)]\s*[^\n]+)/)
      if (match) {
        if (currentClause) clauses.push(currentClause)
        const parts = paragraph.split('\n')
        currentClause = {
          id: `clause-${idx}`,
          title: parts[0].trim(),
          text: parts.slice(1).join('\n').trim() || parts[0].trim()
        }
      } else if (currentClause) {
        currentClause.text += '\n\n' + paragraph
      }
    })
    if (currentClause) clauses.push(currentClause)
    return clauses
  }

  const [clausesListEn, setClausesListEn] = useState<Array<{ id: string; title: string; text: string }>>([])
  const [clausesListHi, setClausesListHi] = useState<Array<{ id: string; title: string; text: string }>>([])

  useEffect(() => {
    if (agreement.compiledEn) {
      setClausesListEn(parseClauses(agreement.compiledEn))
    }
    if (agreement.compiledHi) {
      setClausesListHi(parseClauses(agreement.compiledHi))
    }
  }, [agreement.compiledEn, agreement.compiledHi])

  // Save Agreement Changes to Server
  const saveAgreementChanges = async (newEn?: string, newHi?: string, summary?: string) => {
    setIsSaving(true)
    try {
      const payload: Record<string, any> = {
        state: selectedState,
        language: viewMode
      }
      if (newEn !== undefined) payload.compiledEn = newEn
      if (newHi !== undefined) payload.compiledHi = newHi
      if (summary) payload.changeSummary = summary

      const res = await fetch(`/api/agreements/${agreement.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (res.ok) {
        const updated = await res.json()
        setAgreement(updated)
        setSaveSuccess(true)
        setTimeout(() => setSaveSuccess(false), 2000)
      }
    } catch (err) {
      console.error('Failed to save agreement:', err)
    } finally {
      setIsSaving(false)
    }
  }

  // Handle Inline Clause Edit Save
  const handleSaveClauseEdit = (index: number) => {
    const updatedEn = [...clausesListEn]
    const updatedHi = [...clausesListHi]

    if (updatedEn[index]) {
      updatedEn[index].text = editClauseEn
    }
    if (updatedHi[index]) {
      updatedHi[index].text = editClauseHi
    }

    const newCompiledEn = rebuildFullText(agreement.compiledEn || '', updatedEn)
    const newCompiledHi = rebuildFullText(agreement.compiledHi || '', updatedHi)

    setClausesListEn(updatedEn)
    setClausesListHi(updatedHi)
    setEditingClauseId(null)
    saveAgreementChanges(newCompiledEn, newCompiledHi, `Edited clause ${index + 1}`)
  }

  // Move Clause Up/Down
  const handleMoveClause = (index: number, direction: 'UP' | 'DOWN') => {
    const targetIdx = direction === 'UP' ? index - 1 : index + 1
    if (targetIdx < 0 || targetIdx >= clausesListEn.length) return

    const updatedEn = [...clausesListEn]
    const updatedHi = [...clausesListHi]

    const tempEn = updatedEn[index]
    updatedEn[index] = updatedEn[targetIdx]
    updatedEn[targetIdx] = tempEn

    if (updatedHi[index] && updatedHi[targetIdx]) {
      const tempHi = updatedHi[index]
      updatedHi[index] = updatedHi[targetIdx]
      updatedHi[targetIdx] = tempHi
    }

    const newCompiledEn = rebuildFullText(agreement.compiledEn || '', updatedEn)
    const newCompiledHi = rebuildFullText(agreement.compiledHi || '', updatedHi)

    setClausesListEn(updatedEn)
    setClausesListHi(updatedHi)
    saveAgreementChanges(newCompiledEn, newCompiledHi, `Reordered clause ${index + 1}`)
  }

  // Delete Clause
  const handleDeleteClause = (index: number) => {
    const updatedEn = clausesListEn.filter((_, i) => i !== index)
    const updatedHi = clausesListHi.filter((_, i) => i !== index)

    const newCompiledEn = rebuildFullText(agreement.compiledEn || '', updatedEn)
    const newCompiledHi = rebuildFullText(agreement.compiledHi || '', updatedHi)

    setClausesListEn(updatedEn)
    setClausesListHi(updatedHi)
    saveAgreementChanges(newCompiledEn, newCompiledHi, `Removed clause ${index + 1}`)
  }

  // Add Custom Clause
  const handleAddCustomClause = (
    titleEn: string = 'Dispute Resolution & Jurisdiction',
    titleHi: string = 'विवाद समाधान एवं क्षेत्राधिकार',
    textEn: string = 'Any disputes arising out of this agreement shall be settled through mutual negotiation or arbitration under the Arbitration and Conciliation Act 1996 in New Delhi.',
    textHi: string = 'इस अनुबंध से उत्पन्न किसी भी विवाद का निपटारा नई दिल्ली में मध्यस्थता एवं सुलह अधिनियम 1996 के तहत सुलझाया जाएगा।'
  ) => {
    const clauseNum = clausesListEn.length + 1
    const newEnItem = {
      id: `custom-${Date.now()}`,
      title: `${clauseNum}. ${titleEn}`,
      text: textEn
    }
    const newHiItem = {
      id: `custom-${Date.now()}`,
      title: `${clauseNum}. ${titleHi}`,
      text: textHi
    }

    const updatedEn = [...clausesListEn, newEnItem]
    const updatedHi = [...clausesListHi, newHiItem]

    const newCompiledEn = rebuildFullText(agreement.compiledEn || '', updatedEn)
    const newCompiledHi = rebuildFullText(agreement.compiledHi || '', updatedHi)

    setClausesListEn(updatedEn)
    setClausesListHi(updatedHi)
    saveAgreementChanges(newCompiledEn, newCompiledHi, `Added clause: ${titleEn}`)
  }

  const rebuildFullText = (
    original: string,
    clauses: Array<{ id: string; title: string; text: string }>
  ) => {
    // Keep preamble / recitals and append re-joined clauses
    const preambleMatch = original.match(/^([\s\S]*?)(?:WHEREAS|चूंकि|1\.)/)
    const preamble = preambleMatch ? preambleMatch[1].trim() : ''
    const clausesText = clauses.map(c => `${c.title}\n${c.text}`).join('\n\n')

    // Find witness block if present
    const witnessMatch = original.match(/(IN WITNESS WHEREOF|जिसके साक्ष्य स्वरूप)[\s\S]*$/)
    const witnessBlock = witnessMatch ? `\n\n${witnessMatch[0]}` : ''

    return `${preamble}\n\n${clausesText}${witnessBlock}`
  }

  const renderClauses = (
    clauses: Array<{ id: string; title: string; text: string }>,
    lang: 'EN' | 'HI'
  ) => {
    return clauses.map((clause, idx) => {
      const isEditing = editingClauseId === clause.id
      return (
        <div
          key={clause.id}
          className={`group p-4 rounded-xl border transition-all relative ${
            isEditing
              ? 'border-primary bg-primary/5 ring-1 ring-primary'
              : 'border-transparent hover:border-border hover:bg-muted/10'
          }`}
        >
          <div className="flex items-start justify-between gap-2 mb-2">
            <h4 className="font-bold text-sm md:text-base text-foreground leading-snug">
              {clause.title}
            </h4>

            {/* Floating Clause Actions */}
            <div className="sm:opacity-0 group-hover:opacity-100 opacity-100 transition-opacity flex items-center gap-1 font-sans flex-wrap">
              <button
                onClick={() => {
                  setEditingClauseId(clause.id)
                  setEditClauseEn(clausesListEn[idx]?.text || '')
                  setEditClauseHi(clausesListHi[idx]?.text || '')
                }}
                className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground text-xs"
                title="Edit Clause"
              >
                Edit
              </button>
              <button
                onClick={() =>
                  handleOpenExplain(
                    clause.title,
                    clausesListEn[idx]?.text || clause.text,
                    clausesListHi[idx]?.text
                  )
                }
                className="p-1 rounded hover:bg-muted text-accent hover:text-accent font-semibold text-xs flex items-center gap-0.5"
                title="Explain in Plain Words"
              >
                <HelpCircle className="w-3.5 h-3.5" /> Explain
              </button>
              <button
                onClick={() =>
                  handleOpenImprove(
                    clause.title,
                    clausesListEn[idx]?.text || clause.text,
                    clausesListHi[idx]?.text
                  )
                }
                className="p-1 rounded hover:bg-emerald-500/10 text-emerald-600 font-semibold text-xs flex items-center gap-0.5"
                title="Suggest Clearer, Balanced Improvements"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-500" /> Improve
              </button>
              <button
                onClick={() => handleOpenNegotiate(clausesListEn[idx]?.text || clause.text)}
                className="p-1 rounded hover:bg-muted text-primary hover:text-primary font-semibold text-xs flex items-center gap-0.5"
                title="Negotiate Counter-Proposal"
              >
                <MessageSquare className="w-3.5 h-3.5" /> Negotiate
              </button>
            </div>
          </div>

          {isEditing ? (
            <div className="space-y-3 font-sans pt-2">
              <textarea
                value={lang === 'EN' ? editClauseEn : editClauseHi}
                onChange={e =>
                  lang === 'EN' ? setEditClauseEn(e.target.value) : setEditClauseHi(e.target.value)
                }
                rows={4}
                className="w-full p-3 rounded-xl border border-border bg-card text-foreground text-sm focus:ring-1 focus:ring-primary focus:outline-none"
              />
              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={() => setEditingClauseId(null)}
                  className="px-3 py-1.5 rounded-lg border border-border text-xs font-semibold hover:bg-muted text-foreground"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleSaveClauseEdit(idx)}
                  className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90"
                >
                  Save Clause
                </button>
              </div>
            </div>
          ) : (
            <p className="text-sm md:text-base leading-relaxed text-foreground whitespace-pre-line">
              {clause.text}
            </p>
          )}
        </div>
      )
    })
  }

  // AI Risk Meter Execution
  const runRiskAnalysis = async () => {
    setIsAnalyzingRisk(true)
    try {
      const res = await fetch('/api/agreements/risk-meter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agreementText: agreement.compiledEn,
          perspective: riskPerspective
        })
      })
      if (res.ok) {
        const data = await res.json()
        setRiskData(data)
      }
    } catch (err) {
      console.error('Risk analysis error:', err)
    } finally {
      setIsAnalyzingRisk(false)
    }
  }

  // AI Missing Clauses Execution
  const runMissingClausesCheck = async () => {
    setIsCheckingMissing(true)
    try {
      const res = await fetch('/api/agreements/missing-clauses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agreementText: agreement.compiledEn,
          templateCategory: agreement.category
        })
      })
      if (res.ok) {
        const data = await res.json()
        setMissingClauses(data.missingClauses || [])
      }
    } catch (err) {
      console.error('Missing clauses error:', err)
    } finally {
      setIsCheckingMissing(false)
    }
  }

  // AI Explain Clause
  const handleOpenExplain = async (title: string, en: string, hi?: string) => {
    setActiveExplainClause({ title, en, hi })
    setExplainResult(null)
    setShowExplainModal(true)
    setIsExplaining(true)
    try {
      const res = await fetch('/api/agreements/explain-clause', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clauseTextEn: en, clauseTextHi: hi })
      })
      if (res.ok) {
        const data = await res.json()
        setExplainResult(data)
      }
    } catch (err) {
      console.error('Explain error:', err)
    } finally {
      setIsExplaining(false)
    }
  }

  // AI Negotiate Clause
  const handleOpenNegotiate = (enText: string) => {
    setActiveNegotiateClause(enText)
    setNegotiateResult(null)
    setShowNegotiateModal(true)
  }

  const runNegotiationAI = async () => {
    setIsNegotiating(true)
    try {
      const res = await fetch('/api/agreements/negotiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clauseText: activeNegotiateClause,
          userGoal: negotiateGoal
        })
      })
      if (res.ok) {
        const data = await res.json()
        setNegotiateResult(data)
      }
    } catch (err) {
      console.error('Negotiate error:', err)
    } finally {
      setIsNegotiating(false)
    }
  }

  // AI Unclear Clause Improver
  const handleOpenImprove = async (title: string, enText: string, hiText?: string) => {
    setClauseToImprove({ title, en: enText, hi: hiText })
    setImproveResult(null)
    setShowImproveModal(true)
    setIsImproving(true)
    try {
      const res = await fetch('/api/agreements/improve-clause', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clauseTextEn: enText, clauseTextHi: hiText })
      })
      if (res.ok) {
        const data = await res.json()
        setImproveResult(data)
      }
    } catch (err) {
      console.error('Improve clause error:', err)
    } finally {
      setIsImproving(false)
    }
  }

  const handleApplyImprovedClause = (
    originalEnText?: string,
    improvedEn?: string,
    improvedHi?: string
  ) => {
    const origEn = originalEnText || clauseToImprove?.en || ''
    const newEn = improvedEn || improveResult?.improvedEn || ''
    const newHi = improvedHi || improveResult?.improvedHi || ''
    if (!newEn) return

    const idx = clausesListEn.findIndex(
      c => c.text === origEn || origEn.includes(c.text) || c.text.includes(origEn.slice(0, 30))
    )
    if (idx !== -1) {
      const updatedEn = [...clausesListEn]
      const updatedHi = [...clausesListHi]
      updatedEn[idx] = { ...updatedEn[idx], text: newEn }
      if (updatedHi[idx]) {
        updatedHi[idx] = { ...updatedHi[idx], text: newHi }
      }
      const newCompiledEn = rebuildFullText(agreement.compiledEn || '', updatedEn)
      const newCompiledHi = rebuildFullText(agreement.compiledHi || '', updatedHi)
      setClausesListEn(updatedEn)
      setClausesListHi(updatedHi)
      saveAgreementChanges(newCompiledEn, newCompiledHi, `Improved clause clarity: ${updatedEn[idx].title}`)
    } else {
      handleAddCustomClause('Clarified & Balanced Clause', 'स्पष्ट एवं संतुलित शर्त', newEn, newHi)
    }
    setShowImproveModal(false)
  }

  // AI Bilingual Legal Glossary Search
  const handleSearchGlossary = async (termToSearch: string) => {
    const term = termToSearch.trim()
    if (!term) return
    setGlossaryTerm(term)
    setIsSearchingGlossary(true)
    try {
      const res = await fetch('/api/agreements/explain-term', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ term })
      })
      if (res.ok) {
        const data = await res.json()
        setGlossaryResult(data)
      }
    } catch (err) {
      console.error('Glossary search error:', err)
    } finally {
      setIsSearchingGlossary(false)
    }
  }

  // Real-time Missing Details & Compliance Gaps Auditor
  const getMissingAgreementDetails = () => {
    const gaps: Array<{
      id: string
      titleEn: string
      titleHi: string
      severity: 'CRITICAL' | 'RECOMMENDED' | 'STATUTORY'
      reasonEn: string
      reasonHi: string
      suggestedClauseEn: string
      suggestedClauseHi: string
    }> = []

    const fullText = (agreement.compiledEn || '').toLowerCase()

    // 1. Missing party identity
    const partyMissingId = agreement.parties.some(p => !p.pan && !p.aadhaarMasked)
    if (partyMissingId) {
      gaps.push({
        id: 'missing-identity',
        titleEn: 'Identity Proof Verification Gap (PAN/Aadhaar)',
        titleHi: 'पहचान दस्तावेज एवं पैन/आधार का अभाव',
        severity: 'CRITICAL',
        reasonEn: 'Contracts lacking PAN or masked Aadhaar details face admissibility hurdles and identity disputes in Indian civil courts.',
        reasonHi: 'पैन या आधार के बिना अनुबंध सिविल कोर्ट में पक्षकारों की पहचान साबित करने में कमजोर पड़ जाते हैं।',
        suggestedClauseEn: 'Both parties confirm that their PAN and government identity credentials furnished herein are valid, authentic, and subject to verification under Indian law.',
        suggestedClauseHi: 'दोनों पक्ष पुष्टि करते हैं कि अनुबंध में प्रस्तुत उनके पैन एवं सरकारी पहचान विवरण पूर्णतः वैध, प्रामाणिक एवं विधि अनुसार सत्यापन योग्य हैं।'
      })
    }

    // 2. Lock-in Period
    if (!fullText.includes('lock-in') && !fullText.includes('lock in')) {
      gaps.push({
        id: 'missing-lockin',
        titleEn: 'Missing Lock-in Period & Exit Penalty Clause',
        titleHi: 'न्यूनतम अनिवार्य अवधि (लॉक-इन) का अभाव',
        severity: 'RECOMMENDED',
        reasonEn: 'Without a specified minimum lock-in period, either party can vacate abruptly causing uncompensated vacancy or disruption losses.',
        reasonHi: 'लॉक-इन अवधि न होने से कोई भी पक्ष अचानक अनुबंध तोड़ सकता है जिससे आर्थिक नुकसान की भरपाई नहीं हो पाती।',
        suggestedClauseEn: 'Neither party shall terminate this agreement during the initial Lock-in Period of 3 (three) months. An early exit during the lock-in shall obligate the exiting party to pay consideration for the remaining unexpired lock-in months.',
        suggestedClauseHi: 'प्रारंभिक 3 माह की लॉक-इन अवधि के दौरान कोई भी पक्ष अनुबंध समाप्त नहीं करेगा। इस अवधि में पहले बाहर निकलने पर शेष महीनों का किराया/शुल्क देना अनिवार्य होगा।'
      })
    }

    // 3. Deposit Refund SLA
    if (fullText.includes('deposit') && !fullText.includes('business days') && !fullText.includes('7 days') && !fullText.includes('15 days') && !fullText.includes('30 days')) {
      gaps.push({
        id: 'missing-deposit-sla',
        titleEn: 'Missing Deposit Refund SLA Timeline',
        titleHi: 'अमानत राशि (सिक्योरिटी डिपॉजिट) वापसी की तय समयसीमा का अभाव',
        severity: 'CRITICAL',
        reasonEn: 'Lack of an exact business-day deadline for returning security deposits is the #1 cause of tenancy litigation in India.',
        reasonHi: 'डिपॉजिट वापसी के लिए निश्चित दिनों की समयसीमा न होने से सबसे अधिक कानूनी विवाद पैदा होते हैं।',
        suggestedClauseEn: 'The security deposit shall be refunded in full via direct bank transfer within 7 (seven) business days of vacant key handover, subject only to verified utility bill deductions.',
        suggestedClauseHi: 'खाली चाबी सौंपने के 7 कार्य दिवसों के भीतर केवल सत्यापित बिजली/पानी बिलों की कटौती के बाद अमानत राशि सीधे बैंक खाते में वापस की जाएगी।'
      })
    }

    // 4. Arbitration Act 1996
    if (!fullText.includes('arbitration') && !fullText.includes('arbitrator')) {
      gaps.push({
        id: 'missing-arbitration',
        titleEn: 'Missing Arbitration & Fast-Track Dispute Clause',
        titleHi: 'मध्यस्थता एवं त्वरित विवाद समाधान शर्त का अभाव',
        severity: 'RECOMMENDED',
        reasonEn: 'In the absence of an arbitration clause, disputes are routed to regular civil courts where proceedings routinely take 5-10 years.',
        reasonHi: 'मध्यस्थता शर्त न होने पर विवाद सामान्य दीवानी अदालतों में जाते हैं जहां वर्षों का समय लग जाता है।',
        suggestedClauseEn: 'Any unresolved dispute arising out of this agreement shall be referred to sole arbitration under the Arbitration and Conciliation Act, 1996. The seat and venue of arbitration shall be New Delhi.',
        suggestedClauseHi: 'इस अनुबंध से जुड़े किसी भी अनसुलझे विवाद को मध्यस्थता एवं सुलह अधिनियम 1996 के तहत एकमात्र मध्यस्थ को भेजा जाएगा। मध्यस्थता का स्थल नई दिल्ली होगा।'
      })
    }

    // 5. Stamp Duty & Registration
    if (!fullText.includes('stamp duty') && !fullText.includes('registration fee')) {
      gaps.push({
        id: 'missing-stamp',
        titleEn: 'Missing Stamp Duty & Registration Liability',
        titleHi: 'स्टाम्प शुल्क एवं पंजीकरण दायित्व का अभाव',
        severity: 'STATUTORY',
        reasonEn: 'Under Indian Stamp Act, unstamped or improperly stamped agreements cannot be admitted in evidence in court.',
        reasonHi: 'भारतीय स्टाम्प अधिनियम के तहत बिना स्टाम्प वाले अनुबंध अदालत में साक्ष्य के रूप में स्वीकार्य नहीं होते।',
        suggestedClauseEn: 'All applicable e-stamp duty, registration charges, and statutory documentation fees shall be borne equally by both parties in 50:50 ratio unless otherwise specified in writing.',
        suggestedClauseHi: 'सभी लागू ई-स्टाम्प शुल्क एवं पंजीकरण प्रभार दोनों पक्षों द्वारा 50:50 के समान अनुपात में वहन किए जाएंगे जब तक कि अन्यथा लिखित में तय न हो।'
      })
    }

    return gaps
  }

  // Execute E-Signature
  const handleExecuteSignature = async () => {
    if (!aadhaarConsent) return
    setIsSigningLoading(true)
    try {
      let signatureData = typedSignName
      if (signatureType === 'DRAWN' && canvasRef.current) {
        signatureData = canvasRef.current.toDataURL('image/png')
      }

      const res = await fetch(`/api/agreements/${agreement.id}/sign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          partyId: signingPartyId,
          signerName: typedSignName,
          signatureType,
          signatureData
        })
      })

      if (res.ok) {
        const data = await res.json()
        setShowSignModal(false)
        // Refresh agreement details
        const refreshed = await fetch(`/api/agreements/${agreement.id}`).then(r => r.json())
        setAgreement(refreshed)
      }
    } catch (err) {
      console.error('Signing error:', err)
    } finally {
      setIsSigningLoading(false)
    }
  }

  // Canvas Drawing Handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true)
    const ctx = canvasRef.current?.getContext('2d')
    if (ctx) {
      ctx.beginPath()
      ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY)
    }
  }
  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return
    const ctx = canvasRef.current?.getContext('2d')
    if (ctx) {
      ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY)
      ctx.stroke()
    }
  }
  const stopDrawing = () => setIsDrawing(false)
  const clearCanvas = () => {
    const ctx = canvasRef.current?.getContext('2d')
    if (ctx && canvasRef.current) {
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
    }
  }

  // Legal Notes
  const legalNotes = getLegalNotesForTemplate(agreement.templateCode, selectedState)

  // Attach to Case / Client
  const handleAttach = async (targetCaseId?: string, targetClientId?: string) => {
    await saveAgreementChanges(undefined, undefined, 'Attached to record')
    const res = await fetch(`/api/agreements/${agreement.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        caseId: targetCaseId || agreement.caseId,
        clientId: targetClientId || agreement.clientId
      })
    })
    if (res.ok) {
      const updated = await res.json()
      setAgreement(updated)
      setShowAttachModal(false)
    }
  }

  // Clean Print Trigger: Closes modals, clears overlays, then launches print
  const triggerPrint = () => {
    setShowExportModal(false)
    setShowSignModal(false)
    setShowShareModal(false)
    setShowAttachModal(false)
    setShowNegotiateModal(false)
    setShowExplainModal(false)
    setShowDiffModal(false)
    setMobileDrawerOpen(false)

    setTimeout(() => {
      window.print()
    }, 150)
  }

  // Formatted Document Download (.doc / Word format with Full Signatures & Devanagari)
  const downloadFormattedDoc = (lang: 'EN' | 'HI' | 'BOTH' = 'BOTH') => {
    const signaturesHtml = agreement.parties.map(party => {
      const sig = agreement.signatures.find(s => s.partyId === party.id)
      return `
        <table style="width: 100%; border: 1px solid #777; margin-bottom: 12px; border-collapse: collapse; font-family: sans-serif;">
          <tr style="background: #f4f5f7;">
            <td style="padding: 8px 12px; font-weight: bold; font-size: 11pt; border-bottom: 1px solid #777;">
              ${party.role}: ${party.nameEn} ${party.nameHi ? `(${party.nameHi})` : ''}
            </td>
          </tr>
          <tr>
            <td style="padding: 10px 12px; font-size: 10pt; color: #333;">
              <div><strong>Address:</strong> ${party.addressEn}</div>
              ${party.pan ? `<div><strong>PAN:</strong> ${party.pan}</div>` : ''}
              ${party.aadhaarMasked ? `<div><strong>Aadhaar:</strong> ${party.aadhaarMasked}</div>` : ''}
              ${sig ? `
                <div style="margin-top: 10px; padding: 10px; background: #eef4ff; border: 1px solid #3b82f6; border-radius: 4px;">
                  <div style="font-size: 12pt; font-weight: bold; color: #1e40af; font-style: italic;">
                    Digitally Signed by: ${sig.signerName}
                  </div>
                  <div style="font-size: 9pt; color: #555; margin-top: 4px;">
                    Signed Date: ${new Date(sig.signedAt).toLocaleString('en-IN')} | Signer IP: ${sig.ipAddress || '127.0.0.1'} | Method: Electronic Signature under Sec 65B Information Technology Act, 2000
                  </div>
                </div>
              ` : `
                <div style="margin-top: 30px; border-top: 1px dashed #444; width: 220px; font-size: 9pt; padding-top: 4px; color: #666;">
                  Signature of ${party.role} (Pending Execution)
                </div>
              `}
            </td>
          </tr>
        </table>
      `
    }).join('')

    const docHtml = `
      <!DOCTYPE html>
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>${agreement.title}</title>
        <style>
          body { font-family: 'Times New Roman', 'Noto Sans Devanagari', Georgia, serif; font-size: 12pt; line-height: 1.8; color: #000000; margin: 40px; }
          h1 { text-align: center; font-size: 18pt; text-transform: uppercase; margin-bottom: 4px; letter-spacing: 0.05em; }
          h2 { text-align: center; font-size: 14pt; color: #333; margin-top: 0; line-height: 1.85; }
          .meta-header { text-align: center; font-size: 10pt; color: #444; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 25px; font-family: sans-serif; }
          .devanagari { font-family: 'Noto Sans Devanagari', 'Mangal', sans-serif; line-height: 2.0; }
          .clause-heading { font-weight: bold; font-size: 12pt; margin-top: 16px; margin-bottom: 6px; }
          .clause-body { text-align: justify; margin-bottom: 12px; }
          .divider { border-top: 2px dashed #666; margin: 35px 0 25px 0; text-align: center; padding-top: 12px; font-weight: bold; font-size: 13pt; text-transform: uppercase; }
        </style>
      </head>
      <body>
        <h1>${agreement.title}</h1>
        ${agreement.titleHi ? `<h2 class="devanagari">${agreement.titleHi}</h2>` : ''}
        <div class="meta-header">
          Instrument Ref: ${agreement.agreementNumber} | State: ${agreement.state} | Executed at: ${agreement.city || 'New Delhi'} | Date: ${new Date(agreement.executionDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
        </div>

        ${lang === 'BOTH' || lang === 'EN' ? `
          <div style="margin-bottom: 30px;">
            <div style="font-weight: bold; font-size: 13pt; text-transform: uppercase; border-bottom: 1px solid #000; padding-bottom: 4px; margin-bottom: 15px; font-family: sans-serif;">
              Part I: English Legal Instrument
            </div>
            <div style="white-space: pre-wrap; text-align: justify;">${agreement.compiledEn || ''}</div>
          </div>
        ` : ''}

        ${(lang === 'BOTH' || lang === 'HI') && agreement.compiledHi ? `
          <div class="devanagari" style="margin-bottom: 30px;">
            <div class="divider">भाग II: हिन्दी निष्पादन विलेख (Hindi Legal Instrument)</div>
            <div style="white-space: pre-wrap; text-align: justify;">${agreement.compiledHi || ''}</div>
          </div>
        ` : ''}

        <div style="margin-top: 40px; page-break-inside: avoid;">
          <h3 style="border-bottom: 2px solid #000; padding-bottom: 6px; font-size: 13pt; text-transform: uppercase; font-family: sans-serif;">
            Execution & Digital Signatures Audit Trail (हस्ताक्षर विलेख)
          </h3>
          ${signaturesHtml}
          <div style="margin-top: 20px; font-size: 9pt; color: #555; border-top: 1px solid #ccc; padding-top: 8px; font-family: sans-serif;">
            Executed on CaseLine Judicial Platform. Electronic signatures affixed herein are statutorily admissible under Section 65B of the Indian Evidence Act, 1872 & Information Technology Act, 2000.
          </div>
        </div>
      </body>
      </html>
    `

    const blob = new Blob(['\ufeff', docHtml], { type: 'application/msword;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${agreement.agreementNumber}_${lang}_Legal_Agreement.doc`
    a.click()
    URL.revokeObjectURL(url)
    setShowExportModal(false)
  }

  // Plain Text Download with Full Execution Audit Trail
  const downloadPlainText = () => {
    let text = `${agreement.title.toUpperCase()}\n`
    if (agreement.titleHi) text += `${agreement.titleHi}\n`
    text += `Agreement Reference: ${agreement.agreementNumber}\n`
    text += `State: ${agreement.state} | City: ${agreement.city || 'New Delhi'}\n`
    text += `Execution Date: ${new Date(agreement.executionDate).toLocaleDateString('en-IN')}\n\n`
    text += `============================================================\n`
    text += `ENGLISH LEGAL TEXT\n`
    text += `============================================================\n\n`
    text += `${agreement.compiledEn || ''}\n\n`

    if (agreement.compiledHi) {
      text += `============================================================\n`
      text += `HINDI LEGAL TEXT (हिन्दी पाठ)\n`
      text += `============================================================\n\n`
      text += `${agreement.compiledHi}\n\n`
    }

    text += `============================================================\n`
    text += `SIGNATURES AND EXECUTION AUDIT LOG\n`
    text += `============================================================\n`
    agreement.parties.forEach(p => {
      const sig = agreement.signatures.find(s => s.partyId === p.id)
      text += `Role: ${p.role}\n`
      text += `Name: ${p.nameEn} ${p.nameHi ? `(${p.nameHi})` : ''}\n`
      text += `Address: ${p.addressEn}\n`
      if (sig) {
        text += `Status: STATUTORILY SIGNED (IT Act 2000 Sec 65B)\n`
        text += `Signer Name: ${sig.signerName}\n`
        text += `Signature Type: ${sig.signatureType}\n`
        text += `Timestamp: ${new Date(sig.signedAt).toISOString()}\n`
        text += `IP Address: ${sig.ipAddress || '127.0.0.1'}\n`
      } else {
        text += `Status: PENDING SIGNATURE\n`
      }
      text += `------------------------------------------------------------\n`
    })

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${agreement.agreementNumber}_Complete_Record.txt`
    a.click()
    URL.revokeObjectURL(url)
    setShowExportModal(false)
  }

  return (
    <div className="space-y-4 max-w-7xl mx-auto pb-24 md:pb-8">
      {/* Top Header / Breadcrumb Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-card p-4 rounded-2xl border border-border shadow-sm no-print">
        <div className="flex items-center gap-3">
          <Link
            href="/agreements"
            className="p-2 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-semibold text-muted-foreground">
                {agreement.agreementNumber}
              </span>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                agreement.status === 'COMPLETED'
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  : agreement.status === 'SIGNING'
                  ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400'
                  : 'bg-primary/10 text-primary'
              }`}>
                {agreement.status}
              </span>
              {saveSuccess && (
                <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 animate-fade-in">
                  <Check className="w-3.5 h-3.5" /> Saved
                </span>
              )}
              {isSaving && (
                <span className="text-[11px] text-muted-foreground">Saving...</span>
              )}
            </div>
            <h1 className="text-base md:text-lg font-bold text-foreground truncate max-w-md">
              {agreement.title}
            </h1>
          </div>
        </div>

        {/* View Mode & Actions */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Language Selector */}
          <div className="inline-flex items-center p-1 bg-muted/60 rounded-xl border border-border text-xs font-medium">
            <button
              onClick={() => setViewMode('EN')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                viewMode === 'EN' ? 'bg-card text-foreground shadow-sm font-semibold' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              English
            </button>
            <button
              onClick={() => setViewMode('HI')}
              className={`px-3 py-1.5 rounded-lg transition-all font-hindi ${
                viewMode === 'HI' ? 'bg-card text-foreground shadow-sm font-semibold' : 'text-muted-foreground hover:text-foreground'
              }`}
              lang="hi"
            >
              हिन्दी
            </button>
            <button
              onClick={() => setViewMode('SIDE_BY_SIDE')}
              className={`hidden sm:inline-block px-3 py-1.5 rounded-lg transition-all ${
                viewMode === 'SIDE_BY_SIDE' ? 'bg-card text-foreground shadow-sm font-semibold' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Side-by-Side
            </button>
            <button
              onClick={() => setViewMode('SEQUENTIAL')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                viewMode === 'SEQUENTIAL' ? 'bg-card text-foreground shadow-sm font-semibold' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Sequential
            </button>
          </div>

          {/* Action Buttons */}
          <button
            onClick={triggerPrint}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-card border border-border text-xs font-semibold hover:bg-muted text-foreground transition-all shadow-sm active:scale-95"
            title="Print or Save as PDF"
          >
            <Printer className="w-3.5 h-3.5 text-primary" />
            Print / PDF
          </button>

          <button
            onClick={() => setShowSignModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-all shadow-sm active:scale-95"
          >
            <PenTool className="w-3.5 h-3.5" />
            E-Sign ({agreement.signatures.length}/{agreement.parties.filter(p => !p.isWitness).length})
          </button>

          <button
            onClick={() => setShowExportModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-card border border-border text-xs font-semibold hover:bg-muted text-foreground transition-all shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            Export / Download
          </button>

          <button
            onClick={() => setShowShareModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-card border border-border text-xs font-semibold hover:bg-muted text-foreground transition-all shadow-sm"
          >
            <Share2 className="w-3.5 h-3.5" />
            Share
          </button>

          <button
            onClick={() => setMobileDrawerOpen(true)}
            className="md:hidden inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-accent text-accent-foreground text-xs font-semibold shadow-sm"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Legal & AI
          </button>
        </div>
      </div>

      {/* Main Workspace Grid (Desktop 2-Col: Document + Side Panel) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Paper Document Viewer (Span 8) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Missing Details & Legal Audit Alert Banner */}
          {getMissingAgreementDetails().length > 0 && (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-amber-800 dark:text-amber-300 no-print">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block text-sm">
                    {getMissingAgreementDetails().length} Potential Legal Details / Gaps Detected
                  </span>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Our AI auditor found missing statutory clauses or identifiers. Review and autofill them to safeguard your agreement.
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setActiveTab('ai')
                  if (typeof window !== 'undefined' && window.innerWidth < 1024) {
                    setMobileDrawerOpen(true)
                  }
                }}
                className="px-3.5 py-1.5 rounded-xl bg-amber-600 text-white font-semibold text-xs hover:bg-amber-700 transition-colors shrink-0 flex items-center gap-1.5 shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Review & Autofill Gaps
              </button>
            </div>
          )}

          {/* Document Paper Container */}
          <div id="printable-agreement" className="bg-card rounded-2xl border border-border shadow-md p-6 md:p-10 font-serif relative overflow-hidden">
            {/* Watermark / Legal Header */}
            <div className="border-b-2 border-border/70 pb-6 mb-8 text-center space-y-2">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Scale className="w-6 h-6 text-primary" />
                <span className="font-sans text-xs uppercase tracking-widest text-muted-foreground font-semibold">
                  E-Stamped Legal Conveyance Draft
                </span>
              </div>
              <h2 className="text-xl md:text-2xl font-bold tracking-tight text-foreground uppercase">
                {agreement.title}
              </h2>
              {agreement.titleHi && (viewMode === 'HI' || viewMode === 'SIDE_BY_SIDE' || viewMode === 'SEQUENTIAL') && (
                <p className="font-hindi text-base md:text-lg font-bold text-muted-foreground" lang="hi">
                  {agreement.titleHi}
                </p>
              )}
              <div className="font-sans flex items-center justify-center gap-4 text-xs text-muted-foreground pt-2">
                <span>Executed at: {agreement.city || 'New Delhi'}, {selectedState}</span>
                <span>Date: {new Date(agreement.executionDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
              </div>
            </div>

            {/* Content Based on View Mode */}
            {viewMode === 'SIDE_BY_SIDE' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 divide-y md:divide-y-0 md:divide-x divide-border">
                {/* English Column */}
                <div className="space-y-6 pr-0 md:pr-4">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-muted text-muted-foreground font-sans text-[11px] font-bold uppercase tracking-wider">
                    English Text
                  </div>
                  {renderClauses(clausesListEn, 'EN')}
                </div>

                {/* Hindi Column */}
                <div className="space-y-6 pt-6 md:pt-0 pl-0 md:pl-4">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-muted text-muted-foreground font-sans text-[11px] font-bold uppercase tracking-wider font-hindi" lang="hi">
                    हिन्दी पाठ
                  </div>
                  {renderClauses(clausesListHi, 'HI')}
                </div>
              </div>
            ) : viewMode === 'EN' ? (
              <div className="space-y-6">
                {renderClauses(clausesListEn, 'EN')}
              </div>
            ) : viewMode === 'HI' ? (
              <div className="space-y-6 font-hindi" lang="hi">
                {renderClauses(clausesListHi, 'HI')}
              </div>
            ) : (
              /* Sequential: English followed by Hindi */
              <div className="space-y-12">
                <div className="space-y-6">
                  <div className="p-2 border-b border-border font-sans text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Part I: English Execution
                  </div>
                  {renderClauses(clausesListEn, 'EN')}
                </div>
                <div className="border-t-2 border-dashed border-border pt-8 space-y-6 font-hindi" lang="hi">
                  <div className="p-2 border-b border-border font-sans text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    भाग II: हिन्दी निष्पादन (Hindi Execution)
                  </div>
                  {renderClauses(clausesListHi, 'HI')}
                </div>
              </div>
            )}

            {/* Signature & Witness Blocks */}
            <div className="mt-12 pt-8 border-t-2 border-border/80 font-sans space-y-6">
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                Execution & Signatures (हस्ताक्षर)
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {agreement.parties.map(party => {
                  const signature = agreement.signatures.find(s => s.partyId === party.id)
                  return (
                    <div
                      key={party.id}
                      className="p-4 rounded-xl border border-border bg-muted/20 space-y-2 relative"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                          {party.role}
                        </span>
                        {signature ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                            <CheckCircle2 className="w-3 h-3" /> Signed
                          </span>
                        ) : (
                          <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">
                            Pending Signature
                          </span>
                        )}
                      </div>

                      <div className="font-semibold text-sm text-foreground">
                        {party.nameEn}
                        {party.nameHi && (
                          <span className="font-hindi block text-xs text-muted-foreground" lang="hi">
                            {party.nameHi}
                          </span>
                        )}
                      </div>

                      {party.addressEn && (
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {party.addressEn}
                        </p>
                      )}

                      {/* Signature Preview & Verification Certificate */}
                      {signature ? (
                        <div className="mt-3 pt-3 border-t-2 border-primary/20 bg-primary/5 p-3 rounded-xl text-xs space-y-1.5 avoid-break">
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-[10px] font-bold text-primary flex items-center gap-1">
                              <ShieldCheck className="w-3.5 h-3.5" /> SEC 65B IT ACT VERIFIED
                            </span>
                            <span className="text-[10px] text-muted-foreground font-mono">
                              {new Date(signature.signedAt).toLocaleDateString('en-IN')}
                            </span>
                          </div>

                          {signature.signatureType === 'DRAWN' ? (
                            <img
                              src={signature.signatureData}
                              alt="Signature"
                              className="h-10 object-contain dark:invert my-1"
                            />
                          ) : (
                            <div className="font-serif italic text-lg text-primary font-bold my-1 tracking-wide">
                              {signature.signatureData}
                            </div>
                          )}

                          <div className="text-[10px] text-muted-foreground flex items-center justify-between border-t border-primary/10 pt-1 font-mono">
                            <span>Signer: {signature.signerName}</span>
                            <span>IP: {signature.ipAddress || '127.0.0.1'}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="mt-4 pt-4 border-t border-dashed border-border/80 text-center space-y-2">
                          <div className="w-32 h-0.5 border-b border-foreground/30 mx-auto" />
                          <button
                            onClick={() => {
                              setSigningPartyId(party.id)
                              setTypedSignName(party.nameEn)
                              setShowSignModal(true)
                            }}
                            className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1 no-print"
                          >
                            <PenTool className="w-3 h-3" /> Sign as this party
                          </button>
                          <span className="block text-[10px] text-muted-foreground uppercase font-sans">
                            (Signature of {party.role})
                          </span>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Add Custom Clause Action */}
              <div className="pt-6 border-t border-border flex items-center justify-between no-print">
                <span className="text-xs text-muted-foreground">
                  Need to add an extra clause?
                </span>
                <button
                  onClick={() => handleAddCustomClause()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-muted hover:bg-muted/80 text-foreground text-xs font-semibold transition-all border border-border"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Custom Clause
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Desktop Legal & AI Copilot Panel (Span 4) */}
        <div className="hidden lg:block lg:col-span-4 space-y-4 no-print">
          <div className="bg-card rounded-2xl border border-border p-4 shadow-sm sticky top-20 space-y-4">
            {/* Side Tabs */}
            <div className="grid grid-cols-5 gap-1 p-1 bg-muted/60 rounded-xl border border-border text-[11px] font-medium">
              <button
                onClick={() => setActiveTab('legal')}
                className={`py-1.5 rounded-lg transition-all text-center ${
                  activeTab === 'legal' ? 'bg-card text-foreground shadow-sm font-semibold' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Legal
              </button>
              <button
                onClick={() => setActiveTab('ai')}
                className={`py-1.5 rounded-lg transition-all text-center flex items-center justify-center gap-0.5 relative ${
                  activeTab === 'ai' ? 'bg-card text-foreground shadow-sm font-semibold' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Sparkles className="w-3 h-3 text-accent shrink-0" /> AI
                {getMissingAgreementDetails().length > 0 && (
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 absolute top-1 right-1" />
                )}
              </button>
              <button
                onClick={() => setActiveTab('glossary')}
                className={`py-1.5 rounded-lg transition-all text-center flex items-center justify-center gap-0.5 ${
                  activeTab === 'glossary' ? 'bg-card text-foreground shadow-sm font-semibold' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <BookOpen className="w-3 h-3 text-primary shrink-0" /> Terms
              </button>
              <button
                onClick={() => setActiveTab('clauses')}
                className={`py-1.5 rounded-lg transition-all text-center ${
                  activeTab === 'clauses' ? 'bg-card text-foreground shadow-sm font-semibold' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Clauses
              </button>
              <button
                onClick={() => setActiveTab('versions')}
                className={`py-1.5 rounded-lg transition-all text-center ${
                  activeTab === 'versions' ? 'bg-card text-foreground shadow-sm font-semibold' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                History
              </button>
            </div>

            {/* Tab 1: Legal Notes & State Selector */}
            {activeTab === 'legal' && (
              <div className="space-y-4 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
                    Select Indian State (राज्य)
                  </label>
                  <select
                    value={selectedState}
                    onChange={e => {
                      setSelectedState(e.target.value)
                      saveAgreementChanges()
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-muted/40 border border-border text-foreground font-medium text-xs focus:ring-1 focus:ring-primary focus:outline-none"
                  >
                    {Object.keys(STATE_LEGAL_NOTES).map(st => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>

                <div className="p-3.5 rounded-xl bg-primary/5 border border-primary/20 space-y-2">
                  <div className="flex items-center gap-1.5 font-bold text-primary text-xs">
                    <Scale className="w-4 h-4" />
                    <span>Stamp Duty & Registration Note</span>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    {legalNotes.stateInfo.stampDutyRent}
                  </p>
                  <p className="text-muted-foreground leading-relaxed pt-1 border-t border-primary/10 font-medium">
                    {legalNotes.stateInfo.registrationNotes}
                  </p>
                </div>

                {legalNotes.stateInfo.portalUrl && (
                  <a
                    href={legalNotes.stateInfo.portalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full p-2.5 rounded-xl bg-muted/40 hover:bg-muted border border-border flex items-center justify-between text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <span className="font-semibold text-xs">{legalNotes.stateInfo.portalName}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}

                <div className="space-y-2 pt-2 border-t border-border">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Key Practical Safeguards
                  </span>
                  <ul className="space-y-2 text-muted-foreground">
                    {legalNotes.generalTips.map((tip, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <p className="text-[10px] text-muted-foreground italic pt-2 border-t border-border">
                  {legalNotes.disclaimer}
                </p>
              </div>
            )}

            {/* Tab 2: AI Risk & Missing Clauses */}
            {activeTab === 'ai' && (
              <div className="space-y-4 text-xs">
                {/* Risk and Fairness Meter */}
                <div className="p-3.5 rounded-xl bg-card border border-border space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-bold text-foreground">
                      <ShieldAlert className="w-4 h-4 text-accent" />
                      <span>Risk & Fairness Meter</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-accent/10 text-accent font-mono text-[10px] font-bold">
                      AI Powered
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="text-muted-foreground text-[11px]">Perspective:</label>
                    <select
                      value={riskPerspective}
                      onChange={e => setRiskPerspective(e.target.value)}
                      className="px-2 py-1 rounded-lg bg-muted text-xs font-semibold border border-border focus:outline-none"
                    >
                      <option value="TENANT">Tenant / Buyer</option>
                      <option value="LANDLORD">Landlord / Seller</option>
                      <option value="FREELANCER">Freelancer / Consultant</option>
                      <option value="CLIENT">Client / Employer</option>
                    </select>
                  </div>

                  <button
                    onClick={runRiskAnalysis}
                    disabled={isAnalyzingRisk}
                    className="w-full py-2 rounded-xl bg-primary text-primary-foreground font-semibold text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all disabled:opacity-50"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    {isAnalyzingRisk ? 'Evaluating Agreement...' : 'Calculate Fairness Score'}
                  </button>

                  {riskData && (
                    <div className="space-y-3 pt-2 border-t border-border animate-fade-in">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Fairness Index:</span>
                        <span className="font-mono text-sm font-bold text-foreground">
                          {riskData.fairnessScore}/100
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 ${
                            riskData.fairnessScore > 75
                              ? 'bg-emerald-500'
                              : riskData.fairnessScore > 50
                              ? 'bg-amber-500'
                              : 'bg-rose-500'
                          }`}
                          style={{ width: `${riskData.fairnessScore}%` }}
                        />
                      </div>
                      <p className="text-muted-foreground leading-relaxed">
                        {riskData.riskSummary}
                      </p>

                      {riskData.oneSidedClauses?.length > 0 && (
                        <div className="space-y-2 pt-2">
                          <span className="font-bold text-[11px] uppercase tracking-wider text-amber-600 dark:text-amber-400">
                            One-Sided Clauses Detected
                          </span>
                          {riskData.oneSidedClauses.map((clause: any, idx: number) => (
                            <div
                              key={idx}
                              className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 space-y-1.5"
                            >
                              <div className="font-semibold text-foreground text-xs">
                                {clause.clauseTitle}
                              </div>
                              <p className="text-muted-foreground text-[11px]">
                                {clause.issue}
                              </p>
                              <button
                                onClick={() =>
                                  handleAddCustomClause(
                                    `Balanced: ${clause.clauseTitle}`,
                                    `संतुलित शर्त: ${clause.clauseTitle}`,
                                    clause.suggestedBalancedEn,
                                    clause.suggestedBalancedHi
                                  )
                                }
                                className="inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:underline"
                              >
                                <Check className="w-3 h-3" /> Apply Balanced Replacement
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Missing Details & Compliance Auditor */}
                <div className="p-3.5 rounded-xl bg-card border border-border space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-bold text-foreground">
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                      <span>Missing Details & Legal Gaps</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 font-mono text-[10px] font-bold">
                      {getMissingAgreementDetails().length} Detected
                    </span>
                  </div>
                  <p className="text-muted-foreground text-[11px]">
                    कमी और विधिक खामियां — AI automatically flags missing identifiers, notice periods, SLAs, and statutory clauses.
                  </p>

                  <div className="space-y-2.5 pt-1">
                    {getMissingAgreementDetails().map((gap) => (
                      <div
                        key={gap.id}
                        className="p-3 rounded-xl bg-muted/40 border border-border space-y-2 text-xs"
                      >
                        <div className="flex items-start justify-between gap-1">
                          <div className="space-y-0.5">
                            <span className="font-bold text-foreground block">{gap.titleEn}</span>
                            <span className="font-hindi text-[11px] text-muted-foreground block font-medium" lang="hi">
                              {gap.titleHi}
                            </span>
                          </div>
                          <span className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded shrink-0 ${
                            gap.severity === 'CRITICAL'
                              ? 'bg-rose-500/10 text-rose-600'
                              : gap.severity === 'STATUTORY'
                              ? 'bg-blue-500/10 text-blue-600'
                              : 'bg-amber-500/10 text-amber-600'
                          }`}>
                            {gap.severity}
                          </span>
                        </div>

                        <p className="text-muted-foreground text-[11px] leading-relaxed">
                          {gap.reasonEn}
                        </p>
                        <p className="text-muted-foreground text-[11px] leading-relaxed font-hindi" lang="hi">
                          {gap.reasonHi}
                        </p>

                        <button
                          onClick={() =>
                            handleAddCustomClause(
                              gap.titleEn,
                              gap.titleHi,
                              gap.suggestedClauseEn,
                              gap.suggestedClauseHi
                            )
                          }
                          className="w-full py-1.5 px-2.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Autofill & Insert Clause
                        </button>
                      </div>
                    ))}

                    {getMissingAgreementDetails().length === 0 && (
                      <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-xs flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        <span>All statutory clauses, deposit SLAs, and party IDs verified!</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-muted/40 border border-border space-y-1">
                  <span className="font-bold text-foreground block">Attach to Case / Client</span>
                  <p className="text-muted-foreground text-[11px]">
                    Link this agreement to a Case record or Client ledger in CaseLine.
                  </p>
                  <button
                    onClick={() => setShowAttachModal(true)}
                    className="w-full mt-2 py-1.5 rounded-lg bg-card border border-border font-semibold text-xs hover:bg-muted text-foreground flex items-center justify-center gap-1"
                  >
                    <Briefcase className="w-3.5 h-3.5" /> Attach to Case / Client
                  </button>
                </div>
              </div>
            )}

            {/* Tab: Bilingual Legal Terms Explainer */}
            {activeTab === 'glossary' && (
              <div className="space-y-4 text-xs">
                <div className="p-3.5 rounded-xl bg-card border border-border space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-bold text-foreground">
                      <BookOpen className="w-4 h-4 text-primary" />
                      <span>Legal Terms Explainer</span>
                    </div>
                    <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full font-hindi" lang="hi">
                      सरल विधिक शब्दावली
                    </span>
                  </div>
                  <p className="text-muted-foreground text-[11px]">
                    Understand difficult legal terms in simple English and Hindi without legalese.
                  </p>

                  {/* Search Input */}
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-muted-foreground" />
                    <input
                      type="text"
                      value={glossaryTerm}
                      onChange={e => setGlossaryTerm(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleSearchGlossary(glossaryTerm)}
                      placeholder="Search term (e.g. Indemnity, Mesne Profits)..."
                      className="w-full pl-8 pr-16 py-1.5 text-xs rounded-xl border border-input bg-background text-foreground"
                    />
                    <button
                      onClick={() => handleSearchGlossary(glossaryTerm)}
                      disabled={isSearchingGlossary}
                      className="absolute right-1 top-1 px-2.5 py-1 rounded-lg bg-primary text-primary-foreground text-[10px] font-semibold"
                    >
                      {isSearchingGlossary ? '...' : 'Explain'}
                    </button>
                  </div>

                  {/* Quick Terms Chips */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Common Legal Terms (विधिक शब्द):
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {[
                        'Indemnity',
                        'Force Majeure',
                        'Mesne Profits',
                        'Severability',
                        'Liquidated Damages',
                        'Joint and Several Liability',
                        'Lock-in Period',
                        'Specific Performance',
                        'Waiver',
                        'Subletting'
                      ].map((term) => (
                        <button
                          key={term}
                          onClick={() => handleSearchGlossary(term)}
                          className={`text-[10px] px-2 py-0.5 rounded-md border transition-all ${
                            glossaryTerm.toLowerCase() === term.toLowerCase()
                              ? 'bg-primary text-primary-foreground border-primary font-semibold'
                              : 'bg-muted/40 border-border text-foreground hover:border-primary/40'
                          }`}
                        >
                          {term}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Term Result Card */}
                  {glossaryResult && (
                    <div className="pt-3 border-t border-border space-y-2.5 animate-fade-in">
                      <div className="p-3 rounded-xl bg-primary/5 border border-primary/20 space-y-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-sm text-foreground">{glossaryResult.term}</h4>
                          <span className="font-hindi text-xs font-bold text-primary" lang="hi">
                            {glossaryResult.termHi}
                          </span>
                        </div>
                        <p className="text-foreground leading-relaxed text-xs">
                          {glossaryResult.plainEnglish}
                        </p>
                      </div>

                      <div className="p-3 rounded-xl bg-primary/5 border border-primary/20 font-hindi space-y-1" lang="hi">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                          सरल हिन्दी में भावार्थ (Simple Hindi Meaning)
                        </span>
                        <p className="text-foreground leading-relaxed text-xs">
                          {glossaryResult.plainHindi}
                        </p>
                      </div>

                      {glossaryResult.exampleScenario && (
                        <div className="p-2.5 rounded-lg bg-muted/40 border border-border space-y-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                            Practical Example (उदाहरण):
                          </span>
                          <p className="text-muted-foreground text-[11px] leading-relaxed">
                            {glossaryResult.exampleScenario}
                          </p>
                        </div>
                      )}

                      {glossaryResult.practicalTip && (
                        <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 space-y-0.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                            <ShieldAlert className="w-3 h-3" /> Precaution Before Signing (सावधानी):
                          </span>
                          <p className="text-[11px] leading-relaxed">
                            {glossaryResult.practicalTip}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tab 3: Clauses List & Quick Jump */}
            {activeTab === 'clauses' && (
              <div className="space-y-2 text-xs max-h-[60vh] overflow-y-auto pr-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block mb-2">
                  Agreement Clauses ({clausesListEn.length})
                </span>
                {clausesListEn.map((clause, idx) => (
                  <div
                    key={clause.id}
                    className="p-2.5 rounded-xl border border-border bg-card hover:border-primary/40 transition-colors flex items-center justify-between gap-2"
                  >
                    <span className="font-semibold text-foreground truncate max-w-[180px]">
                      {clause.title}
                    </span>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleMoveClause(idx, 'UP')}
                        disabled={idx === 0}
                        className="p-1 rounded hover:bg-muted disabled:opacity-30 text-muted-foreground"
                        title="Move Up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleMoveClause(idx, 'DOWN')}
                        disabled={idx === clausesListEn.length - 1}
                        className="p-1 rounded hover:bg-muted disabled:opacity-30 text-muted-foreground"
                        title="Move Down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteClause(idx)}
                        className="p-1 rounded hover:bg-rose-500/10 text-rose-500"
                        title="Remove"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Tab 4: Version History */}
            {activeTab === 'versions' && (
              <div className="space-y-3 text-xs max-h-[60vh] overflow-y-auto">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
                  Version History ({agreement.versions.length})
                </span>
                {agreement.versions.map(ver => (
                  <div
                    key={ver.id}
                    className="p-3 rounded-xl border border-border bg-card space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-foreground">
                        Version {ver.versionNumber}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(ver.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-muted-foreground text-[11px]">
                      {ver.changeSummary || 'Automatic draft update'}
                    </p>
                    <div className="flex items-center gap-2 pt-1 border-t border-border">
                      <button
                        onClick={() => {
                          setSelectedVersionForDiff(ver)
                          setShowDiffModal(true)
                        }}
                        className="text-primary hover:underline text-[11px] font-semibold"
                      >
                        Compare Diff
                      </button>
                      <button
                        onClick={() => {
                          saveAgreementChanges(ver.compiledEn, ver.compiledHi || '', `Restored v${ver.versionNumber}`)
                        }}
                        className="text-muted-foreground hover:text-foreground text-[11px] font-semibold flex items-center gap-1"
                      >
                        <RotateCcw className="w-3 h-3" /> Restore
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>


      {/* Mobile Drawer (Bottom Sheet / Slide-up) */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden flex flex-col justify-end">
          <div className="bg-card border-t border-border rounded-t-3xl p-6 max-h-[85vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <span className="font-bold text-sm text-foreground">
                Agreement Legal & AI Insights
              </span>
              <button
                onClick={() => setMobileDrawerOpen(false)}
                className="p-1 rounded-lg text-muted-foreground hover:bg-muted"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile Tab Buttons */}
            <div className="grid grid-cols-5 gap-1 p-1 bg-muted/60 rounded-xl border border-border text-[11px] font-medium">
              <button
                onClick={() => setActiveTab('legal')}
                className={`py-1.5 rounded-lg text-center ${activeTab === 'legal' ? 'bg-card text-foreground font-bold shadow-sm' : 'text-muted-foreground'}`}
              >
                Legal
              </button>
              <button
                onClick={() => setActiveTab('ai')}
                className={`py-1.5 rounded-lg text-center ${activeTab === 'ai' ? 'bg-card text-foreground font-bold shadow-sm' : 'text-muted-foreground'}`}
              >
                AI
              </button>
              <button
                onClick={() => setActiveTab('glossary')}
                className={`py-1.5 rounded-lg text-center ${activeTab === 'glossary' ? 'bg-card text-foreground font-bold shadow-sm' : 'text-muted-foreground'}`}
              >
                Terms
              </button>
              <button
                onClick={() => setActiveTab('clauses')}
                className={`py-1.5 rounded-lg text-center ${activeTab === 'clauses' ? 'bg-card text-foreground font-bold shadow-sm' : 'text-muted-foreground'}`}
              >
                Clauses
              </button>
              <button
                onClick={() => setActiveTab('versions')}
                className={`py-1.5 rounded-lg text-center ${activeTab === 'versions' ? 'bg-card text-foreground font-bold shadow-sm' : 'text-muted-foreground'}`}
              >
                History
              </button>
            </div>

            {/* Content mirroring desktop tabs */}
            {activeTab === 'legal' && (
              <div className="space-y-3 text-xs">
                <label className="block text-[11px] font-bold text-muted-foreground uppercase">
                  Select State (राज्य)
                </label>
                <select
                  value={selectedState}
                  onChange={e => setSelectedState(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-muted border border-border text-foreground text-xs"
                >
                  {Object.keys(STATE_LEGAL_NOTES).map(st => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
                <div className="p-3 bg-primary/5 rounded-xl border border-primary/20 space-y-1">
                  <div className="font-bold text-primary">{legalNotes.stateInfo.state} Requirements</div>
                  <p className="text-muted-foreground">{legalNotes.stateInfo.stampDutyRent}</p>
                  <p className="text-muted-foreground font-medium pt-1 border-t border-primary/10">
                    {legalNotes.stateInfo.registrationNotes}
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'ai' && (
              <div className="space-y-3 text-xs">
                <button
                  onClick={runRiskAnalysis}
                  disabled={isAnalyzingRisk}
                  className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-xs flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4" />
                  {isAnalyzingRisk ? 'Evaluating...' : 'Run Risk & Fairness Meter'}
                </button>
                {riskData && (
                  <div className="p-3 bg-muted/40 rounded-xl space-y-2">
                    <div className="flex justify-between font-bold">
                      <span>Fairness Score:</span>
                      <span>{riskData.fairnessScore}/100</span>
                    </div>
                    <p className="text-muted-foreground">{riskData.riskSummary}</p>
                  </div>
                )}

                {/* Missing Details for mobile */}
                <div className="p-3 rounded-xl bg-muted/40 border border-border space-y-2">
                  <div className="flex items-center justify-between font-bold text-foreground">
                    <span className="flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                      Missing Details ({getMissingAgreementDetails().length})
                    </span>
                  </div>
                  {getMissingAgreementDetails().map(gap => (
                    <div key={gap.id} className="p-2.5 bg-card rounded-lg border border-border space-y-1">
                      <div className="font-semibold text-foreground">{gap.titleEn}</div>
                      <p className="text-[11px] text-muted-foreground">{gap.reasonEn}</p>
                      <button
                        onClick={() => handleAddCustomClause(gap.titleEn, gap.titleHi, gap.suggestedClauseEn, gap.suggestedClauseHi)}
                        className="text-[11px] text-primary font-bold hover:underline inline-flex items-center gap-1 pt-1"
                      >
                        <Plus className="w-3 h-3" /> Insert this clause
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'glossary' && (
              <div className="space-y-3 text-xs">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-muted-foreground" />
                  <input
                    type="text"
                    value={glossaryTerm}
                    onChange={e => setGlossaryTerm(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSearchGlossary(glossaryTerm)}
                    placeholder="Search term..."
                    className="w-full pl-8 pr-16 py-1.5 text-xs rounded-xl border border-input bg-background"
                  />
                  <button
                    onClick={() => handleSearchGlossary(glossaryTerm)}
                    className="absolute right-1 top-1 px-2.5 py-1 rounded-lg bg-primary text-primary-foreground text-[10px] font-semibold"
                  >
                    Explain
                  </button>
                </div>
                {glossaryResult && (
                  <div className="p-3 bg-card rounded-xl border border-border space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-foreground">{glossaryResult.term}</span>
                      <span className="text-primary font-hindi text-xs">{glossaryResult.termHi}</span>
                    </div>
                    <p className="text-muted-foreground text-xs leading-relaxed">{glossaryResult.plainEnglish}</p>
                    <div className="p-2 bg-primary/5 rounded-lg border border-primary/10 font-hindi" lang="hi">
                      <p className="text-foreground text-xs">{glossaryResult.plainHindi}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* E-SIGN MODAL */}
      {showSignModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <PenTool className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-base text-foreground">
                  Execute Digital E-Signature (डिजिटल हस्ताक्षर)
                </h3>
              </div>
              <button
                onClick={() => setShowSignModal(false)}
                className="p-1 rounded-lg text-muted-foreground hover:bg-muted"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-muted-foreground uppercase mb-1">
                  Select Signing Party
                </label>
                <select
                  value={signingPartyId}
                  onChange={e => {
                    setSigningPartyId(e.target.value)
                    const p = agreement.parties.find(x => x.id === e.target.value)
                    if (p) setTypedSignName(p.nameEn)
                  }}
                  className="w-full p-2.5 rounded-xl bg-muted/40 border border-border text-foreground font-medium text-xs focus:ring-1 focus:ring-primary focus:outline-none"
                >
                  {agreement.parties.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.nameEn} ({p.role}) - {p.signatureStatus}
                    </option>
                  ))}
                </select>
              </div>

              {/* Mode Toggle */}
              <div className="flex rounded-xl bg-muted p-1 border border-border">
                <button
                  type="button"
                  onClick={() => setSignatureType('TYPED')}
                  className={`flex-1 py-1.5 rounded-lg font-semibold text-xs transition-all ${
                    signatureType === 'TYPED' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
                  }`}
                >
                  Type Signature
                </button>
                <button
                  type="button"
                  onClick={() => setSignatureType('DRAWN')}
                  className={`flex-1 py-1.5 rounded-lg font-semibold text-xs transition-all ${
                    signatureType === 'DRAWN' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
                  }`}
                >
                  Draw Signature
                </button>
              </div>

              {signatureType === 'TYPED' ? (
                <div className="space-y-2">
                  <label className="block text-[11px] font-bold text-muted-foreground uppercase">
                    Signer Full Name
                  </label>
                  <input
                    type="text"
                    value={typedSignName}
                    onChange={e => setTypedSignName(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-muted/40 border border-border text-foreground text-sm font-semibold focus:ring-1 focus:ring-primary focus:outline-none"
                  />
                  <div className="p-4 rounded-xl bg-muted/20 border border-border text-center font-serif italic text-2xl text-primary font-bold">
                    {typedSignName || 'Your Signature'}
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-muted-foreground uppercase">
                      Draw with Touch / Mouse
                    </span>
                    <button
                      type="button"
                      onClick={clearCanvas}
                      className="text-xs text-rose-500 hover:underline font-semibold"
                    >
                      Clear
                    </button>
                  </div>
                  <canvas
                    ref={canvasRef}
                    width={400}
                    height={120}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    className="w-full bg-white dark:bg-card border border-border rounded-xl cursor-crosshair touch-none"
                  />
                </div>
              )}

              {/* Legal IT Act 2000 Consent Checkbox */}
              <label className="flex items-start gap-2 pt-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={aadhaarConsent}
                  onChange={e => setAadhaarConsent(e.target.checked)}
                  className="mt-0.5 rounded border-border text-primary focus:ring-primary"
                />
                <span className="text-[11px] text-muted-foreground leading-snug">
                  I hereby confirm my identity under Section 65B and Section 3 of the Information Technology Act 2000 (India). I intend to affix my electronic signature with statutory evidentiary validity.
                </span>
              </label>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
              <button
                type="button"
                onClick={() => setShowSignModal(false)}
                className="px-4 py-2 rounded-xl border border-border text-xs font-semibold hover:bg-muted text-foreground"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteSignature}
                disabled={!aadhaarConsent || isSigningLoading}
                className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 disabled:opacity-50 flex items-center gap-1.5 shadow-sm active:scale-95"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                {isSigningLoading ? 'Sealing Signature...' : 'Confirm & Affix Signature'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EXPORT & PRINT MODAL */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                <Download className="w-4 h-4 text-primary" /> Export Agreement
              </h3>
              <button
                onClick={() => setShowExportModal(false)}
                className="p-1 rounded-lg text-muted-foreground hover:bg-muted"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              {/* Option 1: Clean Print / PDF */}
              <button
                onClick={triggerPrint}
                className="w-full p-3.5 rounded-xl border border-primary/20 bg-primary/5 hover:bg-primary/10 flex items-center justify-between text-left transition-all group"
              >
                <div className="space-y-0.5">
                  <div className="font-semibold text-primary flex items-center gap-1.5 text-xs">
                    <Printer className="w-4 h-4 text-primary shrink-0" />
                    Print / Save as PDF (Clean Legal Sheet)
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Direct browser print dialog formatted for A4 paper with embedded Devanagari fonts and digital signatures.
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-primary group-hover:translate-x-0.5 transition-transform shrink-0" />
              </button>

              {/* Option 2: Formatted Word Document with Signatures */}
              <button
                onClick={() => downloadFormattedDoc('BOTH')}
                className="w-full p-3.5 rounded-xl border border-border bg-card hover:bg-muted flex items-center justify-between text-left transition-all group"
              >
                <div className="space-y-0.5">
                  <div className="font-semibold text-foreground flex items-center gap-1.5 text-xs">
                    <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                    Download Formatted Word Document (.doc)
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Complete bilingual draft with formal layout, clause hierarchy, and verified digital signature certificates.
                  </p>
                </div>
                <Download className="w-4 h-4 text-muted-foreground group-hover:text-foreground shrink-0" />
              </button>

              {/* Option 3: English Word Deed */}
              <button
                onClick={() => downloadFormattedDoc('EN')}
                className="w-full p-3.5 rounded-xl border border-border bg-card hover:bg-muted flex items-center justify-between text-left transition-all group"
              >
                <div className="space-y-0.5">
                  <div className="font-semibold text-foreground flex items-center gap-1.5 text-xs">
                    <FileText className="w-4 h-4 text-slate-600 shrink-0" />
                    Download English Legal Instrument (.doc)
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    English-only deed for corporate & court filings with party signatures.
                  </p>
                </div>
                <Download className="w-4 h-4 text-muted-foreground group-hover:text-foreground shrink-0" />
              </button>

              {/* Option 4: Hindi Devanagari Word Deed */}
              {agreement.compiledHi && (
                <button
                  onClick={() => downloadFormattedDoc('HI')}
                  className="w-full p-3.5 rounded-xl border border-border bg-card hover:bg-muted flex items-center justify-between text-left transition-all group"
                >
                  <div className="space-y-0.5">
                    <div className="font-semibold text-foreground flex items-center gap-1.5 text-xs font-hindi" lang="hi">
                      <FileText className="w-4 h-4 text-amber-600 shrink-0" />
                      हिन्दी विलेख डाउनलोड करें (.doc)
                    </div>
                    <p className="text-[11px] text-muted-foreground font-hindi" lang="hi">
                      हस्ताक्षर प्रमाण-पत्र सहित औपचारिक देवनागरी विधिक प्रारूप।
                    </p>
                  </div>
                  <Download className="w-4 h-4 text-muted-foreground group-hover:text-foreground shrink-0" />
                </button>
              )}

              {/* Option 5: Complete Plain Text */}
              <button
                onClick={downloadPlainText}
                className="w-full p-3 rounded-xl border border-border/80 bg-muted/30 hover:bg-muted flex items-center justify-between text-left transition-colors"
              >
                <div className="space-y-0.5">
                  <div className="font-semibold text-muted-foreground flex items-center gap-1.5 text-xs">
                    <FileText className="w-3.5 h-3.5 shrink-0" />
                    Download Plain Text & Audit Log (.txt)
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    Raw UTF-8 text with all clauses and signature IP audit entries
                  </p>
                </div>
                <Download className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SHARE MODAL & QR CODE */}
      {showShareModal && (() => {
        const shareUrl = typeof window !== 'undefined' ? window.location.href : `https://caseline.in/agreements/${agreement.id}`
        const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(`Legal Agreement ${agreement.agreementNumber}: ${agreement.title}\n${shareUrl}`)}`
        return (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-card border border-border rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-primary" /> Share & Verify Agreement
                </h3>
              <button
                onClick={() => setShowShareModal(false)}
                className="p-1 rounded-lg text-muted-foreground hover:bg-muted"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs text-center">
              {/* QR Code */}
              <div className="flex flex-col items-center justify-center p-4 bg-muted/30 rounded-2xl border border-border">
                <div
                  className="w-36 h-36 bg-white p-2 rounded-xl shadow-sm flex items-center justify-center"
                  dangerouslySetInnerHTML={{
                    __html: generateAgreementQrSvg(
                      typeof window !== 'undefined' ? window.location.href : agreement.id,
                      130
                    )
                  }}
                />
                <span className="text-[11px] text-muted-foreground mt-2">
                  Scan to verify authentic digital copy on CaseLine
                </span>
              </div>

              {/* Share Actions */}
              <div className="space-y-2 text-left">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full p-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-semibold border border-emerald-500/20 flex items-center justify-center gap-2 transition-colors"
                >
                  <MessageSquare className="w-4 h-4" /> Share via WhatsApp
                </a>

                <button
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href)
                    alert('Agreement link copied to clipboard')
                  }}
                  className="w-full p-3 rounded-xl bg-muted hover:bg-muted/80 text-foreground font-semibold border border-border flex items-center justify-center gap-2 transition-colors"
                >
                  <Copy className="w-4 h-4" /> Copy Direct Link
                </button>
              </div>
            </div>
          </div>
        </div>
      )})()}

      {/* PLAIN-LANGUAGE EXPLAINER MODAL */}
      {showExplainModal && activeExplainClause && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-accent" />
                <h3 className="font-bold text-base text-foreground">
                  Clause Explainer (सरल भाषा में व्याख्या)
                </h3>
              </div>
              <button
                onClick={() => setShowExplainModal(false)}
                className="p-1 rounded-lg text-muted-foreground hover:bg-muted"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-muted/40 rounded-xl border border-border">
                <span className="text-[10px] uppercase font-bold text-muted-foreground">Original Clause</span>
                <p className="text-foreground font-medium mt-1">{activeExplainClause.en}</p>
              </div>

              {isExplaining ? (
                <div className="p-6 text-center text-muted-foreground space-y-2">
                  <Sparkles className="w-6 h-6 text-accent animate-pulse mx-auto" />
                  <p>Synthesizing plain English & Hindi explainer...</p>
                </div>
              ) : explainResult ? (
                <div className="space-y-3 animate-fade-in">
                  <div className="p-3 rounded-xl bg-primary/5 border border-primary/20 space-y-1">
                    <span className="font-bold text-primary block">English Plain Explanation</span>
                    <p className="text-foreground leading-relaxed">{explainResult.explanationEn}</p>
                  </div>

                  <div className="p-3 rounded-xl bg-primary/5 border border-primary/20 space-y-1 font-hindi" lang="hi">
                    <span className="font-bold text-primary block">सरल हिन्दी व्याख्या</span>
                    <p className="text-foreground leading-relaxed">{explainResult.explanationHi}</p>
                  </div>

                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400">
                    <span className="font-bold block text-[11px] uppercase tracking-wider">Practical Action Takeaway:</span>
                    <p className="mt-0.5">{explainResult.practicalTakeaway}</p>
                  </div>
                </div>
              ) : null}
            </div>

            <div className="flex justify-end pt-2 border-t border-border">
              <button
                onClick={() => setShowExplainModal(false)}
                className="px-4 py-2 rounded-xl bg-muted text-foreground text-xs font-semibold hover:bg-muted/80"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NEGOTIATION ASSISTANT MODAL */}
      {showNegotiateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-base text-foreground">
                  AI Negotiation Assistant
                </h3>
              </div>
              <button
                onClick={() => setShowNegotiateModal(false)}
                className="p-1 rounded-lg text-muted-foreground hover:bg-muted"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-muted-foreground uppercase mb-1">
                  What do you want to achieve with this clause?
                </label>
                <input
                  type="text"
                  value={negotiateGoal}
                  onChange={e => setNegotiateGoal(e.target.value)}
                  placeholder="e.g. Request 7 business days deposit refund instead of 30 days"
                  className="w-full p-2.5 rounded-xl bg-muted/40 border border-border text-foreground text-xs focus:ring-1 focus:ring-primary focus:outline-none"
                />
              </div>

              <button
                onClick={runNegotiationAI}
                disabled={isNegotiating}
                className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5" />
                {isNegotiating ? 'Drafting Proposal...' : 'Generate Counter-Proposal & Diplomatic Message'}
              </button>

              {negotiateResult && (
                <div className="space-y-3 pt-2 animate-fade-in">
                  <div className="p-3 bg-muted/40 rounded-xl border border-border space-y-1">
                    <span className="font-bold text-foreground block">Proposed Balanced Clause (English)</span>
                    <p className="text-muted-foreground text-xs leading-relaxed">{negotiateResult.counterProposalEn}</p>
                  </div>

                  <div className="p-3 bg-muted/40 rounded-xl border border-border space-y-1 font-hindi" lang="hi">
                    <span className="font-bold text-foreground block">प्रस्तावित शर्त (हिन्दी)</span>
                    <p className="text-muted-foreground text-xs leading-relaxed">{negotiateResult.counterProposalHi}</p>
                  </div>

                  <div className="p-3 bg-primary/5 rounded-xl border border-primary/20 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-primary">Polite Message for Other Party</span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(negotiateResult.diplomaticMessageEn)
                          alert('Message copied to clipboard!')
                        }}
                        className="text-primary hover:underline font-semibold flex items-center gap-1 text-[11px]"
                      >
                        <Copy className="w-3 h-3" /> Copy
                      </button>
                    </div>
                    <p className="text-muted-foreground text-xs leading-relaxed italic">
                      "{negotiateResult.diplomaticMessageEn}"
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ATTACH TO CASE MODAL */}
      {showAttachModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-primary" /> Attach to Case or Client
              </h3>
              <button
                onClick={() => setShowAttachModal(false)}
                className="p-1 rounded-lg text-muted-foreground hover:bg-muted"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-muted-foreground uppercase mb-1">
                  Select Case
                </label>
                <select
                  defaultValue={agreement.caseId || ''}
                  onChange={e => handleAttach(e.target.value, undefined)}
                  className="w-full p-2.5 rounded-xl bg-muted/40 border border-border text-foreground text-xs"
                >
                  <option value="">None / Unattached</option>
                  {casesList.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.caseNumber} - {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-muted-foreground uppercase mb-1">
                  Select Client
                </label>
                <select
                  defaultValue={agreement.clientId || ''}
                  onChange={e => handleAttach(undefined, e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-muted/40 border border-border text-foreground text-xs"
                >
                  <option value="">None / Unattached</option>
                  {clientsList.map(cl => (
                    <option key={cl.id} value={cl.id}>
                      {cl.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-border">
              <button
                onClick={() => setShowAttachModal(false)}
                className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DIFF MODAL */}
      {showDiffModal && selectedVersionForDiff && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl max-w-2xl w-full p-6 shadow-xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                <History className="w-4 h-4 text-primary" /> Version Diff (v{selectedVersionForDiff.versionNumber} vs Current)
              </h3>
              <button
                onClick={() => setShowDiffModal(false)}
                className="p-1 rounded-lg text-muted-foreground hover:bg-muted"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto space-y-4 text-xs font-mono p-4 bg-muted/30 rounded-xl border border-border flex-1">
              <div className="text-muted-foreground mb-2">
                {selectedVersionForDiff.changeSummary || 'Recorded revision'}
              </div>
              <div className="whitespace-pre-wrap text-foreground">
                {selectedVersionForDiff.compiledEn}
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-border">
              <button
                onClick={() => setShowDiffModal(false)}
                className="px-4 py-2 rounded-xl bg-muted text-foreground text-xs font-semibold"
              >
                Close Diff
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CLAUSE CLARITY & REWRITE MODAL */}
      {showImproveModal && clauseToImprove && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl max-w-2xl w-full p-6 shadow-xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                <div>
                  <h3 className="font-bold text-base text-foreground">
                    Clause Clarity & Improvement Optimizer
                  </h3>
                  <span className="font-hindi text-xs text-muted-foreground font-medium" lang="hi">
                    शर्त सुधार और अस्पष्टता निवारण
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowImproveModal(false)}
                className="p-1 rounded-lg text-muted-foreground hover:bg-muted"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto space-y-4 text-xs flex-1 pr-1">
              {/* Current Clause */}
              <div className="p-3.5 bg-muted/40 rounded-xl border border-border space-y-1">
                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                  Current Draft Clause
                </span>
                <p className="text-foreground font-serif leading-relaxed">
                  {clauseToImprove.en}
                </p>
                {clauseToImprove.hi && (
                  <p className="text-muted-foreground font-hindi text-[11px] pt-1 border-t border-border/60" lang="hi">
                    {clauseToImprove.hi}
                  </p>
                )}
              </div>

              {/* Status / Loading State */}
              {isImproving ? (
                <div className="p-8 text-center text-muted-foreground space-y-2">
                  <Sparkles className="w-6 h-6 text-primary animate-pulse mx-auto" />
                  <p className="font-medium text-foreground">Analyzing clause ambiguity, timelines, and balanced obligations...</p>
                  <p className="text-[11px]">Drafting balanced bilingual rewrites compliant with Indian legal precedents</p>
                </div>
              ) : improveResult ? (
                <div className="space-y-4 animate-fade-in">
                  {/* Ambiguities Detected */}
                  {improveResult.ambiguitiesFound?.length > 0 && (
                    <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-2">
                      <div className="flex items-center gap-1.5 font-bold text-amber-700 dark:text-amber-400">
                        <AlertTriangle className="w-4 h-4" />
                        <span>Ambiguities & Risks Detected in Current Text</span>
                      </div>
                      <ul className="space-y-1 text-muted-foreground text-[11px]">
                        {improveResult.ambiguitiesFound.map((item: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="text-amber-600 font-bold">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Improved English */}
                  <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-primary text-xs uppercase tracking-wider">
                        Suggested Improved English Clause
                      </span>
                      <span className="text-[10px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                        Clearer & Balanced
                      </span>
                    </div>
                    <p className="text-foreground font-serif leading-relaxed text-xs">
                      {improveResult.improvedEn}
                    </p>
                  </div>

                  {/* Improved Hindi */}
                  <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 space-y-2 font-hindi" lang="hi">
                    <span className="font-bold text-primary text-xs uppercase tracking-wider block">
                      सुझावित उन्नत हिन्दी शर्त (Improved Hindi Clause)
                    </span>
                    <p className="text-foreground leading-relaxed text-xs">
                      {improveResult.improvedHi}
                    </p>
                  </div>

                  {/* Rationale */}
                  {improveResult.improvementReason && (
                    <div className="p-3 rounded-xl bg-muted/40 border border-border text-[11px] text-muted-foreground space-y-0.5">
                      <span className="font-bold text-foreground block">Why This is Better:</span>
                      <p>{improveResult.improvementReason}</p>
                    </div>
                  )}
                </div>
              ) : null}
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
              <button
                type="button"
                onClick={() => setShowImproveModal(false)}
                className="px-4 py-2 rounded-xl bg-muted text-foreground text-xs font-semibold hover:bg-muted/80"
              >
                Cancel
              </button>
              {improveResult && (
                <button
                  type="button"
                  onClick={() => handleApplyImprovedClause()}
                  className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 flex items-center gap-1.5 shadow-sm active:scale-95"
                >
                  <Check className="w-3.5 h-3.5" />
                  Apply Improvement to Contract
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
