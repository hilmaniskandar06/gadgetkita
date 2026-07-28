import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY

let supabase = null
if (SUPABASE_URL && SUPABASE_ANON_KEY) {
  try {
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  } catch (e) {
    console.warn('Supabase client failed to init:', e.message)
  }
}

async function getApkUrlFromDb() {
  if (!supabase) return null
  try {
    const { data, error } = await supabase
      .from('site_settings')
      .select('data')
      .eq('id', 1)
      .maybeSingle()

    if (error || !data || !data.data) return null
    const link = data.data.appDownloadLink
    if (typeof link === 'string' && link.trim()) return link.trim()
    return null
  } catch (e) {
    console.error('Failed fetch appDownloadLink from DB:', e.message)
    return null
  }
}

function parseFilenameFromUrl(url, fallback = 'KakaoKita.apk') {
  try {
    const u = new URL(url)
    const parts = u.pathname.split('/').filter(Boolean)
    const last = parts.pop() || fallback
    return decodeURIComponent(last) || fallback
  } catch {
    return fallback
  }
}

export const config = {
  runtime: 'nodejs',
  maxDuration: 60
}

export default async function handler(req, res) {
  const apkUrl = await getApkUrlFromDb()

  if (!apkUrl) {
    res.status(404)
    res.setHeader('Content-Type', 'text/plain; charset=utf-8')
    res.send('Link download APK belum diatur. Silakan hubungi admin atau isi field Link Download APK di halaman Kelola Konten.')
    return
  }

  try {
    const upstream = await fetch(apkUrl, {
      method: 'GET',
      redirect: 'follow',
      signal: AbortSignal.timeout(60_000)
    })

    if (!upstream.ok || !upstream.body) {
      console.warn(
        `[download-apk] Upstream gagal (status=${upstream.status || 0}). Redirect langsung ke URL asli.`
      )
      const filename = parseFilenameFromUrl(apkUrl, 'KakaoKita.apk')
      const separator = apkUrl.includes('?') ? '&' : '?'
      const downloadHintUrl = `${apkUrl}${separator}download=${encodeURIComponent(filename)}`
      res.status(302)
      res.setHeader('Location', downloadHintUrl)
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate')
      res.end()
      return
    }

    const contentType =
      upstream.headers.get('content-type') || 'application/vnd.android.package-archive'
    const contentLength = upstream.headers.get('content-length') || undefined
    const filename = parseFilenameFromUrl(apkUrl, 'KakaoKita.apk')

    const arrayBuffer = await upstream.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    res.status(200)
    res.setHeader('Content-Type', contentType)
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate')
    res.setHeader('Pragma', 'no-cache')
    res.setHeader('Expires', '0')
    if (contentLength) res.setHeader('Content-Length', contentLength)
    res.send(buffer)
  } catch (err) {
    console.error('[download-apk] Stream error:', err)
    try {
      const filename = parseFilenameFromUrl(apkUrl, 'KakaoKita.apk')
      const separator = apkUrl.includes('?') ? '&' : '?'
      const downloadHintUrl = `${apkUrl}${separator}download=${encodeURIComponent(filename)}`
      res.status(302)
      res.setHeader('Location', downloadHintUrl)
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate')
      res.end()
    } catch (fallbackErr) {
      res.status(500)
      res.setHeader('Content-Type', 'text/plain; charset=utf-8')
      res.send('Terjadi kesalahan internal saat menyiapkan file APK.')
    }
  }
}
