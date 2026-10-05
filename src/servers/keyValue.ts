import { getDb } from '~/libs/db';

export async function ensureKeyValueTable(): Promise<void> {
  try {
    const db = getDb();
    await db.query(`
      CREATE TABLE IF NOT EXISTS key_value (
        id SERIAL PRIMARY KEY,
        name VARCHAR(128),
        key VARCHAR(128),
        value TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      ALTER TABLE key_value ADD COLUMN IF NOT EXISTS name VARCHAR(128);
      ALTER TABLE key_value ADD COLUMN IF NOT EXISTS key VARCHAR(128);
      CREATE INDEX IF NOT EXISTS idx_key_value_name ON key_value(name);
      CREATE INDEX IF NOT EXISTS idx_key_value_key ON key_value(key);
    `);
  } catch (err: any) {
    console.warn('DB ensureKeyValueTable warning:', err?.message);
  }
}

export async function getSetting(name: string, fallbackEnvVar?: string): Promise<string> {
  await ensureKeyValueTable();
  try {
    const db = getDb();
    const res = await db.query(
      'SELECT value FROM key_value WHERE name = $1 OR key = $1 LIMIT 1',
      [name]
    );
    if (res.rows.length > 0 && res.rows[0].value !== null && res.rows[0].value !== '') {
      return res.rows[0].value;
    }
  } catch (err: any) {
    console.warn(`Error getting setting "${name}" from DB:`, err?.message);
  }

  // Fallback to environment variable if DB has no value
  if (fallbackEnvVar && process.env[fallbackEnvVar]) {
    return process.env[fallbackEnvVar] || '';
  }
  return '';
}

export async function setSetting(name: string, value: string): Promise<void> {
  await ensureKeyValueTable();
  try {
    const db = getDb();
    const res = await db.query(
      'SELECT id FROM key_value WHERE name = $1 OR key = $1 LIMIT 1',
      [name]
    );
    if (res.rows.length > 0) {
      await db.query(
        'UPDATE key_value SET value = $1, name = $2, key = $2, updated_at = NOW() WHERE id = $3',
        [value, name, res.rows[0].id]
      );
    } else {
      await db.query(
        'INSERT INTO key_value (name, key, value, updated_at) VALUES ($1, $1, $2, NOW())',
        [name, value]
      );
    }
  } catch (err: any) {
    console.error(`Error setting "${name}" in DB:`, err?.message);
    throw err;
  }
}

export const countSticker = async (key: string, addCount: number) => {
  await ensureKeyValueTable();
  try {
    const db = getDb();
    const results = await db.query('SELECT * FROM key_value WHERE key = $1 OR name = $1 LIMIT 1', [key]);
    const rows = results.rows;
    if (rows.length <= 0) {
      await db.query('INSERT INTO key_value(name, key, value) VALUES ($1, $1, $2)', [key, String(addCount)]);
    } else {
      const origin = rows[0];
      const newCount = Number(origin.value || 0) + addCount;
      await db.query('UPDATE key_value SET value = $1 WHERE id = $2', [String(newCount), origin.id]);
    }
  } catch (err: any) {
    console.warn('DB countSticker error:', err?.message);
  }
};

export const getCountSticker = async (): Promise<string> => {
  try {
    const db = getDb();
    const results = await db.query('SELECT value FROM key_value WHERE key = $1 OR name = $1 LIMIT 1', ['countSticker']);
    const rows = results.rows;
    if (rows.length > 0 && rows[0].value) {
      return rows[0].value;
    }
  } catch (e: any) {
    console.warn('DB getCountSticker error, falling back:', e?.message);
  }
  return '2500';
};

export interface AISettings {
  provider: 'bailian' | 'replicate';
  bailianApiKey: string;
  bailianBaseUrl: string;
  bailianModel: string;
  replicateToken: string;
}

export async function getAISettings(): Promise<AISettings> {
  const [provider, bailianApiKey, bailianBaseUrl, bailianModel, replicateToken] = await Promise.all([
    getSetting('AI_PROVIDER', 'AI_PROVIDER'),
    getSetting('BAILIAN_API_KEY', 'BAILIAN_API_KEY'),
    getSetting('BAILIAN_BASE_URL', 'BAILIAN_BASE_URL'),
    getSetting('BAILIAN_MODEL', 'BAILIAN_MODEL'),
    getSetting('REPLICATE_API_TOKEN', 'REPLICATE_API_TOKEN'),
  ]);

  return {
    provider: (provider === 'replicate' ? 'replicate' : 'bailian'),
    bailianApiKey: bailianApiKey || process.env.DASHSCOPE_API_KEY || '',
    bailianBaseUrl: bailianBaseUrl || 'https://dashscope.aliyuncs.com',
    bailianModel: bailianModel || 'wanx2.1-t2i-turbo',
    replicateToken: replicateToken || process.env.REPLICATE_API_TOKEN || '',
  };
}

export async function saveAISettings(settings: Partial<AISettings>): Promise<void> {
  if (settings.provider !== undefined) {
    await setSetting('AI_PROVIDER', settings.provider);
  }
  if (settings.bailianApiKey !== undefined) {
    await setSetting('BAILIAN_API_KEY', settings.bailianApiKey);
  }
  if (settings.bailianBaseUrl !== undefined) {
    await setSetting('BAILIAN_BASE_URL', settings.bailianBaseUrl);
  }
  if (settings.bailianModel !== undefined) {
    await setSetting('BAILIAN_MODEL', settings.bailianModel);
  }
  if (settings.replicateToken !== undefined) {
    await setSetting('REPLICATE_API_TOKEN', settings.replicateToken);
  }
}
