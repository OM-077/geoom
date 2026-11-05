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

export function scoreToMarketShare(score: number): number {
  return Math.round((score / 100) * 30)
}

export function buildCacheKey(parts: Record<string, string>): string {
  return Object.entries(parts)
    .map(([k, v]) => `${k}:${v.toLowerCase().replace(/\s+/g, '-')}`)
    .join('|')
}

export function getTradeLabel(trade: string): string {
  const map: Record<string, string> = {
    hvac:         'HVAC',
    plumbing:     'Plumbing',
    electrical:   'Electrical',
    roofing:      'Roofing',
    landscaping:  'Landscaping',
    cleaning:     'Cleaning',
    painting:     'Painting',
    flooring:     'Flooring',
    pest_control: 'Pest Control',
  }
  return map[trade.toLowerCase()] ?? trade.charAt(0).toUpperCase() + trade.slice(1)
}

export function getTradeServices(trade: string): string[] {
  const map: Record<string, string[]> = {
    HVAC:       ['Furnace installation', 'AC repair', 'Heat pump service', 'Emergency HVAC', 'Duct cleaning'],
    Plumbing:   ['Water heater replacement', 'Drain cleaning', 'Pipe repair', 'Emergency plumbing', 'Fixture installation'],
    Electrical: ['Panel upgrade', 'Wiring repair', 'Outlet installation', 'Emergency electrical', 'EV charger installation'],
    Roofing:    ['Roof replacement', 'Leak repair', 'Gutter installation', 'Storm damage repair', 'Roof inspection'],
  }
  return map[trade] ?? map['HVAC']
}

export function getPriceRange(trade: string): { low: number; high: number; unit: string } {
  const map: Record<string, { low: number; high: number; unit: string }> = {
    HVAC:       { low: 89,  high: 12000, unit: 'service' },
    Plumbing:   { low: 150, high: 3500,  unit: 'service' },
    Electrical: { low: 150, high: 5000,  unit: 'service' },
    Roofing:    { low: 500, high: 25000, unit: 'project' },
  }
  return map[trade] ?? map['HVAC']
}

export function getSeasonalSuggestion(trade: string, month: number): string {
  if (trade === 'HVAC') {
    if (month >= 10 || month <= 2) return 'furnace tune-up before winter'
    if (month >= 3 && month <= 5) return 'AC tune-up before summer'
    return 'emergency cooling service'
  }
  if (trade === 'Roofing') {
    if (month >= 3 && month <= 5) return 'post-winter roof inspection'
    if (month >= 6 && month <= 8) return 'storm damage repair'
    return 'gutter cleaning before winter'
  }
  return 'seasonal maintenance service'
}
