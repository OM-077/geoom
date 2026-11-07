// ============================================
// MONDAY MORNING EMAIL
// Weekly proof the machine is working
// Market share language — not raw scores
// Competitor comparison every week
// One specific action item based on their score
// This is the retention engine — they stay subscribed
// because they see progress every Monday morning
// ============================================

import { Resend } from 'resend'
import { supabaseAdmin } from './supabase'
import { scoreToMarketShare } from './utils'

const resend = new Resend(process.env.RESEND_API_KEY!)

export async function sendMondayEmail(businessId: string): Promise<{
  sent: boolean
  emailId?: string
}> {
  const { data: business } = await supabaseAdmin
    .from('businesses')
    .select('*')
    .eq('id', businessId)
    .single()

  if (!business?.email) return { sent: false }
  if (business.subscription_status !== 'active') return { sent: false }

  const notifPrefs = business.notification_preferences as {
    monday_email?: boolean
  } | null
  if (notifPrefs?.monday_email === false) return { sent: false }

  const { data: audits } = await supabaseAdmin
    .from('audit_results')
    .select('visibility_score, market_share_percent, created_at')
    .eq('business_id', businessId)
    .order('created_at', { ascending: false })
    .limit(2)

  const oneWeekAgo = new Date()
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

  const { data: pagesThisWeek } = await supabaseAdmin
    .from('content_pages')
    .select('title, source')
    .eq('business_id', businessId)
    .eq('published', true)
    .gte('published_at', oneWeekAgo.toISOString())
    .order('published_at', { ascending: false })

  const { data: competitor } = await supabaseAdmin
    .from('competitor_tracking')
    .select('competitor_name, competitor_score, competitor_market_share')
    .eq('business_id', businessId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

    const { data: pendingReviews } = await supabaseAdmin
    .from('review_requests')
    .select('id')
    .eq('business_id', businessId)
    .eq('sent', false)

  const { data: journeyThisWeek } = await supabaseAdmin
    .from('journey_events')
    .select('description, points_gained')
    .eq('business_id', businessId)
    .gte('created_at', oneWeekAgo.toISOString())
    .order('created_at', { ascending: false })
    .limit(5)

  const scoreNow = audits?.[0]?.visibility_score || 0
  const scoreLast = audits?.[1]?.visibility_score || 0
  const shareNow = audits?.[0]?.market_share_percent || scoreToMarketShare(scoreNow)
  const shareLast = audits?.[1]?.market_share_percent || scoreToMarketShare(scoreLast)
  const shareChange = Math.round((shareNow - shareLast) * 10) / 10

  const competitorShare = competitor?.competitor_market_share
    || scoreToMarketShare(competitor?.competitor_score || 0)
  const competitorName = competitor?.competitor_name || 'Your top competitor'
  const pagesCount = pagesThisWeek?.length || 0
  const pendingCount = pendingReviews?.length || 0

  // One specific action based on their current position
  let actionItem = ''
  if (shareNow < 20) {
    actionItem = `Fix your Foursquare listing today — ChatGPT uses Foursquare data for local business recommendations. Takes 3 minutes. Worth up to 12% more AI market share.`
  } else if (shareNow < 35) {
    actionItem = `Fix your Yelp categories — Perplexity uses Yelp as its primary local data source. You are missing homeowners who ask Perplexity for ${business.trade} recommendations in ${business.city}.`
  } else if (shareNow < 50) {
    actionItem = `Publish 3 more service pages this week — each page targeting a different neighborhood in ${business.city} gives AI one more reason to recommend you.`
  } else if (shareNow < 65) {
    actionItem = `Send review requests to your last 5 jobs — reviews mentioning "${business.trade}" and "${business.city}" directly increase your AI citation rate.`
  } else {
    actionItem = `Expand to neighboring cities — publish pages for ${business.city} surrounding areas to grow your AI visibility territory.`
  }

  const changeColor = shareChange > 0 ? '#00E676' : shareChange < 0 ? '#FF2A2A' : '#8A9BB0'
  const changeText = shareChange > 0
    ? `▲ +${shareChange}% from last week — you are gaining territory`
    : shareChange < 0
    ? `▼ ${shareChange}% from last week`
    : `→ No change from last week`

  const isAhead = shareNow > competitorShare
  const gap = Math.abs(shareNow - competitorShare)

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#07090C;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0">

<tr><td style="padding-bottom:24px;">
  <p style="margin:0;color:#8A9BB0;font-size:11px;letter-spacing:3px;text-transform:uppercase;">GEOOM</p>
  <h1 style="margin:8px 0 0;color:#F0F4F8;font-size:20px;font-weight:700;">Monday Intelligence Report</h1>
  <p style="margin:4px 0 0;color:#8A9BB0;font-size:13px;">${business.business_name} · ${business.city}, ${business.state}</p>
</td></tr>

<tr><td style="background:#11151C;border:1px solid #222A35;padding:24px;margin-bottom:16px;">
  <table width="100%" cellpadding="0" cellspacing="0">
  <tr>
    <td style="text-align:center;padding:16px;background:#07090C;">
      <p style="margin:0;color:#8A9BB0;font-size:10px;text-transform:uppercase;letter-spacing:2px;">YOUR AI MARKET SHARE</p>
      <p style="margin:8px 0 0;color:#F0F4F8;font-size:48px;font-weight:700;line-height:1;font-family:monospace;">${shareNow}%</p>
      <p style="margin:6px 0 0;color:${changeColor};font-size:12px;font-weight:600;">${changeText}</p>
    </td>
    <td width="12"></td>
    <td style="text-align:center;padding:16px;background:#07090C;">
      <p style="margin:0;color:#8A9BB0;font-size:10px;text-transform:uppercase;letter-spacing:2px;">${competitorName.toUpperCase()}</p>
      <p style="margin:8px 0 0;color:${isAhead ? '#FF2A2A' : '#8A9BB0'};font-size:48px;font-weight:700;line-height:1;font-family:monospace;">${competitorShare}%</p>
      <p style="margin:6px 0 0;color:${isAhead ? '#00E676' : '#FF2A2A'};font-size:12px;">
        ${isAhead ? `You are ${gap}% ahead` : `You are ${gap}% behind`}
      </p>
    </td>
    <td width="12"></td>
    <td style="text-align:center;padding:16px;background:#07090C;">
      <p style="margin:0;color:#8A9BB0;font-size:10px;text-transform:uppercase;letter-spacing:2px;">PAGES THIS WEEK</p>
      <p style="margin:8px 0 0;color:#00E676;font-size:48px;font-weight:700;line-height:1;font-family:monospace;">${pagesCount}</p>
      <p style="margin:6px 0 0;color:#8A9BB0;font-size:12px;">SEO pages published</p>
    </td>
  </tr>
  </table>
</td></tr>

<tr><td height="16"></td></tr>

<tr><td style="background:rgba(255,122,0,0.08);border:1px solid #FF7A00;padding:20px;">
  <p style="margin:0;color:#FF7A00;font-size:10px;text-transform:uppercase;letter-spacing:2px;font-weight:700;">THIS WEEK — ONE ACTION</p>
  <p style="margin:8px 0 0;color:#F0F4F8;font-size:14px;line-height:1.6;">${actionItem}</p>
</td></tr>

<tr><td height="16"></td></tr>

${journeyThisWeek && journeyThisWeek.length > 0 ? `
<tr><td style="background:#11151C;border:1px solid #222A35;padding:20px;margin-bottom:16px;">
  <p style="margin:0;color:#8A9BB0;font-size:10px;text-transform:uppercase;letter-spacing:2px;font-weight:700;">THIS WEEK — WHAT MOVED YOUR SCORE</p>
  ${journeyThisWeek.map(e => `
  <p style="margin:8px 0 0;color:#F0F4F8;font-size:13px;line-height:1.5;">
    <span style="color:#00E676;font-weight:700;">+${e.points_gained}pts</span> — ${e.description}
  </p>`).join('')}
</td></tr>
<tr><td height="16"></td></tr>` : ''}
  <p style="margin:0;color:#00E676;font-size:13px;font-weight:600;">${pendingCount} review request${pendingCount > 1 ? 's' : ''} ready to send</p>
  <p style="margin:4px 0 0;color:#8A9BB0;font-size:12px;">Open your dashboard to copy and send them — takes 30 seconds each.</p>
</td></tr>
<tr><td height="16"></td></tr>` : ''}

<tr><td style="text-align:center;padding:8px 0 24px;">
  <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="display:inline-block;background:#FF7A00;color:#07090C;padding:14px 32px;text-decoration:none;font-size:14px;font-weight:700;">View Full Dashboard →</a>
</td></tr>

<tr><td style="text-align:center;padding-bottom:32px;">
  <p style="margin:0;color:#3A4759;font-size:11px;">GeoOm · AI Visibility for Home Service Contractors · geoom.site</p>
</td></tr>

</table>
</td></tr>
</table>
</body>
</html>`

  try {
    const { data: emailData, error } = await resend.emails.send({
      from: 'GeoOm <reports@geoom.site>',
      to: business.email,
      subject: `Your AI Market Share: ${shareNow}% ${shareChange > 0 ? '📈' : shareChange < 0 ? '📉' : ''}`,
      html
    })

    if (error) throw error

    await supabaseAdmin.from('email_reports').insert({
      business_id: businessId,
      score_this_week: scoreNow,
      score_last_week: scoreLast,
      score_change: scoreNow - scoreLast,
      market_share_this_week: shareNow,
      market_share_change: shareChange,
      competitor_score: competitor?.competitor_score || 0,
      pages_published: pagesCount,
      action_item: actionItem,
      email_id: emailData?.id
    })

    return { sent: true, emailId: emailData?.id }
  } catch (error) {
    console.error('Monday email error:', error)
    return { sent: false }
  }
}

export async function sendMondayEmailsToAll(): Promise<{
  sent: number
  failed: number
}> {
  const { data: businesses } = await supabaseAdmin
    .from('businesses')
    .select('id')
    .eq('subscription_status', 'active')

  if (!businesses?.length) return { sent: 0, failed: 0 }

  let sent = 0
  let failed = 0

  for (const business of businesses) {
    const result = await sendMondayEmail(business.id)
    if (result.sent) sent++
    else failed++
    // Rate limit: 2/sec
    await new Promise(r => setTimeout(r, 500))
  }

  return { sent, failed }
}
