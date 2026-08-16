import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { Upload, X, Check, Info, Zap, Wifi, Shield, Sliders, ChevronDown } from 'lucide-react'
import AdminShell from './AdminShell'
import { useProducts } from '../context/ProductsContext'
import { useCategories } from '../context/CategoriesContext'
import { useBrands } from '../context/BrandContext'
import { useColors } from '../context/ColorContext'
import { useToast } from '../context/ToastContext'
import { resizeImage } from '../utils/image'

const emptyForm = {
  name: '',
  category: '',
  brand: '',
  price: '',
  oldPrice: '',
  inStock: true,
  isNew: false,
  sold: 0,
  images: [],
  colors: [],
  longDesc: '',
  weight: '',
  color: '',
  externalLink: null,
  specs: {
    batteryCapacity: '',
    powerOutput: '',
    batteryLife: '',
    storageCapacity: '',
    bluetoothVersion: '',
    interfacePort: '',
    dataTransferSpeed: '',
    audioSafetyFeatures: '',
    glassTypeHardness: '',
    glassThickness: '',
    protectionFeatures: '',
    waterproofRating: '',
    standType: '',
    maxHeightClamp: '',
    maxLoad: '',
    compatibility: '',
    connector: '',
    material: '',
    contentVolume: ''
  }
}

export default function AdminProductForm() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const { getById, addProduct, editProduct, loading } = useProducts()
  const { categories } = useCategories()
  const { brands } = useBrands()
  const { colors: globalColors } = useColors()
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
        let rawImages = existing.images || (existing.image ? [existing.image] : [])
        const normalizedImages = rawImages.map(img => {
          if (!img || img === '[object Object]') return null
          if (typeof img === 'string') {
            const url = img.split('#color=')[0]
            const colorName = img.includes('#color=') ? decodeURIComponent(img.split('#color=')[1]) : ''
            return { url, colorName }
          }
          if (typeof img === 'object') {
            const url = (img.url || '').split('#color=')[0]
            const colorName = img.colorName || (img.url?.includes('#color=') ? decodeURIComponent(img.url.split('#color=')[1]) : '')
            return { url, colorName }
          }
          return null
        }).filter(Boolean)

        setForm({
          ...emptyForm,
          ...existing,
          brand: existing.brand || '',
          colors: Array.isArray(existing.colors) ? existing.colors : [],
          images: normalizedImages,
          oldPrice: existing.oldPrice || '',
          specs: {
            ...emptyForm.specs,
            ...(existing.specs || {}),
            compatibility: existing.compatibility || existing.specs?.compatibility || '',
            connector: existing.connector || existing.specs?.connector || '',
            material: existing.material || existing.specs?.material || '',
            contentVolume: existing.contentVolume || existing.specs?.contentVolume || ''
          }
        })
      } else {
        setNotFound(true)
      }
    } else if (!isEdit) {
      if (categories.length && !form.category) {
        setForm((f) => ({ ...f, category: categories[0].name }))
      }
    }
  }, [isEdit, id, loading, categories])

  function update(key, value) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  function updateSpec(key, value) {
    setForm((f) => ({
      ...f,
      specs: {
        ...f.specs,
        [key]: value
      }
    }))
  }

  function toggleColor(colorItem) {
    const isSelected = form.colors.some(c => c.name === colorItem.name)
    if (isSelected) {
      const nextColors = form.colors.filter(c => c.name !== colorItem.name)
      update('colors', nextColors)
      update('color', nextColors.map(c => c.name).join(', '))
    } else {
      const nextColors = [...form.colors, colorItem]
      update('colors', nextColors)
      update('color', nextColors.map(c => c.name).join(', '))
    }
  }

  async function handleImageChange(e) {
    const files = Array.from(e.target.files || [])
    if (!files.length) return

    const remainingSlots = 10 - form.images.length
    if (remainingSlots <= 0) {
      addToast('Maksimal 10 gambar per produk', 'error')
      return
    }

    const filesToProcess = files.slice(0, remainingSlots)
    if (files.length > remainingSlots) {
      addToast(`Hanya ${remainingSlots} gambar pertama yang diproses (maksimal 10 gambar)`, 'info')
    }

    setUploading(true)
    try {
      const newImages = []
      for (const file of filesToProcess) {
        if (!file.type.startsWith('image/')) continue
        const dataUrl = await resizeImage(file, 1200)
        newImages.push({
          url: dataUrl,
          colorName: form.colors.length > 0 ? form.colors[0].name : ''
        })
      }
      update('images', [...form.images, ...newImages])
      addToast(`Berhasil memuat ${newImages.length} gambar`)
    } catch (err) {
      addToast(err.message || 'Gagal memproses gambar', 'error')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  function removeImage(index) {
    const nextImages = form.images.filter((_, idx) => idx !== index)
    update('images', nextImages)
  }

  function updateImageColor(index, colorName) {
    const nextImages = [...form.images]
    nextImages[index] = {
      ...nextImages[index],
      colorName
    }
    update('images', nextImages)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    try {
      const finalImages = []
      const { uploadImage } = await import('../services/storageService')

      for (let i = 0; i < form.images.length; i++) {
        const item = form.images[i]
        let imgUrl = typeof item === 'string' ? item : item.url
        const colorName = typeof item === 'object' ? item.colorName || '' : ''

        if (imgUrl && imgUrl.startsWith('data:')) {
          const ext = imgUrl.includes('image/png') ? 'png' : imgUrl.includes('image/webp') ? 'webp' : 'jpg'
          const fileName = `prod-${Date.now()}-${i}.${ext}`
          const publicUrl = await uploadImage(imgUrl, fileName, 'public')
          imgUrl = publicUrl
        }

        if (imgUrl && imgUrl !== '[object Object]') {
          const cleanUrl = imgUrl.split('#color=')[0]
          const stringEntry = colorName ? `${cleanUrl}#color=${encodeURIComponent(colorName)}` : cleanUrl
          finalImages.push(stringEntry)
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
      addToast('Gagal menyimpan produk: ' + err.message, 'error')
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

  const renderSwatch = (c, size = 'w-4 h-4') => {
    if (c.type === 'dual') {
      return (
        <span
          className={`${size} rounded-full border border-gray-300 shadow-inner shrink-0 inline-block`}
          style={{
            background: `linear-gradient(135deg, ${c.hex1} 50%, ${c.hex2 || '#ffffff'} 50%)`
          }}
        />
      )
    }
    return (
      <span
        className={`${size} rounded-full border border-gray-300 shadow-inner shrink-0 inline-block`}
        style={{ backgroundColor: c.hex1 }}
      />
    )
  }

  return (
    <AdminShell title={isEdit ? 'Edit Produk' : 'Tambah Produk'}>
      <form onSubmit={handleSubmit} className="grid lg:grid-cols-[1fr_320px] gap-8 items-start">
        {/* Kolom Utama */}
        <div className="bg-white border border-gray-200 p-6 flex flex-col gap-6">
          <TextField label="Nama Produk" value={form.name} onChange={(v) => update('name', v)} required placeholder="Contoh: Baseus 65W GaN Fast Charger 3-Port" />

          {/* Kategori & Brand Dropdown */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Kategori <span className="text-rose-500">*</span>
              </label>
              <select
                value={form.category}
                onChange={(e) => update('category', e.target.value)}
                required
                className="w-full bg-gray-50 border border-gray-200 px-3.5 py-2.5 text-sm outline-none focus:border-black transition-colors"
              >
                <option value="">Pilih Kategori</option>
                {categories.map((c) => (
                  <option key={c.name} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Brand / Merk
              </label>
              <select
                value={form.brand || ''}
                onChange={(e) => update('brand', e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 px-3.5 py-2.5 text-sm outline-none focus:border-black transition-colors"
              >
                <option value="">Pilih Brand (Opsional)</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.name}>{b.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Warna Dinamis Produk */}
          <div className="border-t border-gray-100 pt-5">
            <div className="flex items-center justify-between mb-2">
              <div>
                <label className="block text-xs font-bold text-slate-900">
                  Pilihan Warna Produk
                </label>
                <p className="text-[11px] text-slate-500">
                  Centang warna yang tersedia untuk produk ini.
                </p>
              </div>
              <Link to="/admin/warna" target="_blank" className="text-xs text-black font-bold hover:underline">
                + Kelola Master Warna
              </Link>
            </div>

            {globalColors.length === 0 ? (
              <div className="p-3 bg-gray-50 border border-dashed border-gray-200 text-xs text-slate-500">
                Belum ada master warna. Silakan tambahkan warna di menu <Link to="/admin/warna" className="font-bold underline">Kelola Warna</Link>.
              </div>
            ) : (
              <div className="flex flex-wrap gap-2 mt-3">
                {globalColors.map((c) => {
                  const isChecked = form.colors.some((item) => item.name === c.name)
                  return (
                    <button
                      type="button"
                      key={c.id}
                      onClick={() => toggleColor(c)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all ${
                        isChecked
                          ? 'border-black bg-black text-white shadow-sm'
                          : 'border-gray-200 bg-gray-50 text-slate-700 hover:border-gray-400'
                      }`}
                    >
                      {renderSwatch(c, 'w-3.5 h-3.5')}
                      <span>{c.name}</span>
                      {isChecked && <Check size={12} className="stroke-[3]" />}
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* Upload Foto Produk */}
          <div className="border-t border-gray-100 pt-5">
            <div className="flex items-center justify-between mb-1.5">
              <div>
                <label className="block text-xs font-bold text-slate-900">
                  Galeri Foto Produk ({form.images.length}/10)
                </label>
                <p className="text-[11px] text-slate-500">
                  Pilih banyak foto sekaligus. Hubungkan foto dengan varian warna untuk sinkronisasi otomatis.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-3">
              {form.images.map((img, idx) => {
                const imgUrl = (typeof img === 'string' ? img : img.url || '').split('#color=')[0]
                const colorTag = typeof img === 'object' ? img.colorName : (img.includes('#color=') ? decodeURIComponent(img.split('#color=')[1]) : '')

                return (
                  <div key={idx} className="relative bg-gray-50 border border-gray-200 flex flex-col overflow-hidden group">
                    <div className="aspect-square relative w-full overflow-hidden bg-gray-100 flex items-center justify-center">
                      <img
                        src={imgUrl}
                        alt={`Foto ${idx + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.opacity = '0.3'
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="absolute top-1 right-1 bg-rose-600 text-white p-1 rounded hover:bg-rose-700 shadow"
                        title="Hapus foto"
                      >
                        <X size={13} />
                      </button>
                      <span className="absolute bottom-1 left-1 bg-black/70 text-white text-[10px] px-1.5 py-0.5 font-mono">
                        #{idx + 1}
                      </span>
                    </div>

                    <div className="p-1.5 bg-white border-t border-gray-100">
                      <select
                        value={colorTag || ''}
                        onChange={(e) => updateImageColor(idx, e.target.value)}
                        className="w-full text-[11px] bg-gray-50 border border-gray-200 py-1 px-1.5 outline-none focus:border-black"
                      >
                        <option value="">Semua Warna</option>
                        {form.colors.map((c) => (
                          <option key={c.name} value={c.name}>Warna: {c.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )
              })}

              {form.images.length < 10 && (
                <button
                  type="button"
                  disabled={uploading}
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-square border-2 border-dashed border-gray-200 hover:border-black bg-gray-50 flex flex-col items-center justify-center p-4 transition-colors disabled:opacity-50"
                >
                  <Upload size={20} className="text-slate-400 mb-1" />
                  <span className="text-xs font-bold text-slate-700 text-center">
                    {uploading ? 'Memproses...' : '+ Pilih Foto'}
                  </span>
                  <span className="text-[10px] text-slate-400">Bisa pilih banyak</span>
                </button>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleImageChange}
            />
          </div>

          {/* Deskripsi Lengkap */}
          <div className="border-t border-gray-100 pt-5">
            <label className="block text-xs font-bold text-slate-900 mb-1">Deskripsi Lengkap Produk</label>
            <p className="text-[11px] text-slate-500 mb-2">Jelaskan keunggulan, fitur utama, dan rincian penggunaan produk.</p>
            <textarea
              rows={6}
              value={form.longDesc}
              onChange={(e) => update('longDesc', e.target.value)}
              placeholder="Rincian fitur, teknologi, dan keunggulan produk..."
              className="w-full bg-gray-50 border border-gray-200 px-3.5 py-2.5 text-sm outline-none focus:border-black transition-colors"
            />
          </div>

          {/* SPESIFIKASI GADGET LENGKAP DENGAN POPUP / TOOLTIP INFO */}
          <div className="border-t border-gray-100 pt-6">
            <div className="mb-4">
              <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Sliders size={16} /> Spesifikasi Teknis Produk
              </h3>
              <p className="text-[11px] text-slate-500">
                Isi field spesifikasi yang relevan dengan produk ini. Field yang dikosongkan otomatis tidak akan tampil pada halaman pembeli.
              </p>
            </div>

            <div className="space-y-6">
              {/* GROUP 1: DAYA, BATERAI & PENYIMPANAN */}
              <div className="bg-gray-50 border border-gray-200 p-4 rounded">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-1.5 text-amber-700">
                  <Zap size={14} /> 1. Daya, Baterai & Penyimpanan
                </h4>
                <div className="grid sm:grid-cols-2 gap-3.5">
                  <SpecField
                    label="Kapasitas Baterai"
                    value={form.specs.batteryCapacity}
                    onChange={(v) => updateSpec('batteryCapacity', v)}
                    placeholder="Contoh: 10.000 mAh / 500 mAh"
                    tooltip="Kapasitas total baterai dalam satuan mAh atau Wh. Contoh: 10.000 mAh, 500 mAh (Case) + 35 mAh (Earbud)"
                  />
                  <SpecField
                    label="Daya & Output"
                    value={form.specs.powerOutput}
                    onChange={(v) => updateSpec('powerOutput', v)}
                    placeholder="Contoh: 65W GaN, PD 3.0 / QC 4.0"
                    tooltip="Besaran watt pengisian daya dan protokol fast charging. Contoh: 65W GaN Fast Charging, PD 20W + QC 18W"
                  />
                  <SpecField
                    label="Daya Tahan & Waktu Cas"
                    value={form.specs.batteryLife}
                    onChange={(v) => updateSpec('batteryLife', v)}
                    placeholder="Contoh: Playtime 30 Jam, Cas 1.5 Jam"
                    tooltip="Estimasi waktu pakai baterai dan durasi pengisian hingga penuh. Contoh: Total Playtime 30 Jam, Waktu Cas 1.5 Jam"
                  />
                  <SpecField
                    label="Kapasitas Penyimpanan"
                    value={form.specs.storageCapacity}
                    onChange={(v) => updateSpec('storageCapacity', v)}
                    placeholder="Contoh: 128 GB, 512 GB, 1 TB"
                    tooltip="Untuk aksesoris storage seperti Flashdisk, Memory Card, atau External SSD. Contoh: 128 GB / 1 TB"
                  />
                </div>
              </div>

              {/* GROUP 2: KONEKTIVITAS, PORT & AUDIO */}
              <div className="bg-gray-50 border border-gray-200 p-4 rounded">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-1.5 text-blue-700">
                  <Wifi size={14} /> 2. Konektivitas, Port & Audio
                </h4>
                <div className="grid sm:grid-cols-2 gap-3.5">
                  <SpecField
                    label="Versi Bluetooth & Jangkauan"
                    value={form.specs.bluetoothVersion}
                    onChange={(v) => updateSpec('bluetoothVersion', v)}
                    placeholder="Contoh: Bluetooth 5.3, Jangkauan 10m"
                    tooltip="Versi teknologi Bluetooth nirkabel dan radius jangkauan sinyal. Contoh: Bluetooth 5.3 Low Latency, Jangkauan 10 Meter"
                  />
                  <SpecField
                    label="Tipe Antarmuka / Port"
                    value={form.specs.interfacePort}
                    onChange={(v) => updateSpec('interfacePort', v)}
                    placeholder="Contoh: USB-C ke Lightning, 2x USB-C"
                    tooltip="Jenis colokan atau port konektor yang tersedia. Contoh: USB Type-C to Lightning, 2x Type-C + 1x USB-A"
                  />
                  <SpecField
                    label="Kecepatan Transfer Data"
                    value={form.specs.dataTransferSpeed}
                    onChange={(v) => updateSpec('dataTransferSpeed', v)}
                    placeholder="Contoh: 480 Mbps / 10 Gbps (USB 3.2)"
                    tooltip="Kecepatan transmisi data kabel atau drive. Contoh: 480 Mbps (USB 2.0), 10 Gbps (USB 3.2 Gen 2)"
                  />
                  <SpecField
                    label="Fitur Audio & Keamanan"
                    value={form.specs.audioSafetyFeatures}
                    onChange={(v) => updateSpec('audioSafetyFeatures', v)}
                    placeholder="Contoh: ANC Noise Cancelling, Proteksi Arus"
                    tooltip="Fitur suara (ANC/ENC/Spatial Audio) atau sistem proteksi charger (Overcharge & Overheat Protection)"
                  />
                </div>
              </div>

              {/* GROUP 3: PROTEKSI, KACA & KETAHANAN */}
              <div className="bg-gray-50 border border-gray-200 p-4 rounded">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-1.5 text-emerald-700">
                  <Shield size={14} /> 3. Proteksi, Kaca & Ketahanan
                </h4>
                <div className="grid sm:grid-cols-2 gap-3.5">
                  <SpecField
                    label="Tipe Kaca & Level Kekerasan"
                    value={form.specs.glassTypeHardness}
                    onChange={(v) => updateSpec('glassTypeHardness', v)}
                    placeholder="Contoh: Tempered Glass 9H Hardness"
                    tooltip="Tipe kaca pelindung layar dan level kekerasan goresan. Contoh: 9H Hardness Tempered Glass, Corning Gorilla Glass"
                  />
                  <SpecField
                    label="Ketebalan Kaca"
                    value={form.specs.glassThickness}
                    onChange={(v) => updateSpec('glassThickness', v)}
                    placeholder="Contoh: 0.33mm Ultra-thin, 2.5D Edge"
                    tooltip="Ketebalan fisik kaca pelindung layar. Contoh: 0.33 mm Ultra-thin, 2.5D Curved Edge"
                  />
                  <SpecField
                    label="Fitur Proteksi & Material"
                    value={form.specs.protectionFeatures}
                    onChange={(v) => updateSpec('protectionFeatures', v)}
                    placeholder="Contoh: Anti-Spy, Oleophobic Coating"
                    tooltip="Lapisan khusus pelindung seperti Anti-Spy/Privacy, Oleophobic Anti-Fingerprint, Shockproof Airbag"
                  />
                  <SpecField
                    label="Ketahanan Air (Waterproof)"
                    value={form.specs.waterproofRating}
                    onChange={(v) => updateSpec('waterproofRating', v)}
                    placeholder="Contoh: IPX5 Sweatproof, IP68 Waterproof"
                    tooltip="Sertifikasi ketahanan air dan debu. Contoh: IPX5 Sweatproof (Tahan Keringat), IP68 Waterproof (Tahan Rendam 1.5m)"
                  />
                </div>
              </div>

              {/* GROUP 4: STAND, HOLDER & MOUNTING */}
              <div className="bg-gray-50 border border-gray-200 p-4 rounded">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-1.5 text-purple-700">
                  <Sliders size={14} /> 4. Stand, Holder & Dudukan
                </h4>
                <div className="grid sm:grid-cols-2 gap-3.5">
                  <SpecField
                    label="Tipe Stand / Mounting"
                    value={form.specs.standType}
                    onChange={(v) => updateSpec('standType', v)}
                    placeholder="Contoh: MagSafe Car Mount, Desktop Stand"
                    tooltip="Model mekanisme dudukan. Contoh: MagSafe Car Air Vent Mount, Desktop Stand 360° Rotation"
                  />
                  <SpecField
                    label="Tinggi Maksimum & Ukuran Clamp"
                    value={form.specs.maxHeightClamp}
                    onChange={(v) => updateSpec('maxHeightClamp', v)}
                    placeholder="Contoh: Tinggi 1.6m, Clamp 4.7 - 7.0 Inch"
                    tooltip="Jangkauan ketinggian tripod atau rentang bukaan penjepit HP/Tablet. Contoh: Tinggi Max 1.6m, Clamp HP 4.7 - 7.0 Inch"
                  />
                  <SpecField
                    label="Beban Maksimum"
                    value={form.specs.maxLoad}
                    onChange={(v) => updateSpec('maxLoad', v)}
                    placeholder="Contoh: Hingga 2.5 kg"
                    tooltip="Batas beban berat yang mampu ditopang stand/holder secara stabil. Contoh: Mampu menahan beban hingga 2.5 kg"
                  />
                  <SpecField
                    label="Kompatibilitas Tambahan"
                    value={form.specs.compatibility}
                    onChange={(v) => updateSpec('compatibility', v)}
                    placeholder="Contoh: iPhone 15 Pro, Samsung S24"
                    tooltip="Perangkat yang didukung. Contoh: iPhone 15 Series, Universal Android & Type-C Devices"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Kanan: Harga & Status */}
        <div className="flex flex-col gap-6 sticky top-24">
          <div className="bg-white border border-gray-200 p-6 flex flex-col gap-4">
            <h3 className="font-extrabold text-sm text-slate-900">Harga & Stok</h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Harga Jual (Rp) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                required
                min={0}
                value={form.price}
                onChange={(e) => update('price', e.target.value)}
                placeholder="0"
                className="w-full bg-gray-50 border border-gray-200 px-3.5 py-2.5 text-sm font-mono font-bold outline-none focus:border-black"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Harga Coret (Rp, Opsional)
              </label>
              <input
                type="number"
                min={0}
                value={form.oldPrice}
                onChange={(e) => update('oldPrice', e.target.value)}
                placeholder="0"
                className="w-full bg-gray-50 border border-gray-200 px-3.5 py-2.5 text-sm font-mono outline-none focus:border-black"
              />
            </div>

            <div className="pt-3 border-t border-gray-100 flex flex-col gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.inStock}
                  onChange={(e) => update('inStock', e.target.checked)}
                  className="accent-black w-4 h-4"
                />
                <span className="text-xs font-bold text-slate-800">Tersedia / Siap Kirim</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isNew}
                  onChange={(e) => update('isNew', e.target.checked)}
                  className="accent-black w-4 h-4"
                />
                <span className="text-xs font-bold text-slate-800">Tandai sebagai Produk Baru (Badge New)</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-black text-white font-bold py-3 text-sm hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
            >
              {saving ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan' : 'Terbitkan Produk'}
            </button>
          </div>
        </div>
      </form>
    </AdminShell>
  )
}

function TextField({ label, value, onChange, required, placeholder }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
      <input
        type="text"
        required={required}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-gray-50 border border-gray-200 px-3.5 py-2.5 text-sm outline-none focus:border-black transition-colors"
      />
    </div>
  )
}

// Reusable SpecField Component with Interactive Tooltip Popup
function SpecField({ label, value, onChange, placeholder, tooltip }) {
  const [showTooltip, setShowTooltip] = useState(false)

  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-1">
        <label className="text-[11px] font-bold text-slate-800">
          {label}
        </label>
        {tooltip && (
          <div className="relative">
            <button
              type="button"
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              onClick={() => setShowTooltip(!showTooltip)}
              className="text-slate-400 hover:text-black p-0.5"
              title="Informasi field"
            >
              <Info size={13} />
            </button>

            {/* Tooltip Popup */}
            {showTooltip && (
              <div className="absolute right-0 bottom-full mb-1.5 w-60 p-2.5 bg-black text-white text-[10px] leading-snug rounded shadow-xl z-30 font-medium pointer-events-none">
                <div className="font-bold text-amber-300 mb-0.5">Panduan Pengisian:</div>
                {tooltip}
                <div className="absolute top-full right-2 border-4 border-transparent border-t-black" />
              </div>
            )}
          </div>
        )}
      </div>

      <input
        type="text"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-white border border-gray-200 px-3 py-2 text-xs outline-none focus:border-black transition-colors"
      />
    </div>
  )
}
