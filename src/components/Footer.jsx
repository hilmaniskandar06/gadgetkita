import { Link } from 'react-router-dom'
import { useSiteContent } from '../context/SiteContentContext'
import { Instagram, Facebook, Twitter } from 'lucide-react'

const TiktokIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
  </svg>
)

const WhatsappIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
  </svg>
)

function normalizeWhatsappLink(raw) {
  if (!raw || typeof raw !== 'string') return null
  const value = raw.trim()
  if (!value) return null
  if (/^https?:\/\//i.test(value)) return value
  const digitsOnly = value.replace(/\D/g, '')
  if (!digitsOnly) return value
  let phone = digitsOnly
  if (phone.startsWith('0')) phone = '62' + phone.slice(1)
  if (phone.startsWith('8')) phone = '62' + phone
  return `https://wa.me/${phone}`
}

export default function Footer() {
  const { content } = useSiteContent()

  return (
    <footer className="bg-black text-gray-100 mt-20 text-center">
      <div className="max-w-2xl mx-auto px-5 py-14 flex flex-col items-center">
        <Link to="/" className="inline-block mb-6">
          {content.logoLight || content.shopLogo ? (
            <img
              src={content.logoLight || content.shopLogo}
              alt={content.shopName}
              className={`h-10 w-auto object-contain mx-auto ${content.logoLight ? '' : 'brightness-0 invert'}`}
            />
          ) : (
            <span className="font-display font-extrabold text-2xl text-white block tracking-widest uppercase">{content.shopName || 'GADGETKITA'}</span>
          )}
        </Link>

        <p className="text-sm text-gray-200/70 leading-relaxed mb-8 max-w-md">
          {content.footerDescription}
        </p>

        <div className="flex items-center justify-center gap-3">
          {content.socialInstagram && (
            <a href={content.socialInstagram} target="_blank" rel="noreferrer" className="w-10 h-10 border border-white/20 flex items-center justify-center hover:bg-white hover:text-black transition-colors">
              <Instagram size={18} />
            </a>
          )}
          {(() => {
            const wa = normalizeWhatsappLink(content.whatsappLink)
            if (!wa) return null
            return (
              <a href={wa} target="_blank" rel="noreferrer" className="w-10 h-10 border border-white/20 flex items-center justify-center hover:bg-white hover:text-black transition-colors">
                <WhatsappIcon />
              </a>
            )
          })()}
          {content.socialFacebook && (
            <a href={content.socialFacebook} target="_blank" rel="noreferrer" className="w-10 h-10 border border-white/20 flex items-center justify-center hover:bg-white hover:text-black transition-colors">
              <Facebook size={18} />
            </a>
          )}
          {content.socialTiktok && (
            <a href={content.socialTiktok} target="_blank" rel="noreferrer" className="w-10 h-10 border border-white/20 flex items-center justify-center hover:bg-white hover:text-black transition-colors">
              <TiktokIcon />
            </a>
          )}
          {content.socialTwitter && (
            <a href={content.socialTwitter} target="_blank" rel="noreferrer" className="w-10 h-10 border border-white/20 flex items-center justify-center hover:bg-white hover:text-black transition-colors">
              <Twitter size={18} />
            </a>
          )}
        </div>
      </div>
      <div className="border-t border-white/10 py-5 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-200/50 px-8">
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
          <Link to="/halaman/about-us" className="hover:text-white transition-colors">About Us</Link>
          <Link to="/halaman/faq" className="hover:text-white transition-colors">FAQ</Link>
          <Link to="/halaman/term-of-service" className="hover:text-white transition-colors">Term of Service</Link>
          <Link to="/halaman/refund-policy" className="hover:text-white transition-colors">Refund Policy</Link>
          <Link to="/halaman/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link>
          <Link to="/halaman/cookie-policy" className="hover:text-white transition-colors">Cookie Policy</Link>
          <span aria-hidden="true" className="hidden md:inline">·</span>
          <Link to="/admin" className="hover:text-white transition-colors">Admin</Link>
        </div>
        <span>© {new Date().getFullYear()} {content.shopName || 'GadgetKita'}. Semua hak dilindungi.</span>
      </div>
    </footer>
  )
}
