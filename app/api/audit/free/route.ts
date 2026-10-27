import { NextRequest, NextResponse } from 'next/server'
import { runAudit } from '@/lib/audit-engine'
import { z } from 'zod'

const schema = z.object({
  businessName: z.string().min(2).max(100),
  trade: z.enum(['hvac','plumbing','electrical','roofing','cleaning','lawn','pest']),
  city: z.string().min(2),
  state: z.string().min(2),
  competitorName: z.string().optional()
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = schema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const result = await runAudit({
      businessName: parsed.data.businessName,
      trade: parsed.data.trade,
      city: parsed.data.city,
      state: parsed.data.state,
      competitorName: parsed.data.competitorName
    })

    return NextResponse.json({ success: true, ...result })
  } catch (error) {
    console.error('Free audit error:', error)
    return NextResponse.json({ error: 'Audit failed' }, { status: 500 })
  }
}
