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
