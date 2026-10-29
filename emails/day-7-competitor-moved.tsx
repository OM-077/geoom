export async function sendCompetitorMovedEmail(to: string, name: string, competitorName: string, city: string, trade: string) {
  await resend.emails.send({
    from: 'Geoom <alerts@geoom.site>',
    to,
    subject: `A ${trade} competitor in ${city} just improved their AI score`,
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;background:#0f0f0f;color:#e0e0e0;padding:40px;">
        <h1 style="font-size:22px;">Heads up, ${name}</h1>
        <p><strong>${competitorName}</strong> just improved their Geoom Score.</p>
        <p>That means they're getting more AI visibility in ${city} — and potentially more calls from ChatGPT and Google AI.</p>
        <p>Check what they changed and stay ahead.</p>
        <a href="https://geoom.site/competitors" style="display:block;background:#c9a84c;color:#0f0f0f;padding:14px 24px;border-radius:8px;text-decoration:none;font-weight:700;text-align:center;margin-top:24px;">See competitor scores →</a>
      </div>
    `,
  });
}
