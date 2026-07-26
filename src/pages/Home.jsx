import { Link } from 'react-router-dom'
import { ArrowRight, Leaf, Truck, ShieldCheck } from 'lucide-react'
import ProductCard from '../components/ProductCard'
import ProductThumb from '../components/ProductThumb'
import { useProducts } from '../context/ProductsContext'
import { useCategories } from '../context/CategoriesContext'
import { useSiteContent } from '../context/SiteContentContext'
import { useToast } from '../context/ToastContext'
import { useState, useMemo } from 'react'

export default function Home() {
  const { products, loading } = useProducts()
  const { categories } = useCategories()
  const { content } = useSiteContent()

  const featured = useMemo(() => {
    return [...products].sort(() => 0.5 - Math.random()).slice(0, 4)
  }, [products])

  const onSale = products.filter((p) => p.oldPrice)
  const { addToast } = useToast()
  if (loading) {
    return <div className="max-w-7xl mx-auto px-5 py-24 text-center text-cacao-500">Memuat produk...</div>
  }

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-cacao-900 text-white">
        {content.heroMedia && (
          <div className="absolute inset-0 z-0">
            {content.heroMediaType === 'video' ? (
              <video src={content.heroMedia} className="w-full h-full object-cover opacity-40" autoPlay loop muted playsInline />
            ) : (
              <img src={content.heroMedia} className="w-full h-full object-cover opacity-40" alt="" />
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-cacao-900 via-cacao-900/80 to-transparent"></div>
          </div>
        )}
        <div className="relative z-10 max-w-7xl mx-auto px-5 lg:px-8 py-16 lg:py-24 grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <span className="inline-block bg-white/10 text-gold-400 text-xs font-bold uppercase tracking-wide px-3 py-1.5 rounded-full border border-gold-500/30 mb-5">
              {content.heroEyebrow}
            </span>
            <h1 className="text-4xl md:text-6xl font-serif font-bold leading-tight text-white">
              {content.heroTitle}
            </h1>
            <p className="text-cream-50 mt-4 md:mt-5 max-w-md leading-relaxed text-base md:text-lg">
              {content.heroSubtitle}
            </p>
            <div className="flex gap-3 mt-8">
              <Link to="/toko" className="bg-gold-500 text-cacao-900 font-bold px-8 py-3.5 rounded-full flex items-center gap-2 hover:bg-gold-400 transition-colors">
                Belanja Sekarang <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Value Props */}
      <section className="bg-cream-200 border-b border-cream-300">
        <div className="max-w-7xl mx-auto px-5 lg:px-8 py-8 grid grid-cols-1 sm:grid-cols-3 gap-6 divide-y sm:divide-y-0 sm:divide-x divide-cream-300">
          <div className="flex items-center gap-4 pt-4 sm:pt-0 sm:px-6 first:pl-0 first:pt-0">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-cacao-900 shadow-sm shrink-0">
              <Leaf size={24} />
            </div>
            <div>
              <h4 className="font-bold text-cacao-900">Bahan Alami</h4>
              <p className="text-xs text-cacao-600 mt-0.5">Tanpa pengawet buatan</p>
            </div>
          </div>
          <div className="flex items-center gap-4 pt-4 sm:pt-0 sm:px-6">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-cacao-900 shadow-sm shrink-0">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h4 className="font-bold text-cacao-900">Kualitas Premium</h4>
              <p className="text-xs text-cacao-600 mt-0.5">Standar artisan cokelat</p>
            </div>
          </div>
          <div className="flex items-center gap-4 pt-4 sm:pt-0 sm:px-6">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-cacao-900 shadow-sm shrink-0">
              <Truck size={24} />
            </div>
            <div>
              <h4 className="font-bold text-cacao-900">Pengiriman Aman</h4>
              <p className="text-xs text-cacao-600 mt-0.5">Bergaransi tidak leleh</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-5 lg:px-8 py-10">
          <h2 className="text-3xl font-serif font-bold mb-8 text-center">Kategori</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((c) => {
              return (
                <Link
                  key={c.name}
                  to={`/toko?category=${encodeURIComponent(c.name)}`}
                  className="group relative overflow-hidden bg-cream-200 border border-cream-300 rounded-xl h-32 flex items-center justify-center hover:border-gold-500 transition-all shadow-sm hover:shadow-md"
                >
                  {c.image && (
                    <div className="absolute inset-0 z-0">
                      <img src={c.image} alt={c.name} className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
                    </div>
                  )}
                  <span className="relative z-10 text-lg font-bold text-center px-4" style={{ color: c.textColor }}>{c.name}</span>
                </Link>
              )
            })}
          </div>
        </section>
      )}

      {/* Promo */}
      {onSale.length > 0 && (
        <section className="bg-cacao-900 py-14">
          <div className="max-w-7xl mx-auto px-5 lg:px-8">
            <div className="flex items-end justify-between mb-6">
              <div>
                <h2 className="text-3xl font-serif font-bold text-white mb-2">Sedang Diskon</h2>
                <p className="text-sm text-cream-300 mt-1">Jangan sampai kehabisan.</p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              {onSale.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        </section>
      )}

      {/* Featured */}
      <section className="max-w-7xl mx-auto px-5 lg:px-8 py-10 mt-10">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-3xl font-serif font-bold mb-8 text-center">Produk Pilihan</h2>
          </div>
          <Link to="/toko" className="text-sm font-semibold text-gold-600 hover:underline">
            Lihat semua
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {featured.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>

    </div>
  )
}
