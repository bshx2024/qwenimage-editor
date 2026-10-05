import { NextResponse } from 'next/server';
import { verifyAdmin } from '~/libs/adminAuth';
import { getDb } from '~/libs/db';
import { getArrayUrlResult } from '~/configs/buildLink';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const auth = await verifyAdmin(request);
  if (!auth.isAdmin) {
    return NextResponse.json({ error: 'Unauthorized admin access' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const pageSize = Math.min(60, Math.max(6, parseInt(searchParams.get('pageSize') || '18', 10)));
  const search = (searchParams.get('search') || '').trim();
  const taskType = searchParams.get('task_type') || 'all';
  const publicFilter = searchParams.get('is_public') || 'all';
  const offset = (page - 1) * pageSize;

  const db = getDb();

  try {
    const conditions: string[] = ['w.is_delete = false'];
    const params: any[] = [];

    if (search) {
      params.push(`%${search}%`);
      conditions.push(`(w.input_text ILIKE $${params.length} OR w.uid ILIKE $${params.length})`);
    }

    if (taskType !== 'all') {
      params.push(taskType);
      conditions.push(`w.task_type = $${params.length}`);
    }

    if (publicFilter !== 'all') {
      params.push(publicFilter === 'true');
      conditions.push(`w.is_public = $${params.length}`);
    }

    const whereClause = `WHERE ${conditions.join(' AND ')}`;

    const countQuery = `SELECT count(*) as total FROM works w ${whereClause}`;
    const countRes = await db.query(countQuery, params);
    const total = parseInt(countRes.rows[0]?.total || '0', 10);

    const listQuery = `
      SELECT 
        w.id,
        w.uid,
        w.input_text,
        w.revised_text,
        w.output_url,
        w.input_image_url,
        w.task_type,
        w.is_public,
        w.status,
        w.created_at,
        w.updated_at,
        w.user_id,
        u.email as user_email,
        u.name as user_name
      FROM works w
      LEFT JOIN user_info u ON w.user_id = u.user_id
      ${whereClause}
      ORDER BY w.created_at DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;

    const listRes = await db.query(listQuery, [...params, pageSize, offset]);

    const formattedWorks = listRes.rows.map((row) => ({
      ...row,
      output_url: getArrayUrlResult(row.output_url),
    }));

    return NextResponse.json({
      success: true,
      works: formattedWorks,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (err: any) {
    console.error('Admin works query error:', err);
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
    const { action, uid, isPublic } = body;

    if (!uid) {
      return NextResponse.json({ error: 'Missing work UID' }, { status: 400 });
    }

    if (action === 'toggle_public') {
      await db.query(
        'UPDATE works SET is_public = $1, updated_at = now() WHERE uid = $2',
        [Boolean(isPublic), uid]
      );
      return NextResponse.json({
        success: true,
        message: `Work visibility updated to ${isPublic ? 'Public' : 'Private'}.`,
      });
    }

    if (action === 'delete') {
      await db.query(
        'UPDATE works SET is_delete = true, updated_at = now() WHERE uid = $1',
        [uid]
      );
      return NextResponse.json({
        success: true,
        message: 'Work successfully deleted/hidden.',
      });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (err: any) {
    console.error('Admin work action error:', err);
    return NextResponse.json({ error: err?.message || 'Database error' }, { status: 500 });
  }
}
