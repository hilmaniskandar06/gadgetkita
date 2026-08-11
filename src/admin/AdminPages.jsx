import { useEffect, useState } from 'react'
import AdminShell from './AdminShell'
import { useSiteContent } from '../context/SiteContentContext'
import { useToast } from '../context/ToastContext'
import RichTextEditor from '../components/RichTextEditor'

const PAGES = [
  { key: 'pageAbout', label: 'About Us', slug: 'about-us' },
  { key: 'pageFaq', label: 'FAQ', slug: 'faq' },
  { key: 'pageTos', label: 'Term of Service', slug: 'term-of-service' },
  { key: 'pageRefund', label: 'Refund Policy', slug: 'refund-policy' },
  { key: 'pagePrivacy', label: 'Privacy Policy', slug: 'privacy-policy' },
  { key: 'pageCookie', label: 'Cookie Policy', slug: 'cookie-policy' },
]

export default function AdminPages() {
  const { content, loading, updateContent } = useSiteContent()
  const { addToast } = useToast()
  
  const [form, setForm] = useState(content)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState(PAGES[0].key)

  useEffect(() => {
    if (!loading) setForm(content)
  }, [loading, content])

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    try {
      await updateContent({
        pageAbout: form.pageAbout,
        pageFaq: form.pageFaq,
        pageTos: form.pageTos,
        pageRefund: form.pageRefund,
        pagePrivacy: form.pagePrivacy,
        pageCookie: form.pageCookie
      })
      addToast('Konten halaman statis berhasil disimpan')
    } catch (err) {
      addToast(err.message || 'Gagal menyimpan', 'error')
    }
    setSaving(false)
  }

  if (loading) {
    return (
      <AdminShell title="Halaman Statis">
        <p className="text-sm text-slate-600">Memuat...</p>
      </AdminShell>
    )
  }

  const activePage = PAGES.find(p => p.key === activeTab)

  return (
    <AdminShell title="Halaman Statis">
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden flex flex-col md:flex-row min-h-[500px]">
        {/* Sidebar tabs */}
        <div className="w-full md:w-56 bg-gray-50 border-b md:border-b-0 md:border-r border-gray-200 flex flex-col">
          {PAGES.map(p => (
            <button
              key={p.key}
              type="button"
              onClick={() => setActiveTab(p.key)}
              className={`text-left px-4 py-3 text-sm font-semibold border-l-4 transition-colors ${
                activeTab === p.key 
                ? 'border-lime-500 bg-white text-slate-900' 
                : 'border-transparent text-slate-600 hover:bg-gray-100'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
        
        {/* Editor Area */}
        <div className="flex-1 p-6 flex flex-col bg-white">
          <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-bold text-lg text-slate-900">{activePage.label}</h2>
                <p className="text-xs text-slate-500 font-mono mt-0.5">/halaman/{activePage.slug}</p>
              </div>
              <button 
                type="submit" 
                disabled={saving}
                className="bg-lime-500 hover:bg-lime-400 text-slate-900 font-bold px-5 py-2 rounded-lg text-sm transition-colors disabled:opacity-50"
              >
                {saving ? 'Menyimpan...' : 'Simpan Halaman'}
              </button>
            </div>
            
            <div className="flex-1">
              <RichTextEditor 
                value={form[activeTab] || ''} 
                onChange={(val) => setForm(s => ({ ...s, [activeTab]: val }))} 
              />
            </div>
            
            <p className="text-xs text-slate-500 mt-4 text-center">
              Perubahan akan langsung terlihat di website pembeli setelah disimpan.
            </p>
          </form>
        </div>
      </div>
    </AdminShell>
  )
}
