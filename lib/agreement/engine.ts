import { AgreementTemplateDefinition, ClauseBlock } from '@/templates/types'
import { amountToWordsEn, amountToWordsHi } from './amount-to-words'
import { transliterateToDevanagari } from './glossary'

export interface CompiledAgreement {
  titleEn: string
  titleHi: string
  fullEn: string
  fullHi: string
  clausesEn: Array<{ id: string; title: string; text: string }>
  clausesHi: Array<{ id: string; title: string; text: string }>
  partiesEn: string
  partiesHi: string
  witnessesEn: string
  witnessesHi: string
  summary: string
}

function formatOrdinalDateEn(dateStr: string | Date): string {
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return String(dateStr)

  const day = d.getDate()
  const year = d.getFullYear()
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]
  const month = months[d.getMonth()]

  let suffix = 'th'
  if (day === 1 || day === 21 || day === 31) suffix = 'st'
  else if (day === 2 || day === 22) suffix = 'nd'
  else if (day === 3 || day === 23) suffix = 'rd'

  return `${day}${suffix} day of ${month}, ${year}`
}

function formatDateHi(dateStr: string | Date): string {
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return String(dateStr)

  const day = d.getDate()
  const year = d.getFullYear()
  const monthsHi = [
    'जनवरी', 'फ़रवरी', 'मार्च', 'अप्रैल', 'मई', 'जून',
    'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर'
  ]
  const month = monthsHi[d.getMonth()]

  return `${day} ${month}, ${year}`
}

export function compileAgreement(
  template: AgreementTemplateDefinition,
  formData: Record<string, any>,
  customClauses: ClauseBlock[] = []
): CompiledAgreement {
  // Merge template data with auto-computed words & dates
  const context: Record<string, any> = { ...template.sampleData, ...formData }

  // Inject amount to words
  Object.keys(context).forEach(key => {
    const val = context[key]
    if (typeof val === 'number') {
      context[`${key}WordsEn`] = amountToWordsEn(val)
      context[`${key}WordsHi`] = amountToWordsHi(val)
    } else if (typeof val === 'string' && /^\d+$/.test(val) && val.length > 2) {
      const num = parseInt(val, 10)
      if (!isNaN(num)) {
        context[`${key}WordsEn`] = amountToWordsEn(num)
        context[`${key}WordsHi`] = amountToWordsHi(num)
      }
    }

    // Format dates
    if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}/.test(val)) {
      context[`${key}FormattedEn`] = formatOrdinalDateEn(val)
      context[`${key}FormattedHi`] = formatDateHi(val)
    }
  })

  // Transliterate names to Hindi if not explicitly provided
  if (context.landlordName && !context.landlordNameHi) {
    context.landlordNameHi = transliterateToDevanagari(context.landlordName)
  }
  if (context.tenantName && !context.tenantNameHi) {
    context.tenantNameHi = transliterateToDevanagari(context.tenantName)
  }
  if (context.sellerName && !context.sellerNameHi) {
    context.sellerNameHi = transliterateToDevanagari(context.sellerName)
  }
  if (context.buyerName && !context.buyerNameHi) {
    context.buyerNameHi = transliterateToDevanagari(context.buyerName)
  }
  if (context.clientName && !context.clientNameHi) {
    context.clientNameHi = transliterateToDevanagari(context.clientName)
  }
  if (context.freelancerName && !context.freelancerNameHi) {
    context.freelancerNameHi = transliterateToDevanagari(context.freelancerName)
  }

  // Helper to replace {{placeholder}}
  function interpolate(templateStr: string): string {
    return templateStr.replace(/\{\{([a-zA-Z0-9_]+)\}\}/g, (_, key) => {
      const v = context[key]
      if (v !== undefined && v !== null) {
        if (typeof v === 'number') return v.toLocaleString('en-IN')
        return String(v)
      }
      return `[${key}]`
    })
  }

  // Active Clauses: template clauses + custom clauses
  const activeClauses = [...template.clauses, ...customClauses].filter(clause => {
    if (!clause.isOptional) return true
    if (clause.conditionField && context[clause.conditionField] === false) return false
    return true
  })

  const clausesEn: Array<{ id: string; title: string; text: string }> = []
  const clausesHi: Array<{ id: string; title: string; text: string }> = []

  activeClauses.forEach((c, index) => {
    const clauseNum = index + 1
    const titleEn = c.titleEn.replace(/^\d+\.\s*/, `${clauseNum}. `)
    const titleHi = c.titleHi.replace(/^\d+\.\s*/, `${clauseNum}. `)

    clausesEn.push({
      id: c.id,
      title: titleEn,
      text: interpolate(c.textEn)
    })

    clausesHi.push({
      id: c.id,
      title: titleHi,
      text: interpolate(c.textHi)
    })
  })

  // Date of Execution
  const execDateEn = formatOrdinalDateEn(context.startDate || context.executionDate || new Date())
  const execDateHi = formatDateHi(context.startDate || context.executionDate || new Date())

  // Parties Header
  const firstPartyEn = context.landlordName || context.sellerName || context.clientName || context.lenderName || context.principalName || context.party1Name || 'FIRST PARTY'
  const firstPartyHi = context.landlordNameHi || transliterateToDevanagari(firstPartyEn)

  const secondPartyEn = context.tenantName || context.buyerName || context.freelancerName || context.borrowerName || context.attorneyName || context.party2Name || 'SECOND PARTY'
  const secondPartyHi = context.tenantNameHi || transliterateToDevanagari(secondPartyEn)

  const partiesEnText = `This Agreement is made and executed on this ${execDateEn} at ${context.city || 'New Delhi'}, ${context.state || 'Delhi'}, India.\n\nBETWEEN:\n${firstPartyEn}, residing/having office at ${context.landlordAddress || context.sellerAddress || context.clientAddress || context.addressEn || 'India'} (hereinafter referred to as the "FIRST PARTY")\n\nAND:\n${secondPartyEn}, residing/having office at ${context.tenantAddress || context.buyerAddress || context.freelancerAddress || 'India'} (hereinafter referred to as the "SECOND PARTY").`

  const partiesHiText = `यह अनुबंध आज दिनांक ${execDateHi} को ${context.city || 'नई दिल्ली'}, ${context.state || 'दिल्ली'}, भारत में निष्पादित किया गया।\n\nमध्य:\n${firstPartyHi}, निवासी/कार्यालय: ${context.landlordAddress || context.sellerAddress || context.clientAddress || 'भारत'} (जिन्हें आगे "प्रथम पक्षकार" कहा गया है)\n\nएवं:\n${secondPartyHi}, निवासी/कार्यालय: ${context.tenantAddress || context.buyerAddress || context.freelancerAddress || 'भारत'} (जिन्हें आगे "द्वितीय पक्षकार" कहा गया है)।`

  const witnessesEnText = `IN WITNESS WHEREOF, the parties hereto have set their hands on the day and year first above written.\n\n_______________________\nFIRST PARTY (${firstPartyEn})\n\n_______________________\nSECOND PARTY (${secondPartyEn})\n\nWITNESSES:\n1. Name: ${context.witness1Name || '____________________'}  Signature: _____________\n2. Name: ${context.witness2Name || '____________________'}  Signature: _____________`

  const witnessesHiText = `जिसके साक्ष्य स्वरूप, पक्षकारों ने उपरोक्त लिखित तिथि पर अपने हस्ताक्षर किए हैं।\n\n_______________________\nप्रथम पक्षकार (${firstPartyHi})\n\n_______________________\nद्वितीय पक्षकार (${secondPartyHi})\n\nसाक्षीगण / गवाह:\n1. नाम: ${context.witness1Name || '____________________'}  हस्ताक्षर: _____________\n2. नाम: ${context.witness2Name || '____________________'}  हस्ताक्षर: _____________`

  const fullEn = `${template.titleEn.toUpperCase()}\n\n${partiesEnText}\n\nWHEREAS both parties have mutually agreed as follows:\n\n` +
    clausesEn.map(c => `${c.title}\n${c.text}`).join('\n\n') +
    `\n\n${witnessesEnText}`

  const fullHi = `${template.titleHi}\n\n${partiesHiText}\n\nचूंकि दोनों पक्ष पारस्परिक रूप से निम्नलिखित शर्तों पर सहमत हुए हैं:\n\n` +
    clausesHi.map(c => `${c.title}\n${c.text}`).join('\n\n') +
    `\n\n${witnessesHiText}`

  return {
    titleEn: template.titleEn,
    titleHi: template.titleHi,
    fullEn,
    fullHi,
    clausesEn,
    clausesHi,
    partiesEn: partiesEnText,
    partiesHi: partiesHiText,
    witnessesEn: witnessesEnText,
    witnessesHi: witnessesHiText,
    summary: `${template.titleEn} between ${firstPartyEn} and ${secondPartyEn} executed at ${context.city || 'New Delhi'}.`
  }
}
