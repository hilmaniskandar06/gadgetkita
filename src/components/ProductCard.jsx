import { Link, useNavigate } from 'react-router-dom'
import { Heart, Plus, Zap } from 'lucide-react'
import ProductThumb from './ProductThumb'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'
import { useToast } from '../context/ToastContext'
import { useAuth } from '../context/AuthContext'

const fmt = (n) => 'Rp' + n.toLocaleString('id-ID')

export default function ProductCard({ product }) {
  const { toggle, isWishlisted } = useWishlist()
  const { addItem } = useCart()
  const { addToast } = useToast()
  const { user } = useAuth()
  const navigate = useNavigate()
  const wishlisted = isWishlisted(product.id)

  const discount = product.oldPrice
    ? Math.round(100 - (product.price / product.oldPrice) * 100)
    : null

  function handleAdd(e) {
    e.preventDefault()
    e.stopPropagation()
    if (!product.inStock) return
    if (!user) return addToast('Silakan login terlebih dahulu', 'error')
    addItem(product.id, 1)
    addToast(`${product.name} ditambahkan ke keranjang`)
  }

  function handleBuyNow(e) {
    e.preventDefault()
    e.stopPropagation()
    if (!product.inStock) return
    if (!user) return addToast('Silakan login terlebih dahulu', 'error')
    navigate('/checkout', { state: { directItem: { ...product, qty: 1 } } })
  }

  function handleWishlist(e) {
    e.preventDefault()
    e.stopPropagation()
    if (!user) return addToast('Silakan login terlebih dahulu', 'error')
    toggle(product.id)
    addToast(wishlisted ? `${product.name} dihapus dari wishlist` : `${product.name} disimpan ke wishlist`)
  }

  return (
    <Link
      to={`/produk/${product.id}`}
      className="group flex flex-col bg-white border border-cream-300 rounded-xl overflow-hidden hover:border-gold-500 transition-colors"
    >
      <div className="relative h-32 sm:h-40 flex items-center justify-center bg-cream-200">
        {discount && (
          <span className="absolute top-3 left-3 z-10 bg-rose-500 text-white text-[11px] font-bold px-2 py-1 rounded-md">
            -{discount}%
          </span>
        )}
        {!product.inStock && (
          <span className="absolute top-3 left-3 z-10 bg-cacao-800 text-white text-[11px] font-bold px-2 py-1 rounded-md">
            Stok Habis
          </span>
        )}
        <button
          onClick={handleWishlist}
          aria-label="Simpan ke wishlist"
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white flex items-center justify-center border border-cream-300 hover:border-rose-500 transition-colors"
        >
          <Heart size={15} className={wishlisted ? 'fill-rose-500 text-rose-500' : 'text-cacao-600'} />
        </button>
        <img 
          src={product?.images?.[0] || product?.image || 'https://images.unsplash.com/photo-1548852336-d748f522b10a?auto=format&fit=crop&q=80&w=400'} 
          alt={product.name} 
          className="w-full h-full object-cover"
        />
      </div>

      <div className="flex flex-col gap-1 sm:gap-1.5 p-3 sm:p-4 flex-1">
        <div className="hidden md:block">
          <span className="text-[11px] uppercase tracking-wide text-gold-600 font-semibold">{product.category}</span>
        </div>
        <h3 className="font-bold text-xs md:text-sm text-cacao-900 leading-snug line-clamp-2">{product.name}</h3>
        <div className="hidden md:block">
          <p className="text-xs text-cacao-600 line-clamp-2">{product.shortDesc}</p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mt-auto pt-2 sm:pt-3 gap-2 sm:gap-0">
          <div className="flex flex-col">
            {product.oldPrice && (
              <span className="text-[10px] sm:text-xs text-cacao-500 line-through font-mono">{fmt(product.oldPrice)}</span>
            )}
            <div className="flex items-baseline gap-2">
              <span className="font-mono font-bold text-sm sm:text-base text-cacao-900">{fmt(product.price)}</span>
              {Number(product.sold || 0) > 0 && (
                <span className="text-[10px] sm:text-xs text-gold-700 font-bold">
                  {Number(product.sold || 0).toLocaleString('id-ID')}+ Terjual
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end">
            <button
              onClick={handleAdd}
              disabled={!product.inStock}
              aria-label="Tambah ke keranjang"
              title="Tambah ke Keranjang"
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white border border-cream-300 text-cacao-800 flex items-center justify-center hover:border-gold-500 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Plus size={16} />
            </button>
            <button
              onClick={handleBuyNow}
              disabled={!product.inStock}
              aria-label="Beli sekarang"
              title="Beli Sekarang"
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-cacao-800 text-white flex items-center justify-center hover:bg-cacao-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Zap size={14} className="fill-current" />
            </button>
          </div>
        </div>
      </div>
    </Link>
  )
}
