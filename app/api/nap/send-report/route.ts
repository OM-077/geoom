import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  const { toEmail, businessName, inconsistencies } = await request.json();

  if (!toEmail || !businessName) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const inconsistencyList = inconsistencies
    .map((i: { platform: string; issue: string }) => `• ${i.platform}: ${i.issue}`)
    .join('\n');

  await resend.emails.send({
    from: 'Geoom <alerts@geoom.site>',
    to: toEmail,
    subject: `Action needed: Fix online listings for ${businessName}`,
    text: `Hi,

We found inconsistencies in ${businessName}'s online business listings that are affecting our AI search visibility.

Issues found:
${inconsistencyList}

These need to be fixed so we show up correctly when customers ask ChatGPT, Google, or Siri to recommend us.

Please update each platform with our correct business name, address, and phone number.

Questions? Reply to this email.

Sent via Geoom — AI Visibility for Contractors`,
  });

  return NextResponse.json({ success: true });
}
