const { Pool } = require('pg');
require('dotenv').config();

// Database SSL configuration
const useSSL = process.env.DB_SSL === 'true' ||
  (process.env.NODE_ENV === 'production' &&
    !process.env.DATABASE_URL?.includes('localhost') &&
    !process.env.DATABASE_URL?.includes('postgres'));

console.log(`📡 Database attempt: ${process.env.DATABASE_URL?.split('@')[1] || 'URL hidden'} | SSL: ${useSSL}`);

// Create PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: useSSL ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

// Test connection
pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected error on idle client', err);
  process.exit(-1);
});

// Query helper function
const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};

module.exports = {
  query,
  pool,
};
