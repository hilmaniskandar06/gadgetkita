import { Component } from 'react'

export default class GlobalErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      isPromise: false,
    }
  }

  static getDerivedStateFromError(error) {
    const isPromise =
      error instanceof Promise ||
      (error && typeof error.then === 'function') ||
      (error?.message && String(error.message).includes('thenable')) ||
      (error?.name === 'Invariant Violation' && String(error).includes('300'))
    return { hasError: true, error, isPromise }
  }

  componentDidCatch(error, errorInfo) {
    console.error('🔴 GLOBAL ERROR BOUNDARY CAUGHT ERROR:')
    console.error('Error object:', error)
    console.error('Error stack:', error?.stack)
    console.error('Component stack:', errorInfo?.componentStack)
    this.setState({ errorInfo })
  }

  handleReload = () => {
    window.location.reload()
  }

  handleClearStorage = () => {
    try {
      localStorage.clear()
      sessionStorage.clear()
    } catch (_) {}
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      const { error, isPromise } = this.state

      let errorTitle = 'Terjadi Kesalahan Sistem'
      let errorDesc = 'Silakan muat ulang halaman atau hubungi admin jika masalah berlanjut.'
      let troubleshooting = []

      if (isPromise) {
        errorTitle = 'Koneksi Database Gagal (Error React #300)'
        errorDesc =
          'Aplikasi gagal terhubung ke database Supabase. Ini biasanya disebabkan Environment Variables tidak diset dengan benar, kredensial salah, atau tabel/policy RLS Supabase tidak lengkap.'
        troubleshooting = [
          'Cek Environment Variables di Vercel/Settings: VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY',
          'Pastikan kredensial Supabase BENAR (bukan project lama)',
          'Pastikan semua tabel di Supabase punya RLS Policy SELECT untuk role anon',
          'Buka DevTools Console untuk error detail',
          'Coba clear cache browser dan reload',
        ]
      } else if (error?.message) {
        const msg = String(error.message)
        if (msg.toLowerCase().includes('supabase') || msg.toLowerCase().includes('database') || msg.toLowerCase().includes('from')) {
          errorTitle = 'Koneksi Database Error'
          troubleshooting = [
            'Pastikan kredensial Supabase benar di Environment Variables',
            'Pastikan tabel yang dibutuhkan ada di database',
            'Pastikan RLS Policy untuk SELECT diaktifkan untuk role anon/authenticated',
          ]
        } else if (msg.toLowerCase().includes('localStorage') || msg.toLowerCase().includes('storage')) {
          troubleshooting = ['Browser dalam mode private / storage dinonaktifkan. Coba browser normal.']
        } else if (msg.toLowerCase().includes('network')) {
          troubleshooting = ['Cek koneksi internet Anda.']
        }
      }

      return (
        <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-5 font-sans">
          <div className="max-w-xl w-full bg-slate-800 border border-slate-700 rounded-2xl p-6 sm:p-8 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-rose-500/20 text-rose-400 rounded-xl flex items-center justify-center text-2xl font-black shrink-0">
                !
              </div>
              <div>
                <h1 className="font-bold text-xl text-white">{errorTitle}</h1>
                <p className="text-sm text-slate-400 mt-0.5">GadgetKita v{String(typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : '1.0.0')}</p>
              </div>
            </div>

            <p className="text-slate-300 text-sm leading-relaxed mb-4">{errorDesc}</p>

            {troubleshooting.length > 0 && (
              <div className="mb-5 bg-slate-900/70 border border-slate-700 rounded-xl p-4">
                <h3 className="font-bold text-xs uppercase tracking-widest text-lime-400 mb-2">
                  Langkah Perbaikan
                </h3>
                <ol className="space-y-1.5 list-decimal list-inside text-sm text-slate-300 pl-1">
                  {troubleshooting.map((t, i) => (
                    <li key={i}>{t}</li>
                  ))}
                </ol>
              </div>
            )}

            {error?.message && (
              <div className="mb-5 bg-black/50 border border-slate-700 rounded-xl p-3 font-mono text-xs text-rose-300 overflow-x-auto max-h-28 overflow-y-auto">
                {String(error.message)}
                {error?.stack ? (
                  <div className="mt-2 text-slate-500 text-[10px] whitespace-pre-wrap">
                    {String(error.stack).slice(0, 600)}
                  </div>
                ) : null}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={this.handleReload}
                className="flex-1 bg-lime-500 hover:bg-lime-400 text-slate-900 font-bold py-3 px-4 rounded-xl transition-colors"
              >
                Muat Ulang Halaman
              </button>
              <button
                onClick={this.handleClearStorage}
                className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 px-4 rounded-xl transition-colors"
              >
                Clear Cache &amp; Reload
              </button>
            </div>

            <div className="mt-5 pt-5 border-t border-slate-700 flex flex-wrap gap-2 items-center justify-between">
              <div className="flex flex-wrap gap-2 text-[10px]">
                <span className="px-2 py-1 bg-slate-700/50 text-slate-400 rounded-full font-mono">
                  SUPA_URL: {(import.meta.env.VITE_SUPABASE_URL || 'NOT SET').slice(0, 28)}...
                </span>
                <span className={`px-2 py-1 rounded-full font-mono ${
                  import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY
                    ? 'bg-lime-500/10 text-lime-400'
                    : 'bg-rose-500/10 text-rose-400'
                }`}>
                  ENV: {import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY ? 'OK' : 'MISSING'}
                </span>
              </div>
              <button
                onClick={() => {
                  try { console.log('Debug info:', { error: this.state.error, env: { url: import.meta.env.VITE_SUPABASE_URL?.slice(0,20), keyLen: import.meta.env.VITE_SUPABASE_ANON_KEY?.length } }) } catch (_) {}
                  alert('Informasi debug sudah dicetak ke Console (F12 → tab Console). Kirim screenshot ke admin.')
                }}
                className="text-xs text-slate-400 hover:text-white underline underline-offset-2"
              >
                Kirim Debug Info
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
