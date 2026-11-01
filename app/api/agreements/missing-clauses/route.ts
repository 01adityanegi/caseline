import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { aiFindMissingClauses } from '@/lib/agreement/ai'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { text, category } = await request.json()
    const result = await aiFindMissingClauses(text || '', category || 'Rental & Property')
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to find missing clauses' }, { status: 500 })
  }
}
