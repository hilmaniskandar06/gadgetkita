import { useEffect, useState, useRef } from 'react'
import { useParams, Link, Navigate } from 'react-router-dom'
import { ChevronLeft, Printer, Upload } from 'lucide-react'
import OrderSummaryCard from '../components/OrderSummaryCard'
import { useToast } from '../context/ToastContext'
import * as orderService from '../services/orderService'
import { resizeImage } from '../utils/image'

export default function OrderDetail() {
  const { id } = useParams()
  const [order, setOrder] = useState(undefined)
  const { addToast } = useToast()
  const [proof, setProof] = useState(null)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef(null)

  useEffect(() => {
    orderService.getOrderById(id).then(o => {
      setOrder(o)
    }).catch(err => {
      console.error(err)
      setOrder(null)
    })
  }, [id])

  if (order === undefined) {
    return <div className="max-w-3xl mx-auto px-5 py-16 text-center text-slate-500">Memuat...</div>
  }
  if (order === null) return <Navigate to="/pesanan" replace />

  async function handleUploadReceipt(e) {
    const file = e.target.files[0]
    if (!file) return
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      addToast('Format file tidak didukung (hanya JPG/PNG/WEBP)', 'error')
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

  async function handleConfirmReceipt() {
    if (!proof) return addToast('Pilih gambar bukti transfer terlebih dahulu')
    setUploading(true)
    try {
      let finalProof = proof
      if (proof.startsWith('data:')) {
        const { uploadImage } = await import('../services/storageService')
        const fileName = `receipt-${order.id}-${Date.now()}.jpg`
        finalProof = await uploadImage(proof, fileName, 'public')
      }
      const updated = await orderService.updateOrderStatus(order.id, 'menunggu_verifikasi', { paymentProof: finalProof })
      setOrder(updated)
      setProof(null)
      addToast('Bukti transfer berhasil dikirim, menunggu verifikasi admin')
    } catch (err) {
      addToast('Gagal mengirim bukti: ' + err.message)
    } finally {
      setUploading(false)
    }
  }

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
      <Link to="/pesanan" className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900 mb-6">
        <ChevronLeft size={16} /> Kembali ke Riwayat Pesanan
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold">Detail Pesanan</h1>
          <p className="text-sm text-slate-600 mt-1">
            {new Date(order.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-mono font-bold bg-gray-100 px-3 py-1.5 rounded-full text-sm">{order.id}</span>
          {order.trackingNumber && (
            <Link
              to={`/invoice/${order.id}`}
              target="_blank"
              className="flex items-center gap-2 bg-white border border-gray-200 text-slate-700 hover:text-slate-900 hover:bg-white px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors shadow-sm"
            >
              <Printer size={16} /> Cetak Invoice
            </Link>
          )}
        </div>
      </div>

      <OrderSummaryCard order={order} />

      {order.status === 'belum_dibayar' && !order.paymentProof && (
        <div className="mt-8 bg-white border border-gray-200 p-6 rounded-xl max-w-3xl">
          <div className="flex items-start gap-2 mb-4">
            <div className="w-9 h-9 shrink-0 rounded-full bg-lime-100 text-lime-600 flex items-center justify-center">
              <Upload size={20} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">Konfirmasi Pembayaran</h3>
              <p className="text-xs text-slate-500 mt-0.5">Upload bukti transfer untuk memproses pesanan ini.</p>
            </div>
          </div>
          <p className="text-[11px] text-rose-600 mb-3 bg-rose-50 rounded-lg py-1.5 px-3 border border-rose-200 inline-block">
            ⚠️ <strong>Wajib upload bukti dalam 24 jam</strong>. Lewat batas waktu, pesanan otomatis dibatalkan & voucher tidak dapat digunakan kembali.
          </p>
          <div className="flex flex-col gap-3 max-w-sm">
            {proof ? (
              <img src={proof} alt="Bukti Transfer" className="w-full h-44 object-cover rounded-lg border border-gray-200" />
            ) : (
              <div className="h-44 bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center text-slate-500">
                <Upload size={28} className="mb-2" />
                <span className="text-xs">Klik Pilih Gambar untuk upload bukti</span>
              </div>
            )}
            <input type="file" accept="image/*" className="hidden" ref={fileRef} onChange={handleUploadReceipt} />
            <div className="flex gap-2 flex-wrap">
              <button type="button" onClick={() => fileRef.current.click()} className="flex-1 text-sm font-semibold border border-gray-200 py-2.5 rounded-lg hover:bg-gray-50 transition-colors">
                {proof ? 'Ganti Gambar' : 'Pilih Bukti Transfer'}
              </button>
              <button
                type="button"
                onClick={handleConfirmReceipt}
                disabled={!proof || uploading}
                className="flex-1 bg-lime-500 hover:bg-lime-400 text-slate-900 font-bold py-2.5 rounded-lg transition-colors disabled:opacity-50"
              >
                {uploading ? 'Mengirim...' : 'Kirim Bukti Transfer'}
              </button>
            </div>
            <p className="text-[10px] text-slate-500">Maksimal 5MB, format JPG / PNG / WEBP (otomatis dikecilkan).</p>
          </div>
        </div>
      )}

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
