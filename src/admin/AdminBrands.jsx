import { useState } from 'react'
import { Plus, Trash2, Edit2, X, Tag } from 'lucide-react'
import AdminShell from './AdminShell'
import { useBrands } from '../context/BrandContext'
import { useProducts } from '../context/ProductsContext'
import { useToast } from '../context/ToastContext'

export default function AdminBrands() {
  const { brands, loading, addBrand, updateBrand, removeBrand } = useBrands()
  const { products } = useProducts()
  const { addToast } = useToast()

  const [isEdit, setIsEdit] = useState(false)
  const [selectedId, setSelectedId] = useState(null)
  const [form, setForm] = useState({ name: '', logo: '' })
  const [error, setError] = useState('')

  function reset() {
    setForm({ name: '', logo: '' })
    setIsEdit(false)
    setSelectedId(null)
    setError('')
  }

  function handleEdit(brand) {
    setIsEdit(true)
    setSelectedId(brand.id)
    setForm({ name: brand.name, logo: brand.logo || '' })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!form.name.trim()) {
      setError('Nama brand tidak boleh kosong')
      return
    }

    try {
      if (isEdit) {
        await updateBrand(selectedId, form)
        addToast('Brand berhasil diperbarui')
      } else {
        await addBrand(form)
        addToast('Brand berhasil ditambahkan')
      }
      reset()
    } catch (err) {
      setError(err.message || 'Gagal menyimpan brand')
    }
  }

  async function handleDelete(id, name) {
    const usedCount = products.filter((p) => (p.brand || '').toLowerCase() === name.toLowerCase()).length
    const msg = usedCount > 0
      ? `Brand "${name}" sedang digunakan oleh ${usedCount} produk. Yakin ingin menghapus?`
      : `Yakin ingin menghapus brand "${name}"?`

    if (!window.confirm(msg)) return

    try {
      await removeBrand(id)
      addToast('Brand berhasil dihapus')
      if (isEdit && selectedId === id) reset()
    } catch (err) {
      addToast(err.message || 'Gagal menghapus brand', 'error')
    }
  }

  return (
    <AdminShell title="Kelola Brand / Merk">
      <div className="grid lg:grid-cols-[360px_1fr] gap-8 items-start">
        {/* Form Tambah/Edit */}
        <div className="bg-white border border-gray-200 p-6 sticky top-24">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-extrabold text-base text-slate-900">
              {isEdit ? 'Edit Brand' : 'Tambah Brand Baru'}
            </h3>
            {isEdit && (
              <button
                onClick={reset}
                className="text-xs text-slate-500 hover:text-black flex items-center gap-1 font-semibold"
              >
                <X size={14} /> Batal
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Nama Brand <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
                placeholder="Contoh: Baseus, Apple, Ugreen..."
                className="w-full bg-gray-50 border border-gray-200 px-3.5 py-2.5 text-sm outline-none focus:border-black transition-colors"
              />
            </div>

            {error && <p className="text-xs text-rose-500 font-medium">{error}</p>}

            <button
              type="submit"
              className="w-full bg-black text-white font-bold py-2.5 text-sm hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 mt-2"
            >
              {isEdit ? <Edit2 size={15} /> : <Plus size={16} />}
              {isEdit ? 'Simpan Perubahan' : 'Tambah Brand'}
            </button>
          </form>
        </div>

        {/* Daftar Brand */}
        <div className="bg-white border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-extrabold text-base text-slate-900">
              Daftar Brand ({brands.length})
            </h3>
          </div>

          {loading ? (
            <div className="py-12 text-center text-slate-400 text-sm">Memuat brand...</div>
          ) : brands.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-sm border-2 border-dashed border-gray-200">
              Belum ada data brand. Tambahkan brand pertama Anda!
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
              {brands.map((b) => {
                const count = products.filter((p) => (p.brand || '').toLowerCase() === b.name.toLowerCase()).length
                const active = isEdit && selectedId === b.id

                return (
                  <div
                    key={b.id}
                    className={`border p-4 flex items-center justify-between transition-colors ${
                      active ? 'border-black bg-gray-50 ring-1 ring-black' : 'border-gray-200 bg-white hover:border-gray-400'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                        <Tag size={14} className="text-slate-400" />
                        {b.name}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5 font-medium">
                        {count} Produk Terdaftar
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleEdit(b)}
                        className="p-1.5 text-slate-600 hover:text-black hover:bg-gray-100 transition-colors"
                        title="Edit brand"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        onClick={() => handleDelete(b.id, b.name)}
                        className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors"
                        title="Hapus brand"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </AdminShell>
  )
}
