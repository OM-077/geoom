// ============================================
// DAY 3 — FIRST ACTION EMAIL
// Sent 3 days after signup if citations score < 10
// Foursquare is highest-impact unclaimed fix for most
// Pushes ONE action: claim/fix Foursquare listing
// ============================================

import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Link,
  Hr,
  Preview,
} from '@react-email/components'

interface Day3FirstActionProps {
  businessName: string
  ownerFirstName: string
  currentScore: number
  citationsScore: number    // /20
  foursquareClaimed: boolean
  foursquareUrl: string     // direct claim/edit URL
  dashboardUrl: string
}

export default function Day3FirstAction({
  businessName = 'Riverside Plumbing',
  ownerFirstName = 'Mike',
  currentScore = 34,
  citationsScore = 7,
  foursquareClaimed = false,
  foursquareUrl = 'https://business.foursquare.com/claim',
  dashboardUrl = 'https://geoom.site/dashboard',
}: Day3FirstActionProps) {
  const citationsLabel = citationsScore >= 16 ? 'strong' : citationsScore >= 10 ? 'average' : 'weak'

  return (
    <Html lang="en">
      <Head />
      <Preview>
        One 3-minute fix that could add +8 points to your AI score
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
            Your Citations score is {citationsLabel}.
          </Text>
          <Text style={{ margin: '0 0 32px', color: '#8A9BB0', fontSize: '14px', lineHeight: '1.6' }}>
            Citations are worth 20 points — the biggest single bucket in your Geoom Score. Right now, {businessName} has {citationsScore}/20.
          </Text>

          {/* The one action */}
          <Section style={{ background: '#11151C', border: '1px solid #222A35', borderRadius: '8px', padding: '24px', marginBottom: '16px' }}>
            <Text style={{ margin: '0 0 4px', color: '#FF7A00', fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 700 }}>
              THE ONE THING TO DO TODAY
            </Text>
            <Text style={{ margin: '0 0 12px', color: '#F0F4F8', fontSize: '18px', fontWeight: 700 }}>
              {foursquareClaimed ? 'Update your Foursquare listing' : 'Claim your Foursquare listing'}
            </Text>
            <Text style={{ margin: '0 0 16px', color: '#8A9BB0', fontSize: '14px', lineHeight: '1.6' }}>
              ChatGPT uses Foursquare data for local business recommendations. It is one of the 8 platforms AI engines check to verify your business is real and trustworthy. {foursquareClaimed ? 'Your listing is claimed but your name, address, or phone may not match your other profiles.' : 'Your Foursquare listing is unclaimed right now, which tells ChatGPT your business data is unverified.'}
            </Text>

            {/* Impact bar */}
            <Section style={{ background: '#07090C', borderRadius: '4px', padding: '12px 16px', marginBottom: '20px' }}>
              <Text style={{ margin: '0 0 8px', color: '#8A9BB0', fontSize: '11px', letterSpacing: '1px' }}>
                ESTIMATED IMPACT
              </Text>
              <Text style={{ margin: 0, color: '#00E676', fontSize: '22px', fontWeight: 700, fontFamily: 'monospace' }}>
                +4 to +8 points
              </Text>
              <Text style={{ margin: '2px 0 0', color: '#8A9BB0', fontSize: '12px' }}>
                to your Geoom Score · takes ~3 minutes
              </Text>
            </Section>

            <Link
              href={foursquareUrl}
              style={{ display: 'inline-block', background: '#FF7A00', color: '#07090C', padding: '13px 28px', textDecoration: 'none', fontSize: '14px', fontWeight: 700, borderRadius: '4px' }}
            >
              {foursquareClaimed ? 'Update Foursquare Now →' : 'Claim Foursquare Listing →'}
            </Link>
          </Section>

          {/* Why it matters */}
          <Section style={{ background: '#11151C', border: '1px solid #222A35', borderRadius: '8px', padding: '20px 24px', marginBottom: '24px' }}>
            <Text style={{ margin: '0 0 12px', color: '#8A9BB0', fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 600 }}>
              WHY AI ENGINES CHECK 8 PLATFORMS
            </Text>
            <Text style={{ margin: '0 0 8px', color: '#F0F4F8', fontSize: '14px', lineHeight: '1.7' }}>
              AI engines don&apos;t just read your website. They cross-reference your name, address, and phone number across Google, Foursquare, Yelp, Bing, Apple Maps, BBB, Angi, and HomeAdvisor.
            </Text>
            <Text style={{ margin: 0, color: '#8A9BB0', fontSize: '14px', lineHeight: '1.7' }}>
              When they all match: confidence goes up, recommendation goes up. When they don&apos;t: they show a competitor instead.
            </Text>
          </Section>

          {/* Current score reminder */}
          <Section style={{ textAlign: 'center', padding: '8px 0 24px' }}>
            <Text style={{ margin: '0 0 4px', color: '#8A9BB0', fontSize: '12px' }}>
              Current score
            </Text>
            <Text style={{ margin: '0 0 4px', color: '#FF7A00', fontSize: '48px', fontWeight: 700, fontFamily: 'monospace', lineHeight: '1' }}>
              {currentScore}
            </Text>
            <Text style={{ margin: '0 0 16px', color: '#3A4759', fontSize: '14px' }}>
              / 100
            </Text>
            <Link
              href={dashboardUrl}
              style={{ color: '#FF7A00', fontSize: '13px', textDecoration: 'none' }}
            >
              See all open fixes in dashboard →
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
