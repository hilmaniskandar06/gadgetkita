import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="max-w-7xl mx-auto px-5 py-28 text-center">
      <span className="font-mono text-lime-500 text-sm font-bold">404</span>
      <h1 className="text-3xl font-extrabold mt-3">Halaman tidak ditemukan</h1>
      <p className="text-slate-600 mt-2">Sepertinya cokelat yang kamu cari sudah habis dipetik.</p>
      <Link to="/" className="inline-block bg-slate-900 text-white font-bold px-6 py-3 rounded-full mt-6 hover:bg-slate-800 transition-colors">
        Kembali ke Beranda
      </Link>
    </div>
  )
}
