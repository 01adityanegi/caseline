import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { amountToWordsEn, amountToWordsHi } from '../lib/agreement/amount-to-words'
import { transliterateToDevanagari, LEGAL_GLOSSARY } from '../lib/agreement/glossary'
import { compileAgreement } from '../lib/agreement/engine'
import { residentialRentTemplate } from '../templates/rental-property'
import { ClauseBlock } from '../templates/types'

describe('CaseLine Agreement Engine Unit Tests', () => {
  test('amountToWordsEn converts Indian numbering format correctly', () => {
    assert.equal(
      amountToWordsEn(28000),
      'Rupees Twenty Eight Thousand Only'
    )
    assert.equal(
      amountToWordsEn(150000),
      'Rupees One Lakh Fifty Thousand Only'
    )
    assert.equal(
      amountToWordsEn(12500000),
      'Rupees One Crore Twenty Five Lakh Only'
    )
    assert.equal(
      amountToWordsEn(0),
      'Rupees Zero Only'
    )
  })

  test('amountToWordsHi converts Indian currency to formal Hindi in Devanagari', () => {
    const res28k = amountToWordsHi(28000)
    assert.match(res28k, /अट्ठाइस हज़ार/)
    assert.match(res28k, /रुपये मात्र/)

    const res1Lakh = amountToWordsHi(100000)
    assert.match(res1Lakh, /एक लाख/)
    assert.match(res1Lakh, /रुपये मात्र/)

    const res1Crore = amountToWordsHi(10000000)
    assert.match(res1Crore, /एक करोड़/)
    assert.match(res1Crore, /रुपये मात्र/)
  })

  test('Devanagari transliteration transforms English phonetics', () => {
    const hindiRajesh = transliterateToDevanagari('Rajesh Sharma')
    assert.ok(hindiRajesh.length > 0)
    assert.match(hindiRajesh, /[\u0900-\u097F]/) // Contains Devanagari Unicode characters

    const hindiRahul = transliterateToDevanagari('Rahul Verma')
    assert.ok(hindiRahul.length > 0)
    assert.match(hindiRahul, /[\u0900-\u097F]/)
  })

  test('Legal glossary contains critical Indian statutory terms', () => {
    assert.ok(LEGAL_GLOSSARY['landlord'])
    assert.equal(LEGAL_GLOSSARY['landlord'].hi, 'मकान मालिक / पट्टादाता')
    assert.equal(LEGAL_GLOSSARY['tenant'].hi, 'किरायेदार / पट्टेदार')
    assert.equal(LEGAL_GLOSSARY['security deposit'].hi, 'प्रतिभूति राशि / जमानत राशि')
    assert.equal(LEGAL_GLOSSARY['arbitration'].hi, 'मध्यस्थता')
  })

  test('compileAgreement fills placeholders and computes words and dates', () => {
    const sampleData = {
      landlordName: 'Vikram Mehta',
      tenantName: 'Sanjay Gupta',
      propertyAddress: 'A-204, Green Glen Layout, Bellandur, Bengaluru',
      monthlyRent: 35000,
      securityDeposit: 150000,
      durationMonths: 11,
      startDate: '2026-11-01',
      city: 'Bengaluru',
      state: 'Karnataka'
    }

    const compiled = compileAgreement(residentialRentTemplate, sampleData)

    assert.ok(compiled.fullEn.includes('Vikram Mehta'))
    assert.ok(compiled.fullEn.includes('Sanjay Gupta'))
    assert.ok(compiled.fullEn.includes('35,000'))
    assert.ok(compiled.fullEn.includes('Rupees Thirty Five Thousand Only'))
    assert.ok(compiled.fullEn.includes('Rupees One Lakh Fifty Thousand Only'))
    assert.ok(compiled.fullEn.includes('1st day of November, 2026'))

    // Verify Hindi output
    assert.ok(compiled.fullHi.includes('35,000'))
    assert.match(compiled.fullHi, /रुपये मात्र/)
    assert.ok(compiled.fullHi.includes('1 नवंबर, 2026'))
  })

  test('conditional clauses respect conditionField', () => {
    const optionalPetClause: ClauseBlock = {
      id: 'opt_pet_policy',
      titleEn: 'Pet Policy Clause',
      titleHi: 'पालतू पशु नीति',
      textEn: 'The tenant is authorized to keep domestic pets.',
      textHi: 'किरायेदार को घरेलू पालतू पशु रखने की अनुमति है।',
      isOptional: true,
      conditionField: 'allowPets'
    }

    const withPets = compileAgreement(
      residentialRentTemplate,
      { ...residentialRentTemplate.sampleData, allowPets: true },
      [optionalPetClause]
    )
    const withoutPets = compileAgreement(
      residentialRentTemplate,
      { ...residentialRentTemplate.sampleData, allowPets: false },
      [optionalPetClause]
    )

    const hasPetWhenTrue = withPets.clausesEn.some(c => c.title.includes('Pet Policy'))
    const hasPetWhenFalse = withoutPets.clausesEn.some(c => c.title.includes('Pet Policy'))

    assert.equal(hasPetWhenTrue, true)
    assert.equal(hasPetWhenFalse, false)
  })
})
