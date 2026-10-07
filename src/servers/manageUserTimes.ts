import { getDb } from "~/libs/db";
import { checkSubscribe } from "~/servers/subscribe";

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

export const refundUserTimes = async (user_id: string, cost = 1) => {
  try {
    if (!user_id || user_id === 'guest' || user_id === 'undefined' || cost <= 0) return;
    const db = getDb();
    const results = await db.query(
      `SELECT available_times FROM user_available WHERE user_id = $1 LIMIT 1;`,
      [user_id]
    );
    if (results.rows.length > 0) {
      const current = Number(results.rows[0].available_times || 0);
      await db.query(
        'UPDATE user_available SET available_times = $1, updated_at = NOW() WHERE user_id = $2;',
        [current + cost, user_id]
      );
      console.log(`[Refund] Restored ${cost} credit(s) to user ${user_id}. New balance: ${current + cost}`);
    }
  } catch (err: any) {
    console.warn("DB refundUserTimes error:", err?.message);
  }
};

/**
 * Safely marks a work as failed (status=2) and refunds credits to the user if they are not an active subscriber.
 * Idempotent: Only refunds if work was still pending (status=0).
 */
export const markWorkFailedAndRefund = async (uid: string, errorMsg = 'Generation failed', cost = 1) => {
  if (!uid) return;
  try {
    const db = getDb();
    const results = await db.query('SELECT user_id, status FROM works WHERE uid = $1 LIMIT 1', [uid]);
    if (results.rows.length === 0) return;

    const row = results.rows[0];
    if (Number(row.status) === 0) {
      const userId = row.user_id;
      if (userId && userId !== 'guest' && userId !== 'undefined') {
        const isSub = await checkSubscribe(userId).catch(() => false);
        if (!isSub) {
          await refundUserTimes(userId, cost);
        }
      }
      try {
        await db.query(
          'UPDATE works SET status = 2, message = $1, updated_at = NOW() WHERE uid = $2',
          [errorMsg, uid]
        );
      } catch {
        await db.query(
          'UPDATE works SET status = 2, updated_at = NOW() WHERE uid = $1',
          [uid]
        );
      }
      console.log(`[Refund] Work ${uid} marked as failed and refund processed.`);
    }
  } catch (err: any) {
    console.warn("DB markWorkFailedAndRefund error:", err?.message);
  }
};

