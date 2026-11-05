// ============================================
// DAY 7 — COMPETITOR MOVED EMAIL
// Sent on day 7 with competitor comparison data
// Shows: your score vs top competitor in your city+trade
// Creates urgency: they are moving up, you are not yet
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

interface CompetitorData {
  name: string
  score: number
  scoreChange: number   // positive = they went up
  strengths: string[]   // e.g. ['Strong Citations', 'Fresh Content']
}

interface Day7CompetitorMovedProps {
  businessName: string
  ownerFirstName: string
  currentScore: number
  scoreChange: number           // your change since signup (usually 0 if no fixes done)
  trade: string
  city: string
  topCompetitor: CompetitorData
  fixesCompleted: number        // how many tasks user completed this week
  openFixes: number             // how many tasks still open
  dashboardUrl: string
}

function scoreColor(score: number): string {
  if (score >= 85) return '#00E676'
  if (score >= 70) return '#7CDB8A'
  if (score >= 50) return '#F4C542'
  if (score >= 30) return '#FF7A00'
  return '#FF2A2A'
}

export default function Day7CompetitorMoved({
  businessName = 'Riverside Plumbing',
  ownerFirstName = 'Mike',
  currentScore = 34,
  scoreChange = 0,
  trade = 'Plumber',
  city = 'Phoenix, AZ',
  topCompetitor = {
    name: 'Valley Pro Plumbing',
    score: 61,
    scoreChange: 4,
    strengths: ['Strong Citations', 'Active Google Reviews', 'Schema Markup']
  },
  fixesCompleted = 0,
  openFixes = 6,
  dashboardUrl = 'https://geoom.site/dashboard',
}: Day7CompetitorMovedProps) {
  const myColor = scoreColor(currentScore)
  const theirColor = scoreColor(topCompetitor.score)
  const gap = topCompetitor.score - currentScore
  const competitorUp = topCompetitor.scoreChange > 0

  const changeLabel = scoreChange > 0
    ? `▲ +${scoreChange} pts this week`
    : scoreChange < 0
    ? `▼ ${scoreChange} pts this week`
    : 'No change this week'

  const changeColor = scoreChange > 0 ? '#00E676' : scoreChange < 0 ? '#FF2A2A' : '#8A9BB0'

  return (
    <Html lang="en">
      <Head />
      <Preview>
        {topCompetitor.name} is {String(gap)} points ahead of you on AI — here&apos;s how to close the gap
      </Preview>
      <Body style={{ margin: 0, padding: 0, background: '#07090C', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
        <Container style={{ maxWidth: '560px', margin: '0 auto', padding: '32px 16px' }}>

          {/* Logo */}
          <Text style={{ margin: '0 0 32px', color: '#8A9BB0', fontSize: '11px', letterSpacing: '4px', textTransform: 'uppercase' }}>
            GEOOM
          </Text>

          <Text style={{ margin: '0 0 4px', color: '#8A9BB0', fontSize: '13px' }}>
            {ownerFirstName},
          </Text>
          <Text style={{ margin: '0 0 8px', color: '#F0F4F8', fontSize: '20px', fontWeight: 700, lineHeight: '1.3' }}>
            Week 1 check-in for {trade} in {city}.
          </Text>
          <Text style={{ margin: '0 0 32px', color: '#8A9BB0', fontSize: '14px', lineHeight: '1.6' }}>
            Here is how {businessName} compares to the top AI-visible competitor in your area right now.
          </Text>

          {/* Head-to-head comparison */}
          <Section style={{ background: '#11151C', border: '1px solid #222A35', borderRadius: '8px', overflow: 'hidden', marginBottom: '16px' }}>
            <Row style={{ borderBottom: '1px solid #222A35' }}>
              <Column style={{ padding: '16px 20px', width: '50%', borderRight: '1px solid #222A35' }}>
                <Text style={{ margin: '0 0 4px', color: '#8A9BB0', fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase' }}>
                  YOU
                </Text>
                <Text style={{ margin: '0 0 2px', color: '#F0F4F8', fontSize: '13px', fontWeight: 600 }}>
                  {businessName}
                </Text>
              </Column>
              <Column style={{ padding: '16px 20px', width: '50%' }}>
                <Text style={{ margin: '0 0 4px', color: '#8A9BB0', fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase' }}>
                  TOP COMPETITOR
                </Text>
                <Text style={{ margin: '0 0 2px', color: '#F0F4F8', fontSize: '13px', fontWeight: 600 }}>
                  {topCompetitor.name}
                </Text>
              </Column>
            </Row>

            <Row>
              <Column style={{ padding: '24px 20px', textAlign: 'center', width: '50%', borderRight: '1px solid #222A35' }}>
                <Text style={{ margin: '0 0 2px', color: myColor, fontSize: '64px', fontWeight: 700, lineHeight: '1', fontFamily: 'monospace' }}>
                  {currentScore}
                </Text>
                <Text style={{ margin: '0', color: '#3A4759', fontSize: '14px' }}>/100</Text>
                <Text style={{ margin: '8px 0 0', color: changeColor, fontSize: '12px' }}>
                  {changeLabel}
                </Text>
              </Column>
              <Column style={{ padding: '24px 20px', textAlign: 'center', width: '50%' }}>
                <Text style={{ margin: '0 0 2px', color: theirColor, fontSize: '64px', fontWeight: 700, lineHeight: '1', fontFamily: 'monospace' }}>
                  {topCompetitor.score}
                </Text>
                <Text style={{ margin: '0', color: '#3A4759', fontSize: '14px' }}>/100</Text>
                {competitorUp && (
                  <Text style={{ margin: '8px 0 0', color: '#FF2A2A', fontSize: '12px' }}>
                    ▲ +{topCompetitor.scoreChange} pts this week
                  </Text>
                )}
              </Column>
            </Row>

            {/* Gap bar */}
            <Section style={{ background: '#07090C', padding: '16px 20px' }}>
              <Text style={{ margin: '0 0 8px', color: '#8A9BB0', fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase' }}>
                GAP TO CLOSE
              </Text>
              <div style={{ height: '6px', background: '#222A35', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${Math.min(100, (currentScore / topCompetitor.score) * 100)}%`, background: myColor, borderRadius: '3px' }} />
              </div>
              <Text style={{ margin: '6px 0 0', color: '#F0F4F8', fontSize: '13px' }}>
                {gap} points behind — {competitorUp ? 'and they are still moving' : 'closeable in 3–4 weeks'}
              </Text>
            </Section>
          </Section>

          {/* What they are doing that you are not */}
          {topCompetitor.strengths.length > 0 && (
            <Section style={{ background: '#11151C', border: '1px solid #222A35', borderRadius: '8px', padding: '20px 24px', marginBottom: '16px' }}>
              <Text style={{ margin: '0 0 12px', color: '#8A9BB0', fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 600 }}>
                WHAT THEY ARE DOING THAT YOU ARE NOT
              </Text>
              {topCompetitor.strengths.map((s) => (
                <Text key={s} style={{ margin: '0 0 8px', color: '#F0F4F8', fontSize: '14px' }}>
                  ✓ {s}
                </Text>
              ))}
            </Section>
          )}

          {/* Week 1 progress */}
          <Section style={{ background: '#11151C', border: '1px solid #222A35', borderRadius: '8px', padding: '20px 24px', marginBottom: '16px' }}>
            <Text style={{ margin: '0 0 12px', color: '#8A9BB0', fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 600 }}>
              YOUR WEEK 1 PROGRESS
            </Text>
            <Row>
              <Column>
                <Text style={{ margin: 0, color: '#00E676', fontSize: '28px', fontWeight: 700, fontFamily: 'monospace' }}>
                  {fixesCompleted}
                </Text>
                <Text style={{ margin: '2px 0 0', color: '#8A9BB0', fontSize: '12px' }}>
                  fixes completed
                </Text>
              </Column>
              <Column>
                <Text style={{ margin: 0, color: '#FF7A00', fontSize: '28px', fontWeight: 700, fontFamily: 'monospace' }}>
                  {openFixes}
                </Text>
                <Text style={{ margin: '2px 0 0', color: '#8A9BB0', fontSize: '12px' }}>
                  still open
                </Text>
              </Column>
            </Row>
            {fixesCompleted === 0 && (
              <Text style={{ margin: '16px 0 0', color: '#8A9BB0', fontSize: '13px', lineHeight: '1.6' }}>
                No fixes completed yet. That&apos;s okay — this is week 1. But while you wait, your competitor is moving.
              </Text>
            )}
          </Section>

          {/* CTA */}
          <Section style={{ background: 'rgba(255,122,0,0.06)', border: '1px solid #FF7A00', borderRadius: '8px', padding: '20px 24px', marginBottom: '24px', textAlign: 'center' }}>
            <Text style={{ margin: '0 0 8px', color: '#F0F4F8', fontSize: '16px', fontWeight: 700 }}>
              Start closing the gap today
            </Text>
            <Text style={{ margin: '0 0 16px', color: '#8A9BB0', fontSize: '13px', lineHeight: '1.6' }}>
              Your 12-week driver plan has {openFixes} ranked actions waiting. The highest-impact ones are at the top.
            </Text>
            <Link
              href={`${dashboardUrl}/driver`}
              style={{ display: 'inline-block', background: '#FF7A00', color: '#07090C', padding: '13px 28px', textDecoration: 'none', fontSize: '14px', fontWeight: 700, borderRadius: '4px' }}
            >
              Open My Action Plan →
            </Link>
          </Section>

          <Hr style={{ borderColor: '#222A35', margin: '8px 0 24px' }} />

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
