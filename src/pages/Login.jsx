import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { useSiteContent } from '../context/SiteContentContext'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { login } = useAuth()
  const { addToast } = useToast()
  const { content } = useSiteContent()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from || '/'
  const preservedState = location.state?.state

  async function handleSubmit(e) {
    e.preventDefault()
    const res = await login(email, password)
    if (res.success) {
      addToast('Berhasil login')
      navigate(from, { replace: true, state: preservedState })
    } else {
      addToast(res.error || 'Gagal login', 'error')
    }
  }

  const logoSrc = content.logoDark || content.shopLogo
  const shopName = content.shopName || 'KAKAO.KITA'

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-5">
      <div className="bg-white p-8 rounded-2xl w-full max-w-md shadow-sm border border-gray-100">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full overflow-hidden bg-slate-100 flex items-center justify-center mx-auto mb-3 border border-gray-100">
            {logoSrc ? (
              <img src={logoSrc} alt={shopName} className="w-full h-full object-contain p-1" />
            ) : (
              <span className="font-extrabold text-slate-700 text-sm">{shopName}</span>
            )}
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Selamat Datang Kembali</h1>
          <p className="text-slate-500 text-sm mt-1">Masuk untuk melanjutkan belanja</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-1.5">Email</label>
            <input 
              type="email" 
              required 
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200 transition-all bg-white"
              placeholder="contoh@email.com"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-1.5">Password</label>
            <input 
              type="password" 
              required 
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200 transition-all bg-white"
              placeholder="••••••••"
            />
          </div>
          <button type="submit" className="w-full bg-slate-600 hover:bg-slate-700 text-white font-bold py-3 rounded-xl transition-colors mt-2">
            Masuk
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-600">
          Belum punya akun? <Link to="/register" className="text-slate-900 font-bold hover:underline">Daftar sekarang</Link>
        </div>
      </div>
    </div>
  )
}
