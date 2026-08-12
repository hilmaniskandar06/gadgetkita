import { useState, useMemo } from 'react'
import { useParams, Link, Navigate, useNavigate } from 'react-router-dom'
import { Minus, Plus, Heart, Truck, ShieldCheck, Package, ChevronLeft, ChevronRight } from 'lucide-react'
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
  const { addItem } = useCart()
  const { toggle, isWishlisted } = useWishlist()
  const { addToast } = useToast()
  const { user } = useAuth()
  const navigate = useNavigate()

  const featured = useMemo(() => {
    return [...products].sort(() => 0.5 - Math.random()).slice(0, 4)
  }, [products])

  if (loading) {
    return <div className="max-w-7xl mx-auto px-5 py-24 text-center text-slate-500">Memuat produk...</div>
  }
  if (!product) return <Navigate to="/toko" replace />

  const wishlisted = isWishlisted(product.id)

  function handleAdd(e) {
    if (e && e.preventDefault) e.preventDefault()
    if (!product.inStock) return
    if (!user) return addToast('Silakan login terlebih dahulu', 'error')
    addItem(product.id, qty)
    addToast(`${qty}x ${product.name} ditambahkan ke keranjang`)
  }

  const images = product.images?.length > 0 ? product.images : (product.image ? [product.image] : [])
  const nextImg = () => setImgIdx((i) => (i + 1) % images.length)
  const prevImg = () => setImgIdx((i) => (i - 1 + images.length) % images.length)

  function handleBuyNow(e) {
    if (e && e.preventDefault) e.preventDefault()
    if (!product.inStock) return
    if (!user) return addToast('Silakan login terlebih dahulu', 'error')
    navigate('/checkout', { state: { directItem: { ...product, qty } } })
  }

  return (
    <div className="max-w-7xl mx-auto px-5 lg:px-8 py-10">
      {/* Breadcrumb */}
      <div className="text-xs text-slate-600 mb-6 flex gap-1.5">
        <Link to="/" className="hover:text-black">Beranda</Link> /
        <Link to={`/toko?category=${encodeURIComponent(product.category)}`} className="hover:text-black">{product.category}</Link> /
        <span className="text-black font-medium">{product.name}</span>
      </div>

      <div className="grid lg:grid-cols-2 gap-12">
        {/* Gambar */}
        <div>
          <div className="relative bg-gray-100 aspect-square flex items-center justify-center overflow-hidden border border-gray-200">
            {images.length > 0 ? (
              <img src={images[imgIdx]} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <div className="text-slate-500">Tidak ada gambar</div>
            )}

            {images.length > 1 && (
              <>
                <button onClick={prevImg} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white flex items-center justify-center shadow-sm text-slate-900 transition-colors border border-gray-200">
                  <ChevronLeft size={20} />
                </button>
                <button onClick={nextImg} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white flex items-center justify-center shadow-sm text-slate-900 transition-colors border border-gray-200">
                  <ChevronRight size={20} />
                </button>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {images.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setImgIdx(idx)}
                      className={`w-2 h-2 transition-all ${idx === imgIdx ? 'bg-black w-6' : 'bg-white/60 hover:bg-white'}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {images.length > 1 && (
            <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setImgIdx(idx)}
                  className={`relative w-20 h-20 overflow-hidden border-2 shrink-0 transition-colors ${idx === imgIdx ? 'border-black' : 'border-transparent opacity-60 hover:opacity-100'}`}
                >
                  <img src={img} alt="thumbnail" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info Produk */}
        <div>
          <span className="text-xs uppercase tracking-widest text-gray-500 font-bold">{product.category}</span>
          <h1 className="text-3xl md:text-4xl font-display font-bold mt-2 text-black">{product.name}</h1>

          <div className="flex items-baseline gap-3 mt-5 flex-wrap">
            {product.oldPrice && <span className="text-slate-500 line-through font-mono">{fmt(product.oldPrice)}</span>}
            <span className="text-xl md:text-2xl font-mono font-extrabold">{fmt(product.price)}</span>
            {Number(product.sold || 0) > 0 && (
              <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 bg-gray-100 text-gray-700 border border-gray-200">
                {Number(product.sold || 0).toLocaleString('id-ID')} Terjual
              </span>
            )}
          </div>

          <p className="text-sm md:text-base text-slate-700 leading-relaxed mt-5 max-w-lg">{product.shortDesc}</p>

          {/* Spesifikasi Gadget */}
          <div className="flex flex-col gap-2 mt-5 text-sm">
            {product.weight && (
              <div className="flex items-center gap-2 py-2 border-b border-gray-100">
                <span className="text-slate-500 w-32 shrink-0">Berat</span>
                <span className="font-semibold text-slate-900">{product.weight}</span>
              </div>
            )}
            {product.compatibility && (
              <div className="flex items-start gap-2 py-2 border-b border-gray-100">
                <span className="text-slate-500 w-32 shrink-0">Kompatibilitas</span>
                <span className="font-semibold text-slate-900">{product.compatibility}</span>
              </div>
            )}
            {product.connector && (
              <div className="flex items-center gap-2 py-2 border-b border-gray-100">
                <span className="text-slate-500 w-32 shrink-0">Konektor</span>
                <span className="font-semibold text-slate-900">{product.connector}</span>
              </div>
            )}
            {product.material && (
              <div className="flex items-center gap-2 py-2 border-b border-gray-100">
                <span className="text-slate-500 w-32 shrink-0">Bahan</span>
                <span className="font-semibold text-slate-900">{product.material}</span>
              </div>
            )}
            {product.color && (
              <div className="flex items-center gap-2 py-2 border-b border-gray-100">
                <span className="text-slate-500 w-32 shrink-0">Warna</span>
                <span className="font-semibold text-slate-900">{product.color}</span>
              </div>
            )}
            {product.contentVolume && (
              <div className="flex items-center gap-2 py-2 border-b border-gray-100">
                <span className="text-slate-500 w-32 shrink-0">Isi / Paket</span>
                <span className="font-semibold text-slate-900">{product.contentVolume}</span>
              </div>
            )}
            <div className="flex items-center gap-2 py-2">
              <span className="text-slate-500 w-32 shrink-0">Ketersediaan</span>
              <span className={`font-semibold ${product.inStock ? 'text-ok-500' : 'text-rose-500'}`}>
                {product.inStock ? '✓ Stok tersedia' : '✗ Stok habis'}
              </span>
            </div>
          </div>

          {/* Qty + Wishlist */}
          <div className="flex items-center gap-3 mt-8">
            <div className="flex items-center border-2 border-black">
              <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 transition-colors" aria-label="Kurangi jumlah">
                <Minus size={14} />
              </button>
              <span className="w-10 text-center font-mono font-bold">{qty}</span>
              <button type="button" onClick={() => setQty((q) => q + 1)} className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 transition-colors" aria-label="Tambah jumlah">
                <Plus size={14} />
              </button>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                if (!user) return addToast('Silakan login terlebih dahulu', 'error')
                toggle(product.id)
                addToast(wishlisted ? 'Dihapus dari wishlist' : 'Disimpan ke wishlist')
              }}
              aria-label="Simpan ke wishlist"
              className="w-12 h-12 border-2 border-gray-200 flex items-center justify-center hover:border-rose-500 shrink-0 transition-colors"
            >
              <Heart size={18} className={wishlisted ? 'fill-rose-500 text-rose-500' : ''} />
            </button>
          </div>

          {/* CTA Buttons */}
          <div className="flex gap-3 mt-4">
            <button
              onClick={handleAdd}
              disabled={!product.inStock}
              className="flex-1 bg-white border-2 border-black text-black font-bold py-3.5 hover:bg-gray-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed text-sm tracking-wide"
            >
              Tambah ke Keranjang
            </button>
            <button
              onClick={handleBuyNow}
              disabled={!product.inStock}
              className="flex-1 flex items-center justify-center gap-1.5 bg-black text-white font-bold py-3.5 hover:bg-gray-800 transition-colors disabled:opacity-30 disabled:cursor-not-allowed text-sm tracking-wide"
            >
              {product.inStock ? 'Beli Sekarang' : 'Stok Habis'}
            </button>
          </div>

          {/* Info tambahan */}
          <div className="flex flex-col gap-2 mt-6 text-sm text-slate-600 border-t border-gray-100 pt-6">
            <div className="flex items-center gap-2"><Truck size={15} className="text-slate-400 shrink-0" /> Pengiriman ke seluruh Indonesia, 1–3 hari kerja</div>
            <div className="flex items-center gap-2"><ShieldCheck size={15} className="text-slate-400 shrink-0" /> Garansi produk — retur jika rusak saat pengiriman</div>
            <div className="flex items-center gap-2"><Package size={15} className="text-slate-400 shrink-0" /> Dikemas aman dengan bubble wrap & kardus</div>
          </div>
        </div>
      </div>

      {/* Tab Deskripsi */}
      <div className="mt-14 border-b-2 border-black flex gap-8">
        {[{ id: 'desc', label: 'Deskripsi Produk' }, { id: 'shipping', label: 'Info Pengiriman' }].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`pb-3 text-sm font-semibold border-b-2 -mb-px transition-colors ${
              tab === t.id ? 'border-black text-black' : 'border-transparent text-slate-400'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="py-6 text-sm text-slate-700 leading-relaxed max-w-3xl">
        {tab === 'desc' && product.longDesc}
        {tab === 'shipping' && 'Pesanan diproses dalam 1×24 jam pada hari kerja. Dikemas aman dengan bubble wrap dan kardus. Pengiriman menggunakan mitra ekspedisi ke seluruh Indonesia — estimasi 1–3 hari untuk area Jawa dan 3–6 hari untuk luar Jawa.'}
      </div>

      {/* Produk Pilihan */}
      {featured.length > 0 && (
        <div className="mt-14">
          <div className="flex items-end justify-between mb-6">
            <h2 className="text-2xl font-display font-bold">Produk Lainnya</h2>
            <Link to="/toko" className="text-sm font-semibold text-black border-b border-black pb-0.5 hover:opacity-70 transition-opacity">
              Lihat semua
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {featured.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      )}
    </div>
  )
}
