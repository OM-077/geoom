
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
