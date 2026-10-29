'use client';

interface UpgradeGateProps {
  featureName: string;
  description: string;
  children: React.ReactNode;
  userTier: 'core' | 'pro';
}

export function UpgradeGate({ featureName, description, children, userTier }: UpgradeGateProps) {
  if (userTier === 'pro') return <>{children}</>;

  return (
    <div style={{ position: 'relative' }}>
      <div style={{ filter: 'blur(4px)', pointerEvents: 'none', userSelect: 'none' }}>
        {children}
      </div>
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'oklch(7% 0.006 95 / 0.85)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        borderRadius: '8px',
      }}>
        <div style={{ fontSize: '24px' }}>🔒</div>
        <div style={{
          fontSize: '14px',
          fontWeight: '600',
          color: 'oklch(84% 0.19 80.46)',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
        }}>
          Pro feature
        </div>
        <div style={{
          fontSize: '14px',
          color: 'oklch(72% 0 0)',
          textAlign: 'center',
          maxWidth: '260px',
        }}>
          {description}
        </div>
        <a
          href="/settings?upgrade=true"
          style={{
            background: 'oklch(84% 0.19 80.46)',
            color: 'oklch(7% 0.006 95)',
            padding: '10px 20px',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '600',
            textDecoration: 'none',
          }}
        >
          Upgrade to Pro — $149/mo
        </a>
      </div>
    </div>
  );
}
