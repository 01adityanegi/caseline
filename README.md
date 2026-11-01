# CaseLine — AI-Powered Legal Case Management

CaseLine is an AI-assisted legal workspace built for the Indian legal ecosystem. It brings case and client management, legal document organization, hearing and deadline tracking, agreement drafting, and AI-powered legal assistance into one platform.

This project was developed by **Team Litti Choka** for **HackIndia 2026 — AI for Lawyers**.

## What it does

- **Case management:** organize cases, clients, parties, notes, communications, and case status.
- **AI legal assistance:** generate case summaries, extract information from legal documents, build timelines, answer questions about case material, and prepare hearing briefs.
- **Deadline Guardian:** track hearings and filing dates, highlight potential deadline risks, and suggest follow-up actions.
- **AgreementStudio:** generate and review agreements with English/Hindi support, explain legal clauses, flag missing or unclear clauses, and assist with clause improvements.
- **Document management:** keep case-related files organized and maintain document versions and extracted text.
- **Practice operations:** manage tasks, calendars, time entries, billing, invoices, teams, notifications, and reports.

> AI output is assistive only. Lawyers should independently verify all legal information, dates, citations, and generated documents before relying on them.

## Technology

- Next.js 16 and React 19
- TypeScript
- Prisma ORM with SQLite
- NextAuth.js credentials authentication
- Google Gemini API (Gemini 1.5 Flash integration)
- Zod and bcryptjs

## Repository status and running locally

The source currently published in this repository is **missing its `package.json` dependency manifest**. That means the normal Node.js setup cannot be completed from this snapshot yet. The commands below are the intended setup workflow once the matching `package.json` is restored from the original development project.

### Prerequisites

- Node.js 20 or newer
- npm
- Git
- A Google Gemini API key (optional for flows that use the built-in mock fallback)

### 1. Clone the repository

```bash
git clone https://github.com/HackIndiaXYZ/ai-for-lawyers-hackathon-litti-choka.git
cd ai-for-lawyers-hackathon-litti-choka
```

### 2. Restore the project manifest

Make sure the project root contains the original `package.json` and, if available, its lockfile (for example, `package-lock.json`). These files are not present in the current published snapshot. Do not generate an arbitrary manifest: restore the one used by the project so the dependency versions and scripts match the source code.

### 3. Install dependencies

After restoring the manifest:

```bash
npm install
```

### 4. Configure environment variables

Create a `.env` file in the project root:

```env
DATABASE_URL="file:./dev.db"
AUTH_SECRET="replace_with_a_long_random_secret"
GEMINI_API_KEY="your_google_gemini_api_key"
```

Generate a secure value for `AUTH_SECRET`; never commit your real `.env` file or API keys.

### 5. Generate Prisma Client and initialize the database

```bash
npx prisma generate
npx prisma db push
```

### 6. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

**Important:** Steps 3–6 depend on restoring the project's original dependency manifest and scripts. The commands have not been verified against a clean local installation of this repository snapshot.

## Project structure

```text
app/          Next.js routes, pages, and API handlers
components/   UI components grouped by feature
lib/          Authentication, database, AI, and agreement logic
prisma/       Prisma schema and seed scripts
public/       Static assets
templates/    Agreement templates
scripts/      Project utility scripts
```

## Hackathon

- **Event:** HackIndia 2026
- **Track:** AI for Lawyers
- **Team:** Litti Choka
- **Project:** CaseLine

## Disclaimer

CaseLine is a legal productivity tool, not a substitute for a qualified advocate or professional legal advice. AI-generated content can be incomplete or inaccurate. Always verify it against authoritative sources and applicable law before use.

---

Built by **Team Litti Choka** for HackIndia 2026.
