import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { LogIn } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { login } = useAuth()
  const { addToast } = useToast()
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

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-5">
      <div className="bg-white p-8 rounded-2xl w-full max-w-md shadow-sm border border-cream-200">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-cacao-100 text-cacao-600 rounded-full flex items-center justify-center mx-auto mb-3">
            <LogIn size={24} />
          </div>
          <h1 className="text-2xl font-bold text-cacao-900">Selamat Datang Kembali</h1>
          <p className="text-cacao-500 text-sm mt-1">Masuk untuk melanjutkan belanja</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-cacao-900 mb-1.5">Email</label>
            <input 
              type="email" 
              required 
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-cream-300 outline-none focus:border-cacao-500 focus:ring-2 focus:ring-cacao-200 transition-all bg-cream-50"
              placeholder="contoh@email.com"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-cacao-900 mb-1.5">Password</label>
            <input 
              type="password" 
              required 
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-cream-300 outline-none focus:border-cacao-500 focus:ring-2 focus:ring-cacao-200 transition-all bg-cream-50"
              placeholder="••••••••"
            />
          </div>
          <button type="submit" className="w-full bg-cacao-600 hover:bg-cacao-700 text-white font-bold py-3 rounded-xl transition-colors mt-2">
            Masuk
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-cacao-600">
          Belum punya akun? <Link to="/register" className="text-cacao-900 font-bold hover:underline">Daftar sekarang</Link>
        </div>
      </div>
    </div>
  )
}
