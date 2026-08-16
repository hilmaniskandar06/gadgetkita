import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useToast } from '../context/ToastContext'
import { useAuth } from '../context/AuthContext'

const fmt = (n) => 'Rp' + n.toLocaleString('id-ID')

export default function ProductCard({ product }) {
  const { addItem } = useCart()
  const { addToast } = useToast()
  const { user } = useAuth()

  const discount = product.oldPrice
    ? Math.round(100 - (product.price / product.oldPrice) * 100)
    : null

  function handleAdd(e) {
    e.preventDefault()
    e.stopPropagation()
    if (!product.inStock) return
    if (!user) return addToast('Silakan login terlebih dahulu', 'error')

    const defaultColor = (product.colors && product.colors.length > 0) ? product.colors[0].name : (product.color || null)
    addItem(product.id, 1, defaultColor)
    addToast(`${product.name} ditambahkan ke keranjang`)
  }

  let firstImage = product.images?.[0] || product.image
  if (typeof firstImage === 'object') firstImage = firstImage.url
  if (typeof firstImage === 'string') {
    if (firstImage === '[object Object]') firstImage = ''
    else firstImage = firstImage.split('#color=')[0]
  }

  return (
    <Link
      to={`/produk/${product.id}`}
      className="group flex flex-col bg-white border border-gray-200 overflow-hidden hover:border-black transition-colors"
    >
      <div className="relative h-32 sm:h-40 w-full overflow-hidden bg-gray-100 flex items-center justify-center">
        <div className="absolute top-0 left-0 z-10 flex flex-col gap-0">
          {discount && (
            <span className="bg-rose-500 text-white text-[11px] font-bold px-2 py-1 w-fit">
              -{discount}%
            </span>
          )}
          {product.isNew && (
            <span className="bg-black text-white text-[11px] font-bold px-2 py-1 w-fit">
              BARU
            </span>
          )}
        </div>

        {firstImage ? (
          <img
            src={firstImage}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.target.onerror = null
              e.target.style.display = 'none'
            }}
          />
        ) : (
          <div className="text-xs text-slate-400 font-semibold">No Image</div>
        )}

        {!product.inStock && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-[1px] flex items-center justify-center">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-rose-500 bg-white px-2 py-1 border border-rose-500">
              Habis
            </span>
          </div>
        )}
      </div>

      <div className="p-3 sm:p-4 flex flex-col flex-1 gap-1 sm:gap-2">
        <div className="flex items-center gap-1 text-[10px] sm:text-xs text-slate-500 font-semibold uppercase">
          {product.brand && <span className="text-black font-bold">{product.brand}</span>}
          {product.brand && <span>•</span>}
          <span>{product.category}</span>
        </div>

        <h3 className="font-bold text-xs sm:text-sm text-slate-900 line-clamp-2 leading-tight group-hover:text-black transition-colors">
          {product.name}
        </h3>

        {/* Warna Swatches Preview */}
        {product.colors && product.colors.length > 0 && (
          <div className="flex items-center gap-1 mt-0.5">
            {product.colors.slice(0, 4).map((c, idx) => (
              <span
                key={idx}
                className="w-2.5 h-2.5 rounded-full border border-gray-300 shadow-inner inline-block"
                style={{
                  background: c.type === 'dual'
                    ? `linear-gradient(135deg, ${c.hex1} 50%, ${c.hex2 || '#ffffff'} 50%)`
                    : (c.hex1 || '#000000')
                }}
                title={c.name}
              />
            ))}
            {product.colors.length > 4 && (
              <span className="text-[9px] text-slate-400 font-mono">+{product.colors.length - 4}</span>
            )}
          </div>
        )}

        <div className="flex items-end justify-between mt-auto pt-2 sm:pt-3">
          <div className="flex flex-col">
            {product.oldPrice && (
              <span className="text-[10px] sm:text-xs text-slate-500 line-through font-mono">
                {fmt(product.oldPrice)}
              </span>
            )}
            <div className="flex items-baseline gap-2">
              <span className="font-mono font-bold text-sm sm:text-base text-slate-900">
                {fmt(product.price)}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-end">
            <button
              onClick={handleAdd}
              disabled={!product.inStock}
              aria-label="Tambah ke keranjang"
              title="Tambah ke Keranjang"
              className="w-8 h-8 sm:w-9 sm:h-9 bg-black text-white flex items-center justify-center hover:bg-gray-800 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>
      </div>
    </Link>
  )
}
