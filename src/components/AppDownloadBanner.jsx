import { useState } from 'react'
import { X } from 'lucide-react'

export default function AppDownloadBanner({ content }) {
  const [visible, setVisible] = useState(true)

  if (!visible) return null
  if (!content.appDownloadLink || !content.appDownloadLink.trim()) return null

  const text = (content.appDownloadBannerText || '').trim() || 'Download Aplikasi'

  return (
    <div className="md:hidden bg-cacao-900 text-white z-50">
      <div className="max-w-7xl mx-auto px-3 py-2.5 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setVisible(false)}
          aria-label="Tutup banner"
          className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
        >
          <X size={16} />
        </button>

        <p className="flex-1 text-xs font-medium text-white/95 truncate">
          {text}
        </p>

        <a
          href={content.appDownloadLink}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 px-3.5 py-1.5 bg-white text-cacao-900 text-xs font-bold rounded-full hover:bg-cream-100 transition-colors"
        >
          Download
        </a>
      </div>
    </div>
  )
}
