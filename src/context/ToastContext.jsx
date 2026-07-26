import { createContext, useCallback, useContext, useState } from 'react'
import { CheckCircle2, XCircle } from 'lucide-react'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random()
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 2400)
  }, [])

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed bottom-28 md:bottom-5 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 items-center w-full px-4 sm:px-0 sm:w-auto">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="flex items-center gap-2 bg-cacao-900 text-cream-50 text-sm font-medium px-4 py-3 rounded-lg shadow-lg animate-[fadeIn_.2s_ease]"
          >
            {t.type === 'error' ? (
              <XCircle size={16} className="text-rose-500 shrink-0" />
            ) : (
              <CheckCircle2 size={16} className="text-gold-400 shrink-0" />
            )}
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
