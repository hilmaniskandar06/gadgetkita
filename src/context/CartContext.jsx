import { createContext, useContext, useEffect, useState } from 'react'
import { useProducts } from './ProductsContext'
import { useAuth } from './AuthContext'
import { supabase } from '../config/supabase'

const CartContext = createContext(null)
const STORAGE_KEY = 'kk_cart'

export function CartProvider({ children }) {
  const { getById } = useProducts()
  const { user } = useAuth()
  
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
    if (user) {
      supabase.from('carts').select('items').eq('user_id', user.id).maybeSingle().then(({ data, error }) => {
        if (!error && data && data.items && Object.keys(data.items).length > 0) {
          // Cloud ADA isi → cloud MENANG (sesuai ekspektasi user login kembali)
          setItems(data.items)
        } else {
          // Cloud KOSONG → pakai item lokal yang sudah ada saat ini (guest sebelum login)
          // Effect kedua akan otomatis menyimpan ini ke cloud
          setItems(prev => prev)
        }
      }).catch(() => {
        setItems(prev => prev)
      })
    } else {
      // User logout → bersihkan state dan localStorage
      localStorage.removeItem(STORAGE_KEY)
      setItems({})
    }
  }, [user])

  // Simpan perubahan baik ke lokal maupun server
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    if (user) {
      supabase.from('carts').upsert({ user_id: user.id, items }).then()
    }
  }, [items, user])

  function addItem(id, qty = 1) {
    setItems((prev) => ({ ...prev, [id]: (prev[id] || 0) + qty }))
  }

  function removeItem(id) {
    setItems((prev) => {
      const next = { ...prev }
      delete next[id]
      return next
    })
  }

  function setQty(id, qty) {
    if (qty < 1) return removeItem(id)
    setItems((prev) => ({ ...prev, [id]: qty }))
  }

  function clearCart() {
    setItems({})
  }

  const cartList = Object.entries(items)
    .map(([id, qty]) => {
      const product = getById(id)
      return product ? { ...product, qty } : null
    })
    .filter(Boolean)

  const totalCount = cartList.reduce((s, i) => s + i.qty, 0)
  const subtotal = cartList.reduce((s, i) => s + i.price * i.qty, 0)

  return (
    <CartContext.Provider
      value={{ items, cartList, totalCount, subtotal, addItem, removeItem, setQty, clearCart }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
