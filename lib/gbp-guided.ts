// ============================================
// GBP GUIDED FIX
// Used when GBP OAuth not yet approved
// Deep links + exact instructions per platform
// Makes manual fix take 30 seconds not 30 minutes
// Same score result as auto-fix
// ============================================

export interface GuidedFixPlatform {
  key: string
  label: string
  points: number
  editUrl: string
  claimUrl: string
  steps: string[]
  impact: string
  yelpNote?: string
  gbpNote?: string
}

export const GUIDED_PLATFORMS: GuidedFixPlatform[] = [
  {
    key: 'google',
    label: 'Google Business Profile',
    points: 15,
    editUrl: 'https://business.google.com/dashboard',
    claimUrl: 'https://business.google.com/create',
    impact: 'ChatGPT, Gemini, and all AI engines verify GBP data first. This is your most important fix.',
    gbpNote: 'GeoOm OAuth auto-fix is pending Google approval. This guided fix gives identical results in 30 seconds.',
    steps: [
      'Copy your business name, address, and phone using the COPY buttons above',
      'Click JUMP TO GBP PORTAL — it opens your listing directly',
      'Click Edit Profile and paste your verified data',
      'Click Save — your fix is live within minutes'
    ]
  },
  {
    key: 'foursquare',
    label: 'Foursquare',
    points: 12,
    editUrl: 'https://business.foursquare.com',
    claimUrl: 'https://business.foursquare.com/claim',
    impact: 'ChatGPT uses Foursquare data for local business recommendations. This is the single highest-impact fix after GBP.',
    steps: [
      'Copy your business name, address, and phone using the COPY buttons above',
      'Click JUMP TO FOURSQUARE — create account if needed (free)',
      'Search for your business and claim it, or create a new listing',
      'Paste your verified data exactly as shown and save'
    ]
  },
  {
    key: 'yelp',
    label: 'Yelp',
    points: 10,
    editUrl: 'https://biz.yelp.com/login',
    claimUrl: 'https://biz.yelp.com/claim',
    impact: 'Perplexity uses Yelp as its primary local data source. Consistent Yelp data = more AI citations.',
    yelpNote: 'Yelp review responses must be posted manually — GeoOm copy button on Reviews page.',
    steps: [
      'Copy your business name, address, and phone using the COPY buttons above',
      'Click JUMP TO YELP — log into Yelp for Business or claim your listing',
      'Go to Business Information and update with your verified data',
      'Ensure your categories match your trade exactly'
    ]
  },
  {
    key: 'bing',
    label: 'Bing Places',
    points: 8,
    editUrl: 'https://www.bingplaces.com',
    claimUrl: 'https://www.bingplaces.com',
    impact: 'Microsoft Copilot reads Bing Places directly. Essential for Windows and Edge users.',
    steps: [
      'Copy your business name, address, and phone using the COPY buttons above',
      'Click JUMP TO BING PLACES — sign in with Microsoft account',
      'Import from Google Business Profile (fastest) or create new listing',
      'Verify via phone call or postcard — takes 1-3 days'
    ]
  },
  {
    key: 'apple',
    label: 'Apple Business Connect',
    points: 8,
    editUrl: 'https://businessconnect.apple.com',
    claimUrl: 'https://businessconnect.apple.com/claim',
    impact: 'Siri, Apple Maps, and iOS Spotlight recommendations come from Apple Business Connect.',
    steps: [
      'Copy your business name, address, and phone using the COPY buttons above',
      'Click JUMP TO APPLE BUSINESS CONNECT — sign in with Apple ID',
      'Find your business and claim it, or create new',
      'Upload a logo and complete your profile — verification takes 1-5 days'
    ]
  },
  {
    key: 'bbb',
    label: 'Better Business Bureau',
    points: 6,
    editUrl: 'https://www.bbb.org/business-login',
    claimUrl: 'https://www.bbb.org/request-a-business-profile',
    impact: 'AI engines use BBB as a trust verification signal — being listed confirms legitimacy.',
    steps: [
      'Copy your business name, address, and phone using the COPY buttons above',
      'Click JUMP TO BBB — search for your business',
      'Claim your listing or request a profile',
      'Ensure your NAP data matches exactly'
    ]
  },
  {
    key: 'angi',
    label: 'Angi',
    points: 5,
    editUrl: 'https://pro.angi.com',
    claimUrl: 'https://pro.angi.com/signup',
    impact: 'Angi is a top-cited source for home service AI recommendations. Critical for HVAC, plumbing, electrical.',
    steps: [
      'Copy your business name, address, and phone using the COPY buttons above',
      'Click JUMP TO ANGI PRO — create or claim your pro profile',
      'Complete all profile fields including your trade specialties',
      'Ensure phone and address match your GBP exactly'
    ]
  },
  {
    key: 'homeadvisor',
    label: 'HomeAdvisor',
    points: 5,
    editUrl: 'https://pro.homeadvisor.com',
    claimUrl: 'https://pro.homeadvisor.com/account/login',
    impact: 'HomeAdvisor data feeds multiple AI recommendation engines for home services.',
    steps: [
      'Copy your business name, address, and phone using the COPY buttons above',
      'Click JUMP TO HOMEADVISOR PRO — log in or create account',
      'Update your business profile with verified NAP data',
      'Complete your service categories to appear in more AI searches'
    ]
  }
]

export function getPlatformByKey(key: string): GuidedFixPlatform | undefined {
  return GUIDED_PLATFORMS.find(p => p.key === key)
}

export function getTotalPotentialPoints(): number {
  return GUIDED_PLATFORMS.reduce((sum, p) => sum + p.points, 0)
}
