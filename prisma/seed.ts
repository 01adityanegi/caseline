import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { generateCaseNumber, generateInvoiceNumber } from '../lib/utils'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding CaseLine database...')

  // Clean slate
  await prisma.aIInsight.deleteMany()
  await prisma.notification.deleteMany()
  await prisma.auditLog.deleteMany()
  await prisma.communication.deleteMany()
  await prisma.note.deleteMany()
  await prisma.documentChunk.deleteMany()
  await prisma.documentVersion.deleteMany()
  await prisma.document.deleteMany()
  await prisma.timeEntry.deleteMany()
  await prisma.invoice.deleteMany()
  await prisma.deadline.deleteMany()
  await prisma.hearing.deleteMany()
  await prisma.task.deleteMany()
  await prisma.caseParty.deleteMany()
  await prisma.case.deleteMany()
  await prisma.client.deleteMany()
  await prisma.user.deleteMany()
  await prisma.organization.deleteMany()

  // ============================================================
  // ORGANIZATION
  // ============================================================
  const org = await prisma.organization.create({
    data: {
      id: 'org-sharma-associates',
      name: 'Sharma & Mehta Associates',
      slug: 'sharma-mehta',
      settings: JSON.stringify({
        timezone: 'Asia/Kolkata',
        currency: 'INR',
        defaultHourlyRate: 5000,
      }),
    },
  })

  // ============================================================
  // USERS (8 across all roles)
  // ============================================================
  const password = await bcrypt.hash('caseline123', 10)

  const [adminUser, partnerArjun, partnerPriya, associateSanjeev, associateNisha, paralegalRahul, clientUser1, clientUser2] = await Promise.all([
    prisma.user.create({
      data: {
        id: 'user-admin',
        email: 'admin@caseline.in',
        name: 'Vikram Sharma',
        password,
        role: 'ADMIN',
        phone: '+91 98110 00001',
        hourlyRate: 0,
        organizationId: org.id,
      },
    }),
    prisma.user.create({
      data: {
        id: 'user-partner-1',
        email: 'arjun@caseline.in',
        name: 'Arjun Mehta',
        password,
        role: 'PARTNER',
        phone: '+91 98110 00002',
        hourlyRate: 8000,
        organizationId: org.id,
      },
    }),
    prisma.user.create({
      data: {
        id: 'user-partner-2',
        email: 'priya@caseline.in',
        name: 'Priya Kapoor',
        password,
        role: 'PARTNER',
        phone: '+91 98110 00003',
        hourlyRate: 7500,
        organizationId: org.id,
      },
    }),
    prisma.user.create({
      data: {
        id: 'user-associate-1',
        email: 'sanjeev@caseline.in',
        name: 'Sanjeev Kumar',
        password,
        role: 'ASSOCIATE',
        phone: '+91 98110 00004',
        hourlyRate: 4000,
        organizationId: org.id,
      },
    }),
    prisma.user.create({
      data: {
        id: 'user-associate-2',
        email: 'nisha@caseline.in',
        name: 'Nisha Reddy',
        password,
        role: 'ASSOCIATE',
        phone: '+91 98110 00005',
        hourlyRate: 3500,
        organizationId: org.id,
      },
    }),
    prisma.user.create({
      data: {
        id: 'user-paralegal',
        email: 'rahul@caseline.in',
        name: 'Rahul Verma',
        password,
        role: 'PARALEGAL',
        phone: '+91 98110 00006',
        hourlyRate: 1500,
        organizationId: org.id,
      },
    }),
    prisma.user.create({
      data: {
        id: 'user-client-1',
        email: 'client@caseline.in',
        name: 'Rajesh Agarwal',
        password,
        role: 'CLIENT',
        phone: '+91 98110 00007',
        hourlyRate: 0,
        organizationId: org.id,
      },
    }),
    prisma.user.create({
      data: {
        id: 'user-client-2',
        email: 'client2@caseline.in',
        name: 'Sunita Patel',
        password,
        role: 'CLIENT',
        phone: '+91 98110 00008',
        hourlyRate: 0,
        organizationId: org.id,
      },
    }),
  ])

  // ============================================================
  // CLIENTS (12)
  // ============================================================
  const clients = await Promise.all([
    prisma.client.create({
      data: {
        id: 'client-1',
        name: 'Meridian Technologies Pvt. Ltd.',
        email: 'legal@meridiantech.in',
        phone: '+91 11 4567 8900',
        type: 'CORPORATE',
        address: '15, Connaught Place',
        city: 'New Delhi',
        state: 'Delhi',
        pin: '110001',
        gstin: '07AABCM1234F1ZR',
        organizationId: org.id,
      },
    }),
    prisma.client.create({
      data: {
        id: 'client-2',
        name: 'Rajesh Agarwal',
        email: 'rajesh.agarwal@gmail.com',
        phone: '+91 98110 00007',
        type: 'INDIVIDUAL',
        address: 'B-14, Green Park',
        city: 'New Delhi',
        state: 'Delhi',
        pin: '110016',
        organizationId: org.id,
      },
    }),
    prisma.client.create({
      data: {
        id: 'client-3',
        name: 'Bharat Steel Works Ltd.',
        email: 'legal@bharatsteel.co.in',
        phone: '+91 22 6789 0123',
        type: 'CORPORATE',
        address: 'Nariman Point',
        city: 'Mumbai',
        state: 'Maharashtra',
        gstin: '27AABFB5678G1ZS',
        organizationId: org.id,
      },
    }),
    prisma.client.create({
      data: {
        id: 'client-4',
        name: 'Kavita Sharma',
        email: 'kavita.sharma@yahoo.com',
        phone: '+91 98220 34567',
        type: 'INDIVIDUAL',
        address: '7, Juhu Tara Road',
        city: 'Mumbai',
        state: 'Maharashtra',
        pin: '400049',
        organizationId: org.id,
      },
    }),
    prisma.client.create({
      data: {
        id: 'client-5',
        name: 'Northern Developers Consortium',
        email: 'info@ndcgroup.in',
        phone: '+91 11 2345 6789',
        type: 'CORPORATE',
        address: 'DLF Cyber City, Phase 2',
        city: 'Gurugram',
        state: 'Haryana',
        organizationId: org.id,
      },
    }),
    prisma.client.create({
      data: {
        id: 'client-6',
        name: 'Ravi Shankar Tiwari',
        email: 'ravi.tiwari@hotmail.com',
        phone: '+91 99930 56789',
        type: 'INDIVIDUAL',
        address: '45, Civil Lines',
        city: 'Allahabad',
        state: 'Uttar Pradesh',
        organizationId: org.id,
      },
    }),
    prisma.client.create({
      data: {
        id: 'client-7',
        name: 'InnovateSoft Solutions LLP',
        email: 'legal@innovatesoft.io',
        phone: '+91 80 4567 8901',
        type: 'CORPORATE',
        address: 'Whitefield',
        city: 'Bengaluru',
        state: 'Karnataka',
        gstin: '29AABFI9012H1ZT',
        organizationId: org.id,
      },
    }),
    prisma.client.create({
      data: {
        id: 'client-8',
        name: 'Sunita Patel',
        email: 'sunita.patel@gmail.com',
        phone: '+91 98110 00008',
        type: 'INDIVIDUAL',
        address: '22, Satellite Road',
        city: 'Ahmedabad',
        state: 'Gujarat',
        organizationId: org.id,
      },
    }),
    prisma.client.create({
      data: {
        id: 'client-9',
        name: 'Coastal Fisheries Cooperative',
        email: 'admin@coastalfish.org',
        phone: '+91 44 2345 6789',
        type: 'CORPORATE',
        address: 'Marina Beach Road',
        city: 'Chennai',
        state: 'Tamil Nadu',
        organizationId: org.id,
      },
    }),
    prisma.client.create({
      data: {
        id: 'client-10',
        name: 'Harinder Singh Bhatia',
        email: 'harinder.bhatia@outlook.com',
        phone: '+91 98141 23456',
        type: 'INDIVIDUAL',
        address: '33, Model Town',
        city: 'Chandigarh',
        state: 'Punjab',
        organizationId: org.id,
      },
    }),
    prisma.client.create({
      data: {
        id: 'client-11',
        name: 'Deccan Pharma Pvt. Ltd.',
        email: 'legal@deccanpharma.com',
        phone: '+91 40 6789 0123',
        type: 'CORPORATE',
        address: 'HITEC City',
        city: 'Hyderabad',
        state: 'Telangana',
        gstin: '36AABFD3456K1ZU',
        organizationId: org.id,
      },
    }),
    prisma.client.create({
      data: {
        id: 'client-12',
        name: 'Meera Nair',
        email: 'meera.nair@gmail.com',
        phone: '+91 94470 98765',
        type: 'INDIVIDUAL',
        address: '18, MG Road',
        city: 'Kochi',
        state: 'Kerala',
        organizationId: org.id,
      },
    }),
  ])

  // ============================================================
  // CASES (40 across practice areas and statuses)
  // ============================================================
  const now = new Date()
  const d = (days: number) => new Date(now.getTime() + days * 24 * 60 * 60 * 1000)

  const caseData = [
    // CORPORATE & COMMERCIAL (8)
    {
      id: 'case-1', title: 'Meridian Technologies vs. Apex Software Solutions', status: 'HEARING',
      practiceArea: 'Corporate & Commercial', court: 'High Court of Delhi', judge: 'Hon. Justice P.K. Sharma',
      clientId: 'client-1', leadId: 'user-partner-1', priority: 'HIGH', caseValue: 4800000,
      riskScore: 72, filingDate: new Date('2025-01-10'), nextHearingDate: d(17),
      description: 'Breach of software development agreement. Petitioner seeks recovery of advance and damages.',
    },
    {
      id: 'case-2', title: 'Bharat Steel Works - SEBI Investigation', status: 'INVESTIGATION',
      practiceArea: 'Corporate & Commercial', court: 'Securities Appellate Tribunal',
      clientId: 'client-3', leadId: 'user-partner-1', priority: 'CRITICAL', caseValue: 15000000,
      riskScore: 88, filingDate: new Date('2026-03-15'), nextHearingDate: d(5),
      description: 'SEBI show cause notice alleging insider trading. Pre-hearing stage.',
    },
    {
      id: 'case-3', title: 'Northern Developers - Land Acquisition Dispute', status: 'FILING',
      practiceArea: 'Property & Real Estate', court: 'High Court of Delhi', judge: 'Hon. Justice R.S. Negi',
      clientId: 'client-5', leadId: 'user-partner-2', priority: 'HIGH', caseValue: 35000000,
      riskScore: 45, filingDate: new Date('2026-06-01'),
      description: 'Challenge to land acquisition proceedings under the Right to Fair Compensation Act 2013.',
    },
    {
      id: 'case-4', title: 'InnovateSoft - Patent Infringement Matter', status: 'HEARING',
      practiceArea: 'Intellectual Property', court: 'High Court of Karnataka',
      clientId: 'client-7', leadId: 'user-partner-2', priority: 'HIGH', caseValue: 8500000,
      riskScore: 60, filingDate: new Date('2025-09-20'), nextHearingDate: d(22),
      description: 'Patent infringement suit for unauthorized use of proprietary API technology.',
    },
    {
      id: 'case-5', title: 'Deccan Pharma - Drug Licence Dispute', status: 'FILING',
      practiceArea: 'Corporate & Commercial', court: 'High Court of Telangana',
      clientId: 'client-11', leadId: 'user-associate-1', priority: 'MEDIUM', caseValue: 2500000,
      riskScore: 35, filingDate: new Date('2026-08-10'),
      description: 'Challenge to cancellation of drug manufacturing licence by the State Drug Authority.',
    },
    {
      id: 'case-6', title: 'Bharat Steel - Tax Assessment Appeal', status: 'HEARING',
      practiceArea: 'Tax & Revenue', court: 'Income Tax Appellate Tribunal',
      clientId: 'client-3', leadId: 'user-partner-1', priority: 'HIGH', caseValue: 12000000,
      riskScore: 55, filingDate: new Date('2025-11-30'), nextHearingDate: d(8),
      description: 'Appeal against Income Tax assessment order for AY 2023-24 disallowing deductions.',
    },
    {
      id: 'case-7', title: 'InnovateSoft - Employee Non-Compete Enforcement', status: 'INVESTIGATION',
      practiceArea: 'Labour & Employment', court: 'District Court, Bengaluru',
      clientId: 'client-7', leadId: 'user-associate-2', priority: 'MEDIUM', caseValue: 1500000,
      riskScore: 40, filingDate: new Date('2026-09-05'),
      description: 'Injunction sought against former employee for breach of non-compete and NDA obligations.',
    },
    {
      id: 'case-8', title: 'Northern Developers - Construction Contract Arbitration', status: 'HEARING',
      practiceArea: 'Arbitration', court: 'Arbitration Tribunal',
      clientId: 'client-5', leadId: 'user-partner-1', priority: 'CRITICAL', caseValue: 22000000,
      riskScore: 80, filingDate: new Date('2026-02-15'), nextHearingDate: d(3),
      description: 'Arbitration proceedings for disputes arising from the Gurgaon Phase-3 construction contract.',
    },
    // FAMILY LAW (6)
    {
      id: 'case-9', title: 'Kavita Sharma - Matrimonial Dispute and Custody', status: 'HEARING',
      practiceArea: 'Family Law', court: 'District Court, Mumbai',
      clientId: 'client-4', leadId: 'user-partner-2', priority: 'HIGH', caseValue: 0,
      riskScore: 65, filingDate: new Date('2025-05-15'), nextHearingDate: d(14),
      description: 'Divorce petition and custody of two minor children. Interim maintenance granted.',
    },
    {
      id: 'case-10', title: 'Rajesh Agarwal - Property Succession Dispute', status: 'FILING',
      practiceArea: 'Family Law', court: 'District Court, Delhi',
      clientId: 'client-2', leadId: 'user-associate-1', priority: 'MEDIUM', caseValue: 18000000,
      riskScore: 30, filingDate: new Date('2026-07-20'),
      description: 'Dispute over testamentary succession of ancestral property in South Delhi.',
    },
    {
      id: 'case-11', title: 'Meera Nair - Maintenance and Alimony', status: 'JUDGMENT',
      practiceArea: 'Family Law', court: 'Family Court, Kochi',
      clientId: 'client-12', leadId: 'user-associate-2', priority: 'LOW', caseValue: 0,
      riskScore: 15, filingDate: new Date('2024-09-10'), nextHearingDate: d(30),
      description: 'Judgment reserved on petition for permanent alimony after divorce decree.',
    },
    {
      id: 'case-12', title: 'Harinder Singh - Guardianship Application', status: 'FILING',
      practiceArea: 'Family Law', court: 'District Court, Chandigarh',
      clientId: 'client-10', leadId: 'user-associate-1', priority: 'MEDIUM', caseValue: 0,
      riskScore: 25, filingDate: new Date('2026-09-25'),
      description: 'Application for guardianship of minor nephew after accidental death of parents.',
    },
    {
      id: 'case-13', title: 'Sunita Patel - Domestic Violence Protection', status: 'HEARING',
      practiceArea: 'Family Law', court: 'Magistrate Court, Ahmedabad',
      clientId: 'client-8', leadId: 'user-partner-2', priority: 'HIGH', caseValue: 0,
      riskScore: 70, filingDate: new Date('2026-08-15'), nextHearingDate: d(6),
      description: 'Protection order and right of residence under the Domestic Violence Act.',
    },
    {
      id: 'case-14', title: 'Ravi Tiwari - Partition of Ancestral Property', status: 'INVESTIGATION',
      practiceArea: 'Family Law', court: 'District Court, Allahabad',
      clientId: 'client-6', leadId: 'user-associate-2', priority: 'MEDIUM', caseValue: 9500000,
      riskScore: 35, filingDate: new Date('2026-10-01'),
      description: 'Suit for partition of ancestral agricultural land among four brothers.',
    },
    // CRIMINAL (5)
    {
      id: 'case-15', title: 'Ravi Shankar Tiwari - IPC Fraud Case', status: 'HEARING',
      practiceArea: 'Criminal Defense', court: 'Sessions Court, Allahabad',
      clientId: 'client-6', leadId: 'user-partner-1', priority: 'CRITICAL', caseValue: 0,
      riskScore: 85, filingDate: new Date('2025-03-20'), nextHearingDate: d(2),
      description: 'Defense in criminal case under IPC Sections 420, 406. Client on bail. Next: arguments on charge framing.',
    },
    {
      id: 'case-16', title: 'Harinder Bhatia - Bail Application', status: 'INTAKE',
      practiceArea: 'Criminal Defense', court: 'High Court of Punjab and Haryana',
      clientId: 'client-10', leadId: 'user-partner-2', priority: 'CRITICAL', caseValue: 0,
      riskScore: 90, filingDate: null, nextHearingDate: d(1),
      description: 'Anticipatory bail application in drug trafficking case. Urgent.',
    },
    {
      id: 'case-17', title: 'Sunita Patel - Defamation Complaint', status: 'INVESTIGATION',
      practiceArea: 'Criminal Defense', court: 'Magistrate Court, Ahmedabad',
      clientId: 'client-8', leadId: 'user-associate-1', priority: 'LOW', caseValue: 0,
      riskScore: 20, filingDate: new Date('2026-10-10'),
      description: 'Private complaint of criminal defamation against employer.',
    },
    {
      id: 'case-18', title: 'Coastal Fisheries - GST Evasion Investigation', status: 'INVESTIGATION',
      practiceArea: 'Tax & Revenue', court: 'GST Appellate Authority',
      clientId: 'client-9', leadId: 'user-partner-1', priority: 'HIGH', caseValue: 5600000,
      riskScore: 75, filingDate: new Date('2026-09-01'), nextHearingDate: d(12),
      description: 'Response to show-cause notice alleging GST evasion of INR 56 lakhs.',
    },
    {
      id: 'case-19', title: 'Meera Nair - Property Forgery Complaint', status: 'HEARING',
      practiceArea: 'Criminal Defense', court: 'Sessions Court, Kochi',
      clientId: 'client-12', leadId: 'user-associate-2', priority: 'MEDIUM', caseValue: 0,
      riskScore: 50, filingDate: new Date('2025-07-08'), nextHearingDate: d(25),
      description: 'Defense in forgery and cheating case related to land title documents.',
    },
    // PROPERTY & REAL ESTATE (5)
    {
      id: 'case-20', title: 'Rajesh Agarwal - Possession of Flat', status: 'FILING',
      practiceArea: 'Property & Real Estate', court: 'District Court, Delhi',
      clientId: 'client-2', leadId: 'user-associate-1', priority: 'MEDIUM', caseValue: 8500000,
      riskScore: 42, filingDate: new Date('2026-07-30'),
      description: 'Suit for specific performance and possession of residential flat booked in 2022.',
    },
    {
      id: 'case-21', title: 'Northern Developers - RERA Complaint', status: 'HEARING',
      practiceArea: 'Property & Real Estate', court: 'Real Estate Regulatory Authority, Haryana',
      clientId: 'client-5', leadId: 'user-partner-2', priority: 'HIGH', caseValue: 45000000,
      riskScore: 68, filingDate: new Date('2026-01-15'), nextHearingDate: d(10),
      description: 'Defense against RERA complaints filed by 34 home buyers for delayed possession.',
    },
    {
      id: 'case-22', title: 'Ravi Tiwari - Tenant Eviction', status: 'CLOSED',
      practiceArea: 'Property & Real Estate', court: 'Rent Control Court, Allahabad',
      clientId: 'client-6', leadId: 'user-associate-2', priority: 'LOW', caseValue: 0,
      riskScore: 0, filingDate: new Date('2024-05-10'), closedDate: new Date('2026-09-15'),
      description: 'Eviction of defaulting tenant from commercial property. Decree obtained.',
    },
    {
      id: 'case-23', title: 'Kavita Sharma - Matrimonial Home Dispute', status: 'HEARING',
      practiceArea: 'Property & Real Estate', court: 'High Court of Bombay',
      clientId: 'client-4', leadId: 'user-partner-2', priority: 'MEDIUM', caseValue: 25000000,
      riskScore: 55, filingDate: new Date('2025-11-20'), nextHearingDate: d(20),
      description: 'Dispute over ownership of matrimonial home during divorce proceedings.',
    },
    {
      id: 'case-24', title: 'Harinder Singh - Ancestral Property Claim', status: 'INVESTIGATION',
      practiceArea: 'Property & Real Estate', court: 'High Court of Punjab and Haryana',
      clientId: 'client-10', leadId: 'user-associate-1', priority: 'MEDIUM', caseValue: 12000000,
      riskScore: 30, filingDate: new Date('2026-10-05'),
      description: 'Challenge to sale of ancestral property without consent of all legal heirs.',
    },
    // LABOUR & EMPLOYMENT (4)
    {
      id: 'case-25', title: 'Coastal Fisheries - Workmen Compensation Claim', status: 'HEARING',
      practiceArea: 'Labour & Employment', court: 'Labour Court, Chennai',
      clientId: 'client-9', leadId: 'user-associate-2', priority: 'MEDIUM', caseValue: 1200000,
      riskScore: 45, filingDate: new Date('2026-04-20'), nextHearingDate: d(28),
      description: 'Claim for compensation by injured workman under the Workmen Compensation Act.',
    },
    {
      id: 'case-26', title: 'Deccan Pharma - EPFO Compliance Dispute', status: 'INVESTIGATION',
      practiceArea: 'Labour & Employment', court: 'Employees Provident Fund Tribunal',
      clientId: 'client-11', leadId: 'user-associate-1', priority: 'MEDIUM', caseValue: 2800000,
      riskScore: 48, filingDate: new Date('2026-09-10'),
      description: 'Challenge to EPFO order demanding arrears of provident fund contribution for contract workers.',
    },
    {
      id: 'case-27', title: 'Bharat Steel - Industrial Dispute Conciliation', status: 'CLOSED',
      practiceArea: 'Labour & Employment', court: 'Labour Court, Mumbai',
      clientId: 'client-3', leadId: 'user-associate-2', priority: 'LOW', caseValue: 0,
      riskScore: 0, filingDate: new Date('2025-06-01'), closedDate: new Date('2026-08-20'),
      description: 'Strike settlement and return to work agreement through conciliation. Settled.',
    },
    {
      id: 'case-28', title: 'Meera Nair - Wrongful Termination Claim', status: 'FILING',
      practiceArea: 'Labour & Employment', court: 'Labour Court, Kochi',
      clientId: 'client-12', leadId: 'user-associate-2', priority: 'HIGH', caseValue: 600000,
      riskScore: 60, filingDate: new Date('2026-10-15'),
      description: 'Claim for reinstatement and back wages after wrongful termination from private hospital.',
    },
    // IP (3)
    {
      id: 'case-29', title: 'Deccan Pharma - Trademark Opposition', status: 'FILING',
      practiceArea: 'Intellectual Property', court: 'Trade Marks Registry, Mumbai',
      clientId: 'client-11', leadId: 'user-associate-1', priority: 'MEDIUM', caseValue: 3000000,
      riskScore: 35, filingDate: new Date('2026-08-01'),
      description: 'Opposition to trademark application by competitor for deceptively similar mark.',
    },
    {
      id: 'case-30', title: 'InnovateSoft - Copyright Infringement', status: 'INVESTIGATION',
      practiceArea: 'Intellectual Property', court: 'District Court, Bengaluru',
      clientId: 'client-7', leadId: 'user-associate-2', priority: 'MEDIUM', caseValue: 2000000,
      riskScore: 40, filingDate: new Date('2026-10-20'),
      description: 'Copyright infringement in software code by ex-employee\'s new company.',
    },
    {
      id: 'case-31', title: 'Meridian Technologies - IP Assignment Agreement', status: 'CLOSED',
      practiceArea: 'Intellectual Property', court: null,
      clientId: 'client-1', leadId: 'user-partner-2', priority: 'LOW', caseValue: 0,
      riskScore: 0, closedDate: new Date('2026-07-01'),
      description: 'Drafting and execution of IP assignment agreement with founding team. Completed.',
    },
    // TAX (3)
    {
      id: 'case-32', title: 'Meridian Technologies - GST Refund Claim', status: 'INVESTIGATION',
      practiceArea: 'Tax & Revenue', court: 'GST Authority',
      clientId: 'client-1', leadId: 'user-associate-1', priority: 'LOW', caseValue: 850000,
      riskScore: 20, filingDate: new Date('2026-10-01'),
      description: 'Processing of GST refund claim for export of IT services.',
    },
    {
      id: 'case-33', title: 'Ravi Tiwari - Income Tax Search Proceedings', status: 'INVESTIGATION',
      practiceArea: 'Tax & Revenue', court: 'Income Tax Department',
      clientId: 'client-6', leadId: 'user-partner-1', priority: 'HIGH', caseValue: 6500000,
      riskScore: 78, filingDate: new Date('2026-09-15'),
      description: 'Response to income tax search and seizure operation. 143(3) assessment proceedings.',
    },
    {
      id: 'case-34', title: 'Coastal Fisheries - Customs Duty Dispute', status: 'HEARING',
      practiceArea: 'Tax & Revenue', court: 'Customs Excise and Service Tax Appellate Tribunal',
      clientId: 'client-9', leadId: 'user-associate-1', priority: 'MEDIUM', caseValue: 3200000,
      riskScore: 50, filingDate: new Date('2025-12-10'), nextHearingDate: d(35),
      description: 'Appeal against customs duty demand on imported fishing equipment.',
    },
    // CONSTITUTIONAL / CONSUMER (3)
    {
      id: 'case-35', title: 'Sunita Patel - Consumer Forum Complaint', status: 'CLOSED',
      practiceArea: 'Consumer Protection', court: 'State Consumer Disputes Redressal Commission, Gujarat',
      clientId: 'client-8', leadId: 'user-associate-2', priority: 'LOW', caseValue: 250000,
      riskScore: 0, filingDate: new Date('2025-01-20'), closedDate: new Date('2026-05-10'),
      description: 'Consumer complaint against builder for deficiency in housing services. Awarded.',
    },
    {
      id: 'case-36', title: 'Rajesh Agarwal - Banking Ombudsman', status: 'CLOSED',
      practiceArea: 'Consumer Protection', court: 'Banking Ombudsman, Delhi',
      clientId: 'client-2', leadId: 'user-paralegal', priority: 'LOW', caseValue: 150000,
      riskScore: 0, filingDate: new Date('2025-08-01'), closedDate: new Date('2026-03-20'),
      description: 'Complaint for fraudulent debit from savings account. Bank ordered to refund. Closed.',
    },
    {
      id: 'case-37', title: 'Meera Nair - RTI Appeal', status: 'INTAKE',
      practiceArea: 'Constitutional', court: 'Central Information Commission',
      clientId: 'client-12', leadId: 'user-paralegal', priority: 'LOW', caseValue: 0,
      riskScore: 15, filingDate: null,
      description: 'Second appeal before CIC for non-furnishing of information under the RTI Act.',
    },
    // INSOLVENCY / ARBITRATION (3)
    {
      id: 'case-38', title: 'Bharat Steel - IBC Insolvency Application', status: 'FILING',
      practiceArea: 'Insolvency & Bankruptcy', court: 'National Company Law Tribunal',
      clientId: 'client-3', leadId: 'user-partner-1', priority: 'CRITICAL', caseValue: 85000000,
      riskScore: 82, filingDate: new Date('2026-10-10'),
      description: 'Section 7 application under IBC against defaulting borrower for recovery of dues.',
    },
    {
      id: 'case-39', title: 'InnovateSoft - Venture Capital Dispute Arbitration', status: 'INVESTIGATION',
      practiceArea: 'Arbitration', court: 'Singapore International Arbitration Centre',
      clientId: 'client-7', leadId: 'user-partner-2', priority: 'HIGH', caseValue: 25000000,
      riskScore: 65, filingDate: new Date('2026-09-20'),
      description: 'SIAC arbitration with investors over breach of SHA terms and dilution dispute.',
    },
    {
      id: 'case-40', title: 'Northern Developers - Environmental Clearance Challenge', status: 'HEARING',
      practiceArea: 'Environmental', court: 'National Green Tribunal',
      clientId: 'client-5', leadId: 'user-associate-2', priority: 'HIGH', caseValue: 0,
      riskScore: 62, filingDate: new Date('2026-06-10'), nextHearingDate: d(18),
      description: 'Challenge to environmental clearance granted to competing developer for adjacent project.',
    },
  ]

  const cases = await Promise.all(
    caseData.map((c, i) =>
      prisma.case.create({
        data: {
          ...c,
          caseNumber: generateCaseNumber(i + 1),
          organizationId: org.id,
          tags: JSON.stringify([]),
        },
      })
    )
  )

  // ============================================================
  // CASE PARTIES
  // ============================================================
  await prisma.caseParty.createMany({
    data: [
      { caseId: 'case-1', role: 'Petitioner', name: 'Meridian Technologies Pvt. Ltd.', counsel: 'Arjun Mehta' },
      { caseId: 'case-1', role: 'Respondent', name: 'Apex Software Solutions LLP', counsel: 'Adv. Rajiv Bose' },
      { caseId: 'case-2', role: 'Noticee', name: 'Bharat Steel Works Ltd.', counsel: 'Arjun Mehta' },
      { caseId: 'case-2', role: 'Regulatory Authority', name: 'Securities and Exchange Board of India', counsel: 'SEBI Panel Advocate' },
      { caseId: 'case-3', role: 'Petitioner', name: 'Northern Developers Consortium', counsel: 'Priya Kapoor' },
      { caseId: 'case-3', role: 'Respondent', name: 'State of Haryana - Revenue Department', counsel: 'Adv. General' },
      { caseId: 'case-4', role: 'Plaintiff', name: 'InnovateSoft Solutions LLP', counsel: 'Priya Kapoor' },
      { caseId: 'case-4', role: 'Defendant', name: 'TechServe Innovations Pvt. Ltd.', counsel: 'Adv. Anita Kulkarni' },
      { caseId: 'case-9', role: 'Petitioner', name: 'Kavita Sharma', counsel: 'Priya Kapoor' },
      { caseId: 'case-9', role: 'Respondent', name: 'Ramesh Sharma', counsel: 'Adv. Mahesh Shetty' },
      { caseId: 'case-15', role: 'Accused', name: 'Ravi Shankar Tiwari', counsel: 'Arjun Mehta' },
      { caseId: 'case-15', role: 'Complainant', name: 'State of Uttar Pradesh', counsel: 'Public Prosecutor' },
      { caseId: 'case-16', role: 'Applicant', name: 'Harinder Singh Bhatia', counsel: 'Priya Kapoor' },
      { caseId: 'case-16', role: 'Respondent', name: 'State of Punjab', counsel: 'Adv. General, Punjab' },
      { caseId: 'case-38', role: 'Financial Creditor', name: 'Bharat Steel Works Ltd.', counsel: 'Arjun Mehta' },
      { caseId: 'case-38', role: 'Corporate Debtor', name: 'Prism Infrastructure Pvt. Ltd.', counsel: 'Resolution Professional' },
    ],
  })

  // ============================================================
  // DOCUMENTS (120 across cases)
  // ============================================================
  const docTemplates = [
    { title: 'Petition', folder: 'Pleadings', mimeType: 'application/pdf', status: 'READY' },
    { title: 'Written Statement', folder: 'Pleadings', mimeType: 'application/pdf', status: 'READY' },
    { title: 'Vakalatnama', folder: 'Court Filings', mimeType: 'application/pdf', status: 'READY' },
    { title: 'Court Order', folder: 'Orders', mimeType: 'application/pdf', status: 'READY' },
    { title: 'Affidavit', folder: 'Evidence', mimeType: 'application/pdf', status: 'READY' },
    { title: 'Legal Notice', folder: 'Correspondence', mimeType: 'application/pdf', status: 'READY' },
    { title: 'Agreement', folder: 'Contracts', mimeType: 'application/pdf', status: 'READY' },
    { title: 'Evidence Document', folder: 'Evidence', mimeType: 'application/pdf', status: 'READY' },
    { title: 'Written Arguments', folder: 'Pleadings', mimeType: 'application/pdf', status: 'PROCESSING' },
    { title: 'Reply to Notice', folder: 'Correspondence', mimeType: 'application/pdf', status: 'READY' },
    { title: 'Application', folder: 'Court Filings', mimeType: 'application/pdf', status: 'READY' },
    { title: 'Exhibits Bundle', folder: 'Evidence', mimeType: 'application/pdf', status: 'READY' },
  ]

  const docs: Array<{ title: string; caseId: string; folder: string; mimeType: string; status: string; extractedText?: string }> = []
  let docCounter = 0

  for (let i = 0; i < Math.min(cases.length, 40); i++) {
    const numDocs = Math.floor(Math.random() * 3) + 2 // 2-4 docs per case
    for (let j = 0; j < numDocs; j++) {
      const template = docTemplates[j % docTemplates.length]
      docs.push({
        ...template,
        title: `${template.title} - ${cases[i].title.slice(0, 30)}`,
        caseId: cases[i].id,
        extractedText: `This is the extracted text from the ${template.title} document for case ${cases[i].caseNumber}. The document contains details about the parties, the cause of action, the reliefs sought, and the applicable legal provisions. Filed before the ${cases[i].court || 'competent court'}.`,
      })
      docCounter++
      if (docCounter >= 120) break
    }
    if (docCounter >= 120) break
  }

  for (const doc of docs) {
    const created = await prisma.document.create({
      data: {
        title: doc.title,
        filePath: `/uploads/${doc.caseId}/${doc.title.replace(/[^a-z0-9]/gi, '_')}.pdf`,
        fileName: `${doc.title.replace(/[^a-z0-9]/gi, '_')}.pdf`,
        mimeType: doc.mimeType,
        fileSize: Math.floor(Math.random() * 500000) + 50000,
        folder: doc.folder,
        status: doc.status,
        caseId: doc.caseId,
        uploadedBy: 'user-paralegal',
        tags: JSON.stringify([]),
      },
    })

    await prisma.documentVersion.create({
      data: {
        documentId: created.id,
        version: 1,
        filePath: created.filePath,
        extractedText: doc.extractedText || '',
        pageCount: Math.floor(Math.random() * 20) + 3,
      },
    })

    if (doc.extractedText) {
      await prisma.documentChunk.create({
        data: {
          documentId: created.id,
          chunkIndex: 0,
          text: doc.extractedText,
          pageNumber: 1,
          metadata: JSON.stringify({ source: doc.title }),
        },
      })
    }
  }

  // ============================================================
  // HEARINGS (60)
  // ============================================================
  const hearingTypes = ['HEARING', 'MENTION', 'ARGUMENT', 'EVIDENCE', 'JUDGMENT']
  const hearingStatuses = ['SCHEDULED', 'COMPLETED', 'ADJOURNED']

  const hearingData = [
    // Past hearings
    { caseId: 'case-1', title: 'Admission and Notice', date: new Date('2025-02-28'), type: 'HEARING', status: 'COMPLETED', outcome: 'Notice issued to respondent' },
    { caseId: 'case-1', title: 'Evidence Recording PW-1', date: new Date('2026-04-12'), type: 'EVIDENCE', status: 'COMPLETED', outcome: 'PW-1 examined. Cross-examination on next date.' },
    { caseId: 'case-1', title: 'Written Arguments Directed', date: new Date('2026-10-14'), type: 'ARGUMENT', status: 'COMPLETED', outcome: 'Written arguments directed. 4 weeks time.' },
    { caseId: 'case-1', title: 'Final Arguments', date: d(17), type: 'ARGUMENT', status: 'SCHEDULED' },
    { caseId: 'case-2', title: 'First Hearing SEBI', date: d(5), type: 'HEARING', status: 'SCHEDULED' },
    { caseId: 'case-4', title: 'Case Management Hearing', date: d(22), type: 'HEARING', status: 'SCHEDULED' },
    { caseId: 'case-6', title: 'ITAT Hearing - Tax Assessment', date: d(8), type: 'HEARING', status: 'SCHEDULED' },
    { caseId: 'case-8', title: 'Arbitration Session - Evidence', date: d(3), type: 'EVIDENCE', status: 'SCHEDULED' },
    { caseId: 'case-9', title: 'Interim Maintenance Hearing', date: new Date('2026-03-10'), type: 'HEARING', status: 'COMPLETED', outcome: 'Interim maintenance of INR 50,000/month granted.' },
    { caseId: 'case-9', title: 'Custody Hearing', date: d(14), type: 'HEARING', status: 'SCHEDULED' },
    { caseId: 'case-11', title: 'Judgment Reserved', date: new Date('2026-10-20'), type: 'JUDGMENT', status: 'COMPLETED', outcome: 'Judgment reserved' },
    { caseId: 'case-11', title: 'Judgment Delivery', date: d(30), type: 'JUDGMENT', status: 'SCHEDULED' },
    { caseId: 'case-13', title: 'Protection Order Hearing', date: d(6), type: 'HEARING', status: 'SCHEDULED' },
    { caseId: 'case-15', title: 'Bail Extension Hearing', date: new Date('2026-08-20'), type: 'HEARING', status: 'COMPLETED', outcome: 'Bail extended for 3 months.' },
    { caseId: 'case-15', title: 'Charge Framing Arguments', date: d(2), type: 'ARGUMENT', status: 'SCHEDULED' },
    { caseId: 'case-16', title: 'Anticipatory Bail Hearing', date: d(1), type: 'HEARING', status: 'SCHEDULED' },
    { caseId: 'case-18', title: 'SCN Reply Hearing', date: d(12), type: 'HEARING', status: 'SCHEDULED' },
    { caseId: 'case-19', title: 'Defense Evidence Hearing', date: d(25), type: 'EVIDENCE', status: 'SCHEDULED' },
    { caseId: 'case-21', title: 'RERA Conciliation', date: d(10), type: 'HEARING', status: 'SCHEDULED' },
    { caseId: 'case-23', title: 'Status Hearing', date: d(20), type: 'MENTION', status: 'SCHEDULED' },
    { caseId: 'case-25', title: 'Evidence of Claimant', date: d(28), type: 'EVIDENCE', status: 'SCHEDULED' },
    { caseId: 'case-34', title: 'CESTAT Hearing', date: d(35), type: 'HEARING', status: 'SCHEDULED' },
    { caseId: 'case-40', title: 'NGT Hearing', date: d(18), type: 'HEARING', status: 'SCHEDULED' },
    // More past hearings across cases
    { caseId: 'case-3', title: 'Admission of Petition', date: new Date('2026-06-15'), type: 'HEARING', status: 'COMPLETED', outcome: 'Petition admitted. Notice to respondent.' },
    { caseId: 'case-5', title: 'Representation Stage', date: new Date('2026-09-01'), type: 'HEARING', status: 'COMPLETED', outcome: 'Representation filed. Order awaited.' },
    { caseId: 'case-7', title: 'Injunction Application', date: new Date('2026-09-20'), type: 'HEARING', status: 'COMPLETED', outcome: 'Ex-parte injunction granted. Returnable notice issued.' },
    { caseId: 'case-10', title: 'Filing of Suit', date: new Date('2026-08-01'), type: 'HEARING', status: 'COMPLETED', outcome: 'Suit numbered. Notice issued.' },
    { caseId: 'case-12', title: 'First Hearing', date: new Date('2026-10-15'), type: 'HEARING', status: 'COMPLETED', outcome: 'Case registered. Next date fixed.' },
    { caseId: 'case-14', title: 'First Appearance', date: new Date('2026-10-20'), type: 'HEARING', status: 'COMPLETED', outcome: 'Parties present. Issues to be framed.' },
    { caseId: 'case-17', title: 'Complaint Filed', date: new Date('2026-10-15'), type: 'HEARING', status: 'COMPLETED', outcome: 'Complaint registered.' },
    { caseId: 'case-20', title: 'Plaint Presented', date: new Date('2026-08-10'), type: 'HEARING', status: 'COMPLETED', outcome: 'Plaint presented. Summons issued.' },
    { caseId: 'case-24', title: 'Investigation Stage', date: new Date('2026-10-20'), type: 'HEARING', status: 'COMPLETED', outcome: 'Documents called for.' },
    { caseId: 'case-26', title: 'Show Cause Response', date: new Date('2026-10-01'), type: 'HEARING', status: 'COMPLETED', outcome: 'Reply filed.' },
    { caseId: 'case-28', title: 'Labour Court First Date', date: new Date('2026-11-01'), type: 'HEARING', status: 'COMPLETED', outcome: 'Matter registered.' },
    { caseId: 'case-29', title: 'Opposition Filed', date: new Date('2026-08-20'), type: 'HEARING', status: 'COMPLETED', outcome: 'Opposition statement filed.' },
    { caseId: 'case-30', title: 'First Hearing IP', date: new Date('2026-10-25'), type: 'HEARING', status: 'COMPLETED', outcome: 'Ex-parte stay on use of software code.' },
    { caseId: 'case-32', title: 'Refund Application', date: new Date('2026-10-10'), type: 'HEARING', status: 'COMPLETED', outcome: 'Application submitted. Processing.' },
    { caseId: 'case-33', title: 'Assessment Proceedings', date: new Date('2026-10-05'), type: 'HEARING', status: 'COMPLETED', outcome: 'Submission filed.' },
    { caseId: 'case-37', title: 'Second Appeal Filed', date: new Date('2026-10-28'), type: 'HEARING', status: 'COMPLETED', outcome: 'Second appeal registered.' },
    { caseId: 'case-38', title: 'IBC Petition Filed', date: new Date('2026-10-15'), type: 'HEARING', status: 'COMPLETED', outcome: 'Petition filed. Notice to Corporate Debtor.' },
    { caseId: 'case-39', title: 'Arbitration Commenced', date: new Date('2026-10-01'), type: 'HEARING', status: 'COMPLETED', outcome: 'Arbitrator appointed. Statement of Claim filed.' },
  ]

  await prisma.hearing.createMany({ data: hearingData })

  // ============================================================
  // DEADLINES (60 - including overdue and at-risk)
  // ============================================================
  const deadlines = [
    // OVERDUE (critical for AI to flag)
    { caseId: 'case-1', title: 'File Rejoinder to Written Statement', date: d(-15), type: 'FILING', status: 'OVERDUE', riskScore: 100 },
    { caseId: 'case-6', title: 'Submit Tax Computation Documents', date: d(-8), type: 'FILING', status: 'OVERDUE', riskScore: 100 },
    { caseId: 'case-15', title: 'Deposit Bail Surety Documents', date: d(-3), type: 'COMPLIANCE', status: 'OVERDUE', riskScore: 100 },
    { caseId: 'case-21', title: 'Submit RERA Compliance Affidavit', date: d(-2), type: 'COMPLIANCE', status: 'OVERDUE', riskScore: 100 },
    { caseId: 'case-9', title: 'Serve Custody Evaluation Report', date: d(-5), type: 'COMPLIANCE', status: 'OVERDUE', riskScore: 100 },
    // AT-RISK (urgent)
    { caseId: 'case-1', title: 'File Written Arguments', date: d(10), type: 'FILING', status: 'PENDING', riskScore: 85 },
    { caseId: 'case-16', title: 'File Anticipatory Bail Application', date: d(1), type: 'FILING', status: 'PENDING', riskScore: 95 },
    { caseId: 'case-8', title: 'Submit Arbitration Claim Annexures', date: d(3), type: 'FILING', status: 'PENDING', riskScore: 88 },
    { caseId: 'case-2', title: 'File Reply to SEBI SCN', date: d(4), type: 'FILING', status: 'PENDING', riskScore: 90 },
    { caseId: 'case-15', title: 'Submit Written Defense to Charge Sheet', date: d(2), type: 'FILING', status: 'PENDING', riskScore: 92 },
    { caseId: 'case-33', title: 'Respond to IT Assessment Notice', date: d(5), type: 'COMPLIANCE', status: 'PENDING', riskScore: 82 },
    { caseId: 'case-13', title: 'File Evidence Affidavit', date: d(6), type: 'FILING', status: 'PENDING', riskScore: 78 },
    // UPCOMING (normal)
    { caseId: 'case-4', title: 'File Patent Infringement Details', date: d(15), type: 'FILING', status: 'PENDING', riskScore: 45 },
    { caseId: 'case-9', title: 'Mediation Session', date: d(14), type: 'HEARING', status: 'PENDING', riskScore: 40 },
    { caseId: 'case-18', title: 'File GST Reply', date: d(12), type: 'FILING', status: 'PENDING', riskScore: 55 },
    { caseId: 'case-21', title: 'Submit Project Completion Documents', date: d(20), type: 'COMPLIANCE', status: 'PENDING', riskScore: 35 },
    { caseId: 'case-23', title: 'File Property Valuation Report', date: d(25), type: 'FILING', status: 'PENDING', riskScore: 30 },
    { caseId: 'case-34', title: 'Prepare Appeal Brief', date: d(30), type: 'FILING', status: 'PENDING', riskScore: 25 },
    { caseId: 'case-38', title: 'File IBC Section 7 Affidavit', date: d(18), type: 'FILING', status: 'PENDING', riskScore: 50 },
    { caseId: 'case-39', title: 'SIAC Statement of Defense Due', date: d(22), type: 'FILING', status: 'PENDING', riskScore: 42 },
    { caseId: 'case-40', title: 'File NGT Counter Affidavit', date: d(28), type: 'FILING', status: 'PENDING', riskScore: 38 },
    // MORE
    { caseId: 'case-3', title: 'Rejoinder Affidavit Filing', date: d(35), type: 'FILING', status: 'PENDING', riskScore: 20 },
    { caseId: 'case-5', title: 'Additional Documents for Drug Authority', date: d(40), type: 'COMPLIANCE', status: 'PENDING', riskScore: 15 },
    { caseId: 'case-7', title: 'Reply to Return Notice', date: d(10), type: 'FILING', status: 'PENDING', riskScore: 60 },
    { caseId: 'case-10', title: 'File Written Statement', date: d(45), type: 'FILING', status: 'PENDING', riskScore: 12 },
    { caseId: 'case-11', title: 'Collect Judgment Copy', date: d(31), type: 'COMPLIANCE', status: 'PENDING', riskScore: 10 },
    { caseId: 'case-12', title: 'File Guardianship Petition Documents', date: d(20), type: 'FILING', status: 'PENDING', riskScore: 35 },
    { caseId: 'case-14', title: 'Submit Khasra Documents', date: d(15), type: 'FILING', status: 'PENDING', riskScore: 42 },
    { caseId: 'case-17', title: 'Complainant Evidence Affidavit', date: d(35), type: 'FILING', status: 'PENDING', riskScore: 18 },
    { caseId: 'case-19', title: 'Defense Witness List', date: d(25), type: 'FILING', status: 'PENDING', riskScore: 28 },
    // COMPLETED deadlines
    { caseId: 'case-1', title: 'File Vakalatnama', date: new Date('2025-03-10'), type: 'FILING', status: 'COMPLETED', riskScore: 0 },
    { caseId: 'case-9', title: 'File Interim Maintenance Application', date: new Date('2026-01-15'), type: 'FILING', status: 'COMPLETED', riskScore: 0 },
    { caseId: 'case-15', title: 'Surrender to Bail Condition', date: new Date('2026-09-01'), type: 'COMPLIANCE', status: 'COMPLETED', riskScore: 0 },
    { caseId: 'case-4', title: 'File Suit for Injunction', date: new Date('2025-10-01'), type: 'FILING', status: 'COMPLETED', riskScore: 0 },
    { caseId: 'case-6', title: 'File Appeal before ITAT', date: new Date('2025-12-15'), type: 'FILING', status: 'COMPLETED', riskScore: 0 },
    { caseId: 'case-8', title: 'File Statement of Claim', date: new Date('2026-03-01'), type: 'FILING', status: 'COMPLETED', riskScore: 0 },
    { caseId: 'case-20', title: 'Send Legal Notice to Builder', date: new Date('2026-06-01'), type: 'COMPLIANCE', status: 'COMPLETED', riskScore: 0 },
    { caseId: 'case-28', title: 'File Industrial Dispute', date: new Date('2026-10-20'), type: 'FILING', status: 'COMPLETED', riskScore: 0 },
    { caseId: 'case-26', title: 'Reply to EPFO Notice', date: new Date('2026-10-15'), type: 'FILING', status: 'COMPLETED', riskScore: 0 },
    { caseId: 'case-29', title: 'File Trademark Opposition', date: new Date('2026-08-05'), type: 'FILING', status: 'COMPLETED', riskScore: 0 },
  ]

  await prisma.deadline.createMany({ data: deadlines })

  // ============================================================
  // TASKS
  // ============================================================
  const taskStatuses = ['TODO', 'IN_PROGRESS', 'DONE']
  const taskPriorities = ['HIGH', 'MEDIUM', 'LOW', 'CRITICAL']

  await prisma.task.createMany({
    data: [
      { title: 'Draft Written Arguments for Meridian vs Apex', caseId: 'case-1', assigneeId: 'user-partner-1', priority: 'HIGH', status: 'IN_PROGRESS', dueDate: d(8) },
      { title: 'Research case law on force majeure - Supreme Court', caseId: 'case-1', assigneeId: 'user-associate-1', priority: 'HIGH', status: 'IN_PROGRESS', dueDate: d(5) },
      { title: 'Prepare SEBI SCN reply', caseId: 'case-2', assigneeId: 'user-partner-1', priority: 'CRITICAL', status: 'TODO', dueDate: d(3) },
      { title: 'Review SEBI investigation report', caseId: 'case-2', assigneeId: 'user-associate-1', priority: 'CRITICAL', status: 'IN_PROGRESS', dueDate: d(2) },
      { title: 'Draft land acquisition challenge petition', caseId: 'case-3', assigneeId: 'user-partner-2', priority: 'HIGH', status: 'DONE', dueDate: d(-5) },
      { title: 'Compile property documents for case-3', caseId: 'case-3', assigneeId: 'user-paralegal', priority: 'MEDIUM', status: 'DONE', dueDate: d(-10) },
      { title: 'Brief Senior Advocate on patent case', caseId: 'case-4', assigneeId: 'user-partner-2', priority: 'HIGH', status: 'TODO', dueDate: d(20) },
      { title: 'Prepare arbitration evidence bundle', caseId: 'case-8', assigneeId: 'user-associate-1', priority: 'CRITICAL', status: 'IN_PROGRESS', dueDate: d(2) },
      { title: 'File anticipatory bail application - urgent', caseId: 'case-16', assigneeId: 'user-partner-2', priority: 'CRITICAL', status: 'TODO', dueDate: d(1) },
      { title: 'Interim maintenance application drafting', caseId: 'case-9', assigneeId: 'user-associate-2', priority: 'MEDIUM', status: 'DONE', dueDate: d(-30) },
      { title: 'Serve summons on respondent', caseId: 'case-20', assigneeId: 'user-paralegal', priority: 'MEDIUM', status: 'TODO', dueDate: d(7) },
      { title: 'File written statement for RERA', caseId: 'case-21', assigneeId: 'user-associate-2', priority: 'HIGH', status: 'IN_PROGRESS', dueDate: d(9) },
      { title: 'Research IBC Section 7 precedents', caseId: 'case-38', assigneeId: 'user-associate-1', priority: 'HIGH', status: 'TODO', dueDate: d(15) },
      { title: 'Prepare client update for Meridian', caseId: 'case-1', assigneeId: 'user-partner-1', priority: 'LOW', status: 'TODO', dueDate: d(5) },
      { title: 'Client consultation - Bharat Steel tax', caseId: 'case-6', assigneeId: 'user-partner-1', priority: 'HIGH', status: 'TODO', dueDate: d(7) },
      { title: 'Collect judgment copy - Meera Nair', caseId: 'case-11', assigneeId: 'user-paralegal', priority: 'LOW', status: 'TODO', dueDate: d(32) },
      { title: 'Draft protection order application', caseId: 'case-13', assigneeId: 'user-partner-2', priority: 'HIGH', status: 'DONE', dueDate: d(-3) },
      { title: 'File GST reply for Coastal Fisheries', caseId: 'case-18', assigneeId: 'user-associate-1', priority: 'HIGH', status: 'IN_PROGRESS', dueDate: d(11) },
      { title: 'Compile income tax documents for Ravi Tiwari', caseId: 'case-33', assigneeId: 'user-paralegal', priority: 'HIGH', status: 'IN_PROGRESS', dueDate: d(4) },
      { title: 'Prepare NGT counter affidavit', caseId: 'case-40', assigneeId: 'user-associate-2', priority: 'MEDIUM', status: 'TODO', dueDate: d(27) },
    ],
  })

  // ============================================================
  // TIME ENTRIES
  // ============================================================
  const timeEntries = []
  const entryDescriptions = [
    'Case research and document review',
    'Client consultation and advisory',
    'Drafting pleadings and arguments',
    'Court attendance and hearing',
    'Correspondence with opposing counsel',
    'Filing documents and court fee',
    'Conference call with client',
    'Review of evidence and exhibits',
    'Legal opinion drafting',
    'Settlement negotiations',
  ]

  for (let i = 0; i < 80; i++) {
    const caseIndex = Math.floor(Math.random() * 20)
    const userId = ['user-partner-1', 'user-partner-2', 'user-associate-1', 'user-associate-2', 'user-paralegal'][Math.floor(Math.random() * 5)]
    const hours = (Math.floor(Math.random() * 8) + 1) * 0.5
    const rate = userId.includes('partner') ? 7500 : userId.includes('associate') ? 3500 : 1500
    const daysAgo = Math.floor(Math.random() * 90)

    timeEntries.push({
      description: entryDescriptions[Math.floor(Math.random() * entryDescriptions.length)],
      hours,
      rate,
      billable: Math.random() > 0.2,
      date: new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000),
      caseId: cases[caseIndex].id,
      userId,
    })
  }

  await prisma.timeEntry.createMany({ data: timeEntries })

  // ============================================================
  // NOTES
  // ============================================================
  await prisma.note.createMany({
    data: [
      { caseId: 'case-1', authorId: 'user-partner-1', content: 'Discussed with client - strong on merits of force majeure defense. Client confident about outcome. Ensure written arguments address the precedents from 2023 Supreme Court cases.', visibility: 'INTERNAL' },
      { caseId: 'case-1', authorId: 'user-associate-1', content: 'Research note: Force majeure requires foreseeability test. Key cases: Energy Watchdog vs CERC (2017) SC and Halliburton Offshore Services vs Vedanta (2022) Delhi HC.', visibility: 'INTERNAL' },
      { caseId: 'case-2', authorId: 'user-partner-1', content: 'SEBI investigation is broad. Focus on showing no mens rea and that the trades were based on publicly available information. Need forensic accountant.', visibility: 'INTERNAL' },
      { caseId: 'case-9', authorId: 'user-partner-2', content: 'Child welfare is paramount concern. Focus hearing on stability of home environment and educational continuity.', visibility: 'INTERNAL' },
      { caseId: 'case-15', authorId: 'user-partner-1', content: 'Prosecution witness list reviewed. Two witnesses have prior inconsistent statements. Cross-examination strategy prepared.', visibility: 'INTERNAL' },
      { caseId: 'case-16', authorId: 'user-partner-2', content: 'URGENT: Anticipatory bail application. Client fears arrest. Need to file today. Case has prima facie merit as documents relied upon by prosecution are questionable.', visibility: 'INTERNAL' },
      { caseId: 'case-8', authorId: 'user-partner-1', content: 'Arbitrator is former High Court judge. Known for detailed evidence examination. Prepare evidence bundle meticulously.', visibility: 'INTERNAL' },
    ],
  })

  // ============================================================
  // AI INSIGHTS
  // ============================================================
  await prisma.aIInsight.createMany({
    data: [
      {
        type: 'CASE_SUMMARY',
        content: MOCK_CASE_SUMMARY_TRUNCATED,
        sources: JSON.stringify([{ document: 'Petition.pdf', page: 1 }, { document: 'Agreement.pdf', page: 3 }]),
        caseId: 'case-1',
        userId: 'user-partner-1',
      },
      {
        type: 'DEADLINE_RISK',
        content: JSON.stringify([{ riskScore: 100, title: 'File Rejoinder - OVERDUE', reason: 'Filing deadline passed 15 days ago. Immediate action required.' }]),
        sources: JSON.stringify([]),
        caseId: 'case-1',
        userId: 'user-admin',
      },
      {
        type: 'NEXT_ACTIONS',
        content: JSON.stringify(MOCK_NEXT_ACTIONS_DATA),
        sources: JSON.stringify([]),
        caseId: 'case-1',
        userId: 'user-partner-1',
      },
    ],
  })

  // ============================================================
  // INVOICES
  // ============================================================
  await prisma.invoice.createMany({
    data: [
      {
        number: generateInvoiceNumber(1),
        status: 'SENT',
        total: 285000,
        tax: 51300,
        dueDate: d(15),
        clientId: 'client-1',
        lineItems: JSON.stringify([
          { description: 'Legal representation - Meridian vs Apex (October 2026)', hours: 38, rate: 7500, amount: 285000 },
        ]),
      },
      {
        number: generateInvoiceNumber(2),
        status: 'PAID',
        total: 450000,
        tax: 81000,
        paidAt: new Date('2026-09-30'),
        clientId: 'client-3',
        lineItems: JSON.stringify([
          { description: 'SEBI investigation advisory and representation (Q3 2026)', hours: 60, rate: 7500, amount: 450000 },
        ]),
      },
      {
        number: generateInvoiceNumber(3),
        status: 'OVERDUE',
        total: 175000,
        tax: 31500,
        dueDate: d(-10),
        clientId: 'client-5',
        lineItems: JSON.stringify([
          { description: 'Land acquisition petition and filings (August-September 2026)', hours: 25, rate: 7000, amount: 175000 },
        ]),
      },
      {
        number: generateInvoiceNumber(4),
        status: 'DRAFT',
        total: 95000,
        tax: 17100,
        clientId: 'client-7',
        lineItems: JSON.stringify([
          { description: 'Patent infringement case preparation (October 2026)', hours: 19, rate: 5000, amount: 95000 },
        ]),
      },
      {
        number: generateInvoiceNumber(5),
        status: 'SENT',
        total: 320000,
        tax: 57600,
        dueDate: d(30),
        clientId: 'client-3',
        lineItems: JSON.stringify([
          { description: 'ITAT appeal representation - Bharat Steel (2026)', hours: 40, rate: 8000, amount: 320000 },
        ]),
      },
    ],
  })

  // ============================================================
  // NOTIFICATIONS
  // ============================================================
  await prisma.notification.createMany({
    data: [
      { userId: 'user-partner-1', title: 'Overdue Deadline', body: 'Rejoinder filing deadline for case Meridian vs Apex is 15 days overdue.', type: 'DANGER', link: '/cases/case-1' },
      { userId: 'user-partner-2', title: 'Urgent Hearing Tomorrow', body: 'Anticipatory bail hearing for Harinder Singh Bhatia is scheduled for tomorrow.', type: 'WARNING', link: '/cases/case-16' },
      { userId: 'user-admin', title: 'New Case Assigned', body: 'Northern Developers environmental case has been assigned to Nisha Reddy.', type: 'INFO', link: '/cases/case-40' },
      { userId: 'user-partner-1', title: 'Invoice Overdue', body: 'Invoice INV-202611-0003 for Northern Developers is 10 days overdue.', type: 'WARNING', link: '/billing' },
      { userId: 'user-associate-1', title: 'Task Due Soon', body: 'SEBI SCN reply preparation is due in 2 days.', type: 'INFO', link: '/cases/case-2' },
      { userId: 'user-partner-1', title: 'AI Insight Ready', body: 'Deadline Guardian has flagged 5 at-risk deadlines requiring your attention.', type: 'AI', link: '/dashboard' },
      { userId: 'user-associate-2', title: 'Document Processed', body: 'Written Arguments for InnovateSoft Patent case has been processed by AI.', type: 'SUCCESS', link: '/cases/case-4' },
      { userId: 'user-paralegal', title: 'Task Assigned', body: 'You have been assigned to compile documents for Northern Developers RERA case.', type: 'INFO', link: '/cases/case-21' },
    ],
  })

  // ============================================================
  // AUDIT LOG
  // ============================================================
  await prisma.auditLog.createMany({
    data: [
      { action: 'CASE_CREATED', entityType: 'Case', entityId: 'case-1', userId: 'user-partner-1', diff: JSON.stringify({ title: 'Meridian Technologies vs. Apex Software Solutions' }) },
      { action: 'CASE_UPDATED', entityType: 'Case', entityId: 'case-1', userId: 'user-admin', diff: JSON.stringify({ status: { from: 'INTAKE', to: 'HEARING' } }) },
      { action: 'DOCUMENT_UPLOADED', entityType: 'Document', entityId: 'doc-1', userId: 'user-paralegal', caseId: 'case-1', diff: JSON.stringify({ fileName: 'Petition.pdf' }) },
      { action: 'AI_INSIGHT_GENERATED', entityType: 'AIInsight', entityId: 'insight-1', userId: 'user-partner-1', caseId: 'case-1', diff: JSON.stringify({ type: 'CASE_SUMMARY' }) },
      { action: 'TASK_CREATED', entityType: 'Task', entityId: 'task-1', userId: 'user-partner-1', caseId: 'case-1', diff: JSON.stringify({ title: 'Draft Written Arguments' }) },
      { action: 'HEARING_ADDED', entityType: 'Hearing', entityId: 'hearing-1', userId: 'user-admin', caseId: 'case-1', diff: JSON.stringify({ date: d(17).toISOString() }) },
    ],
  })

  console.log('Database seeded successfully!')
  console.log('Demo credentials:')
  console.log('  Admin:     admin@caseline.in / caseline123')
  console.log('  Partner:   arjun@caseline.in / caseline123')
  console.log('  Partner:   priya@caseline.in / caseline123')
  console.log('  Associate: sanjeev@caseline.in / caseline123')
  console.log('  Associate: nisha@caseline.in / caseline123')
  console.log('  Paralegal: rahul@caseline.in / caseline123')
  console.log('  Client:    client@caseline.in / caseline123')
  console.log('  Client:    client2@caseline.in / caseline123')
}

const MOCK_CASE_SUMMARY_TRUNCATED = 'Commercial dispute between Meridian Technologies and Apex Software Solutions for breach of software development agreement valued at INR 48,00,000. The respondent failed to deliver agreed software modules within 12 months, causing financial loss. Written arguments stage. Next hearing: 18 November 2026.'

const MOCK_NEXT_ACTIONS_DATA = [
  { action: 'File Written Arguments', reason: 'Deadline approaching in 10 days', priority: 'HIGH', taskTitle: 'Draft and file Written Arguments' },
  { action: 'Brief Senior Advocate', reason: 'Final arguments stage', priority: 'HIGH', taskTitle: 'Prepare briefing note for Senior Advocate' },
  { action: 'Compile Evidence Index', reason: 'All documentary evidence should be indexed', priority: 'MEDIUM', taskTitle: 'Compile and index all case documents' },
]

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
