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
    // 1. User stats
    const totalUsersRes = await db.query('SELECT count(*) as count FROM user_info');
    const todayUsersRes = await db.query(
      'SELECT count(*) as count FROM user_info WHERE created_at >= CURRENT_DATE'
    );

    // 2. Works stats
    const totalWorksRes = await db.query(
      'SELECT count(*) as count FROM works WHERE is_delete = false'
    );
    const todayWorksRes = await db.query(
      'SELECT count(*) as count FROM works WHERE is_delete = false AND created_at >= CURRENT_DATE'
    );

    // 3. Subscriptions stats
    let totalSubs = 0;
    try {
      const subsRes = await db.query(
        "SELECT count(*) as count FROM stripe_subscriptions WHERE status = 'active'"
      );
      totalSubs = parseInt(subsRes.rows[0]?.count || '0', 10);
    } catch (e) {
      // In case table is not populated yet
    }

    // 4. Credits pool
    let totalCredits = 0;
    try {
      const creditsRes = await db.query(
        'SELECT coalesce(sum(available_times), 0) as total FROM user_available'
      );
      totalCredits = parseInt(creditsRes.rows[0]?.total || '0', 10);
    } catch (e) {}

    // 5. Recent generated works
    const recentWorksRes = await db.query(
      `SELECT w.id, w.uid, w.input_text, w.output_url, w.task_type, w.created_at, w.is_public, u.email as user_email
       FROM works w
       LEFT JOIN user_info u ON w.user_id = u.user_id
       WHERE w.is_delete = false
       ORDER BY w.created_at DESC
       LIMIT 6`
    );

    // 6. System health checklist
    const systemHealth = {
      database: { status: 'healthy', message: 'PostgreSQL pool active' },
      replicate: {
        status: process.env.REPLICATE_API_TOKEN ? 'healthy' : 'warning',
        message: process.env.REPLICATE_API_TOKEN ? 'API Token configured' : 'REPLICATE_API_TOKEN is missing',
      },
      r2Storage: {
        status: process.env.R2_ACCESS_KEY_ID && process.env.STORAGE_DOMAIN ? 'healthy' : 'warning',
        message: process.env.STORAGE_DOMAIN ? 'Cloudflare R2 configured' : 'R2 storage credentials incomplete',
      },
      stripe: {
        status: process.env.STRIPE_SECRET_KEY ? 'healthy' : 'idle',
        message: process.env.STRIPE_SECRET_KEY ? 'Stripe Gateway ready' : 'Stripe test/live key not set',
      },
      googleAuth: {
        status: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ? 'healthy' : 'idle',
        message: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ? 'Google OAuth active' : 'Google login disabled',
      },
    };

    return NextResponse.json({
      success: true,
      data: {
        metrics: {
          totalUsers: parseInt(totalUsersRes.rows[0]?.count || '0', 10),
          todayUsers: parseInt(todayUsersRes.rows[0]?.count || '0', 10),
          totalWorks: parseInt(totalWorksRes.rows[0]?.count || '0', 10),
          todayWorks: parseInt(todayWorksRes.rows[0]?.count || '0', 10),
          activeSubscriptions: totalSubs,
          totalCreditsPool: totalCredits,
        },
        systemHealth,
        recentWorks: recentWorksRes.rows,
      },
    });
  } catch (err: any) {
    console.error('Admin stats error:', err);
    return NextResponse.json({ error: err?.message || 'Database error' }, { status: 500 });
  }
}
