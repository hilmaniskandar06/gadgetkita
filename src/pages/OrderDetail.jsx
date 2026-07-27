import { useEffect, useState } from 'react'
import { useParams, Link, Navigate } from 'react-router-dom'
import { ChevronLeft, Printer } from 'lucide-react'
import OrderSummaryCard from '../components/OrderSummaryCard'
import { useToast } from '../context/ToastContext'
import * as orderService from '../services/orderService'

export default function OrderDetail() {
  const { id } = useParams()
  const [order, setOrder] = useState(undefined)
  const { addToast } = useToast()

  useEffect(() => {
    orderService.getOrderById(id).then(o => {
      setOrder(o)
    }).catch(err => {
      console.error(err)
      setOrder(null)
    })
  }, [id])

  if (order === undefined) {
    return <div className="max-w-3xl mx-auto px-5 py-16 text-center text-cacao-500">Memuat...</div>
  }
  if (order === null) return <Navigate to="/pesanan" replace />

  async function handleSelesai() {
    if (confirm('Apakah Anda yakin pesanan ini sudah diterima dengan baik?')) {
      try {
        const updated = await orderService.updateOrderStatus(id, 'selesai')
        setOrder(updated)
        addToast('Pesanan berhasil diselesaikan!')
      } catch (err) {
        addToast('Gagal menyelesaikan pesanan: ' + err.message)
      }
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-5 lg:px-8 py-10">
      <Link to="/pesanan" className="inline-flex items-center gap-1 text-sm text-cacao-600 hover:text-cacao-900 mb-6">
        <ChevronLeft size={16} /> Kembali ke Riwayat Pesanan
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold">Detail Pesanan</h1>
          <p className="text-sm text-cacao-600 mt-1">
            {new Date(order.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-mono font-bold bg-cream-200 px-3 py-1.5 rounded-full text-sm">{order.id}</span>
          {order.trackingNumber && (
            <Link
              to={`/invoice/${order.id}`}
              target="_blank"
              className="flex items-center gap-2 bg-white border border-cream-300 text-cacao-700 hover:text-cacao-900 hover:bg-cream-50 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors shadow-sm"
            >
              <Printer size={16} /> Cetak Invoice
            </Link>
          )}
        </div>
      </div>

      <OrderSummaryCard order={order} />

      {order.status === 'dikirim' && (
        <div className="mt-6 flex justify-end">
          <button onClick={handleSelesai} className="bg-ok-500 hover:bg-ok-600 text-white font-bold py-3 px-6 rounded-xl transition-colors shadow-sm">
            Pesanan Diterima / Selesai
          </button>
        </div>
      )}
    </div>
  )
}
