# CaseLine: Autonomous Legal OS & AgreementStudio

> Built for high-velocity litigation, court limitation governance, and autonomous bilingual contract generation in English and formal legal Devanagari Hindi.

---

## Overview

Legal teams across India struggle with fragmented files, missed court limitation deadlines, and manual conveyancing drafting. CaseLine centralizes case dossiers, court calendar compliance, and introduces **AgreementStudio** — an autonomous guided generator producing court-admissible agreements from minimal inputs with zero API key dependencies and optional Gemini AI refinement.

### Flagship Module: AgreementStudio
- **14+ Structured Indian Templates**:
  - **Rental & Property**: Residential Rent (11-Month Leave & License), Commercial Lease Deed, Agreement to Sell, Sale Deed Draft, Rent Receipt, Tenant Notice.
  - **Business & Work**: Freelance Service & AI Consulting Agreement, Employment Contract, Non-Disclosure Agreement (NDA), Partnership Deed, Consultancy Agreement, Vendor & Supply Agreement.
  - **Personal**: Friendly Loan with Promissory Note, General & Special Power of Attorney (GPA/SPA), Sworn General Affidavit.
- **Bilingual Simultaneous Compilation**:
  - English & formal Devanagari Hindi (backed by formal legal glossary).
  - Four viewing modes: English Only, Hindi Only, Side-by-Side (2-column desktop / stacked mobile), and Sequential Execution.
  - Automatic phonetic transliteration of party names and Indian addresses into Devanagari with live inline editing.
  - Dual English & Hindi Indian numbering words (`"Rupees Twenty-Eight Thousand Only"` / `"अट्ठाइस हज़ार रुपये मात्र"`).
- **Indian Statutory Compliance & State Pointers**:
  - Built-in legal rules engine covering Section 17 of the Registration Act 1908 (11-month rule vs compulsory registration).
  - State-specific stamp duty schedules and direct e-stamping portal links (Delhi, Maharashtra, Karnataka, Uttar Pradesh, Haryana, Tamil Nadu).
- **Legally Binding Digital E-Signatures**:
  - Dual modality: Typed cursive signature or Touch/Mouse drawn signature canvas.
  - Statutory compliance check under Section 65B & Section 3 of the Information Technology Act, 2000.
  - Immutable audit logging with signer IP address, device user-agent, and cryptographic timestamp.
- **AI Judicial Copilot**:
  - **Describe-to-Agreement**: Natural language prompt (voice or text) parser that extracts deal parameters into structured fields.
  - **Risk and Fairness Meter**: Party-perspective scoring (0–100%) flagging one-sided clauses with 1-click balanced rewrites.
  - **Plain-Language Explainer**: Explains any legal clause in simple English and Hindi.
  - **Missing Clause Finder**: Scans agreement for absent protective clauses (e.g. Arbitration Act 1996, Force Majeure).
  - **Negotiation Assistant**: Formulates balanced counter-proposals with courteous email/WhatsApp messages.
  - **Attach to Case**: Link finalized agreements directly to active litigation matters or client ledgers in one click.

---

## Tech Stack & Architecture

- **Framework**: Next.js 16.4.3 (App Router with Turbopack)
- **Database & ORM**: SQLite / PostgreSQL via Prisma 5.22.0
- **Auth**: NextAuth.js v5 (Credentials with Role-Based Access Control: Admin, Partner, Associate, Paralegal, Client)
- **Styling**: Tailwind CSS v4, Lucide React (Strict zero emoji rule across all UI, comments, and notifications)
- **Typography**: Inter (Body), Source Serif 4 (Court Pleadings & Paper Drafts), Noto Sans Devanagari (Hindi with `line-height: 1.85` for unclipped matras)
- **AI Refinement**: Google Gemini 1.5 Flash (with 100% deterministic rule-based fallback when no API key is provided)
- **Testing**: Node Native Test Runner with TypeScript (`tsx --test`)

---

## Quickstart & Setup

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/your-org/hackindia.git
cd hackindia
npm install
```

### 2. Environment Variables
Create a `.env` file in the project root:
```env
# Database
DATABASE_URL="file:./dev.db"

# NextAuth Secret
NEXTAUTH_SECRET="caseline-hackindia-super-secret-key-2026"
NEXTAUTH_URL="http://localhost:3000"

# Optional: Gemini API Key (If omitted, app runs deterministically)
GEMINI_API_KEY=""
```

### 3. Initialize Database & Seed Sample Data
```bash
npx prisma generate
npx prisma db push
npx tsx prisma/seed.ts
npx tsx prisma/seed-agreements.ts
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Demo Credentials
| Role | Email | Password |
|---|---|---|
| **Admin** | `admin@caseline.in` | `caseline123` |
| **Partner** | `arjun@caseline.in` | `caseline123` |
| **Associate** | `sanjeev@caseline.in` | `caseline123` |
| **Client** | `client@caseline.in` | `caseline123` |

---

## Running Unit Tests
To execute the automated test suite verifying amount-to-words, Devanagari transliteration, legal glossary dictionary, and placeholder compilation:
```bash
npm test
```

---

## How to Add a New Template

Templates are defined declaratively in `/templates/` as structured JSON/TypeScript schemas. New templates can be added without modifying UI code:

```typescript
import { AgreementTemplateDefinition } from './types'

export const customServiceTemplate: AgreementTemplateDefinition = {
  code: 'custom_maintenance_contract',
  category: 'Business & Work',
  titleEn: 'Annual Maintenance Contract (AMC)',
  titleHi: 'वार्षिक रखरखाव अनुबंध (एएमसी)',
  descriptionEn: 'Standard commercial service and IT equipment maintenance agreement.',
  descriptionHi: 'वाणिज्यिक सेवा एवं उपकरण रखरखाव हेतु मानक अनुबंध।',
  estimatedMinutes: 5,
  iconName: 'Wrench',
  languages: ['EN', 'HI'],
  sampleData: {
    clientName: 'Meridian Tech',
    providerName: 'Apex Services',
    annualFee: 60000,
    startDate: '2026-11-01',
    city: 'New Delhi',
    state: 'Delhi'
  },
  fields: [
    {
      id: 'annualFee',
      labelEn: 'Annual Maintenance Fee (INR)',
      labelHi: 'वार्षिक रखरखाव शुल्क (रुपये)',
      type: 'currency',
      required: true,
      section: 'payment'
    }
  ],
  clauses: [
    {
      id: 'amc_scope',
      titleEn: '1. Scope of Preventive Maintenance',
      titleHi: '1. निवारक रखरखाव का दायरा',
      textEn: 'The Service Provider shall conduct quarterly inspections and resolve hardware faults within 24 hours of notification.',
      textHi: 'सेवा प्रदाता त्रैमासिक निरीक्षण करेगा तथा सूचना प्राप्त होने के 24 घंटे के भीतर तकनीकी खामियों का समाधान करेगा।'
    }
  ]
}
```

Add your template object to `ALL_TEMPLATES` in `templates/index.ts` and run `npx tsx prisma/seed-agreements.ts`. The template library, wizard, and compiler will pick it up automatically.

---

## 2-Minute Hackathon Demo Script

Follow this step-by-step walkthrough to present the flagship capabilities:

1. **Step 1: Open Template Library**
   - Click **AgreementStudio** in the sidebar or navigate to `/agreements/templates`.
   - Filter by chip: click **Rental & Property**.
   - Note the estimated drafting time and language availability tags.
2. **Step 2: Launch Smart Wizard**
   - Click **Use Template** on **Residential Rent Agreement**.
   - Notice the 5-step progress indicator and autosave drafts.
3. **Step 3: Test Describe-to-Agreement**
   - Click the microphone icon or type into the Describe box:
     > *"I am renting my flat in Noida to Rahul Sharma for 28,000 a month for 11 months."*
   - Click **Extract Deal Terms** (or click **Fill with sample data** for instant demonstration).
   - Show how the AI extracts the monthly rent, security deposit, duration, and parties.
4. **Step 4: Review Parties & Devanagari Transliteration**
   - Click **Next: Parties**.
   - Notice that landlord "Rajesh Sharma" and tenant "Rahul Verma" automatically generate editable Devanagari transliterations ("राजेश शर्मा", "राहुल वर्मा") without clipping matras.
5. **Step 5: Review Terms & Amount in Words**
   - Click **Next: Terms** and review the auto-formatted Indian currency values.
   - Note that `"Rupees Twenty-Eight Thousand Only"` and `"अट्ठाइस हज़ार रुपये मात्र"` are generated simultaneously.
6. **Step 6: Toggle Optional Clauses**
   - Click **Next: Optional Clauses**.
   - Toggle **Add a pet policy** or **Arbitration clause** and explain how the contract conditionally adapts.
7. **Step 7: Generate & View Live Paper Preview**
   - Select **Both (Side-by-Side)** and click **Generate Agreement**.
   - Admire the paper-styled document with authentic serif legal typography.
   - Click the language toggle to switch between English, Hindi, and Side-by-Side columns.
8. **Step 8: Run Risk & Fairness Meter**
   - Switch to the **AI** tab on the right panel.
   - Select perspective: **Tenant**.
   - Click **Calculate Fairness Score** to see real-time score calculation and one-click balanced clause rewrites.
9. **Step 9: Digital E-Sign under IT Act 2000**
   - Click the **E-Sign** button in the header toolbar.
   - Choose **Type Signature** or draw on the signature pad.
   - Check the statutory Section 65B consent box and click **Confirm & Affix Signature**.
   - Notice the signature badge updating with cryptographic timestamp and IP address.
10. **Step 10: Export & Attach to Case**
    - Click **Export / Print** to preview the PDF print sheet.
    - Click **Share** to see the WhatsApp `wa.me` link and the authentic verification QR code.
    - Click **Attach to Case** and link the agreement to `CASE-0001 (Meridian Technologies)` in one click.

---

## PWA & Mobile Responsiveness
CaseLine is a certified Progressive Web App with zero horizontal overflow:
- **Mobile Bottom Navigation**: Instant thumb access to Dashboard, Cases, Agreements, Calendar, and Menu.
- **Dynamic Viewport (`dvh`)**: Prevents layout shifts on mobile Safari & Chrome address bar movement.
- **Form Safeguards**: `font-size: 16px` on mobile inputs to eliminate iOS auto-zoom bugs.
- **Touch-Optimized E-Sign**: Smooth drawing canvas with touch-action isolation.
