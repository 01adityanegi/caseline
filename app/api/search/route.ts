import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getCaseFilter, getAgreementFilter, isClientUser } from '@/lib/rbac'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q') || ''
    const limit = parseInt(searchParams.get('limit') || '8')
    const orgId = session.user.organizationId

    if (!q.trim()) return NextResponse.json({ results: [] })

    const isClient = isClientUser(session.user)

    if (isClient) {
      const caseFilter = await getCaseFilter(session.user)
      const agreementFilter = await getAgreementFilter(session.user)

      const [cases, agreements] = await Promise.all([
        prisma.case.findMany({
          where: {
            ...caseFilter,
            OR: [
              { title: { contains: q } },
              { caseNumber: { contains: q } },
              { court: { contains: q } },
            ],
          },
          select: { id: true, title: true, caseNumber: true, status: true, practiceArea: true },
          take: Math.floor(limit / 2),
        }),
        prisma.agreement.findMany({
          where: {
            ...agreementFilter,
            OR: [
              { title: { contains: q } },
              { agreementNumber: { contains: q } },
            ],
          },
          select: { id: true, title: true, agreementNumber: true, status: true },
          take: Math.floor(limit / 2),
        }),
      ])

      const results = [
        ...cases.map(c => ({
          id: c.id,
          title: c.title,
          subtitle: `${c.caseNumber} · ${c.practiceArea}`,
          type: 'case',
          href: `/cases/${c.id}`,
        })),
        ...agreements.map(a => ({
          id: a.id,
          title: a.title,
          subtitle: `${a.agreementNumber} · ${a.status}`,
          type: 'agreement',
          href: `/agreements/${a.id}`,
        })),
      ]

      return NextResponse.json({ results: results.slice(0, limit) })
    }

    const [cases, clients, agreements] = await Promise.all([
      prisma.case.findMany({
        where: {
          organizationId: orgId,
          OR: [
            { title: { contains: q } },
            { caseNumber: { contains: q } },
            { court: { contains: q } },
          ],
        },
        select: { id: true, title: true, caseNumber: true, status: true, practiceArea: true },
        take: Math.floor(limit / 2),
      }),
      prisma.client.findMany({
        where: {
          organizationId: orgId,
          OR: [
            { name: { contains: q } },
            { email: { contains: q } },
          ],
        },
        select: { id: true, name: true, email: true, type: true },
        take: Math.floor(limit / 4),
      }),
      prisma.agreement.findMany({
        where: {
          organizationId: orgId,
          OR: [
            { title: { contains: q } },
            { agreementNumber: { contains: q } },
          ],
        },
        select: { id: true, title: true, agreementNumber: true, status: true },
        take: Math.floor(limit / 4),
      }),
    ])

    const results = [
      ...cases.map(c => ({
        id: c.id,
        title: c.title,
        subtitle: `${c.caseNumber} · ${c.practiceArea}`,
        type: 'case',
        href: `/cases/${c.id}`,
      })),
      ...clients.map(c => ({
        id: c.id,
        title: c.name,
        subtitle: c.email || c.type,
        type: 'client',
        href: `/clients/${c.id}`,
      })),
      ...agreements.map(a => ({
        id: a.id,
        title: a.title,
        subtitle: `${a.agreementNumber} · ${a.status}`,
        type: 'agreement',
        href: `/agreements/${a.id}`,
      })),
    ]

    return NextResponse.json({ results: results.slice(0, limit) })
  } catch (error) {
    return NextResponse.json({ results: [] })
  }
}
