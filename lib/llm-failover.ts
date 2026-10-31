// ============================================
// LLM FAILOVER — FREE AI ROTATION ENGINE
// Stack: Gemini Flash → Grok x.ai → OpenRouter Llama free → OpenRouter Mistral free → canned fallback
// Zero cost. Product never breaks.
// All callers use generateWithFailover() — same interface as before
// ============================================

export interface FailoverOptions {
  prompt: string
  maxTokens?: number
  temperature?: number
  fallbackTemplate?: string
}

export interface FailoverResult {
  content: string
  provider: string
  cached: boolean
}

// ---- Gemini Flash (free tier: 1500 req/day) ----
async function tryGemini(prompt: string, maxTokens: number, temperature: number): Promise<string | null> {
  const key = process.env.GEMINI_API_KEY
  if (!key) return null
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: maxTokens, temperature }
        }),
        signal: AbortSignal.timeout(12000)
      }
    )
    if (!res.ok) return null
    const data = await res.json() as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>
    }
    return data.candidates?.[0]?.content?.parts?.[0]?.text || null
  } catch {
    return null
  }
}

// ---- Grok x.ai (raw fetch, free tier) ----
async function tryGrok(prompt: string, maxTokens: number, temperature: number): Promise<string | null> {
  const key = process.env.GROK_API_KEY
  if (!key) return null
  try {
    const res = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`
      },
      body: JSON.stringify({
        model: 'grok-3-mini',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: maxTokens,
        temperature
      }),
      signal: AbortSignal.timeout(15000)
    })
    if (!res.ok) return null
    const data = await res.json() as {
      choices?: Array<{ message?: { content?: string } }>
    }
    return data.choices?.[0]?.message?.content || null
  } catch {
    return null
  }
}

// ---- OpenRouter Llama 3 8B free ----
async function tryOpenRouterLlama(prompt: string, maxTokens: number, temperature: number): Promise<string | null> {
  const key = process.env.OPENROUTER_API_KEY
  if (!key) return null
  try {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'https://geoom.site',
        'X-Title': 'Geoom'
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-3-8b-instruct:free',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: maxTokens,
        temperature
      }),
      signal: AbortSignal.timeout(20000)
    })
    if (!res.ok) return null
    const data = await res.json() as {
      choices?: Array<{ message?: { content?: string } }>
    }
    return data.choices?.[0]?.message?.content || null
  } catch {
    return null
  }
}

// ---- OpenRouter Mistral 7B free ----
async function tryOpenRouterMistral(prompt: string, maxTokens: number, temperature: number): Promise<string | null> {
  const key = process.env.OPENROUTER_API_KEY
  if (!key) return null
  try {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'https://geoom.site',
        'X-Title': 'Geoom'
      },
      body: JSON.stringify({
        model: 'mistralai/mistral-7b-instruct:free',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: maxTokens,
        temperature
      }),
      signal: AbortSignal.timeout(20000)
    })
    if (!res.ok) return null
    const data = await res.json() as {
      choices?: Array<{ message?: { content?: string } }>
    }
    return data.choices?.[0]?.message?.content || null
  } catch {
    return null
  }
}

// ---- Main failover function (same interface as before — no callers break) ----
export async function generateWithFailover(options: FailoverOptions): Promise<FailoverResult> {
  const {
    prompt,
    maxTokens = 800,
    temperature = 0.7,
    fallbackTemplate = ''
  } = options

  // 1. Gemini Flash
  const gemini = await tryGemini(prompt, maxTokens, temperature)
  if (gemini) return { content: gemini, provider: 'gemini-flash', cached: false }

  // 2. Grok x.ai
  const grok = await tryGrok(prompt, maxTokens, temperature)
  if (grok) return { content: grok, provider: 'grok', cached: false }

  // 3. OpenRouter Llama free
  const llama = await tryOpenRouterLlama(prompt, maxTokens, temperature)
  if (llama) return { content: llama, provider: 'openrouter-llama', cached: false }

  // 4. OpenRouter Mistral free
  const mistral = await tryOpenRouterMistral(prompt, maxTokens, temperature)
  if (mistral) return { content: mistral, provider: 'openrouter-mistral', cached: false }

  // 5. Canned fallback — product never breaks
  console.warn('[llm-failover] All providers failed — using canned fallback')
  return { content: fallbackTemplate, provider: 'fallback', cached: false }
}

// ---- Safe JSON parse helper (used across codebase) ----
export function safeParseJSON<T>(text: string, fallback: T): T {
  try {
    const match = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/)
    if (!match) return fallback
    return JSON.parse(match[0]) as T
  } catch {
    return fallback
  }
}
