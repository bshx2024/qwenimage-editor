import { getDb } from '~/libs/db';

export async function ensureKeyValueTable(): Promise<void> {
  try {
    const db = getDb();
    await db.query(`
      CREATE TABLE IF NOT EXISTS key_value (
        key VARCHAR(255) PRIMARY KEY,
        value TEXT
      );
    `);
  } catch (err: any) {
    console.warn('DB ensureKeyValueTable warning:', err?.message);
  }
}

export async function getSetting(settingKey: string, fallbackEnvVar?: string): Promise<string> {
  try {
    const db = getDb();
    const res = await db.query(
      'SELECT value FROM key_value WHERE key = $1 LIMIT 1',
      [settingKey]
    );
    if (res.rows.length > 0 && res.rows[0].value !== null && res.rows[0].value !== '') {
      return res.rows[0].value;
    }
  } catch (err: any) {
    console.warn(`Error getting setting "${settingKey}" from DB:`, err?.message);
  }

  // Fallback to environment variable if DB has no value
  if (fallbackEnvVar && process.env[fallbackEnvVar]) {
    return process.env[fallbackEnvVar] || '';
  }
  return '';
}

export async function setSetting(settingKey: string, value: string): Promise<void> {
  await ensureKeyValueTable();
  try {
    const db = getDb();
    const res = await db.query(
      'SELECT value FROM key_value WHERE key = $1 LIMIT 1',
      [settingKey]
    );
    if (res.rows.length > 0) {
      await db.query(
        'UPDATE key_value SET value = $1 WHERE key = $2',
        [value, settingKey]
      );
    } else {
      await db.query(
        'INSERT INTO key_value (key, value) VALUES ($1, $2)',
        [settingKey, value]
      );
    }
  } catch (err: any) {
    console.error(`Error setting "${settingKey}" in DB:`, err?.message);
    throw err;
  }
}

export const countSticker = async (key: string, addCount: number) => {
  try {
    const db = getDb();
    const results = await db.query('SELECT value FROM key_value WHERE key = $1 LIMIT 1', [key]);
    const rows = results.rows;
    if (rows.length <= 0) {
      await db.query('INSERT INTO key_value (key, value) VALUES ($1, $2)', [key, String(addCount)]);
    } else {
      const origin = rows[0];
      const newCount = Number(origin.value || 0) + addCount;
      await db.query('UPDATE key_value SET value = $1 WHERE key = $2', [String(newCount), key]);
    }
  } catch (err: any) {
    console.warn('DB countSticker error:', err?.message);
  }
};

export const getCountSticker = async (): Promise<string> => {
  try {
    const db = getDb();
    const results = await db.query('SELECT value FROM key_value WHERE key = $1 LIMIT 1', ['countSticker']);
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
