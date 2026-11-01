import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { aiExplainClause } from '@/lib/agreement/ai'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { clauseTextEn, clauseTextHi } = await request.json()
    const result = await aiExplainClause(clauseTextEn || '', clauseTextHi)
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to explain clause' }, { status: 500 })
  }
}
