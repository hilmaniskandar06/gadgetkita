import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Receipt, ChevronRight } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import * as orderService from '../services/orderService'

const fmt = (n) => 'Rp' + n.toLocaleString('id-ID')

const STATUS_LABELS = {
  belum_dibayar: { label: 'Belum Dibayar', class: 'bg-slate-100 text-slate-700' },
  menunggu_verifikasi: { label: 'Menunggu Verifikasi', class: 'bg-lime-100 text-lime-600' },
  diproses: { label: 'Diproses', class: 'bg-sky-100 text-sky-700' },
  dikirim: { label: 'Dikirim', class: 'bg-indigo-100 text-indigo-700' },
  selesai: { label: 'Selesai', class: 'bg-ok-100 text-ok-700' },
  dibatalkan: { label: 'Dibatalkan', class: 'bg-rose-100 text-rose-700' }
}

export default function OrderHistory() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      orderService.getOrdersByUser(user.id)
        .then(data => {
          setOrders(data)
          setLoading(false)
        })
        .catch(err => {
          console.error(err)
          setLoading(false)
        })
    } else {
      setLoading(false)
    }
  }, [user])

  if (loading) {
    return <div className="py-24 text-center text-slate-500">Memuat riwayat pesanan...</div>
  }

  if (orders.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-5 lg:px-8 py-24 flex flex-col items-center text-center gap-4">
        <Receipt size={40} className="text-gray-200" />
        <h1 className="text-xl font-extrabold">Belum ada pesanan</h1>
        <p className="text-sm text-slate-600">Riwayat pesananmu akan muncul di sini setelah checkout.</p>
        <Link to="/toko" className="bg-slate-900 text-white font-bold px-6 py-3 rounded-full mt-2 hover:bg-slate-800 transition-colors">
          Mulai Belanja
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-5 lg:px-8 py-10">
      <h1 className="text-2xl font-extrabold mb-8">Riwayat Pesanan</h1>
      <div className="flex flex-col gap-4">
        {orders.map((o) => {
          const status = o.status || 'belum_dibayar'
          const statusData = STATUS_LABELS[status] || STATUS_LABELS['belum_dibayar']
          return (
            <Link
              key={o.id}
              to={`/pesanan/${o.id}`}
              className="bg-white border border-gray-200 rounded-xl p-5 hover:border-lime-500 transition-colors flex items-center gap-4"
            >
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap justify-between items-center gap-2 mb-3">
                  <span className="font-mono font-bold">{o.id}</span>
                  <span className="text-xs text-slate-500">{new Date(o.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                </div>
                <div className="text-sm text-slate-700 mb-3 truncate">
                  {o.items.map((i) => i.name + (i.selectedColor || i.color ? ` (${i.selectedColor || i.color})` : '') + ' ×' + i.qty).join(', ')}
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-600">
                    {typeof o.customer?.payment === 'object' ? o.customer.payment.name : o.customer?.payment}
                  </span>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${statusData.class}`}>
                    {statusData.label}
                  </span>
                  <span className="font-mono font-bold">{fmt(o.total)}</span>
                </div>
              </div>
              <ChevronRight size={18} className="text-slate-500 shrink-0" />
            </Link>
          )
        })}
      </div>
    </div>
  )
}
