import { useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import AdminShell from './AdminShell'
import { useVouchers } from '../context/VoucherContext'
import { useToast } from '../context/ToastContext'

export default function AdminVouchers() {
  const { vouchers, addVoucher, updateVoucher, deleteVoucher } = useVouchers()
  const { addToast } = useToast()
  
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState({ code: '', type: 'nominal', value: '', minOrder: '', expiryDate: '', usageLimit: '', maxDiscount: '' })

  function handleEdit(v) {
    setEditingId(v.id)
    setForm({
      code: v.code, type: v.type, value: v.value,
      minOrder: v.minOrder || '', expiryDate: v.expiryDate ? v.expiryDate.split('T')[0] : '', usageLimit: v.usageLimit || '', maxDiscount: v.maxDiscount || ''
    })
  }

  function handleCancel() {
    setEditingId(null)
    setForm({ code: '', type: 'nominal', value: '', minOrder: '', expiryDate: '', usageLimit: '', maxDiscount: '' })
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.code || !form.value) return addToast('Kode dan Nilai Diskon wajib diisi')
    
    const payload = {
      code: form.code.toUpperCase(),
      type: form.type,
      value: Number(form.value),
      minOrder: form.minOrder ? Number(form.minOrder) : null,
      expiryDate: form.expiryDate ? new Date(form.expiryDate).toISOString() : null,
      usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
      maxDiscount: form.maxDiscount ? Number(form.maxDiscount) : null
    }

    if (editingId) {
      updateVoucher(editingId, payload)
      addToast('Voucher diperbarui')
    } else {
      addVoucher(payload)
      addToast('Voucher ditambahkan')
    }
    handleCancel()
  }

  function handleDelete(id) {
    if (confirm('Hapus voucher ini?')) {
      deleteVoucher(id)
      addToast('Voucher dihapus')
    }
  }

  return (
    <AdminShell title="Kelola Voucher">
      <div className="grid md:grid-cols-[300px_1fr] gap-6">
        <div className="bg-white border border-gray-200 rounded-xl p-5 h-fit">
          <h3 className="font-bold mb-4">{editingId ? 'Edit Voucher' : 'Voucher Baru'}</h3>
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Kode Voucher</label>
              <input value={form.code} onChange={e => setForm({...form, code: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm" required />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Tipe Diskon</label>
              <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm">
                <option value="nominal">Nominal (Rp)</option>
                <option value="persentase">Persentase (%)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Nilai Diskon</label>
              <div className="relative">
                {form.type === 'nominal' && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-semibold">Rp</span>}
                <input
                  type="number"
                  value={form.value}
                  onChange={e => setForm({...form, value: e.target.value})}
                  className={`w-full border rounded-lg py-2 text-sm outline-none focus:border-lime-500 ${form.type === 'nominal' ? 'pl-9 pr-3' : 'pl-3 pr-8'}`}
                  max={form.type === 'persentase' ? 100 : undefined}
                  required
                />
                {form.type === 'persentase' && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-semibold">%</span>}
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Minimal Belanja (Opsional)</label>
              <input type="number" value={form.minOrder} onChange={e => setForm({...form, minOrder: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Maksimal Diskon (Opsional)</label>
              <input type="number" value={form.maxDiscount} onChange={e => setForm({...form, maxDiscount: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Kadaluarsa (Opsional)</label>
              <input type="date" value={form.expiryDate} onChange={e => setForm({...form, expiryDate: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Batas Penggunaan (Opsional)</label>
              <input type="number" value={form.usageLimit} onChange={e => setForm({...form, usageLimit: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div className="flex gap-2 mt-2">
              <button type="submit" className="flex-1 bg-lime-500 hover:bg-lime-400 font-bold py-2 rounded-lg text-sm">{editingId ? 'Simpan' : 'Tambah'}</button>
              {editingId && <button type="button" onClick={handleCancel} className="flex-1 border py-2 rounded-lg text-sm">Batal</button>}
            </div>
          </form>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 text-left text-slate-700">
              <tr>
                <th className="px-4 py-3 font-semibold">Kode</th>
                <th className="px-4 py-3 font-semibold">Diskon</th>
                <th className="px-4 py-3 font-semibold">Syarat</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {vouchers.map(v => (
                <tr key={v.id} className="border-t border-gray-100">
                  <td className="px-4 py-3 font-bold">{v.code}</td>
                  <td className="px-4 py-3">{v.type === 'nominal' ? `Rp${v.value.toLocaleString('id-ID')}` : `${v.value}%`}</td>
                  <td className="px-4 py-3 text-xs text-slate-600">
                    {v.minOrder && <div>Min: Rp{v.minOrder.toLocaleString('id-ID')}</div>}
                    {v.maxDiscount && <div>Max: Rp{v.maxDiscount.toLocaleString('id-ID')}</div>}
                    {v.expiryDate && <div>Exp: {new Date(v.expiryDate).toLocaleDateString('id-ID')}</div>}
                  </td>
                  <td className="px-4 py-3 text-xs">
                    {v.usageLimit ? `${v.used}/${v.usageLimit} Terpakai` : `${v.used} Terpakai`}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => handleEdit(v)} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100"><Pencil size={14} /></button>
                      <button onClick={() => handleDelete(v.id)} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-rose-50 text-rose-500"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {vouchers.length === 0 && <tr><td colSpan={5} className="px-4 py-10 text-center text-slate-500">Belum ada voucher</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </AdminShell>
  )
}
