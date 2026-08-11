import { supabase } from '../config/supabase'

export const DEFAULT_CONTENT = {
  heroEyebrow: 'Perlengkapan Olahraga Premium',
  heroTitle: 'Bergerak Lebih Jauh, Tampil Lebih Percaya Diri.',
  heroSubtitle: 'Koleksi sepatu lari, jersey, baju fitness, dan alat olahraga kualitas terbaik untuk performa maksimalmu setiap hari.',
  footerDescription: 'Toko perlengkapan olahraga terlengkap untuk atlet dan pecinta olahraga dari semua kalangan.',
  footerEmail: 'hello@sportkita.id',
  footerAddress: 'Bandung, Indonesia',
  shippingFee: 15000,
  serviceFee: 0,
  heroMedia: '',
  heroMediaType: 'image',
  shopName: 'SPORTKITA',
  shopLogo: '',
  logoDark: '',
  logoLight: '',
  appDownloadBannerText: 'Download Aplikasi SPORTKITA',
  appDownloadLink: '',
  socialInstagram: 'https://instagram.com/sportkita',
  whatsappLink: '',
  socialFacebook: '',
  socialTiktok: '',
  socialTwitter: '',
  pageAbout: '<p>Tentang SPORTKITA, toko perlengkapan olahraga terpercaya.</p>',
  pageFaq: '<h2>Tanya Jawab</h2>',
  pageTos: '<p>Syarat dan Ketentuan layanan SPORTKITA.</p>',
  pageRefund: '<p>Kebijakan pengembalian dana.</p>',
  pagePrivacy: '<p>Kebijakan privasi.</p>',
  pageCookie: '<p>Kebijakan penggunaan cookie.</p>',
  brandLogos: [],
}

export async function getContent() {
  try {
    const { data, error } = await supabase
      .from('site_settings')
      .select('data')
      .eq('id', 1)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('Failed to fetch site settings:', error)
      return DEFAULT_CONTENT
    }

    if (data && data.data) {
      return { ...DEFAULT_CONTENT, ...data.data }
    }
  } catch (err) {
    console.error(err)
  }
  return DEFAULT_CONTENT
}

export async function updateContent(partial) {
  try {
    const current = await getContent()
    const next = { ...current, ...partial }

    const { error } = await supabase
      .from('site_settings')
      .upsert({ id: 1, data: next })

    if (error) throw new Error(error.message)
    return next
  } catch (err) {
    console.error(err)
    throw err
  }
}

