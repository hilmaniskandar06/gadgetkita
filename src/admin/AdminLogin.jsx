import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'

import { useSiteContent } from '../context/SiteContentContext'

// Demo saja — password statis di kode. JANGAN dipakai untuk produksi.
// Saat migrasi ke Supabase, ganti mekanisme ini dengan supabase.auth.signInWithPassword().
// Lihat README bagian "Migrasi ke Supabase".
const ADMIN_PASSWORD = 'admin123'

export default function AdminLogin() {
  const { content } = useSiteContent()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const authed = sessionStorage.getItem('kk_admin_auth') === 'true'

  if (authed) return <Navigate to="/admin" replace />

  function handleSubmit(e) {
    e.preventDefault()
    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem('kk_admin_auth', 'true')
      navigate('/admin')
    } else {
      setError('Password salah. Coba lagi.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-cream-200 px-5">
      <form onSubmit={handleSubmit} className="bg-white border border-cream-300 rounded-xl p-8 w-full max-w-sm">
        <div className="flex justify-center mb-4">
          {content.logoDark || content.shopLogo ? (
            <img src={content.logoDark || content.shopLogo} alt={content.shopName} className="h-12 w-auto object-contain" />
          ) : (
            <div className="font-extrabold text-2xl tracking-tight text-cacao-900">{content.shopName || 'KAKAO.KITA'}</div>
          )}
        </div>
        <h1 className="text-xl font-extrabold mb-1">Masuk Admin</h1>
        <p className="text-sm text-cacao-600 mb-6">Kelola toko {content.shopName || 'Kakao Kita'}.</p>

        <label className="block text-xs font-medium text-cacao-600 mb-1.5">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoFocus
          className="w-full bg-cream-100 border border-cream-300 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-gold-500"
        />
        {error && <p className="text-xs text-rose-500 mt-2">{error}</p>}

        <button className="w-full bg-cacao-900 text-white font-bold py-3 rounded-full mt-5 hover:bg-cacao-800 transition-colors">
          Masuk
        </button>
      </form>
    </div>
  )
}
