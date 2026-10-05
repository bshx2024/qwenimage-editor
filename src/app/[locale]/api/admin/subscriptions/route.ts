import { NextResponse } from 'next/server';
import { verifyAdmin } from '~/libs/adminAuth';
import { getDb } from '~/libs/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const auth = await verifyAdmin(request);
  if (!auth.isAdmin) {
    return NextResponse.json({ error: 'Unauthorized admin access' }, { status: 401 });
  }

  const db = getDb();

  try {
    const query = `
      SELECT 
        s.id as subscription_id,
        s.user_id,
        s.status,
        s.price_id,
        s.created,
        s.current_period_end,
        s.cancel_at_period_end,
        u.email as user_email,
        u.name as user_name
      FROM stripe_subscriptions s
      LEFT JOIN user_info u ON s.user_id = u.user_id
      ORDER BY s.created DESC
      LIMIT 100
    `;

    const res = await db.query(query);

    return NextResponse.json({
      success: true,
      subscriptions: res.rows,
    });
  } catch (err: any) {
    console.error('Admin subscriptions query error:', err);
    return NextResponse.json({ error: err?.message || 'Database error' }, { status: 500 });
  }
}
