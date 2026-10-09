const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Read .env.local or .env
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
    console.log('Connected to database. Applying attribution columns migration...');

    await client.query(`
      ALTER TABLE user_info
        ADD COLUMN IF NOT EXISTS first_source VARCHAR(64) DEFAULT '',
        ADD COLUMN IF NOT EXISTS first_medium VARCHAR(64) DEFAULT '',
        ADD COLUMN IF NOT EXISTS first_campaign VARCHAR(128) DEFAULT '',
        ADD COLUMN IF NOT EXISTS first_referrer VARCHAR(255) DEFAULT '',
        ADD COLUMN IF NOT EXISTS first_landing VARCHAR(255) DEFAULT '',
        ADD COLUMN IF NOT EXISTS first_touch_at BIGINT DEFAULT 0,
        ADD COLUMN IF NOT EXISTS last_source VARCHAR(64) DEFAULT '',
        ADD COLUMN IF NOT EXISTS last_medium VARCHAR(64) DEFAULT '',
        ADD COLUMN IF NOT EXISTS last_campaign VARCHAR(128) DEFAULT '',
        ADD COLUMN IF NOT EXISTS register_country VARCHAR(64) DEFAULT '',
        ADD COLUMN IF NOT EXISTS register_device VARCHAR(32) DEFAULT '',
        ADD COLUMN IF NOT EXISTS register_os VARCHAR(32) DEFAULT '',
        ADD COLUMN IF NOT EXISTS register_browser VARCHAR(32) DEFAULT '',
        ADD COLUMN IF NOT EXISTS register_lang VARCHAR(32) DEFAULT '';

      CREATE INDEX IF NOT EXISTS idx_user_info_first_source ON user_info(first_source);
      CREATE INDEX IF NOT EXISTS idx_user_info_register_country ON user_info(register_country);
      CREATE INDEX IF NOT EXISTS idx_user_info_first_touch_at ON user_info(first_touch_at);
    `);

    console.log('Migration successful: user_info table updated with attribution and fingerprint fields!');

    // Check columns
    const checkRes = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'user_info'
      ORDER BY ordinal_position;
    `);
    console.log('Current columns in user_info:');
    checkRes.rows.forEach(r => console.log(` - ${r.column_name} (${r.data_type})`));

    client.release();
  } catch (e) {
    console.error('Migration failed:', e.message);
  } finally {
    await pool.end();
  }
}

main();
