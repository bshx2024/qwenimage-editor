import { NextResponse } from 'next/server';
import { verifyAdmin } from '~/libs/adminAuth';
import { getDb } from '~/libs/db';

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

    return NextResponse.json({
      success: true,
      users: listRes.rows,
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

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (err: any) {
    console.error('Admin adjust credits error:', err);
    return NextResponse.json({ error: err?.message || 'Database error' }, { status: 500 });
  }
}
