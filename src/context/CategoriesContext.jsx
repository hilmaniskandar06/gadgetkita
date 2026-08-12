import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import * as categoryService from '../services/categoryService'

const CategoriesContext = createContext(null)

export function CategoriesProvider({ children }) {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    try {
      setLoading(true)
      const list = await categoryService.listCategories()
      setCategories(list || [])
    } catch (err) {
      console.error('CategoriesProvider refresh error:', err)
      setCategories([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try { await refresh() } catch (_) {}
    })()
    return () => { mounted = false }
  }, [refresh])

  async function addCategory(categoryObj) {
    const next = await categoryService.addCategory(categoryObj)
    setCategories(next)
    return next
  }

  async function updateCategory(oldName, updatedObj) {
    const next = await categoryService.updateCategory(oldName, updatedObj)
    setCategories(next)
    return next
  }

  async function removeCategory(name) {
    const next = await categoryService.deleteCategory(name)
    setCategories(next)
    return next
  }

  return (
    <CategoriesContext.Provider value={{ categories, loading, addCategory, updateCategory, removeCategory, refresh }}>
      {children}
    </CategoriesContext.Provider>
  )
}

export function useCategories() {
  const ctx = useContext(CategoriesContext)
  if (!ctx) throw new Error('useCategories must be used within CategoriesProvider')
  return ctx
}
