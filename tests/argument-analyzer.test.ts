import test from 'node:test'
import assert from 'node:assert/strict'
import { aiAnalyzeArgument } from '../lib/ai/service'

test('AI Argument Analyzer - Evaluates Tenancy Lease Argument from Client and Owner Views', async () => {
  const argument =
    'The landlord locked our shop after rent was 10 days late, but the lease requires 30 days written cure notice before taking possession.'
  const result = await aiAnalyzeArgument({
    argument,
    role: 'BOTH',
    context: 'Transfer of Property Act 1882'
  })

  // Basic structure
  assert.ok(result.title, 'Must have title')
  assert.ok(result.summary, 'Must have summary')
  assert.ok(result.viabilityScore >= 0 && result.viabilityScore <= 100, 'Score between 0 and 100')
  assert.ok(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].includes(result.riskLevel), 'Valid risk level')

  // Advantages and Disadvantages
  assert.ok(Array.isArray(result.advantages) && result.advantages.length > 0, 'Must have advantages')
  assert.ok(Array.isArray(result.disadvantages) && result.disadvantages.length > 0, 'Must have disadvantages')
  assert.ok(result.advantages[0].point && result.advantages[0].detail, 'Advantage must have point and detail')
  assert.ok(result.disadvantages[0].point && result.disadvantages[0].detail, 'Disadvantage must have point and detail')

  // Client perspective
  assert.ok(result.clientPerspective, 'Must have client perspective')
  assert.ok(result.clientPerspective.advantages.length > 0, 'Client must have advantages')
  assert.ok(result.clientPerspective.disadvantages.length > 0, 'Client must have disadvantages/risks')
  assert.ok(result.clientPerspective.simpleTakeaway, 'Client must have simple takeaway')

  // Owner perspective
  assert.ok(result.ownerPerspective, 'Must have owner perspective')
  assert.ok(result.ownerPerspective.advantages.length > 0, 'Owner must have advantages')
  assert.ok(result.ownerPerspective.disadvantages.length > 0, 'Owner must have disadvantages/risks')
  assert.ok(result.ownerPerspective.simpleTakeaway, 'Owner must have simple takeaway')

  // What will improve
  assert.ok(result.whatWillImprove, 'Must have whatWillImprove')
  assert.ok(result.whatWillImprove.strategicImprovements.length > 0, 'Must have strategic improvements')
  assert.ok(result.whatWillImprove.recommendedEvidence.length > 0, 'Must have recommended evidence')
  assert.ok(result.whatWillImprove.strongerRevisedArgumentEn, 'Must have stronger revised argument')
})

test('AI Argument Analyzer - Evaluates Software Milestone Payment Dispute', async () => {
  const argument =
    'The client deployed our software code to production but is withholding the final milestone payment of 40% citing minor UI bugs.'
  const result = await aiAnalyzeArgument({ argument })

  assert.ok(result.title.toLowerCase().includes('deliverable') || result.title.toLowerCase().includes('payment'), 'Title matches context')
  assert.ok(result.whatWillImprove.strategicImprovements.length >= 2, 'Has actionable improvement points')
  assert.ok(result.whatWillImprove.recommendedEvidence.some(e => e.item.toLowerCase().includes('agreement') || e.item.toLowerCase().includes('sow')), 'Recommends contract evidence')
})

test('AI Argument Analyzer - Handles General Custom Arguments Gracefully', async () => {
  const customArgument =
    'Party A claims breach of confidential non-disclosure clause following an industry conference conversation.'
  const result = await aiAnalyzeArgument({ argument: customArgument })

  assert.ok(result.title, 'Has a title')
  assert.ok(result.advantages.length > 0, 'Has general advantages')
  assert.ok(result.disadvantages.length > 0, 'Has general disadvantages')
  assert.ok(result.clientPerspective.simpleTakeaway, 'Has client takeaway')
  assert.ok(result.ownerPerspective.simpleTakeaway, 'Has owner takeaway')
  assert.ok(result.whatWillImprove.strongerRevisedArgumentEn, 'Has reformed argument')
})

test('AI Document Inspector - Audits Lease Agreement Document and Detects Unlawful Lockout Clause', async () => {
  const { aiInspectDocumentAgreement } = await import('../lib/ai/service')

  const documentSnippet =
    'Residential Lease Agreement executed on 01 Dec 2026. Clause 8: In case rent is delayed by 7 days, the Landlord shall immediately padlock the premises and disconnect electricity without court order.'
  
  const result = await aiInspectDocumentAgreement({
    fileName: 'Lease_Agreement_Padlock_Clause.pdf',
    fileType: 'application/pdf',
    extractedText: documentSnippet,
    userRole: 'BOTH',
  })

  // Verdict check (Right or Wrong)
  assert.equal(result.verdict, 'WRONG', 'Must identify illegal lockout clause as WRONG/unlawful')
  assert.ok(result.verdictBadge.includes('WRONG'), 'Verdict badge highlights illegality')
  assert.ok(result.statutoryValidityScore < 50, 'Validity score reflects severe flaw')
  assert.ok(result.statutoryGrounds.includes('Transfer of Property Act'), 'Cites Transfer of Property Act')

  // Why right or wrong statutory audit
  assert.ok(Array.isArray(result.whyRightOrWrong) && result.whyRightOrWrong.length > 0, 'Contains statutory audit points')
  assert.ok(result.whyRightOrWrong.some(item => item.status === 'FAIL'), 'Contains FAIL statutory points')

  // Client and Owner Advantages / Disadvantages
  assert.ok(result.clientPerspective.advantages.length > 0, 'Client has advantages')
  assert.ok(result.clientPerspective.disadvantages.length > 0, 'Client has disadvantages')
  assert.ok(result.ownerPerspective.advantages.length > 0, 'Owner has advantages')
  assert.ok(result.ownerPerspective.disadvantages.length > 0, 'Owner has disadvantages')

  // Suggestions to improve
  assert.ok(result.suggestionsToImprove.recommendedChanges.length > 0, 'Has redline suggestions')
  assert.ok(result.suggestionsToImprove.watertightRevisedAgreementEn.length > 50, 'Has watertight revised draft')

  // Extracted template metadata
  assert.ok(result.extractedTemplate.suggestedTitle, 'Has extracted template title')
  assert.ok(result.extractedTemplate.category === 'Rental & Property', 'Classified in Rental & Property')
  assert.ok(result.extractedTemplate.clauses.length >= 3, 'Extracts structured clauses')
})

test('AI Document Inspector - Audits Employment Non-Compete and Flags Section 27 Restraint of Trade', async () => {
  const { aiInspectDocumentAgreement } = await import('../lib/ai/service')

  const nonCompeteSnippet =
    'Employment Agreement and Covenant. Employee shall not work for any competitor in India for 2 years post-resignation or termination.'

  const result = await aiInspectDocumentAgreement({
    fileName: 'Employee_Non_Compete_Covenant.png',
    fileType: 'image/png',
    extractedText: nonCompeteSnippet,
    userRole: 'LAWYER',
  })

  assert.equal(result.verdict, 'WRONG', 'Section 27 non-compete is void/wrong')
  assert.ok(result.statutoryGrounds.includes('Section 27'), 'Explicitly cites Section 27')
  assert.ok(result.suggestionsToImprove.recommendedChanges.some(c => c.clauseName.toLowerCase().includes('compete')), 'Provides non-compete redline')
  assert.ok(result.extractedTemplate.suggestedTitle.toLowerCase().includes('confidentiality') || result.extractedTemplate.suggestedTitle.toLowerCase().includes('employment'), 'Generates compliant template')
})


