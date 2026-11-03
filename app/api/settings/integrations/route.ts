import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { getJobberOAuthUrl } from '@/lib/pipelines/jobber'
import { generateHousecallWebhookUrl } from '@/lib/pipelines/housecall'
import { getGBPAuthUrl } from '@/lib/gbp-oauth'
import { verifyWordPressConnection } from '@/lib/wordpress-publisher'

export async function GET(req: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: business } = await supabase
      .from('businesses')
      .select(`
        id, jobber_connected, workiz_api_token,
        servicem8_api_key, gbp_connected,
        wordpress_url, housecall_webhook_url
      `)
      .eq('user_id', session.user.id)
      .single()

    if (!business) return NextResponse.json({ error: 'No business found' }, { status: 404 })

    return NextResponse.json({
      success: true,
      integrations: {
        jobber: {
          connected: business.jobber_connected || false,
          oauthUrl: getJobberOAuthUrl(business.id)
        },
        housecall: {
          connected: !!business.housecall_webhook_url,
          webhookUrl: generateHousecallWebhookUrl(business.id)
        },
        workiz: { connected: !!business.workiz_api_token },
        servicem8: { connected: !!business.servicem8_api_key },
        gbp: {
          connected: business.gbp_connected || false,
          authUrl: getGBPAuthUrl(business.id)
        },
        wordpress: {
          connected: !!business.wordpress_url,
          url: business.wordpress_url || null
        }
      }
    })
  } catch (error) {
    console.error('Integrations GET error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
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

    const body = await req.json() as {
      integration: string
      apiKey?: string
      url?: string
      username?: string
    }

    const updates: Record<string, string | boolean> = {}

    if (body.integration === 'workiz' && body.apiKey) {
      updates.workiz_api_token = body.apiKey
    }

    if (body.integration === 'servicem8' && body.apiKey) {
      updates.servicem8_api_key = body.apiKey
    }

    if (body.integration === 'wordpress' && body.url) {
      const verified = await verifyWordPressConnection({
        wordpressUrl: body.url,
        apiKey: body.apiKey || '',
        username: body.username
      })

      if (!verified.connected) {
        return NextResponse.json({
          success: false,
          error: verified.error || 'Could not connect to WordPress'
        })
      }

      updates.wordpress_url = body.url
      if (body.apiKey) updates.wordpress_api_key = body.apiKey
      if (body.username) updates.wordpress_username = body.username
    }

    if (Object.keys(updates).length > 0) {
      await supabase
        .from('businesses')
        .update(updates)
        .eq('id', business.id)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Integrations POST error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
