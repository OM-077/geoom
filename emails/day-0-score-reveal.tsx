import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendScoreRevealEmail(to: string, name: string, score: number, trade: string, city: string) {
  const estimatedCalls = Math.round((score * 2 * 4) * 0.04);
  const scoreColor = score >= 70 ? 'green' : score >= 40 ? 'orange' : 'red';
  
  await resend.emails.send({
    from: 'Geoom <hello@geoom.site>',
    to,
    subject: `Your AI score is ${score} — here's what it means`,
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;background:#0f0f0f;color:#e0e0e0;padding:40px;border-radius:12px;">
        <h1 style="font-size:24px;margin:0 0 8px;">Hi ${name},</h1>
        <p style="color:#aaa;margin:0 0 32px;">Your AI visibility scan just finished.</p>
        
        <div style="text-align:center;background:#1a1a1a;border-radius:12px;padding:32px;margin-bottom:32px;">
          <div style="font-size:80px;font-weight:700;color:${scoreColor === 'green' ? '#4CAF50' : scoreColor === 'orange' ? '#FF9800' : '#f44336'};">${score}</div>
          <div style="font-size:16px;color:#aaa;">Your Geoom Score</div>
          <div style="font-size:14px;color:#888;margin-top:8px;">~${estimatedCalls} calls/month from AI sources at this score</div>
        </div>
        
        <p>This score means: when someone in ${city} asks ChatGPT or Google AI to recommend a ${trade} contractor, you ${score >= 70 ? 'often show up' : score >= 40 ? 'sometimes show up' : "don't show up yet"}.</p>
        
        <p>Your 12-week fix program is ready. The first action takes 18 minutes.</p>
        
        <a href="https://geoom.site/driver" style="display:block;background:#c9a84c;color:#0f0f0f;padding:14px 24px;border-radius:8px;text-decoration:none;font-weight:700;text-align:center;margin-top:24px;">Start your fix program →</a>
        
        <p style="font-size:12px;color:#555;margin-top:32px;">Geoom · AI Visibility for Contractors · geoom.site</p>
      </div>
    `,
  });
}
