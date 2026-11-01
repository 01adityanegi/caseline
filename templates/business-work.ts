import { AgreementTemplateDefinition } from './types'

// 7. Freelance Service Agreement
export const freelanceServiceTemplate: AgreementTemplateDefinition = {
  code: 'freelance_service',
  category: 'Business & Work',
  titleEn: 'Freelance & Independent Contractor Agreement',
  titleHi: 'फ्रीलांस सेवा एवं स्वतंत्र संविदाकार अनुबंध',
  descriptionEn: 'Protects scope of work, IP ownership, milestone payments, and revision limits for designers, developers, and consultants.',
  descriptionHi: 'कार्यक्षेत्र, बौद्धिक संपदा अधिकार, मील का पत्थर भुगतान एवं संशोधन सीमा तय करने हेतु स्वतंत्र अनुबंध।',
  estimatedMinutes: 5,
  iconName: 'Laptop',
  languages: ['EN', 'HI'],
  sampleData: {
    serviceScope: 'Full-stack web application development and mobile-responsive UI design for legal tech portal',
    deliverables: 'Complete Next.js codebase, Figma design system, API documentation, and deployment scripts',
    totalFee: 150000,
    advanceFee: 50000,
    deadlineDate: '2027-01-15',
    revisionLimit: 3,
    ipOwnership: 'Assigned fully to Client upon complete payment',
    governingCity: 'New Delhi',
    clientName: 'Apex Innovations Pvt Ltd',
    freelancerName: 'Aakash Verma',
    city: 'New Delhi',
    state: 'Delhi'
  },
  fields: [
    { id: 'serviceScope', labelEn: 'Scope of Services', labelHi: 'प्रदान की जाने वाली सेवाओं का विवरण', type: 'textarea', required: true, section: 'terms' },
    { id: 'deliverables', labelEn: 'Key Deliverables & Specifications', labelHi: 'मुख्य डिलिवरेबल्स एवं उत्पाद विवरण', type: 'textarea', required: true, section: 'terms' },
    { id: 'totalFee', labelEn: 'Total Project Fee (INR)', labelHi: 'कुल परियोजना शुल्क (रुपये)', type: 'currency', required: true, section: 'payment' },
    { id: 'advanceFee', labelEn: 'Advance Deposit Amount (INR)', labelHi: 'अग्रिम बयाना राशि (रुपये)', type: 'currency', required: true, section: 'payment' },
    { id: 'deadlineDate', labelEn: 'Final Completion Deadline', labelHi: 'कार्य समाप्ति की अंतिम तिथि', type: 'date', required: true, section: 'terms' },
    { id: 'revisionLimit', labelEn: 'Included Revision Rounds', labelHi: 'शामिल संशोधन चक्रों की संख्या', type: 'number', defaultValue: 3, section: 'terms' },
    { id: 'governingCity', labelEn: 'Jurisdiction & City of Dispute', labelHi: 'विवाद निपटारा शहर / न्यायाधिकार', type: 'text', defaultValue: 'New Delhi', section: 'legal' }
  ],
  clauses: [
    {
      id: 'fl_c1',
      titleEn: '1. Services & Milestone Delivery',
      titleHi: '1. सेवाएँ एवं चरणबद्ध आपूर्ति',
      textEn: 'The Freelancer agrees to perform {{serviceScope}} and deliver {{deliverables}} on or before {{deadlineDate}}. Up to {{revisionLimit}} rounds of revisions are included.',
      textHi: 'फ्रीलांसर {{deadlineDate}} तक अथवा उससे पूर्व {{serviceScope}} का निष्पादन करने एवं {{deliverables}} सौंपने पर सहमत है। इसमें अधिकतम {{revisionLimit}} बार संशोधन शामिल हैं।'
    },
    {
      id: 'fl_c2',
      titleEn: '2. Professional Consideration & Payment Milestones',
      titleHi: '2. व्यावसायिक मानदेय एवं भुगतान की शर्तें',
      textEn: 'The Client shall pay a total fixed consideration of INR {{totalFee}} ({{totalFeeWordsEn}}), of which INR {{advanceFee}} ({{advanceFeeWordsEn}}) is paid in advance and the balance upon acceptance of final deliverables.',
      textHi: 'ग्राहक कुल {{totalFee}} रुपये ({{totalFeeWordsHi}}) का भुगतान करेगा, जिसमें से {{advanceFee}} रुपये ({{advanceFeeWordsHi}}) अग्रिम देय है तथा शेष राशि अंतिम उत्पाद की स्वीकृति पर देय होगी।'
    },
    {
      id: 'fl_c3',
      titleEn: '3. Intellectual Property Assignment',
      titleHi: '3. बौद्धिक संपदा स्वामित्व का अंतरण',
      textEn: 'Upon receipt of full and final payment, all intellectual property rights, source code, and copyrights in the deliverables shall transfer irrevocably and exclusively to the Client.',
      textHi: 'समस्त देय राशि का पूर्ण भुगतान प्राप्त होने पर, डिलिवरेबल्स से संबंधित समस्त बौद्धिक संपदा अधिकार, स्रोत कोड एवं कॉपीराइट स्वतः और पूर्ण रूप से ग्राहक को हस्तांतरित हो जाएँगे।'
    }
  ]
}

// 8. Employment Agreement
export const employmentAgreementTemplate: AgreementTemplateDefinition = {
  code: 'employment_agreement',
  category: 'Business & Work',
  titleEn: 'Comprehensive Employment Agreement',
  titleHi: 'पूर्णकालिक रोजगार / सेवा अनुबंध',
  descriptionEn: 'Formal contract covering CTC salary, probation period, notice period, non-compete, and confidentiality.',
  descriptionHi: 'वेतन सीटीसी, प्रोबेशन अवधि, नोटिस पीरियड, गैर-प्रतिस्पर्धा एवं गोपनीयता शर्तों सहित नियुक्ति पत्र।',
  estimatedMinutes: 6,
  iconName: 'Briefcase',
  languages: ['EN', 'HI'],
  sampleData: {
    jobTitle: 'Senior Software Engineer',
    department: 'Engineering',
    annualCtc: 1800000,
    joiningDate: '2026-12-01',
    probationMonths: 6,
    noticePeriodMonths: 2,
    workLocation: 'Bengaluru / Hybrid',
    companyName: 'Nextera Technologies Pvt Ltd',
    employeeName: 'Pooja Kashyap',
    city: 'Bengaluru',
    state: 'Karnataka'
  },
  fields: [
    { id: 'jobTitle', labelEn: 'Designation / Job Role', labelHi: 'पदनाम / पद', type: 'text', required: true, section: 'terms' },
    { id: 'annualCtc', labelEn: 'Annual CTC Salary (INR)', labelHi: 'वार्षिक सीटीसी वेतन (रुपये)', type: 'currency', required: true, section: 'payment' },
    { id: 'joiningDate', labelEn: 'Date of Joining', labelHi: 'कार्यभार ग्रहण करने की तिथि', type: 'date', required: true, section: 'terms' },
    { id: 'probationMonths', labelEn: 'Probation Period (Months)', labelHi: 'परिवीक्षा / प्रोबेशन अवधि (महीने)', type: 'number', defaultValue: 6, section: 'terms' },
    { id: 'noticePeriodMonths', labelEn: 'Notice Period on Resignation (Months)', labelHi: 'इस्तीफा नोटिस अवधि (महीने)', type: 'number', defaultValue: 2, section: 'terms' }
  ],
  clauses: [
    {
      id: 'emp_c1',
      titleEn: '1. Appointment & Compensation',
      titleHi: '1. नियुक्ति एवं पारिश्रमिक',
      textEn: 'The Company hereby appoints the Employee as {{jobTitle}} with an annual Cost to Company (CTC) of INR {{annualCtc}} ({{annualCtcWordsEn}}), payable monthly subject to applicable tax deductions (TDS) and statutory provident fund.',
      textHi: 'कंपनी कर्मचारी को {{jobTitle}} के पद पर वार्षिक सीटीसी {{annualCtc}} रुपये ({{annualCtcWordsHi}}) पर नियुक्त करती है, जिसका मासिक भुगतान लागू टीडीएस व पीएफ कटौती के अधीन होगा।'
    },
    {
      id: 'emp_c2',
      titleEn: '2. Probation & Termination',
      titleHi: '2. प्रोबेशन एवं सेवा समाप्ति',
      textEn: 'The Employee shall serve a probation period of {{probationMonths}} months. Following confirmation, either party may terminate employment by serving {{noticePeriodMonths}} months written notice or salary in lieu thereof.',
      textHi: 'कर्मचारी {{probationMonths}} महीने की प्रोबेशन अवधि पर रहेगा। स्थायीकरण पश्चात, कोई भी पक्ष {{noticePeriodMonths}} माह का लिखित नोटिस अथवा उसके बदले वेतन देकर सेवा समाप्त कर सकता है।'
    }
  ]
}

// 9. Non-Disclosure Agreement (NDA)
export const ndaTemplate: AgreementTemplateDefinition = {
  code: 'nda',
  category: 'Business & Work',
  titleEn: 'Mutual Non-Disclosure Agreement (NDA)',
  titleHi: 'पारस्परिक गोपनीयता अनुबंध (एनडीए)',
  descriptionEn: 'Protects proprietary trade secrets, financial records, algorithms, and business plans between collaborating entities.',
  descriptionHi: 'व्यावसायिक रहस्य, तकनीकी कोड एवं गोपनीय वित्तीय आँकड़ों की सुरक्षा हेतु कानूनी अनुबंध।',
  estimatedMinutes: 4,
  iconName: 'Lock',
  languages: ['EN', 'HI'],
  sampleData: {
    purpose: 'Evaluation of joint venture partnership and enterprise software integration',
    confidentialityDurationYears: 3,
    governingCity: 'Mumbai',
    party1Name: 'FinMatrix Solutions Ltd',
    party2Name: 'CloudSecure Technologies LLP',
    city: 'Mumbai',
    state: 'Maharashtra'
  },
  fields: [
    { id: 'purpose', labelEn: 'Specific Business Purpose of Disclosure', labelHi: 'गोपनीय जानकारी साझा करने का उद्देश्य', type: 'textarea', required: true, section: 'terms' },
    { id: 'confidentialityDurationYears', labelEn: 'Duration of Confidentiality (Years)', labelHi: 'गोपनीयता बंधन की अवधि (वर्ष)', type: 'number', defaultValue: 3, section: 'terms' },
    { id: 'governingCity', labelEn: 'Jurisdiction & City', labelHi: 'सक्षम न्यायाधिकार शहर', type: 'text', defaultValue: 'Mumbai', section: 'legal' }
  ],
  clauses: [
    {
      id: 'nda_c1',
      titleEn: '1. Duty of Confidentiality',
      titleHi: '1. गोपनीयता का कानूनी दायित्व',
      textEn: 'Each party agrees to hold all proprietary technical, financial, and business information disclosed for {{purpose}} in strict confidence for {{confidentialityDurationYears}} years and shall not disclose it to any third party without prior written consent.',
      textHi: 'प्रत्येक पक्ष {{purpose}} हेतु प्राप्त समस्त तकनीकी, वित्तीय एवं व्यावसायिक जानकारियों को {{confidentialityDurationYears}} वर्ष तक पूर्णतः गोपनीय रखेगा तथा बिना पूर्व लिखित अनुमति किसी तीसरे पक्ष को उजागर नहीं करेगा।'
    }
  ]
}

// 10. Partnership Agreement
export const partnershipDeedTemplate: AgreementTemplateDefinition = {
  code: 'partnership_deed',
  category: 'Business & Work',
  titleEn: 'Partnership Firm Deed',
  titleHi: 'साझेदारी फर्म विलेख (पार्टनरशिप डीड)',
  descriptionEn: 'Defines capital contribution, profit sharing ratio, management powers, and bank operation rules under Partnership Act 1932.',
  descriptionHi: 'भारतीय साझेदारी अधिनियम 1932 के तहत पूँजी अनुपात, लाभ-हानि बँटवारा एवं प्रबंधन अधिकार अनुबंध।',
  estimatedMinutes: 6,
  iconName: 'Users2',
  languages: ['EN', 'HI'],
  sampleData: {
    firmName: 'Shree Balaji Logistics & Transport',
    businessNature: 'Interstate goods logistics, warehousing, and freight forwarding',
    initialCapital: 1000000,
    profitShareRatio: '50% to Partner 1 and 50% to Partner 2',
    partner1Name: 'Girish Chandra',
    partner2Name: 'Mohan Lal Soni',
    city: 'Jaipur',
    state: 'Rajasthan'
  },
  fields: [
    { id: 'firmName', labelEn: 'Partnership Firm Name', labelHi: 'साझेदारी फर्म का नाम', type: 'text', required: true, section: 'terms' },
    { id: 'businessNature', labelEn: 'Nature of Firm Business', labelHi: 'फर्म के व्यवसाय की प्रकृति', type: 'text', required: true, section: 'terms' },
    { id: 'initialCapital', labelEn: 'Total Initial Capital Invested (INR)', labelHi: 'कुल प्रारंभिक पूँजी (रुपये)', type: 'currency', required: true, section: 'payment' },
    { id: 'profitShareRatio', labelEn: 'Profit & Loss Sharing Ratio', labelHi: 'लाभ एवं हानि विभाजन का अनुपात', type: 'text', defaultValue: 'Equal (50:50)', section: 'payment' }
  ],
  clauses: [
    {
      id: 'part_c1',
      titleEn: '1. Capital Contribution & Profit Ratio',
      titleHi: '1. पूँजी निवेश एवं लाभ विभाजन',
      textEn: 'The partners have contributed an aggregate initial capital of INR {{initialCapital}} ({{initialCapitalWordsEn}}) for carrying on {{businessNature}} under the firm name {{firmName}}. Profits and losses shall be apportioned strictly as: {{profitShareRatio}}.',
      textHi: 'साझेदारों ने {{firmName}} के नाम से {{businessNature}} चलाने हेतु कुल {{initialCapital}} रुपये ({{initialCapitalWordsHi}}) की पूँजी लगाई है। लाभ व हानि का विभाजन अनुपात {{profitShareRatio}} रहेगा।'
    }
  ]
}

// 11. Consultancy Agreement
export const consultancyAgreementTemplate: AgreementTemplateDefinition = {
  code: 'consultancy_agreement',
  category: 'Business & Work',
  titleEn: 'Strategic Consultancy Agreement',
  titleHi: 'सलाहकार / कंसल्टेंसी अनुबंध',
  descriptionEn: 'Retainer or milestone contract for strategic advisors, domain experts, and management consultants.',
  descriptionHi: 'प्रबंधन विशेषज्ञों, वित्तीय सलाहकारों एवं रणनीति सलाहकारों हेतु परामर्श विलेख।',
  estimatedMinutes: 5,
  iconName: 'GraduationCap',
  languages: ['EN', 'HI'],
  sampleData: {
    consultancyDomain: 'Financial risk modeling, GST restructuring, and compliance advisory',
    monthlyRetainer: 75000,
    termMonths: 12,
    clientName: 'Zenith Lifesciences Ltd',
    consultantName: 'Dr. Vivek R. Mehra',
    city: 'Hyderabad',
    state: 'Telangana'
  },
  fields: [
    { id: 'consultancyDomain', labelEn: 'Scope of Advisory & Domain', labelHi: 'परामर्श क्षेत्र एवं विषय', type: 'textarea', required: true, section: 'terms' },
    { id: 'monthlyRetainer', labelEn: 'Monthly Retainer Fee (INR)', labelHi: 'मासिक रिटेनर शुल्क (रुपये)', type: 'currency', required: true, section: 'payment' },
    { id: 'termMonths', labelEn: 'Agreement Duration (Months)', labelHi: 'अनुबंध की अवधि (महीने)', type: 'number', defaultValue: 12, section: 'terms' }
  ],
  clauses: [
    {
      id: 'cons_c1',
      titleEn: '1. Advisory Retainer & Independence',
      titleHi: '1. परामर्श मानदेय एवं स्वतंत्र प्रास्थिति',
      textEn: 'The Consultant shall render advisory services in {{consultancyDomain}} on an independent contractor basis for {{termMonths}} months in consideration of a monthly retainer of INR {{monthlyRetainer}} ({{monthlyRetainerWordsEn}}).',
      textHi: 'सलाहकार एक स्वतंत्र संविदाकार के रूप में {{termMonths}} माह तक {{consultancyDomain}} में परामर्श देगा जिसके बदले मासिक {{monthlyRetainer}} रुपये ({{monthlyRetainerWordsHi}}) रिटेनर शुल्क देय होगा।'
    }
  ]
}

// 12. Vendor & Supply Agreement
export const vendorSupplyTemplate: AgreementTemplateDefinition = {
  code: 'vendor_supply',
  category: 'Business & Work',
  titleEn: 'Master Goods & Vendor Supply Agreement',
  titleHi: 'मास्टर माल एवं विक्रेता आपूर्ति अनुबंध',
  descriptionEn: 'Defines procurement terms, inspection standards, payment milestones, defect liability, and delivery SLAs.',
  descriptionHi: 'औद्योगिक कच्चा माल, उपकरण एवं उत्पाद आपूर्ति, गुणवत्ता निरीक्षण व भुगतान अनुबंध।',
  estimatedMinutes: 6,
  iconName: 'Truck',
  languages: ['EN', 'HI'],
  sampleData: {
    goodsDescription: 'High-precision fabricated steel components and sheet metal enclosures',
    deliveryTimelineDays: 30,
    paymentTermDays: 45,
    defectLiabilityMonths: 12,
    buyerName: 'Continental Engineering Works',
    vendorName: 'Bharat Precision Forge Ltd',
    city: 'Pune',
    state: 'Maharashtra'
  },
  fields: [
    { id: 'goodsDescription', labelEn: 'Description of Materials / Goods', labelHi: 'आपूर्ति किए जाने वाले माल का विवरण', type: 'textarea', required: true, section: 'terms' },
    { id: 'deliveryTimelineDays', labelEn: 'Delivery Timeline (Days from PO)', labelHi: 'आदेश प्राप्ति से आपूर्ति समय (दिन)', type: 'number', defaultValue: 30, section: 'terms' },
    { id: 'defectLiabilityMonths', labelEn: 'Defect Warranty Period (Months)', labelHi: 'खराबी वारंटी / दोष दायित्व अवधि (माह)', type: 'number', defaultValue: 12, section: 'terms' }
  ],
  clauses: [
    {
      id: 'ven_c1',
      titleEn: '1. Supply & Quality Warranty',
      titleHi: '1. माल आपूर्ति एवं गुणवत्ता आश्वासन',
      textEn: 'The Vendor shall manufacture and supply {{goodsDescription}} complying strictly with purchase orders within {{deliveryTimelineDays}} days. The Vendor warrants all goods against manufacturing defects for {{defectLiabilityMonths}} months.',
      textHi: 'विक्रेता खरीद आदेश के अनुसार {{deliveryTimelineDays}} दिनों के भीतर {{goodsDescription}} की आपूर्ति करेगा तथा {{defectLiabilityMonths}} महीने तक निर्माण संबंधी खराबी से मुक्त होने की वारंटी प्रदान करता है।'
    }
  ]
}
