import { NextResponse } from 'next/server';
import { getMonitorReports } from '~/libs/botVisitorMonitor';

export async function GET() {
  try {
    const data = await getMonitorReports();
    return NextResponse.json({ ok: true, data });
  } catch (err: any) {
    console.error('getMonitorReports error:', err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
