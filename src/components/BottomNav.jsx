import { useNavigate, useLocation } from 'react-router-dom'
import { Home, Store, ShoppingBag, Heart, User as UserIcon } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

export default function BottomNav({ onOpenCart }) {
  const { totalCount } = useCart()
  const { wishlistItems } = useWishlist()
  const { user } = useAuth()
  const { addToast } = useToast()
  const navigate = useNavigate()
  const location = useLocation()

  function navItemClass(isActive) {
    const base = 'flex flex-col items-center justify-center gap-0.5 w-full h-full text-xs font-medium transition-colors select-none touch-manipulation pb-[max(env(safe-area-inset-bottom),4px)]'
    return isActive ? `${base} text-gold-600` : `${base} text-cacao-400 hover:text-cacao-600`
  }

  function handleWishlist() {
    if (!user) {
      addToast('Silakan login terlebih dahulu', 'error')
      return
    }
    navigate('/wishlist')
  }

  function handleAkun() {
    navigate(user ? '/profil' : '/login')
  }

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-cream-300 shadow-[0_-4px_20px_rgba(26,20,18,0.06)]">
      <ul className="grid grid-cols-5 items-end h-16 relative">
        <li className="h-full col-span-1">
          <button type="button" onClick={() => navigate('/')} className={navItemClass(location.pathname === '/')}>
            <Home size={20} strokeWidth={location.pathname === '/' ? 2.6 : 2} />
            <span>Beranda</span>
          </button>
        </li>

        <li className="h-full col-span-1">
          <button type="button" onClick={() => navigate('/toko')} className={navItemClass(location.pathname === '/toko')}>
            <Store size={20} strokeWidth={location.pathname === '/toko' ? 2.6 : 2} />
            <span>Toko</span>
          </button>
        </li>

        <li className="h-full col-span-1 relative">
          <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-full flex justify-center pointer-events-none">
            <button
              type="button"
              aria-label="Keranjang"
              onClick={onOpenCart}
              className="relative pointer-events-auto flex items-center justify-center w-14 h-14 -mt-1 rounded-full bg-gold-500 text-cacao-900 shadow-[0_6px_18px_rgba(212,193,156,0.55)] ring-4 ring-white hover:scale-[1.03] active:scale-95 transition-transform touch-manipulation"
            >
              <ShoppingBag size={26} strokeWidth={2.3} />
              {totalCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-cacao-900 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
                  {totalCount > 99 ? '99+' : totalCount}
                </span>
              )}
            </button>
          </div>
          <div className="h-full flex flex-col items-center justify-end pb-[max(env(safe-area-inset-bottom),8px)] text-[10px] font-semibold text-gold-700">
            <span className="mt-6">Keranjang</span>
          </div>
        </li>

        <li className="h-full col-span-1 relative">
          <button type="button" onClick={handleWishlist} className={navItemClass(location.pathname === '/wishlist')}>
            <div className="relative">
              <Heart size={20} strokeWidth={location.pathname === '/wishlist' ? 2.6 : 2} />
              {wishlistItems.length > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-rose-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-white">
                  {wishlistItems.length > 99 ? '99+' : wishlistItems.length}
                </span>
              )}
            </div>
            <span>Favorit</span>
          </button>
        </li>

        <li className="h-full col-span-1">
          <button type="button" onClick={handleAkun} className={navItemClass(location.pathname === '/profil' || location.pathname === '/login')}>
            <UserIcon size={20} strokeWidth={(location.pathname === '/profil' || location.pathname === '/login') ? 2.6 : 2} />
            <span>Akun</span>
          </button>
        </li>
      </ul>
    </nav>
  )
}
