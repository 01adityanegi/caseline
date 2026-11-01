import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { generateCaseNumber } from '@/lib/utils'

import { getCaseFilter, isClientUser } from '@/lib/rbac'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const caseFilter = await getCaseFilter(session.user)

    const cases = await prisma.case.findMany({
      where: caseFilter,
      include: { client: true, lead: true },
      orderBy: { updatedAt: 'desc' },
    })

    return NextResponse.json(cases)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch cases' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    if (isClientUser(session.user)) {
      return NextResponse.json({ error: 'Clients cannot create internal law firm dossiers directly' }, { status: 403 })
    }

    const body = await request.json()
    const caseNumber = generateCaseNumber(body.practiceArea || 'Commercial')

    const newCase = await prisma.case.create({
      data: {
        caseNumber,
        title: body.title,
        description: body.description,
        clientId: body.clientId,
        leadId: body.leadId,
        practiceArea: body.practiceArea,
        court: body.court,
        judge: body.judge,
        priority: body.priority || 'MEDIUM',
        caseValue: body.caseValue ? parseFloat(body.caseValue) : null,
        organizationId: session.user.organizationId,
        riskScore: 25,
      },
    })

    if (body.opposingParty) {
      await prisma.caseParty.create({
        data: {
          caseId: newCase.id,
          name: body.opposingParty,
          role: 'RESPONDENT',
          counsel: body.opposingCounsel || null,
        },
      })
    }

    return NextResponse.json(newCase)
  } catch (error) {
    console.error('Case create error:', error)
    return NextResponse.json({ error: 'Failed to create case' }, { status: 500 })
  }
}
