import { createClient } from '@supabase/supabase-js';

// Fallback kredensial default (harus sinkron dengan .env.example)
const DEFAULT_SUPABASE_URL = 'https://kmyrknrjcjmmqpknkdwf.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_JouVWnRpwtN3BN3UP5sjzA_hWU_9jic';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('ERROR: Kredensial Supabase tidak ditemukan! Set VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY di Environment Variables.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
