import { createContext, useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProducts } from './ProductsContext'
import { useAuth } from './AuthContext'
import { useToast } from './ToastContext'
import { supabase } from '../config/supabase'

const WishlistContext = createContext(null)
const STORAGE_KEY = 'kk_wishlist'

export function WishlistProvider({ children }) {
  const { getById } = useProducts()
  const { user } = useAuth()
  const { addToast } = useToast()
  const navigate = useNavigate()

  const requireAuth = () => {
    if (!user) {
      addToast('Silakan login terlebih dahulu untuk menggunakan wishlist', 'error')
      navigate('/login', { state: { from: null } })
      return false
    }
    return true
  }

  const [ids, setIds] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  // Sinkronisasi data dari server saat login, bersihkan saat logout
  useEffect(() => {
    if (user) {
      supabase.from('wishlists').select('items').eq('user_id', user.id).maybeSingle().then(({ data, error }) => {
        if (!error && data && data.items && Array.isArray(data.items) && data.items.length > 0) {
          setIds(data.items)
        } else {
          setIds(prev => prev)
        }
      }).catch(() => {
        setIds(prev => prev)
      })
    } else {
      localStorage.removeItem(STORAGE_KEY)
      setIds([])
    }
  }, [user])

  // Simpan perubahan baik ke lokal maupun server
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids))
    if (user) {
      supabase.from('wishlists').upsert({ user_id: user.id, items: ids }).then()
    }
  }, [ids, user])

  function toggle(id) {
    if (!requireAuth()) return
    setIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  function isWishlisted(id) {
    return ids.includes(id)
  }

  const wishlistItems = ids.map(getById).filter(Boolean)

  return (
    <WishlistContext.Provider value={{ ids, wishlistItems, toggle, isWishlisted }}>
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlist() {
  const ctx = useContext(WishlistContext)
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider')
  return ctx
}
