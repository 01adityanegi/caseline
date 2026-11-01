import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { aiDescribeToAgreement } from '@/lib/agreement/ai'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { description } = await request.json()
    if (!description || typeof description !== 'string') {
      return NextResponse.json({ error: 'Description is required' }, { status: 400 })
    }

    const result = await aiDescribeToAgreement(description)
    return NextResponse.json(result)
  } catch (error) {
    console.error('Describe-to-agreement error:', error)
    return NextResponse.json({ error: 'Failed to parse deal description' }, { status: 500 })
  }
}
