import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const body = await request.json()

    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '127.0.0.1'
    const userAgent = request.headers.get('user-agent') || 'Browser Client'

    const signature = await prisma.agreementSignature.create({
      data: {
        agreementId: id,
        partyId: body.partyId,
        signerName: body.signerName || session.user.name || 'Signer',
        signatureType: body.signatureType || 'TYPED',
        signatureData: body.signatureData || 'Signed Electronically',
        ipAddress: ip,
        deviceInfo: userAgent,
      },
    })

    // Update party signature status
    if (body.partyId) {
      await prisma.agreementParty.update({
        where: { id: body.partyId },
        data: { signatureStatus: 'SIGNED' },
      })
    }

    // Check if all non-witness parties have signed
    const parties = await prisma.agreementParty.findMany({
      where: { agreementId: id, isWitness: false },
    })
    const allSigned = parties.every(p => p.signatureStatus === 'SIGNED' || p.id === body.partyId)

    if (allSigned && parties.length > 0) {
      await prisma.agreement.update({
        where: { id },
        data: { status: 'COMPLETED' },
      })
    } else {
      await prisma.agreement.update({
        where: { id },
        data: { status: 'SIGNING' },
      })
    }

    // Add Audit Log
    await prisma.auditLog.create({
      data: {
        action: 'E_SIGNATURE_APPLIED',
        entityType: 'AGREEMENT',
        entityId: id,
        diff: JSON.stringify({ signer: body.signerName, type: body.signatureType, ip }),
        userId: session.user.id,
      },
    })

    return NextResponse.json({ success: true, signature, allSigned })
  } catch (error) {
    console.error('Sign agreement error:', error)
    return NextResponse.json({ error: 'Failed to record signature' }, { status: 500 })
  }
}
