import { NextResponse } from 'next/server';
import { verifyAdmin } from '~/libs/adminAuth';
import { getAISettings, saveAISettings } from '~/servers/keyValue';
import { testBailianKey } from '~/libs/bailian';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const auth = await verifyAdmin(request);
  if (!auth.isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const settings = await getAISettings();
    return NextResponse.json({
      success: true,
      settings
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const auth = await verifyAdmin(request);
  if (!auth.isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const action = body.action || 'save';

    // 1. Test Bailian Connection
    if (action === 'test_bailian') {
      const apiKey = body.apiKey;
      const baseUrl = body.baseUrl || 'https://dashscope.aliyuncs.com';
      const testResult = await testBailianKey(apiKey, baseUrl);
      return NextResponse.json(testResult);
    }

    // 2. Save Settings
    if (action === 'save') {
      await saveAISettings({
        provider: body.provider,
        bailianApiKey: body.bailianApiKey,
        bailianBaseUrl: body.bailianBaseUrl,
        bailianModel: body.bailianModel,
        replicateToken: body.replicateToken,
      });

      return NextResponse.json({
        success: true,
        message: 'AI Provider settings saved to database successfully!'
      });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message }, { status: 500 });
  }
}
