export async function sendFirstActionEmail(to: string, name: string, trade: string) {
  await resend.emails.send({
    from: 'Geoom <hello@geoom.site>',
    to,
    subject: `Your first AI fix takes 18 minutes`,
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;background:#0f0f0f;color:#e0e0e0;padding:40px;">
        <h1 style="font-size:22px;">Hey ${name},</h1>
        <p>The #1 thing that moves your Geoom Score is claiming your Foursquare listing.</p>
        <p>Why? ChatGPT uses Foursquare to recommend local ${trade} contractors. Most contractors have never claimed it.</p>
        <p>Takes 18 minutes. Free to claim.</p>
        <a href="https://geoom.site/driver" style="display:block;background:#c9a84c;color:#0f0f0f;padding:14px 24px;border-radius:8px;text-decoration:none;font-weight:700;text-align:center;margin-top:24px;">See Week 1 actions →</a>
      </div>
    `,
  });
}
