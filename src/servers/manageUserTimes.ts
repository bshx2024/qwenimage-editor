import { getDb } from "~/libs/db";

export const checkUserTimes = async (user_id: string, cost = 1) => {
  try {
    const db = getDb();
    const results = await db.query(
      `SELECT available_times FROM user_available WHERE user_id = $1 LIMIT 1;`,
      [user_id]
    );
    const result = results.rows;
    if (result.length <= 0) {
      return false;
    }
    const available = result[0];
    const available_times = Number(available.available_times || 0);
    return available_times >= cost;
  } catch (err: any) {
    console.warn("DB checkUserTimes error:", err?.message);
    return false;
  }
};

export const countDownUserTimes = async (user_id: string, cost = 1) => {
  try {
    const db = getDb();
    const results = await db.query(
      `SELECT available_times FROM user_available WHERE user_id = $1 LIMIT 1;`,
      [user_id]
    );
    const result = results.rows;
    if (result.length > 0) {
      const available = result[0];
      const resultTimes = Math.max(0, Number(available.available_times || 0) - cost);
      await db.query(
        'UPDATE user_available SET available_times = $1, updated_at = NOW() WHERE user_id = $2;',
        [resultTimes, user_id]
      );
    }
  } catch (err: any) {
    console.warn("DB countDownUserTimes error:", err?.message);
  }
};
