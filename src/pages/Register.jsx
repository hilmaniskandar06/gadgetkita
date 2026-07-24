import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { UserPlus } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: ''
  })
  const { register } = useAuth()
  const { addToast } = useToast()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    if (formData.password.length < 6) {
      addToast('Password minimal 6 karakter', 'error')
      return
    }
    const res = await register(formData)
    if (res.success) {
      addToast('Pendaftaran berhasil, silakan login!')
      navigate('/login')
    } else {
      addToast(res.error || 'Gagal mendaftar', 'error')
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-5">
      <div className="bg-white p-8 rounded-2xl w-full max-w-md shadow-sm border border-cream-200 my-8">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-cacao-100 text-cacao-600 rounded-full flex items-center justify-center mx-auto mb-3">
            <UserPlus size={24} />
          </div>
          <h1 className="text-2xl font-bold text-cacao-900">Daftar Akun Baru</h1>
          <p className="text-cacao-500 text-sm mt-1">Lengkapi data di bawah untuk mulai berbelanja</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-cacao-900 mb-1.5">Nama Lengkap</label>
            <input 
              type="text" 
              required 
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              className="w-full px-4 py-2.5 rounded-xl border border-cream-300 outline-none focus:border-cacao-500 focus:ring-2 focus:ring-cacao-200 transition-all bg-cream-50"
              placeholder="Budi Santoso"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-cacao-900 mb-1.5">Nomor Telepon/WA</label>
            <input 
              type="tel" 
              required 
              pattern="^(08|\+62)[0-9]{7,13}$"
              title="Nomor telepon harus diawali 08 atau +62 dan berisi angka"
              value={formData.phone}
              onChange={e => setFormData({...formData, phone: e.target.value})}
              className="w-full px-4 py-2.5 rounded-xl border border-cream-300 outline-none focus:border-cacao-500 focus:ring-2 focus:ring-cacao-200 transition-all bg-cream-50"
              placeholder="081234567890"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-cacao-900 mb-1.5">Email</label>
            <input 
              type="email" 
              required 
              pattern=".*@gmail\.com$"
              title="Harus menggunakan email @gmail.com"
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
              className="w-full px-4 py-2.5 rounded-xl border border-cream-300 outline-none focus:border-cacao-500 focus:ring-2 focus:ring-cacao-200 transition-all bg-cream-50"
              placeholder="contoh@gmail.com"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-cacao-900 mb-1.5">Password</label>
            <input 
              type="password" 
              required 
              value={formData.password}
              onChange={e => setFormData({...formData, password: e.target.value})}
              className="w-full px-4 py-2.5 rounded-xl border border-cream-300 outline-none focus:border-cacao-500 focus:ring-2 focus:ring-cacao-200 transition-all bg-cream-50"
              placeholder="Minimal 6 karakter"
            />
          </div>
          <button type="submit" className="w-full bg-cacao-600 hover:bg-cacao-700 text-white font-bold py-3 rounded-xl transition-colors mt-4">
            Daftar Sekarang
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-cacao-600">
          Sudah punya akun? <Link to="/login" className="text-cacao-900 font-bold hover:underline">Masuk di sini</Link>
        </div>
      </div>
    </div>
  )
}
