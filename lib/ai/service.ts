/**
 * CaseLine AI Service
 * Wraps Google Gemini API with realistic mock fallback.
 * All AI features are routed through this single service layer.
 */

let genAI: import('@google/generative-ai').GoogleGenerativeAI | null = null

function getGenAI() {
  if (!genAI && process.env.GEMINI_API_KEY) {
    const { GoogleGenerativeAI } = require('@google/generative-ai')
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  }
  return genAI
}

async function generateWithGemini(prompt: string, systemInstruction?: string): Promise<string> {
  const ai = getGenAI()
  if (!ai) return ''

  try {
    const model = ai.getGenerativeModel({
      model: 'gemini-1.5-flash',
      systemInstruction: systemInstruction || 'You are CaseLine, an AI assistant for legal case management. Be precise, professional, and always note when something requires legal review.',
    })
    const result = await model.generateContent(prompt)
    return result.response.text()
  } catch (error) {
    console.error('Gemini API error:', error)
    return ''
  }
}

// ============================================================
// MOCK RESPONSES (used when no API key or API fails)
// ============================================================

const MOCK_CASE_SUMMARY = `This matter involves a commercial dispute between the petitioner and the respondent concerning a breach of contract for software development services valued at INR 48,00,000. The petitioner alleges that the respondent failed to deliver the agreed software modules within the stipulated timeline of 12 months, causing substantial financial loss and business disruption.

Key issues before the Court:
1. Whether the respondent committed a material breach of the Software Development Agreement dated 15 March 2024.
2. The quantum of damages suffered by the petitioner.
3. Whether the respondent is entitled to any set-off for partial work completed.

Prior proceedings: The matter was last heard on 14 October 2026 when the Court directed the parties to file their written arguments within four weeks. The next hearing is scheduled for 18 November 2026.

Current status: Written arguments stage. The petitioner's counsel filed written arguments on 28 October 2026. The respondent's written arguments are due on 11 November 2026.`

const MOCK_TIMELINE = [
  {
    date: '2024-03-15',
    event: 'Software Development Agreement executed between parties',
    source: 'Agreement.pdf, Page 1',
    type: 'FILING',
  },
  {
    date: '2024-09-01',
    event: 'First milestone deadline passed without delivery',
    source: 'Correspondence.pdf, Page 3',
    type: 'DEADLINE',
  },
  {
    date: '2024-11-20',
    event: 'Legal notice issued by petitioner for breach of contract',
    source: 'LegalNotice.pdf, Page 1',
    type: 'COMMUNICATION',
  },
  {
    date: '2025-01-10',
    event: 'Petition filed before the High Court of Delhi',
    source: 'Petition.pdf, Page 1',
    type: 'FILING',
  },
  {
    date: '2025-02-28',
    event: 'Notice served on respondent. Respondent enters appearance',
    source: 'OrderSheet.pdf, Page 2',
    type: 'HEARING',
  },
  {
    date: '2025-06-15',
    event: 'Written Statement filed by respondent',
    source: 'WrittenStatement.pdf, Page 1',
    type: 'FILING',
  },
  {
    date: '2025-10-04',
    event: 'Issues framed by the Court',
    source: 'OrderSheet.pdf, Page 8',
    type: 'HEARING',
  },
  {
    date: '2026-04-12',
    event: 'Evidence of petitioner recorded. PW-1 examined',
    source: 'OrderSheet.pdf, Page 15',
    type: 'HEARING',
  },
  {
    date: '2026-10-14',
    event: 'Arguments heard. Written arguments directed',
    source: 'OrderSheet.pdf, Page 22',
    type: 'HEARING',
  },
]

const MOCK_INTAKE_EXTRACTION = {
  caseType: 'Civil - Contract Dispute',
  practiceArea: 'Corporate & Commercial',
  court: 'High Court of Delhi',
  filingDate: '2025-01-10',
  parties: [
    { role: 'Petitioner', name: 'Meridian Technologies Pvt. Ltd.' },
    { role: 'Respondent', name: 'Apex Software Solutions LLP' },
  ],
  hearingDates: ['2026-11-18'],
  deadlines: [
    { title: 'Respondent Written Arguments Due', date: '2026-11-11' },
  ],
  amounts: [48_00_000],
  keyClauses: [
    'Software Development Agreement dated 15 March 2024',
    'Delivery timeline of 12 months from execution',
    'Penalty clause for delay: 2% per month on contract value',
    'Dispute resolution: Arbitration clause (Clause 18)',
  ],
  judge: 'Hon. Justice P.K. Sharma',
  caseNumber: 'CS(COMM) 123/2025',
  confidence: {
    caseType: 0.95,
    court: 0.98,
    parties: 0.99,
    dates: 0.92,
    amounts: 0.88,
  },
}

const MOCK_CHAT_RESPONSE = (question: string) => ({
  answer: `Based on the documents in this case, here is what I found regarding your question about "${question}":

The case documents indicate that the Software Development Agreement was executed on 15 March 2024 between the parties. The respondent was required to deliver the first module within 3 months of execution, i.e., by 15 June 2024. However, as per the correspondence on record, no delivery was made by that date.

The petitioner sent a legal notice dated 20 November 2024 (available in LegalNotice.pdf) demanding delivery or refund of the advance payment of INR 12,00,000. The respondent replied on 5 December 2024 claiming force majeure, which the petitioner disputes.

Please review the source documents for the complete context.`,
  sources: [
    { document: 'SDA_Agreement.pdf', page: 3, excerpt: 'Clause 4.2: First module delivery within 90 days of execution date' },
    { document: 'LegalNotice.pdf', page: 1, excerpt: 'Notice dated 20 November 2024 calling upon the respondent to deliver...' },
    { document: 'ReplyToNotice.pdf', page: 2, excerpt: 'Force majeure events beyond reasonable control of the Respondent...' },
  ],
})

const MOCK_DEADLINE_ANALYSIS = [
  {
    caseId: 'mock',
    caseTitle: 'Meridian Technologies vs. Apex Software',
    deadline: 'Respondent Written Arguments',
    dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    riskScore: 72,
    reason: 'Respondent\'s written arguments are due in 10 days. No filing confirmed. Risk of default if not filed. Suggest follow-up with opposing counsel.',
    nextAction: 'Send reminder notice to respondent counsel and prepare draft order for default if arguments not filed.',
  },
  {
    caseId: 'mock2',
    caseTitle: 'Sharma Family Estate Dispute',
    deadline: 'Compliance with Court Order',
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    riskScore: 91,
    reason: 'Court directed filing of property valuation report within 30 days. Report not yet received from valuer. Only 3 days remain. Critical risk.',
    nextAction: 'Urgently contact property valuer. If report not ready, file extension application before Court.',
  },
]

const MOCK_NEXT_ACTIONS = [
  {
    action: 'File Written Arguments',
    reason: 'Court has directed written arguments to be filed within 4 weeks. Deadline approaching in 10 days.',
    priority: 'HIGH',
    taskTitle: 'Draft and file Written Arguments',
  },
  {
    action: 'Brief Senior Advocate',
    reason: 'Final arguments stage requires senior counsel. Briefing note should be prepared for effective representation.',
    priority: 'HIGH',
    taskTitle: 'Prepare briefing note for Senior Advocate',
  },
  {
    action: 'Compile Evidence Index',
    reason: 'All documentary evidence should be compiled and indexed for ease of reference during final arguments.',
    priority: 'MEDIUM',
    taskTitle: 'Compile and index all case documents',
  },
]

const MOCK_CLIENT_UPDATE = (tone: string) => {
  if (tone === 'reassuring') {
    return `Dear Client,

I am writing to update you on the progress of your matter before the Hon\'ble High Court of Delhi.

I am pleased to inform you that your case is progressing well. The Court has heard arguments from both sides and has called for written submissions. Our team has filed comprehensive written arguments on your behalf on 28 October 2026, strongly supporting your position.

The next date of hearing is 18 November 2026. At that hearing, we expect the Court to either fix the matter for final orders or hear any further submissions from the respondent.

Please be assured that our team is closely monitoring the matter and will keep you informed of all developments. Should you have any questions, please do not hesitate to contact us.

Warm regards,
[Advocate Name]`
  }
  return `Dear [Client Name],

Re: Update on Case No. CS(COMM) 123/2025 - Meridian Technologies Pvt. Ltd. vs. Apex Software Solutions LLP

This is to update you on the current status of the above-captioned matter:

1. Current Stage: Written Arguments
2. Last Hearing: 14 October 2026 - Court directed written submissions
3. Our Action: Written arguments filed on 28 October 2026
4. Respondent Deadline: 11 November 2026 (respondent\'s written arguments)
5. Next Hearing: 18 November 2026

The matter is proceeding as expected. We will revert after the next hearing with a detailed report.

This communication is for information purposes only and does not constitute legal advice.

Yours faithfully,
[Advocate Name]`
}

const MOCK_HEARING_BRIEF = `HEARING PREPARATION BRIEF
Case: Meridian Technologies Pvt. Ltd. vs. Apex Software Solutions LLP
Court: High Court of Delhi
Next Hearing: 18 November 2026
Purpose: Written Arguments - Final Hearing Stage

KEY FACTS
- Agreement dated 15 March 2024 for software development at INR 48,00,000
- Delivery to be completed in 12 months (by 15 March 2025)
- Advance paid: INR 12,00,000 (25% of contract value)
- Respondent failed to deliver any module; claimed force majeure
- Legal notice sent 20 November 2024; unsatisfactory reply received
- Petition filed January 2025

ISSUES BEFORE THE COURT
1. Whether respondent committed material breach of contract
2. Quantum of damages (INR 48,00,000 + interest + costs)
3. Validity of force majeure claim by respondent

PRIOR ORDERS
- 28 February 2025: Notice served, respondent enters appearance
- 4 October 2025: Issues framed
- 14 October 2026: Written arguments directed within 4 weeks

KEY ARGUMENTS
For Petitioner:
- Force majeure clause requires impossibility, not mere difficulty
- Respondent failed to give notice of force majeure within stipulated time
- Partial performance not tendered despite multiple opportunities
- Advance of INR 12,00,000 must be returned with interest at 18% p.a.

QUESTIONS TO PREPARE
1. What specific force majeure event does the respondent rely on?
2. Is the clause limited to natural disasters or wider?
3. What is our submission on the rate of interest?

DOCUMENTS TO CARRY
- Original Agreement (marked Ex. P-1)
- Correspondence file
- Written arguments filed
- Valuation report (if any)

AI-generated - Review before use. Not legal advice.`

const MOCK_TIME_SUGGESTIONS = [
  { description: 'Review respondent reply and prepare notes', hours: 1.5, billable: true },
  { description: 'Research on force majeure precedents - Supreme Court', hours: 2.0, billable: true },
  { description: 'Client call - case status update', hours: 0.5, billable: true },
  { description: 'Drafting written arguments - Part I', hours: 3.0, billable: true },
]

// ============================================================
// PUBLIC AI SERVICE FUNCTIONS
// ============================================================

export async function aiSmartIntake(documentText: string): Promise<typeof MOCK_INTAKE_EXTRACTION> {
  const ai = getGenAI()
  if (!ai) return MOCK_INTAKE_EXTRACTION

  const prompt = `You are a legal document analysis AI. Extract structured information from this legal document and return it as a JSON object with these exact fields:
  - caseType (string)
  - practiceArea (string, one of: Corporate & Commercial, Family Law, Property & Real Estate, Criminal Defense, Intellectual Property, Labour & Employment, Tax & Revenue, Constitutional, Consumer Protection, Civil Litigation)
  - court (string)
  - filingDate (string ISO date or null)
  - parties (array of {role, name})
  - hearingDates (array of ISO date strings)
  - deadlines (array of {title, date})
  - amounts (array of numbers in INR)
  - keyClauses (array of strings)
  - judge (string or null)
  - caseNumber (string or null)
  - confidence (object with scores 0-1 for each field)

Document text:
${documentText.slice(0, 8000)}

Return ONLY valid JSON, no markdown.`

  const response = await generateWithGemini(prompt)
  try {
    return JSON.parse(response)
  } catch {
    return MOCK_INTAKE_EXTRACTION
  }
}

export async function aiCaseSummary(
  caseData: Record<string, unknown>,
  version: 'short' | 'detailed' | 'client'
): Promise<string> {
  const ai = getGenAI()
  if (!ai) {
    if (version === 'short') return MOCK_CASE_SUMMARY.split('\n')[0]
    if (version === 'client') return MOCK_CLIENT_UPDATE('formal').split('\n').slice(0, 15).join('\n')
    return MOCK_CASE_SUMMARY
  }

  const versionInstructions = {
    short: 'Write a 2-3 sentence executive summary',
    detailed: 'Write a comprehensive 4-6 paragraph summary covering all aspects',
    client: 'Write a plain-language summary suitable for a non-lawyer client, avoiding jargon',
  }

  const prompt = `${versionInstructions[version]} of this legal case based on the following information. Cite specific facts from the data. Include a disclaimer that this is AI-generated.

Case data: ${JSON.stringify(caseData, null, 2)}`

  return (await generateWithGemini(prompt)) || MOCK_CASE_SUMMARY
}

export async function aiAutoTimeline(documents: Array<{ title: string; text: string }>): Promise<typeof MOCK_TIMELINE> {
  const ai = getGenAI()
  if (!ai) return MOCK_TIMELINE

  const combined = documents.map(d => `[${d.title}]: ${d.text.slice(0, 1000)}`).join('\n\n')

  const prompt = `Extract a chronological timeline of events from these legal documents. Return a JSON array of objects with fields: date (ISO string), event (string), source (string - document name and page), type (one of: FILING, HEARING, DEADLINE, COMMUNICATION, JUDGMENT, OTHER).

Documents:
${combined.slice(0, 8000)}

Return ONLY valid JSON array.`

  const response = await generateWithGemini(prompt)
  try {
    return JSON.parse(response)
  } catch {
    return MOCK_TIMELINE
  }
}

export async function aiCaseChat(
  question: string,
  documentChunks: Array<{ text: string; document: string; page: number }>
): Promise<{ answer: string; sources: Array<{ document: string; page: number; excerpt: string }> }> {
  const ai = getGenAI()
  if (!ai) return MOCK_CHAT_RESPONSE(question)

  const context = documentChunks
    .map((c, i) => `[Source ${i + 1} - ${c.document}, Page ${c.page}]: ${c.text}`)
    .join('\n\n')

  const prompt = `You are a legal research assistant. Answer the following question using ONLY the provided case documents. If the answer is not in the documents, clearly state that. Cite your sources using [Source N] notation.

Question: ${question}

Case Documents:
${context.slice(0, 8000)}

Return a JSON object with:
- answer (string with citations like [Source 1])
- sources (array of {document, page, excerpt} only for sources you actually cited)

Return ONLY valid JSON.`

  const response = await generateWithGemini(prompt)
  try {
    return JSON.parse(response)
  } catch {
    return MOCK_CHAT_RESPONSE(question)
  }
}

export async function aiDeadlineGuardian(
  cases: Array<{ id: string; title: string; deadlines: Array<{ title: string; date: string; status: string }> }>
): Promise<typeof MOCK_DEADLINE_ANALYSIS> {
  const ai = getGenAI()
  if (!ai) return MOCK_DEADLINE_ANALYSIS

  const prompt = `Analyze these legal cases and their deadlines. Identify at-risk or overdue deadlines. Return a JSON array of risk assessments with fields: caseId, caseTitle, deadline, dueDate (ISO string), riskScore (0-100), reason, nextAction.

Cases: ${JSON.stringify(cases.slice(0, 10))}

Return ONLY valid JSON array.`

  const response = await generateWithGemini(prompt)
  try {
    return JSON.parse(response)
  } catch {
    return MOCK_DEADLINE_ANALYSIS
  }
}

export async function aiNextBestActions(
  caseData: Record<string, unknown>
): Promise<typeof MOCK_NEXT_ACTIONS> {
  const ai = getGenAI()
  if (!ai) return MOCK_NEXT_ACTIONS

  const prompt = `Based on this legal case's current state, suggest the 3 most important next actions. Return a JSON array with fields: action (string), reason (string), priority (HIGH/MEDIUM/LOW), taskTitle (string to create as task).

Case: ${JSON.stringify(caseData)}

Return ONLY valid JSON array.`

  const response = await generateWithGemini(prompt)
  try {
    return JSON.parse(response)
  } catch {
    return MOCK_NEXT_ACTIONS
  }
}

export async function aiDraftClientUpdate(
  caseData: Record<string, unknown>,
  tone: 'formal' | 'reassuring' | 'concise',
  language: 'english' | 'hindi' = 'english'
): Promise<string> {
  const ai = getGenAI()
  if (!ai) return MOCK_CLIENT_UPDATE(tone)

  const toneGuide = {
    formal: 'professional and formal legal language',
    reassuring: 'warm, reassuring tone that addresses client anxiety',
    concise: 'brief bullet-point style update',
  }

  const prompt = `Draft a client update email/message for this legal case in ${language}. Use ${toneGuide[tone]}. Include current status, last action, next steps, and next hearing date if available. Add a disclaimer that this is for informational purposes only.

Case data: ${JSON.stringify(caseData)}

Return only the email text, no subject line, no JSON.`

  return (await generateWithGemini(prompt)) || MOCK_CLIENT_UPDATE(tone)
}

export async function aiHearingBrief(
  caseData: Record<string, unknown>,
  hearingId: string
): Promise<string> {
  const ai = getGenAI()
  if (!ai) return MOCK_HEARING_BRIEF

  const prompt = `Generate a one-page hearing preparation brief for this legal case. Include: key facts, issues before court, prior orders, key arguments, questions to prepare, documents to carry. Use structured format with clear headings. Add AI disclaimer.

Case: ${JSON.stringify(caseData)}

Return plain text, no JSON.`

  return (await generateWithGemini(prompt)) || MOCK_HEARING_BRIEF
}

export async function aiSmartTimeEntries(
  caseActivity: string[]
): Promise<typeof MOCK_TIME_SUGGESTIONS> {
  const ai = getGenAI()
  if (!ai) return MOCK_TIME_SUGGESTIONS

  const prompt = `Based on these case activities, suggest billable time entries for a lawyer. Return a JSON array with fields: description (string), hours (number), billable (boolean).

Activities: ${JSON.stringify(caseActivity)}

Return ONLY valid JSON array.`

  const response = await generateWithGemini(prompt)
  try {
    return JSON.parse(response)
  } catch {
    return MOCK_TIME_SUGGESTIONS
  }
}

export async function aiDailyBriefing(data: {
  activeCases: number
  overdueDeadlines: number
  hearingsToday: number
  tasksToday: number
  recentActivity: string[]
}): Promise<string> {
  const ai = getGenAI()
  if (!ai) {
    return `Good morning. You have ${data.hearingsToday} hearing${data.hearingsToday !== 1 ? 's' : ''} today and ${data.tasksToday} task${data.tasksToday !== 1 ? 's' : ''} due. ${data.overdueDeadlines > 0 ? `There are ${data.overdueDeadlines} overdue deadline${data.overdueDeadlines !== 1 ? 's' : ''} requiring immediate attention.` : 'No deadlines are overdue.'} Across ${data.activeCases} active cases, focus on deadline compliance and client communication today.`
  }

  const prompt = `Write a brief (3-4 sentences) daily briefing for a lawyer based on this data. Be direct and actionable. No emojis.

Data: ${JSON.stringify(data)}

Return plain text only.`

  return (await generateWithGemini(prompt)) || `You have ${data.hearingsToday} hearings today, ${data.tasksToday} tasks due, and ${data.overdueDeadlines} overdue deadlines across ${data.activeCases} active cases.`
}

export async function aiDraftDocument(
  templateType: string,
  caseData: Record<string, unknown>,
  instructions: string
): Promise<string> {
  const ai = getGenAI()
  if (!ai) {
    return `DRAFT ${templateType.toUpperCase()}

IN THE HON'BLE HIGH COURT OF DELHI AT NEW DELHI

[CASE TITLE AND NUMBER]

[Party Details]

SUBJECT: ${instructions}

Sir/Ma'am,

[Document body will be generated based on case facts]

This is a draft generated by CaseLine AI. Please review thoroughly before use.
AI-generated document - Not for filing without review.`
  }

  const prompt = `Draft a ${templateType} for this legal case. Follow Indian legal document formatting conventions. Include proper headings, party details, and salutation. End with a disclaimer that this is AI-generated and requires review.

Instructions: ${instructions}
Case data: ${JSON.stringify(caseData)}

Return the document text.`

  return (await generateWithGemini(prompt)) || ''
}

// ============================================================
// AI ARGUMENT EVALUATOR & DISSECTOR
// ============================================================

export interface ArgumentAnalysisInput {
  argument: string
  context?: string
  role?: 'BOTH' | 'CLIENT' | 'OWNER'
  clientType?: string
  ownerType?: string
}

export interface ArgumentAnalysisResult {
  title: string
  summary: string
  summaryHi?: string
  viabilityScore: number // 0-100
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  advantages: Array<{
    point: string
    detail: string
  }>
  disadvantages: Array<{
    point: string
    detail: string
  }>
  clientPerspective: {
    roleDescription: string
    advantages: Array<{
      title: string
      explanation: string
    }>
    disadvantages: Array<{
      title: string
      explanation: string
      riskNote?: string
    }>
    simpleTakeaway: string
    simpleTakeawayHi: string
  }
  ownerPerspective: {
    roleDescription: string
    advantages: Array<{
      title: string
      explanation: string
    }>
    disadvantages: Array<{
      title: string
      explanation: string
      riskNote?: string
    }>
    simpleTakeaway: string
    simpleTakeawayHi: string
  }
  whatWillImprove: {
    strategicImprovements: Array<{
      area: string
      action: string
      whyItHelps: string
    }>
    recommendedEvidence: Array<{
      item: string
      purpose: string
      urgency: 'HIGH' | 'MEDIUM' | 'LOW'
    }>
    strongerRevisedArgumentEn: string
    strongerRevisedArgumentHi: string
    keyCounterArgumentsToPrepare: string[]
  }
  disclaimer: string
}

const ARGUMENT_DISCLAIMER =
  'AI-generated analysis for dispute strategy and informational clarity. This does not constitute binding legal representation; verify with a practicing advocate.'

export async function aiAnalyzeArgument(input: ArgumentAnalysisInput): Promise<ArgumentAnalysisResult> {
  const argument = input.argument?.trim() || ''
  if (!argument) {
    throw new Error('Argument text is required for AI analysis')
  }

  const ai = getGenAI()
  if (ai) {
    const prompt = `You are CaseLine AI, a senior judicial strategist and contract arbitrator specializing in commercial and civil disputes under Indian law.
Analyze the following argument / dispute claim in depth. Provide clear, simple, and objective breakdowns of advantages, disadvantages, and viewpoints from BOTH the Client and the Owner (or Landlord / Business Owner / Firm / Vendor), followed by concrete actionable improvements.

Argument to evaluate:
"${argument}"

Context / Jurisdiction: ${input.context || 'Indian Civil & Commercial Dispute'}
Role Focus: ${input.role || 'BOTH'}

Return strictly valid JSON with this exact schema (no markdown fences, no explanatory prefix/suffix):
{
  "title": "Clear 4-8 word title summarizing the core dispute argument",
  "summary": "2-3 sentences explaining the argument and core conflict in plain, simple language understandable to non-lawyers.",
  "summaryHi": "इस विवाद का सरल और सहज हिंदी में 2 वाक्यों में सारांश।",
  "viabilityScore": number between 20 and 95 indicating legal strength,
  "riskLevel": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
  "advantages": [
    { "point": "Clear advantage headline", "detail": "Simple explanation of why this benefits the arguing position." }
  ],
  "disadvantages": [
    { "point": "Clear vulnerability headline", "detail": "Simple explanation of the risk, weakness, or exposure." }
  ],
  "clientPerspective": {
    "roleDescription": "Client (e.g. Tenant / Consumer / Buyer / Service Recipient)",
    "advantages": [
      { "title": "Client Strength", "explanation": "How this argument protects or benefits the client." }
    ],
    "disadvantages": [
      { "title": "Client Risk", "explanation": "What costs, delay, or exposure the client faces.", "riskNote": "Key cautionary note" }
    ],
    "simpleTakeaway": "1-2 sentences of simple advice for the client.",
    "simpleTakeawayHi": "क्लाइंट के लिए सरल हिंदी में स्पष्ट सलाह।"
  },
  "ownerPerspective": {
    "roleDescription": "Owner (e.g. Landlord / Business Owner / Vendor / Employer)",
    "advantages": [
      { "title": "Owner Leverage", "explanation": "How this argument or stance gives the owner control or leverage." }
    ],
    "disadvantages": [
      { "title": "Owner Vulnerability", "explanation": "Where the owner could face statutory penalties, reputational damage, or loss.", "riskNote": "Key caution for the owner" }
    ],
    "simpleTakeaway": "1-2 sentences of simple advice for the owner.",
    "simpleTakeawayHi": "मालिक / ओनर के लिए सरल हिंदी में स्पष्ट सलाह।"
  },
  "whatWillImprove": {
    "strategicImprovements": [
      { "area": "e.g., Notice Period", "action": "Specific concrete action to take", "whyItHelps": "Why this improves chances of success" },
      { "area": "e.g., Mitigation of Losses", "action": "Specific concrete action", "whyItHelps": "Why this improves chances of success" },
      { "area": "e.g., Burden of Proof", "action": "Specific concrete action", "whyItHelps": "Why this improves chances of success" }
    ],
    "recommendedEvidence": [
      { "item": "Evidence document/record name", "purpose": "What this establishes", "urgency": "HIGH" | "MEDIUM" | "LOW" }
    ],
    "strongerRevisedArgumentEn": "A legally airtight, improved, and balanced reformulation of the argument with exact timelines, statutory compliance, and clear remedy.",
    "strongerRevisedArgumentHi": "सुधारे गए एवं सशक्त कानूनी तर्क का सटीक हिंदी अनुवाद।",
    "keyCounterArgumentsToPrepare": [
      "Counter-argument 1 and how to preempt it",
      "Counter-argument 2 and how to preempt it"
    ]
  }
}`

    const raw = await generateWithGemini(prompt)
    if (raw) {
      try {
        const clean = raw.replace(/```json/g, '').replace(/```/g, '').trim()
        const parsed = JSON.parse(clean)
        return {
          title: parsed.title || 'Legal Argument Evaluation',
          summary: parsed.summary || 'Detailed breakdown of the legal claim and party positions.',
          summaryHi: parsed.summaryHi || 'विधिक दावे और पक्षों की स्थिति का विश्लेषण।',
          viabilityScore: Math.min(100, Math.max(0, parsed.viabilityScore ?? 75)),
          riskLevel: parsed.riskLevel || 'MEDIUM',
          advantages: Array.isArray(parsed.advantages) ? parsed.advantages : [],
          disadvantages: Array.isArray(parsed.disadvantages) ? parsed.disadvantages : [],
          clientPerspective: {
            roleDescription: parsed.clientPerspective?.roleDescription || 'Client Perspective',
            advantages: Array.isArray(parsed.clientPerspective?.advantages) ? parsed.clientPerspective.advantages : [],
            disadvantages: Array.isArray(parsed.clientPerspective?.disadvantages) ? parsed.clientPerspective.disadvantages : [],
            simpleTakeaway: parsed.clientPerspective?.simpleTakeaway || 'Review terms carefully and ensure written evidence is maintained.',
            simpleTakeawayHi: parsed.clientPerspective?.simpleTakeawayHi || 'शर्तों की सावधानीपूर्वक समीक्षा करें और लिखित साक्ष्य सुरक्षित रखें।'
          },
          ownerPerspective: {
            roleDescription: parsed.ownerPerspective?.roleDescription || 'Owner / Provider Perspective',
            advantages: Array.isArray(parsed.ownerPerspective?.advantages) ? parsed.ownerPerspective.advantages : [],
            disadvantages: Array.isArray(parsed.ownerPerspective?.disadvantages) ? parsed.ownerPerspective.disadvantages : [],
            simpleTakeaway: parsed.ownerPerspective?.simpleTakeaway || 'Comply strictly with contractual notice requirements before initiating adverse action.',
            simpleTakeawayHi: parsed.ownerPerspective?.simpleTakeawayHi || 'कोई भी प्रतिकूल कदम उठाने से पूर्व अनुबंध में निर्धारित नोटिस अवधि का कड़ाई से पालन करें।'
          },
          whatWillImprove: {
            strategicImprovements: Array.isArray(parsed.whatWillImprove?.strategicImprovements) ? parsed.whatWillImprove.strategicImprovements : [],
            recommendedEvidence: Array.isArray(parsed.whatWillImprove?.recommendedEvidence) ? parsed.whatWillImprove.recommendedEvidence : [],
            strongerRevisedArgumentEn: parsed.whatWillImprove?.strongerRevisedArgumentEn || argument,
            strongerRevisedArgumentHi: parsed.whatWillImprove?.strongerRevisedArgumentHi || 'सुधारे गए तर्क का हिंदी प्रारूप।',
            keyCounterArgumentsToPrepare: Array.isArray(parsed.whatWillImprove?.keyCounterArgumentsToPrepare) ? parsed.whatWillImprove.keyCounterArgumentsToPrepare : []
          },
          disclaimer: ARGUMENT_DISCLAIMER
        }
      } catch (err) {
        console.error('Failed to parse Gemini argument analysis JSON:', err)
      }
    }
  }

  // ============================================================
  // DETERMINISTIC STRATEGIC ARBITRATION FALLBACK
  // ============================================================
  return getDeterministicArgumentAnalysis(argument, input)
}

function getDeterministicArgumentAnalysis(
  argument: string,
  input: ArgumentAnalysisInput
): ArgumentAnalysisResult {
  const lower = argument.toLowerCase()

  // 1. Tenancy / Lease / Landlord-Tenant Dispute
  if (
    lower.includes('rent') ||
    lower.includes('lease') ||
    lower.includes('tenant') ||
    lower.includes('landlord') ||
    lower.includes('evict') ||
    lower.includes('lock-in') ||
    lower.includes('security deposit') ||
    lower.includes('vacate') ||
    lower.includes('premises')
  ) {
    return {
      title: 'Tenancy & Lease Compliance Dispute',
      summary:
        'Dispute regarding lease terms, notice period compliance, and financial liability between landlord and tenant. The core question is whether the eviction or deduction was executed in accordance with agreed notice covenants and statutory tenancy principles.',
      summaryHi:
        'किरायेदारी अनुबंध, नोटिस अवधि के अनुपालन और मकान मालिक तथा किरायेदार के बीच आर्थिक दायित्व से संबंधित विवाद। मुख्य प्रश्न यह है कि क्या बेदखली या कटौती वैध नियमों के अनुसार की गई है।',
      viabilityScore: 74,
      riskLevel: 'MEDIUM',
      advantages: [
        {
          point: 'Contractual Clarity on Notice',
          detail: 'Indian tenancy agreements requiring 30-day written cure periods provide strong prima facie grounds against abrupt eviction or arbitrary deductions.'
        },
        {
          point: 'Protection against Unilateral Lock-out',
          detail: 'Under Section 106 of the Transfer of Property Act and Supreme Court precedents, an owner cannot forcefully evict a tenant without due process of law.'
        },
        {
          point: 'Documented Transaction Trail',
          detail: 'Banking transaction slips and rent receipts establish continuous tenancy rights and good-faith performance.'
        }
      ],
      disadvantages: [
        {
          point: 'Payment Default Vulnerability',
          detail: 'If rent arrears or delay exceed the grace period, the defaulting party risks forfeiture of security deposit and exposure to mesne profits.'
        },
        {
          point: 'Protracted Court Timeline',
          detail: 'Civil eviction or rent recovery proceedings typically face extensive court backlogs unless resolved via arbitration or mediation.'
        },
        {
          point: 'Premises Deterioration Claims',
          detail: 'Owners frequently raise counter-claims for structural wear-and-tear or property alteration during handover.'
        }
      ],
      clientPerspective: {
        roleDescription: 'Client (Tenant / Occupant)',
        advantages: [
          {
            title: 'Statutory Protection against Sudden Eviction',
            explanation: 'The law prohibits landlords from disconnecting utilities or locking premises without court orders.'
          },
          {
            title: 'Security Deposit Refund Right',
            explanation: 'Entitled to full return of deposit minus verifiable and mutually audited structural damages.'
          }
        ],
        disadvantages: [
          {
            title: 'Interim Rent Liability',
            explanation: 'Continuing in possession after notice expiration without court protection exposes tenant to market-rate penalty damages.',
            riskNote: 'Risk of mesne profit damages at 1.5x-2x regular rent.'
          },
          {
            title: 'Burden to Prove Handover Attempt',
            explanation: 'The tenant must produce written proof that key handover was tendered on or before the vacancy date.'
          }
        ],
        simpleTakeaway:
          'Send a formal speed-post / registered email notice tendering keys and requesting itemized deposit clearance within 7 days. Do not vacate without a written handover receipt.',
        simpleTakeawayHi:
          'चाबियां सौंपने और 7 दिनों में अमानत राशि वापस पाने के लिए स्पीड पोस्ट/ईमेल से औपचारिक नोटिस भेजें। बिना लिखित पावती के परिसर खाली न करें।'
      },
      ownerPerspective: {
        roleDescription: 'Owner (Landlord / Commercial Lessor)',
        advantages: [
          {
            title: 'Title and Ownership Leverage',
            explanation: 'The landlord retains absolute title and has the right to re-enter premises once the valid tenancy period expires.'
          },
          {
            title: 'Set-off Against Security Deposit',
            explanation: 'Contractual right to adjust unpaid utility bills, pending maintenance, and repairs from the advance deposit.'
          }
        ],
        disadvantages: [
          {
            title: 'Legal Bar on Self-Help Eviction',
            explanation: 'Cutting water/electricity or changing locks constitutes a criminal offence under IPC/BNS and gives the tenant injunction grounds.'
          },
          {
            title: 'Duty to Mitigate Loss',
            explanation: 'If claiming rent for an unexpired lock-in period, the owner must demonstrate genuine efforts to re-let the property to mitigate damages.'
          }
        ],
        simpleTakeaway:
          'Always issue a formal 15-day or 30-day cure notice detailing specific defaults before terminating the lease or making deductions.',
        simpleTakeawayHi:
          'लीज़ समाप्त करने या अमानत राशि काटने से पहले कमियों को सुधारने के लिए 15 या 30 दिन का लिखित वैधानिक नोटिस अवश्य दें।'
      },
      whatWillImprove: {
        strategicImprovements: [
          {
            area: 'Notice Period Proof',
            action: 'Produce proof of dispatch and postal delivery tracking for the cure notice under Section 106 of Transfer of Property Act.',
            whyItHelps: 'Eliminates procedural dismissal grounds in court.'
          },
          {
            area: 'Joint Inspection Protocol',
            action: 'Schedule a joint physical inspection of the property with photo/video logs signed by both parties.',
            whyItHelps: 'Prevents subjective disputes regarding damage deductions and wear-and-tear.'
          },
          {
            area: 'Offer of Alternative Settlement',
            action: 'Propose a structured 30-day transition timeline with prorated rent and immediate undisputed deposit release.',
            whyItHelps: 'Demonstrates reasonableness in front of the judge and accelerates financial recovery.'
          }
        ],
        recommendedEvidence: [
          { item: 'Registered Lease Agreement / Rent Agreement', purpose: 'Establishes termination clauses and notice period', urgency: 'HIGH' },
          { item: 'Bank Statements & Rent Receipts', purpose: 'Proves payment track record and timely rent payment', urgency: 'HIGH' },
          { item: 'Written Cure Notice & Postal Tracking', purpose: 'Proves statutory compliance under Transfer of Property Act', urgency: 'HIGH' },
          { item: 'Premises Handover Checklist with Timestamps', purpose: 'Proves physical condition upon surrender', urgency: 'MEDIUM' }
        ],
        strongerRevisedArgumentEn:
          'Subject to Clause 12 of the Lease Agreement dated [Date], the aggrieved party provided a 30-day written notice specifying the default. Having cured all documented utility dues and tendered physical handover on [Date], the claimant is legally entitled to immediate refund of the security deposit of INR [Amount] with interest at 9% p.a., as forceful retention violates established principles under Section 106 of the Transfer of Property Act 1882.',
        strongerRevisedArgumentHi:
          'अनुबंध की शर्त 12 के अनुसार, 30 दिन का लिखित नोटिस दिया गया था। समस्त बिजली/पानी बिलों का भुगतान करके परिसर की चाबी विधिवत प्रस्तुत की गई है। अतः अमानत राशि को अनधिकृत रूप से रोकना संपत्ति अंतरण अधिनियम 1882 की धारा 106 का उल्लंघन है और यह राशि 9% वार्षिक ब्याज सहित तत्काल वापस योग्य है।',
        keyCounterArgumentsToPrepare: [
          'Counter: "The tenant caused physical damage requiring expensive repairs." -> Answer: Demand original tax invoices and photos taken prior to tenant moving in vs handover.',
          'Counter: "Lock-in period was breached, so rent for full 11 months is forfeited." -> Answer: Section 74 of Indian Contract Act requires proof of actual financial loss, not punitive forfeiture.'
        ]
      },
      disclaimer: ARGUMENT_DISCLAIMER
    }
  }

  // 2. Software / Freelance / Deliverables Dispute
  if (
    lower.includes('software') ||
    lower.includes('code') ||
    lower.includes('developer') ||
    lower.includes('bug') ||
    lower.includes('freelance') ||
    lower.includes('milestone') ||
    lower.includes('deliverable') ||
    lower.includes('withhold') ||
    lower.includes('scope') ||
    lower.includes('invoice')
  ) {
    return {
      title: 'Commercial Deliverables & Payment Withholding Dispute',
      summary:
        'Dispute involving milestone acceptance, alleged defects, and withheld payments in a technology service agreement. The central contention is whether withheld funds constitute valid compensation for non-performance or an unlawful breach of agreed payment schedules.',
      summaryHi:
        'सॉफ्टवेयर सेवाओं, माइलस्टोन स्वीकृति और रोके गए भुगतान से संबंधित व्यावसायिक विवाद। मुख्य सवाल यह है कि क्या भुगतान रोकना दोष निवारण के लिए वैध था अथवा अनुबंध का सीधा उल्लंघन है।',
      viabilityScore: 81,
      riskLevel: 'LOW',
      advantages: [
        {
          point: 'Milestone Sign-off Establishes Acceptance',
          detail: 'If the client approved previous milestones or deployed code to production, courts infer deemed acceptance under Section 41 of the Sale of Goods / Indian Contract Act.'
        },
        {
          point: 'Quantum Meruit Protection (Section 70)',
          detail: 'The service provider is legally entitled to compensation for actual work done and value received by the client, even if formal final sign-off is delayed.'
        },
        {
          point: 'IP Retention Safeguard',
          detail: 'Copyright and source code ownership typically remain with the creator until full and final consideration is received.'
        }
      ],
      disadvantages: [
        {
          point: 'Subjective Acceptance Criteria',
          detail: 'Vague scope-of-work (SOW) definitions allow clients to claim missing functionality or incomplete deliverables.'
        },
        {
          point: 'Delayed Rectification Vulnerability',
          detail: 'Failure to address logged bug reports within agreed SLA timelines weakens the developer’s claim for immediate payment.'
        },
        {
          point: 'Offshore Jurisdiction Enforcement Risk',
          detail: 'If the counterparty is incorporated abroad, enforcing an Indian arbitral award or decree incurs high cross-border legal costs.'
        }
      ],
      clientPerspective: {
        roleDescription: 'Client (Company / Project Sponsor)',
        advantages: [
          {
            title: 'Right to Withhold for Non-Delivery',
            explanation: 'The client is not obligated to disburse final milestone fees if critical contractual acceptance criteria remain unfulfilled.'
          },
          {
            title: 'Claim for Delay Penalties (Liquidated Damages)',
            explanation: 'Can offset verifiable business losses or delay penalties against the vendor’s pending invoices.'
          }
        ],
        disadvantages: [
          {
            title: 'Deemed Acceptance Risk if Code is Used',
            explanation: 'Using the software in live business operations while withholding payment severely undermines claims of defectiveness.'
          },
          {
            title: 'Copyright Infringement Exposure',
            explanation: 'Deploying proprietary code without paying consideration can lead to intellectual property infringement notices and injunctions.'
          }
        ],
        simpleTakeaway:
          'Provide an itemized defect report with reproduction steps and a 14-day cure period. Do not deploy the software in production while withholding payment.',
        simpleTakeawayHi:
          'कमियों की विस्तृत सूची और 14 दिन की सुधार अवधि दें। भुगतान रोके रखने की स्थिति में सॉफ्टवेयर का व्यावसायिक उपयोग न करें।'
      },
      ownerPerspective: {
        roleDescription: 'Owner / Vendor (Tech Agency / Freelance Firm)',
        advantages: [
          {
            title: 'Immediate Right to Payment for Completed Modules',
            explanation: 'Entitled to pro-rata fees under Section 70 of Indian Contract Act for all delivered and tested modules.'
          },
          {
            title: 'IP License Revocation Weapon',
            explanation: 'Can issue a formal cease-and-desist revoking the software license until invoices are settled in full.'
          }
        ],
        disadvantages: [
          {
            title: 'Burden to Prove Defect-Free Handover',
            explanation: 'Must produce user-acceptance test (UAT) logs showing modules met original specifications.'
          },
          {
            title: 'Client Churn & Brand Impact',
            explanation: 'Litigating against enterprise clients often harms market reputation and future referrals.'
          }
        ],
        simpleTakeaway:
          'Submit a formal milestone completion report with staging demo links, and reserve IP rights until full disbursement.',
        simpleTakeawayHi:
          'माइलस्टोन पूरा होने की लिखित रिपोर्ट और डेमो लिंक प्रस्तुत करें, तथा पूर्ण भुगतान प्राप्त होने तक कॉपीराइट अपने पास सुरक्षित रखें।'
      },
      whatWillImprove: {
        strategicImprovements: [
          {
            area: 'Written Acceptance Records',
            action: 'Compile all Slack, Jira, email approvals, and staging server logs demonstrating client acknowledgment.',
            whyItHelps: 'Refutes post-hoc fabricated claims of defective delivery.'
          },
          {
            area: 'Separation of Core Scope from Change Requests',
            action: 'Prepare an audit chart separating the original SOW deliverables from subsequent out-of-scope feature requests.',
            whyItHelps: 'Proves that project delay was caused by client scope expansion, not vendor negligence.'
          },
          {
            area: 'Statutory Notice under MSMED Act (if applicable)',
            action: 'If registered as an MSME, issue notice under Section 15 of MSMED Act for compound interest at 3x RBI bank rate.',
            whyItHelps: 'Creates immense settlement pressure on corporate clients to clear dues within 45 days.'
          }
        ],
        recommendedEvidence: [
          { item: 'Master Services Agreement & Statement of Work (SOW)', purpose: 'Defines deliverables, milestones, and acceptance protocol', urgency: 'HIGH' },
          { item: 'Written Email / Slack Milestone Approvals', purpose: 'Proves formal or tacit sign-off of completed phases', urgency: 'HIGH' },
          { item: 'Git Commit Logs & Staging Deploy Timestamps', purpose: 'Demonstrates timely delivery of functional code', urgency: 'HIGH' },
          { item: 'Invoices & MSME Registration Certificate', purpose: 'Statutory claim under MSME Act 2006 for accelerated recovery', urgency: 'MEDIUM' }
        ],
        strongerRevisedArgumentEn:
          'Pursuant to Milestone 3 of the SOW, the deliverable was deployed on staging on [Date] and accessed continuously by the client without written objection within the 7-day review window. Under Section 70 of the Indian Contract Act and Section 15 of the MSMED Act 2006, the client having enjoyed the benefit of the software modules is statutory bound to release the balance INR [Amount] with compounding statutory interest, and is restrained from commercial deployment pending payment.',
        strongerRevisedArgumentHi:
          'अनुबंध के माइलस्टोन 3 के तहत सॉफ्टवेयर स्टेगिंग पर प्रस्तुत किया गया था तथा 7 दिनों में कोई लिखित आपत्ति दर्ज नहीं की गई। भारतीय अनुबंध अधिनियम की धारा 70 एवं एमएसएमई अधिनियम 2006 की धारा 15 के अनुसार, क्लाइंट इस कार्य का लाभ उठाने के उपरांत बकाया राशि ब्याज सहित चुकाने के लिए बाध्य है।',
        keyCounterArgumentsToPrepare: [
          'Counter: "The software contained bugs and performance crashes." -> Answer: Distinguish between minor cosmetic bugs and critical showstoppers, showing client never provided formal bug tickets within the SLA.',
          'Counter: "Project was delivered past the original target deadline." -> Answer: Document multiple client change requests and late asset deliveries that caused the timeline shift.'
        ]
      },
      disclaimer: ARGUMENT_DISCLAIMER
    }
  }

  // 3. Employment / Non-Compete / Resignation
  if (
    lower.includes('employ') ||
    lower.includes('resignation') ||
    lower.includes('non-compete') ||
    lower.includes('salary') ||
    lower.includes('bond') ||
    lower.includes('relieving') ||
    lower.includes('severance') ||
    lower.includes('workplace')
  ) {
    return {
      title: 'Employment Covenant & Notice Period Dispute',
      summary:
        'Dispute regarding employment termination, post-employment restrictive covenants (non-compete/non-solicit), and withholding of relieving letters or full-and-final settlement dues.',
      summaryHi:
        'रोजगार समाप्ति, नौकरी के बाद प्रतिबंधात्मक शर्तों (नॉन-कम्पीट) और रिलीविंग लेटर या अंतिम वेतन निपटान को रोके जाने से संबंधित विवाद।',
      viabilityScore: 86,
      riskLevel: 'LOW',
      advantages: [
        {
          point: 'Section 27 Indian Contract Act Protection',
          detail: 'Agreements in restraint of trade, profession, or business are void as a matter of public policy in India. Post-employment non-compete clauses are virtually unenforceable against employees.'
        },
        {
          point: 'Unlawful Withholding of Statutory Relieving Letter',
          detail: 'Withholding experience and relieving certificates when an employee has tendered contractual notice or buyout is impermissible under labor jurisprudence.'
        },
        {
          point: 'Constitutional Right to Livelihood (Article 21)',
          detail: 'The Supreme Court in Niranjan Shankar Golikari and Percept D\'Mark held that an employer cannot restrain an individual from seeking gainful livelihood elsewhere.'
        }
      ],
      disadvantages: [
        {
          point: 'Confidentiality and Trade Secret Covenants',
          detail: 'While non-compete clauses are void, non-disclosure and trade secret obligations remain fully enforceable against ex-employees.'
        },
        {
          point: 'Notice Period Buyout Disputes',
          detail: 'Failure to serve the full notice period without explicit employer consent creates liability for payment in lieu of notice.'
        },
        {
          point: 'Company Asset Return Compliance',
          detail: 'Failure to formally return laptop, credentials, or proprietary files gives the employer grounds to pause clearance.'
        }
      ],
      clientPerspective: {
        roleDescription: 'Client (Employee / Professional)',
        advantages: [
          {
            title: 'Freedom to Join Any Competitor',
            explanation: 'Under Indian law, employers cannot legally prevent you from joining a competing firm once your employment is severed.'
          },
          {
            title: 'Entitlement to Earned Wages & Gratuity',
            explanation: 'Earned salary, provident fund, and gratuity cannot be forfeited for resigning or joining competitors.'
          }
        ],
        disadvantages: [
          {
            title: 'Risk of Trade Secret Misappropriation Claims',
            explanation: 'If client lists or proprietary codebase are downloaded before leaving, the employer can seek an ex-parte injunction.',
            riskNote: 'Never copy or email company files to personal accounts.'
          },
          {
            title: 'Interim Career Disruption',
            explanation: 'A delayed relieving letter can disrupt onboarding at the new organization.'
          }
        ],
        simpleTakeaway:
          'Serve contractual notice or offer notice buyout in writing. Return all company assets against written sign-off and never copy internal documents.',
        simpleTakeawayHi:
          'अनुबंध के अनुसार नोटिस दें या नोटिस बायआउट का लिखित प्रस्ताव दें। कंपनी की सभी सामग्री लिखित पावती के साथ लौटाएं और आंतरिक फाइलें कभी कॉपी न करें।'
      },
      ownerPerspective: {
        roleDescription: 'Owner (Employer / Business Firm)',
        advantages: [
          {
            title: 'Protection of Legitimate Trade Secrets & IP',
            explanation: 'Full right to enforce non-solicitation of clients, non-poaching of staff, and absolute confidentiality of proprietary IP.'
          },
          {
            title: 'Deduction for Unserved Notice Days',
            explanation: 'Lawful right to deduct notice pay from final settlement if employee absconds without handover.'
          }
        ],
        disadvantages: [
          {
            title: 'Non-Compete Lawsuits Invariably Fail',
            explanation: 'Indian courts routinely dismiss suits seeking to stop ex-employees from working for competitors, often imposing legal costs on employers.'
          },
          {
            title: 'Labor Commissioner Complaints',
            explanation: 'Withholding relieving letters or earned wages frequently triggers adverse labor department citations.'
          }
        ],
        simpleTakeaway:
          'Focus enforcement strictly on client non-solicitation and proprietary trade secrets rather than attempting to enforce broad non-compete bans.',
        simpleTakeawayHi:
          'कर्मचारी को नई नौकरी करने से रोकने के बजाय केवल ग्राहक डेटा और गुप्त व्यावसायिक जानकारी की सुरक्षा पर ध्यान दें।'
      },
      whatWillImprove: {
        strategicImprovements: [
          {
            area: 'Asset Clearance Audit',
            action: 'Execute a comprehensive IT asset and NDA re-affirmation checklist prior to the last working day.',
            whyItHelps: 'Eliminates employer justification for stalling full-and-final settlement.'
          },
          {
            area: 'Statutory Notice Reference',
            action: 'Explicitly cite Section 27 of the Indian Contract Act 1872 in the reply to any legal notice.',
            whyItHelps: 'Demonstrates immediate awareness of Supreme Court precedent, deterring frivolous injunction filings.'
          },
          {
            area: 'Mutual Release Agreement',
            action: 'Draft a short bilateral mutual release confirming neither party has further claims.',
            whyItHelps: 'Provides clean closure without ongoing litigation overhang.'
          }
        ],
        recommendedEvidence: [
          { item: 'Employment Contract & Offer Letter', purpose: 'Confirms notice period and termination clauses', urgency: 'HIGH' },
          { item: 'Formal Resignation Email & Acknowledgment', purpose: 'Proves date of communication and notice period start', urgency: 'HIGH' },
          { item: 'IT & Hardware Return Receipt', purpose: 'Proves complete surrender of company data and assets', urgency: 'HIGH' },
          { item: 'Monthly Payslips & Form 16 / PF Passbook', purpose: 'Confirms salary history and statutory deduction entitlements', urgency: 'MEDIUM' }
        ],
        strongerRevisedArgumentEn:
          'Under Section 27 of the Indian Contract Act 1872 and the Supreme Court rulings in Percept D\'Mark (2006) 4 SCC 227 and Superintendence Company (1980) 1 SCC 266, post-termination non-compete covenants are void and unenforceable in India. Having served the full contractual notice period and returned all proprietary assets on [Date], the claimant is entitled to the unconditional release of the relieving letter and settlement dues within 7 days.',
        strongerRevisedArgumentHi:
          'भारतीय अनुबंध अधिनियम 1872 की धारा 27 तथा सर्वोच्च न्यायालय के मिसाली फैसलों के तहत, सेवा समाप्ति के बाद गैर-प्रतिस्पर्धा की शर्तें पूर्णतः शून्य एवं निष्प्रभावी हैं। नोटिस अवधि पूर्ण करने और समस्त सामग्री लौटाने के पश्चात, 7 दिनों में रिलीविंग लेटर एवं बकाया वेतन पाना विधिक अधिकार है।',
        keyCounterArgumentsToPrepare: [
          'Counter: "The employee signed an employment bond agreeing not to leave for 2 years." -> Answer: Employment bonds are only enforceable to the extent of actual, verifiable training expenses incurred by employer, not as penalty.',
          'Counter: "The employee possesses confidential trade secrets." -> Answer: Reaffirm adherence to NDA and demand employer prove any actual leak or misappropriation.'
        ]
      },
      disclaimer: ARGUMENT_DISCLAIMER
    }
  }

  // 4. Property Sale / Bayana / Advance Forfeiture
  if (
    lower.includes('bayana') ||
    lower.includes('token') ||
    lower.includes('earnest') ||
    lower.includes('sale deed') ||
    lower.includes('registry') ||
    lower.includes('possession') ||
    lower.includes('buyer') ||
    lower.includes('seller') ||
    lower.includes('rera')
  ) {
    return {
      title: 'Real Estate Advance & Bayana Forfeiture Dispute',
      summary:
        'Dispute over the proposed or executed forfeiture of earnest money (bayana) in an agreement to sell immovable property following delay in bank loan sanction or title verification.',
      summaryHi:
        'अचल संपत्ति के बिक्री अनुबंध में बयाना (अग्रिम राशि) को जब्त करने को लेकर विवाद। मुख्य मुद्दा बैंक लोन या रजिस्ट्री में देरी के चलते अग्रिम राशि की जब्ती की वैधता है।',
      viabilityScore: 78,
      riskLevel: 'MEDIUM',
      advantages: [
        {
          point: 'Section 74 Contract Act Limit on Forfeiture',
          detail: 'Under Kailash Nath Associates v. DDA (2015) 4 SCC 136, earnest money cannot be arbitrarily forfeited unless the seller proves actual, tangible financial loss.'
        },
        {
          point: 'Time is Rarely of the Essence in Real Estate',
          detail: 'The Supreme Court has consistently held that in sale of immovable property, time is not automatically of the essence unless expressly warranted and proven.'
        },
        {
          point: 'Specific Performance Right',
          detail: 'Under the amended Specific Relief Act 2018, courts generally grant specific performance directing completion of sale rather than permitting unilateral forfeiture.'
        }
      ],
      disadvantages: [
        {
          point: 'Clear Buyer Delay Grounds',
          detail: 'If the seller repeatedly called upon the buyer to register the deed and the buyer failed to arrange funds, forfeiture of a reasonable token may be sustained.'
        },
        {
          point: 'Opportunity Cost & Price Fluctuations',
          detail: 'Sellers can demonstrate real damages if property market rates depreciated while property was locked.'
        },
        {
          point: 'Unregistered Agreement Limitations',
          detail: 'Under Section 17(1A) of the Registration Act, an unregistered agreement to sell cannot be used to defend possession.'
        }
      ],
      clientPerspective: {
        roleDescription: 'Client (Buyer / Purchaser)',
        advantages: [
          {
            title: 'Right to Recover Forfeited Advance',
            explanation: 'Sellers cannot pocket 10-20% of property cost without showing real market losses.'
          },
          {
            title: 'Right to Seek Court Injunction Against Third-Party Sale',
            explanation: 'Can file a lis pendens suit under Specific Relief Act preventing the seller from selling the property to another buyer.'
          }
        ],
        disadvantages: [
          {
            title: 'Financial Capital Lock-in',
            explanation: 'The advance payment remains tied up during dispute litigation unless resolved amicably.',
            riskNote: 'Litigation may take 12-24 months in District Court.'
          },
          {
            title: 'Need to Prove Readiness and Willingness',
            explanation: 'The buyer must prove in court that they had bank loan sanction or cash ready to pay balance amount.'
          }
        ],
        simpleTakeaway:
          'Issue a legal notice showing proof of loan sanction or fund availability, offering to execute the sale deed within 15 days, or demanding immediate refund.',
        simpleTakeawayHi:
          'बैंक लोन या फंड्स की उपलब्धता का प्रमाण दिखाते हुए 15 दिनों में रजिस्ट्री कराने अथवा अग्रिम राशि ब्याज सहित लौटाने का कानूनी नोटिस भेजें।'
      },
      ownerPerspective: {
        roleDescription: 'Owner (Seller / Property Developer)',
        advantages: [
          {
            title: 'Right to Sell to Alternative Ready Buyers',
            explanation: 'Once valid default is recorded, the seller can issue a final cure deadline and proceed to sell to new purchasers.'
          },
          {
            title: 'Retention of Nominal Earnest Deposit',
            explanation: 'Can retain customary nominal token money (typically 1-5%) for genuine holding costs and administrative expenses.'
          }
        ],
        disadvantages: [
          {
            title: 'Title Cloud and Lis Pendens Risk',
            explanation: 'If the buyer files a specific performance suit, the property gets encumbered and cannot be sold or mortgaged.'
          },
          {
            title: 'Duty to Prove Clear Marketable Title',
            explanation: 'The seller cannot forfeit bayana if chain documents, encumbrance certificates, or mutation were incomplete.'
          }
        ],
        simpleTakeaway:
          'Never forfeit advance money without sending a final 15-day notice with full title documents and offering an appointment at the Sub-Registrar office.',
        simpleTakeawayHi:
          'सब-रजिस्ट्रार कार्यालय में उपस्थित होने का 15 दिन का अंतिम नोटिस दिए बिना अग्रिम राशि कभी भी एकतरफा जब्त न करें।'
      },
      whatWillImprove: {
        strategicImprovements: [
          {
            area: 'Proof of Readiness & Willingness (Section 16c)',
            action: 'Produce bank statement, sanction letter, or fixed deposit receipts proving buyer had funds to pay balance consideration.',
            whyItHelps: 'Essential mandatory condition to win any real estate dispute in Indian courts.'
          },
          {
            area: 'Sub-Registrar Attendance Slip',
            action: 'Obtain an official receipt/slip from the Sub-Registrar office proving attendance on the scheduled date.',
            whyItHelps: 'Irrefutable official evidence proving which party was present and ready to execute the deed.'
          },
          {
            area: 'Title Search Audit',
            action: 'Commission an advocate title search report spanning 30 years to check for encumbrances.',
            whyItHelps: 'Reveals whether seller had marketable title before claiming buyer was in default.'
          }
        ],
        recommendedEvidence: [
          { item: 'Agreement to Sell / Bayana Receipt', purpose: 'Establishes consideration amount, milestones, and dates', urgency: 'HIGH' },
          { item: 'Bank Loan Sanction Letter / Balance Proof', purpose: 'Proves readiness and willingness to pay balance', urgency: 'HIGH' },
          { item: 'Sub-Registrar Attendance Receipt', purpose: 'Proves presence on closing date at the registrar office', urgency: 'HIGH' },
          { item: '30-Year Title Search / Encumbrance Certificate (Form 15/16)', purpose: 'Confirms marketable title status', urgency: 'MEDIUM' }
        ],
        strongerRevisedArgumentEn:
          'Under the Supreme Court doctrine established in Kailash Nath Associates v. DDA (2015) 4 SCC 136 and Section 74 of the Indian Contract Act 1872, earnest money cannot be forfeited without proving actual damage. The purchaser having secured bank loan approval on [Date] and demonstrated continuous readiness under Section 16(c) of the Specific Relief Act, the seller’s unilateral forfeiture is void, and the purchaser is entitled to completion of the sale deed or refund with 12% interest.',
        strongerRevisedArgumentHi:
          'सर्वोच्च न्यायालय के कैलाश नाथ फैसले एवं अनुबंध अधिनियम की धारा 74 के तहत, बिना वास्तविक नुकसान सिद्ध किए बयाना जब्त नहीं किया जा सकता। क्रेता द्वारा लोन स्वीकृति एवं भुगतान की तत्परता सिद्ध किए जाने के कारण एकतरफा जब्ती अवैध है तथा क्रेता रजिस्ट्री अथवा 12% ब्याज सहित राशि वापसी का पूर्ण हकदार है।',
        keyCounterArgumentsToPrepare: [
          'Counter: "The contract clearly had a clause allowing 100% forfeiture if registry delayed." -> Answer: Contractual forfeiture clauses are governed by Section 74, which permits only reasonable compensation, not penal windfalls.',
          'Counter: "Time was strictly of the essence." -> Answer: In real estate sales, time is not of the essence unless specific clear intention and conduct demonstrate it.'
        ]
      },
      disclaimer: ARGUMENT_DISCLAIMER
    }
  }

  // 5. General Commercial & Civil Argument Dynamic Generator
  return {
    title: 'Commercial Dispute & Contractual Stance Evaluation',
    summary: `Strategic legal analysis of the argument: "${argument.slice(0, 140)}...". Evaluates reciprocal obligations, evidentiary burdens, and practical settlement posture under civil dispute jurisprudence.`,
    summaryHi:
      'प्रस्तुत विधिक तर्क और अनुबंध संबंधी स्थिति का रणनीतिक विश्लेषण। दोनों पक्षों के अधिकारों, साक्ष्य संबंधी दायित्वों और समाधान के व्यवहार्य विकल्पों का मूल्यांकन।',
    viabilityScore: 72,
    riskLevel: 'MEDIUM',
    advantages: [
      {
        point: 'Assertive Position on Contractual Performance',
        detail: 'The argument clearly defines the grievance and highlights the counterparty\'s failure to fulfill agreed commitments.'
      },
      {
        point: 'Clear Basis for Monetary or Injunctive Relief',
        detail: 'Grounds exist under the Indian Contract Act for seeking restitution, compensation, or enforcement of rights.'
      },
      {
        point: 'Strong Leverage for Pre-Litigation Mediation',
        detail: 'A well-reasoned argument provides solid leverage to negotiate an out-of-court settlement before incurring courtroom costs.'
      }
    ],
    disadvantages: [
      {
        point: 'Evidentiary Documentation Burden',
        detail: 'The asserting party carries the initial burden of proof (Section 101 Evidence Act) to demonstrate breach with contemporaneous documentation.'
      },
      {
        point: 'Potential Procedural Defects',
        detail: 'If statutory notices or dispute resolution escalation clauses (negotiation, mediation) were bypassed, the other side will seek dismissal.'
      },
      {
        point: 'Litigation Expense vs Recovery Ratio',
        detail: 'Court fee requirements, counsel retainers, and multi-year hearing cycles must be balanced against the actual recoverable claim value.'
      }
    ],
    clientPerspective: {
      roleDescription: 'Client (Claimant / Consumer / Aggrieved Party)',
      advantages: [
        {
          title: 'Direct Recourse to Consumer or Civil Remedies',
          explanation: 'Can seek compensatory damages, refund, and litigation costs for verified financial injury.'
        },
        {
          title: 'Protection from Unfair One-Sided Terms',
          explanation: 'Courts frequently strike down or ignore unconscionable clauses imposed by dominant counterparties.'
        }
      ],
      disadvantages: [
        {
          title: 'Time and Court Backlog Friction',
          explanation: 'Legal proceedings require patience and periodic court appearances unless resolved through early settlement.',
          riskNote: 'Prepare for mediation before formal trial.'
        },
        {
          title: 'Risk of Counter-Claims',
          explanation: 'The opposing party may retaliate by alleging performance defects or delay.'
        }
      ],
      simpleTakeaway:
        'Organize all written communications and contracts into a chronological dossier before serving a formal legal notice.',
      simpleTakeawayHi:
        'कानूनी नोटिस भेजने से पहले अपने सभी अनुबंधों और ईमेल/संदेशों को तारीखवार फाइल में व्यवस्थित करें।'
    },
    ownerPerspective: {
      roleDescription: 'Owner (Enterprise / Institution / Counterparty)',
      advantages: [
        {
          title: 'Standard Terms & Limitation of Liability Safeguards',
          explanation: 'Commercial contracts typically contain limitation of liability and force majeure clauses protecting the owner.'
        },
        {
          title: 'Negotiation & Arbitration Clout',
          explanation: 'Can enforce mandatory arbitration clauses to keep dispute details confidential and away from public court registers.'
        }
      ],
      disadvantages: [
        {
          title: 'Reputational and Operational Drag',
          explanation: 'Public disputes or consumer forum filings can tarnish brand credibility and customer trust.'
        },
        {
          title: 'Statutory Penalty Exposure',
          explanation: 'Deficiencies in service or statutory non-compliance can trigger punitive damages.'
        }
      ],
      simpleTakeaway:
        'Audit the dispute against contractual warranties and propose a confidential commercial settlement if exposure exceeds legal defense costs.',
      simpleTakeawayHi:
        'विवाद का अनुबंध की शर्तों के अनुसार ऑडिट करें और यदि अदालती खर्च अधिक हो तो गोपनीय समझौते का विकल्प चुनें।'
    },
    whatWillImprove: {
      strategicImprovements: [
        {
          area: 'Notice Compliance & Cure Period',
          action: 'Ensure formal written notice of dispute was delivered providing a 15-day or 30-day cure period.',
          whyItHelps: 'Prevents procedural objections under contract dispute clauses.'
        },
        {
          area: 'Quantification of Damages',
          action: 'Provide exact mathematical breakdown of direct damages supported by third-party invoices or loss calculations.',
          whyItHelps: 'Transforms vague claims into legally actionable and recoverable liquidated sums.'
        },
        {
          area: 'Bilateral Pre-Mediation Offer',
          action: 'Propose a structured mediation meeting before filing in court.',
          whyItHelps: 'Complies with mandatory pre-institution mediation under Commercial Courts Act 2015.'
        }
      ],
      recommendedEvidence: [
        { item: 'Signed Agreement or Purchase Order', purpose: 'Establishes binding contractual relationship', urgency: 'HIGH' },
        { item: 'Written Communications (Emails, Notices, Letters)', purpose: 'Documents contemporaneous timeline of default and reminders', urgency: 'HIGH' },
        { item: 'Proof of Payment & Financial Accounts', purpose: 'Substantiates actual monetary consideration exchanged', urgency: 'HIGH' },
        { item: 'Loss Assessment or Repair Invoices', purpose: 'Justifies quantum of damages sought', urgency: 'MEDIUM' }
      ],
      strongerRevisedArgumentEn:
        'Pursuant to the covenants agreed between the parties and established principles under the Indian Contract Act 1872, the claimant fully discharged all prerequisite obligations. The counterparty having failed to cure the documented default despite formal written notice dated [Date], the claimant is legally entitled to full restitution of INR [Amount] along with statutory interest and costs, without prejudice to other remedies.',
        strongerRevisedArgumentHi:
          'पक्षों के बीच सहमति की शर्तों एवं भारतीय अनुबंध अधिनियम 1872 के सिद्धांतों के अनुसार, दावेदार ने अपने सभी दायित्वों का निर्वहन किया है। लिखित नोटिस के बावजूद कमी को दूर न किए जाने के कारण, दावेदार बकाया राशि मय ब्याज एवं विधिक व्यय पाने का पूर्ण अधिकारी है।',
      keyCounterArgumentsToPrepare: [
        'Counter: "The dispute is premature and requires private arbitration." -> Answer: Agree to refer to sole arbitrator under Section 11 of Arbitration Act while seeking interim protection under Section 9.',
        'Counter: "The claimant failed to mitigate losses." -> Answer: Produce proof of immediate remedial steps taken to minimize damage.'
      ]
    },
    disclaimer: ARGUMENT_DISCLAIMER
  }
}

