import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useSiteContent } from '../context/SiteContentContext'
import { Loader2 } from 'lucide-react'

// Email admin yang dipakai untuk login — tidak ditampilkan ke user
const ADMIN_EMAIL = 'admin@gadgetkita.com'

export default function AdminLogin() {
  const { user, loading, login } = useAuth()
  const { content } = useSiteContent()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()

  // Sudah login sebagai admin → langsung ke dashboard
  if (!loading && user && user.email === ADMIN_EMAIL) return <Navigate to="/admin" replace />

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    const result = await login(ADMIN_EMAIL, password)
    setSubmitting(false)
    if (result.success) {
      navigate('/admin')
    } else {
      setError('Password salah. Coba lagi.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-5">
      <form onSubmit={handleSubmit} className="bg-white border-2 border-black p-8 w-full max-w-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <div className="flex justify-center mb-4">
          {content.logoDark || content.shopLogo ? (
            <img src={content.logoDark || content.shopLogo} alt={content.shopName} className="h-12 w-auto object-contain" />
          ) : (
            <div className="font-extrabold text-2xl tracking-widest uppercase text-slate-900">{content.shopName || 'GADGETKITA'}</div>
          )}
        </div>
        <h1 className="text-xl font-extrabold mb-1">Masuk Admin</h1>
        <p className="text-sm text-slate-600 mb-6">Kelola toko {content.shopName || 'GadgetKita'}.</p>

        <label className="block text-xs font-medium text-slate-600 mb-1.5">Password Admin</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoFocus
          required
          placeholder="Masukkan password admin"
          className="w-full bg-gray-50 border border-gray-200 px-3.5 py-2.5 text-sm outline-none focus:border-black"
        />

        {error && <p className="text-xs text-rose-500 mt-2">{error}</p>}

        <button
          disabled={submitting}
          className="w-full bg-black text-white font-bold py-3 mt-5 hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {submitting && <Loader2 size={16} className="animate-spin" />}
          {submitting ? 'Memproses...' : 'Masuk'}
        </button>
      </form>
    </div>
  )
}
