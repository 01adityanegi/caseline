import { PrismaClient } from '@prisma/client'
import { ALL_TEMPLATES } from '../templates'
import { compileAgreement } from '../lib/agreement/engine'

const prisma = new PrismaClient()

async function seedAgreements() {
  console.log('Seeding AgreementStudio templates and sample agreements...')

  // Get or verify organization
  let org = await prisma.organization.findFirst()
  if (!org) {
    org = await prisma.organization.create({
      data: {
        id: 'org-sharma-associates',
        name: 'Sharma & Mehta Associates',
        slug: 'sharma-mehta',
      },
    })
  }

  // 1. Seed All 15 Templates
  for (const t of ALL_TEMPLATES) {
    await prisma.agreementTemplate.upsert({
      where: { code: t.code },
      update: {
        titleEn: t.titleEn,
        titleHi: t.titleHi,
        descriptionEn: t.descriptionEn,
        descriptionHi: t.descriptionHi,
        category: t.category,
        estimatedMinutes: t.estimatedMinutes,
        languages: JSON.stringify(t.languages),
        iconName: t.iconName,
        formSchema: JSON.stringify(t.fields),
        clausesSchema: JSON.stringify(t.clauses),
      },
      create: {
        code: t.code,
        titleEn: t.titleEn,
        titleHi: t.titleHi,
        descriptionEn: t.descriptionEn,
        descriptionHi: t.descriptionHi,
        category: t.category,
        estimatedMinutes: t.estimatedMinutes,
        languages: JSON.stringify(t.languages),
        iconName: t.iconName,
        formSchema: JSON.stringify(t.fields),
        clausesSchema: JSON.stringify(t.clauses),
      },
    })
  }
  console.log(`Successfully seeded ${ALL_TEMPLATES.length} AgreementTemplates.`)

  // 2. Seed Clause Library
  const clauseItems = [
    {
      code: 'dispute_arbitration_delhi',
      category: 'Dispute Resolution',
      titleEn: 'Arbitration and Conciliation (New Delhi Seat)',
      titleHi: 'मध्यस्थता एवं सुलह (नई दिल्ली सीट)',
      textEn: 'Any dispute or difference arising out of or in connection with this agreement shall be settled through arbitration under the Arbitration and Conciliation Act, 1996 by a sole arbitrator mutually agreed upon. The seat and venue of arbitration shall be New Delhi, India.',
      textHi: 'इस अनुबंध से उत्पन्न या संबंधित किसी भी विवाद का निपटारा मध्यस्थता एवं सुलह अधिनियम, 1996 के तहत पारस्परिक सहमति से नियुक्त एकल मध्यस्थ द्वारा किया जाएगा। मध्यस्थता का स्थान नई दिल्ली, भारत होगा।',
      explanationEn: 'Fast-tracks dispute resolution outside backlogged civil courts with a neutral expert.',
      explanationHi: 'अदालतों के चक्कर से बचाते हुए निष्पक्ष मध्यस्थ द्वारा त्वरित न्याय सुनिश्चित करता है।'
    },
    {
      code: 'force_majeure_standard',
      category: 'General Safeguards',
      titleEn: 'Force Majeure & Pandemic Exemptions',
      titleHi: 'अपरिहार्य घटना एवं महामारी छूट',
      textEn: 'Neither party shall be liable for any failure or delay in performance caused by circumstances beyond reasonable control, including acts of God, flood, earthquake, governmental pandemic restrictions, or civil unrest.',
      textHi: 'प्राकृतिक आपदा, बाढ़, भूकंप, महामारी संबंधी सरकारी प्रतिबंध अथवा अप्रत्याशित परिस्थितियों के कारण दायित्व निर्वहन न होने पर कोई भी पक्ष हर्जाने का उत्तरदायी नहीं होगा।',
      explanationEn: 'Excuses performance delay during unforeseeable natural disasters or government lockdowns.',
      explanationHi: 'प्राकृतिक आपदा या लॉकडाउन के दौरान कानूनी जुर्माने से सुरक्षा प्रदान करता है।'
    },
    {
      code: 'stamp_duty_apportionment',
      category: 'Compliance',
      titleEn: 'Stamp Duty and Registration Costs',
      titleHi: 'स्टाम्प शुल्क एवं पंजीकरण व्यय',
      textEn: 'The applicable stamp duty, e-stamping charges, and statutory sub-registrar registration fees shall be shared equally between the parties, unless otherwise agreed in writing.',
      textHi: 'लागू स्टाम्प शुल्क, ई-स्टाम्पिंग व्यय एवं सब-रजिस्ट्रार पंजीकरण शुल्क दोनों पक्षों द्वारा समान रूप से वहन किया जाएगा, जब तक कि अन्यथा लिखित सहमति न हो।',
      explanationEn: 'Clarifies expense splitting for e-stamping and sub-registrar legal fees.',
      explanationHi: 'स्टाम्प पेपर और सरकारी पंजीकरण के खर्चों का स्पष्ट बंटवारा करता है।'
    }
  ]

  for (const item of clauseItems) {
    await prisma.clauseLibraryItem.upsert({
      where: { code: item.code },
      update: item,
      create: item
    })
  }
  console.log(`Seeded ${clauseItems.length} ClauseLibraryItems.`)

  // 3. Seed 3 High-Fidelity Completed/Active Agreements
  const tRent = ALL_TEMPLATES.find(t => t.code === 'rent_residential')!
  const compiledRent = compileAgreement(tRent, tRent.sampleData)

  const rentAgr = await prisma.agreement.upsert({
    where: { agreementNumber: 'AGR-202611-0001' },
    update: {},
    create: {
      agreementNumber: 'AGR-202611-0001',
      templateCode: 'rent_residential',
      title: 'Residential Rent Agreement - Flat 402, Lotus Boulevard, Noida',
      titleHi: 'आवासीय किराया अनुबंध - फ्लैट 402, लोटस बुलेवार्ड, नोएडा',
      category: 'Rental & Property',
      language: 'SIDE_BY_SIDE',
      status: 'COMPLETED',
      state: 'Uttar Pradesh',
      city: 'Noida',
      executionDate: new Date('2026-11-01'),
      effectiveDate: new Date('2026-11-01'),
      expiryDate: new Date('2027-09-30'),
      considerationAmount: 28000,
      formData: JSON.stringify(tRent.sampleData),
      customClauses: JSON.stringify([]),
      compiledEn: compiledRent.fullEn,
      compiledHi: compiledRent.fullHi,
      riskScore: 92,
      riskAnalysis: JSON.stringify({
        fairnessScore: 92,
        riskLevel: 'LOW',
        riskSummary: 'Highly balanced residential agreement compliant with UP Model Tenancy provisions.'
      }),
      caseId: 'case-20',
      clientId: 'client-2',
      organizationId: org.id,
      parties: {
        create: [
          {
            role: 'LANDLORD',
            nameEn: 'Rajesh Sharma',
            nameHi: 'राजेश शर्मा',
            fatherSpouseNameEn: 'Late M.L. Sharma',
            fatherSpouseNameHi: 'स्वर्गीय एम.एल. शर्मा',
            age: 52,
            addressEn: 'B-12, Sector 14, Noida, UP, 201301',
            addressHi: 'बी-12, सेक्टर 14, नोएडा, उत्तर प्रदेश, 201301',
            pan: 'ABCPR1234D',
            aadhaarMasked: 'XXXX-XXXX-8921',
            phone: '+91 98110 44556',
            email: 'rajesh.sharma@example.com',
            isWitness: false,
            signatureStatus: 'SIGNED'
          },
          {
            role: 'TENANT',
            nameEn: 'Rahul Verma',
            nameHi: 'राहुल वर्मा',
            fatherSpouseNameEn: 'S.K. Verma',
            fatherSpouseNameHi: 'एस.के. वर्मा',
            age: 29,
            addressEn: 'Flat 402, Lotus Boulevard, Sector 100, Noida, UP',
            addressHi: 'फ्लैट 402, लोटस बुलेवार्ड, सेक्टर 100, नोएडा',
            pan: 'BKMPV5678K',
            aadhaarMasked: 'XXXX-XXXX-4512',
            phone: '+91 98765 11223',
            email: 'rahul.verma@example.com',
            isWitness: false,
            signatureStatus: 'SIGNED'
          },
          {
            role: 'WITNESS',
            nameEn: 'Amit Saxena',
            nameHi: 'अमित सक्सेना',
            addressEn: 'Noida, Sector 62',
            phone: '+91 98110 99887',
            isWitness: true,
            signatureStatus: 'SIGNED'
          },
          {
            role: 'WITNESS',
            nameEn: 'Pooja Tiwari',
            nameHi: 'पूजा तिवारी',
            addressEn: 'Noida, Sector 44',
            phone: '+91 98110 55443',
            isWitness: true,
            signatureStatus: 'SIGNED'
          }
        ]
      },
      versions: {
        create: [
          {
            versionNumber: 1,
            contentJson: JSON.stringify(tRent.sampleData),
            compiledEn: compiledRent.fullEn,
            compiledHi: compiledRent.fullHi,
            changeSummary: 'Initial generated bilingual draft'
          }
        ]
      }
    }
  })

  // Add signature for Landlord
  const landlordParty = await prisma.agreementParty.findFirst({
    where: { agreementId: rentAgr.id, role: 'LANDLORD' }
  })
  if (landlordParty) {
    await prisma.agreementSignature.create({
      data: {
        agreementId: rentAgr.id,
        partyId: landlordParty.id,
        signerName: 'Rajesh Sharma',
        signatureType: 'TYPED',
        signatureData: 'Rajesh Sharma',
        ipAddress: '103.21.124.5',
        deviceInfo: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'
      }
    })
  }

  // Agreement 2: Freelance Software Engineering & AI Agreement
  const tFreelance = ALL_TEMPLATES.find(t => t.code === 'freelance_service')!
  const compiledFreelance = compileAgreement(tFreelance, tFreelance.sampleData)

  const freelanceCase = await prisma.case.findFirst({ where: { id: 'case-1' } })
  const meridianClient = await prisma.client.findFirst({ where: { id: 'client-1' } })

  await prisma.agreement.upsert({
    where: { agreementNumber: 'AGR-202611-0002' },
    update: {},
    create: {
      agreementNumber: 'AGR-202611-0002',
      templateCode: 'freelance_service',
      title: 'Full-Stack & Generative AI Consulting Agreement',
      titleHi: 'फुल-स्टैक एवं जेनेरेटिव एआई कंसल्टिंग अनुबंध',
      category: 'Business & Work',
      language: 'BOTH_SEQUENTIAL',
      status: 'SIGNING',
      state: 'Karnataka',
      city: 'Bengaluru',
      executionDate: new Date('2026-11-01'),
      effectiveDate: new Date('2026-11-01'),
      expiryDate: new Date('2027-04-30'),
      considerationAmount: 180000,
      formData: JSON.stringify(tFreelance.sampleData),
      customClauses: JSON.stringify([]),
      compiledEn: compiledFreelance.fullEn,
      compiledHi: compiledFreelance.fullHi,
      riskScore: 84,
      caseId: freelanceCase?.id,
      clientId: meridianClient?.id,
      organizationId: org.id,
      parties: {
        create: [
          {
            role: 'CLIENT',
            nameEn: 'Meridian Technologies Pvt. Ltd.',
            nameHi: 'मेरिडियन टेक्नोलॉजीज प्राइवेट लिमिटेड',
            addressEn: '15, Connaught Place, New Delhi, 110001',
            addressHi: '15, कनॉट प्लेस, नई दिल्ली, 110001',
            pan: 'AABCM1234F',
            phone: '+91 11 4567 8900',
            email: 'legal@meridiantech.in',
            isWitness: false,
            signatureStatus: 'SIGNED'
          },
          {
            role: 'FREELANCER',
            nameEn: 'Ananya Iyer',
            nameHi: 'अनन्या अय्यर',
            age: 28,
            addressEn: '404, Indiranagar 100ft Road, Bengaluru, Karnataka, 560038',
            addressHi: '404, इंदिरा नगर 100 फीट रोड, बेंगलुरु, कर्नाटक',
            pan: 'AAAPI9988C',
            aadhaarMasked: 'XXXX-XXXX-6677',
            phone: '+91 98450 33445',
            email: 'ananya.iyer@example.com',
            isWitness: false,
            signatureStatus: 'PENDING'
          }
        ]
      },
      versions: {
        create: [
          {
            versionNumber: 1,
            contentJson: JSON.stringify(tFreelance.sampleData),
            compiledEn: compiledFreelance.fullEn,
            compiledHi: compiledFreelance.fullHi,
            changeSummary: 'Compiled with Indian Arbitration Act 1996 seat'
          }
        ]
      }
    }
  })

  // Agreement 3: Commercial Office Lease Deed
  const tComm = ALL_TEMPLATES.find(t => t.code === 'rent_commercial')!
  const compiledComm = compileAgreement(tComm, tComm.sampleData)

  await prisma.agreement.upsert({
    where: { agreementNumber: 'AGR-202611-0003' },
    update: {},
    create: {
      agreementNumber: 'AGR-202611-0003',
      templateCode: 'rent_commercial',
      title: 'Commercial Office Space Lease Deed - DLF Cyber City, Tower B',
      titleHi: 'वाणिज्यिक कार्यालय पट्टा विलेख - डीएलएफ साइबर सिटी, टावर बी',
      category: 'Rental & Property',
      language: 'EN',
      status: 'REVIEW',
      state: 'Haryana',
      city: 'Gurugram',
      executionDate: new Date('2026-11-01'),
      effectiveDate: new Date('2026-12-01'),
      expiryDate: new Date('2029-11-30'),
      considerationAmount: 145000,
      formData: JSON.stringify(tComm.sampleData),
      customClauses: JSON.stringify([]),
      compiledEn: compiledComm.fullEn,
      compiledHi: compiledComm.fullHi,
      riskScore: 78,
      organizationId: org.id,
      parties: {
        create: [
          {
            role: 'LANDLORD',
            nameEn: 'Northern Developers Consortium',
            nameHi: 'नॉर्दर्न डेवलपर्स कंसोर्टियम',
            addressEn: 'DLF Cyber City, Phase 2, Gurugram, Haryana',
            addressHi: 'डीएलएफ साइबर सिटी, फेज 2, गुरुग्राम, हरियाणा',
            pan: 'AABCN7766M',
            phone: '+91 124 4567 890',
            email: 'info@ndcgroup.in',
            isWitness: false,
            signatureStatus: 'PENDING'
          },
          {
            role: 'TENANT',
            nameEn: 'InnovateSoft Solutions LLP',
            nameHi: 'इनोवेटसॉफ्ट सॉल्यूशंस एलएलपी',
            addressEn: 'Whitefield, Bengaluru / Cyber Hub Gurugram',
            addressHi: 'व्हाइटफील्ड, बेंगलुरु / साइबर हब गुरुग्राम',
            pan: 'AABFI9012H',
            phone: '+91 80 4567 8901',
            email: 'legal@innovatesoft.io',
            isWitness: false,
            signatureStatus: 'PENDING'
          }
        ]
      },
      versions: {
        create: [
          {
            versionNumber: 1,
            contentJson: JSON.stringify(tComm.sampleData),
            compiledEn: compiledComm.fullEn,
            compiledHi: compiledComm.fullHi,
            changeSummary: 'Initial commercial lease terms drafted'
          }
        ]
      }
    }
  })

  console.log('Sample agreements successfully seeded!')
}

seedAgreements()
  .catch(err => {
    console.error('Seed error:', err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
