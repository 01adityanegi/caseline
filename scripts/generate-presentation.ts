import pptxgen from 'pptxgenjs'
import path from 'path'

async function generatePitchDeck() {
  const pptx = new pptxgen()
  pptx.layout = 'LAYOUT_16x9'
  pptx.author = 'CaseLine Team'
  pptx.company = 'CaseLine Legal Tech'
  pptx.title = 'CaseLine — AI Legal Case Management'
  pptx.subject = 'HackIndia 2026 Presentation'

  // Colors
  const BG_DARK = '0B1528'
  const CARD_BG = '132238'
  const BLUE_ACCENT = '2563EB'
  const GOLD_ACCENT = 'D97706'
  const TEXT_LIGHT = 'F8FAFC'
  const TEXT_MUTED = '94A3B8'
  const GREEN_ACCENT = '10B981'
  const BORDER_COLOR = '1E293B'

  // Helper for slide background
  const setDarkBackground = (slide: pptxgen.Slide) => {
    slide.background = { color: BG_DARK }
  }

  // =========================================================================
  // SLIDE 1: TITLE SLIDE
  // =========================================================================
  {
    const slide = pptx.addSlide()
    setDarkBackground(slide)

    // Tag Pill
    slide.addText('HACKINDIA 2026  |  PROBLEM STATEMENT PS-01', {
      x: 1.0, y: 1.2, w: 5.5, h: 0.4,
      fontSize: 11, bold: true, color: GOLD_ACCENT,
      fontFace: 'Arial'
    })

    // Main Title
    slide.addText('CaseLine', {
      x: 1.0, y: 1.8, w: 9.0, h: 1.2,
      fontSize: 54, bold: true, color: TEXT_LIGHT,
      fontFace: 'Georgia'
    })

    // Subtitle
    slide.addText('The Autonomous AI Operating System for Law Firms, Courts & Litigation Teams', {
      x: 1.0, y: 3.1, w: 10.5, h: 0.8,
      fontSize: 20, color: '60A5FA',
      fontFace: 'Arial'
    })

    slide.addText('Transforming fragmented case files, missed limitation deadlines, and manual legal administrative burden into an intelligent, cited, high-velocity legal workspace.', {
      x: 1.0, y: 4.0, w: 10.0, h: 1.0,
      fontSize: 14, color: TEXT_MUTED,
      fontFace: 'Arial', lineSpacingMultiple: 1.2
    })

    // Key Value Badges
    slide.addShape(pptx.ShapeType.rect, {
      x: 1.0, y: 5.4, w: 2.8, h: 0.8, fill: { color: CARD_BG }, line: { color: BORDER_COLOR }
    })
    slide.addText('RAG Dossier Search\nVerified Citations', {
      x: 1.0, y: 5.4, w: 2.8, h: 0.8, align: 'center', fontSize: 11, bold: true, color: TEXT_LIGHT
    })

    slide.addShape(pptx.ShapeType.rect, {
      x: 4.1, y: 5.4, w: 2.8, h: 0.8, fill: { color: CARD_BG }, line: { color: BORDER_COLOR }
    })
    slide.addText('Deadline Guardian\nLimitation Risk Scoring', {
      x: 4.1, y: 5.4, w: 2.8, h: 0.8, align: 'center', fontSize: 11, bold: true, color: GOLD_ACCENT
    })

    slide.addShape(pptx.ShapeType.rect, {
      x: 7.2, y: 5.4, w: 2.8, h: 0.8, fill: { color: CARD_BG }, line: { color: BORDER_COLOR }
    })
    slide.addText('Smart Case Intake\nLive Conflict Clearance', {
      x: 7.2, y: 5.4, w: 2.8, h: 0.8, align: 'center', fontSize: 11, bold: true, color: GREEN_ACCENT
    })
  }

  // =========================================================================
  // SLIDE 2: THE PROBLEM
  // =========================================================================
  {
    const slide = pptx.addSlide()
    setDarkBackground(slide)

    slide.addText('THE CRISIS IN LITIGATION MANAGEMENT', {
      x: 0.8, y: 0.6, w: 10, h: 0.3, fontSize: 11, bold: true, color: 'EF4444'
    })
    slide.addText('Lawyers Spend 35% of Every Day on Admin, Not Law', {
      x: 0.8, y: 1.0, w: 11, h: 0.6, fontSize: 26, bold: true, color: TEXT_LIGHT, fontFace: 'Georgia'
    })

    // 4 Problem Cards
    const problems = [
      {
        title: 'Document Fragmentation',
        stat: '100s of Pages',
        desc: 'Pleadings, orders, annexures, and notices scattered across paper briefs, WhatsApp, and fragmented drives. Finding key evidence takes hours.',
        color: '3B82F6'
      },
      {
        title: 'Fatal Limitation Lapses',
        stat: '30-Day Rules',
        desc: 'Court filing deadlines and limitation periods tracked on manual spreadsheets. A single missed date leads to irreversible case dismissal.',
        color: 'EF4444'
      },
      {
        title: 'Unchecked Conflicts of Interest',
        stat: 'Ethical Risk',
        desc: 'No automated mechanism to cross-verify opposing counsels or parties against existing firm clients during urgent matter onboarding.',
        color: 'F59E0B'
      },
      {
        title: 'Billing & Administrative Chaos',
        stat: '20% Leakage',
        desc: 'Court appearances and drafting hours go unrecorded. Manual invoicing causes delayed collections and partner burnout.',
        color: '10B981'
      }
    ]

    problems.forEach((p, idx) => {
      const x = 0.8 + (idx * 2.85)
      slide.addShape(pptx.ShapeType.roundRect, {
        x, y: 2.0, w: 2.65, h: 4.5, fill: { color: CARD_BG }, line: { color: BORDER_COLOR }
      })

      slide.addText(p.stat, {
        x, y: 2.3, w: 2.65, h: 0.4, align: 'center', fontSize: 18, bold: true, color: p.color
      })
      slide.addText(p.title, {
        x: x + 0.2, y: 2.9, w: 2.25, h: 0.6, fontSize: 14, bold: true, color: TEXT_LIGHT, align: 'center'
      })
      slide.addText(p.desc, {
        x: x + 0.2, y: 3.6, w: 2.25, h: 2.6, fontSize: 11, color: TEXT_MUTED, lineSpacingMultiple: 1.2
      })
    })
  }

  // =========================================================================
  // SLIDE 3: THE SOLUTION (CaseLine Overview)
  // =========================================================================
  {
    const slide = pptx.addSlide()
    setDarkBackground(slide)

    slide.addText('THE SOLUTION', {
      x: 0.8, y: 0.6, w: 10, h: 0.3, fontSize: 11, bold: true, color: GREEN_ACCENT
    })
    slide.addText('CaseLine: Centralized, AI-Powered Legal Operating System', {
      x: 0.8, y: 1.0, w: 11, h: 0.6, fontSize: 26, bold: true, color: TEXT_LIGHT, fontFace: 'Georgia'
    })

    // 3 Value Pillars
    const pillars = [
      {
        title: '1. Centralize the Entire Dossier',
        bullets: [
          'Unified matter vault for pleadings, notices & orders',
          'Automated OCR and chunking for full-text semantic indexing',
          'Complete audit logs and version-controlled document history'
        ]
      },
      {
        title: '2. Autonomous Judicial Intelligence',
        bullets: [
          'Ask the Case: Verified RAG citing specific pages & clauses',
          'AI Executive Summaries synthesized from court orders',
          'Hearing Preparation Briefs tailored for arguing senior counsel'
        ]
      },
      {
        title: '3. Risk Mitigation & Operations',
        bullets: [
          'Deadline Guardian: Automated limitation risk scoring (0-100%)',
          'Live Conflict Check before taking opposing representations',
          'Team Workload Balancer preventing attorney burnout'
        ]
      }
    ]

    pillars.forEach((pil, idx) => {
      const x = 0.8 + (idx * 3.8)
      slide.addShape(pptx.ShapeType.roundRect, {
        x, y: 2.0, w: 3.6, h: 4.5, fill: { color: CARD_BG }, line: { color: '2563EB' }
      })

      slide.addText(pil.title, {
        x: x + 0.25, y: 2.3, w: 3.1, h: 0.6, fontSize: 15, bold: true, color: '60A5FA'
      })

      const bulletText = pil.bullets.map(b => ({ text: `• ${b}\n\n`, options: { fontSize: 12, color: TEXT_LIGHT } }))
      slide.addText(bulletText, {
        x: x + 0.25, y: 3.1, w: 3.1, h: 3.1, lineSpacingMultiple: 1.15
      })
    })
  }

  // =========================================================================
  // SLIDE 4: CORE PRODUCT FEATURES (Deep Dive)
  // =========================================================================
  {
    const slide = pptx.addSlide()
    setDarkBackground(slide)

    slide.addText('AI FEATURE SUITE', {
      x: 0.8, y: 0.6, w: 10, h: 0.3, fontSize: 11, bold: true, color: GOLD_ACCENT
    })
    slide.addText('Purpose-Built Judicial Workflows, Not Generic Prompts', {
      x: 0.8, y: 1.0, w: 11, h: 0.6, fontSize: 26, bold: true, color: TEXT_LIGHT, fontFace: 'Georgia'
    })

    const features = [
      { name: 'Smart Intake Wizard', desc: 'Ingest case notices; AI extracts parties, court, claim value & opposing counsel automatically.' },
      { name: 'Ask the Case (RAG)', desc: 'Ask factual queries across thousands of discovery pages with verbatim clause and page citations.' },
      { name: 'Deadline Guardian', desc: 'Calculates statutory limitation periods under the Limitation Act and alerts on at-risk filings.' },
      { name: 'Conflict Clearance', desc: 'Real-time alert when opposing party matches an existing firm client or past matter.' },
      { name: 'Hearing Prep Brief', desc: 'Generates concise courtroom briefs with judge history, procedural targets & key citations.' },
      { name: 'Workload Balancer', desc: 'Monitors capacity across Partners, Associates & Paralegals to balance hearing loads.' }
    ]

    features.forEach((f, idx) => {
      const col = idx % 3
      const row = Math.floor(idx / 3)
      const x = 0.8 + (col * 3.8)
      const y = 1.9 + (row * 2.3)

      slide.addShape(pptx.ShapeType.roundRect, {
        x, y, w: 3.6, h: 2.0, fill: { color: CARD_BG }, line: { color: BORDER_COLOR }
      })

      slide.addText(f.name, {
        x: x + 0.2, y: y + 0.2, w: 3.2, h: 0.4, fontSize: 13, bold: true, color: 'F59E0B'
      })
      slide.addText(f.desc, {
        x: x + 0.2, y: y + 0.7, w: 3.2, h: 1.1, fontSize: 11, color: TEXT_MUTED, lineSpacingMultiple: 1.2
      })
    })
  }

  // =========================================================================
  // SLIDE 5: SYSTEM ARCHITECTURE & TECH STACK
  // =========================================================================
  {
    const slide = pptx.addSlide()
    setDarkBackground(slide)

    slide.addText('ARCHITECTURE & ENGINEERING', {
      x: 0.8, y: 0.6, w: 10, h: 0.3, fontSize: 11, bold: true, color: BLUE_ACCENT
    })
    slide.addText('Robust, Enterprise-Grade Architecture Built for Speed & Security', {
      x: 0.8, y: 1.0, w: 11, h: 0.6, fontSize: 26, bold: true, color: TEXT_LIGHT, fontFace: 'Georgia'
    })

    const techBoxes = [
      {
        layer: 'Frontend & UI',
        tech: 'Next.js 16 (App Router) + React 19',
        points: '• Turbopack sub-second compilation\n• Responsive Tailwind CSS design system\n• Recharts interactive data visualization\n• Command palette (Cmd+K) instant search'
      },
      {
        layer: 'Database & ORM',
        tech: 'SQLite + Prisma ORM',
        points: '• Full relational schema: 17 models\n• Zero-dependency local persistence\n• Cascade-safe document chunk relationships\n• Type-safe queries with Prisma Client'
      },
      {
        layer: 'Judicial AI Engine',
        tech: 'Google Gemini 1.5 Flash + Mock Layer',
        points: '• Multimodal document parsing & OCR\n• Strict grounded RAG with source verification\n• Resilient offline mock fallback layer\n• Structured JSON extraction pipelines'
      },
      {
        layer: 'Security & RBAC',
        tech: 'NextAuth v5 + Role Matrix',
        points: '• Bcrypt password hashing\n• 5 role tiers: Admin, Partner, Associate, Paralegal, Client\n• Complete audit logs for every case modification\n• Client confidentiality safeguards'
      }
    ]

    techBoxes.forEach((t, idx) => {
      const x = 0.8 + (idx * 2.85)
      slide.addShape(pptx.ShapeType.roundRect, {
        x, y: 1.9, w: 2.65, h: 4.6, fill: { color: CARD_BG }, line: { color: '334155' }
      })

      slide.addText(t.layer, {
        x, y: 2.1, w: 2.65, h: 0.3, align: 'center', fontSize: 11, bold: true, color: GOLD_ACCENT
      })
      slide.addText(t.tech, {
        x: x + 0.15, y: 2.5, w: 2.35, h: 0.6, align: 'center', fontSize: 12, bold: true, color: TEXT_LIGHT
      })
      slide.addText(t.points, {
        x: x + 0.15, y: 3.3, w: 2.35, h: 3.0, fontSize: 10, color: TEXT_MUTED, lineSpacingMultiple: 1.25
      })
    })
  }

  // =========================================================================
  // SLIDE 6: MARKET SIZE & BUSINESS IMPACT
  // =========================================================================
  {
    const slide = pptx.addSlide()
    setDarkBackground(slide)

    slide.addText('BUSINESS OPPORTUNITY & IMPACT', {
      x: 0.8, y: 0.6, w: 10, h: 0.3, fontSize: 11, bold: true, color: GREEN_ACCENT
    })
    slide.addText('Enormous Market with Quantifiable Return on Investment', {
      x: 0.8, y: 1.0, w: 11, h: 0.6, fontSize: 26, bold: true, color: TEXT_LIGHT, fontFace: 'Georgia'
    })

    // Metric Highlights
    const metrics = [
      { num: '1.7M+', label: 'Registered Advocates in India', sub: 'Growing at 6% annually across High Courts & District Benches' },
      { num: '80%', label: 'Reduction in Intake Time', sub: 'Matter onboarding reduced from 4 hours to under 8 minutes' },
      { num: '0', label: 'Missed Limitation Lapses', sub: 'Automated deadline calculation and proactive risk flagging' },
      { num: '₹12L+', label: 'Annual Billable Recovery', sub: 'Per associate through automated time recording & LEDES invoicing' }
    ]

    metrics.forEach((m, idx) => {
      const x = 0.8 + (idx * 2.85)
      slide.addShape(pptx.ShapeType.roundRect, {
        x, y: 2.0, w: 2.65, h: 4.4, fill: { color: CARD_BG }, line: { color: BORDER_COLOR }
      })

      slide.addText(m.num, {
        x, y: 2.4, w: 2.65, h: 0.8, align: 'center', fontSize: 32, bold: true, color: '60A5FA'
      })
      slide.addText(m.label, {
        x: x + 0.15, y: 3.4, w: 2.35, h: 0.6, align: 'center', fontSize: 13, bold: true, color: TEXT_LIGHT
      })
      slide.addText(m.sub, {
        x: x + 0.15, y: 4.2, w: 2.35, h: 1.8, align: 'center', fontSize: 11, color: TEXT_MUTED, lineSpacingMultiple: 1.2
      })
    })
  }

  // =========================================================================
  // SLIDE 7: COMPETITIVE MOAT
  // =========================================================================
  {
    const slide = pptx.addSlide()
    setDarkBackground(slide)

    slide.addText('COMPETITIVE LANDSCAPE', {
      x: 0.8, y: 0.6, w: 10, h: 0.3, fontSize: 11, bold: true, color: GOLD_ACCENT
    })
    slide.addText('Why CaseLine Wins vs. Legacy Practice Software & Generic AI', {
      x: 0.8, y: 1.0, w: 11, h: 0.6, fontSize: 26, bold: true, color: TEXT_LIGHT, fontFace: 'Georgia'
    })

    // Comparison Table
    const headers = ['Capability', 'Legacy Legal Software (Clio, PracticeLeague)', 'Generic LLMs (ChatGPT)', 'CaseLine (Our Platform)']
    const rows = [
      ['Dossier RAG with Citations', '❌ None (manual file storage)', '⚠️ Hallucinates, no page proof', '✅ Exact page & clause citations'],
      ['Court Calendar & Cause Lists', '⚠️ Basic calendar sync only', '❌ No courtroom integration', '✅ Cause list & hearing tracker'],
      ['Statutory Limitation Guardian', '❌ Manual entry only', '❌ Not jurisdiction-aware', '✅ Rules-based risk scores (0-100%)'],
      ['Live Conflict of Interest Check', '⚠️ Slow manual search', '❌ No client context', '✅ Real-time warning on keystroke'],
      ['Trial Preparation Briefs', '❌ None', '⚠️ Generic, unstructured', '✅ Formatted for arguing counsel'],
      ['Client Confidentiality & RBAC', '✅ Standard permissions', '❌ Risk of public LLM leakage', '✅ 5-tier role-based security']
    ]

    const colWidths = [2.6, 2.8, 2.6, 3.2]
    let startY = 1.9

    // Header Row
    let curX = 0.8
    headers.forEach((h, i) => {
      slide.addShape(pptx.ShapeType.rect, {
        x: curX, y: startY, w: colWidths[i], h: 0.5,
        fill: { color: i === 3 ? '1E3A8A' : '1E293B' }
      })
      slide.addText(h, {
        x: curX, y: startY, w: colWidths[i], h: 0.5,
        align: 'center', fontSize: 10, bold: true, color: TEXT_LIGHT
      })
      curX += colWidths[i]
    })

    // Data Rows
    rows.forEach((r, rIdx) => {
      const rowY = startY + 0.5 + (rIdx * 0.65)
      let rowX = 0.8
      r.forEach((cell, cIdx) => {
        slide.addShape(pptx.ShapeType.rect, {
          x: rowX, y: rowY, w: colWidths[cIdx], h: 0.65,
          fill: { color: cIdx === 3 ? '132238' : (rIdx % 2 === 0 ? '0F172A' : '1E293B') },
          line: { color: '334155' }
        })
        slide.addText(cell, {
          x: rowX + 0.1, y: rowY, w: colWidths[cIdx] - 0.2, h: 0.65,
          align: cIdx === 0 ? 'left' : 'center',
          fontSize: 10,
          bold: cIdx === 3,
          color: cIdx === 3 ? '60A5FA' : TEXT_LIGHT
        })
        rowX += colWidths[cIdx]
      })
    })
  }

  // =========================================================================
  // SLIDE 8: ROADMAP & EXPANSION
  // =========================================================================
  {
    const slide = pptx.addSlide()
    setDarkBackground(slide)

    slide.addText('FUTURE ROADMAP', {
      x: 0.8, y: 0.6, w: 10, h: 0.3, fontSize: 11, bold: true, color: BLUE_ACCENT
    })
    slide.addText('Scaling from High Courts to National Judicial Infrastructure', {
      x: 0.8, y: 1.0, w: 11, h: 0.6, fontSize: 26, bold: true, color: TEXT_LIGHT, fontFace: 'Georgia'
    })

    const roadmap = [
      {
        phase: 'Phase 1: Now (Hackathon Ready)',
        items: [
          'Full litigation lifecycle management',
          'RAG inquiry with verbatim citation',
          'NextAuth v5 RBAC with 8 seeded users',
          'Interactive Pipeline & Calendar views'
        ]
      },
      {
        phase: 'Phase 2: Q1 2027',
        items: [
          'Direct e-Courts API integration',
          'Automated daily cause list scraping',
          'WhatsApp voice-note matter intake',
          'Automated court fee calculation'
        ]
      },
      {
        phase: 'Phase 3: Q3 2027',
        items: [
          'Vernacular language drafting (Hindi, Marathi, Tamil)',
          'Judge analytics & ruling probability modeling',
          'Integrated escrow for client retainer trust funds',
          'Virtual hearing transcription & minute generator'
        ]
      }
    ]

    roadmap.forEach((rm, idx) => {
      const x = 0.8 + (idx * 3.8)
      slide.addShape(pptx.ShapeType.roundRect, {
        x, y: 2.0, w: 3.6, h: 4.5, fill: { color: CARD_BG }, line: { color: '3B82F6' }
      })

      slide.addText(rm.phase, {
        x: x + 0.2, y: 2.3, w: 3.2, h: 0.6, fontSize: 14, bold: true, color: GOLD_ACCENT
      })

      const bullets = rm.items.map(it => ({ text: `✓ ${it}\n\n`, options: { fontSize: 11, color: TEXT_LIGHT } }))
      slide.addText(bullets, {
        x: x + 0.2, y: 3.1, w: 3.2, h: 3.2, lineSpacingMultiple: 1.2
      })
    })
  }

  // =========================================================================
  // SLIDE 9: CONCLUSION & DEMO CALL TO ACTION
  // =========================================================================
  {
    const slide = pptx.addSlide()
    setDarkBackground(slide)

    slide.addText('HACKINDIA 2026', {
      x: 1.0, y: 1.2, w: 6.0, h: 0.4, fontSize: 12, bold: true, color: GOLD_ACCENT
    })

    slide.addText('CaseLine is Live & Ready for Evaluation', {
      x: 1.0, y: 1.8, w: 10.5, h: 1.2, fontSize: 44, bold: true, color: TEXT_LIGHT, fontFace: 'Georgia'
    })

    slide.addText('Experience the live application locally or in presentation mode:', {
      x: 1.0, y: 3.2, w: 10.0, h: 0.5, fontSize: 16, color: TEXT_MUTED
    })

    slide.addShape(pptx.ShapeType.roundRect, {
      x: 1.0, y: 3.9, w: 9.5, h: 2.4, fill: { color: CARD_BG }, line: { color: '2563EB' }
    })

    slide.addText('Demo Access Particulars:', {
      x: 1.3, y: 4.1, w: 8.5, h: 0.4, fontSize: 14, bold: true, color: '60A5FA'
    })

    slide.addText([
      { text: '• URL: ', options: { bold: true, color: TEXT_LIGHT } },
      { text: 'http://localhost:3000\n', options: { color: '93C5FD' } },
      { text: '• Instant Admin Login: ', options: { bold: true, color: TEXT_LIGHT } },
      { text: 'admin@caseline.in / caseline123\n', options: { color: GOLD_ACCENT } },
      { text: '• Partner (Arjun Mehta): ', options: { bold: true, color: TEXT_LIGHT } },
      { text: 'arjun@caseline.in / caseline123\n', options: { color: TEXT_MUTED } },
      { text: '• Client Portal Login: ', options: { bold: true, color: TEXT_LIGHT } },
      { text: 'client@caseline.in / caseline123', options: { color: TEXT_MUTED } }
    ], {
      x: 1.3, y: 4.6, w: 8.5, h: 1.5, fontSize: 12, lineSpacingMultiple: 1.3
    })
  }

  // Save PPTX file to public directory so it's downloadable
  const outputPath = path.join(process.cwd(), 'public', 'CaseLine_Pitch_Deck.pptx')
  
  await pptx.writeFile({ fileName: outputPath })
  
  console.log('Presentation PPTX created at:', outputPath)
}

generatePitchDeck().catch(console.error)
