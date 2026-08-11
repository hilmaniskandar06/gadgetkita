import { useState, useRef, useEffect, useMemo } from 'react'
import { useLocation, useParams, Link, Navigate } from 'react-router-dom'
import { CheckCircle2, Upload, AlertCircle, X, QrCode } from 'lucide-react'
import OrderSummaryCard from '../components/OrderSummaryCard'
import { useToast } from '../context/ToastContext'
import * as orderService from '../services/orderService'
import { resizeImage } from '../utils/image'
import { usePayments } from '../context/PaymentContext'
import { useLeaveConfirmation } from '../hooks/useLeaveConfirmation'

export default function OrderSuccess() {
  const { id } = useParams()
  const location = useLocation()
  const { addToast } = useToast()
  const { payments } = usePayments()
  
  const [proof, setProof] = useState(null)
  const [confirmed, setConfirmed] = useState(false)
  const [showQRModal, setShowQRModal] = useState(false)
  const fileRef = useRef(null)

  const [order, setOrder] = useState(location.state)
  const [loading, setLoading] = useState(true)

  const paymentFull = useMemo(() => {
    const p = order?.customer?.payment
    if (!p) return null
    if (typeof p === 'object' && p.id && payments.length > 0) {
      const match = payments.find(x => x.id === p.id)
      if (match) return match
    }
    return typeof p === 'object' ? p : null
  }, [order?.customer?.payment, payments])

  const showPaymentFlow = Boolean(
    order?.customer?.payment &&
    !confirmed &&
    order?.status === 'belum_dibayar'
  )

  const { showModal, confirmLeave, cancelLeave, allowLeave } = useLeaveConfirmation(showPaymentFlow)
  useEffect(() => {
    if (confirmed) allowLeave()
  }, [confirmed, allowLeave])

  useEffect(() => {
    orderService.getOrderById(id).then(o => {
      if (o) setOrder(o)
      setLoading(false)
    }).catch(err => {
      if (location.state) {
        setLoading(false)
      } else {
        setLoading(false)
      }
    })
  }, [id])

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

      const updated = await orderService.updateOrderStatus(order.id, 'menunggu_verifikasi', { paymentProof: finalProof })
      if (updated) setOrder(updated)
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
    return <div className="py-20 text-center text-slate-500">Memuat detail pesanan...</div>
  }

  return (
    <div className="max-w-5xl mx-auto px-5 py-16">
      <div className="text-center mb-10">
        <div className="w-16 h-16 rounded-full bg-ok-50 text-ok-500 flex items-center justify-center mx-auto mb-5">
          <CheckCircle2 size={32} />
        </div>
        <h1 className="text-2xl font-extrabold">Pesanan berhasil dibuat!</h1>
        <p className="text-slate-600 mt-2">
          Nomor pesanan kamu <span className="font-mono font-bold text-slate-900">{order.id}</span>
        </p>
      </div>

      <div className="md:grid md:grid-cols-2 gap-8 items-start">
        <div>
          <OrderSummaryCard order={order} />
        </div>

        {showPaymentFlow && (
          <div className="bg-white border border-gray-200 p-6 rounded-xl text-left h-fit mt-8 md:mt-0">
            <h3 className="font-bold mb-3 text-center">Konfirmasi Pembayaran</h3>
            <p className="text-sm text-slate-600 mb-3 text-center">
              Upload bukti transfer untuk memproses pesanan {order.id}.
            </p>
            <p className="text-[11px] text-rose-600 mb-4 text-center bg-rose-50 rounded-lg py-2 px-3 border border-rose-200">
              <strong>Wajib upload bukti dalam 24 jam</strong>. Lewat batas waktu, pesanan otomatis dibatalkan & voucher tidak dapat digunakan kembali.
            </p>
            
            <div className="flex flex-col gap-3">
              {paymentFull?.qr && (
                <button
                  type="button"
                  onClick={() => setShowQRModal(true)}
                  className="flex items-center justify-center gap-2 text-sm font-bold border border-2 border-lime-400 text-slate-900 bg-lime-50 py-2 rounded-lg hover:bg-lime-100 transition-colors"
                >
                  <QrCode size={18} /> Lihat Gambar QRIS
                </button>
              )}
              {proof ? (
                <img src={proof} alt="Bukti Transfer" className="w-full h-40 object-cover rounded border" />
              ) : (
                <div className="h-40 bg-gray-50 border-2 border-dashed border-gray-200 rounded flex flex-col items-center justify-center text-slate-500">
                  <Upload size={24} className="mb-2" />
                  <span className="text-xs">Pilih Gambar</span>
                </div>
              )}
              <input type="file" accept="image/*" className="hidden" ref={fileRef} onChange={handleUpload} />
              <button type="button" onClick={() => fileRef.current.click()} className="text-sm font-semibold border border-gray-200 py-2 rounded-lg hover:bg-gray-50">
                {proof ? 'Ganti Gambar' : 'Pilih Bukti Transfer'}
              </button>
              <button type="button" onClick={handleConfirm} disabled={!proof} className="bg-lime-500 hover:bg-lime-400 text-slate-900 font-bold py-2 rounded-lg transition-colors disabled:opacity-50">
                Konfirmasi Pembayaran
              </button>
            </div>
          </div>
        )}
      </div>

      {(confirmed || order.status === 'menunggu_verifikasi') && (
        <div className="mt-8 bg-ok-50 border border-ok-200 p-4 rounded-xl flex flex-col items-center gap-2 max-w-sm mx-auto text-ok-700">
          <AlertCircle size={24} />
          <p className="text-sm font-medium text-center">Bukti transfer berhasil diunggah. Menunggu verifikasi admin.</p>
        </div>
      )}

      {!showPaymentFlow && (
        <div className="flex gap-3 justify-center mt-8 flex-wrap">
          <Link to="/toko" className="bg-slate-900 text-white font-bold px-6 py-3 rounded-full hover:bg-slate-800 transition-colors">
            Belanja Lagi
          </Link>
          <Link to="/pesanan" className="border border-gray-200 font-semibold px-6 py-3 rounded-full hover:border-lime-500 transition-colors">
            Lihat Riwayat Pesanan
          </Link>
        </div>
      )}

      {showQRModal && paymentFull?.qr && (
        <div className="fixed inset-0 z-[60] bg-black/60 flex items-center justify-center p-4" onClick={() => setShowQRModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 relative" onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowQRModal(false)} className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-gray-50 transition-colors text-slate-500 hover:text-slate-900" aria-label="Tutup">
              <X size={20} />
            </button>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-lime-100 text-lime-600 mb-3">
                <QrCode size={28} />
              </div>
              <h3 className="text-xl font-extrabold text-slate-900">QRIS {paymentFull.name}</h3>
              <p className="text-sm text-slate-500 mt-1 mb-4">Scan QRIS di bawah untuk pembayaran</p>
              {paymentFull.account && (
                <div className="text-center mb-4 bg-white rounded-lg py-2 px-3 border border-gray-100">
                  <div className="text-[10px] uppercase text-slate-500 font-semibold">Nomor Akun</div>
                  <div className="font-mono font-bold text-slate-900 text-lg">{paymentFull.account}</div>
                </div>
              )}
              <div className="rounded-xl border-2 border-gray-100 p-3 bg-white shadow-inner">
                <img src={paymentFull.qr} alt={`QRIS ${paymentFull.name}`} className="w-full aspect-square object-contain rounded-lg" />
              </div>
              <p className="text-[11px] text-slate-500 mt-4">
                Total tagihan: <strong className="text-slate-900">Rp{(order.total || 0).toLocaleString('id-ID')}</strong>
              </p>
              <button onClick={() => setShowQRModal(false)} className="mt-5 w-full bg-lime-500 hover:bg-lime-400 text-slate-900 font-bold py-2.5 rounded-xl transition-colors">
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-[70] bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-12 h-12 shrink-0 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
                <AlertCircle size={28} />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">Yakin ingin keluar dari halaman ini?</h3>
                <p className="text-sm text-slate-500 mt-1">Pesanan Anda <span className="font-mono font-bold">{order?.id || ''}</span> menunggu bukti pembayaran.</p>
              </div>
            </div>
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 mb-5 text-rose-900 text-xs space-y-1.5">
              <p className="font-bold">PERINGATAN PENTING:</p>
              <p>• Batas waktu upload bukti transfer adalah <strong>24 jam</strong> sejak pesanan dibuat.</p>
              <p>• Jika lewat batas waktu & belum upload bukti, pesanan akan <strong>OTOMATIS DIBATALKAN</strong> oleh sistem.</p>
              <p>• <strong>Voucher yang sudah dipakai TIDAK AKAN DIKEMBALIKAN</strong> jika dibatalkan karena lewat batas waktu.</p>
            </div>
            <div className="bg-white border border-gray-100 rounded-xl p-3 mb-5 text-slate-700 text-xs">
              <p className="font-bold text-slate-900">TENANG, ANDA TIDAK KEHILANGAN CARA UPLOAD:</p>
              <p className="mt-1">Walaupun keluar halaman ini, Anda masih bisa upload bukti transfer nanti lewat menu:</p>
              <p className="font-semibold mt-1"><span className="bg-white border border-gray-200 rounded px-1.5 py-0.5">Akun / Riwayat Pesanan / Detail Pesanan</span></p>
            </div>
            <div className="flex flex-col gap-2.5">
              <button onClick={confirmLeave} className="w-full bg-rose-500 hover:bg-rose-600 text-white font-bold py-3 rounded-xl transition-colors shadow-sm">
                Ya, Keluar Halaman (saya akan upload nanti)
              </button>
              <button onClick={cancelLeave} className="w-full border border-gray-200 font-semibold text-slate-800 hover:bg-white py-3 rounded-xl transition-colors">
                Tetap di Halaman & Upload Bukti Sekarang
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
