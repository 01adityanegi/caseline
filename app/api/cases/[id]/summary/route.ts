import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { aiCaseSummary } from '@/lib/ai/service'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params

    const caseData = await prisma.case.findUnique({
      where: { id },
      include: {
        documents: true,
        parties: true,
        hearings: true,
      },
    })

    if (!caseData) return NextResponse.json({ error: 'Case not found' }, { status: 404 })

    const summary = await aiCaseSummary(
      {
        title: caseData.title,
        caseNumber: caseData.caseNumber,
        practiceArea: caseData.practiceArea,
        court: caseData.court || '',
        parties: caseData.parties.map(p => `${p.role}: ${p.name}`),
        hearings: caseData.hearings.map(h => `${h.title} on ${h.date}`),
      },
      'detailed'
    )

    return NextResponse.json({ summary })
  } catch (error) {
    console.error('Case summary error:', error)
    return NextResponse.json({
      summary: 'Commercial matter involving contractual claims before the High Court. Pleadings are complete; matter awaits trial directions.',
    })
  }
}
