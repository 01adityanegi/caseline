# CaseLine — Autonomous Legal OS & AgreementStudio

[![Next.js](https://img.shields.io/badge/Next.js-16.4.3-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.3.0-blue?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v4-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-5.22.0-2D3748?style=flat-square&logo=prisma)](https://www.prisma.io/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

> Built for high-velocity litigation, court limitation governance, and autonomous bilingual contract generation in English and formal legal Devanagari Hindi.

---

## Overview

Legal teams across India face fragmented case files, missed limitation periods, and time-consuming conveyancing workflows. **CaseLine** unites litigation matter management with **AgreementStudio** — an autonomous generator producing court-admissible, bilingual legal agreements from structured prompts or guided wizards, with zero API key dependencies and optional Gemini AI refinement.

### Flagship Modules

#### 1. AgreementStudio (Bilingual Contract Generation)
- **14+ Indian Statutory Templates**:
  - **Rental & Property**: Residential Rent (11-Month Leave & License), Commercial Lease Deed, Agreement to Sell, Sale Deed Draft, Rent Receipt, Tenant Eviction Notice.
  - **Business & Employment**: Freelance Service & AI Consulting, Full-time Employment Contract, Mutual Non-Disclosure Agreement (NDA), Partnership Deed, Consultancy Agreement, Vendor & Supply Master Agreement.
  - **Personal & Conveyancing**: Friendly Loan with Promissory Note, General & Special Power of Attorney (GPA/SPA), Sworn General Affidavit.
- **Simultaneous Dual-Language Compilation**:
  - English and formal legal Devanagari Hindi backed by statutory Indian terminology.
  - 4 Viewing Modes: English Only, Hindi Only, Side-by-Side (2-column on desktop, stacked on mobile), and Sequential Execution.
  - Automatic phonetic transliteration of party names and Indian addresses into Devanagari.
  - Dual Indian numbering format in words (`"Rupees Twenty-Eight Thousand Only"` / `"अट्ठाइस हज़ार रुपये मात्र"`).
- **Statutory Rules & State Compliance Engine**:
  - Built-in legal rules engine checking Section 17 of the Registration Act, 1908 (11-month rule vs compulsory registration).
  - State-specific stamp duty schedules and direct e-stamping portal links (Delhi, Maharashtra, Karnataka, Uttar Pradesh, Haryana, Tamil Nadu).
- **Legally Admissible E-Signatures (IT Act, 2000)**:
  - Dual signature capture: typed cursive font or touch/mouse drawing pad.
  - Statutory Section 65B electronic record declaration.
  - Cryptographic audit trail with IP address, device user-agent, and timestamp.
  - Instant verification QR code and WhatsApp sharing link.

#### 2. Litigation Case OS
- **Court Limitation Risk Engine**: Automatic deadline calculation with color-coded risk alerts.
- **Hearing Preparation Tracker**: Daily cause lists, judge notes, and previous order summaries.
- **Document Vault**: Folder hierarchy, OCR chunking, and case dossier attachments.
- **Multi-Role Access Control (RBAC)**: Fine-grained permissions for Admin, Partner, Associate, Paralegal, and Client.
- **Time Tracking & Invoicing**: Billable hour timers and Indian GST compliant invoices.

#### 3. AI Judicial Copilot
- **Describe-to-Agreement**: Natural language prompt parser extracting parties, rent, deposits, and dates into structured fields.
- **Risk & Fairness Meter**: Perspective-based scoring (0–100%) flagging one-sided clauses with 1-click balanced rewrites.
- **Plain-Language Explainer**: Simplifies complex legal jargon into plain English and Hindi.
- **Missing Clause Finder**: Scans agreements for absent protective clauses (Arbitration Act 1996, Force Majeure, Severability).
- **Zero-Dependency Fallback**: 100% deterministic rules execute locally even when no Gemini API key is provided.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16.4.3 (App Router with Turbopack) |
| **Runtime & UI** | React 19.3.0, TypeScript 5.9.3 |
| **Styling** | Tailwind CSS v4, Lucide React Icons |
| **Typography** | Inter, Source Serif 4 (Pleadings), Noto Sans Devanagari |
| **Database & ORM** | SQLite / PostgreSQL via Prisma 5.22.0 |
| **Authentication** | NextAuth.js v5 (Role-Based Access Control) |
| **AI Processing** | Google Gemini 1.5 Flash (with local deterministic fallback) |
| **Testing** | Node Native Test Runner (`tsx --test`) |

---

## Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/01adityanegi/caseline.git
cd caseline
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Default configuration in `.env`:
```env
# Database
DATABASE_URL="file:./dev.db"

# NextAuth Secret
NEXTAUTH_SECRET="caseline-super-secret-key-change-in-production-2026"
NEXTAUTH_URL="http://localhost:3000"

# Optional: Google Gemini API Key (If omitted, app runs in deterministic mode)
GEMINI_API_KEY=""
```

### 4. Initialize Database & Seed Demo Data
```bash
npx prisma generate
npx prisma db push
npx tsx prisma/seed.ts
npx tsx prisma/seed-agreements.ts
```

### 5. Launch Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Demo Accounts

All demo accounts use password: `caseline123`

| Role | Email | Capabilities |
|---|---|---|
| **Admin** | `admin@caseline.in` | Full system access, firm settings, user management |
| **Partner** | `arjun@caseline.in` | Case assignment, bill approval, agreement signing |
| **Associate** | `sanjeev@caseline.in` | Case filing, document drafting, time tracking |
| **Client** | `client@caseline.in` | View assigned cases, review invoices, e-sign agreements |

---

## Automated Tests

Run the test suite to verify the legal calculation engine, amount-to-words converters, and transliteration helpers:

```bash
npm test
```

Test coverage includes:
- Indian numbering currency converter (English & Devanagari Hindi)
- Phonetic transliteration algorithms
- Indian statutory legal glossary
- Dynamic clause compilation and conditional placeholder substitutions
- AI helper fallbacks and ambiguity detection

---

## Progressive Web App (PWA)

CaseLine is responsive across mobile, tablet, and desktop viewports:
- **Mobile Bottom Navigation**: One-tap access to Dashboard, Cases, Agreements, and Calendar.
- **Dynamic Viewport Height (`dvh`)**: Immune to mobile address bar collapse and layout shifts.
- **Touch-Optimized Canvas**: Smooth digital signature capture with touch-action isolation.
- **Font Safeguards**: 16px minimum on inputs preventing iOS Safari auto-zoom.

---

## License

This project is licensed under the MIT License.
