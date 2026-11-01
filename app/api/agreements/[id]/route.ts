import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

import { getClientForUser, isClientUser } from '@/lib/rbac'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const agreement = await prisma.agreement.findUnique({
      where: { id },
      include: {
        parties: true,
        signatures: true,
        versions: { orderBy: { versionNumber: 'desc' } },
        case: { select: { id: true, title: true, caseNumber: true } },
        client: { select: { id: true, name: true } },
      },
    })

    if (!agreement || agreement.organizationId !== session.user.organizationId) {
      return NextResponse.json({ error: 'Agreement not found' }, { status: 404 })
    }

    // Client security gate
    if (isClientUser(session.user)) {
      const client = await getClientForUser(session.user)
      const isOwner = client && agreement.clientId === client.id
      const isParty = agreement.parties.some(
        p =>
          (client && p.nameEn.toLowerCase().includes(client.name.toLowerCase())) ||
          (session.user.name && p.nameEn.toLowerCase().includes(session.user.name.toLowerCase())) ||
          (session.user.email && p.email === session.user.email)
      )
      if (!isOwner && !isParty) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
    }

    return NextResponse.json(agreement)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch agreement' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const body = await request.json()

    // Create a new version if compiled text changed meaningfully
    const existing = await prisma.agreement.findUnique({
      where: { id },
      select: { compiledEn: true, compiledHi: true },
    })

    const updateData: Record<string, any> = { ...body }
    delete updateData.id
    delete updateData.parties
    delete updateData.versions
    delete updateData.signatures

    if (body.formData && typeof body.formData === 'object') {
      updateData.formData = JSON.stringify(body.formData)
    }
    if (body.customClauses && Array.isArray(body.customClauses)) {
      updateData.customClauses = JSON.stringify(body.customClauses)
    }

    const updated = await prisma.agreement.update({
      where: { id },
      data: updateData,
      include: {
        parties: true,
        signatures: true,
        versions: { orderBy: { versionNumber: 'desc' } },
      },
    })

    // If text changed, record version
    if (
      body.compiledEn &&
      existing &&
      (existing.compiledEn !== body.compiledEn || existing.compiledHi !== body.compiledHi)
    ) {
      const versionCount = await prisma.agreementVersion.count({ where: { agreementId: id } })
      await prisma.agreementVersion.create({
        data: {
          agreementId: id,
          versionNumber: versionCount + 1,
          contentJson: updated.formData,
          compiledEn: body.compiledEn,
          compiledHi: body.compiledHi || '',
          changeSummary: body.changeSummary || 'Inline edits saved',
          createdBy: session.user.name || 'User',
        },
      })
    }

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Update agreement error:', error)
    return NextResponse.json({ error: 'Failed to update agreement' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    await prisma.agreement.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 })
  }
}
