import { Metadata } from 'next';

interface Props {
  params: { city: string; trade: string };
  searchParams: { business?: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const city = params.city.replace(/-/g, ' ');
  const trade = params.trade.replace(/-/g, ' ');
  return {
    title: `AI Visibility Score for ${trade} contractors in ${city} | Geoom`,
    description: `See how visible your ${trade} business is to ChatGPT, Google AI, and Siri in ${city}.`,
  };
}

export default async function PreviewScanPage({ params, searchParams }: Props) {
  const city = params.city.replace(/-/g, ' ');
  const trade = params.trade.replace(/-/g, ' ');

  // This is a server component — the scan preview is shown client-side
  // The 3 locked cards are rendered with placeholder data (no real scan on this page)
  // Real scan only happens after signup

  return (
    <main style={{
      minHeight: '100vh',
      background: 'oklch(4% 0.004 95)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      fontFamily: 'sans-serif',
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        <div style={{
          fontSize: '13px',
          color: 'oklch(84% 0.19 80.46)',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          marginBottom: '16px',
        }}>
          Geoom · AI Visibility for Contractors
        </div>
        <h1 style={{
          fontSize: '32px',
          fontWeight: '700',
          color: 'oklch(88% 0 0)',
          margin: '0 0 16px',
          maxWidth: '560px',
        }}>
          We checked {trade} contractors in {city}
        </h1>
        <p style={{
          fontSize: '18px',
          color: 'oklch(72% 0 0)',
          margin: 0,
          maxWidth: '480px',
        }}>
          Your competitors are showing up on ChatGPT and Google AI. Are you?
        </p>
      </div>

      {/* 3 Locked Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '16px',
        maxWidth: '800px',
        width: '100%',
        marginBottom: '48px',
      }}>
        {[
          { icon: '🔍', label: 'Schema Markup', issue: 'Critical gap found' },
          { icon: '⭐', label: 'Review Signals', issue: '2 issues detected' },
          { icon: '📍', label: 'Platform Listings', issue: '3 platforms missing' },
        ].map((card) => (
          <div key={card.label} style={{
            background: 'oklch(11% 0.006 95)',
            border: '1px solid oklch(18% 0.006 95)',
            borderRadius: '12px',
            padding: '24px',
            textAlign: 'center',
            filter: 'blur(0)',
            position: 'relative',
            overflow: 'hidden',
          }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>{card.icon}</div>
            <div style={{ fontSize: '14px', color: 'oklch(72% 0 0)', marginBottom: '8px' }}>{card.label}</div>
            <div style={{
              fontSize: '13px',
              color: 'oklch(62% 0.21 25)',
              fontWeight: '600',
              filter: 'blur(4px)',
              userSelect: 'none',
            }}>
              {card.issue}
            </div>
            <div style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <div style={{ fontSize: '20px' }}>🔒</div>
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div style={{
        background: 'oklch(11% 0.006 95)',
        border: '1px solid oklch(24% 0.008 95)',
        borderRadius: '16px',
        padding: '40px',
        textAlign: 'center',
        maxWidth: '480px',
        width: '100%',
      }}>
        <p style={{
          fontSize: '20px',
          fontWeight: '600',
          color: 'oklch(88% 0 0)',
          margin: '0 0 12px',
        }}>
          See your full AI score and fix everything
        </p>
        <p style={{
          fontSize: '15px',
          color: 'oklch(72% 0 0)',
          margin: '0 0 28px',
        }}>
          Start at $79/month. Takes 4 minutes to set up. Cancel anytime.
        </p>
        <a
          href={`/onboarding?source=preview&city=${params.city}&trade=${params.trade}`}
          style={{
            display: 'block',
            background: 'oklch(84% 0.19 80.46)',
            color: 'oklch(7% 0.006 95)',
            padding: '16px 32px',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '700',
            textDecoration: 'none',
            marginBottom: '16px',
          }}
        >
          See my score and fix it — $79/mo
        </a>
        <p style={{ fontSize: '13px', color: 'oklch(52% 0 0)', margin: 0 }}>
          No free trial. Real fixes only.
        </p>
      </div>
    </main>
  );
}
