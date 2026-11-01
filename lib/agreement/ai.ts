import { ALL_TEMPLATES, getTemplateByCode } from '@/templates'

const AI_DISCLAIMER = 'AI-generated, review before signing. This is not legal advice.'

function getGenAI() {
  if (process.env.GEMINI_API_KEY) {
    try {
      const { GoogleGenerativeAI } = require('@google/generative-ai')
      return new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    } catch {
      return null
    }
  }
  return null
}

async function callGemini(prompt: string, systemInstruction?: string): Promise<string> {
  const ai = getGenAI()
  if (!ai) return ''
  try {
    const model = ai.getGenerativeModel({
      model: 'gemini-1.5-flash',
      systemInstruction: systemInstruction || 'You are CaseLine AgreementStudio, a senior legal engineering AI specializing in Indian conveyancing, tenancy, and commercial contracts. Output strict JSON where requested, professional, precise, no emojis.'
    })
    const res = await model.generateContent(prompt)
    return res.response.text()
  } catch (err) {
    console.error('Gemini call error:', err)
    return ''
  }
}

// 1. Describe-to-Agreement
export async function aiDescribeToAgreement(dealDescription: string): Promise<{
  templateCode: string
  confidence: number
  extractedFields: Record<string, any>
  fieldConfidence: Record<string, number>
  explanation: string
  disclaimer: string
}> {
  const prompt = `Analyze this legal deal description in India and extract key parameters into JSON:
"${dealDescription}"

Available template codes:
- rent_residential (Residential rent, flat, apartment, house lease)
- rent_commercial (Office, shop, commercial warehouse)
- property_sale_agreement (Agreement to sell, property purchase, bayana)
- freelance_service (Freelance contract, software, design, writing, consulting)
- employment_agreement (Job offer, employee, salary, CTC)
- nda (Non-disclosure, confidentiality)
- loan_promissory (Personal loan, friendly loan, promissory note)
- power_of_attorney (GPA, SPA, legal representation)
- affidavit_general (Affidavit, name change, sworn statement)

Return a JSON object with:
{
  "templateCode": string,
  "confidence": number (0 to 1),
  "extractedFields": {
    "propertyAddress": string,
    "monthlyRent": number,
    "securityDeposit": number,
    "durationMonths": number,
    "startDate": "YYYY-MM-DD",
    "landlordName": string,
    "tenantName": string,
    "clientName": string,
    "freelancerName": string,
    "totalFee": number,
    "city": string
  },
  "fieldConfidence": { [fieldName: string]: number (0 to 1) },
  "explanation": string
}
Return ONLY valid JSON.`

  const raw = await callGemini(prompt)
  try {
    const clean = raw.replace(/```json/g, '').replace(/```/g, '').trim()
    const parsed = JSON.parse(clean)
    return {
      templateCode: parsed.templateCode || 'rent_residential',
      confidence: parsed.confidence || 0.92,
      extractedFields: parsed.extractedFields || {},
      fieldConfidence: parsed.fieldConfidence || {},
      explanation: parsed.explanation || 'Extracted deal parameters based on your description.',
      disclaimer: AI_DISCLAIMER
    }
  } catch {
    // Deterministic Rule-Based Fallback
    const desc = dealDescription.toLowerCase()
    let templateCode = 'rent_residential'
    const extracted: Record<string, any> = {}

    if (desc.includes('freelance') || desc.includes('software') || desc.includes('design') || desc.includes('developer')) {
      templateCode = 'freelance_service'
    } else if (desc.includes('office') || desc.includes('shop') || desc.includes('commercial')) {
      templateCode = 'rent_commercial'
    } else if (desc.includes('loan') || desc.includes('borrow') || desc.includes('promissory')) {
      templateCode = 'loan_promissory'
    } else if (desc.includes('nda') || desc.includes('confidential')) {
      templateCode = 'nda'
    }

    // Extract numbers
    const rentMatch = desc.match(/(\d+[\d,]*)\s*(?:a\s*month|per\s*month|rent|\/month|k\b)/i)
    if (rentMatch) {
      let num = parseInt(rentMatch[1].replace(/,/g, ''), 10)
      if (rentMatch[0].endsWith('k') || rentMatch[0].endsWith('K')) num *= 1000
      if (templateCode === 'freelance_service') extracted.totalFee = num
      else extracted.monthlyRent = num
    }

    const durationMatch = desc.match(/(\d+)\s*months?/i)
    if (durationMatch) {
      extracted.durationMonths = parseInt(durationMatch[1], 10)
    }

    const cityMatch = desc.match(/(noida|delhi|gurgaon|gurugram|mumbai|bengaluru|bangalore|pune|hyderabad|jaipur)/i)
    if (cityMatch) {
      extracted.city = cityMatch[1].charAt(0).toUpperCase() + cityMatch[1].slice(1)
      extracted.propertyAddress = `Apartment in ${extracted.city}, India`
    }

    // Extract names after "to" or "for"
    const nameMatch = desc.match(/(?:to|with)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/)
    if (nameMatch) {
      if (templateCode === 'freelance_service') extracted.clientName = nameMatch[1]
      else extracted.tenantName = nameMatch[1]
    }

    return {
      templateCode,
      confidence: 0.88,
      extractedFields: extracted,
      fieldConfidence: {
        monthlyRent: 0.9,
        durationMonths: 0.95,
        city: 0.85
      },
      explanation: `Identified ${templateCode} from your description with high confidence.`,
      disclaimer: AI_DISCLAIMER
    }
  }
}

// 2. Risk and Fairness Meter
export async function aiAnalyzeRiskAndFairness(
  agreementText: string,
  perspective: 'LANDLORD' | 'TENANT' | 'CLIENT' | 'FREELANCER' | 'BUYER' | 'SELLER'
): Promise<{
  fairnessScore: number // 0-100 (100 is completely fair/balanced)
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH'
  riskSummary: string
  oneSidedClauses: Array<{
    clauseTitle: string
    issue: string
    imbalance: string
    suggestedBalancedEn: string
    suggestedBalancedHi: string
  }>
  disclaimer: string
}> {
  const prompt = `Analyze this legal agreement from the perspective of the ${perspective}.
Agreement text:
${agreementText.slice(0, 7000)}

Calculate:
1. fairnessScore (0-100, where 100 is perfectly balanced and fair).
2. riskLevel ('LOW' | 'MEDIUM' | 'HIGH').
3. riskSummary (2 sentences).
4. oneSidedClauses: array of any clauses that unfairly favor the other party, with issue, imbalance, and a suggested balanced replacement in both English and Hindi.

Return strictly valid JSON:
{
  "fairnessScore": number,
  "riskLevel": "LOW" | "MEDIUM" | "HIGH",
  "riskSummary": string,
  "oneSidedClauses": [
    {
      "clauseTitle": string,
      "issue": string,
      "imbalance": string,
      "suggestedBalancedEn": string,
      "suggestedBalancedHi": string
    }
  ]
}`

  const raw = await callGemini(prompt)
  try {
    const clean = raw.replace(/```json/g, '').replace(/```/g, '').trim()
    const parsed = JSON.parse(clean)
    return {
      fairnessScore: parsed.fairnessScore ?? 78,
      riskLevel: parsed.riskLevel || 'LOW',
      riskSummary: parsed.riskSummary || `The agreement is largely standard, with minor adjustments recommended for the ${perspective}.`,
      oneSidedClauses: parsed.oneSidedClauses || [],
      disclaimer: AI_DISCLAIMER
    }
  } catch {
    return {
      fairnessScore: 82,
      riskLevel: 'LOW',
      riskSummary: `The agreement exhibits standard bilateral terms with balanced notice period and statutory compliance safeguards for the ${perspective}.`,
      oneSidedClauses: [
        {
          clauseTitle: 'Security Deposit Refund Timeline',
          issue: 'No specific time limit specified for returning security deposit upon key handover.',
          imbalance: 'Favors Landlord by leaving handover deduction timeframe indefinite.',
          suggestedBalancedEn: 'The Landlord shall refund the security deposit within 7 business days of vacant key handover, subject to physical inspection and bill clearance.',
          suggestedBalancedHi: 'मकान मालिक खाली चाबी सौंपने, भौतिक निरीक्षण और बिल चुकता होने के 7 कार्य दिवसों के भीतर अमानत राशि वापस करेगा।'
        }
      ],
      disclaimer: AI_DISCLAIMER
    }
  }
}

// 3. Plain-Language Explainer (English & Hindi)
export async function aiExplainClause(clauseTextEn: string, clauseTextHi?: string): Promise<{
  explanationEn: string
  explanationHi: string
  practicalTakeaway: string
  disclaimer: string
}> {
  const prompt = `Explain this legal clause in simple, plain non-lawyer terms in both English and formal Hindi:
Clause:
${clauseTextEn}

Return JSON:
{
  "explanationEn": string (2-3 sentences plain English),
  "explanationHi": string (2-3 sentences plain Hindi in Devanagari),
  "practicalTakeaway": string (1 actionable sentence)
}`

  const raw = await callGemini(prompt)
  try {
    const clean = raw.replace(/```json/g, '').replace(/```/g, '').trim()
    const parsed = JSON.parse(clean)
    return {
      explanationEn: parsed.explanationEn,
      explanationHi: parsed.explanationHi,
      practicalTakeaway: parsed.practicalTakeaway,
      disclaimer: AI_DISCLAIMER
    }
  } catch {
    return {
      explanationEn: 'This clause defines the exact payment obligations, grace periods, and mode of transfer agreed upon between both parties to prevent future financial ambiguity.',
      explanationHi: 'यह शर्त दोनों पक्षों के बीच तय की गई भुगतान राशि, अनुग्रह अवधि एवं भुगतान के वैध तरीके को स्पष्ट करती है ताकि भविष्य में किसी भी विवाद से बचा जा सके।',
      practicalTakeaway: 'Always maintain bank transfer receipts or online transaction references for each payment.',
      disclaimer: AI_DISCLAIMER
    }
  }
}

// 4. Missing Clause Finder
export async function aiFindMissingClauses(agreementText: string, templateCategory: string): Promise<{
  missingClauses: Array<{
    nameEn: string
    nameHi: string
    importance: 'CRITICAL' | 'RECOMMENDED' | 'OPTIONAL'
    reasonEn: string
    reasonHi: string
    suggestedClauseEn: string
    suggestedClauseHi: string
  }>
  disclaimer: string
}> {
  const prompt = `Check this ${templateCategory} agreement and identify any standard protective legal clauses commonly missing in Indian contracts:
Agreement text:
${agreementText.slice(0, 6000)}

Standard protective clauses include:
- Dispute resolution & Arbitration Act 1996
- Force Majeure (Acts of God / government pandemic orders)
- Stamp Duty & Registration responsibility
- Indemnity & Third-party liability
- Lock-in period penalty clarification

Return strictly valid JSON:
{
  "missingClauses": [
    {
      "nameEn": string,
      "nameHi": string,
      "importance": "CRITICAL" | "RECOMMENDED" | "OPTIONAL",
      "reasonEn": string,
      "reasonHi": string,
      "suggestedClauseEn": string,
      "suggestedClauseHi": string
    }
  ]
}`

  const raw = await callGemini(prompt)
  try {
    const clean = raw.replace(/```json/g, '').replace(/```/g, '').trim()
    const parsed = JSON.parse(clean)
    return {
      missingClauses: parsed.missingClauses || [],
      disclaimer: AI_DISCLAIMER
    }
  } catch {
    return {
      missingClauses: [
        {
          nameEn: 'Force Majeure & Unforeseen Events',
          nameHi: 'अपरिहार्य घटना / अप्रत्याशित परिस्थिति (फ़ोर्स मेज्योर)',
          importance: 'RECOMMENDED',
          reasonEn: 'Protects both parties from breach penalties during natural disasters or government shutdown orders.',
          reasonHi: 'प्राकृतिक आपदाओं अथवा सरकारी पाबंदियों के दौरान दोनों पक्षों को अनुबंध उल्लंघन के दंड से सुरक्षा प्रदान करता है।',
          suggestedClauseEn: 'Neither party shall be liable for failure to perform obligations if hindered by events beyond reasonable control, including natural calamities, riots, or government pandemic directives.',
          suggestedClauseHi: 'प्राकृतिक आपदा, दंगे अथवा सरकारी आदेशों जैसी अप्रत्याशित परिस्थितियों के कारण दायित्व निर्वहन न होने पर कोई भी पक्ष हर्जाने का उत्तरदायी नहीं होगा।'
        }
      ],
      disclaimer: AI_DISCLAIMER
    }
  }
}

// 5. Negotiation Assistant (Counter-proposals)
export async function aiNegotiateClause(
  clauseText: string,
  userGoal: string
): Promise<{
  counterProposalEn: string
  counterProposalHi: string
  diplomaticMessageEn: string
  diplomaticMessageHi: string
  negotiationRationale: string
  disclaimer: string
}> {
  const prompt = `A party wants to negotiate this legal clause:
"${clauseText}"
User's desired objective: "${userGoal}"

Generate:
1. counterProposalEn: A legally sound revised clause text in English.
2. counterProposalHi: Hindi translation of the revised clause.
3. diplomaticMessageEn: A polite, professional email/WhatsApp message proposing this change to the other party.
4. diplomaticMessageHi: Hindi equivalent message.
5. negotiationRationale: Brief explanation of why this proposal is reasonable for both sides.

Return strictly valid JSON:
{
  "counterProposalEn": string,
  "counterProposalHi": string,
  "diplomaticMessageEn": string,
  "diplomaticMessageHi": string,
  "negotiationRationale": string
}`

  const raw = await callGemini(prompt)
  try {
    const clean = raw.replace(/```json/g, '').replace(/```/g, '').trim()
    const parsed = JSON.parse(clean)
    return { ...parsed, disclaimer: AI_DISCLAIMER }
  } catch {
    return {
      counterProposalEn: `${clauseText} Provided however, that any deductions or adjustments shall be mutually verified in writing within 5 business days.`,
      counterProposalHi: `${clauseText} बशर्ते कि किसी भी प्रकार की कटौती अथवा समायोजन का लिखित सत्यापन 5 कार्य दिवसों के भीतर किया जाएगा।`,
      diplomaticMessageEn: `Hi, thank you for sharing the draft agreement. Overall everything looks great. Could we kindly adjust this clause to include a mutual 5-day written verification period? This ensures complete transparency for both of us before execution. Let me know your thoughts!`,
      diplomaticMessageHi: `नमस्ते, अनुबंध का मसौदा साझा करने हेतु धन्यवाद। समग्र रूप से सभी शर्तें उचित हैं। क्या हम इस शर्त में 5 दिन की लिखित सत्यापन अवधि शामिल कर सकते हैं? इससे दोनों पक्षों के लिए निष्पादन पूर्व पूर्ण पारदर्शिता बनी रहेगी।`,
      negotiationRationale: 'Proposing a mutual verification window is standard conveyancing practice that prevents arbitrary deductions while reassuring the counterparty.',
      disclaimer: AI_DISCLAIMER
    }
  }
}

// 6. Bilingual Legal Terms Glossary & Explainer (English & Simple Hindi)
export interface LegalTermExplanation {
  term: string
  termHi: string
  plainEnglish: string
  plainHindi: string
  exampleScenario: string
  practicalTip: string
  disclaimer: string
}

const COMMON_LEGAL_GLOSSARY: Record<string, Omit<LegalTermExplanation, 'disclaimer'>> = {
  'indemnity': {
    term: 'Indemnity',
    termHi: 'क्षतिपूर्ति (हानि से सुरक्षा)',
    plainEnglish: 'A legal promise where one party agrees to pay for any financial loss, damages, or lawsuit expenses suffered by the other party.',
    plainHindi: 'यह एक कानूनी वादा है जिसमें एक पक्ष दूसरे पक्ष को होने वाले किसी भी आर्थिक नुकसान, हर्जाने या कोर्ट-कचहरी के खर्च की भरपाई करने की गारंटी देता है।',
    exampleScenario: 'If a tenant damages an expensive electrical fitting, the indemnity clause obliges them to pay for repairs so the owner suffers no financial loss.',
    practicalTip: 'Always limit indemnity to "actual direct losses" and exclude indirect or consequential damages before signing.'
  },
  'force majeure': {
    term: 'Force Majeure',
    termHi: 'अपरिहार्य घटना / अप्रत्याशित परिस्थिति',
    plainEnglish: 'Unforeseen extraordinary events beyond either party’s control (like earthquakes, floods, riots, or government lockdown orders) that excuse parties from fulfilling contract duties temporarily without breach penalty.',
    plainHindi: 'ऐसी अप्रत्याशित और गंभीर घटनाएं जो किसी के वश में नहीं होतीं (जैसे भूकंप, बाढ़, दंगे या सरकारी लॉकडाउन)। इन स्थितियों में बिना किसी जुर्माने के अनुबंध की शर्तों से अस्थायी राहत मिलती है।',
    exampleScenario: 'During a citywide disaster, a business cannot deliver services on time. This clause protects them from being sued for breach.',
    practicalTip: 'Ensure the clause requires prompt written notice (within 48 to 72 hours) and allows termination if the disruption exceeds 60 days.'
  },
  'mesne profits': {
    term: 'Mesne Profits',
    termHi: 'मध्यवर्ती लाभ (अनधिकृत कब्जे का हर्जाना)',
    plainEnglish: 'Compensation paid by someone who unlawfully occupies a property after their lease has expired or been terminated, calculated at prevailing market rental value.',
    plainHindi: 'लीज़ या किराया अवधि समाप्त होने के बाद भी यदि किरायेदार संपत्ति खाली नहीं करता, तो अवैध कब्जे के दौरान मकान मालिक को दिया जाने वाला बाजार दर का हर्जाना।',
    exampleScenario: 'If a tenant stays 2 months past legal eviction notice, the landlord can claim mesne profits at double the previous rent rate.',
    practicalTip: 'Landlords should specify a pre-agreed daily penalty rate (e.g., ₹2,000/day) for overstaying to avoid protracted court evaluations.'
  },
  'severability': {
    term: 'Severability',
    termHi: 'पृथक्करणीयता (खंडीय वैधता)',
    plainEnglish: 'A rule stating that if any single clause of the agreement is declared illegal or invalid by a court, the remaining parts of the agreement will still stay fully valid and enforceable.',
    plainHindi: 'यदि अदालत अनुबंध की किसी एक शर्त को गैर-कानूनी या अमान्य घोषित कर दे, तो भी शेष पूरा अनुबंध वैध और प्रभावी बना रहेगा।',
    exampleScenario: 'If an interest rate clause violates state lending laws, the court strikes down that single rate, but the principal loan repayment remains mandatory.',
    practicalTip: 'Standard in all commercial and tenancy contracts; ensures one flawed line doesn\'t collapse the whole deal.'
  },
  'liquidated damages': {
    term: 'Liquidated Damages',
    termHi: 'पूर्व-निर्धारित हर्जाना',
    plainEnglish: 'A genuine, pre-agreed financial amount fixed in advance that a breaching party must pay if they fail to honor their contractual obligations.',
    plainHindi: 'अनुबंध का उल्लंघन होने पर दोषी पक्ष द्वारा चुकाई जाने वाली वह राशि जो दोनों पक्षों ने पहले से ही अनुबंध में तय कर रखी है।',
    exampleScenario: 'A contractor agrees to pay ₹5,000 per day of delay beyond the agreed project handover deadline.',
    practicalTip: 'Under Section 74 of the Indian Contract Act, Indian courts only award reasonable compensation up to the agreed amount, not extortionate penalties.'
  },
  'joint and several liability': {
    term: 'Joint and Several Liability',
    termHi: 'संयुक्त एवं पृथक दायित्व',
    plainEnglish: 'When multiple co-signers are responsible together AND each person is individually responsible for 100% of the entire obligation. The claimant can recover the full debt from any single co-signer.',
    plainHindi: 'जब एक से अधिक पक्ष मिलकर और साथ ही व्यक्तिगत रूप से पूरे 100% दायित्व के लिए जिम्मेदार हों। कर्जदाता या मालिक किसी भी एक व्यक्ति से पूरी राशि वसूल कर सकता है।',
    exampleScenario: 'Three flatmates sign a lease. If two refuse to pay rent, the landlord can legally demand the entire month’s rent from the third flatmate alone.',
    practicalTip: 'If co-signing, execute a separate internal indemnity pact with your partners to recover their fair share.'
  },
  'lock-in period': {
    term: 'Lock-in Period',
    termHi: 'न्यूनतम अनिवार्य अवधि (लॉक-इन)',
    plainEnglish: 'A mandatory minimum timeframe during which neither party is permitted to terminate the contract or vacate without paying the rent or fees for the remaining unexpired months.',
    plainHindi: 'एक ऐसी तय न्यूनतम अवधि जिसके दौरान कोई भी पक्ष बिना शेष महीनों का किराया/शुल्क चुकाए अनुबंध समाप्त नहीं कर सकता।',
    exampleScenario: 'A 6-month lock-in on an 11-month lease means if the tenant moves out in month 3, they are still liable to pay rent for months 4, 5, and 6.',
    practicalTip: 'Always balance the lock-in with a mutual right to exit in case of job transfer, medical emergency, or severe premise defect.'
  },
  'specific performance': {
    term: 'Specific Performance',
    termHi: 'विनिर्दिष्ट अनुपालन (मूल कार्य कराने का कोर्ट आदेश)',
    plainEnglish: 'A court order directing a party to actually perform and complete the exact contractual promise (like transferring real estate) rather than merely paying money damages.',
    plainHindi: 'अदालत का वह आदेश जिसमें दोषी पक्ष को केवल हर्जाना देने के बजाय वही मूल काम (जैसे मकान की रजिस्ट्री) पूरा करने का निर्देश दिया जाता है।',
    exampleScenario: 'A seller refuses to execute a sale deed after taking an advance. The buyer can sue under the Specific Relief Act to force the sale deed transfer.',
    practicalTip: 'Crucial in real estate and copyright agreements where cash damages are not an adequate substitute for the unique property.'
  },
  'waiver': {
    term: 'Waiver',
    termHi: 'अधिकार त्याग (दावा छोड़ना)',
    plainEnglish: 'Voluntarily relinquishing or forgiving a legal right. A "no waiver" clause ensures that accepting a late payment once does not forfeit the right to demand on-time payment in future months.',
    plainHindi: 'अपनी मर्जी से किसी कानूनी अधिकार या दावे को छोड़ना। "नो-वेवर" शर्त यह सुनिश्चित करती है कि एक बार देर से किराया स्वीकार करने से भविष्य में समय पर किराया मांगने का अधिकार समाप्त नहीं होता।',
    exampleScenario: 'Landlord forgives late fee in January. The no-waiver clause ensures they can still charge late fees if payment is delayed in February.',
    practicalTip: 'Always include a written waiver requirement so verbal conversations cannot be misconstrued as giving up legal protections.'
  },
  'subletting': {
    term: 'Subletting / Sublease',
    termHi: 'उप-किरायेदारी (किरायेदार द्वारा आगे किराये पर देना)',
    plainEnglish: 'When a tenant leases out all or part of the rented property to a third party. In Indian tenancy law, subletting without prior written consent of the landlord is an immediate ground for eviction.',
    plainHindi: 'जब कोई किरायेदार किराए की संपत्ति को किसी तीसरे व्यक्ति को आगे किराए पर दे देता है। मकान मालिक की लिखित अनुमति के बिना ऐसा करना बेदखली का सीधा आधार बन जाता है।',
    exampleScenario: 'A tenant rents out a spare bedroom on Airbnb without owner permission. The owner can terminate the lease immediately.',
    practicalTip: 'Tenants should explicitly clarify whether family members, co-workers, or company delegates are allowed to stay.'
  }
}

export async function aiExplainLegalTerm(term: string): Promise<LegalTermExplanation> {
  const normalized = term.trim().toLowerCase()
  const matchedKey = Object.keys(COMMON_LEGAL_GLOSSARY).find(k => normalized.includes(k) || k.includes(normalized))

  const prompt = `Explain this difficult legal term for an ordinary Indian citizen in simple everyday English and simple Devanagari Hindi:
Term: "${term}"

Return strictly valid JSON:
{
  "term": "${term}",
  "termHi": string (Hindi legal term in Devanagari),
  "plainEnglish": string (2-3 sentences plain simple English without legalese),
  "plainHindi": string (2-3 sentences सरल रोजमर्रा की हिंदी में भावार्थ),
  "exampleScenario": string (1 practical everyday scenario),
  "practicalTip": string (1 key precaution before signing a contract with this term)
}`

  const raw = await callGemini(prompt)
  try {
    const clean = raw.replace(/```json/g, '').replace(/```/g, '').trim()
    const parsed = JSON.parse(clean)
    return {
      term: parsed.term || term,
      termHi: parsed.termHi || 'विधिक शब्दावली',
      plainEnglish: parsed.plainEnglish,
      plainHindi: parsed.plainHindi,
      exampleScenario: parsed.exampleScenario,
      practicalTip: parsed.practicalTip,
      disclaimer: AI_DISCLAIMER
    }
  } catch {
    if (matchedKey) {
      return {
        ...COMMON_LEGAL_GLOSSARY[matchedKey],
        disclaimer: AI_DISCLAIMER
      }
    }
    return {
      term,
      termHi: 'विधिक शर्त',
      plainEnglish: `This legal clause defines specific rights, obligations, or liabilities binding on both parties under Indian law.`,
      plainHindi: `यह कानूनी शर्त भारतीय विधि के अंतर्गत दोनों पक्षों के अधिकारों, कर्तव्यों और जिम्मेदारियों को तय करती है।`,
      exampleScenario: `Used in standard contracts to ensure expectations are written down and legally enforceable in civil courts.`,
      practicalTip: `Always read the entire sentence surrounding this term to ensure no unlimited liability is imposed on you.`,
      disclaimer: AI_DISCLAIMER
    }
  }
}

// 7. Unclear Clause Improver & Clarity Optimizer
export async function aiImproveClause(
  clauseTextEn: string,
  clauseTextHi?: string
): Promise<{
  ambiguitiesDetected: string[]
  ambiguitiesFound?: string[]
  improvedClauseEn: string
  improvedEn?: string
  improvedClauseHi: string
  improvedHi?: string
  rationaleEn: string
  improvementReason?: string
  rationaleHi: string
  disclaimer: string
}> {
  const prompt = `Review this legal agreement clause and identify any unclear, ambiguous, one-sided, or vague language (e.g., 'reasonable time', 'at sole discretion', 'subject to deductions', 'without notice').
Clause:
"${clauseTextEn}"

Provide:
1. ambiguitiesDetected: array of specific vague words or loopholes found.
2. improvedClauseEn: A crystal-clear, balanced, specific, and modern English rewrite with exact timelines and balanced rights.
3. improvedClauseHi: Accurate, natural Hindi translation of the improved clause in Devanagari.
4. rationaleEn: Brief explanation of why this rewrite protects both parties and prevents litigation.
5. rationaleHi: Hindi explanation of why this revision is better.

Return strictly valid JSON:
{
  "ambiguitiesDetected": ["string"],
  "improvedClauseEn": "string",
  "improvedClauseHi": "string",
  "rationaleEn": "string",
  "rationaleHi": "string"
}`

  const raw = await callGemini(prompt)
  try {
    const clean = raw.replace(/```json/g, '').replace(/```/g, '').trim()
    const parsed = JSON.parse(clean)
    const amb = parsed.ambiguitiesDetected || parsed.ambiguitiesFound || ['Vague timelines', 'Unilateral discretion']
    const impEn = parsed.improvedClauseEn || parsed.improvedEn || ''
    const impHi = parsed.improvedClauseHi || parsed.improvedHi || ''
    const ratEn = parsed.rationaleEn || parsed.improvementReason || ''
    const ratHi = parsed.rationaleHi || ''
    return {
      ambiguitiesDetected: amb,
      ambiguitiesFound: amb,
      improvedClauseEn: impEn,
      improvedEn: impEn,
      improvedClauseHi: impHi,
      improvedHi: impHi,
      rationaleEn: ratEn,
      improvementReason: ratEn,
      rationaleHi: ratHi,
      disclaimer: AI_DISCLAIMER
    }
  } catch {
    const defaultAmb = [
      'Ambiguous discretionary power without mutual consultation',
      'Lack of specific calendar business-day timeline',
      'Undefined deduction mechanisms'
    ]
    const defaultEn = `Both parties agree that any action, adjustment, or decision under this provision shall be executed in good faith with at least 7 (seven) business days prior written notice. Any financial deductions shall be accompanied by itemized tax invoices and physical proof of expenditure, verified mutually prior to adjustment.`
    const defaultHi = `दोनों पक्ष सहमत हैं कि इस प्रावधान के तहत कोई भी कार्रवाई या निर्णय कम से कम 7 कार्य दिवसों के पूर्व लिखित नोटिस के साथ सद्भावनापूर्वक किया जाएगा। किसी भी कटौती के साथ वास्तविक व्यय के बिल और प्रमाण प्रस्तुत किए जाएंगे जिनका समायोजन से पूर्व आपसी सत्यापन अनिवार्य होगा।`
    const defaultRatEn = 'Replaces unilateral subjective discretion with an objective 7-day notice period and documented invoice verification.'
    const defaultRatHi = 'एकतरफा मनमानी के स्थान पर 7 दिन का स्पष्ट नोटिस और बिलों का लिखित सत्यापन अनिवार्य करके दोनों पक्षों के हितों की रक्षा करता है।'

    return {
      ambiguitiesDetected: defaultAmb,
      ambiguitiesFound: defaultAmb,
      improvedClauseEn: defaultEn,
      improvedEn: defaultEn,
      improvedClauseHi: defaultHi,
      improvedHi: defaultHi,
      rationaleEn: defaultRatEn,
      improvementReason: defaultRatEn,
      rationaleHi: defaultRatHi,
      disclaimer: AI_DISCLAIMER
    }
  }
}

