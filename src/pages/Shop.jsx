import { useMemo, useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { X, Filter as FilterIcon, ChevronDown, Check, RotateCcw } from 'lucide-react'
import ProductCard from '../components/ProductCard'
import { useProducts } from '../context/ProductsContext'
import { useCategories } from '../context/CategoriesContext'
import { useBrands } from '../context/BrandContext'

const SORTS = [
  { value: 'default', label: 'Paling Relevan' },
  { value: 'price-asc', label: 'Harga Terendah' },
  { value: 'price-desc', label: 'Harga Tertinggi' },
  { value: 'sold', label: 'Terlaris' },
]

const PRICE_PRESETS = [
  { label: '< 250rb', min: 0, max: 250000 },
  { label: '250rb - 500rb', min: 250000, max: 500000 },
  { label: '500rb - 1jt', min: 500000, max: 1000000 },
  { label: '> 1jt', min: 1000000, max: 100000000 },
]

export default function Shop() {
  const { products, loading } = useProducts()
  const { categories } = useCategories()
  const { brands } = useBrands()
  const [params, setParams] = useSearchParams()
  const [filtersOpen, setFiltersOpen] = useState(false)

  // URL Params parsing
  const query = params.get('q') || ''
  const selectedCategories = useMemo(() => {
    const raw = params.get('category')
    return raw ? raw.split(',').filter(Boolean) : []
  }, [params])

  const selectedBrands = useMemo(() => {
    const raw = params.get('brand')
    return raw ? raw.split(',').filter(Boolean) : []
  }, [params])

  const sort = params.get('sort') || 'default'
  const minPrice = params.get('min') ? Number(params.get('min')) : 0
  const maxPrice = params.get('max') ? Number(params.get('max')) : 0
  const inStockOnly = params.get('stock') === '1'

  // TEMPORARY STATES FOR FILTER FORM
  const [tempSort, setTempSort] = useState(sort)
  const [tempCategories, setTempCategories] = useState(selectedCategories)
  const [tempBrands, setTempBrands] = useState(selectedBrands)
  const [tempMinPrice, setTempMinPrice] = useState(minPrice ? String(minPrice) : '')
  const [tempMaxPrice, setTempMaxPrice] = useState(maxPrice ? String(maxPrice) : '')
  const [tempInStockOnly, setTempInStockOnly] = useState(inStockOnly)

  // Dropdown collapse states
  const [openCatDropdown, setOpenCatDropdown] = useState(true)
  const [openBrandDropdown, setOpenBrandDropdown] = useState(true)

  useEffect(() => {
    setTempSort(sort)
    setTempCategories(selectedCategories)
    setTempBrands(selectedBrands)
    setTempMinPrice(minPrice ? String(minPrice) : '')
    setTempMaxPrice(maxPrice ? String(maxPrice) : '')
    setTempInStockOnly(inStockOnly)
  }, [sort, selectedCategories, selectedBrands, minPrice, maxPrice, inStockOnly])

  function toggleCategory(catName) {
    if (tempCategories.includes(catName)) {
      setTempCategories(tempCategories.filter(c => c !== catName))
    } else {
      setTempCategories([...tempCategories, catName])
    }
  }

  function toggleBrand(brandName) {
    if (tempBrands.includes(brandName)) {
      setTempBrands(tempBrands.filter(b => b !== brandName))
    } else {
      setTempBrands([...tempBrands, brandName])
    }
  }

  function setPresetPrice(preset) {
    setTempMinPrice(preset.min ? String(preset.min) : '0')
    setTempMaxPrice(preset.max < 100000000 ? String(preset.max) : '')
  }

  function applyAllFilters() {
    const next = new URLSearchParams()
    if (query) next.set('q', query)
    if (tempSort && tempSort !== 'default') next.set('sort', tempSort)
    if (tempCategories.length > 0) next.set('category', tempCategories.join(','))
    if (tempBrands.length > 0) next.set('brand', tempBrands.join(','))
    if (tempMinPrice && Number(tempMinPrice) > 0) next.set('min', tempMinPrice)
    if (tempMaxPrice && Number(tempMaxPrice) > 0) next.set('max', tempMaxPrice)
    if (tempInStockOnly) next.set('stock', '1')

    setParams(next)
    setFiltersOpen(false)
  }

  function resetAllFilters() {
    setTempSort('default')
    setTempCategories([])
    setTempBrands([])
    setTempMinPrice('')
    setTempMaxPrice('')
    setTempInStockOnly(false)

    const next = new URLSearchParams()
    if (query) next.set('q', query)
    setParams(next)
    setFiltersOpen(false)
  }

  // Filtered Products Calculation
  const results = useMemo(() => {
    let list = [...products]

    if (query) {
      list = list.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()))
    }
    if (selectedCategories.length > 0) {
      list = list.filter((p) => selectedCategories.includes(p.category))
    }
    if (selectedBrands.length > 0) {
      list = list.filter((p) => p.brand && selectedBrands.some(b => b.toLowerCase() === p.brand.toLowerCase()))
    }
    if (minPrice > 0) {
      list = list.filter((p) => p.price >= minPrice)
    }
    if (maxPrice > 0) {
      list = list.filter((p) => p.price <= maxPrice)
    }
    if (inStockOnly) {
      list = list.filter((p) => p.inStock)
    }

    if (sort === 'price-asc') list.sort((a, b) => a.price - b.price)
    if (sort === 'price-desc') list.sort((a, b) => b.price - a.price)
    if (sort === 'sold') list.sort((a, b) => Number(b.sold || 0) - Number(a.sold || 0))

    return list
  }, [products, selectedCategories, selectedBrands, minPrice, maxPrice, inStockOnly, query, sort])

  const activeFilterCount = (selectedCategories.length > 0 ? 1 : 0) +
    (selectedBrands.length > 0 ? 1 : 0) +
    (minPrice > 0 || maxPrice > 0 ? 1 : 0) +
    (inStockOnly ? 1 : 0) +
    (sort !== 'default' ? 1 : 0)

  const FilterPanel = (
    <div className="flex flex-col gap-6">
      {/* Tombol Terapkan & Reset di Bagian Atas Panel */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={applyAllFilters}
          className="flex-1 bg-black text-white font-bold py-2.5 px-4 text-xs uppercase tracking-wider hover:bg-gray-800 transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
        >
          Terapkan Filter
        </button>
        <button
          type="button"
          onClick={resetAllFilters}
          title="Reset semua filter"
          className="p-2.5 border border-gray-300 hover:border-black text-slate-700 hover:text-black transition-colors"
        >
          <RotateCcw size={15} />
        </button>
      </div>

      {/* Urutan */}
      <div>
        <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900 mb-2">Urutkan</h4>
        <select
          value={tempSort}
          onChange={(e) => setTempSort(e.target.value)}
          className="w-full bg-white border border-gray-300 px-3 py-2 text-xs font-semibold outline-none focus:border-black"
        >
          {SORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </div>

      {/* Multi-Select Kategori */}
      <div className="border-t border-gray-200 pt-4">
        <button
          type="button"
          onClick={() => setOpenCatDropdown(!openCatDropdown)}
          className="flex items-center justify-between w-full text-left font-bold text-xs uppercase tracking-wider text-slate-900 mb-2"
        >
          <span>Kategori {tempCategories.length > 0 && `(${tempCategories.length})`}</span>
          <ChevronDown size={14} className={`transition-transform ${openCatDropdown ? 'rotate-180' : ''}`} />
        </button>

        {openCatDropdown && (
          <div className="flex flex-col gap-1 max-h-48 overflow-y-auto pr-1">
            {categories.map((c) => {
              const checked = tempCategories.includes(c.name)
              return (
                <label
                  key={c.name}
                  className={`flex items-center gap-2.5 text-xs py-1.5 px-2 cursor-pointer transition-colors ${
                    checked ? 'bg-black text-white font-bold' : 'hover:bg-gray-100 text-slate-800'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleCategory(c.name)}
                    className="accent-black w-3.5 h-3.5"
                  />
                  <span className="truncate">{c.name}</span>
                </label>
              )
            })}
          </div>
        )}
      </div>

      {/* Multi-Select Brand */}
      {brands.length > 0 && (
        <div className="border-t border-gray-200 pt-4">
          <button
            type="button"
            onClick={() => setOpenBrandDropdown(!openBrandDropdown)}
            className="flex items-center justify-between w-full text-left font-bold text-xs uppercase tracking-wider text-slate-900 mb-2"
          >
            <span>Brand / Merk {tempBrands.length > 0 && `(${tempBrands.length})`}</span>
            <ChevronDown size={14} className={`transition-transform ${openBrandDropdown ? 'rotate-180' : ''}`} />
          </button>

          {openBrandDropdown && (
            <div className="flex flex-col gap-1 max-h-48 overflow-y-auto pr-1">
              {brands.map((b) => {
                const checked = tempBrands.includes(b.name)
                return (
                  <label
                    key={b.id}
                    className={`flex items-center gap-2.5 text-xs py-1.5 px-2 cursor-pointer transition-colors ${
                      checked ? 'bg-black text-white font-bold' : 'hover:bg-gray-100 text-slate-800'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleBrand(b.name)}
                      className="accent-black w-3.5 h-3.5"
                    />
                    <span className="truncate">{b.name}</span>
                  </label>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Rentang Harga (Min - Max + Presets) */}
      <div className="border-t border-gray-200 pt-4">
        <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900 mb-2">Rentang Harga (Rp)</h4>

        {/* Input Min & Max */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div>
            <label className="text-[10px] text-slate-500 font-semibold block mb-0.5">Min</label>
            <input
              type="number"
              min={0}
              placeholder="0"
              value={tempMinPrice}
              onChange={(e) => setTempMinPrice(e.target.value)}
              className="w-full bg-white border border-gray-300 px-2 py-1.5 text-xs font-mono outline-none focus:border-black"
            />
          </div>
          <div>
            <label className="text-[10px] text-slate-500 font-semibold block mb-0.5">Max</label>
            <input
              type="number"
              min={0}
              placeholder="Tak terbatas"
              value={tempMaxPrice}
              onChange={(e) => setTempMaxPrice(e.target.value)}
              className="w-full bg-white border border-gray-300 px-2 py-1.5 text-xs font-mono outline-none focus:border-black"
            />
          </div>
        </div>

        {/* Tombol Preset Cepat */}
        <div className="grid grid-cols-2 gap-1.5">
          {PRICE_PRESETS.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setPresetPrice(p)}
              className="border border-gray-200 hover:border-black bg-gray-50 py-1.5 px-2 text-[11px] font-semibold text-slate-700 hover:text-black transition-colors text-center"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stok Saja */}
      <div className="border-t border-gray-200 pt-4">
        <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-900 select-none">
          <input
            type="checkbox"
            checked={tempInStockOnly}
            onChange={(e) => setTempInStockOnly(e.target.checked)}
            className="accent-black w-4 h-4"
          />
          <span>Hanya Stok Tersedia</span>
        </label>
      </div>

      {/* Tombol Terapkan di Bawah */}
      <button
        type="button"
        onClick={applyAllFilters}
        className="w-full bg-black text-white font-bold py-3 text-xs uppercase tracking-wider hover:bg-gray-800 transition-colors shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] mt-2"
      >
        Terapkan Filter
      </button>
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto px-5 lg:px-8 py-10">
      {/* Header Halaman */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-200 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Katalog Produk</h1>
          <p className="text-xs text-slate-500 mt-1">
            Menampilkan <strong className="text-slate-900 font-mono">{results.length}</strong> produk
            {query && <span> untuk pencarian &quot;{query}&quot;</span>}
          </p>
        </div>

        {/* Mobile Filter Button */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={() => setFiltersOpen(true)}
            className="flex-1 border-2 border-black bg-white px-4 py-2.5 text-xs font-extrabold flex items-center justify-center gap-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
          >
            <FilterIcon size={14} /> Filter & Urutkan {activeFilterCount > 0 && `(${activeFilterCount})`}
          </button>
          {activeFilterCount > 0 && (
            <button
              onClick={resetAllFilters}
              className="p-2.5 border-2 border-black bg-gray-100 text-slate-900 hover:bg-black hover:text-white"
              title="Reset"
            >
              <RotateCcw size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Active Filter Tags */}
      {(selectedCategories.length > 0 || selectedBrands.length > 0 || minPrice > 0 || maxPrice > 0 || inStockOnly) && (
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <span className="text-xs font-bold text-slate-500 uppercase">Filter Aktif:</span>
          {selectedCategories.map(c => (
            <span key={c} className="bg-black text-white text-[11px] font-bold px-2.5 py-1 flex items-center gap-1.5">
              Kategori: {c}
              <button onClick={() => {
                const next = selectedCategories.filter(x => x !== c)
                const p = new URLSearchParams(params)
                if (next.length) p.set('category', next.join(',')); else p.delete('category')
                setParams(p)
              }}><X size={12} /></button>
            </span>
          ))}
          {selectedBrands.map(b => (
            <span key={b} className="bg-black text-white text-[11px] font-bold px-2.5 py-1 flex items-center gap-1.5">
              Brand: {b}
              <button onClick={() => {
                const next = selectedBrands.filter(x => x !== b)
                const p = new URLSearchParams(params)
                if (next.length) p.set('brand', next.join(',')); else p.delete('brand')
                setParams(p)
              }}><X size={12} /></button>
            </span>
          ))}
          {(minPrice > 0 || maxPrice > 0) && (
            <span className="bg-black text-white text-[11px] font-bold px-2.5 py-1 flex items-center gap-1.5">
              Harga: {minPrice ? `Rp${minPrice.toLocaleString('id-ID')}` : '0'} - {maxPrice ? `Rp${maxPrice.toLocaleString('id-ID')}` : '∞'}
              <button onClick={() => {
                const p = new URLSearchParams(params)
                p.delete('min')
                p.delete('max')
                setParams(p)
              }}><X size={12} /></button>
            </span>
          )}
          {inStockOnly && (
            <span className="bg-black text-white text-[11px] font-bold px-2.5 py-1 flex items-center gap-1.5">
              Stok Tersedia
              <button onClick={() => {
                const p = new URLSearchParams(params)
                p.delete('stock')
                setParams(p)
              }}><X size={12} /></button>
            </span>
          )}
          <button
            onClick={resetAllFilters}
            className="text-xs text-rose-600 font-bold hover:underline ml-2"
          >
            Hapus Semua
          </button>
        </div>
      )}

      {/* Grid Layout: Sidebar Filter Desktop + Produk */}
      <div className="grid md:grid-cols-[240px_1fr] gap-8 items-start">
        {/* Sidebar Filter Desktop */}
        <div className="hidden md:block bg-white border border-gray-200 p-5 sticky top-24">
          {FilterPanel}
        </div>

        {/* Produk List */}
        <div>
          {loading ? (
            <div className="py-24 text-center text-slate-500">Memuat produk...</div>
          ) : results.length === 0 ? (
            <div className="py-24 text-center border-2 border-dashed border-gray-200 p-8 flex flex-col items-center gap-3">
              <p className="text-base font-bold text-slate-900">Tidak ada produk yang cocok dengan filter.</p>
              <p className="text-xs text-slate-500">Coba ubah kata kunci atau hapus beberapa filter yang aktif.</p>
              <button
                onClick={resetAllFilters}
                className="mt-2 bg-black text-white font-bold px-5 py-2.5 text-xs hover:bg-gray-800 transition-colors"
              >
                Reset Semua Filter
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
              {results.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filter Drawer Modal */}
      {filtersOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            onClick={() => setFiltersOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
          />
          <div className="relative ml-auto w-full max-w-xs bg-white h-full overflow-y-auto p-5 z-10 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-gray-200 pb-4 mb-4">
                <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-900">Filter & Urutkan</h3>
                <button onClick={() => setFiltersOpen(false)} className="p-1 hover:bg-gray-100">
                  <X size={18} />
                </button>
              </div>
              {FilterPanel}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
