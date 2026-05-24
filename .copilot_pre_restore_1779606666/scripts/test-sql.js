import('../src/app/api/utils/sql.js').then(async (mod)=>{
  const sql = mod.default;
  console.log('sql type:', typeof sql);
  try{
    const res = await sql`SELECT 1`;
    console.log('query succeeded', res);
  }catch(e){
    console.error('query failed', e && e.message ? e.message : e);
  }
}).catch(e=>{console.error('load error', e)});
