import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  firmName: z.string().min(2, 'Firm or Chamber name must be at least 2 characters'),
  role: z.enum(['ADMIN', 'PARTNER', 'ASSOCIATE', 'PARALEGAL', 'CLIENT']).default('PARTNER'),
  phone: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = registerSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Invalid input data' },
        { status: 400 }
      )
    }

    const { name, email, password, firmName, role, phone } = parsed.data

    // Check if email already registered
    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'An account with this email address already exists. Please sign in.' },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Generate firm slug
    const baseSlug = firmName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') || 'firm'
    const slug = `${baseSlug}-${Date.now().toString(36)}`

    // Create organization
    const organization = await prisma.organization.create({
      data: {
        name: firmName.trim(),
        slug,
        settings: JSON.stringify({
          currency: 'INR',
          state: 'Delhi',
          dateFormat: 'DD/MM/YYYY',
          onboardingCompleted: true,
        }),
      },
    })

    // Create user
    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        role,
        phone: phone || null,
        organizationId: organization.id,
        isActive: true,
      },
    })

    // Welcome Notification
    await prisma.notification.create({
      data: {
        title: 'Welcome to CaseLine',
        body: `Welcome ${user.name}! Your workspace for ${organization.name} is ready. Start by creating a case or drafting an agreement.`,
        type: 'INFO',
        userId: user.id,
        link: '/dashboard',
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Account created successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        firmName: organization.name,
      },
    })
  } catch (err: any) {
    console.error('Registration error:', err)
    return NextResponse.json(
      { error: err?.message || 'Failed to create account. Please try again.' },
      { status: 500 }
    )
  }
}
