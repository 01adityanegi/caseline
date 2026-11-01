import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { aiAnalyzeRiskAndFairness } from '@/lib/agreement/ai'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { text, perspective } = await request.json()
    const result = await aiAnalyzeRiskAndFairness(text || '', perspective || 'TENANT')
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to analyze risk' }, { status: 500 })
  }
}
