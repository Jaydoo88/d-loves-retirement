import { createClient } from '@supabase/supabase-js';

// Sometimes Vite environment variables are lost in this specific setup, 
// so we'll grab them from the global window object if they were injected,
// or fallback to the known public Supabase URL.
let supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
let supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl && typeof window !== 'undefined' && (window as any).ENV) {
    const env = (window as any).ENV;
    if (env.VITE_SUPABASE_URL && !env.VITE_SUPABASE_URL.startsWith('%%')) {
        supabaseUrl = env.VITE_SUPABASE_URL;
    }
    if (env.VITE_SUPABASE_ANON_KEY && !env.VITE_SUPABASE_ANON_KEY.startsWith('%%')) {
        supabaseKey = env.VITE_SUPABASE_ANON_KEY;
    }
}

// Hardcode as a last resort since these are public keys anyway
if (!supabaseUrl) supabaseUrl = 'https://ousuvbrcuuzazetusmjh.supabase.co';
// The key below is a dummy key so the app doesn't crash entirely. Actual database calls will fail if the real key isn't provided.
if (!supabaseKey) {
    supabaseKey = 'dummy_key_to_prevent_crash_please_add_real_key';
}

export const supabase = createClient(supabaseUrl, supabaseKey);

setTimeout(() => {
  if (supabaseKey === 'dummy_key_to_prevent_crash_please_add_real_key') {
    console.error("Supabase Environment Variables Missing! 🚨");
    console.error("Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your Replit Secrets and restart the server.");
  }
}, 1000);
