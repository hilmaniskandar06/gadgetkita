import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import * as productService from '../services/productService'

const ProductsContext = createContext(null)

export function ProductsProvider({ children }) {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    setLoading(true)
    const list = await productService.listProducts()
    setProducts(list)
    setLoading(false)
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  async function addProduct(payload) {
    const created = await productService.createProduct(payload)
    await refresh()
    return created
  }

  async function editProduct(id, payload) {
    const updated = await productService.updateProduct(id, payload)
    await refresh()
    return updated
  }

  async function removeProduct(id) {
    await productService.deleteProduct(id)
    await refresh()
  }

  async function resetAll() {
    await productService.resetProducts()
    await refresh()
  }

  function getById(id) {
    return products.find((p) => p.id === id) || null
  }

  function getRelated(product, limit = 4) {
    return products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, limit)
  }

  return (
    <ProductsContext.Provider
      value={{ products, loading, addProduct, editProduct, removeProduct, resetAll, refresh, getById, getRelated }}
    >
      {children}
    </ProductsContext.Provider>
  )
}

export function useProducts() {
  const ctx = useContext(ProductsContext)
  if (!ctx) throw new Error('useProducts must be used within ProductsProvider')
  return ctx
}
