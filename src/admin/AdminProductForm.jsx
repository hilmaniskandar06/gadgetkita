import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { Upload, X } from 'lucide-react'
import AdminShell from './AdminShell'
import { useProducts } from '../context/ProductsContext'
import { useCategories } from '../context/CategoriesContext'
import { useToast } from '../context/ToastContext'
import { resizeImage } from '../utils/image'

const emptyForm = {
  name: '',
  category: '',
  price: '',
  oldPrice: '',
  inStock: true,
  isNew: false,
  sold: 0,
  images: [],
  shortDesc: '',
  longDesc: '',
  weight: '',
  contentVolume: '',    // Isi / Paket (mis. 1 pcs, 2 pcs)
  compatibility: '',    // Kompatibilitas (mis. iPhone 15, Samsung S24)
  connector: '',        // Jenis konektor (USB-C, Lightning, Micro-USB)
  material: '',         // Bahan (mis. TPU, Silikon, Aluminium)
  color: '',            // Warna produk
  externalLink: null,
}

export default function AdminProductForm() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const { getById, addProduct, editProduct, loading } = useProducts()
  const { categories } = useCategories()
  const navigate = useNavigate()
  const { addToast } = useToast()
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [notFound, setNotFound] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef(null)

  useEffect(() => {
    if (isEdit && !loading) {
      const existing = getById(id)
      if (existing) {
        setForm({
          ...emptyForm,
          ...existing,
          images: existing.images || (existing.image ? [existing.image] : []),
          oldPrice: existing.oldPrice || ''
        })
      } else {
        setNotFound(true)
      }
    } else if (!isEdit && categories.length && !form.category) {
      setForm((f) => ({ ...f, category: categories[0].name }))
    }
  }, [isEdit, id, loading, categories]) // eslint-disable-line react-hooks/exhaustive-deps

  function update(key, value) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function handleImageChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      addToast('File harus berupa gambar')
      return
    }
    setUploading(true)
    try {
      if (form.images.length >= 3) {
        addToast('Maksimal 3 gambar', 'error')
        return
      }
      const dataUrl = await resizeImage(file)
      update('images', [...form.images, dataUrl])
    } catch (err) {
      if (err.name === 'QuotaExceededError' || err.message.includes('exceeded the quota')) {
        addToast('Gagal: Kuota penyimpanan penuh. Hapus produk/kategori lain.', 'error')
      } else {
        addToast(err.message, 'error')
      }
    } finally {
      setUploading(false)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    try {
      const finalImages = []
      for (let i = 0; i < form.images.length; i++) {
        const img = form.images[i]
        if (img.startsWith('data:')) {
          const { uploadImage } = await import('../services/storageService')
          const fileName = `${Date.now()}-${i}.jpg`
          const publicUrl = await uploadImage(img, fileName)
          finalImages.push(publicUrl)
        } else {
          finalImages.push(img)
        }
      }

      const payload = {
        ...form,
        images: finalImages,
        price: Number(form.price),
        oldPrice: form.oldPrice ? Number(form.oldPrice) : null,
        sold: Number(form.sold || 0),
      }

      if (isEdit) {
        await editProduct(id, payload)
        addToast('Produk berhasil diperbarui')
      } else {
        await addProduct(payload)
        addToast('Produk berhasil ditambahkan')
      }
      navigate('/admin')
    } catch (err) {
      if (err.name === 'QuotaExceededError' || err.message.includes('exceeded the quota')) {
        addToast('Gagal: Kuota penyimpanan penuh. Hapus produk/kategori lain.', 'error')
      } else {
        addToast(err.message, 'error')
      }
    } finally {
      setSaving(false)
    }
  }

  if (notFound) {
    return (
      <AdminShell title="Produk tidak ditemukan">
        <Link to="/admin" className="text-black font-semibold hover:underline">← Kembali ke daftar produk</Link>
      </AdminShell>
    )
  }

  return (
    <AdminShell title={isEdit ? 'Edit Produk' : 'Tambah Produk'}>
      <form onSubmit={handleSubmit} className="grid lg:grid-cols-[1fr_280px] gap-8">
        {/* Kolom Utama */}
        <div className="bg-white border border-gray-200 p-6 flex flex-col gap-5">
          <TextField label="Nama Produk" value={form.name} onChange={(v) => update('name', v)} required />

          {/* Kategori */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">Kategori</label>
            {categories.length === 0 ? (
              <p className="text-xs text-rose-500 mt-1">
                Belum ada kategori. <Link to="/admin/kategori" className="underline">Tambah dulu di sini.</Link>
              </p>
            ) : (
              <select
                value={form.category}
                onChange={(e) => update('category', e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 px-3.5 py-2.5 text-sm outline-none focus:border-black"
              >
                {categories.map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
              </select>
            )}
          </div>

          {/* Harga */}
          <div className="grid sm:grid-cols-2 gap-4">
            <TextField label="Harga (Rp)" type="number" value={form.price} onChange={(v) => update('price', v)} required />
            <TextField label="Harga Coret / Rp (opsional)" type="number" value={form.oldPrice} onChange={(v) => update('oldPrice', v)} />
          </div>

          <hr className="border-gray-100" />
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Spesifikasi Gadget</p>

          {/* Spesifikasi aksesoris gadget */}
          <div className="grid sm:grid-cols-2 gap-4">
            <TextField
              label="Kompatibilitas"
              value={form.compatibility}
              onChange={(v) => update('compatibility', v)}
              placeholder="mis. iPhone 14/15, Samsung S24, Universal"
            />
            <TextField
              label="Jenis Konektor"
              value={form.connector}
              onChange={(v) => update('connector', v)}
              placeholder="mis. USB-C, Lightning, Micro-USB, Jack 3.5mm"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <TextField
              label="Bahan"
              value={form.material}
              onChange={(v) => update('material', v)}
              placeholder="mis. TPU, Silikon, Aluminium, Kaca Tempered"
            />
            <TextField
              label="Warna"
              value={form.color}
              onChange={(v) => update('color', v)}
              placeholder="mis. Hitam, Bening, Navy Blue"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <TextField label="Berat Kemasan" value={form.weight} onChange={(v) => update('weight', v)} placeholder="mis. 80 g" />
            <TextField label="Isi / Paket" value={form.contentVolume} onChange={(v) => update('contentVolume', v)} placeholder="mis. 1 pcs, 2 pcs + kabel" />
          </div>

          <hr className="border-gray-100" />

          {/* Terjual & Status */}
          <div className="grid sm:grid-cols-2 gap-4">
            <TextField label="Jumlah Terjual" type="number" min={0} value={form.sold} onChange={(v) => update('sold', v ? Number(v) : 0)} placeholder="mis. 120" />
            <div className="flex items-end gap-5 pb-1">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.inStock} onChange={(e) => update('inStock', e.target.checked)} className="accent-black w-4 h-4" />
                Stok tersedia
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.isNew} onChange={(e) => update('isNew', e.target.checked)} className="accent-black w-4 h-4" />
                Produk Baru
              </label>
            </div>
          </div>

          {/* Deskripsi */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">Deskripsi Singkat</label>
            <input
              value={form.shortDesc}
              onChange={(e) => update('shortDesc', e.target.value)}
              required
              placeholder="Deskripsi 1 kalimat untuk preview produk"
              className="w-full bg-gray-50 border border-gray-200 px-3.5 py-2.5 text-sm outline-none focus:border-black"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">Deskripsi Lengkap</label>
            <textarea
              rows={4}
              value={form.longDesc}
              onChange={(e) => update('longDesc', e.target.value)}
              required
              placeholder="Deskripsi detail produk: fitur, keunggulan, cara pakai, dll."
              className="w-full bg-gray-50 border border-gray-200 px-3.5 py-2.5 text-sm outline-none focus:border-black resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">Link Produk Eksternal (opsional)</label>
            <input
              value={form.externalLink || ''}
              onChange={(e) => update('externalLink', e.target.value || null)}
              placeholder="https://..."
              className="w-full bg-gray-50 border border-gray-200 px-3.5 py-2.5 text-sm outline-none focus:border-black"
            />
          </div>
        </div>

        {/* Kolom Kanan */}
        <div className="flex flex-col gap-5">
          {/* Gambar */}
          <div className="bg-white border border-gray-200 p-6">
            <h3 className="font-bold text-sm mb-1 uppercase tracking-wide">Gambar Produk</h3>
            <p className="text-[10px] text-slate-500 mb-3">Maks 3 gambar. Maks 2MB/gambar. Format: JPG/PNG/WEBP. Disarankan rasio 1:1.</p>

            <div className="grid grid-cols-3 gap-2 mb-4">
              {form.images.map((img, idx) => (
                <div key={idx} className="relative aspect-square bg-gray-100 overflow-hidden border border-gray-200">
                  <img src={img} alt={`Gambar ${idx + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => update('images', form.images.filter((_, i) => i !== idx))}
                    className="absolute top-1 right-1 w-6 h-6 bg-white/90 flex items-center justify-center hover:bg-white text-rose-500"
                    title="Hapus gambar"
                  >
                    <X size={12} />
                  </button>
                  {idx === 0 && <span className="absolute bottom-1 left-1 bg-black text-white text-[9px] px-1.5 py-0.5 font-bold">UTAMA</span>}
                </div>
              ))}

              {form.images.length < 3 && (
                <div
                  onClick={() => !uploading && fileInputRef.current?.click()}
                  className="aspect-square bg-white border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-slate-400 cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <Upload size={20} className="mb-1" />
                  <span className="text-[10px] font-semibold">{uploading ? 'Memproses...' : 'Tambah'}</span>
                </div>
              )}
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
          </div>

          {/* Simpan */}
          <div className="flex flex-col gap-2">
            <button
              disabled={saving || categories.length === 0}
              className="bg-black hover:bg-gray-800 text-white font-bold py-3.5 transition-colors disabled:opacity-50 text-sm tracking-wide"
            >
              {saving ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan' : 'Tambah Produk'}
            </button>
            <Link to="/admin" className="text-center text-sm text-slate-500 hover:text-slate-900 py-2">
              Batal
            </Link>
          </div>
        </div>
      </form>
    </AdminShell>
  )
}

function TextField({ label, value, onChange, required, type = 'text', placeholder, step, min, max }) {
  return (
    <div>
      <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">{label}</label>
      <input
        type={type}
        required={required}
        value={value}
        placeholder={placeholder}
        step={step}
        min={min}
        max={max}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-gray-50 border border-gray-200 px-3.5 py-2.5 text-sm outline-none focus:border-black"
      />
    </div>
  )
}
