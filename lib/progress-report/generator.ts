// ============================================
// PROGRESS REPORT GENERATOR
// 12-week personalized driver plan
// Continues automatically after week 12
// Each week: tasks ranked by score impact
// Adapts as contractor completes actions
// ============================================

import { supabaseAdmin } from '../supabase'
import { callAIJSON } from '../copilot/ai-router'
import { BUCKET_WEIGHTS, type BucketKey } from '../audit-engine'

export interface WeekTask {
  id: string
  title: string
  description: string
  bucket: BucketKey
  impactPoints: number
  timeEstimate: string
  deepLink: string
  done: boolean
  priority: 'critical' | 'high' | 'medium' | 'low'
}

export interface WeekReport {
  weekNumber: number
  scoreAtStart: number
  scoreGoal: number
  tasks: WeekTask[]
  summary: string
  focusBucket: BucketKey
  motivationalMessage: string
}

export interface FullProgressReport {
  businessId: string
  businessName: string
  trade: string
  city: string
  currentScore: number
  currentWeek: number
  weeksRemaining: number
  thisWeek: WeekReport
  upcomingWeeks: Array<{ weekNumber: number; focus: string; estimatedGain: number }>
  totalCompletedTasks: number
  totalPointsGained: number
}

// ---- Generate week tasks based on score and weak buckets ----
function generateWeekTasks(params: {
  weekNumber: number
  currentScore: number
  bucketScores: Record<BucketKey, number>
  trade: string
  city: string
  businessName: string
  completedTaskIds: string[]
}): WeekTask[] {
  const tasks: WeekTask[] = []
  const { bucketScores, weekNumber, trade, city } = params

  // Find weakest buckets — prioritize where we can gain most
  const bucketGaps = Object.entries(bucketScores).map(([key, score]) => ({
    bucket: key as BucketKey,
    gap: BUCKET_WEIGHTS[key as BucketKey] - score,
    score,
    maxScore: BUCKET_WEIGHTS[key as BucketKey]
  })).sort((a, b) => b.gap - a.gap)

  const focusBucket = bucketGaps[0].bucket

  // Week 1–2: Entity and Citations (foundation)
  if (weekNumber <= 2) {
    if (bucketScores.entity < BUCKET_WEIGHTS.entity) {
      tasks.push({
        id: `w${weekNumber}-entity-gbp`,
        title: 'Complete your Google Business Profile',
        description: 'Every AI engine checks GBP first. Fill in every field: hours, photos, services, description.',
        bucket: 'entity',
        impactPoints: 7,
        timeEstimate: '15 minutes',
        deepLink: '/dashboard/nap?platform=google',
        done: false,
        priority: 'critical'
      })
      tasks.push({
        id: `w${weekNumber}-entity-foursquare`,
        title: 'Claim your Foursquare listing',
        description: 'ChatGPT uses Foursquare for local recommendations. Takes 3 minutes.',
        bucket: 'entity',
        impactPoints: 5,
        timeEstimate: '3 minutes',
        deepLink: '/dashboard/nap?platform=foursquare',
        done: false,
        priority: 'critical'
      })
    }
    if (bucketScores.citations < 10) {
      tasks.push({
        id: `w${weekNumber}-citations-yelp`,
        title: 'Fix your Yelp business listing',
        description: 'Perplexity pulls local data from Yelp. Consistent NAP = more AI citations.',
        bucket: 'citations',
        impactPoints: 3,
        timeEstimate: '5 minutes',
        deepLink: '/dashboard/nap?platform=yelp',
        done: false,
        priority: 'high'
      })
    }
  }

  // Week 3–4: Schema and Content
  if (weekNumber >= 3 && weekNumber <= 4) {
    if (bucketScores.schema < BUCKET_WEIGHTS.schema) {
      tasks.push({
        id: `w${weekNumber}-schema-local`,
        title: 'Add LocalBusiness schema to your website',
        description: 'Use GeoOm schema generator — copy and paste into your site header. Instant structured data.',
        bucket: 'schema',
        impactPoints: 7,
        timeEstimate: '10 minutes with GeoOm generator',
        deepLink: '/dashboard/schema',
        done: false,
        priority: 'critical'
      })
      tasks.push({
        id: `w${weekNumber}-schema-faq`,
        title: 'Add FAQ schema to your main service page',
        description: 'Answer the 5 most common questions homeowners ask about your trade in your city.',
        bucket: 'schema',
        impactPoints: 4,
        timeEstimate: '15 minutes',
        deepLink: '/dashboard/schema?type=faq',
        done: false,
        priority: 'high'
      })
    }
    tasks.push({
      id: `w${weekNumber}-content-first`,
      title: `Publish your first local service page for ${city}`,
      description: `Create a page: "${trade} in ${city}" — use GeoOm content generator, takes 2 minutes.`,
      bucket: 'content',
      impactPoints: 5,
      timeEstimate: '2 minutes',
      deepLink: '/dashboard/content',
      done: false,
      priority: 'critical'
    })
  }

  // Week 5–8: Reviews and Content expansion
  if (weekNumber >= 5 && weekNumber <= 8) {
    tasks.push({
      id: `w${weekNumber}-reviews-send`,
      title: 'Send review requests to last 5 completed jobs',
      description: 'GeoOm generates personalized SMS for each customer. Takes 30 seconds each.',
      bucket: 'reviews',
      impactPoints: 3,
      timeEstimate: '2.5 minutes',
      deepLink: '/dashboard/reviews',
      done: false,
      priority: 'high'
    })
    tasks.push({
      id: `w${weekNumber}-content-expand`,
      title: `Publish 3 service pages for ${city} neighborhoods`,
      description: 'Each neighborhood page gives AI one more indexed reason to recommend you for local searches.',
      bucket: 'content',
      impactPoints: 4,
      timeEstimate: '6 minutes total',
      deepLink: '/dashboard/content',
      done: false,
      priority: 'high'
    })
    if (bucketScores.freshness < 10) {
      tasks.push({
        id: `w${weekNumber}-freshness-gbp`,
        title: 'Post a GBP update this week',
        description: 'A weekly post signals active business to AI engines. Share a recent job, tip, or announcement.',
        bucket: 'freshness',
        impactPoints: 4,
        timeEstimate: '2 minutes',
        deepLink: '/dashboard/gbp',
        done: false,
        priority: 'medium'
      })
    }
  }

  // Week 9–12: Domination mode
  if (weekNumber >= 9) {
    tasks.push({
      id: `w${weekNumber}-content-dominate`,
      title: `Expand to 3 neighboring cities`,
      description: 'Publish service pages for cities within 20 miles. Each city doubles your AI catchment area.',
      bucket: 'content',
      impactPoints: 6,
      timeEstimate: '10 minutes',
      deepLink: '/dashboard/content',
      done: false,
      priority: 'high'
    })
    tasks.push({
      id: `w${weekNumber}-reviews-respond`,
      title: 'Respond to all unanswered reviews',
      description: 'Responses with trade + city keywords boost freshness and citation signals.',
      bucket: 'freshness',
      impactPoints: 3,
      timeEstimate: '10 minutes',
      deepLink: '/dashboard/reviews',
      done: false,
      priority: 'medium'
    })
    if (bucketScores.citations < BUCKET_WEIGHTS.citations) {
      tasks.push({
        id: `w${weekNumber}-citations-bbb`,
        title: 'Complete BBB and Angi listings',
        description: 'Final citation platforms. Completing all 8 platforms maxes out your citations bucket.',
        bucket: 'citations',
        impactPoints: 2,
        timeEstimate: '10 minutes',
        deepLink: '/dashboard/nap',
        done: false,
        priority: 'medium'
      })
    }
  }

  // After week 12: perpetual compounding tasks
  if (weekNumber > 12) {
    tasks.push({
      id: `w${weekNumber}-compound-reviews`,
      title: 'Weekly review requests — send to all this week\'s jobs',
      description: 'Review velocity compounds. Every week of consistent review requests grows your citation rate.',
      bucket: 'reviews',
      impactPoints: 2,
      timeEstimate: '5 minutes',
      deepLink: '/dashboard/reviews',
      done: false,
      priority: 'high'
    })
    tasks.push({
      id: `w${weekNumber}-compound-content`,
      title: 'Publish 2 new service pages this week',
      description: 'Content compounds. Each page stays indexed forever and keeps generating AI recommendations.',
      bucket: 'content',
      impactPoints: 2,
      timeEstimate: '4 minutes',
      deepLink: '/dashboard/content',
      done: false,
      priority: 'medium'
    })
    tasks.push({
      id: `w${weekNumber}-compound-gbp`,
      title: 'Post weekly GBP update',
      description: 'Freshness signal. 2 minutes every week = perpetual visibility advantage.',
      bucket: 'freshness',
      impactPoints: 1,
      timeEstimate: '2 minutes',
      deepLink: '/dashboard/gbp',
      done: false,
      priority: 'medium'
    })
  }

  // Filter out already completed tasks and de-dupe
  const filtered = tasks
    .filter(t => !params.completedTaskIds.includes(t.id))
    .slice(0, 4) // Max 4 tasks per week — keep it achievable

  return filtered
}

// ---- Generate motivational message ----
async function generateWeekMessage(params: {
  weekNumber: number
  currentScore: number
  trade: string
  city: string
  focusBucket: BucketKey
}): Promise<string> {
  // Weeks 1–3: use canned messages (save AI quota)
  const cannedMessages: Record<number, string> = {
    1: `Week 1 is about foundations. Every contractor who reaches 70+ started exactly here. Your first fixes this week will move your score more than anything else.`,
    2: `You are building something most contractors in ${params.city} will never have. Keep going.`,
    3: `Your citations are taking shape. AI engines are starting to verify your business. This week we add content.`,
    4: `You have completed the technical foundation. Your score will start accelerating from here.`,
  }

  if (cannedMessages[params.weekNumber]) {
    return cannedMessages[params.weekNumber]
  }

  // Week 5+: AI-generated personalized message
  const prompt = `Write a one-sentence motivational message for a ${params.trade} contractor in ${params.city} who is on week ${params.weekNumber} of improving their AI visibility. Their current score is ${params.currentScore}/100. This week they are focusing on: ${params.focusBucket}. Make it specific, real, and energizing. Do not use generic phrases like "keep it up" or "great job". Reference their trade and city.`

  return await callAIJSON(prompt, `Week ${params.weekNumber}: your ${params.focusBucket} improvements are compounding. Stay consistent.`, {
    maxTokens: 100,
    temperature: 0.8
  }) as unknown as string
}

// ---- MAIN: Generate progress report ----
export async function generateProgressReport(businessId: string): Promise<FullProgressReport> {
  const { data: business } = await supabaseAdmin
    .from('businesses')
    .select('*')
    .eq('id', businessId)
    .single()

  if (!business) throw new Error('Business not found')

  // Get latest audit
  const { data: latestAudit } = await supabaseAdmin
    .from('audit_results')
    .select('*')
    .eq('business_id', businessId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  // Get existing progress report for this week
  const { data: existing } = await supabaseAdmin
    .from('progress_reports')
    .select('*')
    .eq('business_id', businessId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  // Get onboarding week
  const { data: onboarding } = await supabaseAdmin
    .from('onboarding')
    .select('week_number, created_at')
    .eq('business_id', businessId)
    .maybeSingle()

  // Calculate week number
  const startDate = onboarding?.created_at ? new Date(onboarding.created_at) : new Date()
  const weeksSinceStart = Math.floor(
    (Date.now() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000)
  ) + 1
  const currentWeek = Math.max(weeksSinceStart, 1)

  const currentScore = latestAudit?.visibility_score || business.current_score || 0

  const bucketScores = {
    entity: latestAudit?.entity_score || 0,
    schema: latestAudit?.schema_score || 0,
    reviews: latestAudit?.reviews_score || 0,
    citations: latestAudit?.citations_score || 0,
    content: latestAudit?.content_score || 0,
    freshness: latestAudit?.freshness_score || 0
  }

  // Get completed task IDs from all past reports
  const { data: allReports } = await supabaseAdmin
    .from('progress_reports')
    .select('tasks')
    .eq('business_id', businessId)

  const completedTaskIds: string[] = (allReports || []).flatMap(r =>
    ((r.tasks as WeekTask[]) || [])
      .filter((t: WeekTask) => t.done)
      .map((t: WeekTask) => t.id)
  )

  // Generate tasks for this week
  const weekTasks = generateWeekTasks({
    weekNumber: currentWeek,
    currentScore,
    bucketScores,
    trade: business.trade,
    city: business.city,
    businessName: business.business_name,
    completedTaskIds
  })

  const focusBucket = weekTasks[0]?.bucket || 'content'
  const scoreGoal = Math.min(currentScore + weekTasks.reduce((sum, t) => sum + t.impactPoints, 0), 100)

  const motivationalMessage = await generateWeekMessage({
    weekNumber: currentWeek,
    currentScore,
    trade: business.trade,
    city: business.city,
    focusBucket
  })

  const weekReport: WeekReport = {
    weekNumber: currentWeek,
    scoreAtStart: currentScore,
    scoreGoal,
    tasks: weekTasks,
    summary: `Week ${currentWeek} — Focus: ${focusBucket}. Complete all ${weekTasks.length} tasks to gain up to ${scoreGoal - currentScore} points.`,
    focusBucket,
    motivationalMessage
  }

  // Upcoming weeks preview
  const upcomingWeeks = [1, 2, 3].map(offset => {
    const wk = currentWeek + offset
    const focus = wk <= 2 ? 'Entity + Citations'
      : wk <= 4 ? 'Schema + Content'
      : wk <= 8 ? 'Reviews + Freshness'
      : 'Domination + Expansion'
    return { weekNumber: wk, focus, estimatedGain: 5 }
  })

  // Get total completed tasks
  const totalCompletedTasks = completedTaskIds.length
  const totalPointsGained = currentScore  // proxy

  // Save report
  await supabaseAdmin.from('progress_reports').upsert({
    business_id: businessId,
    week_number: currentWeek,
    score_at_start: currentScore,
    tasks: weekTasks,
    total_tasks: weekTasks.length,
    completed_tasks: weekTasks.filter(t => t.done).length,
    summary: weekReport.summary,
    generated_at: new Date().toISOString()
  }, { onConflict: 'business_id,week_number' } as never)

  return {
    businessId,
    businessName: business.business_name,
    trade: business.trade,
    city: business.city,
    currentScore,
    currentWeek,
    weeksRemaining: Math.max(12 - currentWeek, 0),
    thisWeek: weekReport,
    upcomingWeeks,
    totalCompletedTasks,
    totalPointsGained
  }
}

// ---- Mark task as done ----
export async function completeTask(businessId: string, weekNumber: number, taskId: string): Promise<void> {
  const { data: report } = await supabaseAdmin
    .from('progress_reports')
    .select('tasks, completed_tasks')
    .eq('business_id', businessId)
    .eq('week_number', weekNumber)
    .maybeSingle()

  if (!report) return

  const tasks = (report.tasks as WeekTask[]).map(t =>
    t.id === taskId ? { ...t, done: true } : t
  )
  const completedCount = tasks.filter(t => t.done).length

  await supabaseAdmin
    .from('progress_reports')
    .update({ tasks, completed_tasks: completedCount })
    .eq('business_id', businessId)
    .eq('week_number', weekNumber)
}
