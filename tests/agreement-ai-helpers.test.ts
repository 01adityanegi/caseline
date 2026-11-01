import test from 'node:test'
import assert from 'node:assert/strict'
import { aiExplainLegalTerm, aiImproveClause } from '../lib/agreement/ai'

test('AI Legal Helpers - aiExplainLegalTerm returns bilingual explanation', async () => {
  const result = await aiExplainLegalTerm('Indemnity')
  assert.ok(result.term, 'Must have term')
  assert.ok(result.termHi, 'Must have Hindi term')
  assert.ok(result.plainEnglish, 'Must have plain English')
  assert.ok(result.plainHindi, 'Must have plain Hindi in Devanagari')
  assert.match(result.termHi, /[\u0900-\u097F]/, 'Hindi term must contain Devanagari characters')
  assert.match(result.plainHindi, /[\u0900-\u097F]/, 'Hindi explanation must contain Devanagari characters')
})

test('AI Legal Helpers - aiImproveClause identifies ambiguities and provides rewrite', async () => {
  const vagueClause = 'The security deposit shall be returned in due course upon reasonable notice after the tenant vacates.'
  const result = await aiImproveClause(vagueClause)
  assert.ok(Array.isArray(result.ambiguitiesFound), 'Must list ambiguities')
  assert.ok(result.ambiguitiesFound.length > 0, 'Must detect at least 1 ambiguity in vague clause')
  assert.ok(result.improvedEn, 'Must have improved English clause')
  assert.ok(result.improvedHi, 'Must have improved Hindi clause')
  assert.match(result.improvedHi, /[\u0900-\u097F]/, 'Improved Hindi clause must contain Devanagari characters')
})
