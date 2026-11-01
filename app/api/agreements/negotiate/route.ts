import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { aiNegotiateClause } from '@/lib/agreement/ai'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { clauseText, goal } = await request.json()
    const result = await aiNegotiateClause(clauseText || '', goal || 'Make it fair and mutual')
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to negotiate clause' }, { status: 500 })
  }
}
