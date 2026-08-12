import { supabase } from '../config/supabase'

export const DEFAULT_CONTENT = {
  heroTitle: 'Lengkapi Gadgetmu, Maksimalkan Harimu.',
  footerDescription: 'Toko aksesoris HP terlengkap untuk semua kebutuhan gadgetmu — case, charger, earphone, powerbank, dan banyak lagi.',
  footerEmail: 'hello@gadgetkita.id',
  footerAddress: 'Bandung, Indonesia',
  shippingFee: 15000,
  serviceFee: 0,
  heroMedia: '',
  heroMediaType: 'image',
  heroOpacity: 20,
  shopName: 'GADGETKITA',
  shopLogo: '',
  logoDark: '',
  logoLight: '',
  appDownloadBannerText: 'Download Aplikasi GADGETKITA',
  appDownloadLink: '',
  socialInstagram: 'https://instagram.com/gadgetkita',
  whatsappLink: '',
  socialFacebook: '',
  socialTiktok: '',
  socialTwitter: '',
  pageAbout: '<p>Tentang GADGETKITA, toko aksesoris HP terpercaya.</p>',
  pageFaq: '<h2>Tanya Jawab</h2>',
  pageTos: '<p>Syarat dan Ketentuan layanan GADGETKITA.</p>',
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

