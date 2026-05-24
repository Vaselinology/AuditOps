import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

function parseEnv(path) {
  const src = fs.readFileSync(path, 'utf8');
  const lines = src.split(/\r?\n/);
  const out = {};
  for (const line of lines) {
    const m = line.match(/^([^=]+)=(.*)$/);
    if (m) out[m[1].trim()] = m[2].trim();
  }
  return out;
}

(async function(){
  try {
    const env = parseEnv('./.env');
    const url = env.VITE_SUPABASE_URL;
    const key = env.VITE_SUPABASE_ANON_KEY;
    if (!url || !key) {
      console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env');
      process.exit(2);
    }
    const supabase = createClient(url, key);
    console.log('Running test query: select id from users (limit 1)');
    const res = await supabase.from('users').select('id').limit(1).throwOnError();
    console.log('Data sample:', JSON.stringify(res.data?.slice(0,1) ?? null));
    process.exit(0);
  } catch (err) {
    if (err && typeof err === 'object' && 'message' in err) {
      console.error('Error:', err.message || err);
    } else {
      console.error('Unexpected error:', err);
    }
    process.exit(1);
  }
})();
