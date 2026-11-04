export function scoreColor(score: number): string {
  if (score < 40) return 'var(--score-red)'
  if (score < 70) return 'var(--score-amber)'
  return 'var(--score-green)'
}

export function estimatedCalls(score: number): number {
  return Math.round((score * 2 * 4) * 0.04)
}

export function scoreLabel(score: number): string {
  if (score < 40) return 'Below average'
  if (score < 70) return 'Average'
  return 'Above average'
}

export function ctaText(score: number): string {
  if (score < 40) return 'Fix your biggest gap in 10 minutes →'
  if (score < 70) return 'Unlock your next 20 points →'
  return 'See your full breakdown →'
}

// Market share estimate from score
export function scoreToMarketShare(score: number): number {
  return Math.round((score / 100) * 30)
}

// Cache key builder
export function buildCacheKey(parts: Record<string, string>): string {
  return Object.entries(parts)
    .map(([k, v]) => `${k}:${v.toLowerCase().replace(/\s+/g, '-')}`)
    .join('|')
}

// Human-readable trade label
export function getTradeLabel(trade: string): string {
  const map: Record<string, string> = {
    hvac:        'HVAC',
    plumbing:    'Plumbing',
    electrical:  'Electrical',
    roofing:     'Roofing',
    landscaping: 'Landscaping',
    cleaning:    'Cleaning',
    painting:    'Painting',
    flooring:    'Flooring',
    pest_control:'Pest Control',
  }
  return map[trade.toLowerCase()] ?? trade.charAt(0).toUpperCase() + trade.slice(1)
}

// Price range string for a trade
export function getPriceRange(trade: string): string {
  const map: Record<string, string> = {
    hvac:        '$80–$150/hr',
    plumbing:    '$75–$130/hr',
    electrical:  '$80–$140/hr',
    roofing:     '$350–$600/sq',
    landscaping: '$50–$100/hr',
    cleaning:    '$25–$60/hr',
    painting:    '$2–$6/sq ft',
    flooring:    '$3–$12/sq ft',
    pest_control:'$150–$300/visit',
  }
  return map[trade.toLowerCase()] ?? 'Price varies'
}

// Seasonal content suggestion
export function getSeasonalSuggestion(trade: string): string {
  const month = new Date().getMonth()
  const season =
    month >= 2 && month <= 4 ? 'spring' :
    month >= 5 && month <= 7 ? 'summer' :
    month >= 8 && month <= 10 ? 'fall' : 'winter'

  const map: Record<string, Record<string, string>> = {
    hvac: {
      spring: 'AC tune-up specials before summer heat',
      summer: 'Emergency AC repair availability',
      fall:   'Furnace inspection before winter',
      winter: 'Heating system maintenance deals',
    },
    roofing: {
      spring: 'Post-winter damage inspections',
      summer: 'Storm damage repair availability',
      fall:   'Pre-winter weatherproofing',
      winter: 'Ice dam prevention and removal',
    },
  }
  return map[trade.toLowerCase()]?.[season] ?? `Seasonal ${getTradeLabel(trade)} services`
}
