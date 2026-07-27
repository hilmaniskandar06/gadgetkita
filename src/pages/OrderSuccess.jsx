import { useState, useRef, useEffect } from 'react'
import { useLocation, useParams, Link, Navigate } from 'react-router-dom'
import { CheckCircle2, Upload, AlertCircle } from 'lucide-react'
import OrderSummaryCard from '../components/OrderSummaryCard'
import { useToast } from '../context/ToastContext'
import * as orderService from '../services/orderService'
import { resizeImage } from '../utils/image'

export default function OrderSuccess() {
  const { id } = useParams()
  const location = useLocation()
  const { addToast } = useToast()
  
  const [proof, setProof] = useState(null)
  const [confirmed, setConfirmed] = useState(false)
  const fileRef = useRef(null)

  const [order, setOrder] = useState(location.state)
  const [loading, setLoading] = useState(!location.state)

  useEffect(() => {
    if (!order) {
      orderService.getOrderById(id).then(o => {
        setOrder(o)
        setLoading(false)
      }).catch(err => {
        setLoading(false)
      })
    }
  }, [id, order])

  if (!loading && !order) return <Navigate to="/" replace />

  async function handleConfirm() {
    if (!proof) return addToast('Upload bukti transfer terlebih dahulu')
    
    try {
      let finalProof = proof
      if (proof.startsWith('data:')) {
        const { uploadImage } = await import('../services/storageService')
        const fileName = `receipt-${order.id}-${Date.now()}.jpg`
        finalProof = await uploadImage(proof, fileName, 'public')
      }

      await orderService.updateOrderStatus(order.id, 'menunggu_verifikasi', { paymentProof: finalProof })
      setConfirmed(true)
      addToast('Pembayaran berhasil dikonfirmasi')
    } catch (err) {
      addToast('Gagal mengkonfirmasi pembayaran: ' + err.message)
    }
  }

  async function handleUpload(e) {
    const file = e.target.files[0]
    if (!file) return
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      addToast('Format file tidak didukung. Harap unggah format JPG, PNG, atau WEBP.', 'error')
      e.target.value = ''
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      addToast('Ukuran gambar maksimal 5MB', 'error')
      e.target.value = ''
      return
    }
    try {
      const resized = await resizeImage(file, 1280, 0.85)
      setProof(resized)
    } catch (err) {
      addToast('Gagal memproses gambar: ' + err.message, 'error')
      e.target.value = ''
    }
  }

  if (loading) {
    return <div className="py-20 text-center text-cacao-500">Memuat detail pesanan...</div>
  }

  return (
    <div className="max-w-xl mx-auto px-5 py-16 text-center">
      <div className="w-16 h-16 rounded-full bg-ok-50 text-ok-500 flex items-center justify-center mx-auto mb-5">
        <CheckCircle2 size={32} />
      </div>
      <h1 className="text-2xl font-extrabold">Pesanan berhasil dibuat!</h1>
      <p className="text-cacao-600 mt-2">
        Nomor pesanan kamu <span className="font-mono font-bold text-cacao-900">{order.id}</span>
      </p>

      <div className="mt-8">
        <OrderSummaryCard order={order} />
      </div>

      {order.customer?.payment && !confirmed && order.status !== 'menunggu_verifikasi' && order.status !== 'diproses' && order.status !== 'dikirim' && order.status !== 'selesai' && (
        <div className="mt-8 bg-white border border-cream-300 p-6 rounded-xl text-left max-w-sm mx-auto">
          <h3 className="font-bold mb-3 text-center">Konfirmasi Pembayaran</h3>
          <p className="text-sm text-cacao-600 mb-1 text-center">
            Upload bukti transfer untuk memproses pesanan {order.id}.
          </p>
          <p className="text-[10px] text-cacao-500 mb-4 text-center">
            Maksimal 5MB. Format JPG/PNG/WEBP. (Otomatis dikecilkan jika terlalu besar)
          </p>
          
          <div className="flex flex-col gap-3">
            {proof ? (
              <img src={proof} alt="Bukti Transfer" className="w-full h-40 object-cover rounded border" />
            ) : (
              <div className="h-40 bg-cream-100 border-2 border-dashed border-cream-300 rounded flex flex-col items-center justify-center text-cacao-400">
                <Upload size={24} className="mb-2" />
                <span className="text-xs">Pilih Gambar</span>
              </div>
            )}
            <input type="file" accept="image/*" className="hidden" ref={fileRef} onChange={handleUpload} />
            <button type="button" onClick={() => fileRef.current.click()} className="text-sm font-semibold border border-cream-300 py-2 rounded-lg hover:bg-cream-100">
              {proof ? 'Ganti Gambar' : 'Pilih Bukti Transfer'}
            </button>
            <button type="button" onClick={handleConfirm} disabled={!proof} className="bg-gold-500 hover:bg-gold-400 text-cacao-900 font-bold py-2 rounded-lg transition-colors disabled:opacity-50">
              Konfirmasi Pembayaran
            </button>
          </div>
        </div>
      )}

      {(confirmed || order.status === 'menunggu_verifikasi') && (
        <div className="mt-8 bg-ok-50 border border-ok-200 p-4 rounded-xl flex flex-col items-center gap-2 max-w-sm mx-auto text-ok-700">
          <AlertCircle size={24} />
          <p className="text-sm font-medium text-center">Bukti transfer berhasil diunggah. Menunggu verifikasi admin.</p>
        </div>
      )}

      <div className="flex gap-3 justify-center mt-8">
        <Link to="/toko" className="bg-cacao-900 text-white font-bold px-6 py-3 rounded-full hover:bg-cacao-800 transition-colors">
          Belanja Lagi
        </Link>
        <Link to="/pesanan" className="border border-cream-300 font-semibold px-6 py-3 rounded-full hover:border-gold-500 transition-colors">
          Lihat Riwayat Pesanan
        </Link>
      </div>
    </div>
  )
}
