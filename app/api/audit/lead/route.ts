import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY!)

export async function POST(req: NextRequest) {
  try {
    const { email, businessName, city, trade, plan, auditScore } = await req.json()

    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 })
    }

    await supabaseAdmin
      .from('waitlist')
      .upsert({
        email,
        business_name: businessName,
        city,
        trade,
        plan: plan || 'pro',
        audit_score: auditScore || null
      }, { onConflict: 'email' })

    const firstName = businessName?.split(' ')[0] || 'there'

    await resend.emails.send({
      from: 'GeoOm <hello@geoom.site>',
      to: email,
      subject: `Your AI visibility score for ${businessName || 'your business'}`,
      html: `
        <div style="background:#07090C;padding:40px;font-family:sans-serif;max-width:560px;margin:0 auto;">
          <p style="color:#8A9BB0;font-size:11px;letter-spacing:3px;text-transform:uppercase;margin-bottom:24px;">GEOOM — AI VISIBILITY</p>
          <h1 style="color:#F0F4F8;font-size:24px;font-weight:700;margin-bottom:16px;line-height:1.3;">
            You're on the list, ${firstName}.
          </h1>
          <p style="color:#8A9BB0;font-size:15px;line-height:1.7;margin-bottom:16px;">
            Your AI visibility score for <strong style="color:#F0F4F8;">${businessName || 'your business'}</strong> in ${city || 'your area'} came back at <strong style="color:#FF7A00;">${auditScore || '—'}/100</strong>.
          </p>
          <p style="color:#8A9BB0;font-size:15px;line-height:1.7;margin-bottom:16px;">
            Right now, when homeowners in ${city || 'your area'} ask ChatGPT for a ${trade || 'home service'} contractor — your competitors are showing up. Not you.
          </p>
          <p style="color:#8A9BB0;font-size:15px;line-height:1.7;margin-bottom:32px;">
            GeoOm fixes every reason AI ignores your business. You'll get early access before anyone else.
          </p>
          <p style="color:#3A4759;font-size:12px;">GeoOm · hello@geoom.site</p>
        </div>
      `
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Lead capture error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
