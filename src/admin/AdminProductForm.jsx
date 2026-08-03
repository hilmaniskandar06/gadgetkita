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
  sold: 0,
  images: [],
  shortDesc: '',
  longDesc: '',
  weight: '',
  contentVolume: '',
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
      // 1. Upload new images
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
        <Link to="/admin" className="text-gold-600 font-semibold hover:underline">Kembali ke daftar produk</Link>
      </AdminShell>
    )
  }

  return (
    <AdminShell title={isEdit ? 'Edit Produk' : 'Tambah Produk'}>
      <form onSubmit={handleSubmit} className="grid lg:grid-cols-[1fr_280px] gap-8">
        <div className="bg-white border border-cream-300 rounded-xl p-6 flex flex-col gap-4">
          <TextField label="Nama Produk" value={form.name} onChange={(v) => update('name', v)} required />

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-cacao-600 mb-1.5">Kategori</label>
              {categories.length === 0 ? (
                <p className="text-xs text-rose-500 mt-1">
                  Belum ada kategori. <Link to="/admin/kategori" className="underline">Tambah dulu di sini.</Link>
                </p>
              ) : (
                <select
                  value={form.category}
                  onChange={(e) => update('category', e.target.value)}
                  className="w-full bg-cream-100 border border-cream-300 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-gold-500"
                >
                  {categories.map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
                </select>
              )}
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <TextField label="Berat Kemasan" value={form.weight} onChange={(v) => update('weight', v)} placeholder="mis. 80 g" />
              <TextField label="Isi / Volume" value={form.contentVolume} onChange={(v) => update('contentVolume', v)} placeholder="mis. 10 pcs atau 250ml" />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <TextField label="Harga (Rp)" type="number" value={form.price} onChange={(v) => update('price', v)} required />
            <TextField label="Harga Coret (opsional)" type="number" value={form.oldPrice} onChange={(v) => update('oldPrice', v)} />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <TextField label="Jumlah Terjual" type="number" min={0} value={form.sold} onChange={(v) => update('sold', v ? Number(v) : 0)} placeholder="mis. 120" />
            <div className="flex items-end">
              <label className="flex items-center gap-2 text-sm pb-2.5">
                <input type="checkbox" checked={form.inStock} onChange={(e) => update('inStock', e.target.checked)} className="accent-gold-500" />
                Stok tersedia
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-cacao-600 mb-1.5">Deskripsi Singkat</label>
            <input
              value={form.shortDesc}
              onChange={(e) => update('shortDesc', e.target.value)}
              required
              className="w-full bg-cream-100 border border-cream-300 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-gold-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-cacao-600 mb-1.5">Deskripsi Lengkap</label>
            <textarea
              rows={4}
              value={form.longDesc}
              onChange={(e) => update('longDesc', e.target.value)}
              required
              className="w-full bg-cream-100 border border-cream-300 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-gold-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-cacao-600 mb-1.5">Link Produk (opsional)</label>
            <input
              value={form.externalLink || ''}
              onChange={(e) => update('externalLink', e.target.value || null)}
              placeholder="https://..."
              className="w-full bg-cream-100 border border-cream-300 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-gold-500"
            />
          </div>
        </div>

        <div className="flex flex-col gap-5">
          <div className="bg-white border border-cream-300 rounded-xl p-6">
            <h3 className="font-bold text-sm mb-1">Gambar Produk</h3>
            <p className="text-[10px] text-cacao-500 mb-3">Maks 3 Gambar. Maks 2MB/gambar. Format: JPG/PNG/WEBP. Disarankan rasio 1:1 (persegi).</p>
            
            <div className="grid grid-cols-3 gap-3 mb-4">
              {form.images.map((img, idx) => (
                <div key={idx} className="relative aspect-square bg-cream-200 rounded-lg overflow-hidden border border-cream-300">
                  <img src={img} alt={`Gambar ${idx+1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => update('images', form.images.filter((_, i) => i !== idx))}
                    className="absolute top-1 right-1 w-6 h-6 rounded-full bg-white/90 flex items-center justify-center hover:bg-white text-rose-500"
                    title="Hapus gambar"
                  >
                    <X size={12} />
                  </button>
                  {idx === 0 && <span className="absolute bottom-1 left-1 bg-cacao-900 text-white text-[9px] px-1.5 py-0.5 rounded font-bold">UTAMA</span>}
                </div>
              ))}
              
              {form.images.length < 3 && (
                <div 
                  onClick={() => !uploading && fileInputRef.current?.click()}
                  className="aspect-square bg-cream-50 border-2 border-dashed border-cream-300 rounded-lg flex flex-col items-center justify-center text-cacao-400 cursor-pointer hover:bg-cream-100 transition-colors"
                >
                  <Upload size={20} className="mb-1" />
                  <span className="text-[10px] font-semibold">{uploading ? 'Memproses...' : 'Tambah'}</span>
                </div>
              )}
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
          </div>

          <div className="flex flex-col gap-2">
            <button
              disabled={saving || categories.length === 0}
              className="bg-gold-500 hover:bg-gold-400 text-cacao-900 font-bold py-3 rounded-full transition-colors disabled:opacity-50"
            >
              {saving ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan' : 'Tambah Produk'}
            </button>
            <Link to="/admin" className="text-center text-sm text-cacao-600 hover:text-cacao-900 py-2">
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
      <label className="block text-xs font-medium text-cacao-600 mb-1.5">{label}</label>
      <input
        type={type}
        required={required}
        value={value}
        placeholder={placeholder}
        step={step}
        min={min}
        max={max}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-cream-100 border border-cream-300 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-gold-500"
      />
    </div>
  )
}
