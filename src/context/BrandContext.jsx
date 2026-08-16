import { createContext, useContext, useEffect, useState } from 'react'
import * as brandService from '../services/brandService'
import { useToast } from './ToastContext'

const BrandContext = createContext(null)

export function BrandProvider({ children }) {
  const [brands, setBrands] = useState([])
  const [loading, setLoading] = useState(true)
  const { addToast } = useToast()

  async function loadBrands() {
    try {
      const data = await brandService.getBrands()
      setBrands(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadBrands()
  }, [])

  async function addBrand(brand) {
    try {
      const created = await brandService.createBrand(brand)
      setBrands((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)))
      return created
    } catch (err) {
      addToast(err.message, 'error')
      throw err
    }
  }

  async function updateBrand(id, updates) {
    try {
      const updated = await brandService.updateBrand(id, updates)
      setBrands((prev) => prev.map((b) => (b.id === id ? updated : b)).sort((a, b) => a.name.localeCompare(b.name)))
      return updated
    } catch (err) {
      addToast(err.message, 'error')
      throw err
    }
  }

  async function removeBrand(id) {
    try {
      await brandService.deleteBrand(id)
      setBrands((prev) => prev.filter((b) => b.id !== id))
    } catch (err) {
      addToast(err.message, 'error')
      throw err
    }
  }

  return (
    <BrandContext.Provider value={{ brands, loading, addBrand, updateBrand, removeBrand, reloadBrands: loadBrands }}>
      {children}
    </BrandContext.Provider>
  )
}

export const useBrands = () => useContext(BrandContext)
