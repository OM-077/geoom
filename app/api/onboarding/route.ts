export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { z } from 'zod'
import { generateReferralCode } from '@/lib/referral-engine'
import { generateDriverToken } from '@/lib/driver-engine'

const schema = z.object({
  business_name: z.string().min(2).max(100),
  trade: z.enum(['hvac','plumbing','electrical','roofing','cleaning','lawn','pest']),
  city: z.string().min(2),
  state: z.string().min(2),
  zip_code: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().min(7),
  website: z.string().url().optional().or(z.literal('')),
  email: z.string().email().optional().or(z.literal('')),
  competitor_name: z.string().optional(),
  referred_by_code: z.string().optional()
})

export async function POST(req: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const parsed = schema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { data: existing } = await supabase
      .from('businesses')
      .select('id')
      .eq('user_id', session.user.id)
      .single()

    if (existing) {
      const { data: updated } = await supabase
        .from('businesses')
        .update({ ...parsed.data, updated_at: new Date().toISOString() })
        .eq('id', existing.id)
        .select()
        .single()

      return NextResponse.json({ success: true, business: updated })
    }

    const { data: business, error } = await supabase
      .from('businesses')
      .insert({ ...parsed.data, user_id: session.user.id })
      .select()
      .single()

    if (error) throw error

    await Promise.all([
      generateReferralCode(business.id),
      generateDriverToken(business.id),
      supabase.from('onboarding').insert({ business_id: business.id })
    ])

    return NextResponse.json({ success: true, business })
  } catch (error) {
    console.error('Onboarding POST error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: business } = await supabase
      .from('businesses')
      .select('*')
      .eq('user_id', session.user.id)
      .single()

    if (!business) return NextResponse.json({ business: null })

    const { data: onboarding } = await supabase
      .from('onboarding')
      .select('*')
      .eq('business_id', business.id)
      .single()

    return NextResponse.json({ success: true, business, onboarding })
  } catch (error) {
    console.error('Onboarding GET error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: business } = await supabase
      .from('businesses')
      .select('id')
      .eq('user_id', session.user.id)
      .single()

    if (!business) return NextResponse.json({ error: 'No business found' }, { status: 404 })

    const updates = await req.json()
    const { data: updated } = await supabase
      .from('businesses')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', business.id)
      .select()
      .single()

    return NextResponse.json({ success: true, business: updated })
  } catch (error) {
    console.error('Onboarding PATCH error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
