import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const body = await req.json()
    const { title, titleHi, compiledEn, compiledHi, templateCode, clientName, ownerName, category, caseId } = body

    if (!title || !compiledEn) {
      return NextResponse.json({ error: 'Title and agreement content are required' }, { status: 400 })
    }

    // Generate unique agreement number
    const count = await prisma.agreement.count({
      where: { organizationId: session.user.organizationId },
    })
    const dateStr = new Date().toISOString().slice(2, 7).replace('-', '')
    const agreementNumber = `AGR-${dateStr}-${String(count + 201).padStart(4, '0')}`

    // Find or link a client
    let clientId: string | null = null
    const existingClient = await prisma.client.findFirst({
      where: { organizationId: session.user.organizationId },
    })
    if (existingClient) {
      clientId = existingClient.id
    }

    const agreement = await prisma.agreement.create({
      data: {
        agreementNumber,
        templateCode: templateCode || 'CUSTOM_INSPECTED',
        title: title || 'Custom Inspected Agreement',
        titleHi: titleHi || title,
        category: category || 'Business & Work',
        language: 'BOTH_SIDE_BY_SIDE',
        status: 'DRAFT',
        state: 'Delhi',
        city: 'New Delhi',
        executionDate: new Date(),
        formData: JSON.stringify({
          title,
          source: 'AI Document Inspector',
          clientName: clientName || 'Client',
          ownerName: ownerName || session.user.name || 'Owner',
        }),
        customClauses: JSON.stringify([]),
        compiledEn,
        compiledHi: compiledHi || compiledEn,
        riskScore: 15,
        caseId: caseId || null,
        clientId: clientId,
        organizationId: session.user.organizationId,
        parties: {
          create: [
            {
              role: 'FIRST_PARTY',
              nameEn: ownerName || session.user.name || 'First Party / Owner',
              addressEn: 'Delhi, India',
              email: session.user.email || 'owner@caseline.in',
            },
            {
              role: 'SECOND_PARTY',
              nameEn: clientName || 'Second Party / Client',
              addressEn: 'India',
              email: 'client@caseline.in',
            },
          ],
        },
        versions: {
          create: {
            versionNumber: 1,
            contentJson: JSON.stringify({
              title,
              compiledEn,
              compiledHi: compiledHi || compiledEn,
              createdAt: new Date().toISOString(),
            }),
            compiledEn,
            compiledHi: compiledHi || compiledEn,
            changeSummary: 'Initial draft generated from AI Document Inspector',
            createdBy: session.user.name || 'User',
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      agreementId: agreement.id,
      agreementNumber: agreement.agreementNumber,
      message: 'Agreement created successfully and ready for drafting / e-signing!',
    })
  } catch (error: any) {
    console.error('Error creating agreement from inspected document:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to create agreement' },
      { status: 500 }
    )
  }
}
