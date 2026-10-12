import { NextRequest, NextResponse } from 'next/server';
import { recordSurveyResponse } from '~/libs/userSurvey';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, userEmail, useCase, priority, source } = body;

    if (!userId || !useCase) {
      return NextResponse.json({ ok: false, error: 'Missing userId or useCase' }, { status: 400 });
    }

    const success = await recordSurveyResponse(
      userId,
      userEmail || '',
      useCase,
      priority || '',
      source || 'welcome_modal'
    );

    return NextResponse.json({ ok: success });
  } catch (err: any) {
    console.error('API /api/user/survey error:', err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
