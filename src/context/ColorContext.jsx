import { createContext, useContext, useEffect, useState } from 'react'
import * as colorService from '../services/colorService'
import { useToast } from './ToastContext'

const ColorContext = createContext(null)

export function ColorProvider({ children }) {
  const [colors, setColors] = useState([])
  const [loading, setLoading] = useState(true)
  const { addToast } = useToast()

  async function loadColors() {
    try {
      const data = await colorService.getColors()
      setColors(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadColors()
  }, [])

  async function addColor(color) {
    try {
      const created = await colorService.createColor(color)
      setColors((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)))
      return created
    } catch (err) {
      addToast(err.message, 'error')
      throw err
    }
  }

  async function updateColor(id, updates) {
    try {
      const updated = await colorService.updateColor(id, updates)
      setColors((prev) => prev.map((c) => (c.id === id ? updated : c)).sort((a, b) => a.name.localeCompare(b.name)))
      return updated
    } catch (err) {
      addToast(err.message, 'error')
      throw err
    }
  }

  async function removeColor(id) {
    try {
      await colorService.deleteColor(id)
      setColors((prev) => prev.filter((c) => c.id !== id))
    } catch (err) {
      addToast(err.message, 'error')
      throw err
    }
  }

  return (
    <ColorContext.Provider value={{ colors, loading, addColor, updateColor, removeColor, reloadColors: loadColors }}>
      {children}
    </ColorContext.Provider>
  )
}

export const useColors = () => useContext(ColorContext)
