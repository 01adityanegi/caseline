import React from 'react'
import { notFound, redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import AgreementDetailWorkspace from '@/components/agreements/AgreementDetailWorkspace'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ id: string }>
}

import { getClientForUser, isClientUser } from '@/lib/rbac'

export default async function AgreementDetailPage({ params }: Props) {
  const session = await auth()
  if (!session) redirect('/login')

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
    notFound()
  }

  const isClient = isClientUser(session.user)
  const clientRecord = isClient ? await getClientForUser(session.user) : null

  // Security gate: If client, verify this agreement belongs to them
  if (isClient) {
    const isOwner = clientRecord && agreement.clientId === clientRecord.id
    const isParty = agreement.parties.some(
      p =>
        (clientRecord && p.nameEn.toLowerCase().includes(clientRecord.name.toLowerCase())) ||
        (session.user.name && p.nameEn.toLowerCase().includes(session.user.name.toLowerCase())) ||
        (session.user.email && p.email === session.user.email)
    )

    if (!isOwner && !isParty) {
      notFound()
    }
  }

  // Fetch Cases and Clients for the attach modal (scoped strictly if client)
  const cases = await prisma.case.findMany({
    where: {
      organizationId: session.user.organizationId,
      ...(isClient && clientRecord ? { clientId: clientRecord.id } : {}),
    },
    select: { id: true, title: true, caseNumber: true },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })

  const clients = isClient && clientRecord
    ? [{ id: clientRecord.id, name: clientRecord.name }]
    : await prisma.client.findMany({
        where: { organizationId: session.user.organizationId },
        select: { id: true, name: true },
        orderBy: { name: 'asc' },
        take: 50,
      })

  // Format data for client component
  const agreementData = {
    ...agreement,
    executionDate: agreement.executionDate.toISOString(),
    parties: agreement.parties.map(p => ({
      ...p,
      age: p.age ?? null,
      fatherSpouseNameEn: p.fatherSpouseNameEn ?? null,
      fatherSpouseNameHi: p.fatherSpouseNameHi ?? null,
      addressHi: p.addressHi ?? null,
      pan: p.pan ?? null,
      aadhaarMasked: p.aadhaarMasked ?? null,
      phone: p.phone ?? null,
      email: p.email ?? null,
    })),
    signatures: agreement.signatures.map(s => ({
      ...s,
      signedAt: s.signedAt.toISOString(),
    })),
    versions: agreement.versions.map(v => ({
      ...v,
      createdAt: v.createdAt.toISOString(),
    })),
  }

  return (
    <AgreementDetailWorkspace
      initialAgreement={agreementData}
      casesList={cases}
      clientsList={clients}
    />
  )
}
