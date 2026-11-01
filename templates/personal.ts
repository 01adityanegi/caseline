import { AgreementTemplateDefinition } from './types'

// 13. Loan Agreement with Promissory Note
export const loanPromissoryTemplate: AgreementTemplateDefinition = {
  code: 'loan_promissory',
  category: 'Personal',
  titleEn: 'Personal / Friendly Loan Agreement with Demand Promissory Note',
  titleHi: 'निजी ऋण / उधार अनुबंध मय मांग वचन पत्र (प्रॉमिसरी नोट)',
  descriptionEn: 'Legally enforceable personal loan agreement with repayment schedule, interest rate, and negotiable promissory note.',
  descriptionHi: 'ब्याज दर, अदायगी समय सीमा एवं निगोशिएबल प्रॉमिसरी नोट सहित कानूनी रूप से वैध ऋण अनुबंध।',
  estimatedMinutes: 5,
  iconName: 'Landmark',
  languages: ['EN', 'HI'],
  sampleData: {
    loanAmount: 500000,
    interestRatePercent: 12,
    repaymentDate: '2027-10-31',
    purposeOfLoan: 'Expansion of family business and capital expenditure',
    lenderName: 'Rameshwar Dayal',
    borrowerName: 'Sanjay Kumar Gupta',
    city: 'Kanpur',
    state: 'Uttar Pradesh'
  },
  fields: [
    { id: 'loanAmount', labelEn: 'Principal Loan Amount (INR)', labelHi: 'मूल ऋण राशि (रुपये)', type: 'currency', required: true, section: 'payment' },
    { id: 'interestRatePercent', labelEn: 'Annual Interest Rate (%)', labelHi: 'वार्षिक ब्याज दर (%)', type: 'number', defaultValue: 12, section: 'payment' },
    { id: 'repaymentDate', labelEn: 'Final Repayment Due Date', labelHi: 'ऋण अदायगी की अंतिम देय तिथि', type: 'date', required: true, section: 'terms' },
    { id: 'purposeOfLoan', labelEn: 'Stated Purpose of Borrowing', labelHi: 'ऋण लेने का उद्देश्य', type: 'text', section: 'terms' }
  ],
  clauses: [
    {
      id: 'loan_c1',
      titleEn: '1. Advance of Principal & Interest Terms',
      titleHi: '1. मूल ऋण अग्रिम एवं ब्याज की शर्तें',
      textEn: 'The Lender advances a sum of INR {{loanAmount}} ({{loanAmountWordsEn}}) to the Borrower for {{purposeOfLoan}}. The Borrower covenants to repay the principal along with agreed simple interest at {{interestRatePercent}}% per annum on or before {{repaymentDate}}.',
      textHi: 'ऋणदाता उधारकर्ता को {{purposeOfLoan}} हेतु {{loanAmount}} रुपये ({{loanAmountWordsHi}}) का ऋण प्रदान करता है। उधारकर्ता {{repaymentDate}} तक {{interestRatePercent}}% वार्षिक साधारण ब्याज सहित संपूर्ण राशि लौटाने का वचन देता है।'
    },
    {
      id: 'loan_c2',
      titleEn: '2. Demand Promissory Note Execution',
      titleHi: '2. ऑन-डिमांड प्रॉमिसरी नोट निष्पादन',
      textEn: 'As security for repayment, the Borrower concurrently executes a separate Demand Promissory Note under the Negotiable Instruments Act, 1881, promising to pay the Lender or order on demand.',
      textHi: 'ऋण अदायगी की सुरक्षा हेतु, उधारकर्ता समवर्ती रूप से परक्राम्य लिखत अधिनियम 1881 के तहत एक पृथक ऑन-डिमांड प्रॉमिसरी नोट निष्पादित करता है।'
    }
  ]
}

// 14. Power of Attorney (General & Special)
export const powerOfAttorneyTemplate: AgreementTemplateDefinition = {
  code: 'power_of_attorney',
  category: 'Personal',
  titleEn: 'General & Special Power of Attorney (GPA / SPA)',
  titleHi: 'सामान्य एवं विशेष मुख्तारनामा (पावर ऑफ अटॉर्नी)',
  descriptionEn: 'Appoints an authorized attorney to manage real estate, bank accounts, court appearances, and government filings.',
  descriptionHi: 'संपत्ति प्रबंधन, बैंक संचालन, न्यायालय में पैरवी एवं सरकारी कार्यों हेतु वैध कानूनी प्राधिकार पत्र।',
  estimatedMinutes: 6,
  iconName: 'UserCheck',
  languages: ['EN', 'HI'],
  sampleData: {
    poaType: 'General Power of Attorney (All acts)',
    authorizedPowers: 'To manage residential flat, collect rent, pay property tax, represent before municipal authorities and execute lease deeds',
    propertyDescription: 'Flat 303, Royal Palms, Banjara Hills, Hyderabad',
    principalName: 'K. Seshagiri Rao (NRI, Residing in Dubai)',
    attorneyName: 'K. Venkat Rao',
    city: 'Hyderabad',
    state: 'Telangana'
  },
  fields: [
    { id: 'poaType', labelEn: 'Type of Power of Attorney', labelHi: 'मुख्तारनामा का प्रकार', type: 'select', required: true, section: 'terms', options: [
      { labelEn: 'General Power of Attorney (Broad Powers)', labelHi: 'सामान्य मुख्तारनामा (व्यापक अधिकार)', value: 'General Power of Attorney' },
      { labelEn: 'Special Power of Attorney (Specific Act/Property)', labelHi: 'विशेष मुख्तारनामा (विशिष्ट संपत्ति/कार्य)', value: 'Special Power of Attorney' }
    ]},
    { id: 'authorizedPowers', labelEn: 'Detailed Powers Granted to Attorney', labelHi: 'मुख्तार को दिए जाने वाले विशिष्ट अधिकार', type: 'textarea', required: true, section: 'terms' },
    { id: 'propertyDescription', labelEn: 'Property or Matter Details (if applicable)', labelHi: 'संबंधित संपत्ति अथवा विषय का विवरण', type: 'textarea', section: 'property' }
  ],
  clauses: [
    {
      id: 'poa_c1',
      titleEn: '1. Appointment & Authority',
      titleHi: '1. कानूनी मुख्तार की नियुक्ति एवं अधिकार',
      textEn: 'The Principal hereby nominates, constitutes, and appoints the Attorney as their true and lawful attorney to act for and on behalf of the Principal in respect of {{authorizedPowers}} concerning {{propertyDescription}}.',
      textHi: 'प्रिंसिपल इसके द्वारा उक्त मुख्तार को अपना सच्चा और कानूनी प्रतिनिधि नियुक्त करता है ताकि वह {{propertyDescription}} के संबंध में {{authorizedPowers}} के निष्पादन हेतु अधिकृत रहे।'
    },
    {
      id: 'poa_c2',
      titleEn: '2. Ratification',
      titleHi: '2. कार्यों की पुष्टि एवं अधिप्रमाणन',
      textEn: 'The Principal covenants that all lawful acts, deeds, and things done by the Attorney shall be construed as acts done by the Principal in person, and the Principal undertakes to ratify and confirm the same forever.',
      textHi: 'प्रिंसिपल यह वचन देता है कि मुख्तार द्वारा किए गए सभी वैध कार्यों को स्वयं उसके द्वारा किए गए कार्य माना जाएगा और वह उनकी हमेशा पुष्टि करेगा।'
    }
  ]
}

// 15. Affidavit (Name Change, Address Proof, General)
export const affidavitGeneralTemplate: AgreementTemplateDefinition = {
  code: 'affidavit_general',
  category: 'Personal',
  titleEn: 'General Legal Affidavit & Declaration on Oath',
  titleHi: 'सामान्य कानूनी शपथ पत्र / हलफनामा',
  descriptionEn: 'Standard sworn affidavit for name variation, address declaration, lost certificates, or submission before authorities.',
  descriptionHi: 'नाम सुधार, पता प्रमाण, खोए प्रमाणपत्र अथवा सरकारी विभागों में प्रस्तुत करने हेतु शपथ पत्र।',
  estimatedMinutes: 3,
  iconName: 'FileText',
  languages: ['EN', 'HI'],
  sampleData: {
    affidavitPurpose: 'Correction of name variation in educational and passport records',
    declarationStatement: 'That the deponent was named "Rahul Kumar" in Class 10 certificate and "Rahul Kumar Sharma" in Aadhaar card, and both names belong to one and the same person',
    deponentName: 'Rahul Kumar Sharma',
    deponentFather: 'Omprakash Sharma',
    deponentAge: 27,
    deponentAddress: 'H.No. 45, Civil Lines, Bareilly, Uttar Pradesh',
    city: 'Bareilly',
    state: 'Uttar Pradesh'
  },
  fields: [
    { id: 'affidavitPurpose', labelEn: 'Purpose of Affidavit', labelHi: 'शपथ पत्र का प्रयोजन / विषय', type: 'text', required: true, section: 'terms' },
    { id: 'declarationStatement', labelEn: 'Factual Declaration Statement on Oath', labelHi: 'शपथपूर्वक तथ्य कथन एवं घोषणा', type: 'textarea', required: true, section: 'terms' },
    { id: 'deponentAge', labelEn: 'Age of Deponent', labelHi: 'शपथकर्ता की उम्र (वर्ष)', type: 'number', required: true, section: 'terms' }
  ],
  clauses: [
    {
      id: 'aff_c1',
      titleEn: 'Solemn Affirmation on Oath',
      titleHi: 'शपथपूर्वक सत्यनिष्ठा कथन',
      textEn: 'I, {{deponentName}}, aged {{deponentAge}} years, resident of {{deponentAddress}}, do hereby solemnly affirm and state on oath as follows: {{declarationStatement}}.',
      textHi: 'मैं, {{deponentName}}, आयु {{deponentAge}} वर्ष, निवासी {{deponentAddress}}, इसके द्वारा ईश्वर के नाम पर सत्यनिष्ठापूर्वक घोषणा करता/करती हूँ कि: {{declarationStatement}}।'
    },
    {
      id: 'aff_c2',
      titleEn: 'Verification & Truthfulness',
      titleHi: 'सत्यापन एवं शुद्धता की पुष्टि',
      textEn: 'I verify that the contents of this affidavit are true and correct to the best of my personal knowledge and belief, no part of it is false and nothing material has been concealed therein.',
      textHi: 'मैं सत्यापित करता/करती हूँ कि इस शपथ पत्र की समस्त बातें मेरे निजी ज्ञान व विश्वास अनुसार सत्य एवं सही हैं, इसमें कुछ भी असत्य नहीं है और न ही कोई महत्वपूर्ण तथ्य छुपाया गया है।'
    }
  ]
}
