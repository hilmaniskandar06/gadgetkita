import { useState, useMemo, useEffect } from 'react'
import { useParams, Link, Navigate, useNavigate } from 'react-router-dom'
import { Minus, Plus, Heart, Truck, ShieldCheck, Package, ChevronLeft, ChevronRight, Check, Zap, Wifi, Shield, Sliders } from 'lucide-react'
import ProductThumb from '../components/ProductThumb'
import ProductCard from '../components/ProductCard'
import { useProducts } from '../context/ProductsContext'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'
import { useToast } from '../context/ToastContext'
import { useAuth } from '../context/AuthContext'

const fmt = (n) => 'Rp' + n.toLocaleString('id-ID')

export default function ProductDetail() {
  const { id } = useParams()
  const { products, getById, loading } = useProducts()
  const product = getById(id)
  const [qty, setQty] = useState(1)
  const [tab, setTab] = useState('desc')
  const [imgIdx, setImgIdx] = useState(0)
  const [selectedColor, setSelectedColor] = useState(null)
  const { addItem } = useCart()
  const { toggle, isWishlisted } = useWishlist()
  const { addToast } = useToast()
  const { user } = useAuth()
  const navigate = useNavigate()

  // Normalisasi images ke format { url, colorName }
  const images = useMemo(() => {
    const raw = product?.images?.length > 0 ? product.images : (product?.image ? [product.image] : [])
    return raw.map(img => {
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
  }, [product])

  // Inisialisasi default color jika ada
  useEffect(() => {
    if (product?.colors?.length > 0 && !selectedColor) {
      setSelectedColor(product.colors[0])
    }
  }, [product])

  function handleSelectColor(colorObj) {
    setSelectedColor(colorObj)
    const matchedIdx = images.findIndex(img => img.colorName && img.colorName.toLowerCase() === colorObj.name.toLowerCase())
    if (matchedIdx !== -1) {
      setImgIdx(matchedIdx)
    }
  }

  function handleSelectImage(idx) {
    setImgIdx(idx)
    const imgItem = images[idx]
    if (imgItem?.colorName && product?.colors?.length > 0) {
      const matchedColor = product.colors.find(c => c.name.toLowerCase() === imgItem.colorName.toLowerCase())
      if (matchedColor) {
        setSelectedColor(matchedColor)
      }
    }
  }

  const featured = useMemo(() => {
    return [...products].filter(p => p.id !== id).sort(() => 0.5 - Math.random()).slice(0, 4)
  }, [products, id])

  if (loading) {
    return <div className="max-w-7xl mx-auto px-5 py-24 text-center text-slate-500">Memuat produk...</div>
  }
  if (!product) return <Navigate to="/toko" replace />

  const wishlisted = isWishlisted(product.id)

  function validateColor() {
    if (product.colors && product.colors.length > 0 && !selectedColor) {
      addToast('Silakan pilih varian warna terlebih dahulu', 'error')
      return false
    }
    return true
  }

  function handleAdd(e) {
    if (e && e.preventDefault) e.preventDefault()
    if (!product.inStock) return
    if (!user) return addToast('Silakan login terlebih dahulu', 'error')
    if (!validateColor()) return

    const colorName = selectedColor ? selectedColor.name : (product.color || null)
    const activePhotoUrl = images[imgIdx]?.url || product.image
    addItem(product.id, qty, colorName, activePhotoUrl)
    addToast(`${qty}x ${product.name} (${colorName || 'Default'}) ditambahkan ke keranjang`)
  }

  function handleBuyNow(e) {
    if (e && e.preventDefault) e.preventDefault()
    if (!product.inStock) return
    if (!user) return addToast('Silakan login terlebih dahulu', 'error')
    if (!validateColor()) return

    const colorName = selectedColor ? selectedColor.name : (product.color || null)
    const activePhotoUrl = images[imgIdx]?.url || product.image
    navigate('/checkout', {
      state: {
        directItem: {
          ...product,
          qty,
          selectedColor: colorName,
          displayImage: activePhotoUrl
        }
      }
    })
  }

  const nextImg = () => {
    const nextIndex = (imgIdx + 1) % images.length
    handleSelectImage(nextIndex)
  }
  const prevImg = () => {
    const prevIndex = (imgIdx - 1 + images.length) % images.length
    handleSelectImage(prevIndex)
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
        style={{ backgroundColor: c.hex1 || '#000000' }}
      />
    )
  }

  // Kumpulkan list spesifikasi yang TIDAK KOSONG
  const specs = product.specs || {}
  const activeSpecsList = [
    { label: 'Brand', value: product.brand },
    { label: 'Kategori', value: product.category },
    { label: 'Pilihan Warna', value: product.color || (product.colors?.map(c => c.name).join(', ')) },
    { label: 'Kapasitas Baterai', value: specs.batteryCapacity },
    { label: 'Daya & Output', value: specs.powerOutput },
    { label: 'Daya Tahan & Waktu Cas', value: specs.batteryLife },
    { label: 'Kapasitas Penyimpanan', value: specs.storageCapacity },
    { label: 'Versi Bluetooth & Jangkauan', value: specs.bluetoothVersion },
    { label: 'Tipe Antarmuka / Port', value: specs.interfacePort || product.connector },
    { label: 'Kecepatan Transfer Data', value: specs.dataTransferSpeed },
    { label: 'Fitur Audio & Keamanan', value: specs.audioSafetyFeatures },
    { label: 'Tipe Kaca & Level Kekerasan', value: specs.glassTypeHardness },
    { label: 'Ketebalan Kaca', value: specs.glassThickness },
    { label: 'Fitur Proteksi & Material', value: specs.protectionFeatures || product.material },
    { label: 'Ketahanan Air (Waterproof)', value: specs.waterproofRating },
    { label: 'Tipe Stand / Mounting', value: specs.standType },
    { label: 'Tinggi Maksimum & Ukuran Clamp', value: specs.maxHeightClamp },
    { label: 'Beban Maksimum', value: specs.maxLoad },
    { label: 'Kompatibilitas Perangkat', value: specs.compatibility || product.compatibility },
    { label: 'Isi Paket / Kemasan', value: specs.contentVolume || product.contentVolume },
  ].filter(s => s.value && String(s.value).trim().length > 0)

  return (
    <div className="max-w-7xl mx-auto px-5 lg:px-8 py-10">
      {/* Breadcrumb */}
      <div className="text-xs text-slate-600 mb-6 flex gap-1.5 items-center">
        <Link to="/" className="hover:text-black">Beranda</Link> /
        {product.brand && (
          <>
            <Link to={`/toko?brand=${encodeURIComponent(product.brand)}`} className="hover:text-black font-semibold">{product.brand}</Link> /
          </>
        )}
        <Link to={`/toko?category=${encodeURIComponent(product.category)}`} className="hover:text-black">{product.category}</Link> /
        <span className="text-black font-medium line-clamp-1">{product.name}</span>
      </div>

      <div className="grid lg:grid-cols-2 gap-12">
        {/* Galeri Gambar */}
        <div>
          <div className="relative bg-gray-100 aspect-square flex items-center justify-center overflow-hidden border border-gray-200">
            {images.length > 0 && images[imgIdx]?.url ? (
              <img
                src={images[imgIdx].url}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.opacity = '0.3'
                }}
              />
            ) : (
              <div className="text-slate-500 text-sm">Tidak ada gambar</div>
            )}

            {images.length > 1 && (
              <>
                <button
                  onClick={prevImg}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 border border-black flex items-center justify-center hover:bg-black hover:text-white transition-colors"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  onClick={nextImg}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 border border-black flex items-center justify-center hover:bg-black hover:text-white transition-colors"
                >
                  <ChevronRight size={18} />
                </button>
              </>
            )}

            {images[imgIdx]?.colorName && (
              <span className="absolute bottom-3 left-3 bg-black/80 text-white text-xs px-2.5 py-1 font-semibold backdrop-blur-sm">
                Varian: {images[imgIdx].colorName}
              </span>
            )}
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-3 mt-3 overflow-x-auto pb-2">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectImage(idx)}
                  className={`w-16 h-16 shrink-0 border-2 overflow-hidden bg-gray-100 relative transition-all ${
                    imgIdx === idx ? 'border-black shadow-md scale-105' : 'border-gray-200 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                  {img.colorName && (
                    <span className="absolute bottom-0 inset-x-0 bg-black/70 text-white text-[8px] truncate px-0.5 text-center">
                      {img.colorName}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info Produk */}
        <div className="flex flex-col">
          {product.brand && (
            <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">
              {product.brand}
            </div>
          )}
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight mb-2">
            {product.name}
          </h1>

          <div className="flex items-baseline gap-3 mb-6">
            <span className="font-mono font-extrabold text-2xl sm:text-3xl text-slate-900">
              {fmt(product.price)}
            </span>
            {product.oldPrice && (
              <span className="font-mono text-sm sm:text-base text-slate-500 line-through">
                {fmt(product.oldPrice)}
              </span>
            )}
            {product.oldPrice && (
              <span className="bg-rose-500 text-white text-xs font-bold px-2 py-0.5">
                HEMAT {fmt(product.oldPrice - product.price)}
              </span>
            )}
          </div>

          {/* Pilihan Warna */}
          {product.colors && product.colors.length > 0 && (
            <div className="mb-6 border-t border-b border-gray-200 py-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Pilih Warna: <span className="text-black font-extrabold">{selectedColor?.name || 'Wajib Dipilih'}</span>
                </span>
                <span className="text-[11px] text-slate-500 font-medium">Klik warna untuk melihat foto</span>
              </div>

              <div className="flex flex-wrap gap-2.5">
                {product.colors.map((c, idx) => {
                  const isSelected = selectedColor?.name === c.name
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectColor(c)}
                      className={`flex items-center gap-2 px-3 py-2 border transition-all ${
                        isSelected
                          ? 'border-black bg-black text-white shadow-md'
                          : 'border-gray-300 bg-white text-slate-800 hover:border-gray-500'
                      }`}
                    >
                      {renderSwatch(c, 'w-4 h-4')}
                      <span className="text-xs font-bold">{c.name}</span>
                      {isSelected && <Check size={13} className="stroke-[3]" />}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Kuantitas & Tombol Beli */}
          <div className="flex flex-col gap-3 mb-6">
            <div className="flex items-center gap-4">
              <div className="text-xs font-bold text-slate-700">Jumlah:</div>
              <div className="flex items-center border border-gray-300 bg-white">
                <button
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  className="p-2 text-slate-600 hover:text-black"
                >
                  <Minus size={14} />
                </button>
                <span className="px-4 font-mono font-bold text-sm text-slate-900">{qty}</span>
                <button
                  onClick={() => setQty(qty + 1)}
                  className="p-2 text-slate-600 hover:text-black"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-2">
              <button
                onClick={handleAdd}
                disabled={!product.inStock}
                className="w-full bg-white border-2 border-black text-black font-extrabold py-3.5 px-4 text-sm hover:bg-gray-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                + Keranjang
              </button>
              <button
                onClick={handleBuyNow}
                disabled={!product.inStock}
                className="w-full bg-black border-2 border-black text-white font-extrabold py-3.5 px-4 text-sm hover:bg-gray-800 transition-colors disabled:opacity-30 disabled:cursor-not-allowed shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
              >
                Beli Sekarang
              </button>
            </div>
          </div>

          {/* Value Props Box */}
          <div className="grid grid-cols-3 gap-2 border border-gray-200 p-3 bg-gray-50 text-center text-[11px] font-semibold text-slate-700">
            <div className="flex flex-col items-center gap-1">
              <ShieldCheck size={16} className="text-black" />
              <span>100% Original</span>
            </div>
            <div className="flex flex-col items-center gap-1 border-x border-gray-200">
              <Truck size={16} className="text-black" />
              <span>Pengiriman Cepat</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <Package size={16} className="text-black" />
              <span>Packing Aman</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Deskripsi & Spesifikasi */}
      <div className="mt-14 border-t border-gray-200 pt-8">
        <div className="flex gap-6 border-b border-gray-200 mb-6">
          <button
            onClick={() => setTab('desc')}
            className={`pb-3 text-sm font-bold border-b-2 transition-colors ${
              tab === 'desc' ? 'border-black text-black' : 'border-transparent text-slate-500 hover:text-black'
            }`}
          >
            Deskripsi Produk
          </button>
          <button
            onClick={() => setTab('specs')}
            className={`pb-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
              tab === 'specs' ? 'border-black text-black' : 'border-transparent text-slate-500 hover:text-black'
            }`}
          >
            Spesifikasi Lengkap {activeSpecsList.length > 0 && `(${activeSpecsList.length})`}
          </button>
        </div>

        {tab === 'desc' ? (
          <div className="prose max-w-none text-slate-700 text-sm leading-relaxed whitespace-pre-line">
            {product.longDesc || product.description || 'Tidak ada rincian deskripsi untuk produk ini.'}
          </div>
        ) : (
          <div className="max-w-2xl">
            {activeSpecsList.length === 0 ? (
              <p className="text-xs text-slate-500 py-4">Belum ada data spesifikasi teknis tambahan untuk produk ini.</p>
            ) : (
              <table className="w-full text-xs text-left border border-gray-200">
                <tbody>
                  {activeSpecsList.map((spec, idx) => (
                    <tr key={idx} className={`border-b border-gray-100 ${idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                      <td className="py-2.5 px-4 font-bold text-slate-700 w-2/5">{spec.label}</td>
                      <td className="py-2.5 px-4 font-medium text-slate-900">{spec.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {/* Produk Rekomendasi */}
      {featured.length > 0 && (
        <div className="mt-16 pt-10 border-t border-gray-200">
          <h3 className="font-extrabold text-xl text-slate-900 mb-6">Produk Lainnya</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {featured.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
