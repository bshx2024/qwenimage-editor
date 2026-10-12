import { NextResponse } from 'next/server';
import { getSurveyReports } from '~/libs/userSurvey';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const data = await getSurveyReports();
    return NextResponse.json({ ok: true, data });
  } catch (err: any) {
    console.error('getSurveyReports error:', err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
