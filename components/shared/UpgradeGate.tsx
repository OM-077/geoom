'use client'

// ============================================
// UPGRADE GATE
// One plan — $97/month or $499/year founding
// If subscribed (any tier) → full access
// If not subscribed → blur + CTA to /signup
// No feature-level gating between tiers
// ============================================

import React from 'react'

type PricingTier = 'pro' | 'founding' | null | undefined

interface UpgradeGateProps {
  feature: string
  requiredTier?: PricingTier  // kept for API compat but ignored — one plan = all features
  userTier: PricingTier
  children: React.ReactNode
  description?: string
  upgradeUrl?: string
}

export function UpgradeGate({
  feature,
  userTier,
  children,
  description,
  upgradeUrl = '/signup'
}: UpgradeGateProps) {
  const isSubscribed = userTier === 'pro' || userTier === 'founding'

  if (isSubscribed) return <>{children}</>

  return (
    <div style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden' }}>
      {/* Blurred content underneath */}
      <div style={{ filter: 'blur(6px)', pointerEvents: 'none', userSelect: 'none', opacity: 0.4 }} aria-hidden="true">
        {children}
      </div>

      {/* Overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(to bottom, rgba(7,9,12,0.1) 0%, rgba(7,9,12,0.85) 50%, rgba(7,9,12,0.95) 100%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: '32px', textAlign: 'center', gap: '16px'
      }}>
        <div style={{
          width: '48px', height: '48px', borderRadius: '50%',
          background: 'rgba(255,122,0,0.12)', border: '1px solid rgba(255,122,0,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px'
        }}>🔒</div>

        <div>
          <p style={{ margin: 0, color: '#8A9BB0', fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase', fontWeight: 600 }}>
            GEOOM FEATURE
          </p>
          <h3 style={{ margin: '6px 0 0', color: '#F0F4F8', fontSize: '20px', fontWeight: 700 }}>
            {feature}
          </h3>
        </div>

        {description && (
          <p style={{ margin: 0, color: '#8A9BB0', fontSize: '14px', lineHeight: 1.6, maxWidth: '360px' }}>
            {description}
          </p>
        )}

        <a href={upgradeUrl} style={{
          display: 'inline-block', background: '#FF7A00', color: '#07090C',
          padding: '12px 28px', textDecoration: 'none', fontSize: '14px',
          fontWeight: 700, borderRadius: '4px', marginTop: '4px'
        }}>
          Start for $97/month →
        </a>

        <p style={{ margin: 0, color: '#3A4759', fontSize: '12px' }}>
          Cancel anytime · No contracts · 35 founding spots at $499/year
        </p>
      </div>
    </div>
  )
}

export default UpgradeGate
