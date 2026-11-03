// ============================================
// AI ROUTER — SINGLE ENTRY POINT FOR ALL AI CALLS
// Replaces all direct Gemini/Claude/Groq imports
// Free rotation: Gemini Flash → Grok → Llama → Mistral → fallback
// Every feature uses this. Product never breaks.
// ============================================

export interface AICallOptions {
  maxTokens?: number
  temperature?: number
  fallback?: string
  context?: string   // optional system context
}

export interface AICallResult {
  content: string
  provider: string
  success: boolean
}

// ---- Provider: Gemini Flash ----
async function geminiFlash(
  prompt: string,
  maxTokens: number,
  temperature: number
): Promise<string | null> {
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
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text
    return text && text.length > 10 ? text : null
  } catch {
    return null
  }
}

// ---- Provider: Grok x.ai ----
async function grokXAI(
  prompt: string,
  maxTokens: number,
  temperature: number
): Promise<string | null> {
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
    const text = data.choices?.[0]?.message?.content
    return text && text.length > 10 ? text : null
  } catch {
    return null
  }
}

// ---- Provider: OpenRouter free (Llama or Mistral) ----
async function openRouterFree(
  prompt: string,
  maxTokens: number,
  temperature: number,
  model: 'llama' | 'mistral' = 'llama'
): Promise<string | null> {
  const key = process.env.OPENROUTER_API_KEY
  if (!key) return null
  const modelId = model === 'llama'
    ? 'meta-llama/llama-3-8b-instruct:free'
    : 'mistralai/mistral-7b-instruct:free'
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
        model: modelId,
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
    const text = data.choices?.[0]?.message?.content
    return text && text.length > 10 ? text : null
  } catch {
    return null
  }
}

// ---- MAIN: callAI — use this everywhere ----
export async function callAI(
  prompt: string,
  options: AICallOptions = {}
): Promise<string> {
  const {
    maxTokens = 800,
    temperature = 0.7,
    fallback = ''
  } = options

  // Try each provider in order
  const gemini = await geminiFlash(prompt, maxTokens, temperature)
  if (gemini) {
    console.log('[ai-router] gemini-flash')
    return gemini
  }

  const grok = await grokXAI(prompt, maxTokens, temperature)
  if (grok) {
    console.log('[ai-router] grok-xai')
    return grok
  }

  const llama = await openRouterFree(prompt, maxTokens, temperature, 'llama')
  if (llama) {
    console.log('[ai-router] openrouter-llama')
    return llama
  }

  const mistral = await openRouterFree(prompt, maxTokens, temperature, 'mistral')
  if (mistral) {
    console.log('[ai-router] openrouter-mistral')
    return mistral
  }

  // Canned fallback — product never breaks
  console.warn('[ai-router] all providers failed — using fallback')
  return fallback
}

// ---- callAIWithResult — when you need provider info ----
export async function callAIWithResult(
  prompt: string,
  options: AICallOptions = {}
): Promise<AICallResult> {
  const {
    maxTokens = 800,
    temperature = 0.7,
    fallback = ''
  } = options

  const gemini = await geminiFlash(prompt, maxTokens, temperature)
  if (gemini) return { content: gemini, provider: 'gemini-flash', success: true }

  const grok = await grokXAI(prompt, maxTokens, temperature)
  if (grok) return { content: grok, provider: 'grok-xai', success: true }

  const llama = await openRouterFree(prompt, maxTokens, temperature, 'llama')
  if (llama) return { content: llama, provider: 'openrouter-llama', success: true }

  const mistral = await openRouterFree(prompt, maxTokens, temperature, 'mistral')
  if (mistral) return { content: mistral, provider: 'openrouter-mistral', success: true }

  return { content: fallback, provider: 'fallback', success: false }
}

// ---- callAIJSON — for structured JSON responses ----
export async function callAIJSON<T>(
  prompt: string,
  fallback: T,
  options: AICallOptions = {}
): Promise<T> {
  const content = await callAI(
    prompt + '\n\nReturn ONLY valid JSON. No markdown, no explanation.',
    { ...options, fallback: JSON.stringify(fallback) }
  )

  try {
    const match = content.match(/\{[\s\S]*\}|\[[\s\S]*\]/)
    if (!match) return fallback
    return JSON.parse(match[0]) as T
  } catch {
    return fallback
  }
}
