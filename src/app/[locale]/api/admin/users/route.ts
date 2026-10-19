import { NextResponse } from 'next/server';
import { verifyAdmin } from '~/libs/adminAuth';
import { getDb } from '~/libs/db';
import { resolveCountryFromIp } from '~/libs/geoip';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const auth = await verifyAdmin(request);
  if (!auth.isAdmin) {
    return NextResponse.json({ error: 'Unauthorized admin access' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const pageSize = Math.min(50, Math.max(5, parseInt(searchParams.get('pageSize') || '15', 10)));
  const search = (searchParams.get('search') || '').trim();
  const offset = (page - 1) * pageSize;

  const db = getDb();

  try {
    let whereClause = '';
    let params: any[] = [];

    if (search) {
      whereClause = 'WHERE u.email ILIKE $1 OR u.name ILIKE $1 OR u.user_id ILIKE $1';
      params.push(`%${search}%`);
    }

    const countQuery = `SELECT count(*) as total FROM user_info u ${whereClause}`;
    const countRes = await db.query(countQuery, params);
    const total = parseInt(countRes.rows[0]?.total || '0', 10);

    let listRes;
    try {
      const listQuery = `
        SELECT 
          u.id, 
          u.user_id, 
          u.name, 
          u.email, 
          u.image, 
          u.last_login_ip, 
          coalesce(u.first_source, '') as first_source,
          coalesce(u.first_landing, '') as first_landing,
          coalesce(u.register_country, '') as register_country,
          coalesce(u.register_device, '') as register_device,
          coalesce(u.first_touch_at, 0) as first_touch_at,
          u.created_at, 
          u.updated_at,
          coalesce(a.available_times, 0) as available_times,
          a.stripe_customer_id
        FROM user_info u
        LEFT JOIN user_available a ON u.user_id = a.user_id
        ${whereClause}
        ORDER BY u.created_at DESC
        LIMIT $${params.length + 1} OFFSET $${params.length + 2}
      `;
      listRes = await db.query(listQuery, [...params, pageSize, offset]);
    } catch (e: any) {
      // Fallback for database instances where columns are not yet migrated
      const fallbackQuery = `
        SELECT 
          u.id, 
          u.user_id, 
          u.name, 
          u.email, 
          u.image, 
          u.last_login_ip, 
          '' as first_source,
          '' as first_landing,
          '' as register_country,
          '' as register_device,
          0 as first_touch_at,
          u.created_at, 
          u.updated_at,
          coalesce(a.available_times, 0) as available_times,
          a.stripe_customer_id
        FROM user_info u
        LEFT JOIN user_available a ON u.user_id = a.user_id
        ${whereClause}
        ORDER BY u.created_at DESC
        LIMIT $${params.length + 1} OFFSET $${params.length + 2}
      `;
      listRes = await db.query(fallbackQuery, [...params, pageSize, offset]);
    }

    const rawUsers = listRes.rows || [];
    const users = await Promise.all(
      rawUsers.map(async (u: any) => {
        let country = (u.register_country || '').trim();
        if (!country && u.last_login_ip && u.last_login_ip !== '--') {
          const resolved = await resolveCountryFromIp(u.last_login_ip);
          if (resolved) {
            u.register_country = resolved;
            // Best-effort async update to persist back to database
            db.query('UPDATE user_info SET register_country = $1 WHERE user_id = $2', [
              resolved,
              u.user_id,
            ]).catch(() => {});
          }
        }

        // Auto-recover external referral source from genuine_visitor_logs if source is direct
        let source = (u.first_source || '').trim();
        if ((!source || source === 'direct') && u.last_login_ip && u.last_login_ip !== '--' && !u.last_login_ip.startsWith('127.')) {
          try {
            const visRes = await db.query(
              'SELECT source, landing_path FROM genuine_visitor_logs WHERE ip = $1 AND source != $2 ORDER BY created_at DESC LIMIT 1',
              [u.last_login_ip, '直接访问']
            );
            if (visRes.rows.length > 0) {
              const row = visRes.rows[0];
              if (row.source) {
                u.first_source = row.source.toLowerCase();
                if (row.landing_path && !u.first_landing) {
                  u.first_landing = row.landing_path;
                }
                db.query('UPDATE user_info SET first_source = $1 WHERE user_id = $2', [
                  u.first_source,
                  u.user_id,
                ]).catch(() => {});
              }
            }
          } catch {}
        }
        return u;
      })
    );

    return NextResponse.json({
      success: true,
      users,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (err: any) {
    console.error('Admin users query error:', err);
    return NextResponse.json({ error: err?.message || 'Database error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const auth = await verifyAdmin(request);
  if (!auth.isAdmin) {
    return NextResponse.json({ error: 'Unauthorized admin access' }, { status: 401 });
  }

  const db = getDb();

  try {
    const body = await request.json();
    const { action, userId, amount, mode } = body;

    if (action === 'adjust_credits') {
      if (!userId || typeof amount !== 'number') {
        return NextResponse.json({ error: 'Missing userId or valid amount' }, { status: 400 });
      }

      // Check if user_available record exists
      const checkRes = await db.query('SELECT * FROM user_available WHERE user_id = $1', [userId]);

      if (checkRes.rows.length === 0) {
        const newTimes = Math.max(0, amount);
        await db.query(
          'INSERT INTO user_available (user_id, stripe_customer_id, available_times, created_at, updated_at) VALUES ($1, $2, $3, now(), now())',
          [userId, '', newTimes]
        );
      } else {
        const currentTimes = checkRes.rows[0].available_times || 0;
        const newTimes = mode === 'set' ? Math.max(0, amount) : Math.max(0, currentTimes + amount);
        await db.query(
          'UPDATE user_available SET available_times = $1, updated_at = now() WHERE user_id = $2',
          [newTimes, userId]
        );
      }

      return NextResponse.json({ success: true, message: 'User credits updated successfully.' });
    }

    if (action === 'compensate_zero_credit_users') {
      const grantAmount = typeof amount === 'number' && amount > 0 ? amount : 1;

      // 1. Insert missing user_available rows for users with 0 works
      await db.query(`
        INSERT INTO user_available (user_id, stripe_customer_id, available_times, created_at, updated_at)
        SELECT u.user_id, '', $1, now(), now()
        FROM user_info u
        LEFT JOIN user_available a ON u.user_id = a.user_id
        WHERE a.user_id IS NULL
          AND u.user_id NOT IN (SELECT DISTINCT user_id FROM works WHERE user_id IS NOT NULL)
        ON CONFLICT (user_id) DO NOTHING
      `, [grantAmount]);

      // 2. Update existing user_available rows where available_times = 0 and 0 works
      const updateRes = await db.query(`
        UPDATE user_available
        SET available_times = $1, updated_at = now()
        WHERE available_times = 0
          AND user_id NOT IN (SELECT DISTINCT user_id FROM works WHERE user_id IS NOT NULL)
      `, [grantAmount]);

      const compensatedCount = updateRes.rowCount || 0;
      return NextResponse.json({
        success: true,
        message: `Successfully compensated ${compensatedCount} user(s) with ${grantAmount} trial credit.`,
        count: compensatedCount,
      });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (err: any) {
    console.error('Admin adjust credits error:', err);
    return NextResponse.json({ error: err?.message || 'Database error' }, { status: 500 });
  }
}
