import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ymrwiczatpedhkxfnfyn.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_DHuSN-EPTrpQ3yEkmhLwhg_hYPLKbhQ';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
