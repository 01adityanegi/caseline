import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { aiImproveClause } from '@/lib/agreement/ai'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { clauseTextEn, clauseTextHi } = await request.json()
    if (!clauseTextEn || !clauseTextEn.trim()) {
      return NextResponse.json({ error: 'Clause text is required' }, { status: 400 })
    }

    const improvement = await aiImproveClause(clauseTextEn.trim(), clauseTextHi)
    return NextResponse.json(improvement)
  } catch (error) {
    console.error('Improve clause error:', error)
    return NextResponse.json({ error: 'Failed to improve clause' }, { status: 500 })
  }
}
