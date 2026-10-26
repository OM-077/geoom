import { Client } from '@upstash/qstash'
import { supabaseAdmin } from './supabase'

const qstash = new Client({ token: process.env.QSTASH_TOKEN! })
const APP_URL = process.env.NEXT_PUBLIC_APP_URL!

// ============================================
// QSTASH ASYNC JOB QUEUE
// Replaces synchronous Vercel crons
// Each business processed independently
// No timeout issues — each job is one request
// If one fails — others keep running
// Scales to any number of users automatically
// ============================================

export async function queueWeeklyAudit(businessId: string): Promise<void> {
  await qstash.publishJSON({
    url: `${APP_URL}/api/jobs/audit`,
    body: { businessId },
    retries: 3,
    delay: 0
  })
}

export async function queuePipelinePoll(
  businessId: string,
  pipeline: 'workiz' | 'servicem8'
): Promise<void> {
  await qstash.publishJSON({
    url: `${APP_URL}/api/jobs/pipeline`,
    body: { businessId, pipeline },
    retries: 2,
    delay: 0
  })
}

export async function queueMondayEmail(businessId: string): Promise<void> {
  await qstash.publishJSON({
    url: `${APP_URL}/api/jobs/email`,
    body: { businessId },
    retries: 3,
    delay: 0
  })
}

export async function queueAllWeeklyAudits(): Promise<{ queued: number }> {
  const { data: businesses } = await supabaseAdmin
    .from('businesses')
    .select('id')
    .eq('subscription_status', 'active')

  if (!businesses?.length) return { queued: 0 }

  for (const business of businesses) {
    await queueWeeklyAudit(business.id)
    await new Promise(r => setTimeout(r, 50))
  }

  return { queued: businesses.length }
}

export async function queueAllMondayEmails(): Promise<{ queued: number }> {
  const { data: businesses } = await supabaseAdmin
    .from('businesses')
    .select('id')
    .eq('subscription_status', 'active')

  if (!businesses?.length) return { queued: 0 }

  for (const business of businesses) {
    await queueMondayEmail(business.id)
    await new Promise(r => setTimeout(r, 50))
  }

  return { queued: businesses.length }
}
