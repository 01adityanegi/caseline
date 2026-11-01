/**
 * State-wise Indian Legal Pointers & Compliance Guidelines
 * Informational guidance on Stamp Duty, Registration Act (Sec 17), and E-stamping.
 */

export interface StateLegalInfo {
  state: string
  stampDutyRent: string
  eStampAvailable: boolean
  registrationMandatoryMonths: number
  registrationNotes: string
  portalName?: string
  portalUrl?: string
}

export const STATE_LEGAL_NOTES: Record<string, StateLegalInfo> = {
  'Delhi': {
    state: 'Delhi (NCT)',
    stampDutyRent: '2% of average annual rent + deposit if under 5 years; 50 to 500 INR for 11-month lease deeds.',
    eStampAvailable: true,
    registrationMandatoryMonths: 11,
    registrationNotes: 'Rent agreements exceeding 11 months require mandatory registration at the Sub-Registrar Office under Section 17 of Registration Act 1908.',
    portalName: 'SHCIL e-Stamping Delhi',
    portalUrl: 'https://www.shcilestamp.com'
  },
  'Maharashtra': {
    state: 'Maharashtra',
    stampDutyRent: '0.25% of total rent for entire period + refundable deposit amount. E-filing is compulsory.',
    eStampAvailable: true,
    registrationMandatoryMonths: 1, // Compulsory even for 11 months under Maharashtra Rent Control Act
    registrationNotes: 'Under Section 55 of Maharashtra Rent Control Act 1999, every tenancy agreement must be registered regardless of duration.',
    portalName: 'IGR Maharashtra e-Registration',
    portalUrl: 'https://igrmaharashtra.gov.in'
  },
  'Karnataka': {
    state: 'Karnataka',
    stampDutyRent: '0.5% to 1% of total annual rent and advance deposit; 500 INR for lease up to 11 months.',
    eStampAvailable: true,
    registrationMandatoryMonths: 11,
    registrationNotes: 'Agreements for 11 months are standardly executed on non-judicial e-stamp paper. 12+ months requires SRO registration.',
    portalName: 'Kaveri Online Services',
    portalUrl: 'https://kaveri.karnataka.gov.in'
  },
  'Uttar Pradesh': {
    state: 'Uttar Pradesh (Noida / Greater Noida / Lucknow)',
    stampDutyRent: '2% of average annual rent for residential; 100 to 500 INR e-stamp paper for 11 months.',
    eStampAvailable: true,
    registrationMandatoryMonths: 11,
    registrationNotes: 'Model Tenancy Act adopted: written agreement submission to the Rent Authority is encouraged within 60 days.',
    portalName: 'IGRSUP Online',
    portalUrl: 'https://igrsup.gov.in'
  },
  'Haryana': {
    state: 'Haryana (Gurugram / Faridabad)',
    stampDutyRent: '1.5% to 2% for registered deeds; 100 to 500 INR e-stamp for standard 11-month rent deeds.',
    eStampAvailable: true,
    registrationMandatoryMonths: 11,
    registrationNotes: 'Standard 11-month tenancy agreements avoid compulsory registration fee but must be notarized.',
    portalName: 'Jamabandi Haryana e-Stamp',
    portalUrl: 'https://jamabandi.nic.in'
  },
  'Tamil Nadu': {
    state: 'Tamil Nadu',
    stampDutyRent: '1% of total rent + deposit value, capped at standard schedule.',
    eStampAvailable: true,
    registrationMandatoryMonths: 11,
    registrationNotes: 'Under TN Regulation of Rights and Responsibilities of Landlords and Tenants Act 2019, registration on tenancy portal is mandatory.',
    portalName: 'TNRenancy Portal',
    portalUrl: 'https://www.tenancy.tn.gov.in'
  }
}

export function getLegalNotesForTemplate(templateCode: string, state: string = 'Delhi') {
  const stateData = STATE_LEGAL_NOTES[state] || STATE_LEGAL_NOTES['Delhi']

  const generalTips: string[] = [
    'Notarization vs Registration: Notarization verifies identity only; Registration under Sec 17 provides statutory legal presumption in court.',
    'Witness Requirement: Always execute in the physical or digital presence of at least two independent adult witnesses.',
    'Aadhaar Masking: As per UIDAI circular, only use masked Aadhaar (first 8 digits hidden: XXXX-XXXX-1234) for contract records.',
    'TDS Compliance: For monthly rent exceeding INR 50,000, tenant is required to deduct 5% TDS under Section 194-IB of Income Tax Act.'
  ]

  return {
    stateInfo: stateData,
    generalTips,
    disclaimer: 'This information is compiled for educational reference only and does not constitute formal legal counsel. Check with a qualified advocate for complex commercial conveyancing.'
  }
}
