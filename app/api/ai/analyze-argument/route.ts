import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { aiAnalyzeArgument } from '@/lib/ai/service'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { argument, context, role, clientType, ownerType, caseId } = body

    if (!argument || typeof argument !== 'string' || !argument.trim()) {
      return NextResponse.json(
        { error: 'Argument text is required for analysis' },
        { status: 400 }
      )
    }

    const result = await aiAnalyzeArgument({
      argument: argument.trim(),
      context: context?.trim(),
      role: role || 'BOTH',
      clientType: clientType?.trim(),
      ownerType: ownerType?.trim(),
    })

    // Optionally attach to case AI insights if caseId is provided
    if (caseId && typeof caseId === 'string') {
      try {
        const caseRecord = await prisma.case.findFirst({
          where: {
            id: caseId,
            organizationId: session.user.organizationId,
          },
        })

        if (caseRecord) {
          await prisma.aIInsight.create({
            data: {
              type: 'ARGUMENT_ANALYSIS',
              content: JSON.stringify({
                title: result.title,
                summary: result.summary,
                viabilityScore: result.viabilityScore,
                riskLevel: result.riskLevel,
                clientTakeaway: result.clientPerspective.simpleTakeaway,
                ownerTakeaway: result.ownerPerspective.simpleTakeaway,
                improvements: result.whatWillImprove.strategicImprovements.map(s => s.action),
              }),
              caseId,
              userId: session.user.id,
            },
          })
        }
      } catch (err) {
        console.error('Error saving AI insight to case:', err)
      }
    }

    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Argument analysis route error:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to evaluate argument' },
      { status: 500 }
    )
  }
}

