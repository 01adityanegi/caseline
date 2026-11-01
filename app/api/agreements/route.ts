import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getTemplateByCode } from '@/templates'
import { compileAgreement } from '@/lib/agreement/engine'

import { getAgreementFilter } from '@/lib/rbac'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const status = searchParams.get('status')
    const search = searchParams.get('search')

    const baseFilter = await getAgreementFilter(session.user)
    const where: Record<string, any> = {
      ...baseFilter,
    }

    if (category && category !== 'All') where.category = category
    if (status && status !== 'All') where.status = status
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { agreementNumber: { contains: search } },
      ]
    }

    const agreements = await prisma.agreement.findMany({
      where,
      include: {
        parties: true,
        case: { select: { id: true, title: true, caseNumber: true } },
        client: { select: { id: true, name: true } },
      },
      orderBy: { updatedAt: 'desc' },
      take: 50,
    })

    return NextResponse.json(agreements)
  } catch (error) {
    console.error('Fetch agreements error:', error)
    return NextResponse.json({ error: 'Failed to fetch agreements' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const template = getTemplateByCode(body.templateCode)

    if (!template) {
      return NextResponse.json({ error: 'Invalid template code' }, { status: 400 })
    }

    // Generate unique agreement number
    const count = await prisma.agreement.count({
      where: { organizationId: session.user.organizationId },
    })
    const dateStr = new Date().toISOString().slice(2, 7).replace('-', '')
    const agreementNumber = `AGR-${dateStr}-${String(count + 101).padStart(4, '0')}`

    // Compile deterministic bilingual text
    const compiled = compileAgreement(template, body.formData || {}, body.customClauses || [])

    const agreement = await prisma.agreement.create({
      data: {
        agreementNumber,
        templateCode: template.code,
        title: body.title || template.titleEn,
        titleHi: body.titleHi || template.titleHi,
        category: template.category,
        language: body.language || 'BOTH_SIDE_BY_SIDE',
        status: body.status || 'DRAFT',
        state: body.state || 'Delhi',
        city: body.city || body.formData?.city || 'New Delhi',
        executionDate: body.executionDate ? new Date(body.executionDate) : new Date(),
        considerationAmount: body.formData?.monthlyRent || body.formData?.totalFee || body.formData?.loanAmount || null,
        formData: JSON.stringify(body.formData || {}),
        customClauses: JSON.stringify(body.customClauses || []),
        compiledEn: compiled.fullEn,
        compiledHi: compiled.fullHi,
        riskScore: body.riskScore || 20,
        caseId: body.caseId || null,
        clientId: body.clientId || null,
        organizationId: session.user.organizationId,
        parties: {
          create: (body.parties || []).map((p: any) => ({
            role: p.role || 'PARTY',
            nameEn: p.nameEn || p.name || 'Party',
            nameHi: p.nameHi || null,
            fatherSpouseNameEn: p.fatherSpouseNameEn || null,
            age: p.age ? parseInt(p.age, 10) : null,
            addressEn: p.addressEn || p.address || '',
            pan: p.pan || null,
            aadhaarMasked: p.aadhaarMasked || null,
            phone: p.phone || null,
            email: p.email || null,
            isWitness: Boolean(p.isWitness),
          })),
        },
        versions: {
          create: {
            versionNumber: 1,
            contentJson: JSON.stringify(body.formData || {}),
            compiledEn: compiled.fullEn,
            compiledHi: compiled.fullHi,
            changeSummary: 'Initial generated draft',
            createdBy: session.user.name || 'User',
          },
        },
      },
      include: {
        parties: true,
        versions: true,
      },
    })

    return NextResponse.json(agreement)
  } catch (error) {
    console.error('Create agreement error:', error)
    return NextResponse.json({ error: 'Failed to create agreement' }, { status: 500 })
  }
}
