import { NavLink, useNavigate } from 'react-router-dom'
import { Home, Store, ShoppingBag, Heart, User as UserIcon } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

function navItemClass({ isActive }) {
  const base = 'flex flex-col items-center justify-center gap-0.5 w-full h-full text-xs font-medium transition-colors select-none touch-manipulation pb-[max(env(safe-area-inset-bottom),4px)]'
  return isActive ? `${base} text-gold-600` : `${base} text-cacao-400 hover:text-cacao-600`
}

export default function BottomNav({ onOpenCart }) {
  const { totalCount } = useCart()
  const { wishlistItems } = useWishlist()
  const { user } = useAuth()
  const { addToast } = useToast()
  const navigate = useNavigate()

  function handleOpenCart() {
    if (!user) {
      addToast('Silakan login terlebih dahulu untuk melihat keranjang', 'error')
      navigate('/login', { state: { from: '/keranjang' } })
      return
    }
    onOpenCart()
  }

  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-cream-300 shadow-[0_-4px_20px_rgba(26,20,18,0.06)]">
      <ul className="grid grid-cols-5 items-end h-16 relative">
        <li className="h-full col-span-1">
          <NavLink to="/" end className={navItemClass}>
            {({ isActive }) => (
              <>
                <Home size={20} strokeWidth={isActive ? 2.6 : 2} />
                <span>Beranda</span>
              </>
            )}
          </NavLink>
        </li>

        <li className="h-full col-span-1">
          <NavLink to="/toko" className={navItemClass}>
            {({ isActive }) => (
              <>
                <Store size={20} strokeWidth={isActive ? 2.6 : 2} />
                <span>Toko</span>
              </>
            )}
          </NavLink>
        </li>

        <li className="h-full col-span-1 relative">
          <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-full flex justify-center pointer-events-none">
            <button
              type="button"
              aria-label="Keranjang"
              onClick={handleOpenCart}
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
          <NavLink to={user ? '/wishlist' : '/login'} className={navItemClass}>
            {({ isActive }) => (
              <>
                <div className="relative">
                  <Heart size={20} strokeWidth={isActive ? 2.6 : 2} />
                  {wishlistItems.length > 0 && (
                    <span className="absolute -top-1.5 -right-2 bg-rose-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-white">
                      {wishlistItems.length > 99 ? '99+' : wishlistItems.length}
                    </span>
                  )}
                </div>
                <span>Favorit</span>
              </>
            )}
          </NavLink>
        </li>

        <li className="h-full col-span-1">
          <NavLink to={user ? '/profil' : '/login'} className={navItemClass}>
            {({ isActive }) => (
              <>
                <UserIcon size={20} strokeWidth={isActive ? 2.6 : 2} />
                <span>Akun</span>
              </>
            )}
          </NavLink>
        </li>
      </ul>
    </nav>
  )
}
