import { WaffoPancake } from '@waffo/pancake-ts';
import { WAFFO_PLANS } from '~/configs/waffoConfig';

let waffoClientInstance: WaffoPancake | null = null;

export function getWaffoClient(): WaffoPancake | null {
  const merchantId = process.env.WAFFO_MERCHANT_ID?.trim();
  const privateKey = process.env.WAFFO_PRIVATE_KEY?.trim();

  if (!merchantId || !privateKey) {
    return null;
  }

  if (!waffoClientInstance) {
    try {
      waffoClientInstance = new WaffoPancake({
        merchantId,
        privateKey,
        environment: (process.env.WAFFO_ENV === 'test' ? 'test' : 'prod')
      });
    } catch (err: any) {
      console.warn('WaffoPancake client initialization failed:', err?.message);
      return null;
    }
  }

  return waffoClientInstance;
}

export interface CreateCheckoutParams {
  planId: string;
  userId: string;
  userEmail?: string;
  redirectUrl?: string;
}

export async function createWaffoCheckoutSession({
  planId,
  userId,
  userEmail = '',
  redirectUrl = ''
}: CreateCheckoutParams): Promise<{ checkoutUrl: string }> {
  const plan = WAFFO_PLANS[planId];
  if (!plan) {
    throw new Error(`Plan "${planId}" not found in Waffo configuration.`);
  }

  const successUrl = redirectUrl || `${process.env.NEXT_PUBLIC_SITE_URL || 'https://qwenimage-editor.com'}/pricing?payment_success=true&provider=waffo`;

  // 1. If merchant configured direct Waffo hosted checkout link, use it
  if (plan.checkoutUrl) {
    const url = new URL(plan.checkoutUrl);
    url.searchParams.set('buyerIdentity', userId);
    if (userEmail) {
      url.searchParams.set('customerEmail', userEmail);
    }
    url.searchParams.set('returnUrl', successUrl);
    return { checkoutUrl: url.toString() };
  }

  // 2. Try official SDK authenticated checkout session
  const client = getWaffoClient();
  if (client && plan.productId) {
    try {
      const session = await client.checkout.authenticated.create({
        productId: plan.productId,
        buyerIdentity: userId,
        buyerEmail: userEmail || undefined,
        currency: 'USD',
        successUrl: successUrl,
        darkMode: true,
        metadata: {
          planId: plan.id,
          userId: userId,
          credits: String(plan.credits)
        }
      });

      if (session && (session as any).checkoutUrl) {
        return { checkoutUrl: (session as any).checkoutUrl };
      }
    } catch (sdkError: any) {
      console.warn('Waffo SDK checkout creation warning:', sdkError?.message);
    }
  }

  // 3. Fallback demo / mock checkout link if credentials are not yet configured in production
  const mockUrl = new URL(`${process.env.NEXT_PUBLIC_SITE_URL || 'https://qwenimage-editor.com'}/pricing`);
  mockUrl.searchParams.set('waffo_pending', '1');
  mockUrl.searchParams.set('plan', planId);
  mockUrl.searchParams.set('msg', 'Waffo credentials pending configuration in Vercel');
  return { checkoutUrl: mockUrl.toString() };
}
