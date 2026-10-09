import Stripe from 'stripe';
import { stripe } from '~/libs/stripe';
import { manageSubscriptionStatusChange } from '~/libs/handle-stripe';
import { getDb } from '~/libs/db';

const relevantEvents = new Set([
  'checkout.session.completed',
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted',
  'invoice.payment_failed',
  'charge.refunded',
]);

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature') as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  let event: Stripe.Event;

  try {
    if (!sig || !webhookSecret) {
      return new Response(JSON.stringify({ received: true, note: 'Signature or secret missing' }), {
        status: 200,
      });
    }
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err: any) {
    console.error(`❌ Stripe webhook error: ${err.message}`);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  if (!event || !event.type) {
    return new Response('Webhook Error: Invalid event', { status: 400 });
  }

  // Webhook Idempotency Check using key_value table
  try {
    const db = getDb();
    const eventKey = `stripe_event_${event.id}`;
    const checkRes = await db.query('SELECT value FROM key_value WHERE key = $1 LIMIT 1', [eventKey]);
    if (checkRes.rows.length > 0) {
      console.log(`Duplicate event ignored: ${event.id}`);
      return new Response(JSON.stringify({ received: true, duplicate: true }));
    }
    // Record event id to guarantee idempotency
    await db.query('INSERT INTO key_value(key, value) VALUES($1, $2)', [eventKey, 'processed']);
  } catch (dbErr) {
    // If DB check fails, continue processing
  }

  if (relevantEvents.has(event.type)) {
    try {
      switch (event.type) {
        case 'customer.subscription.created':
        case 'customer.subscription.updated':
        case 'customer.subscription.deleted': {
          const subscription = event.data.object as Stripe.Subscription;
          await manageSubscriptionStatusChange(
            subscription.id,
            subscription.customer as string,
            event.type === 'customer.subscription.created'
          );
          break;
        }
        case 'checkout.session.completed': {
          const checkoutSession = event.data.object as Stripe.Checkout.Session;
          if (checkoutSession.mode === 'subscription') {
            const subscriptionId = checkoutSession.subscription;
            await manageSubscriptionStatusChange(
              subscriptionId as string,
              checkoutSession.customer as string,
              true
            );
          } else if (checkoutSession.mode === 'payment') {
            const userId = checkoutSession.metadata?.user_id;
            const credits = Number(checkoutSession.metadata?.credits) || 100;
            if (userId) {
              try {
                const { addCreditsToUser, ensurePaymentOrdersTable } = await import('~/servers/waffo');
                await addCreditsToUser(userId, credits);
                await ensurePaymentOrdersTable();
                const db = getDb();
                const orderId = checkoutSession.id;
                const amount = (checkoutSession.amount_total || 499) / 100;
                const userEmail = checkoutSession.customer_details?.email || checkoutSession.metadata?.user_email || '';
                await db.query(`
                  INSERT INTO payment_orders (order_id, provider, user_id, user_email, amount, currency, status, plan_id, credits_added, raw_payload)
                  VALUES ($1, 'stripe', $2, $3, $4, $5, 'completed', $6, $7, $8)
                  ON CONFLICT (order_id) DO UPDATE SET
                    status = 'completed',
                    credits_added = $7,
                    updated_at = NOW()
                `, [orderId, userId, userEmail, amount, 'USD', 'starter_boost', credits, JSON.stringify(checkoutSession)]);
                console.log(`[Stripe Webhook] One-time order fulfilled: +${credits} credits for user ${userId}`);
              } catch (fulfilErr: any) {
                console.error('[Stripe Webhook] Failed to fulfill one-time credits:', fulfilErr?.message);
              }
            }
          }
          break;
        }
        case 'invoice.payment_failed': {
          const invoice = event.data.object as Stripe.Invoice;
          console.warn(`Payment failed for customer ${invoice.customer}, subscription ${invoice.subscription}`);
          // Mark subscription status or record event
          break;
        }
        case 'charge.refunded': {
          const charge = event.data.object as Stripe.Charge;
          console.log(`Charge refunded: ${charge.id}, customer: ${charge.customer}`);
          break;
        }
        default:
          break;
      }
    } catch (error) {
      console.error('Webhook execution handler error:', error);
      return new Response('Webhook handler failed. Check logs.', { status: 200 });
    }
  }

  return new Response(JSON.stringify({ received: true }));
}
