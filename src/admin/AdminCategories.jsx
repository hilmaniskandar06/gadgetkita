import { useState, useRef } from 'react'
import { Plus, Trash2, Edit2, X } from 'lucide-react'
import AdminShell from './AdminShell'
import { useCategories } from '../context/CategoriesContext'
import { useProducts } from '../context/ProductsContext'
import { useToast } from '../context/ToastContext'
import { resizeImage } from '../utils/image'

export default function AdminCategories() {
  const { categories, loading, addCategory, updateCategory, removeCategory } = useCategories()
  const { products } = useProducts()
  const { addToast } = useToast()

  const [isEdit, setIsEdit] = useState(false)
  const [oldName, setOldName] = useState('')
  const [form, setForm] = useState({ name: '', image: '', textColor: '#ffffff' })
  const [error, setError] = useState('')
  const fileRef = useRef(null)

  function reset() {
    setForm({ name: '', image: '', textColor: '#ffffff' })
    setIsEdit(false)
    setOldName('')
    setError('')
  }

  async function handleFileChange(e) {
    const file = e.target.files[0]
    if (!file) return
    if (!file.type.startsWith('image/')) return addToast('File harus berupa gambar', 'error')
    if (file.size > 5 * 1024 * 1024) {
      return addToast('Ukuran gambar maksimal 5MB', 'error')
    }
    try {
      const dataUrl = await resizeImage(file)
      setForm(s => ({ ...s, image: dataUrl }))
    } catch {
      addToast('Gagal memproses gambar', 'error')
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    try {
      if (isEdit) {
        await updateCategory(oldName, form)
        addToast('Kategori diperbarui')
      } else {
        await addCategory(form)
        addToast('Kategori ditambahkan')
      }
      reset()
    } catch (err) {
      if (err.name === 'QuotaExceededError' || err.message.includes('exceeded the quota')) {
        setError('Gagal menyimpan: Kuota penyimpanan peramban penuh. Coba hapus data lain atau gunakan gambar yang lebih kecil.')
      } else {
        setError(err.message)
      }
    }
  }

  function handleEdit(cat) {
    setForm(cat)
    setOldName(cat.name)
    setIsEdit(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function handleDelete(catName) {
    const inUse = products.some((p) => p.category === catName)
    if (inUse) {
      addToast(`Tidak bisa hapus "${catName}" — masih dipakai produk`, 'error')
      return
    }
    if (confirm(`Hapus kategori "${catName}"?`)) {
      await removeCategory(catName)
      addToast('Kategori dihapus')
      if (isEdit && oldName === catName) reset()
    }
  }

  return (
    <AdminShell title="Kelola Kategori">
      <div className="grid md:grid-cols-[1fr_300px] gap-8">
        <div>
          {loading ? (
            <p className="text-sm text-slate-600">Memuat...</p>
          ) : (
            <div className="bg-white border border-gray-200 rounded-xl divide-y divide-gray-100">
              {categories.map((c) => {
                const count = products.filter((p) => p.category === c.name).length
                return (
                  <div key={c.name} className="flex items-center justify-between p-4 hover:bg-white transition-colors">
                    <div className="flex items-center gap-4">
                      {c.image ? (
                        <div className="w-12 h-12 rounded bg-gray-100 flex items-center justify-center overflow-hidden shrink-0">
                          <img src={c.image} alt="" className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded bg-gray-100 border-2 border-dashed border-gray-200 shrink-0" />
                      )}
                      <div>
                        <div className="font-bold text-slate-900">{c.name}</div>
                        <div className="text-xs text-slate-500">{count} produk</div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleEdit(c)} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 text-slate-600 transition-colors" title="Edit">
                        <Edit2 size={14} />
                      </button>
                      <button onClick={() => handleDelete(c.name)} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-rose-50 text-rose-500 transition-colors" title="Hapus">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                )
              })}
              {categories.length === 0 && (
                <p className="px-4 py-6 text-sm text-slate-500 text-center">Belum ada kategori.</p>
              )}
            </div>
          )}
        </div>

        <div>
          <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-5 sticky top-24">
            <h3 className="font-bold text-lg mb-4">{isEdit ? 'Edit Kategori' : 'Tambah Kategori'}</h3>
            {error && <p className="text-xs text-rose-500 mb-4 bg-rose-50 p-2 rounded">{error}</p>}
            
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Nama Kategori</label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm(s => ({ ...s, name: e.target.value }))}
                  className="w-full bg-gray-50 border border-gray-200 px-3 py-2 text-sm outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Foto Background</label>
                <p className="text-[10px] text-slate-500 mb-2">Maks 5MB. Format: JPG/PNG/WEBP. Disarankan rasio 1:1 atau gambar persegi. (Otomatis dikecilkan)</p>
                {form.image ? (
                  <div className="relative w-full h-24 rounded-lg overflow-hidden group border border-gray-200 mb-2">
                    <img src={form.image} alt="" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity gap-2">
                      <button type="button" onClick={() => fileRef.current.click()} className="text-xs bg-white text-slate-900 px-2 py-1 rounded font-bold">Ganti</button>
                      <button type="button" onClick={() => setForm(s => ({ ...s, image: '' }))} className="text-xs bg-rose-500 text-white px-2 py-1 rounded font-bold">Hapus</button>
                    </div>
                  </div>
                ) : (
                  <button type="button" onClick={() => fileRef.current.click()} className="w-full h-24 border-2 border-dashed border-gray-200 rounded-lg text-xs font-semibold text-slate-500 hover:bg-white hover:text-slate-900 transition-colors mb-2">
                    + Pilih Foto
                  </button>
                )}
                <input type="file" accept="image/*" className="hidden" ref={fileRef} onChange={handleFileChange} />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Warna Teks</label>
                <div className="flex items-center gap-3">
                  <input type="color" value={form.textColor} onChange={e => setForm(s => ({ ...s, textColor: e.target.value }))} className="w-8 h-8 rounded cursor-pointer" />
                  <span className="text-xs font-mono">{form.textColor}</span>
                </div>
              </div>

              <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                <button type="submit" className="flex-1 bg-black hover:bg-gray-800 text-white font-bold py-2 transition-colors text-sm">
                  {isEdit ? 'Simpan' : 'Tambah'}
                </button>
                {isEdit && (
                  <button type="button" onClick={reset} className="px-3 bg-gray-100 hover:bg-gray-200 text-slate-900 rounded-lg transition-colors" title="Batal">
                    <X size={18} />
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </AdminShell>
  )
}
