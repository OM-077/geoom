import { createClient } from '@supabase/supabase-js';

interface ReportData {
  businessId: string;
  businessName: string;
  trade: string;
  city: string;
  currentScore: number;
  scoreThirtyDaysAgo: number;
  topImprovements: string[];
  platformChanges: { platform: string; before: string; after: string }[];
  estimatedCalls: number;
  nextActions: string[];
}

export async function generateProgressReport(businessId: string): Promise<ReportData> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: business } = await supabase
    .from('businesses')
    .select('*')
    .eq('id', businessId)
    .single();

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data: scoreHistory } = await supabase
    .from('score_history')
    .select('score, created_at')
    .eq('business_id', businessId)
    .gte('created_at', thirtyDaysAgo.toISOString())
    .order('created_at', { ascending: true });

  const oldScore = scoreHistory?.[0]?.score ?? business.geoom_score;
  const currentScore = business.geoom_score ?? 0;
  const estimatedCalls = Math.round((currentScore * 2 * 4) * 0.04);

  const { data: changelog } = await supabase
    .from('signal_changelog')
    .select('*')
    .eq('business_id', businessId)
    .gte('created_at', thirtyDaysAgo.toISOString())
    .order('created_at', { ascending: false })
    .limit(5);

  const topImprovements = changelog?.map(c => 
    `${c.signal_name} improved from ${c.old_value} to ${c.new_value}`
  ) ?? [];

  return {
    businessId,
    businessName: business.name,
    trade: business.trade,
    city: business.city,
    currentScore,
    scoreThirtyDaysAgo: oldScore,
    topImprovements,
    platformChanges: [],
    estimatedCalls,
    nextActions: [
      'Complete your Foursquare listing claim',
      'Add 3 FAQ pages to your website',
      'Request 5 Google reviews this week',
    ],
  };
}
