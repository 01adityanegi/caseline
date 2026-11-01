import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { aiExplainLegalTerm } from '@/lib/agreement/ai'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { term } = await request.json()
    if (!term || !term.trim()) {
      return NextResponse.json({ error: 'Legal term is required' }, { status: 400 })
    }

    const explanation = await aiExplainLegalTerm(term.trim())
    return NextResponse.json(explanation)
  } catch (error) {
    console.error('Explain term error:', error)
    return NextResponse.json({ error: 'Failed to explain legal term' }, { status: 500 })
  }
}
