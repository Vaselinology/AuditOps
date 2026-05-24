import { Pool } from 'pg';

// Create a singleton Pool using DATABASE_URL. Pool handles connection pooling.
const connectionString = process.env.DATABASE_URL || null;
let pool = null;
if (connectionString) {
  pool = new Pool({ connectionString });
}

async function sql(strings, ...values) {
  if (!pool) {
    const err = new Error('No database connection string was provided. Please set DATABASE_URL');
    throw err;
  }

  // Tagged template usage: sql`SELECT * FROM users WHERE id=${id}`
  if (Array.isArray(strings) && strings.raw !== undefined) {
    // Build parameterized query with $1, $2, ... placeholders
    let text = '';
    const params = [];
    for (let i = 0; i < strings.length; i++) {
      text += strings[i];
      if (i < values.length) {
        params.push(values[i]);
        text += `$${params.length}`;
      }
    }
    const res = await pool.query(text, params);
    // Return rows similar to neon's behavior
    return res.rows;
  }

  // Function call usage: sql(query, params)
  if (typeof strings === 'string') {
    const text = strings;
    const params = values[0] || [];
    const res = await pool.query(text, params);
    return res.rows;
  }

  throw new Error('Unsupported sql invocation');
}

// Provide a transaction helper compatible with previous usage
sql.transaction = async function (callback) {
  if (!pool) throw new Error('No database connection string was provided. Please set DATABASE_URL');
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    try {
      await client.query('ROLLBACK');
    } catch (e) {
      // ignore
    }
    throw err;
  } finally {
    client.release();
  }
};

export default sql;