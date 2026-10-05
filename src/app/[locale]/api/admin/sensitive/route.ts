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
    const res = await db.query('SELECT * FROM sensitive_words ORDER BY id DESC');
    return NextResponse.json({
      success: true,
      words: res.rows,
    });
  } catch (err: any) {
    console.error('Admin sensitive words query error:', err);
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
    const { action, word, level = '1', id } = body;

    if (action === 'add') {
      const cleanWord = (word || '').trim();
      if (!cleanWord) {
        return NextResponse.json({ error: 'Word cannot be empty' }, { status: 400 });
      }

      await db.query('INSERT INTO sensitive_words (words, level) VALUES ($1, $2)', [
        cleanWord,
        level,
      ]);
      return NextResponse.json({ success: true, message: 'Sensitive word added.' });
    }

    if (action === 'delete') {
      if (!id) {
        return NextResponse.json({ error: 'Missing word ID' }, { status: 400 });
      }

      await db.query('DELETE FROM sensitive_words WHERE id = $1', [id]);
      return NextResponse.json({ success: true, message: 'Sensitive word removed.' });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (err: any) {
    console.error('Admin sensitive words update error:', err);
    return NextResponse.json({ error: err?.message || 'Database error' }, { status: 500 });
  }
}
