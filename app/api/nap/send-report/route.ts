// ============================================
// NAP REPORT EMAIL SENDER
// Sends the full NAP audit to office manager
// Signed token in URL — no auth required on endpoint
// Formats platform-by-platform fix list
// ============================================

import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { supabaseAdmin } from '@/lib/supabase'
import { getNAPStatus } from '@/lib/nap-scanner'

const resend = new Resend(process.env.RESEND_API_KEY!)

// Simple token: base64(businessId:secret)
function verifyToken(token: string, businessId: string): boolean {
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8')
    const [id, secret] = decoded.split(':')
    return id === businessId && secret === process.env.CRON_SECRET
  } catch {
    return false
  }
}

export async function POST(req: NextRequest) {
  try {
    const { businessId, recipientEmail, token } = await req.json() as {
      businessId: string
      recipientEmail: string
      token: string
    }

    if (!businessId || !recipientEmail || !token) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (!verifyToken(token, businessId)) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const { data: business } = await supabaseAdmin
      .from('businesses')
      .select('business_name, trade, city, state, phone, address, website')
      .eq('id', businessId)
      .single()

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }

    const napStatus = await getNAPStatus(businessId)

    // Build the email HTML
    const platformRows = (napStatus?.platforms || []).map(p => {
      const status = !p.listed
        ? `<span style="color:#FF2A2A;font-weight:700;">NOT LISTED</span>`
        : !p.napConsistent
        ? `<span style="color:#FF7A00;font-weight:700;">LISTED — NAP MISMATCH</span>`
        : `<span style="color:#00E676;font-weight:700;">✓ CONSISTENT</span>`

      const issuesList = p.issues.length > 0
        ? `<ul style="margin:4px 0 0 16px;padding:0;color:#8A9BB0;font-size:12px;">${p.issues.map(i => `<li>${i}</li>`).join('')}</ul>`
        : ''

      const action = !p.listed
        ? `<a href="${p.claimUrl}" style="color:#FF7A00;font-size:12px;">Claim listing →</a>`
        : !p.napConsistent
        ? `<a href="${p.editUrl}" style="color:#FF7A00;font-size:12px;">Fix now →</a>`
        : ''

      return `
      <tr>
        <td style="padding:12px 16px;border-bottom:1px solid #222A35;color:#F0F4F8;font-size:14px;font-weight:600;">${p.label}</td>
        <td style="padding:12px 16px;border-bottom:1px solid #222A35;font-size:13px;">${status}${issuesList}</td>
        <td style="padding:12px 16px;border-bottom:1px solid #222A35;font-size:13px;">${action}</td>
      </tr>`
    }).join('')

    const overallScore = napStatus?.consistencyPercent || 0
    const scoreColor = overallScore >= 80 ? '#00E676' : overallScore >= 50 ? '#FF7A00' : '#FF2A2A'

    const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#07090C;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
<tr><td align="center">
<table width="640" cellpadding="0" cellspacing="0">

<tr><td style="padding-bottom:24px;">
  <p style="margin:0;color:#8A9BB0;font-size:11px;letter-spacing:3px;text-transform:uppercase;">GEOOM</p>
  <h1 style="margin:8px 0 0;color:#F0F4F8;font-size:22px;font-weight:700;">NAP Consistency Report</h1>
  <p style="margin:4px 0 0;color:#8A9BB0;font-size:14px;">${business.business_name} · ${business.city}, ${business.state}</p>
</td></tr>

<!-- Score summary -->
<tr><td style="background:#11151C;border:1px solid #222A35;padding:24px;margin-bottom:16px;">
  <table width="100%" cellpadding="0" cellspacing="0">
  <tr>
    <td>
      <p style="margin:0;color:#8A9BB0;font-size:10px;text-transform:uppercase;letter-spacing:2px;">CONSISTENCY SCORE</p>
      <p style="margin:6px 0 0;color:${scoreColor};font-size:48px;font-weight:700;line-height:1;font-family:monospace;">${overallScore}%</p>
    </td>
    <td style="text-align:right;vertical-align:top;">
      <div style="background:#07090C;padding:16px;display:inline-block;">
        <p style="margin:0;color:#8A9BB0;font-size:11px;font-weight:600;">MASTER NAP</p>
        <p style="margin:4px 0 0;color:#F0F4F8;font-size:13px;">${business.business_name}</p>
        <p style="margin:2px 0 0;color:#F0F4F8;font-size:13px;">${business.address || ''}</p>
        <p style="margin:2px 0 0;color:#F0F4F8;font-size:13px;">${business.city}, ${business.state}</p>
        <p style="margin:2px 0 0;color:#F0F4F8;font-size:13px;">${business.phone || ''}</p>
      </div>
    </td>
  </tr>
  </table>
</td></tr>

<tr><td height="16"></td></tr>

<!-- Platform table -->
<tr><td style="background:#11151C;border:1px solid #222A35;">
  <table width="100%" cellpadding="0" cellspacing="0">
  <tr style="background:#07090C;">
    <th style="padding:10px 16px;text-align:left;color:#8A9BB0;font-size:10px;text-transform:uppercase;letter-spacing:2px;font-weight:600;">Platform</th>
    <th style="padding:10px 16px;text-align:left;color:#8A9BB0;font-size:10px;text-transform:uppercase;letter-spacing:2px;font-weight:600;">Status</th>
    <th style="padding:10px 16px;text-align:left;color:#8A9BB0;font-size:10px;text-transform:uppercase;letter-spacing:2px;font-weight:600;">Action</th>
  </tr>
  ${platformRows}
  </table>
</td></tr>

<tr><td height="24"></td></tr>

<tr><td style="background:rgba(255,122,0,0.08);border:1px solid #FF7A00;padding:16px;">
  <p style="margin:0;color:#FF7A00;font-size:11px;text-transform:uppercase;letter-spacing:2px;font-weight:700;">WHY THIS MATTERS</p>
  <p style="margin:8px 0 0;color:#F0F4F8;font-size:13px;line-height:1.6;">AI engines like ChatGPT, Siri, and Gemini cross-reference your business information across all of these platforms. When your name, address, or phone number differs — even slightly — they lower your confidence score and show a competitor instead. Every fix above is worth real revenue.</p>
</td></tr>

<tr><td style="text-align:center;padding:24px 0;">
  <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/nap" style="display:inline-block;background:#FF7A00;color:#07090C;padding:14px 32px;text-decoration:none;font-size:14px;font-weight:700;">Fix Issues in Dashboard →</a>
</td></tr>

<tr><td style="text-align:center;padding-bottom:32px;">
  <p style="margin:0;color:#3A4759;font-size:11px;">GeoOm · AI Visibility for Home Service Contractors · geoom.site</p>
</td></tr>

</table>
</td></tr>
</table>
</body>
</html>`

    const { data: emailData, error } = await resend.emails.send({
      from: 'GeoOm <reports@geoom.site>',
      to: recipientEmail,
      subject: `NAP Report: ${business.business_name} — ${overallScore}% Consistency`,
      html
    })

    if (error) throw error

    return NextResponse.json({
      success: true,
      emailId: emailData?.id,
      score: overallScore
    })
  } catch (error) {
    console.error('NAP report email error:', error)
    return NextResponse.json({ error: 'Failed to send report' }, { status: 500 })
  }
}
