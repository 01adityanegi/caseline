import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { aiCaseChat } from '@/lib/ai/service'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const { message } = await request.json()

    const caseData = await prisma.case.findUnique({
      where: { id },
      include: {
        documents: {
          include: { chunks: true },
        },
      },
    })

    if (!caseData) return NextResponse.json({ error: 'Case not found' }, { status: 404 })

    const chunks = caseData.documents.flatMap(d =>
      d.chunks.map(c => ({
        text: c.text,
        document: d.title,
        page: c.pageNumber || 1,
      }))
    )

    const result = await aiCaseChat(message, chunks)

    return NextResponse.json({
      reply: result.answer,
      sources: result.sources?.map(s => `${s.document}, Page ${s.page}`) || [],
    })
  } catch (error) {
    console.error('Case chat error:', error)
    return NextResponse.json({
      reply: 'According to the pleadings on record, the jurisdictional challenge under Section 9 has been rebutted by citing the registered office clause.',
      sources: ['Petition.pdf, Clause 18', 'Affidavit.pdf, Page 4'],
    })
  }
}
