import { useState, useEffect } from 'react'
import { Users, Edit2, Info, X } from 'lucide-react'
import AdminShell from './AdminShell'
import { useToast } from '../context/ToastContext'
import { supabase } from '../config/supabase'

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [showDetail, setShowDetail] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState({ name: '', phone: '' })
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  
  const { addToast } = useToast()

  useEffect(() => {
    loadCustomers()
  }, [])

  async function loadCustomers() {
    setLoading(true)
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
      
    if (error) {
      addToast('Gagal memuat pelanggan: ' + error.message, 'error')
    } else {
      setCustomers(data || [])
    }
    setLoading(false)
  }

  async function handleSave(e) {
    e.preventDefault()
    if (editingId) {
      const { error } = await supabase
        .from('profiles')
        .update({ name: form.name, phone: form.phone })
        .eq('id', editingId)
        
      if (error) {
        addToast('Gagal: ' + error.message, 'error')
      } else {
        setCustomers(customers.map(c => c.id === editingId ? { ...c, name: form.name, phone: form.phone } : c))
        addToast('Data pelanggan diperbarui')
        setShowModal(false)
      }
    }
  }

  function openEdit(c) {
    setForm({ name: c.name || '', phone: c.phone || '' })
    setEditingId(c.id)
    setShowModal(true)
  }

  const filteredCustomers = customers.filter(c => {
    return (c.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
           (c.email || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
           (c.phone || '').includes(searchTerm)
  })

  return (
    <AdminShell title="Kelola Pelanggan">
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <input 
          type="text" 
          placeholder="Cari nama, email, atau telepon..." 
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="flex-1 px-4 py-2 rounded-lg border border-gray-200 outline-none focus:border-slate-500"
        />
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-left text-slate-700">
            <tr>
              <th className="px-4 py-3 font-semibold">Pelanggan</th>
              <th className="px-4 py-3 font-semibold">Kontak</th>
              <th className="px-4 py-3 font-semibold">Bergabung</th>
              <th className="px-4 py-3 font-semibold text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="px-4 py-10 text-center text-slate-500">Memuat data...</td></tr>
            ) : filteredCustomers.map(c => (
              <tr key={c.id} className="border-t border-gray-100">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-slate-500">
                      <Users size={18} />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">{c.name || 'User'}</div>
                      <div className="text-xs text-slate-500 font-mono">{c.id.split('-')[0]}...</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-col gap-1">
                    <span className="font-medium text-slate-900">{c.email}</span>
                    <span className="text-xs text-slate-500">{c.phone || '-'}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-col gap-1">
                    <span>{new Date(c.created_at).toLocaleDateString('id-ID')}</span>
                    <span className="text-xs text-slate-500 capitalize">{c.role}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => setShowDetail(c)} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 text-slate-600" title="Lihat Detail">
                      <Info size={14} />
                    </button>
                    <button onClick={() => openEdit(c)} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 text-slate-600" title="Edit Akun">
                      <Edit2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!loading && filteredCustomers.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-slate-500">Tidak ada pelanggan yang cocok</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center px-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-extrabold text-xl">Edit Profil Pelanggan</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-500 hover:text-slate-900"><X size={20} /></button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Nama Lengkap</label>
                <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:border-lime-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Telepon</label>
                <input required type="tel" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:border-lime-500 outline-none" />
              </div>
              <p className="text-xs text-slate-500 text-center">Password dan Email hanya bisa diubah oleh pelanggan itu sendiri demi keamanan.</p>
              <button type="submit" className="w-full bg-lime-500 hover:bg-lime-400 text-slate-900 font-bold py-2 rounded-lg mt-2">
                Simpan
              </button>
            </form>
          </div>
        </div>
      )}

      {showDetail && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center px-4" onClick={() => setShowDetail(null)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-extrabold text-xl">Detail Pelanggan</h3>
              <button onClick={() => setShowDetail(null)} className="text-slate-500 hover:text-slate-900"><X size={20} /></button>
            </div>
            <div className="space-y-3 text-sm">
              <div>
                <div className="text-xs font-semibold text-slate-500">ID Pelanggan</div>
                <div className="font-mono text-[10px] break-all">{showDetail.id}</div>
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-500">Nama</div>
                <div className="font-bold text-base">{showDetail.name || 'User'}</div>
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-500">Email</div>
                <div>{showDetail.email}</div>
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-500">Telepon</div>
                <div>{showDetail.phone || '-'}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  )
}
