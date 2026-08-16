import { createContext, useContext, useEffect, useState } from 'react'
import { useProducts } from './ProductsContext'
import { useAuth } from './AuthContext'
import { supabase } from '../config/supabase'

const CartContext = createContext(null)
const STORAGE_KEY = 'kk_cart'

export function CartProvider({ children }) {
  const { getById } = useProducts()
  const { user, loading: authLoading } = useAuth()
  
  // Format items state: { [itemKey]: { id: productId, qty: number, color?: string, image?: string } }
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      return saved ? JSON.parse(saved) : {}
    } catch {
      return {}
    }
  })

  // Sinkronisasi data dari server saat login, bersihkan saat logout
  useEffect(() => {
    if (authLoading) return

    if (user) {
      supabase.from('carts').select('items').eq('user_id', user.id).maybeSingle().then(({ data, error }) => {
        if (!error && data && data.items && Object.keys(data.items).length > 0) {
          setItems(data.items)
        }
      }).catch(() => {})
    } else {
      localStorage.removeItem(STORAGE_KEY)
      setItems({})
    }
  }, [user, authLoading])

  // Simpan perubahan baik ke lokal maupun server
  useEffect(() => {
    if (authLoading) return
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    if (user) {
      supabase.from('carts').upsert({ user_id: user.id, items }).then()
    }
  }, [items, user, authLoading])

  function addItem(id, qty = 1, color = null, customImage = null) {
    const itemKey = color ? `${id}_${color}` : id
    setItems((prev) => {
      const existing = prev[itemKey]
      const currentQty = typeof existing === 'number' ? existing : (existing?.qty || 0)
      return {
        ...prev,
        [itemKey]: {
          id,
          qty: currentQty + qty,
          color: color || null,
          image: customImage || null
        }
      }
    })
  }

  function updateQty(itemKey, qty) {
    if (qty <= 0) {
      removeItem(itemKey)
      return
    }
    setItems((prev) => {
      const existing = prev[itemKey]
      if (!existing) return prev
      return {
        ...prev,
        [itemKey]: {
          ...(typeof existing === 'number' ? { id: itemKey, qty } : { ...existing, qty })
        }
      }
    })
  }

  function removeItem(itemKey) {
    setItems((prev) => {
      const next = { ...prev }
      delete next[itemKey]
      return next
    })
  }

  function clearCart() {
    setItems({})
  }

  // List cart items yang sudah dipadukan dengan data produk master
  const cartList = Object.entries(items).map(([itemKey, val]) => {
    const productId = typeof val === 'number' ? itemKey : val.id
    const qty = typeof val === 'number' ? val : val.qty
    const selectedColor = typeof val === 'object' ? val.color : null
    const customImage = typeof val === 'object' ? val.image : null

    const product = getById(productId)
    if (!product) return null

    // Cari image yang sesuai dengan varian warna jika ada
    let displayImage = customImage
    if (!displayImage && selectedColor && product.images?.length > 0) {
      const matched = product.images.find(img => typeof img === 'object' && img.colorName === selectedColor)
      if (matched) displayImage = matched.url
    }
    if (!displayImage) {
      displayImage = product.images?.[0] ? (typeof product.images[0] === 'string' ? product.images[0] : product.images[0].url) : product.image
    }

    return {
      ...product,
      cartKey: itemKey,
      qty,
      selectedColor,
      displayImage
    }
  }).filter(Boolean)

  const count = cartList.reduce((acc, item) => acc + item.qty, 0)
  const subtotal = cartList.reduce((acc, item) => acc + item.price * item.qty, 0)

  return (
    <CartContext.Provider value={{
      items,
      cartList,
      count,
      subtotal,
      addItem,
      updateQty,
      removeItem,
      clearCart
    }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
