// productService.supabase.example.js
//
// CONTOH implementasi productService memakai Supabase (database sungguhan).
// File ini BELUM aktif — hanya template. Cara mengaktifkan:
//
// 1. Buat project gratis di https://supabase.com
// 2. Di SQL editor Supabase, jalankan skema dari README bagian "Migrasi ke Supabase"
// 3. Install SDK:  npm install @supabase/supabase-js
// 4. Buat file src/lib/supabaseClient.js:
//
//      import { createClient } from '@supabase/supabase-js'
//      export const supabase = createClient(
//        import.meta.env.VITE_SUPABASE_URL,
//        import.meta.env.VITE_SUPABASE_ANON_KEY
//      )
//
// 5. Ganti isi src/services/productService.js dengan isi file ini
//    (hapus akhiran .supabase.example dari nama file, atau copy-paste isinya).
//
// Karena nama & bentuk fungsi PERSIS sama dengan versi localStorage,
// ProductsContext dan seluruh halaman lain tidak perlu diubah sama sekali.

import { supabase } from '../lib/supabaseClient'

export async function listProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function getProduct(id) {
  const { data, error } = await supabase.from('products').select('*').eq('id', id).single()
  if (error) return null
  return data
}

export async function createProduct(payload) {
  const { data, error } = await supabase.from('products').insert(payload).select().single()
  if (error) throw error
  return data
}

export async function updateProduct(id, payload) {
  const { data, error } = await supabase
    .from('products')
    .update(payload)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteProduct(id) {
  const { error } = await supabase.from('products').delete().eq('id', id)
  if (error) throw error
  return true
}

// Tidak relevan untuk Supabase — kelola/reset data awal lewat SQL seed langsung di database.
export async function resetProducts() {
  throw new Error('resetProducts tidak tersedia pada versi Supabase.')
}
