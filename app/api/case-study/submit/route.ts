import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { businessId, scoreImprovement, callsIncrease, testimonial, permitToShare } = await request.json();

  const { error } = await supabase
    .from('case_study_submissions')
    .insert({
      business_id: businessId,
      score_improvement: scoreImprovement,
      calls_increase: callsIncrease,
      testimonial,
      permit_to_share: permitToShare,
      submitted_at: new Date().toISOString(),
    });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
