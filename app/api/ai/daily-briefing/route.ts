import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { aiDailyBriefing } from '@/lib/ai/service'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { kpis } = await request.json()
    const briefing = await aiDailyBriefing({
      activeCases: kpis.activeCases || 0,
      overdueDeadlines: kpis.overdueDeadlines || 0,
      hearingsToday: kpis.hearingsThisWeek || 0,
      tasksToday: 0,
      recentActivity: [],
    })

    return NextResponse.json({ briefing })
  } catch {
    return NextResponse.json({ briefing: 'Unable to generate briefing at this time.' })
  }
}
