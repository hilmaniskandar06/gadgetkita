import { Link } from 'react-router-dom'
import { Heart } from 'lucide-react'
import ProductCard from '../components/ProductCard'
import { useWishlist } from '../context/WishlistContext'

export default function Wishlist() {
  const { wishlistItems } = useWishlist()

  if (wishlistItems.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-5 lg:px-8 py-24 flex flex-col items-center text-center gap-4">
        <Heart size={40} className="text-cream-300" />
        <h1 className="text-xl font-extrabold">Wishlist masih kosong</h1>
        <p className="text-sm text-cacao-600">Simpan produk favoritmu dengan menekan ikon hati.</p>
        <Link to="/toko" className="bg-cacao-900 text-white font-bold px-6 py-3 rounded-full mt-2 hover:bg-cacao-800 transition-colors">
          Jelajahi Produk
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-5 lg:px-8 py-10">
      <h1 className="text-2xl font-extrabold mb-8">Wishlist Kamu</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        {wishlistItems.map((p) => <ProductCard key={p.id} product={p} />)}
      </div>
    </div>
  )
}
