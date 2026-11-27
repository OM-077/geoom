import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Lazy singletons — created on first use, not at import time.
// This prevents "supabaseUrl is required" errors during Next.js build
// when env vars aren't present in the build environment.

let _admin: SupabaseClient | null = null
let _public: SupabaseClient | null = null

export function getSupabaseAdmin(): SupabaseClient {
  if (!_admin) {
    _admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )
  }
  return _admin
}

export function getSupabasePublic(): SupabaseClient {
  if (!_public) {
    _public = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }
  return _public
}

// Backward-compat proxy objects — existing imports keep working
export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return (getSupabaseAdmin() as unknown as Record<string | symbol, unknown>)[prop]
  }
})

export const supabasePublic = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return (getSupabasePublic() as unknown as Record<string | symbol, unknown>)[prop]
  }
})
