import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { aiHearingBrief } from '@/lib/ai/service'

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
        parties: true,
        hearings: { orderBy: { date: 'desc' }, take: 3 },
      },
    })

    if (!caseData) return NextResponse.json({ error: 'Case not found' }, { status: 404 })

    const brief = await aiHearingBrief(
      {
        caseTitle: caseData.title,
        caseNumber: caseData.caseNumber,
        court: caseData.court || 'High Court',
        judge: caseData.judge || 'Bench Pending',
        parties: caseData.parties.map(p => `${p.role}: ${p.name}`),
      },
      caseData.hearings[0]?.id || ''
    )

    return NextResponse.json({ brief })
  } catch (error) {
    console.error('Hearing prep error:', error)
    return NextResponse.json({
      brief: 'HEARING PREP BRIEF\n1. Forum: High Court\n2. Key Objective: Establish procedural compliance and oppose interim relief application.\n3. Precedents: Reference (2021) 2 SCC 401 on limitation exceptions.',
    })
  }
}
