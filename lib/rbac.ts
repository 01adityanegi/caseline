import { prisma } from '@/lib/db'

export interface SessionUser {
  id: string
  name?: string | null
  email?: string | null
  role: string
  organizationId: string
  organizationName?: string
}

export interface ClientScope {
  isClient: boolean
  clientId: string | null
  clientName: string | null
  clientEmail: string | null
}

/**
 * Checks if a session user belongs to the CLIENT role.
 */
export function isClientUser(user: { role?: string } | null | undefined): boolean {
  return user?.role === 'CLIENT'
}

/**
 * Resolves the Client entity associated with a User.
 * Matches by explicit email, matching phone, or matching name within the organization.
 */
export async function getClientForUser(user: SessionUser): Promise<{
  id: string
  name: string
  email: string | null
  phone: string | null
} | null> {
  if (!isClientUser(user)) return null

  // 1. Try matching by email
  if (user.email) {
    const byEmail = await prisma.client.findFirst({
      where: {
        organizationId: user.organizationId,
        email: { equals: user.email },
      },
      select: { id: true, name: true, email: true, phone: true },
    })
    if (byEmail) return byEmail
  }

  // 2. Try matching by user's phone if user record exists
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { phone: true, name: true },
  })

  if (dbUser?.phone) {
    const byPhone = await prisma.client.findFirst({
      where: {
        organizationId: user.organizationId,
        phone: { equals: dbUser.phone },
      },
      select: { id: true, name: true, email: true, phone: true },
    })
    if (byPhone) return byPhone
  }

  // 3. Try matching by exact name
  const targetName = user.name || dbUser?.name
  if (targetName) {
    const byName = await prisma.client.findFirst({
      where: {
        organizationId: user.organizationId,
        name: { equals: targetName },
      },
      select: { id: true, name: true, email: true, phone: true },
    })
    if (byName) return byName
  }

  return null
}

/**
 * Returns complete client scope details for permission gates and query filters.
 */
export async function getClientScope(user: SessionUser): Promise<ClientScope> {
  const isClient = isClientUser(user)
  if (!isClient) {
    return {
      isClient: false,
      clientId: null,
      clientName: null,
      clientEmail: null,
    }
  }

  const client = await getClientForUser(user)
  return {
    isClient: true,
    clientId: client?.id || null,
    clientName: client?.name || user.name || null,
    clientEmail: client?.email || user.email || null,
  }
}

/**
 * Generates Prisma where filter for Cases.
 */
export async function getCaseFilter(user: SessionUser) {
  if (!isClientUser(user)) {
    return { organizationId: user.organizationId }
  }

  const client = await getClientForUser(user)
  if (!client) {
    // Client has no mapped profile - safety deny
    return { organizationId: user.organizationId, id: '__UNAUTHORIZED_CLIENT__' }
  }

  return {
    organizationId: user.organizationId,
    clientId: client.id,
  }
}

/**
 * Generates Prisma where filter for Agreements.
 * Matches either the clientId or agreements where the client is a signatory party.
 */
export async function getAgreementFilter(user: SessionUser) {
  if (!isClientUser(user)) {
    return { organizationId: user.organizationId }
  }

  const client = await getClientForUser(user)
  const clientName = client?.name || user.name || ''

  return {
    organizationId: user.organizationId,
    OR: [
      ...(client?.id ? [{ clientId: client.id }] : []),
      {
        parties: {
          some: {
            OR: [
              ...(clientName ? [{ nameEn: { contains: clientName } }] : []),
              ...(user.email ? [{ email: user.email }] : []),
            ],
          },
        },
      },
    ],
  }
}

/**
 * Generates Prisma where filter for Documents.
 */
export async function getDocumentFilter(user: SessionUser) {
  if (!isClientUser(user)) {
    return { case: { organizationId: user.organizationId } }
  }

  const client = await getClientForUser(user)
  if (!client) {
    return { case: { organizationId: user.organizationId, id: '__DENIED__' } }
  }

  return {
    case: {
      organizationId: user.organizationId,
      clientId: client.id,
    },
  }
}

/**
 * Generates Prisma where filter for Invoices.
 */
export async function getInvoiceFilter(user: SessionUser) {
  if (!isClientUser(user)) {
    return { client: { organizationId: user.organizationId } }
  }

  const client = await getClientForUser(user)
  if (!client) {
    return { client: { organizationId: user.organizationId }, id: '__DENIED__' }
  }

  return {
    client: { organizationId: user.organizationId },
    clientId: client.id,
  }
}
