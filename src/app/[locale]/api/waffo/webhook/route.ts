import { NextResponse } from 'next/server';
import { verifyWebhook } from '@waffo/pancake-ts';
import { handleWaffoOrderCompleted, handleWaffoSubscription } from '~/servers/waffo';

export const revalidate = 0;

export async function POST(req: Request) {
  const rawBody = await req.text();
  const signature = req.headers.get('x-waffo-signature') || req.headers.get('X-Waffo-Signature');

  let event: any;

  // 1. Verify webhook signature
  try {
    if (process.env.WAFFO_BYPASS_WEBHOOK_VERIFY === 'true' && !signature) {
      console.warn('Waffo webhook verification bypassed by configuration');
      event = JSON.parse(rawBody);
    } else {
      if (!signature) {
        return NextResponse.json(
          { error: 'Missing X-Waffo-Signature header' },
          { status: 400 }
        );
      }
      // verifyWebhook uses Waffo's embedded public keys
      event = verifyWebhook(rawBody, signature);
    }
  } catch (err: any) {
    console.error('Waffo webhook signature verification failed:', err?.message);
    return NextResponse.json(
      { error: `Webhook signature verification failed: ${err?.message}` },
      { status: 400 }
    );
  }

  // 2. Process event
  try {
    const eventType = event.type || event.event || '';
    const eventData = event.data || event.payload || event;

    console.log(`[Waffo Webhook] Received event: ${eventType}`);

    switch (eventType) {
      case 'order.completed':
      case 'onetime_order.completed':
      case 'payment.succeeded': {
        const result = await handleWaffoOrderCompleted(eventData);
        console.log(`[Waffo Webhook] Order fulfilled, added ${result.creditsAdded} credits`);
        break;
      }

      case 'subscription.activated':
      case 'subscription.renewed':
      case 'subscription.canceled': {
        await handleWaffoSubscription(eventType, eventData);
        console.log(`[Waffo Webhook] Subscription event ${eventType} processed`);
        break;
      }

      default:
        console.log(`[Waffo Webhook] Unhandled event type: ${eventType}`);
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error('Error processing Waffo webhook:', err?.message);
    return NextResponse.json(
      { error: 'Internal processing error' },
      { status: 500 }
    );
  }
}
