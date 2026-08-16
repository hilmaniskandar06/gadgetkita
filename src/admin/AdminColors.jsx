import { useState } from 'react'
import { Plus, Trash2, Edit2, X, Palette, Check } from 'lucide-react'
import AdminShell from './AdminShell'
import { useColors } from '../context/ColorContext'
import { useProducts } from '../context/ProductsContext'
import { useToast } from '../context/ToastContext'

export default function AdminColors() {
  const { colors, loading, addColor, updateColor, removeColor } = useColors()
  const { products } = useProducts()
  const { addToast } = useToast()

  const [isEdit, setIsEdit] = useState(false)
  const [selectedId, setSelectedId] = useState(null)
  const [form, setForm] = useState({
    name: '',
    type: 'solid',
    hex1: '#000000',
    hex2: '#ffffff'
  })
  const [error, setError] = useState('')

  function reset() {
    setForm({
      name: '',
      type: 'solid',
      hex1: '#000000',
      hex2: '#ffffff'
    })
    setIsEdit(false)
    setSelectedId(null)
    setError('')
  }

  function handleEdit(color) {
    setIsEdit(true)
    setSelectedId(color.id)
    setForm({
      name: color.name,
      type: color.type || 'solid',
      hex1: color.hex1 || '#000000',
      hex2: color.hex2 || '#ffffff'
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!form.name.trim()) {
      setError('Nama warna tidak boleh kosong')
      return
    }
    if (!form.hex1.trim() || !form.hex1.startsWith('#')) {
      setError('Kode HEX warna 1 harus valid (contoh: #1E3A8A)')
      return
    }
    if (form.type === 'dual' && (!form.hex2?.trim() || !form.hex2.startsWith('#'))) {
      setError('Kode HEX warna 2 harus valid (contoh: #EF4444)')
      return
    }

    try {
      if (isEdit) {
        await updateColor(selectedId, form)
        addToast('Warna berhasil diperbarui')
      } else {
        await addColor(form)
        addToast('Warna berhasil ditambahkan')
      }
      reset()
    } catch (err) {
      setError(err.message || 'Gagal menyimpan warna')
    }
  }

  async function handleDelete(id, name) {
    if (!window.confirm(`Yakin ingin menghapus warna "${name}"?`)) return

    try {
      await removeColor(id)
      addToast('Warna berhasil dihapus')
      if (isEdit && selectedId === id) reset()
    } catch (err) {
      addToast(err.message || 'Gagal menghapus warna', 'error')
    }
  }

  // Helper render swatch
  const renderSwatch = (c, size = 'w-8 h-8') => {
    if (c.type === 'dual') {
      return (
        <div
          className={`${size} rounded-full border border-gray-300 shadow-inner shrink-0`}
          style={{
            background: `linear-gradient(135deg, ${c.hex1} 50%, ${c.hex2 || '#ffffff'} 50%)`
          }}
        />
      )
    }
    return (
      <div
        className={`${size} rounded-full border border-gray-300 shadow-inner shrink-0`}
        style={{ backgroundColor: c.hex1 }}
      />
    )
  }

  return (
    <AdminShell title="Kelola Warna Produk">
      <div className="grid lg:grid-cols-[380px_1fr] gap-8 items-start">
        {/* Form Tambah/Edit */}
        <div className="bg-white border border-gray-200 p-6 sticky top-24">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-extrabold text-base text-slate-900">
              {isEdit ? 'Edit Warna' : 'Tambah Warna Baru'}
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

          {/* Live Preview Box */}
          <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg mb-5 flex items-center gap-4">
            {renderSwatch(form, 'w-12 h-12')}
            <div>
              <div className="text-xs text-slate-500 font-semibold uppercase">Preview Tampilan Dot</div>
              <div className="font-bold text-sm text-slate-900">
                {form.name.trim() || 'Nama Warna'}
              </div>
              <div className="text-[11px] font-mono text-slate-600">
                {form.type === 'dual' ? `${form.hex1} / ${form.hex2}` : form.hex1}
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Nama Warna <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
                placeholder="Contoh: Midnight Blue, Hitam / Merah..."
                className="w-full bg-gray-50 border border-gray-200 px-3.5 py-2.5 text-sm outline-none focus:border-black transition-colors"
              />
            </div>

            {/* Tipe Warna */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Tipe Warna</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setForm((s) => ({ ...s, type: 'solid' }))}
                  className={`py-2 px-3 text-xs font-bold border transition-colors flex items-center justify-center gap-1.5 ${
                    form.type === 'solid' ? 'border-black bg-black text-white' : 'border-gray-200 bg-white text-slate-700 hover:bg-gray-50'
                  }`}
                >
                  {form.type === 'solid' && <Check size={14} />} Satu Warna (Solid)
                </button>
                <button
                  type="button"
                  onClick={() => setForm((s) => ({ ...s, type: 'dual' }))}
                  className={`py-2 px-3 text-xs font-bold border transition-colors flex items-center justify-center gap-1.5 ${
                    form.type === 'dual' ? 'border-black bg-black text-white' : 'border-gray-200 bg-white text-slate-700 hover:bg-gray-50'
                  }`}
                >
                  {form.type === 'dual' && <Check size={14} />} Kombinasi (Dual Tone)
                </button>
              </div>
            </div>

            {/* Input Warna 1 */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                {form.type === 'dual' ? 'Warna 1 (Sisi Kiri Atas)' : 'Kode Warna HEX'}
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={form.hex1}
                  onChange={(e) => setForm((s) => ({ ...s, hex1: e.target.value }))}
                  className="w-10 h-10 border border-gray-200 p-0.5 cursor-pointer shrink-0 bg-white"
                />
                <input
                  type="text"
                  required
                  value={form.hex1}
                  onChange={(e) => setForm((s) => ({ ...s, hex1: e.target.value }))}
                  placeholder="#000000"
                  className="w-full bg-gray-50 border border-gray-200 px-3.5 py-2 text-sm font-mono outline-none focus:border-black"
                />
              </div>
            </div>

            {/* Input Warna 2 (Hanya jika Dual Tone) */}
            {form.type === 'dual' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Warna 2 (Sisi Kanan Bawah)
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={form.hex2}
                    onChange={(e) => setForm((s) => ({ ...s, hex2: e.target.value }))}
                    className="w-10 h-10 border border-gray-200 p-0.5 cursor-pointer shrink-0 bg-white"
                  />
                  <input
                    type="text"
                    required
                    value={form.hex2}
                    onChange={(e) => setForm((s) => ({ ...s, hex2: e.target.value }))}
                    placeholder="#ffffff"
                    className="w-full bg-gray-50 border border-gray-200 px-3.5 py-2 text-sm font-mono outline-none focus:border-black"
                  />
                </div>
              </div>
            )}

            {error && <p className="text-xs text-rose-500 font-medium">{error}</p>}

            <button
              type="submit"
              className="w-full bg-black text-white font-bold py-2.5 text-sm hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 mt-2"
            >
              {isEdit ? <Edit2 size={15} /> : <Plus size={16} />}
              {isEdit ? 'Simpan Perubahan' : 'Tambah Warna'}
            </button>
          </form>
        </div>

        {/* Daftar Warna */}
        <div className="bg-white border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-extrabold text-base text-slate-900">
              Daftar Warna Produk ({colors.length})
            </h3>
          </div>

          {loading ? (
            <div className="py-12 text-center text-slate-400 text-sm">Memuat warna...</div>
          ) : colors.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-sm border-2 border-dashed border-gray-200">
              Belum ada data warna. Tambahkan warna pertama Anda!
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
              {colors.map((c) => {
                const active = isEdit && selectedId === c.id

                return (
                  <div
                    key={c.id}
                    className={`border p-4 flex items-center justify-between transition-colors ${
                      active ? 'border-black bg-gray-50 ring-1 ring-black' : 'border-gray-200 bg-white hover:border-gray-400'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {renderSwatch(c, 'w-9 h-9')}
                      <div>
                        <div className="font-bold text-sm text-slate-900">
                          {c.name}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          {c.type === 'dual' ? 'Dual Tone' : c.hex1}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleEdit(c)}
                        className="p-1.5 text-slate-600 hover:text-black hover:bg-gray-100 transition-colors"
                        title="Edit warna"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        onClick={() => handleDelete(c.id, c.name)}
                        className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors"
                        title="Hapus warna"
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
