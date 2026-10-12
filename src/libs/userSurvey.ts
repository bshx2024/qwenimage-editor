import { getDb } from './db';

export interface SurveyRecord {
  id: number;
  user_id: string;
  user_email: string | null;
  use_case: string;
  priority: string | null;
  source: string;
  created_at: string;
}

export async function ensureSurveyTableExist(): Promise<void> {
  const db = getDb();
  await db.query(`
    CREATE TABLE IF NOT EXISTS user_survey_logs (
      id SERIAL PRIMARY KEY,
      user_id VARCHAR(128) NOT NULL,
      user_email VARCHAR(255),
      use_case VARCHAR(128) NOT NULL,
      priority VARCHAR(128),
      source VARCHAR(64) DEFAULT 'web',
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_user_survey_user_id ON user_survey_logs(user_id);
    CREATE INDEX IF NOT EXISTS idx_user_survey_created_at ON user_survey_logs(created_at);
  `);
}

export async function recordSurveyResponse(
  userId: string,
  userEmail: string = '',
  useCase: string,
  priority: string = '',
  source: string = 'welcome_modal'
): Promise<boolean> {
  if (!userId || !useCase) return false;

  try {
    await ensureSurveyTableExist();
    const db = getDb();

    // Check if this user has already answered within the last 1 hour to prevent duplicates
    const checkRes = await db.query(
      `SELECT id FROM user_survey_logs WHERE user_id = $1 AND created_at > NOW() - INTERVAL '1 hour' ORDER BY id DESC LIMIT 1`,
      [userId]
    );

    if (checkRes.rows.length > 0) {
      // Update the existing record with the latest choices
      await db.query(
        `UPDATE user_survey_logs 
         SET use_case = $1, priority = $2, user_email = COALESCE(NULLIF($3, ''), user_email), created_at = NOW() 
         WHERE id = $4`,
        [useCase, priority, userEmail, checkRes.rows[0].id]
      );
    } else {
      // Insert new survey response
      await db.query(
        `INSERT INTO user_survey_logs (user_id, user_email, use_case, priority, source)
         VALUES ($1, $2, $3, $4, $5)`,
        [userId, userEmail || null, useCase, priority || null, source]
      );
    }

    return true;
  } catch (err) {
    console.error('recordSurveyResponse error:', err);
    return false;
  }
}

export async function getSurveyReports() {
  await ensureSurveyTableExist();
  const db = getDb();

  // 1. Total survey responses count
  const countRes = await db.query(`SELECT COUNT(*) as total FROM user_survey_logs`);
  const total = parseInt(countRes.rows[0]?.total || '0', 10);

  // 2. Breakdown by use_case
  const useCaseRes = await db.query(`
    SELECT use_case, COUNT(*) as count
    FROM user_survey_logs
    GROUP BY use_case
    ORDER BY count DESC
  `);

  // 3. Breakdown by priority
  const priorityRes = await db.query(`
    SELECT priority, COUNT(*) as count
    FROM user_survey_logs
    WHERE priority IS NOT NULL AND priority != ''
    GROUP BY priority
    ORDER BY count DESC
  `);

  // 4. Latest 50 survey submissions with user detail
  const recentRes = await db.query(`
    SELECT s.id, s.user_id, s.user_email, s.use_case, s.priority, s.source, s.created_at,
           u.register_country, u.first_source, u.first_landing
    FROM user_survey_logs s
    LEFT JOIN user_info u ON s.user_id = u.user_id
    ORDER BY s.created_at DESC
    LIMIT 50
  `);

  return {
    total,
    useCaseDistribution: useCaseRes.rows.map((r: any) => ({
      useCase: r.use_case,
      count: parseInt(r.count, 10),
      percentage: total > 0 ? Math.round((parseInt(r.count, 10) / total) * 100) : 0,
    })),
    priorityDistribution: priorityRes.rows.map((r: any) => ({
      priority: r.priority,
      count: parseInt(r.count, 10),
    })),
    recentResponses: recentRes.rows,
  };
}
