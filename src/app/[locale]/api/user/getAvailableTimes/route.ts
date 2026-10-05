import { getDb } from "~/libs/db";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const GET = async (req: Request) => {
  try {
    const query = new URL(req.url).searchParams;
    const userId = query.get("userId") || '';

    const db = getDb();

    const result = {
      userId: userId || '',
      available_times: 0,
      subscribeStatus: '',
      activePlan: 'Free Plan',
      isPro: false,
    };

    if (userId) {
      // 1. Check stripe_subscriptions
      try {
        const resultsSubscribe = await db.query(
          'SELECT status FROM stripe_subscriptions WHERE user_id = $1 AND status = $2 LIMIT 1',
          [userId, 'active']
        );
        if (resultsSubscribe.rows.length > 0) {
          result.subscribeStatus = 'active';
          result.activePlan = 'Pro Member';
          result.isPro = true;
        }
      } catch (subErr) {
        // Table may be empty
      }

      // 2. Check Waffo / Pancake payment_orders
      try {
        const orderRes = await db.query(
          'SELECT plan_id, status FROM payment_orders WHERE user_id = $1 AND status = $2 ORDER BY id DESC LIMIT 1',
          [userId, 'completed']
        );
        if (orderRes.rows.length > 0) {
          const planId = orderRes.rows[0].plan_id;
          if (planId === 'pro-yearly') {
            result.activePlan = 'Pro Yearly Member';
            result.isPro = true;
          } else if (planId === 'pro-monthly') {
            result.activePlan = 'Pro Monthly Member';
            result.isPro = true;
          } else if (planId === 'credits-pack-100') {
            result.activePlan = 'Starter Credits Pack';
          }
        }
      } catch (orderErr) {
        // Table may not have orders yet
      }

      // 3. Check remaining available_times
      try {
        const availRes = await db.query(
          'SELECT available_times FROM user_available WHERE user_id = $1 LIMIT 1',
          [userId]
        );
        if (availRes.rows.length > 0) {
          result.available_times = Number(availRes.rows[0].available_times || 0);
        }
      } catch (availErr) {
        console.warn('DB getAvailableTimes error:', availErr);
      }
    }

    return Response.json(result);
  } catch (err: any) {
    console.error('getAvailableTimes API error:', err);
    return Response.json({
      userId: '',
      available_times: 0,
      subscribeStatus: '',
      activePlan: 'Free Plan',
      isPro: false,
    });
  }
};
