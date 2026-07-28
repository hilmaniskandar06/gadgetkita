import { supabase } from '../config/supabase'

export const DEFAULT_CONTENT = {
  heroEyebrow: '100% Kakao Asli Nusantara',
  heroTitle: 'Cokelat yang dibuat dengan niat, bukan cuma resep.',
  heroSubtitle: 'Setiap batang lahir dari biji kakao petani lokal, dipanggang perlahan, lalu dituang dengan tangan. Tidak ada jalan pintas — hanya rasa yang jujur.',
  footerDescription: 'Cokelat artisan dari biji kakao petani Nusantara, diproses dalam batch kecil.',
  footerEmail: 'hello@kakaokita.id',
  footerAddress: 'Bandung, Indonesia',
  shippingFee: 15000,
  serviceFee: 0,
  heroMedia: '',
  heroMediaType: 'image',
  shopName: 'Kakao Kita',
  shopLogo: '',
  logoDark: '',
  logoLight: '',
  appDownloadBannerText: 'Download Aplikasi Kakao Kita',
  appDownloadLink: '',
  socialInstagram: 'https://instagram.com/kakaokita',
  whatsappLink: '',
  socialFacebook: '',
  socialTiktok: '',
  socialTwitter: '',
  pageAbout: '<p>Cerita tentang Kakao Kita...</p>',
  pageFaq: '<h2>Tanya Jawab</h2>',
  pageTos: '<p>Syarat dan Ketentuan layanan Kakao Kita.</p>',
  pageRefund: '<p>Kebijakan pengembalian dana.</p>',
  pagePrivacy: '<p>Kebijakan privasi.</p>',
  pageCookie: '<p>Kebijakan penggunaan cookie.</p>',
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

