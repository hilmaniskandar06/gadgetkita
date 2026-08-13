import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { useCategories } from '../context/CategoriesContext'
import { useSiteContent } from '../context/SiteContentContext'
import { useMemo, useState, useEffect } from 'react'

// ─── Seeded helpers ──────────────────────────────────────────────────────────
function getCollageSeed() {
  const KEY = 'cat_collage_seed'
  try {
    let s = localStorage.getItem(KEY)
    if (s) return Number(s)
    const ns = Date.now() + Math.floor(Math.random() * 100000)
    localStorage.setItem(KEY, String(ns))
    return ns
  } catch (_) {
    return Date.now()
  }
}
function mulberry32(seed) {
  return function () {
    seed |= 0
    seed = (seed + 0x6D2B79F5) | 0
    let t = seed
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
// Ukuran ACAK BESAR: HAPUS varian 1x2 TINGGI (bikin gambar potong parah).
// Probabilitas: 45% BESAR (2x2), 25% LEBAR (2x1), 30% KECIL (1x1)
// → 70% ukuran bukan kecil. Height tiap row: 200px (tinggi cukup, gambar tidak kepotong2)
function pickSize(rand) {
  const r = rand()
  if (r < 0.45) return { span: 'md:col-span-2 md:row-span-2' }   // BESAR (square, aman gambar)
  if (r < 0.70) return { span: 'md:col-span-2 md:row-span-1' }   // LEBAR (2x1, tinggi 200px cukup)
  return { span: 'md:col-span-1 md:row-span-1' }                 // KECIL (1x1, 200px cukup)
}
// ⚠️ JANGAN PANGGIL getCollageSeed DARI DALAM HOOK (useMemo/dll) — localStorage API bisa throw
// (misal QuotaExceeded / private mode) yang bikin React menganggap hook TIDAK TER-CALL.
// Solusi: hitung seed di useEffect terpisah, simpan ke state, lalu baru build layout.
function buildCollageLayoutWithSeed(categories, seed) {
  if (!categories || categories.length === 0) return []
  const rand = mulberry32(seed)
  const arr = categories.slice()
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr.map((c) => ({ ...c, size: pickSize(rand) }))
}

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

// ─── Category Collage (PURE COMPONENT — TANPA HOOK, terima prop) ───────────
function CategoryCollage({ categories, loading, layouted }) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 auto-rows-[110px] md:auto-rows-[200px] grid-flow-dense">
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className={`bg-gray-200 animate-pulse rounded-2xl w-full h-full min-h-[110px] md:min-h-[200px] ${
              i === 0 ? 'md:col-span-2 md:row-span-2' : i === 4 ? 'md:col-span-2 md:row-span-1' : ''
            }`}
          />
        ))}
      </div>
    )
  }

  if (layouted.length === 0) {
    return (
      <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl p-12 text-center text-slate-500">
        <p className="font-semibold">Belum ada kategori.</p>
        <p className="text-sm mt-1">Tambahkan kategori melalui halaman Admin.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 auto-rows-[110px] md:auto-rows-[200px] grid-flow-dense">
      {layouted.map((c) => {
        const textColor = c.textColor || '#ffffff'
        return (
          <Link
            key={c.id || c.name}
            to={`/toko?category=${encodeURIComponent(c.name)}`}
            className={`group relative overflow-hidden rounded-2xl ${c.size.span} block bg-gray-300 w-full h-full min-h-[110px] md:min-h-[200px] hover:-translate-y-1 transition-transform duration-200 shadow-sm hover:shadow-xl`}
          >
            {c.image ? (
              <img
                src={c.image}
                alt={c.name}
                className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-gray-300 to-gray-400" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
            <div
              className="absolute bottom-3 left-3 md:bottom-5 md:left-5 right-3 md:right-5 font-bold font-display tracking-tight leading-tight drop-shadow-lg"
              style={{ color: textColor }}
            >
              <div className="text-xl md:text-3xl">{c.name}</div>
            </div>
          </Link>
        )
      })}
    </div>
  )
}

// ─── Main ────────────────────────────────────────────────────────────────────
export default function Home() {
  const { categories, loading: catsLoading } = useCategories()
  const { content } = useSiteContent()

  // Seed di-resolve SEBELUM hook lain, DILUAR useMemo.
  // Jika localStorage throw error, seed fallback ke Date.now() dan TIDAK mempengaruhi urutan hook.
  const [seed, setSeed] = useState(() => {
    try { return getCollageSeed() } catch (_) { return Date.now() }
  })
  // Recompute seed kalau categories berubah (mirip resetCollageSeed effect di Provider)
  useEffect(() => {
    try { setSeed(getCollageSeed()) } catch (_) { setSeed(Date.now()) }
  }, [categories.length])

  const layouted = useMemo(() => buildCollageLayoutWithSeed(categories, seed), [categories, seed])

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

      {/* ── Kategori Collage ── */}
      <section id="kategori" className="max-w-7xl mx-auto px-5 lg:px-8 py-12 md:py-16">
        <div className="mb-8 md:mb-10 flex items-end justify-between flex-wrap gap-4">
          
        </div>

        <CategoryCollage categories={categories} loading={catsLoading} layouted={layouted} />

        <div className="text-center mt-12 md:mt-16">
          <Link
            to="/toko"
            className="inline-flex items-center gap-2 border-2 border-black text-black font-bold px-8 py-4 hover:bg-black hover:text-white transition-colors text-sm md:text-base tracking-tight"
          >
            Lihat Semua Produk <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  )
}
