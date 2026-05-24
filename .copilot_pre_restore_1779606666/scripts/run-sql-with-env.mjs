import fs from 'fs';

function loadEnv(path) {
  if (!fs.existsSync(path)) return;
  const src = fs.readFileSync(path, 'utf8');
  for (const line of src.split(/\r?\n/)) {
    if (!line || line.trim().startsWith('#')) continue;
    const m = line.match(/^([^=]+)=(.*)$/);
    if (m) {
      const k = m[1].trim();
      const v = m[2].trim();
      // don't overwrite existing env
      if (!process.env[k]) process.env[k] = v;
    }
  }
}

loadEnv('.env');
console.log('DATABASE_URL present:', !!process.env.DATABASE_URL);

try {
  const mod = await import('../src/app/api/utils/sql.js');
  const sql = mod.default;
  try {
    const res = await sql`SELECT 1`;
    console.log('sql query result:', res);
  } catch (err) {
    console.error('sql query error message:', err && err.message ? err.message : err);
    try { console.error('sql query error full:', JSON.stringify(err, Object.getOwnPropertyNames(err), 2)); } catch(e) { console.error(err); }
    console.error('error stack:', err && err.stack ? err.stack : 'no stack');
    process.exit(1);
  }
} catch (err) {
  console.error('failed to import sql module message:', err && err.message ? err.message : err);
  console.error('failed to import sql module full:', err);
  process.exit(1);
}
