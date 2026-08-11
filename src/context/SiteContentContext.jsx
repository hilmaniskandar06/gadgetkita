import { createContext, useContext, useEffect, useState } from 'react'
import * as siteContentService from '../services/siteContentService'
import { DEFAULT_CONTENT } from '../services/siteContentService'

const SiteContentContext = createContext(null)

export function SiteContentProvider({ children }) {
  const [content, setContent] = useState(DEFAULT_CONTENT)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    siteContentService.getContent().then((c) => {
      setContent(c)
      setLoading(false)
    })
  }, [])

  async function updateContent(partial) {
    const next = await siteContentService.updateContent(partial)
    setContent(next)
    return next
  }

  return (
    <SiteContentContext.Provider value={{ content, loading, updateContent }}>
      {!loading ? children : (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-slate-600 rounded-full animate-spin"></div>
        </div>
      )}
    </SiteContentContext.Provider>
  )
}

export function useSiteContent() {
  const ctx = useContext(SiteContentContext)
  if (!ctx) throw new Error('useSiteContent must be used within SiteContentProvider')
  return ctx
}
