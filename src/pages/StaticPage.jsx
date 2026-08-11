import { useParams, Navigate, Link } from 'react-router-dom'
import { useSiteContent } from '../context/SiteContentContext'
import { ChevronLeft } from 'lucide-react'

const SLUG_TO_KEY = {
  'about-us': { key: 'pageAbout', title: 'About Us' },
  'faq': { key: 'pageFaq', title: 'Frequently Asked Questions' },
  'term-of-service': { key: 'pageTos', title: 'Term of Service' },
  'refund-policy': { key: 'pageRefund', title: 'Refund Policy' },
  'privacy-policy': { key: 'pagePrivacy', title: 'Privacy Policy' },
  'cookie-policy': { key: 'pageCookie', title: 'Cookie Policy' },
}

export default function StaticPage() {
  const { slug } = useParams()
  const { content, loading } = useSiteContent()

  if (loading) {
    return <div className="max-w-3xl mx-auto px-5 py-24 text-center text-slate-500">Memuat halaman...</div>
  }

  const pageDef = SLUG_TO_KEY[slug]
  if (!pageDef) {
    return <Navigate to="/toko" replace />
  }

  const htmlContent = content[pageDef.key]

  return (
    <div className="max-w-4xl mx-auto px-5 lg:px-8 py-14">
      <Link to="/" className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-lime-600 font-semibold mb-8 transition-colors">
        <ChevronLeft size={16} /> Kembali
      </Link>
      
      <div className="bg-white border border-gray-200 rounded-2xl p-8 lg:p-12 shadow-sm">
        <h1 className="text-3xl font-extrabold text-slate-900 mb-8 pb-6 border-b border-gray-100">
          {pageDef.title}
        </h1>
        
        <div 
          className="prose prose-cacao max-w-none prose-headings:text-slate-900 prose-a:text-lime-600 prose-a:no-underline hover:prose-a:underline prose-img:rounded-xl"
          dangerouslySetInnerHTML={{ __html: htmlContent || '<p>Halaman ini belum diisi.</p>' }}
        />
      </div>
    </div>
  )
}
