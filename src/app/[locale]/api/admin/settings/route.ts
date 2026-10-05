import { NextResponse } from 'next/server';
import { verifyAdmin } from '~/libs/adminAuth';
import { getAISettings, saveAISettings, getPaymentSettings, savePaymentSettings } from '~/servers/keyValue';
import { testBailianKey } from '~/libs/bailian';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const auth = await verifyAdmin(request);
  if (!auth.isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const [settings, paymentSettings] = await Promise.all([
      getAISettings(),
      getPaymentSettings()
    ]);
    return NextResponse.json({
      success: true,
      settings,
      paymentSettings
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

    // 2. Save AI Settings
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

    // 3. Test Waffo Connection
    if (action === 'test_waffo') {
      const merchantId = body.merchantId?.trim();
      const privateKey = body.privateKey?.trim();
      const environment = (body.environment === 'test' ? 'test' : 'prod');

      if (!merchantId) {
        return NextResponse.json({ success: false, error: 'Merchant ID is required (format: MER_xxx)' });
      }
      if (!merchantId.startsWith('MER_')) {
        return NextResponse.json({ success: false, error: `Invalid Merchant ID: must start with "MER_", got "${merchantId}"` });
      }
      if (!privateKey) {
        return NextResponse.json({ success: false, error: 'RSA Private Key is required (PEM format)' });
      }

      try {
        const { WaffoPancake } = await import('@waffo/pancake-ts');
        new WaffoPancake({
          merchantId,
          privateKey,
          environment
        });
        return NextResponse.json({
          success: true,
          message: `Waffo Pancake SDK initialized successfully! Environment: ${environment}. Format and RSA keys are valid.`
        });
      } catch (err: any) {
        return NextResponse.json({
          success: false,
          error: `Waffo client initialization error: ${err?.message || 'Invalid credentials'}`
        });
      }
    }

    // 4. Save Payment Gateway Settings
    if (action === 'save_payment') {
      await savePaymentSettings(body.paymentSettings || {});
      return NextResponse.json({
        success: true,
        message: 'Payment gateway settings saved to database successfully!'
      });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message }, { status: 500 });
  }
}

