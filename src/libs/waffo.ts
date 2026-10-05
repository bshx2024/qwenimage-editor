import { WaffoPancake } from '@waffo/pancake-ts';
import { WAFFO_PLANS } from '~/configs/waffoConfig';
import { getPaymentSettings } from '~/servers/keyValue';

export async function getWaffoClientAsync(): Promise<WaffoPancake | null> {
  const settings = await getPaymentSettings();
  const merchantId = (settings.waffoMerchantId || process.env.WAFFO_MERCHANT_ID || '').trim();
  const privateKey = (settings.waffoPrivateKey || process.env.WAFFO_PRIVATE_KEY || '').trim();
  const environment = (settings.waffoEnv || (process.env.WAFFO_ENV === 'test' ? 'test' : 'prod'));

  if (!merchantId || !privateKey) {
    return null;
  }

  try {
    return new WaffoPancake({
      merchantId,
      privateKey,
      environment
    });
  } catch (err: any) {
    console.warn('WaffoPancake client initialization failed:', err?.message);
    return null;
  }
}

export function getWaffoClient(): WaffoPancake | null {
  const merchantId = process.env.WAFFO_MERCHANT_ID?.trim();
  const privateKey = process.env.WAFFO_PRIVATE_KEY?.trim();

  if (!merchantId || !privateKey) {
    return null;
  }

  try {
    return new WaffoPancake({
      merchantId,
      privateKey,
      environment: (process.env.WAFFO_ENV === 'test' ? 'test' : 'prod')
    });
  } catch (err: any) {
    console.warn('WaffoPancake client initialization failed:', err?.message);
    return null;
  }
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
  const settings = await getPaymentSettings();

  // 1. If merchant configured direct Waffo hosted checkout link in DB or env, use it
  let directCheckoutUrl = plan.checkoutUrl;
  if (planId === 'credits-pack-100' && settings.waffoStarterLink) directCheckoutUrl = settings.waffoStarterLink;
  if (planId === 'pro-monthly' && settings.waffoProLink) directCheckoutUrl = settings.waffoProLink;
  if (planId === 'pro-yearly' && settings.waffoMegaLink) directCheckoutUrl = settings.waffoMegaLink;

  if (directCheckoutUrl) {
    try {
      const url = new URL(directCheckoutUrl);
      url.searchParams.set('buyerIdentity', userId);
      if (userEmail) {
        url.searchParams.set('customerEmail', userEmail);
      }
      url.searchParams.set('returnUrl', successUrl);
      return { checkoutUrl: url.toString() };
    } catch (urlErr) {
      console.warn('Invalid direct checkout URL:', directCheckoutUrl);
    }
  }

  // 2. Try official SDK authenticated checkout session
  let productId = plan.productId;
  if (planId === 'credits-pack-100' && settings.waffoProductStarter) productId = settings.waffoProductStarter;
  if (planId === 'pro-monthly' && settings.waffoProductMonthly) productId = settings.waffoProductMonthly;
  if (planId === 'pro-yearly' && settings.waffoProductYearly) productId = settings.waffoProductYearly;

  const client = await getWaffoClientAsync();
  if (client && productId) {
    try {
      const session = await client.checkout.authenticated.create({
        productId: productId,
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
  mockUrl.searchParams.set('msg', 'Waffo credentials pending configuration in Admin Console');
  return { checkoutUrl: mockUrl.toString() };
}

