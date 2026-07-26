import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { SlidersHorizontal, X } from 'lucide-react'
import ProductCard from '../components/ProductCard'
import { useProducts } from '../context/ProductsContext'
import { useCategories } from '../context/CategoriesContext'

const SORTS = [
  { value: 'default', label: 'Paling Relevan' },
  { value: 'price-asc', label: 'Harga Terendah' },
  { value: 'price-desc', label: 'Harga Tertinggi' },
  { value: 'rating', label: 'Rating Tertinggi' },
]

export default function Shop() {
  const { products, loading } = useProducts()
  const { categories } = useCategories()
  const [params, setParams] = useSearchParams()
  const [filtersOpen, setFiltersOpen] = useState(false)

  const query = params.get('q') || ''
  const activeCategory = params.get('category') || ''
  const sort = params.get('sort') || 'default'
  const maxPrice = Number(params.get('max')) || 200000
  const inStockOnly = params.get('stock') === '1'

  function updateParam(key, value) {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    setParams(next)
  }

  const results = useMemo(() => {
    let list = products.filter((p) => p.price <= maxPrice)
    if (activeCategory) list = list.filter((p) => p.category === activeCategory)
    if (inStockOnly) list = list.filter((p) => p.inStock)
    if (query) list = list.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()))

    if (sort === 'price-asc') list = [...list].sort((a, b) => a.price - b.price)
    if (sort === 'price-desc') list = [...list].sort((a, b) => b.price - a.price)
    if (sort === 'rating') list = [...list].sort((a, b) => b.rating - a.rating)

    return list
  }, [products, activeCategory, sort, maxPrice, inStockOnly, query])

  const FilterPanel = (
    <div className="flex flex-col gap-7">
      <div>
        <h4 className="font-bold text-sm mb-3">Urutkan</h4>
        <select
          value={sort}
          onChange={(e) => updateParam('sort', e.target.value)}
          className="w-full bg-cream-100 border border-cream-300 rounded-lg px-3 py-2 text-sm outline-none"
        >
          {SORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </div>

      <div>
        <h4 className="font-bold text-sm mb-3">Kategori</h4>
        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="radio" name="cat" checked={!activeCategory} onChange={() => updateParam('category', '')} className="accent-gold-500" />
            Semua Kategori
          </label>
          {categories.map((c) => (
            <label key={c.name} className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="radio" name="cat" checked={activeCategory === c.name} onChange={() => updateParam('category', c.name)} className="accent-gold-500" />
              {c.name}
            </label>
          ))}
        </div>
      </div>

      <div>
        <h4 className="font-bold text-sm mb-3">Harga Maksimum</h4>
        <input
          type="range"
          min="30000"
          max="200000"
          step="5000"
          value={maxPrice}
          onChange={(e) => updateParam('max', e.target.value)}
          className="w-full accent-gold-500"
        />
        <div className="text-xs text-cacao-600 font-mono mt-1">hingga Rp{maxPrice.toLocaleString('id-ID')}</div>
      </div>

      <label className="flex items-center gap-2 text-sm cursor-pointer">
        <input type="checkbox" checked={inStockOnly} onChange={(e) => updateParam('stock', e.target.checked ? '1' : '')} className="accent-gold-500" />
        Hanya yang tersedia
      </label>

      <button
        onClick={() => setParams({})}
        className="text-xs font-semibold text-rose-500 hover:underline text-left"
      >
        Reset semua filter
      </button>
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto px-5 lg:px-8 py-10 relative">
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold">{activeCategory || 'Semua Produk'}</h1>
        <p className="text-sm text-cacao-600 mt-1">
          {query ? `Hasil pencarian untuk "${query}" — ` : ''}{results.length} produk ditemukan
        </p>
      </div>

      <div className="grid lg:grid-cols-[220px_1fr] gap-8">
        <aside className="hidden lg:block sticky top-20 h-fit max-h-[calc(100vh-6rem)] overflow-y-auto pr-2">
          {FilterPanel}
        </aside>

        <div>
          <button
            onClick={() => setFiltersOpen(true)}
            className="lg:hidden fixed bottom-6 left-6 z-40 w-14 h-14 bg-cacao-900 text-white rounded-full shadow-2xl flex items-center justify-center hover:bg-cacao-800 transition-colors"
            aria-label="Filter"
          >
            <SlidersHorizontal size={24} />
          </button>

          {loading ? (
            <p className="text-center py-20 text-cacao-500">Memuat produk...</p>
          ) : results.length === 0 ? (
            <div className="text-center py-20 text-cacao-600">
              <p className="font-semibold">Produk tidak ditemukan.</p>
              <p className="text-sm mt-1">Coba ubah kata kunci atau filter yang digunakan.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
              {results.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>
      </div>

      {filtersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div onClick={() => setFiltersOpen(false)} className="absolute inset-0 bg-cacao-900/40" />
          <div className="absolute right-0 top-0 h-full w-72 bg-white p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold">Filter</h3>
              <button onClick={() => setFiltersOpen(false)} aria-label="Tutup"><X size={18} /></button>
            </div>
            {FilterPanel}
          </div>
        </div>
      )}
    </div>
  )
}
