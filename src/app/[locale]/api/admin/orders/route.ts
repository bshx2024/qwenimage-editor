import { NextResponse } from 'next/server';
import { verifyAdmin } from '~/libs/adminAuth';
import { getPaymentOrders } from '~/servers/waffo';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const auth = await verifyAdmin(request);
  if (!auth.isAdmin) {
    return NextResponse.json({ error: 'Unauthorized admin access' }, { status: 401 });
  }

  try {
    const orders = await getPaymentOrders(100);
    return NextResponse.json({
      success: true,
      orders
    });
  } catch (err: any) {
    console.error('Admin orders query error:', err);
    return NextResponse.json({ error: err?.message || 'Database error' }, { status: 500 });
  }
}
