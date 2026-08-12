import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from '../config/supabase'

const HealthCheckContext = createContext(null)

const TABLES_TO_CHECK = [
  { name: 'products', col: 'id' },
  { name: 'categories', col: 'id' },
  { name: 'site_settings', col: 'id' },
  { name: 'profiles', col: 'id' },
  { name: 'carts', col: 'user_id' },
  { name: 'wishlists', col: 'user_id' },
  { name: 'vouchers', col: 'id' },
  { name: 'payments', col: 'id' },
  { name: 'orders', col: 'id' },
  { name: 'notifications', col: 'id' },
  { name: 'chats', col: 'id' },
]

export function HealthCheckProvider({ children }) {
  const [status, setStatus] = useState({
    envOk: false,
    authOk: null,
    tables: {},
    overall: 'checking',
    errors: [],
    startTime: Date.now(),
  })

  const runCheck = useCallback(async () => {
    const errors = []
    const url = import.meta.env.VITE_SUPABASE_URL
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY

    const envOk = !!(url && key)
    if (!envOk) {
      errors.push('Environment Variables VITE_SUPABASE_URL atau VITE_SUPABASE_ANON_KEY TIDAK DITEMUKAN')
    }

    const tablesReport = {}
    let authOk = null

    if (envOk) {
      try {
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
        authOk = !sessionError
      } catch (err) {
        authOk = false
        errors.push('Gagal konek ke endpoint auth Supabase: ' + (err?.message || err))
      }
    }

    if (envOk && authOk) {
      const results = await Promise.all(
        TABLES_TO_CHECK.map(async ({ name: table, col }) => {
          try {
            const { data, error } = await supabase
              .from(table)
              .select(col)
              .limit(1)
              .maybeSingle()
            if (error && error.code !== 'PGRST116') {
              const code = error.code || 'UNKNOWN'
              const hint = code === '42501' ? ' (RLS Policy SELECT tidak ada untuk role anon!)' : ''
              errors.push(`Tabel ${table}: ${error.message}${hint}`)
              return { table, ok: false, error: error.message + hint }
            }
            return { table, ok: true }
          } catch (err) {
            const msg = err?.message || String(err)
            errors.push(`Tabel ${table}: Exception - ${msg}`)
            return { table, ok: false, error: msg }
          }
        })
      )
      results.forEach((r) => {
        tablesReport[r.table] = { ok: r.ok, error: r.error || null }
      })
    }

    const tablesOk = Object.values(tablesReport).every((r) => r.ok)
    const criticalOk = envOk && authOk && tablesOk

    if (!criticalOk) {
      console.group('%c🔴 SUPABASE HEALTH CHECK GAGAL', 'color: #ef4444; font-weight: bold; font-size: 14px;')
      console.error('Status ringkasan:', { envOk, authOk, tablesOk })
      errors.forEach((e) => console.error('  -', e))
      console.groupEnd()
    } else {
      console.group('%c✅ SUPABASE HEALTH CHECK OK', 'color: #22c55e; font-weight: bold;')
      console.log(`Environment: ${envOk ? '✅' : '❌'} | Auth: ${authOk ? '✅' : '❌'} | ${Object.keys(tablesReport).length} tables checked: ${tablesOk ? '✅' : '⚠️'}`)
      console.groupEnd()
    }

    setStatus({
      envOk,
      authOk,
      tables: tablesReport,
      overall: criticalOk ? 'ok' : 'degraded',
      errors,
      startTime: Date.now(),
    })
  }, [])

  useEffect(() => {
    runCheck()
  }, [runCheck])

  return (
    <HealthCheckContext.Provider value={{ status, runCheck }}>
      {children}
    </HealthCheckContext.Provider>
  )
}

export function useHealthCheck() {
  const ctx = useContext(HealthCheckContext)
  if (!ctx) throw new Error('useHealthCheck harus di dalam HealthCheckProvider')
  return ctx
}

export function HealthWarningBanner() {
  const { status, runCheck } = useHealthCheck()
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (status.overall === 'degraded' && status.errors.length > 0) {
      const t = setTimeout(() => setShow(true), 300)
      return () => clearTimeout(t)
    }
  }, [status.overall, status.errors.length])

  if (!show || status.overall === 'ok' || status.overall === 'checking') {
    return null
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] bg-rose-600 text-white p-4 shadow-2xl border-b-4 border-rose-800">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="shrink-0 w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center font-black text-lg">
          !
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="font-bold text-base sm:text-lg">
            ERROR KONEKSI DATABASE - {status.errors.length} masalah terdeteksi
          </h2>
          <ul className="text-xs sm:text-sm text-rose-100 mt-1 space-y-0.5 list-disc list-inside max-h-24 overflow-y-auto">
            {status.errors.slice(0, 5).map((e, i) => (
              <li key={i}>{e}</li>
            ))}
            {status.errors.length > 5 && <li>...dan {status.errors.length - 5} masalah lainnya</li>}
          </ul>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={() => {
              try { console.log('Health status detail:', JSON.stringify(status, null, 2)) } catch (_) {}
              alert('Detail kesehatan system sudah dicetak ke Console (F12). Kirim ke admin.')
            }}
            className="px-3 py-2 text-xs font-bold bg-white/15 hover:bg-white/25 border border-white/30 rounded-lg transition-colors"
          >
            Debug Console
          </button>
          <button
            onClick={runCheck}
            className="px-3 py-2 text-xs font-bold bg-white/15 hover:bg-white/25 border border-white/30 rounded-lg transition-colors"
          >
            Cek Ulang
          </button>
          <button
            onClick={() => setShow(false)}
            className="px-3 py-2 text-xs font-bold bg-white/15 hover:bg-white/25 border border-white/30 rounded-lg transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  )
}
