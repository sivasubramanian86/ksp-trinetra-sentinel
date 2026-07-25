/**
 * PostgreSQL Connection Pool Manager
 * KSP Trinetra Sentinel - Zoho Catalyst API Gateway
 */

const { Pool } = require('pg');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/trinetra_db';

let pool = null;
let isConnected = false;

try {
  pool = new Pool({
    connectionString,
    ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  });

  pool.on('error', (err) => {
    console.error('[DB Pool Warning] Unexpected database pool error:', err.message);
    isConnected = false;
  });

  // Basic connection probe
  pool.query('SELECT NOW()', (err, res) => {
    if (err) {
      console.warn('[DB Pool Warning] PostgreSQL connection failed. Operating in Mock/Local Fallback mode:', err.message);
      isConnected = false;
    } else {
      console.log('[DB Pool] Connected to PostgreSQL successfully at:', res.rows[0].now);
      isConnected = true;
    }
  });
} catch (e) {
  console.warn('[DB Pool Warning] Pool initialization error. Fallback mode active:', e.message);
}

/**
 * Execute SQL Query with optional parameters.
 */
async function query(text, params) {
  if (!pool || !isConnected) {
    throw new Error('Database pool not connected. Use fallback handler or check DATABASE_URL.');
  }
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  console.log('[DB Query]', { text: text.substring(0, 80), duration: `${duration}ms`, rows: res.rowCount });
  return res;
}

module.exports = {
  query,
  getIsConnected: () => isConnected,
  pool
};
