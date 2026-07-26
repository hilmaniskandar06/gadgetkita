import { useState, useRef } from 'react'
import { Plus, Pencil, Trash2, Upload } from 'lucide-react'
import AdminShell from './AdminShell'
import { usePayments } from '../context/PaymentContext'
import { useToast } from '../context/ToastContext'

export default function AdminPayments() {
  const { payments, addPayment, updatePayment, deletePayment } = usePayments()
  const { addToast } = useToast()
  const [saving, setSaving] = useState(false)
  const [uploadingField, setUploadingField] = useState(null)
  
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState({ type: 'bank', name: '', account: '', accountName: '', logo: '', qr: '' })
  
  const logoInputRef = useRef(null)
  const qrInputRef = useRef(null)

  function handleEdit(p) {
    setEditingId(p.id)
    setForm({ type: p.type, name: p.name, account: p.account, accountName: p.accountName || '', logo: p.logo || '', qr: p.qr || '' })
  }

  function handleCancel() {
    if (saving) return
    setEditingId(null)
    setForm({ type: 'bank', name: '', account: '', accountName: '', logo: '', qr: '' })
    if (logoInputRef.current) logoInputRef.current.value = ''
    if (qrInputRef.current) qrInputRef.current.value = ''
  }

  async function handleImageUpload(e, field) {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) return addToast('Ukuran gambar maksimal 2MB', 'error')
    if (!file.type.startsWith('image/')) return addToast('Format harus gambar', 'error')

    setUploadingField(field)
    try {
      const { resizeImage } = await import('../utils/image')
      const { uploadImage } = await import('../services/storageService')
      const dataUrl = await resizeImage(file, field === 'qr' ? 800 : 400)
      const ext = dataUrl.startsWith('data:image/png') ? 'png' : 'jpg'
      const path = `payment-${field}-${Date.now()}.${ext}`
      const publicUrl = await uploadImage(dataUrl, path, 'public')
      setForm(f => ({ ...f, [field]: publicUrl }))
    } catch (err) {
      console.error(err)
      addToast('Gagal memproses gambar pembayaran', 'error')
    } finally {
      setUploadingField(null)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.name || !form.account || !form.accountName) {
      return addToast('Nama, Nomor Akun, dan Atas Nama wajib diisi', 'error')
    }
    if (uploadingField) {
      return addToast('Tunggu sampai upload gambar selesai', 'error')
    }
    setSaving(true)
    try {
      if (editingId) {
        await updatePayment(editingId, form)
        addToast('Metode pembayaran diperbarui')
      } else {
        await addPayment(form)
        addToast('Metode pembayaran ditambahkan')
      }
      handleCancel()
    } catch (err) {
      addToast(err.message || 'Gagal menyimpan pembayaran', 'error')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id) {
    if (!confirm('Hapus metode pembayaran ini?')) return
    try {
      await deletePayment(id)
      addToast('Metode pembayaran dihapus')
    } catch (err) {
      addToast(err.message || 'Gagal menghapus', 'error')
    }
  }

  return (
    <AdminShell title="Kelola Pembayaran">
      <div className="grid md:grid-cols-[340px_1fr] gap-6">
        <div className="bg-white border border-cream-300 rounded-xl p-5 h-fit">
          <h3 className="font-bold mb-4">{editingId ? 'Edit Metode Pembayaran' : 'Metode Pembayaran Baru'}</h3>
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div>
              <label className="block text-xs font-medium text-cacao-600 mb-1">Tipe</label>
              <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm">
                <option value="bank">Transfer Bank</option>
                <option value="ewallet">E-Wallet</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-cacao-600 mb-1">Nama (Bank/E-Wallet)</label>
              <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm" required placeholder="Contoh: BCA / GoPay" />
            </div>
            <div>
              <label className="block text-xs font-medium text-cacao-600 mb-1">Nomor Rekening/Akun</label>
              <input value={form.account} onChange={e => setForm({...form, account: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm" required placeholder="0987654321" />
            </div>
            <div>
              <label className="block text-xs font-medium text-cacao-600 mb-1">Atas Nama (A/N)</label>
              <input value={form.accountName} onChange={e => setForm({...form, accountName: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm" required placeholder="Kakao Kita" />
            </div>
            
            <div>
              <label className="block text-xs font-medium text-cacao-600 mb-1">Logo (Opsional)</label>
              <div className="flex items-center gap-3">
                {form.logo && <img src={form.logo} alt="Logo" className="w-10 h-10 object-contain bg-cream-100 rounded" />}
                <button
                  type="button"
                  disabled={!!uploadingField}
                  onClick={() => logoInputRef.current.click()}
                  className="flex items-center gap-1 text-xs border rounded px-2 py-1 hover:bg-cream-100 disabled:opacity-50"
                >
                  <Upload size={12} /> {uploadingField === 'logo' ? 'Uploading...' : 'Upload Logo'}
                </button>
                <input type="file" accept="image/*" className="hidden" ref={logoInputRef} onChange={e => handleImageUpload(e, 'logo')} />
              </div>
            </div>

            {form.type === 'ewallet' && (
              <div>
                <label className="block text-xs font-medium text-cacao-600 mb-1">QRIS Code (Wajib untuk E-Wallet)</label>
                <div className="flex flex-col gap-2">
                  {form.qr && <img src={form.qr} alt="QR" className="w-24 h-24 object-contain border rounded" />}
                  <button
                    type="button"
                    disabled={!!uploadingField}
                    onClick={() => qrInputRef.current.click()}
                    className="flex items-center gap-1 text-xs border rounded px-2 py-1 hover:bg-cream-100 w-fit disabled:opacity-50"
                  >
                    <Upload size={12} /> {uploadingField === 'qr' ? 'Uploading...' : 'Upload QR'}
                  </button>
                  <input type="file" accept="image/*" className="hidden" ref={qrInputRef} onChange={e => handleImageUpload(e, 'qr')} />
                </div>
              </div>
            )}

            <div className="flex gap-2 mt-2">
              <button
                type="submit"
                disabled={saving || !!uploadingField}
                className="flex-1 bg-gold-500 hover:bg-gold-400 font-bold py-2 rounded-lg text-sm transition-colors disabled:opacity-50"
              >
                {saving ? 'Menyimpan...' : editingId ? 'Simpan' : 'Tambah'}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={saving}
                  className="flex-1 border py-2 rounded-lg text-sm disabled:opacity-50"
                >
                  Batal
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="bg-white border border-cream-300 rounded-xl overflow-x-auto">
          <table className="w-full text-sm min-w-[500px]">
            <thead className="bg-cream-200 text-left text-cacao-700">
              <tr>
                <th className="px-4 py-3 font-semibold">Info</th>
                <th className="px-4 py-3 font-semibold">Tipe</th>
                <th className="px-4 py-3 font-semibold">Rekening/Akun</th>
                <th className="px-4 py-3 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {payments.map(p => (
                <tr key={p.id} className="border-t border-cream-200">
                  <td className="px-4 py-3 flex items-center gap-3">
                    <div className="w-10 h-10 bg-cream-100 flex items-center justify-center rounded">
                      {p.logo ? <img src={p.logo} alt="" className="w-full h-full object-contain" /> : p.name.charAt(0)}
                    </div>
                    <span className="font-bold">{p.name}</span>
                  </td>
                  <td className="px-4 py-3">{p.type === 'bank' ? 'Bank' : 'E-Wallet'}</td>
                  <td className="px-4 py-3">
                    <div className="font-mono text-cacao-600 font-bold">{p.account}</div>
                    <div className="text-xs text-cacao-500">A/N: {p.accountName}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => handleEdit(p)} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-cream-200"><Pencil size={14} /></button>
                      <button onClick={() => handleDelete(p.id)} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-rose-50 text-rose-500"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {payments.length === 0 && <tr><td colSpan={4} className="px-4 py-10 text-center text-cacao-500">Belum ada metode pembayaran</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </AdminShell>
  )
}
