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
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
