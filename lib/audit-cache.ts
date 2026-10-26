import { supabaseAdmin } from './supabase'
import { buildCacheKey } from './utils'

// ============================================
// AUDIT CACHE — 7 DAY CACHE
// Saves Gemini API quota
// Serves instant results on repeat runs
// Force refresh available via dashboard
// ============================================

export async function getCachedAudit(params: {
  businessName: string
  trade: string
  city: string
  state: string
}): Promise<Record<string, unknown> | null> {
  try {
    const key = buildCacheKey(params)
    const { data } = await supabaseAdmin
      .from('audit_cache')
      .select('result, expires_at')
      .eq('cache_key', key)
      .single()

    if (!data) return null
    if (new Date(data.expires_at) < new Date()) return null
    return data.result as Record<string, unknown>
  } catch {
    return null
  }
}

export async function setCachedAudit(
  params: {
    businessName: string
    trade: string
    city: string
    state: string
  },
  result: Record<string, unknown>
): Promise<void> {
  try {
    const key = buildCacheKey(params)
    const expires = new Date()
    expires.setDate(expires.getDate() + 7)

    await supabaseAdmin
      .from('audit_cache')
      .upsert({
        cache_key: key,
        business_name: params.businessName,
        trade: params.trade,
        city: params.city,
        state: params.state,
        result,
        expires_at: expires.toISOString()
      }, { onConflict: 'cache_key' })
  } catch (err) {
    console.error('Cache set error:', err)
  }
}

export async function clearAuditCache(params: {
  businessName: string
  trade: string
  city: string
  state: string
}): Promise<void> {
  try {
    const key = buildCacheKey(params)
    await supabaseAdmin
      .from('audit_cache')
      .delete()
      .eq('cache_key', key)
  } catch (err) {
    console.error('Cache clear error:', err)
  }
}

export async function cleanExpiredCache(): Promise<void> {
  try {
    await supabaseAdmin
      .from('audit_cache')
      .delete()
      .lt('expires_at', new Date().toISOString())
  } catch (err) {
    console.error('Cache cleanup error:', err)
  }
}
