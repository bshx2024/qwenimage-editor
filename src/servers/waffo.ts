import { getDb } from '~/libs/db';
import { WAFFO_PLANS } from '~/configs/waffoConfig';

/**
 * Automatically ensures the payment_orders table exists in Neon PostgreSQL
 */
export async function ensurePaymentOrdersTable(): Promise<void> {
  try {
    const db = getDb();
    await db.query(`
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
  } catch (err: any) {
    console.warn('DB ensurePaymentOrdersTable warning:', err?.message);
  }
}

/**
 * Credit user account with generation times in user_available
 */
export async function addCreditsToUser(userId: string, credits: number): Promise<number> {
  if (!userId || credits <= 0) return 0;
  try {
    const db = getDb();
    const existing = await db.query('SELECT available_times FROM user_available WHERE user_id = $1 LIMIT 1', [userId]);

    if (existing.rows.length > 0) {
      const newTotal = (existing.rows[0].available_times || 0) + credits;
      await db.query(
        'UPDATE user_available SET available_times = $1, updated_at = NOW() WHERE user_id = $2',
        [newTotal, userId]
      );
      return newTotal;
    } else {
      await db.query(
        'INSERT INTO user_available (user_id, stripe_customer_id, available_times, created_at, updated_at) VALUES ($1, $2, $3, NOW(), NOW())',
        [userId, 'waffo_' + userId, credits]
      );
      return credits;
    }
  } catch (err: any) {
    console.error('Error adding credits to user:', err?.message);
    throw err;
  }
}

/**
 * Record order and fulfill credits upon Waffo order.completed event
 */
export async function handleWaffoOrderCompleted(payload: any): Promise<{ success: boolean; creditsAdded: number }> {
  await ensurePaymentOrdersTable();
  const db = getDb();

  const order = payload?.data?.order || payload?.order || payload;
  const orderId = order?.id || order?.orderId || `wfo_${Date.now()}`;
  const userId = order?.buyerIdentity || order?.metadata?.userId || order?.customer?.externalId || '';
  const userEmail = order?.customerEmail || order?.email || order?.customer?.email || '';
  const amount = (order?.amount?.total || order?.totalAmount || order?.amount || 0) / (order?.amount?.total ? 100 : 1);
  const currency = order?.currency || 'USD';
  const planId = order?.metadata?.planId || order?.productId || 'pro-monthly';

  // Determine credits from metadata or plan config
  let credits = Number(order?.metadata?.credits);
  if (!credits || isNaN(credits)) {
    credits = WAFFO_PLANS[planId]?.credits || 500;
  }

  try {
    // 1. Record the order idempotently
    await db.query(`
      INSERT INTO payment_orders (order_id, provider, user_id, user_email, amount, currency, status, plan_id, credits_added, raw_payload)
      VALUES ($1, 'waffo', $2, $3, $4, $5, 'completed', $6, $7, $8)
      ON CONFLICT (order_id) DO UPDATE SET
        status = 'completed',
        credits_added = $7,
        updated_at = NOW()
    `, [orderId, userId, userEmail, amount, currency, planId, credits, JSON.stringify(payload)]);

    // 2. Add credits to the user's available quota
    if (userId) {
      await addCreditsToUser(userId, credits);
    }

    return { success: true, creditsAdded: credits };
  } catch (err: any) {
    console.error('Failed to handle Waffo order completed:', err?.message);
    return { success: false, creditsAdded: 0 };
  }
}

/**
 * Handle Waffo subscription events (activated, renewed, canceled)
 */
export async function handleWaffoSubscription(eventType: string, payload: any): Promise<boolean> {
  const db = getDb();
  const sub = payload?.data?.subscription || payload?.subscription || payload;
  const subId = sub?.id || sub?.subscriptionId || `sub_${Date.now()}`;
  const userId = sub?.buyerIdentity || sub?.metadata?.userId || '';
  const planId = sub?.metadata?.planId || sub?.productId || 'pro-monthly';
  const status = eventType === 'subscription.canceled' ? 'canceled' : 'active';

  if (!userId) return false;

  try {
    const existing = await db.query('SELECT * FROM stripe_subscriptions WHERE user_id = $1 LIMIT 1', [userId]);

    if (existing.rows.length === 0) {
      await db.query(`
        INSERT INTO stripe_subscriptions (
          id, user_id, metadata, status, price_id, current_period_end, created
        ) VALUES ($1, $2, $3, $4, $5, NOW() + INTERVAL '30 days', NOW())
      `, [subId, userId, JSON.stringify({ provider: 'waffo', planId }), status, planId]);
    } else {
      await db.query(`
        UPDATE stripe_subscriptions SET
          status = $1,
          price_id = $2,
          metadata = $3,
          current_period_end = NOW() + INTERVAL '30 days'
        WHERE user_id = $4
      `, [status, planId, JSON.stringify({ provider: 'waffo', planId }), userId]);
    }

    // If activated or renewed, grant monthly credits
    if (status === 'active') {
      const credits = WAFFO_PLANS[planId]?.credits || 500;
      await addCreditsToUser(userId, credits);
    }

    return true;
  } catch (err: any) {
    console.error('Failed to handle Waffo subscription event:', err?.message);
    return false;
  }
}

/**
 * Fetch recent payment orders for admin dashboard
 */
export async function getPaymentOrders(limit = 50) {
  await ensurePaymentOrdersTable();
  try {
    const db = getDb();
    const result = await db.query(`
      SELECT 
        o.id,
        o.order_id,
        o.provider,
        o.user_id,
        o.user_email,
        o.amount,
        o.currency,
        o.status,
        o.plan_id,
        o.credits_added,
        o.created_at,
        u.name as user_name
      FROM payment_orders o
      LEFT JOIN user_info u ON o.user_id = u.user_id
      ORDER BY o.created_at DESC
      LIMIT $1
    `, [limit]);

    return result.rows;
  } catch (err: any) {
    console.warn('DB getPaymentOrders warning:', err?.message);
    return [];
  }
}
