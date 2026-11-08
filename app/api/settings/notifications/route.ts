export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET(req: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: business } = await supabase
      .from('businesses')
      .select('notification_preferences')
      .eq('user_id', session.user.id)
      .single()

    return NextResponse.json({
      success: true,
      preferences: business?.notification_preferences || {
        monday_email: true,
        heartbeat_alerts: true,
        citation_celebration: true,
        review_reminders: true
      }
    })
  } catch (error) {
    console.error('Notifications GET error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const preferences = await req.json()

    await supabase
      .from('businesses')
      .update({
        notification_preferences: preferences,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', session.user.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Notifications PATCH error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
