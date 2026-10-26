import crypto from 'crypto'

export function scoreToMarketShare(score: number): number {
  return Math.min(Math.round(score * 0.85), 85)
}

export function formatDate(d: string): string {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function formatDateFull(d: string): string {
  return new Date(d).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  })
}

export function formatTime(d: string): string {
  return new Date(d).toLocaleTimeString('en-US', {
    hour: 'numeric', minute: '2-digit', hour12: true
  })
}

export function buildCacheKey(params: {
  businessName: string
  trade: string
  city: string
  state: string
}): string {
  const raw = `${params.businessName}-${params.trade}-${params.city}-${params.state}`
    .toLowerCase().replace(/\s+/g, '-')
  return crypto.createHash('md5').update(raw).digest('hex')
}

export function getCompetitorName(trade: string): string {
  const names: Record<string, string> = {
    hvac: 'Apex Heating LLC',
    plumbing: 'City Plumbing Co',
    electrical: 'PowerGrid Electric',
    roofing: 'Peak Roofing Inc',
    lawn: 'GreenEdge Landscaping',
    pest: 'Shield Pest Control',
    cleaning: 'Pristine Clean Co'
  }
  return names[trade.toLowerCase()] || 'Local Competitor'
}

export function getTradeLabel(trade: string): string {
  const labels: Record<string, string> = {
    hvac: 'HVAC', plumbing: 'Plumbing', electrical: 'Electrical',
    roofing: 'Roofing', lawn: 'Lawn Care', pest: 'Pest Control',
    cleaning: 'Cleaning'
  }
  return labels[trade.toLowerCase()] || trade
}

export function getTradeServices(trade: string): string[] {
  const services: Record<string, string[]> = {
    hvac: ['AC Repair','Furnace Repair','Heat Pump Install','AC Tune-Up',
           'Duct Cleaning','HVAC Install','Emergency AC','Thermostat Install'],
    plumbing: ['Pipe Repair','Water Heater Install','Drain Cleaning',
               'Leak Fix','Toilet Repair','Emergency Plumbing','Sewer Line'],
    electrical: ['Panel Upgrade','Outlet Install','Wiring Repair',
                 'EV Charger Install','Generator Install','Emergency Electric'],
    roofing: ['Roof Repair','Roof Replace','Gutter Install',
              'Leak Repair','Shingle Replace','Emergency Roof'],
    lawn: ['Lawn Mowing','Landscape Design','Irrigation Install',
           'Tree Trimming','Fertilization','Weed Control','Sod Install'],
    pest: ['General Pest Control','Termite Treatment','Rodent Control',
           'Bed Bug Treatment','Mosquito Control','Ant Control'],
    cleaning: ['Deep Clean','Regular Cleaning','Move-In Clean',
               'Post-Construction Clean','Carpet Clean','Window Cleaning']
  }
  return services[trade.toLowerCase()] || ['General Service','Repair','Installation']
}

export function getPriceRange(trade: string): string {
  const prices: Record<string, string> = {
    hvac: '$150–$600 depending on the repair',
    plumbing: '$100–$500 depending on the issue',
    electrical: '$100–$400 depending on the job',
    roofing: '$300–$1,500 depending on damage extent',
    lawn: '$50–$200 per visit',
    pest: '$100–$400 per treatment',
    cleaning: '$80–$250 per clean'
  }
  return prices[trade.toLowerCase()] || '$100–$500 depending on the job'
}

export function getSeasonalSuggestion(trade: string): {
  suggestion: string
  jobType: string
} {
  const month = new Date().getMonth()
  const season = month >= 2 && month <= 4 ? 'spring'
    : month >= 5 && month <= 7 ? 'summer'
    : month >= 8 && month <= 10 ? 'fall' : 'winter'

  const map: Record<string, Record<string, { suggestion: string; jobType: string }>> = {
    hvac: {
      winter: { suggestion: 'Furnace tune-up pages rank high in AI right now — publish before the cold hits', jobType: 'Furnace Repair' },
      spring: { suggestion: 'AC tune-up season — homeowners are asking AI for recommendations right now', jobType: 'AC Tune-Up' },
      summer: { suggestion: 'Emergency AC repair is peak AI search volume — publish more pages now', jobType: 'Emergency AC' },
      fall: { suggestion: 'Heat pump install queries spike in fall — get your pages live first', jobType: 'Heat Pump Install' }
    },
    plumbing: {
      winter: { suggestion: 'Frozen pipe repair queries explode in winter — AI is looking for local experts', jobType: 'Pipe Repair' },
      spring: { suggestion: 'Water heater installs peak in spring — homeowners ask AI before calling', jobType: 'Water Heater Install' },
      summer: { suggestion: 'Drain cleaning and outdoor plumbing peaks in summer', jobType: 'Drain Cleaning' },
      fall: { suggestion: 'Emergency plumbing prep pages rank well heading into winter', jobType: 'Emergency Plumbing' }
    }
  }

  const tradeSuggestion = map[trade.toLowerCase()]?.[season]
  return tradeSuggestion || {
    suggestion: `Publish more ${getTradeLabel(trade)} service pages for your city to increase AI citations`,
    jobType: getTradeServices(trade)[0]
  }
}

export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function generateRandomScore(): number {
  return Math.floor(Math.random() * 20) + 18
}

export function truncate(text: string, max: number): string {
  return text.length <= max ? text : text.slice(0, max - 3) + '...'
}
