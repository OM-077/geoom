// ============================================
// CASE STUDY SUBMISSION
// Contractor submits their before/after score story
// Saves to case_study_submissions table
// Powers social proof on landing page
// Sends confirmation email to contractor
// ============================================

import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Resend } from 'resend'
import { supabaseAdmin } from '@/lib/supabase'

const resend = new Resend(process.env.RESEND_API_KEY!)

export async function POST(req: NextRequest) {
  try {
    // Auth check
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json() as {
      businessId: string
      scoreBefore: number
      scoreAfter: number
      weeksToImprove: number
      whatTheyDid: string
      testimonial?: string
    }

    const { businessId, scoreBefore, scoreAfter, weeksToImprove, whatTheyDid, testimonial } = body

    // Validate
    if (!businessId || scoreBefore === undefined || scoreAfter === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (scoreAfter <= scoreBefore) {
      return NextResponse.json({ error: 'Score after must be higher than score before' }, { status: 400 })
    }

    if (!whatTheyDid || whatTheyDid.trim().length < 20) {
      return NextResponse.json({ error: 'Please describe what you did in at least 20 characters' }, { status: 400 })
    }

    // Get business info
    const { data: business } = await supabaseAdmin
      .from('businesses')
      .select('business_name, trade, city, email, user_id')
      .eq('id', businessId)
      .single()

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }

    // Verify ownership
    if (business.user_id !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Save submission
    const { data: submission, error: insertError } = await supabaseAdmin
      .from('case_study_submissions')
      .insert({
        business_id: businessId,
        business_name: business.business_name,
        trade: business.trade,
        city: business.city,
        score_before: scoreBefore,
        score_after: scoreAfter,
        weeks_to_improve: weeksToImprove,
        what_they_did: whatTheyDid.trim(),
        testimonial: testimonial?.trim() || null,
        approved: false,
        submitted_at: new Date().toISOString()
      })
      .select('id')
      .single()

    if (insertError) throw insertError

    // Send confirmation email
    if (business.email) {
      const improvement = scoreAfter - scoreBefore
      await resend.emails.send({
        from: 'GeoOm <team@geoom.site>',
        to: business.email,
        subject: `Case Study Submitted — +${improvement} points!`,
        html: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:32px 16px;background:#07090C;font-family:-apple-system,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0">
  <tr><td align="center">
  <table width="560" cellpadding="0" cellspacing="0">

  <tr><td style="padding-bottom:24px;">
    <p style="margin:0;color:#8A9BB0;font-size:11px;letter-spacing:3px;text-transform:uppercase;">GEOOM</p>
    <h1 style="margin:8px 0 0;color:#F0F4F8;font-size:22px;">Your case study is submitted.</h1>
  </td></tr>

  <tr><td style="background:#11151C;border:1px solid #00E676;padding:24px;margin-bottom:16px;">
    <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td style="text-align:center;padding:16px;">
        <p style="margin:0;color:#8A9BB0;font-size:11px;text-transform:uppercase;letter-spacing:2px;">SCORE BEFORE</p>
        <p style="margin:6px 0 0;color:#F0F4F8;font-size:40px;font-weight:700;font-family:monospace;">${scoreBefore}</p>
      </td>
      <td style="text-align:center;color:#00E676;font-size:32px;font-weight:700;">→</td>
      <td style="text-align:center;padding:16px;">
        <p style="margin:0;color:#8A9BB0;font-size:11px;text-transform:uppercase;letter-spacing:2px;">SCORE AFTER</p>
        <p style="margin:6px 0 0;color:#00E676;font-size:40px;font-weight:700;font-family:monospace;">${scoreAfter}</p>
      </td>
    </tr>
    </table>
  </td></tr>

  <tr><td height="16"></td></tr>

  <tr><td style="color:#F0F4F8;font-size:14px;line-height:1.7;padding:0 4px;">
    <p>Thank you for submitting your story. Our team will review it and feature it on geoom.site.</p>
    <p>A +${improvement} point improvement in ${weeksToImprove} week${weeksToImprove !== 1 ? 's' : ''} is real — other ${business.trade} contractors in your area are going to see exactly what you did and be inspired to follow your steps.</p>
    <p style="color:#8A9BB0;">If we have any questions, we will reply to this email.</p>
  </td></tr>

  <tr><td style="text-align:center;padding:24px 0;">
    <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="display:inline-block;background:#FF7A00;color:#07090C;padding:14px 32px;text-decoration:none;font-size:14px;font-weight:700;">Back to Dashboard →</a>
  </td></tr>

  <tr><td style="text-align:center;padding-bottom:24px;">
    <p style="margin:0;color:#3A4759;font-size:11px;">GeoOm · AI Visibility for Home Service Contractors</p>
  </td></tr>

  </table>
  </td></tr>
  </table>
</body>
</html>`
      })
    }

    return NextResponse.json({
      success: true,
      submissionId: submission.id,
      message: 'Case study submitted successfully. We will review and feature it shortly.'
    })
  } catch (error) {
    console.error('Case study submission error:', error)
    return NextResponse.json({ error: 'Failed to submit case study' }, { status: 500 })
  }
}
