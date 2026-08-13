import { createClient } from '@supabase/supabase-js';

// ⚠️ JANGAN ADA FALLBACK KE PROJECT LAIN! Jika env tidak tersedia,
// wajib ERROR TEGAS agar user tahu harus perbaiki environment variables.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  const msg = 'ERROR KRITIS: VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY TIDAK DITEMUKAN. Cek file .env.local atau Environment Variables Vercel.';
  console.error('❌❌❌ ' + msg);
  if (typeof window !== 'undefined') {
    try { alert(msg) } catch (_) {}
  }
  throw new Error(msg);
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // ⭐ CUSTOM STORAGE KEY: agar JWT session LAMA (dari project SportKita / sisa debug)
    // di domain yang sama TIDAK TERBACA. Otomatis user baru generate session BERSIH.
    // Ini SOLUSI UTAMA error "JWT issued at future" di production karena token bentrok.
    storageKey: 'gadgetkita_auth_v1',
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
