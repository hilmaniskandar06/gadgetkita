import { useState, useMemo } from 'react'
import { useParams, Link, Navigate, useNavigate } from 'react-router-dom'
import { Minus, Plus, Heart, Truck, ShieldCheck, Zap, ChevronLeft, ChevronRight, Star } from 'lucide-react'
import ProductThumb from '../components/ProductThumb'
import ProductCard from '../components/ProductCard'
import RatingStars from '../components/RatingStars'
import { useProducts } from '../context/ProductsContext'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'
import { useToast } from '../context/ToastContext'

const fmt = (n) => 'Rp' + n.toLocaleString('id-ID')

export default function ProductDetail() {
  const { id } = useParams()
  const { products, getById, getRelated, loading } = useProducts()
  const product = getById(id)
  const [qty, setQty] = useState(1)
  const [tab, setTab] = useState('desc')
  const [imgIdx, setImgIdx] = useState(0)
  const [ratingFilter, setRatingFilter] = useState(0)
  const { addItem } = useCart()
  const { toggle, isWishlisted } = useWishlist()
  const { addToast } = useToast()
  const navigate = useNavigate()
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' })

  const featured = useMemo(() => {
    return [...products].sort(() => 0.5 - Math.random()).slice(0, 4)
  }, [products])

  if (loading) {
    return <div className="max-w-7xl mx-auto px-5 py-24 text-center text-cacao-500">Memuat produk...</div>
  }
  if (!product) return <Navigate to="/toko" replace />

  const wishlisted = isWishlisted(product.id)

  function handleAdd() {
    if (!product.inStock) return
    addItem(product.id, qty)
    addToast(`${qty}x ${product.name} ditambahkan ke keranjang`)
  }

  // Handle images
  const images = product.images?.length > 0 ? product.images : (product.image ? [product.image] : [])
  const nextImg = () => setImgIdx((i) => (i + 1) % images.length)
  const prevImg = () => setImgIdx((i) => (i - 1 + images.length) % images.length)

  // Reviews logic
  const allReviews = JSON.parse(localStorage.getItem('kk_reviews') || '[]').filter(r => r.productId === product.id)
  const avgRating = allReviews.length > 0 ? (allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length) : 0
  const reviewCount = allReviews.length > 0 ? allReviews.length : 0
  const filteredReviews = ratingFilter > 0 ? allReviews.filter(r => r.rating === ratingFilter) : allReviews

  const user = JSON.parse(sessionStorage.getItem('kk_auth_session'))

  function submitReview(e) {
    e.preventDefault()
    if (!user) return addToast('Silakan login terlebih dahulu', 'error')
    
    const saved = JSON.parse(localStorage.getItem('kk_reviews') || '[]')
    const newReview = {
      id: 'rev-' + Date.now(),
      productId: product.id,
      userId: user.id,
      userName: user.name,
      rating: reviewForm.rating,
      comment: reviewForm.comment,
      date: new Date().toISOString()
    }
    saved.push(newReview)
    localStorage.setItem('kk_reviews', JSON.stringify(saved))
    addToast('Ulasan berhasil dikirim')
    setReviewForm({ rating: 5, comment: '' })
  }

  function handleBuyNow() {
    if (!product.inStock) return
    navigate('/checkout', { state: { directItem: { ...product, qty } } })
  }

  return (
    <div className="max-w-7xl mx-auto px-5 lg:px-8 py-10">
      <div className="text-xs text-cacao-600 mb-6 flex gap-1.5">
        <Link to="/" className="hover:text-cacao-900">Beranda</Link> /
        <Link to={`/toko?category=${encodeURIComponent(product.category)}`} className="hover:text-cacao-900">{product.category}</Link> /
        <span className="text-cacao-900 font-medium">{product.name}</span>
      </div>

      <div className="grid lg:grid-cols-2 gap-12">
        <div>
          <div className="relative bg-cream-200 rounded-2xl aspect-square flex items-center justify-center overflow-hidden border border-cream-300">
            {images.length > 0 ? (
              <img src={images[imgIdx]} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <div className="text-cacao-400">Tidak ada gambar</div>
            )}
            
            {images.length > 1 && (
              <>
                <button onClick={prevImg} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 hover:bg-white flex items-center justify-center shadow-sm text-cacao-900 transition-colors">
                  <ChevronLeft size={20} />
                </button>
                <button onClick={nextImg} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 hover:bg-white flex items-center justify-center shadow-sm text-cacao-900 transition-colors">
                  <ChevronRight size={20} />
                </button>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {images.map((_, idx) => (
                    <button 
                      key={idx} 
                      onClick={() => setImgIdx(idx)}
                      className={`w-2.5 h-2.5 rounded-full transition-colors ${idx === imgIdx ? 'bg-gold-500 w-6' : 'bg-white/60 hover:bg-white'}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
          
          {images.length > 1 && (
            <div className="flex gap-3 mt-4 overflow-x-auto pb-2 scrollbar-hide">
              {images.map((img, idx) => (
                <button 
                  key={idx} 
                  onClick={() => setImgIdx(idx)}
                  className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 shrink-0 transition-colors ${idx === imgIdx ? 'border-gold-500' : 'border-transparent opacity-70 hover:opacity-100'}`}
                >
                  <img src={img} alt="thumbnail" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <span className="text-xs uppercase tracking-wide text-gold-600 font-bold">{product.category}</span>
          <h1 className="text-3xl md:text-4xl font-serif font-bold mt-2 text-cacao-900">{product.name}</h1>
          <div className="mt-3"><RatingStars rating={avgRating} reviews={reviewCount} size={16} /></div>

          <div className="flex items-baseline gap-3 mt-5">
            {product.oldPrice && <span className="text-cacao-500 line-through font-mono">{fmt(product.oldPrice)}</span>}
            <span className="text-xl md:text-2xl font-mono font-extrabold">{fmt(product.price)}</span>
          </div>

          <p className="text-sm md:text-base text-cacao-700 leading-relaxed mt-5 max-w-lg">{product.shortDesc}</p>

          <div className="flex items-center gap-4 mt-4 text-sm flex-wrap">
            <span className="text-cacao-600 border-r border-cream-300 pr-4">Berat: <strong className="text-cacao-900">{product.weight}</strong></span>
            {product.contentVolume && (
              <span className="text-cacao-600 border-r border-cream-300 pr-4">Isi: <strong className="text-cacao-900">{product.contentVolume}</strong></span>
            )}
            <span className={`font-semibold ${product.inStock ? 'text-ok-500' : 'text-rose-500'}`}>
              {product.inStock ? 'Stok tersedia' : 'Stok habis'}
            </span>
          </div>

          <div className="flex items-center gap-3 mt-8">
            <div className="flex items-center border border-cream-300 rounded-full">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="w-10 h-10 flex items-center justify-center" aria-label="Kurangi jumlah">
                <Minus size={14} />
              </button>
              <span className="w-10 text-center font-mono">{qty}</span>
              <button onClick={() => setQty((q) => q + 1)} className="w-10 h-10 flex items-center justify-center" aria-label="Tambah jumlah">
                <Plus size={14} />
              </button>
            </div>
            <button
              onClick={() => { toggle(product.id); addToast(wishlisted ? 'Dihapus dari wishlist' : 'Disimpan ke wishlist') }}
              aria-label="Simpan ke wishlist"
              className="w-12 h-12 rounded-full border border-cream-300 flex items-center justify-center hover:border-rose-500 shrink-0"
            >
              <Heart size={18} className={wishlisted ? 'fill-rose-500 text-rose-500' : ''} />
            </button>
          </div>

          <div className="flex gap-3 mt-3">
            <button
              onClick={handleAdd}
              disabled={!product.inStock}
              className="flex-1 bg-white border-2 border-cacao-900 text-cacao-900 font-bold py-3 rounded-full hover:bg-cream-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Tambah ke Keranjang
            </button>
            <button
              onClick={handleBuyNow}
              disabled={!product.inStock}
              className="flex-1 flex items-center justify-center gap-1.5 bg-cacao-900 text-white font-bold py-3 rounded-full hover:bg-cacao-800 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {product.inStock ? 'Beli Sekarang' : 'Stok Habis'}
            </button>
          </div>

          <div className="flex flex-col gap-3 mt-8 text-sm text-cacao-700">
            <div className="flex items-center gap-2"><Truck size={16} className="text-cacao-500" /> Pengiriman ke seluruh Indonesia, 1–3 hari kerja</div>
            <div className="flex items-center gap-2"><ShieldCheck size={16} className="text-cacao-500" /> Garansi kualitas — retur jika rusak saat pengiriman</div>
          </div>
        </div>
      </div>

      <div className="mt-14 border-b border-cream-300 flex gap-8">
        {[{ id: 'desc', label: 'Deskripsi' }, { id: 'shipping', label: 'Pengiriman' }, { id: 'reviews', label: 'Ulasan Pembeli' }].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`pb-3 text-sm font-semibold border-b-2 -mb-px transition-colors ${
              tab === t.id ? 'border-gold-500 text-cacao-900' : 'border-transparent text-cacao-500'
            }`}
          >
            {t.label} {t.id === 'reviews' && `(${reviewCount})`}
          </button>
        ))}
      </div>
      <div className="py-6 text-sm text-cacao-700 leading-relaxed max-w-3xl">
        {tab === 'desc' && product.longDesc}
        {tab === 'shipping' && 'Pesanan diproses dalam 1x24 jam pada hari kerja. Pengiriman menggunakan mitra ekspedisi ke seluruh Indonesia dengan estimasi 1–3 hari untuk area Jawa dan 3–6 hari untuk luar Jawa.'}
        {tab === 'reviews' && (
          <div className="flex flex-col md:flex-row gap-10">
            <div className="md:w-1/3 shrink-0">
              <div className="bg-cream-100 rounded-xl p-6 text-center">
                <div className="text-5xl font-black text-cacao-900">{Number(avgRating).toFixed(1)}</div>
                <div className="flex justify-center mt-2 text-gold-500"><RatingStars rating={avgRating} size={20} hideCount /></div>
                <div className="text-cacao-500 mt-2">Dari {reviewCount} ulasan</div>
                
                <div className="mt-6 flex flex-col gap-2">
                  {[5,4,3,2,1].map(star => {
                    const count = allReviews.filter(r => r.rating === star).length
                    const pct = allReviews.length ? (count / allReviews.length) * 100 : 0
                    return (
                      <button 
                        key={star} 
                        onClick={() => setRatingFilter(ratingFilter === star ? 0 : star)}
                        className={`flex items-center gap-2 text-xs hover:text-gold-600 transition-colors ${ratingFilter === star ? 'font-bold text-gold-600' : ''}`}
                      >
                        <span className="w-2">{star}</span>
                        <Star size={10} className="fill-gold-500 text-gold-500" />
                        <div className="flex-1 h-1.5 bg-cream-300 rounded-full overflow-hidden">
                          <div className="h-full bg-gold-500" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="w-4 text-right">{count}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
            
            <div className="md:w-2/3">
              {user ? (
                <form onSubmit={submitReview} className="bg-white border border-cream-300 rounded-xl p-5 mb-8">
                  <h4 className="font-bold text-cacao-900 mb-3">Tulis Ulasan Anda</h4>
                  <div className="flex gap-1 mb-3">
                    {[1,2,3,4,5].map(star => (
                      <button type="button" key={star} onClick={() => setReviewForm(f => ({ ...f, rating: star }))}>
                        <Star size={24} className={star <= reviewForm.rating ? 'fill-gold-500 text-gold-500' : 'text-cream-300'} />
                      </button>
                    ))}
                  </div>
                  <textarea 
                    required 
                    value={reviewForm.comment}
                    onChange={e => setReviewForm(f => ({ ...f, comment: e.target.value }))}
                    placeholder="Bagaimana kualitas produk ini?" 
                    className="w-full bg-cream-100 border border-cream-300 rounded-lg p-3 text-sm outline-none focus:border-gold-500 min-h-[80px]"
                  />
                  <button type="submit" className="mt-3 bg-cacao-900 hover:bg-cacao-800 text-white font-bold py-2 px-6 rounded-lg text-sm transition-colors">Kirim Ulasan</button>
                </form>
              ) : (
                <div className="bg-cream-100 rounded-xl p-5 mb-8 text-center text-sm border border-cream-300 border-dashed">
                  Silakan <Link to="/login" className="font-bold text-gold-600 hover:underline">Login</Link> untuk memberikan ulasan.
                </div>
              )}
              
              <div className="flex flex-col gap-6">
                {filteredReviews.length > 0 ? filteredReviews.map(r => (
                  <div key={r.id} className="border-b border-cream-200 pb-6 last:border-0 last:pb-0">
                    <div className="flex gap-3 mb-2">
                      <div className="w-10 h-10 rounded-full bg-cream-300 flex items-center justify-center font-bold text-cacao-600 shrink-0">
                        {r.userName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-cacao-900">{r.userName}</div>
                        <div className="text-[10px] text-cacao-500">
                          {new Date(r.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </div>
                      </div>
                    </div>
                    <div className="flex text-gold-500 mb-2"><RatingStars rating={r.rating} size={12} hideCount /></div>
                    <p className="text-cacao-700">{r.comment}</p>
                  </div>
                )) : (
                  <div className="text-center text-cacao-400 py-10">Belum ada ulasan{ratingFilter > 0 ? ` dengan ${ratingFilter} bintang` : ''}.</div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {featured.length > 0 && (
        <div className="mt-14">
          <div className="flex items-end justify-between mb-6">
            <h2 className="text-2xl font-serif font-bold">Produk Pilihan</h2>
            <Link to="/toko" className="text-sm font-semibold text-gold-600 hover:underline">
              Lihat semua
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {featured.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      )}
    </div>
  )
}
