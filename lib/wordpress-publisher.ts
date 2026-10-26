import { supabaseAdmin } from './supabase'

// ============================================
// WORDPRESS AUTO-PUBLISHER
// Publishes local SEO pages automatically
// Application Password auth (WP 5.6+)
// Each published page = new AI citation surface
// More pages = more AI search presence
// ============================================

export async function publishToWordPress(params: {
  wordpressUrl: string
  apiKey: string
  title: string
  slug: string
  content: string
  trade: string
  city: string
  contentPageId: string
  username?: string
}): Promise<{ success: boolean; wordpressUrl?: string; wordpressPostId?: number; error?: string }> {
  try {
    const baseUrl = params.wordpressUrl.replace(/\/$/, '')
    const apiUrl = `${baseUrl}/wp-json/wp/v2/posts`

    // Build credentials — support both formats
    // Format 1: "username:application_password" (base64)
    // Format 2: just the application password (we add username)
    const credentials = params.username
      ? Buffer.from(`${params.username}:${params.apiKey}`).toString('base64')
      : Buffer.from(`admin:${params.apiKey}`).toString('base64')

    const postData = {
      title: params.title,
      slug: params.slug,
      content: params.content,
      status: 'publish',
      categories: [],
      tags: [],
      meta: {
        _yoast_wpseo_title: params.title,
        _yoast_wpseo_metadesc: `Professional ${params.trade} services in ${params.city}. Licensed contractor, fast response, upfront pricing.`
      }
    }

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${credentials}`
      },
      body: JSON.stringify(postData)
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const errorMsg = (errorData as { message?: string }).message || `HTTP ${response.status}`
      console.error('WordPress publish error:', errorMsg)

      // Security plugin blocking? Return helpful error
      if (response.status === 401) {
        return {
          success: false,
          error: 'Authentication failed. Check your Application Password in WordPress.'
        }
      }
      if (response.status === 403) {
        return {
          success: false,
          error: 'WordPress REST API blocked. Check your security plugin settings.'
        }
      }

      return { success: false, error: errorMsg }
    }

    const data = await response.json() as {
      id: number
      link: string
    }

    // Update content page with WordPress details
    await supabaseAdmin
      .from('content_pages')
      .update({
        published: true,
        published_at: new Date().toISOString(),
        wordpress_post_id: data.id,
        wordpress_url: data.link
      })
      .eq('id', params.contentPageId)

    return {
      success: true,
      wordpressUrl: data.link,
      wordpressPostId: data.id
    }
  } catch (error) {
    console.error('WordPress publisher error:', error)
    return { success: false, error: 'Connection failed. Check your WordPress URL.' }
  }
}

export async function verifyWordPressConnection(params: {
  wordpressUrl: string
  apiKey: string
  username?: string
}): Promise<{ connected: boolean; error?: string; siteTitle?: string }> {
  try {
    const baseUrl = params.wordpressUrl.replace(/\/$/, '')
    const credentials = params.username
      ? Buffer.from(`${params.username}:${params.apiKey}`).toString('base64')
      : Buffer.from(`admin:${params.apiKey}`).toString('base64')

    // Test with a lightweight endpoint
    const response = await fetch(`${baseUrl}/wp-json/wp/v2/users/me`, {
      headers: { 'Authorization': `Basic ${credentials}` }
    })

    if (!response.ok) {
      if (response.status === 401) {
        return { connected: false, error: 'Invalid credentials. Check username and Application Password.' }
      }
      if (response.status === 404) {
        return { connected: false, error: 'WordPress REST API not found. Check your site URL.' }
      }
      return { connected: false, error: `Connection failed: HTTP ${response.status}` }
    }

    const siteResponse = await fetch(`${baseUrl}/wp-json`)
    const siteData = await siteResponse.json() as { name?: string }

    return {
      connected: true,
      siteTitle: siteData.name || 'Your WordPress Site'
    }
  } catch {
    return { connected: false, error: 'Cannot reach WordPress. Check your URL.' }
  }
}
