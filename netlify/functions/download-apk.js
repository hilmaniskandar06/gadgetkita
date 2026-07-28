const { createClient } = require('@supabase/supabase-js')

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

exports.handler = async function (event, context) {
  const apkUrl = (process.env.APP_DOWNLOAD_URL || '').trim() || (await getApkUrlFromDb())

  if (!apkUrl) {
    return {
      statusCode: 404,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      body: 'Link download APK belum diatur. Silakan hubungi admin atau atur APP_DOWNLOAD_URL environment variable.'
    }
  }

  try {
    const upstream = await fetch(apkUrl, {
      method: 'GET',
      redirect: 'follow',
      signal: AbortSignal.timeout(60_000)
    })

    if (!upstream.ok || !upstream.body) {
      return {
        statusCode: upstream.status || 502,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
        body: 'Gagal mengambil file APK dari server upstream.'
      }
    }

    const contentType =
      upstream.headers.get('content-type') || 'application/vnd.android.package-archive'
    const contentLength = upstream.headers.get('content-length') || undefined
    const filename = parseFilenameFromUrl(apkUrl, 'KakaoKita.apk')

    const buffer = Buffer.from(await upstream.arrayBuffer())

    return {
      statusCode: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        ...(contentLength ? { 'Content-Length': contentLength } : {})
      },
      body: buffer.toString('base64'),
      isBase64Encoded: true
    }
  } catch (err) {
    console.error('download-apk error:', err)
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      body: 'Terjadi kesalahan internal saat menyiapkan file APK.'
    }
  }
}
