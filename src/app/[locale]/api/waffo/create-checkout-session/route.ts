import { NextResponse } from 'next/server';
import { createWaffoCheckoutSession } from '~/libs/waffo';

export const revalidate = 0;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { planId, userId, userEmail, redirectUrl } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'User must be authenticated to start checkout' },
        { status: 401 }
      );
    }

    if (!planId) {
      return NextResponse.json(
        { error: 'Missing planId' },
        { status: 400 }
      );
    }

    const { checkoutUrl } = await createWaffoCheckoutSession({
      planId,
      userId,
      userEmail,
      redirectUrl
    });

    return NextResponse.json({ checkoutUrl });
  } catch (err: any) {
    console.error('Error creating Waffo checkout session:', err?.message);
    return NextResponse.json(
      { error: err?.message || 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
