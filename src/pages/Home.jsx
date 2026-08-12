import { Link } from 'react-router-dom'
import { ChevronDown, ArrowRight } from 'lucide-react'
import ProductCard from '../components/ProductCard'
import { useProducts } from '../context/ProductsContext'
import { useCategories } from '../context/CategoriesContext'
import { useSiteContent } from '../context/SiteContentContext'
import { useState, useMemo, useRef, useEffect } from 'react'

const SORTS = [
  { value: 'default', label: 'Paling Relevan' },
  { value: 'price-asc', label: 'Harga Terendah' },
  { value: 'price-desc', label: 'Harga Tertinggi' },
  { value: 'sold', label: 'Terlaris' },
]

const PLACEHOLDER_BRANDS = [
  'SAMSUNG', 'APPLE', 'XIAOMI', 'OPPO', 'VIVO', 'REALME', 'ANKER', 'BASEUS',
]

// ─── Brand Ticker ────────────────────────────────────────────────────────────
function BrandTicker({ logos }) {
  const hasLogos = logos && logos.length > 0

  if (!hasLogos && PLACEHOLDER_BRANDS.length === 0) return null

  const items = hasLogos ? logos : PLACEHOLDER_BRANDS.map((n, i) => ({ id: i, name: n, imageUrl: '' }))
  const doubled = [...items, ...items]

  return (
    <section className="bg-black border-y border-white/10 py-4 overflow-hidden ticker-track select-none">
      <div className="animate-marquee gap-0">
        {doubled.map((item, idx) => (
          <div
            key={`${item.id}-${idx}`}
            className="flex items-center shrink-0 px-10 gap-3"
          >
            {item.imageUrl ? (
              <img
                src={item.imageUrl}
                alt={item.name}
                className="h-7 w-auto object-contain opacity-50 hover:opacity-100 transition-opacity"
              />
            ) : (
              <span className="text-white/40 font-display font-bold text-sm tracking-widest uppercase whitespace-nowrap hover:text-white transition-colors">
                {item.name}
              </span>
            )}
            <span className="text-white/20 text-xs ml-6">■</span>
          </div>
        ))}
      </div>
    </section>
  )
}

// ─── Dropdown filter ─────────────────────────────────────────────────────────
function DropdownFilter({ label, children, active }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-1.5 px-4 py-2 border text-sm font-semibold transition-all ${
          active
            ? 'bg-black text-white border-black shadow-md'
            : 'bg-white border-gray-300 text-slate-700 hover:border-black'
        }`}
      >
        {label}
        <ChevronDown size={14} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 shadow-xl z-30 min-w-[180px] p-3">
          {children}
        </div>
      )}
    </div>
  )
}

// ─── Main ────────────────────────────────────────────────────────────────────
export default function Home() {
  const { products, loading } = useProducts()
  const { categories } = useCategories()
  const { content } = useSiteContent()

  const [activeCategory, setActiveCategory] = useState('')
  const [sort, setSort] = useState('default')
  const [maxPrice, setMaxPrice] = useState(1000000)
  const [inStockOnly, setInStockOnly] = useState(false)

  const results = useMemo(() => {
    let list = products.filter((p) => p.price <= maxPrice)
    if (activeCategory) list = list.filter((p) => p.category === activeCategory)
    if (inStockOnly) list = list.filter((p) => p.inStock)
    if (sort === 'price-asc') list = [...list].sort((a, b) => a.price - b.price)
    if (sort === 'price-desc') list = [...list].sort((a, b) => b.price - a.price)
    if (sort === 'sold') list = [...list].sort((a, b) => Number(b.sold || 0) - Number(a.sold || 0))
    return list
  }, [products, activeCategory, sort, maxPrice, inStockOnly])

  const activeSortLabel = SORTS.find((s) => s.value === sort)?.label || 'Urutkan'
  const priceActive = maxPrice < 1000000
  const stockActive = inStockOnly

  return (
    <div>
      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-black text-white min-h-[72vh] flex items-center">
        {content.heroMedia && (
          <div className="absolute inset-0 z-0">
            {content.heroMediaType === 'video' ? (
              <video 
                src={content.heroMedia} 
                className="w-full h-full object-cover" 
                style={{ opacity: (content.heroOpacity ?? 20) / 100 }} 
                autoPlay loop muted playsInline 
              />
            ) : (
              <img 
                src={content.heroMedia} 
                className="w-full h-full object-cover" 
                style={{ opacity: (content.heroOpacity ?? 20) / 100 }} 
                alt="" 
              />
            )}
          </div>
        )}
        {/* Gradient overlay */}
        <div className="absolute inset-0 z-0 bg-gradient-to-t from-black via-black/70 to-transparent" />

        <div className="relative z-10 w-full max-w-4xl mx-auto px-5 lg:px-8 flex items-center justify-center min-h-[inherit]">
          <h1 className="font-display text-5xl md:text-7xl font-bold leading-[1.05] text-white tracking-tight text-center">
            {content.heroTitle || 'Aksesoris\nGadget Kamu'}
          </h1>
        </div>
      </section>

      {/* ── Brand Logo Ticker ── */}
      <BrandTicker logos={content.brandLogos} />

      {/* ── Katalog + Filter ── */}
      <section id="katalog" className="max-w-7xl mx-auto px-5 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-slate-900 mb-1">
              Semua Produk
            </h2>
            <p className="text-sm text-slate-500">
              {loading ? 'Memuat...' : `${results.length} produk tersedia`}
            </p>
          </div>
          <Link
            to="/toko"
            className="hidden md:inline-flex items-center gap-2 text-sm font-semibold text-black border-b border-black pb-0.5 hover:opacity-70 transition-opacity"
          >
            Lihat Semua <ArrowRight size={14} />
          </Link>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center gap-2 mb-8 pb-6 border-b-2 border-black">
          {/* Kategori chips */}
          <button
            type="button"
            onClick={() => setActiveCategory('')}
            className={`px-4 py-2 border text-sm font-semibold transition-all ${
              !activeCategory
                ? 'bg-black text-white border-black'
                : 'bg-white border-gray-300 text-slate-600 hover:border-black'
            }`}
          >
            Semua
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setActiveCategory(activeCategory === c.name ? '' : c.name)}
              className={`px-4 py-2 border text-sm font-semibold transition-all ${
                activeCategory === c.name
                  ? 'bg-black text-white border-black'
                  : 'bg-white border-gray-300 text-slate-600 hover:border-black'
              }`}
            >
              {c.name}
            </button>
          ))}

          {/* Divider */}
          <div className="w-px h-6 bg-gray-200 mx-1" />

          {/* Urutkan dropdown */}
          <DropdownFilter label={sort !== 'default' ? activeSortLabel : 'Urutkan'} active={sort !== 'default'}>
            {SORTS.map((s) => (
              <button
                key={s.value}
                type="button"
                onClick={() => setSort(s.value)}
                className={`w-full text-left px-3 py-2 text-sm font-semibold transition-colors ${
                  sort === s.value ? 'bg-gray-100 text-slate-900' : 'text-slate-600 hover:bg-gray-50'
                }`}
              >
                {s.label}
              </button>
            ))}
          </DropdownFilter>

          {/* Harga dropdown */}
          <DropdownFilter label={priceActive ? `< Rp${(maxPrice / 1000).toFixed(0)}rb` : 'Harga'} active={priceActive}>
            <div className="px-2 py-1">
              <p className="text-xs font-semibold text-slate-500 mb-3">Harga Maksimum</p>
              <input
                type="range"
                min="50000"
                max="1000000"
                step="50000"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-black"
              />
              <p className="text-xs text-slate-600 font-mono mt-1">
                s/d Rp{Number(maxPrice).toLocaleString('id-ID')}
              </p>
              {priceActive && (
                <button
                  type="button"
                  onClick={() => setMaxPrice(1000000)}
                  className="text-xs text-rose-500 font-semibold mt-2 hover:underline"
                >
                  Reset
                </button>
              )}
            </div>
          </DropdownFilter>

          {/* Stok toggle */}
          <button
            type="button"
            onClick={() => setInStockOnly((v) => !v)}
            className={`px-4 py-2 border text-sm font-semibold transition-all ${
              stockActive
                ? 'bg-black text-white border-black'
                : 'bg-white border-gray-300 text-slate-600 hover:border-black'
            }`}
          >
            {stockActive ? '✓ ' : ''}Tersedia
          </button>

          {/* Reset semua */}
          {(activeCategory || sort !== 'default' || priceActive || stockActive) && (
            <button
              type="button"
              onClick={() => { setActiveCategory(''); setSort('default'); setMaxPrice(1000000); setInStockOnly(false) }}
              className="text-xs text-rose-500 font-semibold hover:underline ml-1"
            >
              Reset semua
            </button>
          )}
        </div>

        {/* Grid Produk */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-gray-100 aspect-[3/4] animate-pulse" />
            ))}
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-24 text-slate-500">
            <p className="font-semibold text-lg">Produk tidak ditemukan.</p>
            <p className="text-sm mt-1">Coba ubah filter yang digunakan.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {results.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
            <div className="text-center mt-10">
              <Link
                to="/toko"
                className="inline-flex items-center gap-2 border-2 border-black text-black font-bold px-8 py-3 hover:bg-black hover:text-white transition-colors text-sm"
              >
                Lihat Semua Produk <ArrowRight size={15} />
              </Link>
            </div>
          </>
        )}
      </section>
    </div>
  )
}
