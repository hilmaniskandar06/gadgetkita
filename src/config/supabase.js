import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://kmyrknrjcjmmqpknkdwf.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_JouVWnRpwtN3BN3UP5sjzA_hWU_9jic';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
