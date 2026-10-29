import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get('name') ?? 'My Business';
  const score = searchParams.get('score') ?? '0';
  const trade = searchParams.get('trade') ?? 'Contractor';
  const city = searchParams.get('city') ?? '';

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          background: 'oklch(7% 0.006 95)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ fontSize: '24px', color: 'oklch(72% 0 0)', marginBottom: '16px' }}>
          AI Visibility Score
        </div>
        <div style={{ fontSize: '160px', color: 'oklch(84% 0.19 80.46)', fontWeight: 'bold', lineHeight: 1 }}>
          {score}
        </div>
        <div style={{ fontSize: '32px', color: 'oklch(88% 0 0)', marginTop: '24px' }}>
          {name}
        </div>
        <div style={{ fontSize: '20px', color: 'oklch(72% 0 0)', marginTop: '8px' }}>
          {trade} · {city}
        </div>
        <div style={{ fontSize: '16px', color: 'oklch(52% 0 0)', marginTop: '40px' }}>
          Powered by Geoom · geoom.site
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
