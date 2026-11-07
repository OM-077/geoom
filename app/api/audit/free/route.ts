import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { runFreeAudit } from '@/lib/free-audit-engine'

export const dynamic = 'force-dynamic'

const schema = z.object({
  businessName: z.string().min(2).max(100),
  trade: z.enum(['hvac', 'plumbing', 'electrical', 'roofing', 'cleaning', 'lawn', 'pest']),
  city: z.string().min(2),
  state: z.string().min(2),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    }

    const result = await runFreeAudit(parsed.data)
    return NextResponse.json({ success: true, ...result })

  } catch (error) {
    console.error('Free audit error:', error)
    return NextResponse.json({ error: 'Audit failed' }, { status: 500 })
  }
}
