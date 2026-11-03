'use client'
import { useState } from 'react'

const platforms = [
  { id:'foursquare', name:'Foursquare',            ai:'ChatGPT',                   status:'unclaimed'   as const, score:0,  isChatGPT:true },
  { id:'gbp',        name:'Google Business Profile',ai:'Google AI + Gemini',        status:'active'      as const, score:61, isChatGPT:false },
  { id:'yelp',       name:'Yelp',                   ai:'ChatGPT, Siri, Perplexity', status:'active'      as const, score:58, isChatGPT:false },
  { id:'apple',      name:'Apple Business Connect', ai:'Siri',                      status:'incomplete'  as const, score:34, isChatGPT:false },
  { id:'bing',       name:'Bing Places',            ai:'Microsoft Copilot',         status:'unlisted'    as const, score:0,  isChatGPT:false },
  { id:'bbb',        name:'BBB',                    ai:'Perplexity',                status:'active'      as const, score:72, isChatGPT:false },
  { id:'angi',       name:'Angi',                   ai:'Perplexity',                status:'incomplete'  as const, score:41, isChatGPT:false },
  { id:'homeguide',  name:'HomeGuide',              ai:'Perplexity',                status:'unlisted'    as const, score:0,  isChatGPT:false },
]

const statusIcon  = (s: string) => s==='active'?'✅':s==='incomplete'?'⚠️':'❌'
const statusColor = (s: string) => s==='active'?'var(--score-green)':s==='incomplete'?'var(--score-amber)':'var(--score-red)'
const scoreColor  = (n: number) => n>=70?'var(--score-green)':n>=40?'var(--score-amber)':'var(--score-red)'

const fixes: Record<string, string> = {
  foursquare: 'Go to foursquare.com/add-place and claim your listing. Search for your business name first — it may already exist with wrong information.',
  gbp:        'Log in to business.google.com and fill in: business description, service area, and complete your hours.',
  yelp:       'Go to biz.yelp.com and update your business category to the most specific option. Add at least 5 photos.',
  apple:      'Go to businessconnect.apple.com. Your listing is missing business photos, service categories, and website URL.',
  bing:       'Go to bingplaces.com and create your listing. You can import directly from Google Business Profile — takes 2 minutes.',
  bbb:        'Your BBB listing looks good. Respond to any open complaints and add your license number.',
  angi:       'Log in to your Angi Pro account. Add a business description, license number, and service area ZIP codes.',
  homeguide:  'Go to homeguide.com/pro and create a free contractor profile.',
}

// Radar SVG
function RadarChart() {
  const scores = [58,0,61,41,34,72,0,0]
  const labels = ['Yelp','Foursquare','Google','Angi','Apple','BBB','Bing','HomeGuide']
  const n = labels.length, cx=120, cy=120, r=90
  function pt(i: number, val: number) {
    const a = (i/n)*2*Math.PI - Math.PI/2
    const len = (val/100)*r
    return { x: cx+Math.cos(a)*len, y: cy+Math.sin(a)*len }
  }
  function ptFull(i: number) { return pt(i, 100) }
  const fillPts = scores.map((v,i) => { const p=pt(i,v); return `${p.x},${p.y}` }).join(' ')
  const bgPts   = labels.map((_,i) => { const p=ptFull(i); return `${p.x},${p.y}` }).join(' ')

  return (
    <svg width="240" height="240" viewBox="0 0 240 240" aria-label="Platform authority radar chart" role="img">
      {[25,50,75,100].map(pct => {
        const pts = labels.map((_,i)=>{ const a=(i/n)*2*Math.PI-Math.PI/2; const l=(pct/100)*r; return `${cx+Math.cos(a)*l},${cy+Math.sin(a)*l}` }).join(' ')
        return <polygon key={pct} points={pts} fill="none" stroke="var(--border-subtle)" strokeWidth="1"/>
      })}
      {labels.map((_,i)=>{ const p=ptFull(i); return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="var(--border-subtle)" strokeWidth="1"/> })}
      <polygon points={fillPts} fill="oklch(84% 0.19 80.46 / 0.25)" stroke="var(--kinpaku-gold)" strokeWidth="1.5"/>
      {labels.map((lbl,i)=>{
        const p=ptFull(i); const lx=cx+(p.x-cx)*1.2; const ly=cy+(p.y-cy)*1.2
        const anchor=lx<cx-5?'end':lx>cx+5?'start':'middle'
        return <text key={i} x={lx} y={ly} textAnchor={anchor} dominantBaseline="middle" fontSize="10" fill="var(--text-muted)" fontFamily="Inter,sans-serif">{lbl}</text>
      })}
    </svg>
  )
}

export default function PlatformsTab() {
  const [expanded, setExpanded] = useState<string|null>(null)
  const composite = Math.round(platforms.reduce((a,p)=>a+p.score,0)/platforms.length)

  return (
    <div>
      <h2 className="font-barlow font-semibold text-[32px] mb-1.5" style={{ color:'var(--champagne)' }}>Platform Authority Score</h2>
      <div className="font-barlow font-bold leading-none mb-1.5" style={{ fontSize:'64px', color:'var(--kinpaku-gold)' }}>{composite}</div>
      <p className="text-sm mb-8" style={{ color:'var(--text-muted)' }}>60% of AI citations go to directories, not your website.</p>

      <div className="flex justify-center mb-8"><RadarChart /></div>

      <div className="rounded-lg overflow-hidden" style={{ border:'1px solid var(--border-subtle)' }}>
        <div className="grid px-5 py-2.5 text-[11px] font-medium uppercase tracking-[1px]" style={{ background:'var(--lacquer-deep)', color:'var(--text-dim)', gridTemplateColumns:'180px 1fr 120px 60px 90px', gap:'12px' }}>
          <span>Platform</span><span>AI System</span><span>Status</span><span>Score</span><span></span>
        </div>
        {platforms.map((p,i) => (
          <div key={p.id}>
            <div className="grid items-center px-5 py-3.5 min-h-[64px]"
              style={{ gridTemplateColumns:'180px 1fr 120px 60px 90px', gap:'12px', borderBottom: expanded===p.id?'none':'1px solid var(--border-subtle)',
                borderLeft: p.isChatGPT?'3px solid var(--kinpaku-pale)':'3px solid transparent',
                background: p.isChatGPT?'oklch(84% 0.19 80.46 / 0.04)':'transparent' }}>
              <div>
                {p.isChatGPT && <span className="block text-[10px] font-semibold uppercase tracking-[1px] mb-0.5" style={{ color:'var(--kinpaku-pale)' }}>ChatGPT uses this</span>}
                <span className="text-sm font-semibold" style={{ color:'var(--champagne)' }}>{p.name}</span>
              </div>
              <span className="text-xs" style={{ color:'var(--text-dim)' }}>{p.ai}</span>
              <span className="text-xs font-medium" style={{ color:statusColor(p.status) }}>{statusIcon(p.status)} {p.status.charAt(0).toUpperCase()+p.status.slice(1)}</span>
              <span className="font-barlow font-bold text-xl" style={{ color:scoreColor(p.score) }}>{p.score}</span>
              <button onClick={()=>setExpanded(expanded===p.id?null:p.id)}
                className="text-[13px] font-medium px-3 py-1.5 rounded transition-colors"
                style={{ background:'transparent', border:'1px solid var(--border-strong)', color:expanded===p.id?'var(--kinpaku-gold)':'var(--champagne)', cursor:'pointer', fontFamily:'Inter,sans-serif' }}>
                {expanded===p.id?'Close':p.status==='unclaimed'?'Claim now':'Fix'}
              </button>
            </div>
            {expanded===p.id && (
              <div className="px-5 pb-4 text-sm leading-relaxed" style={{ color:'var(--text-muted)', borderBottom:'1px solid var(--border-subtle)', background:'var(--lacquer-deep)' }}>
                {fixes[p.id]}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
