import { AgreementTemplateDefinition } from './types'

// 1. Residential Rent / Leave and License Agreement
export const residentialRentTemplate: AgreementTemplateDefinition = {
  code: 'rent_residential',
  category: 'Rental & Property',
  titleEn: 'Residential Rent / Leave & License Agreement',
  titleHi: 'आवासीय किराया / लीव एंड लाइसेंस इकरारनामा',
  descriptionEn: 'Standard 11-month or multi-year tenancy agreement for apartments, independent floors, and houses.',
  descriptionHi: 'अपार्टमेंट, स्वतंत्र मकान एवं फ्लैट हेतु मानक 11 महीने अथवा बहुवर्षीय आवासीय किराया अनुबंध।',
  estimatedMinutes: 5,
  iconName: 'Home',
  languages: ['EN', 'HI'],
  sampleData: {
    propertyAddress: 'Flat No. 402, Tower B, Palm Heights, Sector 62, Noida, Uttar Pradesh - 201301',
    monthlyRent: 28000,
    securityDeposit: 56000,
    durationMonths: 11,
    startDate: '2026-12-01',
    lockInMonths: 3,
    noticePeriodMonths: 1,
    rentEscalationPercent: 5,
    furnishingStatus: 'Semi-Furnished',
    electricityPayment: 'Paid directly by Tenant as per meter',
    waterCharges: 'Included in rent',
    maintenanceCharges: 2500,
    petAllowed: true,
    paintingChargesOnExit: 5000,
    landlordName: 'Vikram Sharma',
    landlordFather: 'Late R.N. Sharma',
    landlordAddress: 'D-14, Defence Colony, New Delhi - 110024',
    landlordPan: 'ABCPS1234F',
    landlordPhone: '+91 98110 00001',
    tenantName: 'Rahul Mehta',
    tenantFather: 'S.K. Mehta',
    tenantAddress: 'B-22, Model Town, Jaipur, Rajasthan',
    tenantPan: 'XYZPM5678K',
    tenantPhone: '+91 98290 12345',
    witness1Name: 'Anil Kumar',
    witness2Name: 'Deepak Verma',
    city: 'Noida',
    state: 'Uttar Pradesh'
  },
  fields: [
    { id: 'propertyAddress', labelEn: 'Property Address', labelHi: 'संपत्ति का पूरा पता', type: 'textarea', required: true, section: 'property' },
    { id: 'monthlyRent', labelEn: 'Monthly Rent (INR)', labelHi: 'मासिक किराया (रुपये)', type: 'currency', required: true, section: 'payment' },
    { id: 'securityDeposit', labelEn: 'Refundable Security Deposit (INR)', labelHi: 'जमानत राशि (रुपये)', type: 'currency', required: true, section: 'payment' },
    { id: 'durationMonths', labelEn: 'Tenancy Duration (Months)', labelHi: 'किरायेदारी की अवधि (महीने)', type: 'number', defaultValue: 11, required: true, section: 'terms' },
    { id: 'startDate', labelEn: 'Tenancy Commencement Date', labelHi: 'किरायेदारी प्रारंभ तिथि', type: 'date', required: true, section: 'terms' },
    { id: 'lockInMonths', labelEn: 'Lock-in Period (Months)', labelHi: 'लॉक-इन अवधि (महीने)', type: 'number', defaultValue: 3, section: 'terms' },
    { id: 'noticePeriodMonths', labelEn: 'Notice Period (Months)', labelHi: 'नोटिस अवधि (महीने)', type: 'number', defaultValue: 1, section: 'terms' },
    { id: 'rentEscalationPercent', labelEn: 'Annual Escalation (%)', labelHi: 'वार्षिक किराया वृद्धि (%)', type: 'number', defaultValue: 5, section: 'terms' },
    { id: 'maintenanceCharges', labelEn: 'Monthly Society Maintenance (INR)', labelHi: 'मासिक रखरखाव शुल्क (रुपये)', type: 'currency', defaultValue: 2000, section: 'payment' },
    { id: 'furnishingStatus', labelEn: 'Furnishing Condition', labelHi: 'फर्नीचर की स्थिति', type: 'select', section: 'property', options: [
      { labelEn: 'Unfurnished', labelHi: 'बिना फर्नीचर', value: 'Unfurnished' },
      { labelEn: 'Semi-Furnished', labelHi: 'अर्ध-सुसज्जित', value: 'Semi-Furnished' },
      { labelEn: 'Fully Furnished', labelHi: 'पूर्ण-सुसज्जित', value: 'Fully Furnished' }
    ]},
    { id: 'petAllowed', labelEn: 'Are Pets Permitted?', labelHi: 'क्या पालतू जानवर रखने की अनुमति है?', type: 'select', section: 'terms', options: [
      { labelEn: 'Yes, permitted', labelHi: 'हाँ, अनुमति है', value: 'true' },
      { labelEn: 'No, strictly prohibited', labelHi: 'नहीं, पूर्णतः वर्जित', value: 'false' }
    ]}
  ],
  clauses: [
    {
      id: 'rent_c1_grant',
      titleEn: '1. Grant of Tenancy / License',
      titleHi: '1. किरायेदारी / लाइसेंस की स्वीकृति',
      textEn: 'The Landlord hereby grants and lets unto the Tenant, and the Tenant hereby accepts, the residential premises located at {{propertyAddress}} for a term of {{durationMonths}} months commencing from {{startDate}}.',
      textHi: 'मकान मालिक इसके द्वारा किरायेदार को {{propertyAddress}} पर स्थित आवासीय परिसर {{startDate}} से प्रारंभ होकर {{durationMonths}} महीने की अवधि के लिए किराये पर देता है, जिसे किरायेदार स्वीकार करता है।'
    },
    {
      id: 'rent_c2_rent',
      titleEn: '2. Monthly Rent Consideration',
      titleHi: '2. मासिक किराया प्रतिफल',
      textEn: 'The Tenant agrees to pay a fixed monthly rent of INR {{monthlyRent}} ({{monthlyRentWordsEn}}) in advance on or before the 7th day of each calendar month via bank transfer or online mode.',
      textHi: 'किरायेदार प्रत्येक कैलेंडर माह के 7वें दिन या उससे पूर्व बैंक अंतरण अथवा ऑनलाइन माध्यम से अग्रिम रूप से {{monthlyRent}} रुपये ({{monthlyRentWordsHi}}) मासिक किराया भुगतान करने हेतु सहमत है।'
    },
    {
      id: 'rent_c3_deposit',
      titleEn: '3. Security Deposit',
      titleHi: '3. प्रतिभूति अमानत राशि',
      textEn: 'The Tenant has deposited an interest-free refundable security deposit of INR {{securityDeposit}} ({{securityDepositWordsEn}}) with the Landlord, refundable upon peaceful handover of vacant possession subject to deductions for damages or unpaid utilities.',
      textHi: 'किरायेदार ने मकान मालिक के पास {{securityDeposit}} रुपये ({{securityDepositWordsHi}}) की ब्याज-मुक्त वापसी योग्य प्रतिभूति राशि जमा की है, जो खाली कब्जा सौंपने पर क्षति या बकाया बिलों की कटौती पश्चात वापस की जाएगी।'
    },
    {
      id: 'rent_c4_lockin',
      titleEn: '4. Lock-in & Notice Period',
      titleHi: '4. अनिवार्य लॉक-इन एवं नोटिस अवधि',
      textEn: 'Both parties agree to a lock-in period of {{lockInMonths}} months. After expiry of the lock-in, either party may terminate this agreement by serving {{noticePeriodMonths}} month(s) written notice.',
      textHi: 'दोनों पक्ष {{lockInMonths}} महीने की लॉक-इन अवधि के लिए सहमत हैं। लॉक-इन समाप्त होने के बाद, कोई भी पक्ष {{noticePeriodMonths}} महीने का लिखित नोटिस देकर इस अनुबंध को समाप्त कर सकता है।'
    },
    {
      id: 'rent_c5_utilities',
      titleEn: '5. Utilities & Society Maintenance',
      titleHi: '5. उपयोगिताएँ एवं रखरखाव शुल्क',
      textEn: 'Electricity and cooking gas charges shall be paid directly by the Tenant as per meter consumption. Monthly society maintenance of INR {{maintenanceCharges}} shall be settled directly by the Tenant.',
      textHi: 'बिजली एवं गैस शुल्क का भुगतान मीटर रीडिंग अनुसार किरायेदार द्वारा सीधे किया जाएगा। मासिक सोसाइटी रखरखाव शुल्क {{maintenanceCharges}} रुपये का भुगतान भी किरायेदार द्वारा सीधे किया जाएगा।'
    },
    {
      id: 'rent_c6_arbitration',
      titleEn: '6. Governing Law & Dispute Resolution',
      titleHi: '6. लागू कानून एवं विवाद निपटारा',
      textEn: 'This Agreement shall be governed by the laws of India and courts in {{city}}, {{state}} shall have exclusive jurisdiction. In case of any dispute, the matter shall be settled through mutual amicable discussions or arbitration under the Arbitration and Conciliation Act, 1996.',
      textHi: 'यह अनुबंध भारत के कानूनों द्वारा शासित होगा तथा {{city}}, {{state}} के सक्षम न्यायालयों का विशेष अधिकार क्षेत्र होगा। किसी भी विवाद की स्थिति में मामला मध्यस्थता एवं सुलह अधिनियम, 1996 के तहत सुलझाया जाएगा।'
    }
  ]
}

// 2. Commercial Rent Agreement
export const commercialRentTemplate: AgreementTemplateDefinition = {
  code: 'rent_commercial',
  category: 'Rental & Property',
  titleEn: 'Commercial Lease Agreement',
  titleHi: 'व्यावसायिक किराया / पट्टा विलेख',
  descriptionEn: 'Comprehensive commercial lease deed for offices, retail shops, warehouses, and co-working spaces.',
  descriptionHi: 'कार्यालय, खुदरा दुकान, गोदाम एवं वाणिज्यिक परिसरों हेतु विस्तृत पट्टा अनुबंध।',
  estimatedMinutes: 6,
  iconName: 'Building2',
  languages: ['EN', 'HI'],
  sampleData: {
    propertyAddress: 'Unit 301, Commercial Complex, MG Road, Bengaluru, Karnataka - 560001',
    monthlyRent: 85000,
    securityDeposit: 510000,
    durationMonths: 36,
    startDate: '2026-11-15',
    lockInMonths: 12,
    noticePeriodMonths: 3,
    rentEscalationPercent: 7,
    gstinLandlord: '29AABCS1429B1Z8',
    gstinTenant: '29XYZPM9821K1ZM',
    permittedUse: 'Software development and corporate headquarters',
    city: 'Bengaluru',
    state: 'Karnataka'
  },
  fields: [
    { id: 'propertyAddress', labelEn: 'Commercial Premises Address', labelHi: 'वाणिज्यिक परिसर का पता', type: 'textarea', required: true, section: 'property' },
    { id: 'permittedUse', labelEn: 'Permitted Commercial Use', labelHi: 'अनुमत व्यावसायिक उपयोग', type: 'text', required: true, section: 'terms' },
    { id: 'monthlyRent', labelEn: 'Monthly Lease Rent (INR excluding GST)', labelHi: 'मासिक पट्टा किराया (जीएसटी रहित)', type: 'currency', required: true, section: 'payment' },
    { id: 'securityDeposit', labelEn: 'Interest-free Security Deposit (INR)', labelHi: 'प्रतिभूति अमानत राशि (रुपये)', type: 'currency', required: true, section: 'payment' },
    { id: 'durationMonths', labelEn: 'Lease Duration (Months)', labelHi: 'पट्टा अवधि (महीने)', type: 'number', defaultValue: 36, required: true, section: 'terms' },
    { id: 'startDate', labelEn: 'Lease Commencement Date', labelHi: 'पट्टा प्रारंभ तिथि', type: 'date', required: true, section: 'terms' },
    { id: 'lockInMonths', labelEn: 'Lock-in Period (Months)', labelHi: 'लॉक-इन अवधि (महीने)', type: 'number', defaultValue: 12, section: 'terms' },
    { id: 'noticePeriodMonths', labelEn: 'Notice Period for Vacation', labelHi: 'खाली करने हेतु नोटिस अवधि', type: 'number', defaultValue: 3, section: 'terms' }
  ],
  clauses: [
    {
      id: 'com_c1',
      titleEn: '1. Commercial Demise & Permitted Purpose',
      titleHi: '1. व्यावसायिक पट्टा एवं अनुमत उद्देश्य',
      textEn: 'The Lessor hereby leases the commercial premises located at {{propertyAddress}} to the Lessee for the exclusive purpose of {{permittedUse}} and no unlawful or hazardous activities shall be permitted.',
      textHi: 'पट्टादाता इसके द्वारा पट्टेदार को {{propertyAddress}} पर स्थित व्यावसायिक परिसर केवल {{permittedUse}} हेतु पट्टे पर देता है तथा कोई भी गैरकानूनी गतिविधि वर्जित रहेगी।'
    },
    {
      id: 'com_c2',
      titleEn: '2. Lease Rent & Tax Invoicing',
      titleHi: '2. पट्टा किराया एवं कर बीजक',
      textEn: 'The Lessee shall pay monthly rent of INR {{monthlyRent}} ({{monthlyRentWordsEn}}) plus applicable GST on or before the 10th of every month. The Lessor shall issue compliant tax invoices.',
      textHi: 'पट्टेदार प्रत्येक माह की 10 तारीख तक {{monthlyRent}} रुपये ({{monthlyRentWordsHi}}) मय लागू जीएसटी का भुगतान करेगा। पट्टादाता वैध जीएसटी बीजक जारी करेगा।'
    },
    {
      id: 'com_c3',
      titleEn: '3. Security Deposit & Maintenance',
      titleHi: '3. प्रतिभूति राशि एवं आंतरिक रखरखाव',
      textEn: 'The Lessee deposits INR {{securityDeposit}} ({{securityDepositWordsEn}}) as interest-free refundable security deposit. The Lessee shall maintain internal commercial fixtures in sound working condition.',
      textHi: 'पट्टेदार {{securityDeposit}} रुपये ({{securityDepositWordsHi}}) ब्याज-मुक्त प्रतिभूति राशि जमा करता है। परिसर के आंतरिक उपकरणों का रखरखाव पट्टेदार के जिम्मे होगा।'
    }
  ]
}

// 3. Agreement to Sell (Property Sale Agreement)
export const propertySaleAgreementTemplate: AgreementTemplateDefinition = {
  code: 'property_sale_agreement',
  category: 'Rental & Property',
  titleEn: 'Property Sale Agreement (Agreement to Sell)',
  titleHi: 'अचल संपत्ति विक्रय इकरारनामा (बयाना अनुबंध)',
  descriptionEn: 'Legally binding pre-registration contract for sale of real estate, plot, or apartment with earnest money terms.',
  descriptionHi: 'बयाना राशि, समय सीमा एवं स्वामित्व हस्तांतरण शर्तों सहित अचल संपत्ति विक्रय अनुबंध।',
  estimatedMinutes: 7,
  iconName: 'Building',
  languages: ['EN', 'HI'],
  sampleData: {
    propertyAddress: 'Plot No. 88, Sector 15, Gurugram, Haryana - 122001 (Area: 250 sq yards)',
    totalConsideration: 18500000,
    earnestMoney: 1850000,
    balanceAmount: 16650000,
    completionDate: '2027-02-28',
    sellerName: 'Satish Chandra Joshi',
    buyerName: 'Amitabh Sengupta',
    city: 'Gurugram',
    state: 'Haryana'
  },
  fields: [
    { id: 'propertyAddress', labelEn: 'Complete Property Identification & Schedule', labelHi: 'संपत्ति का पूरा विवरण एवं खसरा/प्लॉट नंबर', type: 'textarea', required: true, section: 'property' },
    { id: 'totalConsideration', labelEn: 'Total Agreed Sale Price (INR)', labelHi: 'कुल तय विक्रय मूल्य (रुपये)', type: 'currency', required: true, section: 'payment' },
    { id: 'earnestMoney', labelEn: 'Earnest Money / Bayana Received (INR)', labelHi: 'प्राप्त बयाना / अग्रिम राशि (रुपये)', type: 'currency', required: true, section: 'payment' },
    { id: 'completionDate', labelEn: 'Target Date for Final Sale Deed Registration', labelHi: 'अंतिम बैनामा रजिस्ट्री की नियत तिथि', type: 'date', required: true, section: 'terms' }
  ],
  clauses: [
    {
      id: 'prop_c1',
      titleEn: '1. Agreement for Transfer of Title',
      titleHi: '1. स्वामित्व हस्तांतरण हेतु इकरार',
      textEn: 'The Seller agrees to sell and transfer absolute, marketable, and unencumbered title of the property {{propertyAddress}} to the Buyer free from all liens, mortgages, charges, or litigations.',
      textHi: 'विक्रेता {{propertyAddress}} स्थित संपत्ति का संपूर्ण, विपणन योग्य एवं ऋणमुक्त स्वामित्व क्रेता को सभी बंधक, भार अथवा मुकदमों से मुक्त बेचने पर सहमत है।'
    },
    {
      id: 'prop_c2',
      titleEn: '2. Consideration & Balance Schedule',
      titleHi: '2. विक्रय प्रतिफल एवं अवशेष भुगतान',
      textEn: 'The total consideration is INR {{totalConsideration}} ({{totalConsiderationWordsEn}}). The Seller acknowledges receipt of advance earnest money of INR {{earnestMoney}} ({{earnestMoneyWordsEn}}). The balance shall be tendered at the time of registration on or before {{completionDate}}.',
      textHi: 'कुल विक्रय प्रतिफल {{totalConsideration}} रुपये ({{totalConsiderationWordsHi}}) है। विक्रेता बयाना राशि {{earnestMoney}} रुपये ({{earnestMoneyWordsHi}}) प्राप्त करने की पुष्टि करता है। अवशेष राशि का भुगतान {{completionDate}} तक रजिस्ट्री के समय किया जाएगा।'
    }
  ]
}

// 4. Sale Deed Draft
export const saleDeedTemplate: AgreementTemplateDefinition = {
  code: 'sale_deed',
  category: 'Rental & Property',
  titleEn: 'Absolute Sale Deed Draft',
  titleHi: 'संपूर्ण विक्रय विलेख (बैनामा)',
  descriptionEn: 'Formal conveyance deed executing irrevocable transfer of immovable property title before the Sub-Registrar.',
  descriptionHi: 'उप-पंजीयक कार्यालय में अचल संपत्ति का अंतिम एवं अपरिवर्तनीय स्वामित्व हस्तांतरण विलेख।',
  estimatedMinutes: 8,
  iconName: 'FileCheck',
  languages: ['EN', 'HI'],
  sampleData: {
    propertyAddress: 'House No. 12, Block C, Vasant Vihar, New Delhi - 110057',
    saleAmount: 24000000,
    stampDutyPaid: 1440000,
    registrationFeePaid: 240000,
    sellerName: 'Rajinder Nath',
    buyerName: 'Kunal Singhania',
    city: 'New Delhi',
    state: 'Delhi'
  },
  fields: [
    { id: 'propertyAddress', labelEn: 'Property Boundary & Schedule Description', labelHi: 'संपत्ति की चारों सीमाओं का विवरण', type: 'textarea', required: true, section: 'property' },
    { id: 'saleAmount', labelEn: 'Final Conveyance Value (INR)', labelHi: 'अंतिम विक्रय मूल्य (रुपये)', type: 'currency', required: true, section: 'payment' },
    { id: 'stampDutyPaid', labelEn: 'Stamp Duty Paid (INR)', labelHi: 'अदा किया गया स्टाम्प शुल्क (रुपये)', type: 'currency', required: true, section: 'payment' }
  ],
  clauses: [
    {
      id: 'sd_c1',
      titleEn: '1. Absolute Conveyance',
      titleHi: '1. पूर्ण विक्रय एवं हस्तांतरण',
      textEn: 'In consideration of the total sum of INR {{saleAmount}} ({{saleAmountWordsEn}}) paid in full by the Buyer, the Seller doth hereby grant, convey, and assure forever all rights and title in {{propertyAddress}} to the Buyer.',
      textHi: 'क्रेता द्वारा पूर्ण रूप से प्रदत्त कुल {{saleAmount}} रुपये ({{saleAmountWordsHi}}) के प्रतिफल में, विक्रेता {{propertyAddress}} स्थित संपत्ति के समस्त अधिकार व स्वामित्व सदैव हेतु क्रेता को हस्तांतरित करता है।'
    }
  ]
}

// 5. Rent Receipt
export const rentReceiptTemplate: AgreementTemplateDefinition = {
  code: 'rent_receipt',
  category: 'Rental & Property',
  titleEn: 'Monthly Rent Receipt & HRA Claim Slip',
  titleHi: 'मासिक किराया रसीद एवं एचआरए पर्ची',
  descriptionEn: 'Official signed receipt of rent payment for income tax HRA exemption and tenant ledger.',
  descriptionHi: 'आयकर एचआरए छूट एवं किरायेदार रिकॉर्ड हेतु औपचारिक हस्ताक्षरित किराया पावती।',
  estimatedMinutes: 2,
  iconName: 'Receipt',
  languages: ['EN', 'HI'],
  sampleData: {
    propertyAddress: 'Apt 504, Greenfield Heights, Whitefield, Bengaluru',
    rentAmount: 32000,
    receiptMonth: 'October 2026',
    landlordName: 'Priya Krishnan',
    landlordPan: 'ABCPK9912L',
    tenantName: 'Saurabh Banerjee',
    paymentMode: 'UPI / NEFT',
    transactionRef: 'UPI/630192837190',
    city: 'Bengaluru',
    state: 'Karnataka'
  },
  fields: [
    { id: 'propertyAddress', labelEn: 'Rented Premises Address', labelHi: 'किराये के परिसर का पता', type: 'text', required: true, section: 'property' },
    { id: 'rentAmount', labelEn: 'Rent Amount Paid (INR)', labelHi: 'भुगतान किया गया किराया (रुपये)', type: 'currency', required: true, section: 'payment' },
    { id: 'receiptMonth', labelEn: 'Month & Year of Rent', labelHi: 'किराये का माह एवं वर्ष', type: 'text', required: true, section: 'terms' },
    { id: 'paymentMode', labelEn: 'Payment Mode', labelHi: 'भुगतान का माध्यम', type: 'text', defaultValue: 'Bank Transfer / UPI', section: 'payment' },
    { id: 'transactionRef', labelEn: 'UTR / Transaction Reference No.', labelHi: 'यूटीआर / लेनदेन संदर्भ संख्या', type: 'text', section: 'payment' }
  ],
  clauses: [
    {
      id: 'rr_c1',
      titleEn: 'Receipt Acknowledgement',
      titleHi: 'किराया पावती अभिस्वीकृति',
      textEn: 'Received with thanks from {{tenantName}} a sum of INR {{rentAmount}} ({{rentAmountWordsEn}}) via {{paymentMode}} (Ref: {{transactionRef}}) towards monthly rent for the month of {{receiptMonth}} for property located at {{propertyAddress}}.',
      textHi: '{{propertyAddress}} पर स्थित परिसर के {{receiptMonth}} माह के किराये मद में {{tenantName}} से {{paymentMode}} (संदर्भ: {{transactionRef}}) द्वारा {{rentAmount}} रुपये ({{rentAmountWordsHi}}) सधन्यवाद प्राप्त हुए।'
    }
  ]
}

// 6. Security Deposit & Tenant Notice
export const tenantNoticeTemplate: AgreementTemplateDefinition = {
  code: 'tenant_notice',
  category: 'Rental & Property',
  titleEn: 'Notice to Vacate / Eviction & Deposit Refund Notice',
  titleHi: 'मकान खाली करने / जमा वापसी हेतु औपचारिक विधिक नोटिस',
  descriptionEn: 'Formal notice served under Transfer of Property Act for tenancy termination and refund of security deposit.',
  descriptionHi: 'किरायेदारी समाप्ति अथवा अमानत राशि वापसी हेतु संपत्ति अंतरण अधिनियम अंतर्गत औपचारिक सूचना पत्र।',
  estimatedMinutes: 4,
  iconName: 'AlertCircle',
  languages: ['EN', 'HI'],
  sampleData: {
    propertyAddress: 'Flat 102, Shivalik Enclave, Chandigarh',
    vacationDate: '2026-12-15',
    securityDepositClaim: 45000,
    noticeReason: 'Expiry of lease agreement and personal relocation',
    senderName: 'Rohit Verma',
    recipientName: 'Harpreet Singh',
    city: 'Chandigarh',
    state: 'Punjab'
  },
  fields: [
    { id: 'propertyAddress', labelEn: 'Premises Address', labelHi: 'परिसर का पता', type: 'textarea', required: true, section: 'property' },
    { id: 'vacationDate', labelEn: 'Date of Intended Vacation / Handover', labelHi: 'खाली करने / कब्जा सौंपने की नियत तिथि', type: 'date', required: true, section: 'terms' },
    { id: 'securityDepositClaim', labelEn: 'Security Deposit to be Refunded (INR)', labelHi: 'वापस की जाने वाली प्रतिभूति राशि (रुपये)', type: 'currency', section: 'payment' },
    { id: 'noticeReason', labelEn: 'Grounds of Notice', labelHi: 'नोटिस देने का आधार / कारण', type: 'text', section: 'terms' }
  ],
  clauses: [
    {
      id: 'tn_c1',
      titleEn: 'Notice of Termination',
      titleHi: 'अनुबंध समाप्ति की सूचना',
      textEn: 'Take notice that pursuant to the tenancy agreement, the tenancy in respect of {{propertyAddress}} shall stand terminated on {{vacationDate}} due to {{noticeReason}}. The Landlord is called upon to refund the security deposit of INR {{securityDepositClaim}} ({{securityDepositClaimWordsEn}}) simultaneously against handover of vacant possession.',
      textHi: 'कृपया संज्ञान लें कि किराया अनुबंध के तहत {{propertyAddress}} की किरायेदारी {{noticeReason}} के कारण {{vacationDate}} को समाप्त मानी जाएगी। मकान मालिक से कब्जा वापसी के साथ ही {{securityDepositClaim}} रुपये ({{securityDepositClaimWordsHi}}) की अमानत राशि लौटाने का अनुरोध है।'
    }
  ]
}
