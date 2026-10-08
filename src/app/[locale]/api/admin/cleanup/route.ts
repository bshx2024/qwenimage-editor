import { NextResponse } from 'next/server';
import { verifyAdmin } from '~/libs/adminAuth';
import { getDb } from '~/libs/db';
import { checkSubscribe } from '~/servers/subscribe';

export const dynamic = 'force-dynamic';

/**
 * GET/POST: Automated or Manual Maintenance to clean up expired creations
 * - Free users: Preserved for 7 days
 * - Pro Subscribers: Lifetime Vault (protected from deletion)
 * - Failed tasks: Cleaned after 24 hours
 */
export async function POST(request: Request) {
  // Authorize via admin cookie/header OR Bearer CRON_SECRET
  const authHeader = request.headers.get('Authorization') || '';
  const cronSecret = process.env.CRON_SECRET || process.env.ADMIN_PASSWORD || 'admin123456';
  const isCronAuth = authHeader.replace(/^Bearer\s+/i, '').trim() === cronSecret;

  if (!isCronAuth) {
    const adminAuth = await verifyAdmin(request);
    if (!adminAuth.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized access' }, { status: 401 });
    }
  }

  const db = getDb();

  try {
    // 1. Fetch potential free user works older than 7 days that are not yet marked deleted
    const candidatesRes = await db.query(
      `SELECT uid, user_id, created_at, output_url 
       FROM works 
       WHERE is_delete = false 
         AND created_at < NOW() - INTERVAL '7 days'
       LIMIT 500`
    );

    const candidates = candidatesRes.rows || [];
    let cleanedFreeWorks = 0;
    let protectedProWorks = 0;

    for (const work of candidates) {
      const userId = work.user_id;
      // If user has an active Pro subscription, their works are permanently protected in the Pro Vault
      const isSubscribed = userId && userId !== 'guest' ? await checkSubscribe(userId) : false;

      if (isSubscribed) {
        protectedProWorks++;
      } else {
        // Free user work expired (> 7 days) -> mark deleted to clean gallery
        await db.query(
          `UPDATE works SET is_delete = true, updated_at = NOW() WHERE uid = $1`,
          [work.uid]
        );
        cleanedFreeWorks++;
      }
    }

    // 2. Clean up failed tasks older than 24 hours
    const failedRes = await db.query(
      `UPDATE works 
       SET is_delete = true, updated_at = NOW() 
       WHERE is_delete = false 
         AND status = 2 
         AND created_at < NOW() - INTERVAL '24 hours'`
    );
    const cleanedFailedWorks = failedRes.rowCount || 0;

    return NextResponse.json({
      success: true,
      message: 'Automated 7-Day Cloud Storage cleanup executed successfully',
      stats: {
        totalEvaluated: candidates.length,
        cleanedFreeWorks,
        protectedProWorks,
        cleanedFailedWorks,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (err: any) {
    console.error('[Cleanup API Exception]:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET(request: Request) {
  return POST(request);
}
