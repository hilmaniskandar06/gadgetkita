import { createContext, useContext, useEffect, useState } from 'react'
import * as siteContentService from '../services/siteContentService'
import { DEFAULT_CONTENT } from '../services/siteContentService'

const SiteContentContext = createContext(null)

export function SiteContentProvider({ children }) {
  const [content, setContent] = useState(DEFAULT_CONTENT)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const c = await siteContentService.getContent()
        if (mounted) {
          setContent(c)
          setLoading(false)
        }
      } catch (err) {
        console.error('SiteContentProvider init error:', err)
        if (mounted) setLoading(false)
      }
    })()
    return () => { mounted = false }
  }, [])

  async function updateContent(partial) {
    try {
      const next = await siteContentService.updateContent(partial)
      setContent(next)
      return next
    } catch (err) {
      console.error('updateContent error:', err)
      throw err
    }
  }

  // SELALU render children. JANGAN sembunyikan, karena akan menyebabkan
  // unmount semua provider nested (Products, Cart, Wishlist, dll)
  // yang memicu React #300 error.
  return (
    <SiteContentContext.Provider value={{ content, loading, updateContent }}>
      {children}
    </SiteContentContext.Provider>
  )
}

export function useSiteContent() {
  const ctx = useContext(SiteContentContext)
  if (!ctx) throw new Error('useSiteContent must be used within SiteContentProvider')
  return ctx
}
