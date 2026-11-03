'use client'

// ============================================
// UPGRADE GATE
// Blur overlay for Core vs Pro feature gating
// Usage:
//   <UpgradeGate feature="Competitor Spy" requiredTier="pro" userTier={business.pricing_tier}>
//     <CompetitorSpyPanel />
//   </UpgradeGate>
// When user tier < required tier: blurred + CTA
// When user tier >= required tier: renders normally
// ============================================

import React from 'react'

type PricingTier = 'core' | 'pro' | 'founding'

const TIER_RANK: Record<PricingTier, number> = {
  core: 1,
  pro: 2,
  founding: 3
}

const TIER_PRICE: Record<PricingTier, string> = {
  core: '$79/mo',
  pro: '$149/mo',
  founding: '$599 Early Bird'
}

const TIER_LABEL: Record<PricingTier, string> = {
  core: 'Core',
  pro: 'Pro',
  founding: 'Early Bird'
}

interface UpgradeGateProps {
  feature: string
  requiredTier: PricingTier
  userTier: PricingTier | null | undefined
  children: React.ReactNode
  description?: string
  upgradeUrl?: string
}

export function UpgradeGate({
  feature,
  requiredTier,
  userTier,
  children,
  description,
  upgradeUrl = '/billing/upgrade'
}: UpgradeGateProps) {
  const userRank = TIER_RANK[userTier || 'core'] || 1
  const requiredRank = TIER_RANK[requiredTier]

  // User has access — render normally
  if (userRank >= requiredRank) {
    return <>{children}</>
  }

  // User does not have access — blur + CTA
  const tierLabel = TIER_LABEL[requiredTier]
  const tierPrice = TIER_PRICE[requiredTier]

  return (
    <div style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden' }}>
      {/* Blurred content underneath */}
      <div
        style={{
          filter: 'blur(6px)',
          pointerEvents: 'none',
          userSelect: 'none',
          opacity: 0.4
        }}
        aria-hidden="true"
      >
        {children}
      </div>

      {/* Overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to bottom, rgba(7,9,12,0.1) 0%, rgba(7,9,12,0.85) 50%, rgba(7,9,12,0.95) 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '32px',
          textAlign: 'center',
          gap: '16px'
        }}
      >
        {/* Lock icon */}
        <div style={{
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          background: 'rgba(255, 122, 0, 0.12)',
          border: '1px solid rgba(255, 122, 0, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '20px'
        }}>
          🔒
        </div>

        {/* Feature name */}
        <div>
          <p style={{
            margin: 0,
            color: '#8A9BB0',
            fontSize: '10px',
            letterSpacing: '3px',
            textTransform: 'uppercase',
            fontWeight: 600
          }}>
            {tierLabel} FEATURE
          </p>
          <h3 style={{
            margin: '6px 0 0',
            color: '#F0F4F8',
            fontSize: '20px',
            fontWeight: 700
          }}>
            {feature}
          </h3>
        </div>

        {/* Description */}
        {description && (
          <p style={{
            margin: 0,
            color: '#8A9BB0',
            fontSize: '14px',
            lineHeight: 1.6,
            maxWidth: '360px'
          }}>
            {description}
          </p>
        )}

        {/* CTA */}
        <a
          href={upgradeUrl}
          style={{
            display: 'inline-block',
            background: '#FF7A00',
            color: '#07090C',
            padding: '12px 28px',
            textDecoration: 'none',
            fontSize: '14px',
            fontWeight: 700,
            borderRadius: '4px',
            marginTop: '4px'
          }}
        >
          Upgrade to {tierLabel} — {tierPrice}
        </a>

        <p style={{
          margin: 0,
          color: '#3A4759',
          fontSize: '12px'
        }}>
          Cancel anytime · No contracts
        </p>
      </div>
    </div>
  )
}

export default UpgradeGate
