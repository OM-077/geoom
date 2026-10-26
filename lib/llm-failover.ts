import Groq from 'groq-sdk'
import { GoogleGenerativeAI } from '@google/generative-ai'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY! })
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

// ============================================
// MULTI-LLM FAILOVER ENGINE
// Groq (primary, fastest, free 14,400/day)
// → Gemini Flash (backup, free 1,500/day)
// → OpenRouter (tertiary, pay per use)
// Never fails to return content
// Contractor always gets their solution
// ============================================

export async function generateWithFailover(params: {
  prompt: string
  maxTokens?: number
  temperature?: number
  fallbackTemplate: string
  systemPrompt?: string
}): Promise<{ content: string; engine: string }> {

  // PRIMARY — Groq llama-3.3-70b (fastest)
  try {
    const messages: Array<{ role: 'system' | 'user'; content: string }> = []
    if (params.systemPrompt) {
      messages.push({ role: 'system', content: params.systemPrompt })
    }
    messages.push({ role: 'user', content: params.prompt })

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages,
      temperature: params.temperature || 0.7,
      max_tokens: params.maxTokens || 1500
    })

    const content = completion.choices[0].message.content || ''
    if (content.length > 50) return { content, engine: 'groq' }
    throw new Error('Groq returned insufficient content')
  } catch (err) {
    console.warn('Groq failed, trying Gemini:', err)
  }

  // SECONDARY — Gemini Flash
  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      generationConfig: {
        temperature: params.temperature || 0.7,
        maxOutputTokens: params.maxTokens || 1500
      }
    })

    const prompt = params.systemPrompt
      ? `${params.systemPrompt}\n\n${params.prompt}`
      : params.prompt

    const result = await model.generateContent(prompt)
    const content = result.response.text()
    if (content.length > 50) return { content, engine: 'gemini' }
    throw new Error('Gemini returned insufficient content')
  } catch (err) {
    console.warn('Gemini failed, trying OpenRouter:', err)
  }

  // TERTIARY — OpenRouter (DeepSeek, reliable fallback)
  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://geoom.site',
        'X-Title': 'GeoOm'
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-chat',
        messages: [{ role: 'user', content: params.prompt }],
        max_tokens: params.maxTokens || 1500,
        temperature: params.temperature || 0.7
      })
    })

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content || ''
    if (content.length > 50) return { content, engine: 'openrouter' }
  } catch (err) {
    console.warn('OpenRouter failed, using template:', err)
  }

  // FINAL FALLBACK — Pre-built template
  // Contractor always gets something useful
  return { content: params.fallbackTemplate, engine: 'template' }
}

export function safeParseJSON<T>(raw: string, fallback: T): T {
  try {
    const clean = raw
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim()
    const match = clean.match(/\{[\s\S]*\}|\[[\s\S]*\]/)
    return match ? JSON.parse(match[0]) as T : JSON.parse(clean) as T
  } catch {
    return fallback
  }
}
