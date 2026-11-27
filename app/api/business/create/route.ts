export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST(req: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json() as {
      business_name: string
      trade: string
      city: string
      state?: string
      phone?: string
      website_url?: string
    }

    if (!body.business_name || !body.trade || !body.city) {
      return NextResponse.json({ error: 'business_name, trade, and city are required' }, { status: 400 })
    }

    // Check if business already exists for this user
    const { data: existing } = await supabase
      .from('businesses')
      .select('id')
      .eq('user_id', session.user.id)
      .single()

    if (existing) {
      // Update existing record
      const { data, error } = await supabase
        .from('businesses')
        .update({
          business_name: body.business_name,
          trade: body.trade,
          city: body.city,
          state: body.state || null,
          phone: body.phone || null,
          website_url: body.website_url || null,
          email: session.user.email,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id)
        .select('id')
        .single()

      if (error) {
        console.error('Business update error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({ success: true, businessId: data.id })
    }

    // Create new business record
    const { data, error } = await supabase
      .from('businesses')
      .insert({
        user_id: session.user.id,
        business_name: body.business_name,
        trade: body.trade,
        city: body.city,
        state: body.state || null,
        phone: body.phone || null,
        website_url: body.website_url || null,
        email: session.user.email,
        subscription_status: 'inactive',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select('id')
      .single()

    if (error) {
      console.error('Business create error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, businessId: data.id })
  } catch (err) {
    console.error('Business API error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
