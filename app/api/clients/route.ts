import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    if (session.user.role === 'CLIENT') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')

    const where: Record<string, any> = {
      organizationId: session.user.organizationId,
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { phone: { contains: search } },
        { city: { contains: search } },
      ]
    }

    const clients = await prisma.client.findMany({
      where,
      include: {
        cases: { select: { id: true, title: true, caseNumber: true, status: true } },
        invoices: { select: { id: true, total: true, status: true } },
        agreements: { select: { id: true, title: true, agreementNumber: true, status: true } },
      },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json(clients)
  } catch (error) {
    console.error('Fetch clients error:', error)
    return NextResponse.json({ error: 'Failed to fetch clients' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    if (session.user.role === 'CLIENT') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const {
      name,
      email,
      phone,
      type = 'INDIVIDUAL',
      address,
      city,
      state,
      pin,
      gstin,
      pan,
      notes,
      createPortalLogin = false,
      portalPassword = 'client123',
    } = body

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Client name is required' }, { status: 400 })
    }

    // Create client record in Prisma
    const client = await prisma.client.create({
      data: {
        name: name.trim(),
        email: email ? email.trim().toLowerCase() : null,
        phone: phone ? phone.trim() : null,
        type,
        address: address ? address.trim() : null,
        city: city ? city.trim() : null,
        state: state ? state.trim() : null,
        pin: pin ? pin.trim() : null,
        gstin: gstin ? gstin.trim().toUpperCase() : null,
        pan: pan ? pan.trim().toUpperCase() : null,
        notes: notes ? notes.trim() : null,
        organizationId: session.user.organizationId,
      },
    })

    // Optionally create portal login user account for this client
    let userCreated = false
    if (createPortalLogin && email && email.trim()) {
      const existingUser = await prisma.user.findUnique({
        where: { email: email.trim().toLowerCase() },
      })

      if (!existingUser) {
        const hashedPassword = await bcrypt.hash(portalPassword || 'client123', 10)
        await prisma.user.create({
          data: {
            name: name.trim(),
            email: email.trim().toLowerCase(),
            password: hashedPassword,
            role: 'CLIENT',
            phone: phone ? phone.trim() : null,
            organizationId: session.user.organizationId,
          },
        })
        userCreated = true
      }
    }

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: 'CLIENT_ONBOARDED',
        entityType: 'Client',
        entityId: client.id,
        diff: JSON.stringify({
          clientName: client.name,
          type: client.type,
          portalAccessGranted: userCreated,
        }),
        userId: session.user.id,
      },
    })

    return NextResponse.json({
      success: true,
      client,
      portalUserCreated: userCreated,
    })
  } catch (error) {
    console.error('Create client error:', error)
    return NextResponse.json({ error: 'Failed to onboard client' }, { status: 500 })
  }
}
