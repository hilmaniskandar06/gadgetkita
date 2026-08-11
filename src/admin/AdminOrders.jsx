import { useState, useEffect, useRef } from 'react'
import { Eye, CheckCircle, XCircle, MoreVertical, Image as ImageIcon, Printer, Trash2 } from 'lucide-react'
import AdminShell from './AdminShell'
import { useToast } from '../context/ToastContext'
import { useNotifications } from '../context/NotificationContext'
import OrderSummaryCard from '../components/OrderSummaryCard'
import * as orderService from '../services/orderService'

const STATUS_LABELS = {
  belum_dibayar: { label: 'Belum Dibayar', class: 'bg-slate-100 text-slate-700' },
  menunggu_verifikasi: { label: 'Menunggu Verifikasi', class: 'bg-lime-100 text-lime-600' },
  diproses: { label: 'Diproses', class: 'bg-sky-100 text-sky-700' },
  dikirim: { label: 'Dikirim', class: 'bg-indigo-100 text-indigo-700' },
  selesai: { label: 'Selesai', class: 'bg-ok-100 text-ok-700' },
  dibatalkan: { label: 'Dibatalkan', class: 'bg-rose-100 text-rose-700' }
}

export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [viewProof, setViewProof] = useState(null)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [openDropdownId, setOpenDropdownId] = useState(null)
  const dropdownRef = useRef(null)
  
  // prompt for resi or cancel reason
  const [statusPrompt, setStatusPrompt] = useState(null)
  const [trackingNumber, setTrackingNumber] = useState('')
  const [cancelReasonType, setCancelReasonType] = useState('Stok habis')
  const [cancelReasonText, setCancelReasonText] = useState('')

  const { addToast } = useToast()
  const { addNotification } = useNotifications()

  useEffect(() => {
    loadOrders()
  }, [])

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpenDropdownId(null)
      }
    }
    if (openDropdownId) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [openDropdownId])

  async function loadOrders() {
    try {
      const data = await orderService.getAllOrders()
      setOrders(data)
    } catch (err) {
      console.error(err)
      addToast('Gagal memuat pesanan')
    }
  }

  function updateStatus(id, newStatus) {
    if (newStatus === 'dikirim' || newStatus === 'dibatalkan') {
      setStatusPrompt({ id, newStatus })
      setTrackingNumber('')
      setCancelReasonType('Stok habis')
      setCancelReasonText('')
      return
    }
    
    commitStatusUpdate(id, newStatus)
  }

  async function commitStatusUpdate(id, newStatus, extraData = {}) {
    try {
      await orderService.updateOrderStatus(id, newStatus, extraData)
      setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus, ...extraData } : o))
      addToast(`Status pesanan diperbarui menjadi ${STATUS_LABELS[newStatus]?.label || newStatus}`)
      
      // Send Notification
      const order = orders.find(o => o.id === id)
      if (order && order.userId) {
        if (newStatus === 'dikirim') {
          addNotification(order.userId, 'Pesanan Dikirim', `Pesanan ${id} Anda sedang dalam perjalanan. No. Resi: ${extraData.trackingNumber}`, `/pesanan/${id}`)
        } else if (newStatus === 'dibatalkan') {
          addNotification(order.userId, 'Pesanan Dibatalkan', `Pesanan ${id} dibatalkan. Alasan: ${extraData.cancelReason}`, `/pesanan/${id}`)
        } else if (newStatus === 'diproses') {
          addNotification(order.userId, 'Pesanan Diproses', `Hore! Pembayaran pesanan ${id} telah dikonfirmasi dan sedang diproses.`, `/pesanan/${id}`)
        }
      }
      
      setStatusPrompt(null)
    } catch (err) {
      console.error(err)
      addToast('Gagal memperbarui status')
    }
  }

  function handlePromptSubmit(e) {
    e.preventDefault()
    if (statusPrompt.newStatus === 'dikirim') {
      if (!trackingNumber) return addToast('Nomor resi wajib diisi', 'error')
      commitStatusUpdate(statusPrompt.id, 'dikirim', { trackingNumber })
    } else if (statusPrompt.newStatus === 'dibatalkan') {
      const reason = cancelReasonType === 'Lainnya' ? cancelReasonText : cancelReasonType
      if (!reason) return addToast('Alasan pembatalan wajib diisi', 'error')
      commitStatusUpdate(statusPrompt.id, 'dibatalkan', { cancelReason: reason })
    }
  }

  async function deleteOrder(id) {
    if (confirm('Hapus pesanan ini secara permanen?')) {
      try {
        await orderService.deleteOrder(id)
        setOpenDropdownId(null)
        await loadOrders()
        addToast('Pesanan dihapus')
      } catch (err) {
        console.error(err)
        addToast('Gagal menghapus pesanan')
      }
    }
  }

  return (
    <AdminShell title="Kelola Pesanan">
      <div className="bg-white border border-gray-200 rounded-xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-left text-slate-700">
            <tr>
              <th className="px-4 py-3 font-semibold">ID & Tanggal</th>
              <th className="px-4 py-3 font-semibold">Pelanggan</th>
              <th className="px-4 py-3 font-semibold">Total</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(o => {
              const status = o.status || 'belum_dibayar'
              const statusData = STATUS_LABELS[status] || STATUS_LABELS['belum_dibayar']
              
              return (
                <tr key={o.id} className="border-t border-gray-100">
                  <td className="px-4 py-3">
                    <div className="font-bold text-slate-900">{o.id}</div>
                    <div className="text-xs text-slate-500">{new Date(o.date).toLocaleDateString('id-ID')}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-900">{o.customer?.name}</div>
                    <div className="text-xs text-slate-500">{o.customer?.phone}</div>
                  </td>
                  <td className="px-4 py-3 font-mono font-semibold">
                    Rp{o.total?.toLocaleString('id-ID')}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${statusData.class}`}>
                      {statusData.label}
                    </span>
                    {o.paymentProof && (
                      <button onClick={() => setViewProof(o.paymentProof)} className="mt-2 text-xs flex items-center gap-1 text-lime-600 hover:text-lime-500 font-semibold">
                        <ImageIcon size={14} /> Bukti Transfer
                      </button>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <select 
                        value={status} 
                        onChange={(e) => updateStatus(o.id, e.target.value)}
                        className="text-xs border rounded-lg px-2 py-1.5 outline-none bg-white"
                      >
                        {Object.entries(STATUS_LABELS).map(([key, val]) => (
                          <option key={key} value={key}>{val.label}</option>
                        ))}
                      </select>
                      <button onClick={() => setSelectedOrder(o)} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-lime-50 text-lime-600" title="Lihat Detail">
                        <Eye size={14} />
                      </button>
                      <a href={`/invoice/${o.id}`} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100 text-slate-600" title="Cetak Invoice">
                        <Printer size={14} />
                      </a>
                      <div ref={openDropdownId === o.id ? dropdownRef : null} className="relative">
                        <button
                          onClick={() => setOpenDropdownId(openDropdownId === o.id ? null : o.id)}
                          className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-50 text-slate-500"
                          title="Menu"
                        >
                          <MoreVertical size={14} />
                        </button>
                        {openDropdownId === o.id && (
                          <div className="absolute right-0 top-full mt-1 bg-white border border-gray-100 rounded-lg shadow-lg z-40 min-w-[140px]">
                            <button
                              onClick={() => deleteOrder(o.id)}
                              className="w-full text-left px-4 py-2.5 text-sm text-rose-500 hover:bg-rose-50 rounded-lg flex items-center gap-2"
                            >
                              <Trash2 size={14} />
                              Hapus Pesanan
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              )
            })}
            {orders.length === 0 && <tr><td colSpan={5} className="px-4 py-10 text-center text-slate-500">Belum ada pesanan</td></tr>}
          </tbody>
        </table>
      </div>

      {viewProof && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 flex items-center justify-center p-5">
          <div className="bg-white rounded-xl overflow-hidden max-w-lg w-full">
            <div className="p-4 border-b flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-slate-900">Bukti Transfer</h3>
              <button onClick={() => setViewProof(null)} className="text-slate-500 hover:text-slate-900"><XCircle size={20} /></button>
            </div>
            <div className="p-5 flex justify-center">
              <img src={viewProof} alt="Bukti Transfer" className="max-w-full max-h-[70vh] rounded border" />
            </div>
          </div>
        </div>
      )}

      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 flex items-center justify-center p-5">
          <div className="bg-white rounded-xl overflow-hidden max-w-2xl w-full max-h-[90vh] flex flex-col">
            <div className="p-4 border-b flex justify-between items-center bg-gray-50 shrink-0">
              <h3 className="font-bold text-slate-900">Detail Pesanan: {selectedOrder.id}</h3>
              <button onClick={() => setSelectedOrder(null)} className="text-slate-500 hover:text-slate-900"><XCircle size={20} /></button>
            </div>
            <div className="p-5 overflow-y-auto">
              <OrderSummaryCard order={selectedOrder} />
            </div>
          </div>
        </div>
      )}

      {statusPrompt && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 flex items-center justify-center p-5">
          <div className="bg-white rounded-xl overflow-hidden max-w-md w-full">
            <div className="p-4 border-b flex justify-between items-center bg-gray-50 shrink-0">
              <h3 className="font-bold text-slate-900">
                {statusPrompt.newStatus === 'dikirim' ? 'Input Nomor Resi' : 'Alasan Pembatalan'}
              </h3>
              <button onClick={() => setStatusPrompt(null)} className="text-slate-500 hover:text-slate-900"><XCircle size={20} /></button>
            </div>
            <form onSubmit={handlePromptSubmit} className="p-5 flex flex-col gap-4">
              {statusPrompt.newStatus === 'dikirim' ? (
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-1">Nomor Resi Ekspedisi</label>
                  <input 
                    type="text" 
                    value={trackingNumber}
                    onChange={e => setTrackingNumber(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 outline-none focus:border-lime-500" 
                    placeholder="Contoh: JNT-123456789"
                    required
                  />
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-1">Pilih Alasan</label>
                    <select 
                      value={cancelReasonType}
                      onChange={e => setCancelReasonType(e.target.value)}
                      className="w-full border rounded-lg px-3 py-2 outline-none"
                    >
                      <option value="Stok habis">Stok habis</option>
                      <option value="Melewati batas waktu pembayaran">Melewati batas waktu pembayaran</option>
                      <option value="Alamat pengiriman di luar jangkauan">Alamat pengiriman di luar jangkauan</option>
                      <option value="Lainnya">Lainnya (Tulis manual)</option>
                    </select>
                  </div>
                  {cancelReasonType === 'Lainnya' && (
                    <div>
                      <label className="block text-sm font-medium text-slate-900 mb-1">Tulis Alasan Manual</label>
                      <textarea 
                        value={cancelReasonText}
                        onChange={e => setCancelReasonText(e.target.value)}
                        className="w-full border rounded-lg px-3 py-2 outline-none focus:border-lime-500 min-h-[80px]" 
                        placeholder="Tuliskan alasan spesifik..."
                        required
                      />
                    </div>
                  )}
                </>
              )}
              <div className="flex justify-end gap-2 mt-2">
                <button type="button" onClick={() => setStatusPrompt(null)} className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-gray-50 rounded-lg">Batal</button>
                <button type="submit" className="px-4 py-2 text-sm font-bold bg-lime-500 hover:bg-lime-400 text-slate-900 rounded-lg">
                  Simpan & Kirim Notif
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminShell>
  )
}
