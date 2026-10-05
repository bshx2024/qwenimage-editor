const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Read .env.local
let connString = process.env.POSTGRES_URL || process.env.DATABASE_URL;
if (!connString && fs.existsSync('.env.local')) {
  const envContent = fs.readFileSync('.env.local', 'utf8');
  for (const line of envContent.split('\n')) {
    const match = line.match(/^\s*(POSTGRES_URL|DATABASE_URL)\s*=\s*"?([^"\r\n]+)"?/);
    if (match) {
      connString = match[2];
      break;
    }
  }
}

if (!connString) {
  console.log('No database connection string found in environment or .env.local');
  process.exit(0);
}

const pool = new Pool({
  connectionString: connString,
  ssl: { rejectUnauthorized: false }
});

async function main() {
  try {
    const client = await pool.connect();
    await client.query(`
      CREATE TABLE IF NOT EXISTS payment_orders (
        id SERIAL PRIMARY KEY,
        order_id VARCHAR(128) UNIQUE NOT NULL,
        provider VARCHAR(32) NOT NULL DEFAULT 'waffo',
        user_id VARCHAR(128) NOT NULL,
        user_email VARCHAR(255),
        amount NUMERIC(10, 2),
        currency VARCHAR(16) DEFAULT 'USD',
        status VARCHAR(32) NOT NULL,
        plan_id VARCHAR(128),
        credits_added INTEGER DEFAULT 0,
        raw_payload JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_payment_orders_user ON payment_orders(user_id);
    `);
    console.log('Neon DB: payment_orders table and index created successfully!');
    client.release();
  } catch (e) {
    console.error('Database query error:', e.message);
  } finally {
    await pool.end();
  }
}

main();
