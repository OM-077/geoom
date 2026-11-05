// ============================================
// DAY 0 — SCORE REVEAL EMAIL
// Sent immediately after first audit completes
// Shows full score + breakdown + #1 fix to do right now
// Resend React Email component
// ============================================

import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Row,
  Column,
  Text,
  Link,
  Hr,
  Preview,
} from '@react-email/components'

interface Day0ScoreRevealProps {
  businessName: string
  ownerFirstName: string
  score: number
  buckets: {
    entity: number      // /15
    schema: number      // /15
    reviews: number     // /15
    citations: number   // /20
    content: number     // /20
    freshness: number   // /15
  }
  topFix: {
    bucket: string
    action: string
    estimatedGain: number
  }
  estimatedCalls: number
  dashboardUrl: string
}

// Score color (inline since email can't do CSS classes)
function scoreColor(score: number): string {
  if (score >= 85) return '#00E676'
  if (score >= 70) return '#7CDB8A'
  if (score >= 50) return '#F4C542'
  if (score >= 30) return '#FF7A00'
  return '#FF2A2A'
}

function scoreLabel(score: number): string {
  if (score >= 85) return 'PEAK'
  if (score >= 70) return 'GOOD'
  if (score >= 50) return 'AVERAGE'
  if (score >= 30) return 'LOW'
  return 'CRITICAL'
}

function bucketBar(value: number, max: number): string {
  const pct = Math.round((value / max) * 100)
  const color = pct >= 70 ? '#00E676' : pct >= 40 ? '#F4C542' : '#FF2A2A'
  return `<div style="height:4px;background:#222A35;border-radius:2px;overflow:hidden;"><div style="height:100%;width:${pct}%;background:${color};border-radius:2px;"></div></div>`
}

export default function Day0ScoreReveal({
  businessName = 'Riverside Plumbing',
  ownerFirstName = 'Mike',
  score = 34,
  buckets = { entity: 8, schema: 6, reviews: 9, citations: 7, content: 2, freshness: 2 },
  topFix = { bucket: 'Citations', action: 'Claim your Foursquare listing', estimatedGain: 12 },
  estimatedCalls = 10,
  dashboardUrl = 'https://geoom.site/dashboard',
}: Day0ScoreRevealProps) {
  const color = scoreColor(score)
  const label = scoreLabel(score)

  const bucketRows = [
    { name: 'Entity', value: buckets.entity, max: 15 },
    { name: 'Schema', value: buckets.schema, max: 15 },
    { name: 'Reviews', value: buckets.reviews, max: 15 },
    { name: 'Citations', value: buckets.citations, max: 20 },
    { name: 'Content', value: buckets.content, max: 20 },
    { name: 'Freshness', value: buckets.freshness, max: 15 },
  ]

  return (
    <Html lang="en">
      <Head />
      <Preview>
       {businessName}: your AI Visibility Score is {String(score)}/100 — here&apos;s your #1 fix
      </Preview>
      <Body style={{ margin: 0, padding: 0, background: '#07090C', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
        <Container style={{ maxWidth: '560px', margin: '0 auto', padding: '32px 16px' }}>

          {/* Logo */}
          <Text style={{ margin: '0 0 32px', color: '#8A9BB0', fontSize: '11px', letterSpacing: '4px', textTransform: 'uppercase' }}>
            GEOOM
          </Text>

          {/* Hero text */}
          <Text style={{ margin: '0 0 4px', color: '#8A9BB0', fontSize: '13px' }}>
            Hi {ownerFirstName},
          </Text>
          <Text style={{ margin: '0 0 32px', color: '#F0F4F8', fontSize: '18px', fontWeight: 700, lineHeight: '1.4' }}>
            Your AI Visibility Score for {businessName} is in.
          </Text>

          {/* Big score card */}
          <Section style={{ background: '#11151C', border: '1px solid #222A35', borderRadius: '8px', padding: '32px', textAlign: 'center', marginBottom: '16px' }}>
            <Text style={{ margin: '0 0 4px', color: '#8A9BB0', fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase' }}>
              GEOOM SCORE
            </Text>
            <Text style={{ margin: '0', color: color, fontSize: '96px', fontWeight: 700, lineHeight: '1', fontVariantNumeric: 'tabular-nums' }}>
              {score}
            </Text>
            <Text style={{ margin: '4px 0 12px', color: '#3A4759', fontSize: '18px' }}>
              / 100
            </Text>
            <Text style={{ margin: '0', display: 'inline-block', background: `${color}22`, border: `1px solid ${color}44`, color: color, fontSize: '11px', letterSpacing: '2px', padding: '4px 12px', borderRadius: '4px' }}>
              {label}
            </Text>
            <Text style={{ margin: '20px 0 0', color: '#8A9BB0', fontSize: '13px' }}>
              Estimated ~{estimatedCalls} AI-referred calls/mo at this score
            </Text>
          </Section>

          {/* What this means */}
          <Section style={{ background: '#11151C', border: '1px solid #222A35', borderRadius: '8px', padding: '20px 24px', marginBottom: '16px' }}>
            <Text style={{ margin: '0 0 12px', color: '#8A9BB0', fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 600 }}>
              WHAT THIS MEANS
            </Text>
            <Text style={{ margin: 0, color: '#F0F4F8', fontSize: '14px', lineHeight: '1.7' }}>
              When someone asks ChatGPT, Siri, or Google AI for a contractor in your area right now — they are probably not seeing you. A score below 50 means AI engines don&apos;t have enough confidence in your data to recommend you.
            </Text>
          </Section>

          {/* Bucket breakdown */}
          <Section style={{ background: '#11151C', border: '1px solid #222A35', borderRadius: '8px', padding: '20px 24px', marginBottom: '16px' }}>
            <Text style={{ margin: '0 0 16px', color: '#8A9BB0', fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 600 }}>
              SCORE BREAKDOWN
            </Text>
            {bucketRows.map((b) => (
              <Row key={b.name} style={{ marginBottom: '12px' }}>
                <Column style={{ width: '90px' }}>
                  <Text style={{ margin: 0, color: '#8A9BB0', fontSize: '12px' }}>{b.name}</Text>
                </Column>
                <Column>
                  <div dangerouslySetInnerHTML={{ __html: bucketBar(b.value, b.max) }} />
                </Column>
                <Column style={{ width: '48px', textAlign: 'right' }}>
                  <Text style={{ margin: 0, color: '#F0F4F8', fontSize: '12px', fontFamily: 'monospace' }}>
                    {b.value}/{b.max}
                  </Text>
                </Column>
              </Row>
            ))}
          </Section>

          {/* #1 fix */}
          <Section style={{ background: 'rgba(255,122,0,0.06)', border: '1px solid #FF7A00', borderRadius: '8px', padding: '20px 24px', marginBottom: '24px' }}>
            <Text style={{ margin: '0 0 4px', color: '#FF7A00', fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 700 }}>
              YOUR #1 FIX RIGHT NOW
            </Text>
            <Text style={{ margin: '0 0 8px', color: '#F0F4F8', fontSize: '16px', fontWeight: 700 }}>
              {topFix.action}
            </Text>
            <Text style={{ margin: '0 0 16px', color: '#8A9BB0', fontSize: '13px' }}>
              This is in your <strong style={{ color: '#F0F4F8' }}>{topFix.bucket}</strong> bucket. Fixing it could add up to +{topFix.estimatedGain} points to your score.
            </Text>
            <Link
              href={dashboardUrl}
              style={{ display: 'inline-block', background: '#FF7A00', color: '#07090C', padding: '12px 24px', textDecoration: 'none', fontSize: '14px', fontWeight: 700, borderRadius: '4px' }}
            >
              See My Full Action Plan →
            </Link>
          </Section>

          <Hr style={{ borderColor: '#222A35', margin: '24px 0' }} />

          <Text style={{ margin: '0 0 4px', color: '#3A4759', fontSize: '11px' }}>
            GeoOm · AI Visibility for Home Service Contractors
          </Text>
          <Text style={{ margin: 0, color: '#3A4759', fontSize: '11px' }}>
            <Link href={`${dashboardUrl}/settings/notifications`} style={{ color: '#3A4759' }}>
              Manage email preferences
            </Link>
          </Text>

        </Container>
      </Body>
    </Html>
  )
}
