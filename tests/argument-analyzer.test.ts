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
