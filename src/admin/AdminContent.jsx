import { useEffect, useState, useRef } from 'react'
import AdminShell from './AdminShell'
import { useSiteContent } from '../context/SiteContentContext'
import { useToast } from '../context/ToastContext'
import { resizeImage } from '../utils/image'

const FIELDS = [
  { key: 'shopName', label: 'Nama Toko (Tampil di navigasi & footer)', type: 'input' },
  { key: 'heroEyebrow', label: 'Label kecil di atas judul hero', type: 'input' },
  { key: 'heroTitle', label: 'Judul Hero (halaman beranda)', type: 'textarea' },
  { key: 'heroSubtitle', label: 'Subjudul Hero', type: 'textarea' },
  { key: 'footerDescription', label: 'Deskripsi Singkat di Footer', type: 'textarea' },
  { key: 'appDownloadBannerText', label: 'Teks Banner Download Aplikasi', type: 'input' },
  { key: 'appDownloadLink', label: 'Link Download APK (GitHub Releases)', type: 'input' },
  { key: 'socialInstagram', label: 'Link Instagram', type: 'input' },
  { key: 'whatsappLink', label: 'Link WhatsApp', type: 'input' },
  { key: 'socialFacebook', label: 'Link Facebook', type: 'input' },
  { key: 'socialTiktok', label: 'Link TikTok', type: 'input' },
  { key: 'socialTwitter', label: 'Link Twitter/X', type: 'input' },
  { key: 'shippingFee', label: 'Ongkos Kirim (Rp)', type: 'number' },
  { key: 'serviceFee', label: 'Biaya Layanan (Rp)', type: 'number' },
]

export default function AdminContent() {
  const { content, loading, updateContent } = useSiteContent()
  const { addToast } = useToast()
  const [form, setForm] = useState(content)
  const [saving, setSaving] = useState(false)
  const fileRef = useRef(null)
  const logoDarkRef = useRef(null)
  const logoLightRef = useRef(null)
  const shopLogoRef = useRef(null)
  const brandLogoInputRef = useRef(null)
  const [brandLogoName, setBrandLogoName] = useState('')

  useEffect(() => {
    if (!loading) setForm(content)
  }, [loading]) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = { ...form }
      if ('shippingFee' in payload) payload.shippingFee = Number(payload.shippingFee)
      if ('serviceFee' in payload) payload.serviceFee = Number(payload.serviceFee)

      // Upload media
      const { uploadImage } = await import('../services/storageService')
      const extOf = (dataUrl) => dataUrl.startsWith('data:image/png') ? 'png'
        : dataUrl.startsWith('data:image/webp') ? 'webp'
        : 'jpg'
      
      if (payload.heroMedia && payload.heroMedia.startsWith('data:')) {
        const ext = payload.heroMediaType === 'video' ? 'mp4' : extOf(payload.heroMedia)
        payload.heroMedia = await uploadImage(payload.heroMedia, `site-hero-${Date.now()}.${ext}`, 'public')
      }
      
      if (payload.shopLogo && payload.shopLogo.startsWith('data:')) {
        payload.shopLogo = await uploadImage(payload.shopLogo, `site-logo-${Date.now()}.${extOf(payload.shopLogo)}`, 'public')
      }

      if (payload.logoDark && payload.logoDark.startsWith('data:')) {
        payload.logoDark = await uploadImage(payload.logoDark, `logo-dark-${Date.now()}.${extOf(payload.logoDark)}`, 'public')
      }

      if (payload.logoLight && payload.logoLight.startsWith('data:')) {
        payload.logoLight = await uploadImage(payload.logoLight, `logo-light-${Date.now()}.${extOf(payload.logoLight)}`, 'public')
      }

      await updateContent(payload)
      addToast('Konten situs diperbarui')
    } catch (err) {
      if (err.name === 'QuotaExceededError' || err.message.includes('exceeded the quota')) {
        addToast('Gagal: Kuota penyimpanan penuh. Gunakan ukuran file yang lebih kecil.', 'error')
      } else {
        addToast(err.message || 'Gagal memperbarui konten', 'error')
      }
    }
    setSaving(false)
  }

  async function handleFileChange(e) {
    const file = e.target.files[0]
    if (!file) return
    const isVideo = file.type.startsWith('video/')
    const maxSize = isVideo ? 100 * 1024 * 1024 : 10 * 1024 * 1024 // 100MB for video, 10MB for image
    
    if (file.size > maxSize) {
      return addToast(`Ukuran maksimal ${isVideo ? '100MB (video)' : '10MB (gambar)'}`, 'error')
    }
    
    setForm(s => ({ ...s, heroMediaType: isVideo ? 'video' : 'image' }))

    if (isVideo) {
      const reader = new FileReader()
      reader.onload = ev => setForm(s => ({ ...s, heroMedia: ev.target.result }))
      reader.readAsDataURL(file)
    } else {
      try {
        const dataUrl = await resizeImage(file, 1280) // 1280px max width for hero
        setForm(s => ({ ...s, heroMedia: dataUrl }))
      } catch {
        addToast('Gagal memproses gambar', 'error')
      }
    }
  }

  async function handleLogoChange(e) {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) return addToast('Ukuran maksimal 2MB', 'error')
    if (!file.type.startsWith('image/')) return addToast('Logo harus berupa gambar', 'error')
    try {
      const dataUrl = await resizeImage(file, 400) // 400px max width for logo
      setForm(s => ({ ...s, shopLogo: dataUrl }))
    } catch {
      addToast('Gagal memproses gambar logo', 'error')
    }
  }

  function makeLogoHandler(field, maxWidth = 400) {
    return async (e) => {
      const file = e.target.files[0]
      if (!file) return
      if (file.size > 2 * 1024 * 1024) return addToast('Ukuran maksimal 2MB', 'error')
      if (!file.type.startsWith('image/')) return addToast('Logo harus berupa gambar (PNG transparan disarankan)', 'error')
      try {
        const dataUrl = await resizeImage(file, maxWidth)
        setForm(s => ({ ...s, [field]: dataUrl }))
      } catch {
        addToast('Gagal memproses gambar logo', 'error')
      }
    }
  }

  async function addBrandLogo() {
    const { uploadImage } = await import('../services/storageService')
    const extOf = (d) => d.startsWith('data:image/png') ? 'png' : d.startsWith('data:image/webp') ? 'webp' : 'jpg'
    const file = brandLogoInputRef.current?.files[0]
    let imageUrl = ''
    if (file) {
      if (file.size > 2 * 1024 * 1024) return addToast('Maks 2MB', 'error')
      try {
        const dataUrl = await resizeImage(file, 400)
        imageUrl = await uploadImage(dataUrl, `brand-logo-${Date.now()}.${extOf(dataUrl)}`, 'public')
      } catch { return addToast('Gagal upload logo', 'error') }
    }
    if (!brandLogoName.trim() && !imageUrl) return addToast('Isi nama brand atau pilih gambar logo', 'error')
    const newLogo = { id: Date.now().toString(), name: brandLogoName.trim(), imageUrl }
    const updated = { ...form, brandLogos: [...(form.brandLogos || []), newLogo] }
    setForm(updated)
    setBrandLogoName('')
    if (brandLogoInputRef.current) brandLogoInputRef.current.value = ''
    try {
      await updateContent(updated)
      addToast('Logo brand ditambahkan')
    } catch (err) { addToast(err.message || 'Gagal menyimpan', 'error') }
  }

  async function removeBrandLogo(id) {
    const updated = { ...form, brandLogos: (form.brandLogos || []).filter((l) => l.id !== id) }
    setForm(updated)
    try {
      await updateContent(updated)
      addToast('Logo brand dihapus')
    } catch (err) { addToast(err.message || 'Gagal menyimpan', 'error') }
  }

  if (loading) {
    return (
      <AdminShell title="Kelola Konten Situs">
        <p className="text-sm text-slate-600">Memuat...</p>
      </AdminShell>
    )
  }

  return (
    <AdminShell title="Kelola Konten Situs">
      <form onSubmit={handleSubmit} className="max-w-2xl bg-white border border-gray-200 rounded-xl p-6 flex flex-col gap-5">
        {FIELDS.map((f) => (
          <div key={f.key}>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">{f.label}</label>
            {f.type === 'textarea' ? (
              <textarea
                rows={2}
                value={form[f.key] || ''}
                onChange={(e) => setForm((s) => ({ ...s, [f.key]: e.target.value }))}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-lime-500"
              />
            ) : (
              <input
                type={f.type === 'number' ? 'number' : 'text'}
                value={form[f.key] ?? (f.type === 'number' ? 0 : '')}
                onChange={(e) => setForm((s) => ({ ...s, [f.key]: e.target.value }))}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-lime-500"
              />
            )}
          </div>
        ))}
        
        <div className="pt-4 border-t border-gray-100">
          <label className="block text-xs font-medium text-slate-600 mb-1">Latar Belakang Hero (Gambar / Video)</label>
          <p className="text-[10px] text-slate-500 mb-3">Maks 10MB (gambar) / 100MB (video). Format: JPG/PNG/WEBP/MP4/WEBM. Disarankan rasio landscape (misal 16:9).</p>
          <div className="flex flex-col gap-3">
            {form.heroMedia ? (
              form.heroMediaType === 'video' ? (
                <video src={form.heroMedia} className="w-full max-w-sm rounded border object-cover h-40" autoPlay loop muted />
              ) : (
                <img src={form.heroMedia} className="w-full max-w-sm rounded border object-cover h-40" alt="Hero Background" />
              )
            ) : (
              <div className="w-full max-w-sm h-40 bg-gray-50 border-2 border-dashed border-gray-200 rounded flex items-center justify-center text-slate-500 text-sm">
                Belum ada media
              </div>
            )}
            <div className="flex gap-2 items-center">
              <input type="file" accept="image/*,video/mp4,video/webm" className="hidden" ref={fileRef} onChange={handleFileChange} />
              <button type="button" onClick={() => fileRef.current.click()} className="text-sm font-semibold border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-50">
                Pilih Media
              </button>
              {form.heroMedia && (
                <button type="button" onClick={() => setForm(s => ({ ...s, heroMedia: '', heroMediaType: 'image' }))} className="text-sm text-rose-500 font-semibold hover:text-rose-600">
                  Hapus
                </button>
              )}
            </div>
            <div className="mt-2">
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Tipe Render</label>
              <select value={form.heroMediaType || 'image'} onChange={e => setForm(s => ({ ...s, heroMediaType: e.target.value }))} className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none">
                <option value="image">Gambar (img)</option>
                <option value="video">Video (video autoPlay)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100">
          <h3 className="text-sm font-bold mb-1">Logo Toko</h3>
          <p className="text-[10px] text-slate-500 mb-4">Pisahkan logo berdasarkan warna latar belakang tempat penempatannya. Format PNG transparan sangat disarankan. Maks 2MB per file.</p>

          <div className="grid md:grid-cols-2 gap-5">
            <div className="border border-gray-200 rounded-lg p-4">
              <label className="block text-xs font-bold text-slate-700 mb-1">Logo (untuk Latar Terang)</label>
              <p className="text-[10px] text-slate-500 mb-2">Digunakan di: Header, Invoice, Halaman Login Admin</p>
              <div className="flex flex-col gap-3">
                <div className="h-20 bg-white rounded border flex items-center justify-center p-3">
                  {form.logoDark || form.shopLogo ? (
                    <img src={form.logoDark || form.shopLogo} className="h-full object-contain" alt="Preview Logo Gelap" />
                  ) : (
                    <span className="text-slate-500 text-xs">Logo belum ada</span>
                  )}
                </div>
                <div className="flex gap-2 items-center">
                  <input type="file" accept="image/png,image/webp,image/*" className="hidden" ref={logoDarkRef} onChange={makeLogoHandler('logoDark')} />
                  <button type="button" onClick={() => logoDarkRef.current.click()} className="text-sm font-semibold border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50">
                    Upload
                  </button>
                  {form.logoDark && (
                    <button type="button" onClick={() => setForm(s => ({ ...s, logoDark: '' }))} className="text-sm text-rose-500 font-semibold hover:text-rose-600">
                      Hapus
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <label className="block text-xs font-bold text-slate-700 mb-1">Logo (untuk Latar Gelap)</label>
              <p className="text-[10px] text-slate-500 mb-2">Digunakan di: Footer, Navbar Atas Admin</p>
              <div className="flex flex-col gap-3">
                <div className="h-20 bg-slate-900 rounded border flex items-center justify-center p-3">
                  {form.logoLight || form.shopLogo ? (
                    <img src={form.logoLight || form.shopLogo} className={`h-full object-contain ${form.logoLight ? '' : 'brightness-0 invert'}`} alt="Preview Logo Terang" />
                  ) : (
                    <span className="text-gray-400 text-xs">Logo belum ada</span>
                  )}
                </div>
                {!form.logoLight && form.shopLogo && (
                  <p className="text-[10px] text-rose-500">Masih pakai logo lama, otomatis di-invert. Upload logo putih khusus untuk hasil terbaik.</p>
                )}
                <div className="flex gap-2 items-center">
                  <input type="file" accept="image/png,image/webp,image/*" className="hidden" ref={logoLightRef} onChange={makeLogoHandler('logoLight')} />
                  <button type="button" onClick={() => logoLightRef.current.click()} className="text-sm font-semibold border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50">
                    Upload
                  </button>
                  {form.logoLight && (
                    <button type="button" onClick={() => setForm(s => ({ ...s, logoLight: '' }))} className="text-sm text-rose-500 font-semibold hover:text-rose-600">
                      Hapus
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          <details className="mt-4">
            <summary className="text-xs text-slate-500 cursor-pointer hover:text-slate-700">Logo Universal (Lama / Fallback)</summary>
            <div className="mt-3">
              <p className="text-[10px] text-slate-500 mb-3">Logo cadangan jika logo khusus di atas tidak diisi. Maks 2MB.</p>
              <div className="flex flex-col gap-3">
                {form.shopLogo ? (
                  <img src={form.shopLogo} className="h-16 w-auto object-contain bg-gray-100 rounded p-2" alt="Logo Universal" />
                ) : (
                  <div className="w-40 h-16 bg-gray-50 border-2 border-dashed border-gray-200 rounded flex items-center justify-center text-slate-500 text-xs">
                    Belum ada logo
                  </div>
                )}
                <div className="flex gap-2 items-center">
                  <input type="file" accept="image/*" className="hidden" ref={shopLogoRef} onChange={handleLogoChange} />
                  <button type="button" onClick={() => shopLogoRef.current.click()} className="text-sm font-semibold border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-50">
                    Pilih Logo
                  </button>
                  {form.shopLogo && (
                    <button type="button" onClick={() => setForm(s => ({ ...s, shopLogo: '' }))} className="text-sm text-rose-500 font-semibold hover:text-rose-600">
                      Hapus
                    </button>
                  )}
                </div>
              </div>
            </div>
          </details>
        </div>

        {/* ── Brand Logos ── */}
        <div className="pt-4 border-t border-gray-100">
          <h3 className="text-sm font-bold mb-1">Logo Brand Partner</h3>
          <p className="text-[10px] text-slate-500 mb-4">Ditampilkan sebagai ticker otomatis di halaman beranda. Upload gambar logo (opsional) + isi nama brand. Maks 2MB per logo.</p>

          {/* List existing logos */}
          {(form.brandLogos || []).length > 0 && (
            <div className="flex flex-wrap gap-3 mb-4">
              {(form.brandLogos || []).map((logo) => (
                <div key={logo.id} className="flex items-center gap-2 bg-slate-900 text-white px-3 py-2 rounded-xl text-sm">
                  {logo.imageUrl && (
                    <img src={logo.imageUrl} alt={logo.name} className="h-6 w-auto object-contain" />
                  )}
                  <span className="font-semibold text-xs uppercase tracking-widest">{logo.name || '—'}</span>
                  <button
                    type="button"
                    onClick={() => removeBrandLogo(logo.id)}
                    className="ml-1 text-white/40 hover:text-rose-400 transition-colors text-base leading-none"
                    aria-label="Hapus"
                  >×</button>
                </div>
              ))}
            </div>
          )}

          {/* Add new logo form */}
          <div className="flex flex-wrap gap-3 items-end p-4 bg-gray-50 rounded-xl border border-gray-200">
            <div className="flex-1 min-w-[140px]">
              <label className="block text-[10px] font-semibold text-slate-500 mb-1">Nama Brand</label>
              <input
                type="text"
                value={brandLogoName}
                onChange={(e) => setBrandLogoName(e.target.value)}
                placeholder="Contoh: NIKE"
                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-lime-500"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 mb-1">Gambar Logo (opsional)</label>
              <input ref={brandLogoInputRef} type="file" accept="image/*" className="block text-xs text-slate-600 file:mr-3 file:text-xs file:font-semibold file:border-0 file:bg-lime-500 file:text-slate-900 file:px-3 file:py-1.5 file:rounded-full file:cursor-pointer hover:file:bg-lime-400" />
            </div>
            <button
              type="button"
              onClick={addBrandLogo}
              className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-5 py-2 rounded-xl text-sm transition-colors"
            >
              + Tambah
            </button>
          </div>
        </div>

        <button
          disabled={saving}
          className="self-start bg-lime-500 hover:bg-lime-400 text-slate-900 font-bold px-6 py-3 rounded-full transition-colors disabled:opacity-50"
        >
          {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
        </button>
      </form>
    </AdminShell>
  )
}
