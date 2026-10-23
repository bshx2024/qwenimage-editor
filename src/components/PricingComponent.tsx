import React, { useState } from 'react';
import { useCommonContext } from "~/context/common-context";
import LoadingDots from "./LoadingDots";
import { oneTimePriceList, subscriptionPriceList, priceList, PriceItem } from "~/configs/stripeConfig";
import { getStripe } from '~/libs/stripeClient';
import { CheckIcon, SparklesIcon, BoltIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function Pricing({
  redirectUrl,
  isPricing = false
}: {
  redirectUrl?: string;
  isPricing?: boolean;
}) {
  const [billingMode, setBillingMode] = useState<'all' | 'onetime' | 'subscription'>('all');
  const [priceIdLoading, setPriceIdLoading] = useState<string>();
  const {
    setShowLoginModal,
    userData,
    pricingText
  } = useCommonContext();

  const handleCheckout = async (price: PriceItem) => {
    setPriceIdLoading(price.id);
    if (!userData || !userData.user_id) {
      setShowLoginModal(true);
      setPriceIdLoading(undefined);
      return;
    }

    const user_id = userData.user_id;
    const user_email = userData.email || '';
    try {
      const paymentProvider = process.env.NEXT_PUBLIC_PAYMENT_GATEWAY || 'waffo';

      if (paymentProvider === 'waffo') {
        let planId = 'pack-starter';
        if (price.id === 'pack_starter' || price.id === 'price_starter' || price.id === 'credits-pack-100') {
          planId = 'pack-starter';
        } else if (price.id === 'sub_monthly' || price.id === 'price_monthly' || price.id === 'pro-monthly') {
          planId = 'pro-monthly';
        } else if (price.id === 'sub_yearly' || price.id === 'price_yearly' || price.id === 'pro-yearly') {
          planId = 'pro-yearly';
        }

        const response = await fetch('/api/waffo/create-checkout-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            planId,
            userId: user_id,
            userEmail: user_email,
            redirectUrl: (typeof window !== 'undefined' ? window.location.origin : '') + '/pricing?payment_success=true&provider=waffo'
          })
        });
        const res = await response.json();
        if (res.checkoutUrl) {
          window.location.href = res.checkoutUrl;
          return;
        } else if (res.error) {
          alert('Checkout Notice: ' + res.error);
          return;
        }
      }

      // Stripe Fallback flow
      const data = {
        price,
        redirectUrl,
        user_id
      };
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const res = await response.json();
      if (res.alreadySubscribed) {
        alert(res.message);
        return;
      }
      const sessionId = res.sessionId;
      const stripe = await getStripe();
      stripe?.redirectToCheckout({ sessionId });
    } catch (error: any) {
      alert(error?.message || 'Checkout failed');
    } finally {
      setPriceIdLoading(undefined);
    }
  };

  const displayedPlans =
    billingMode === 'onetime'
      ? oneTimePriceList
      : billingMode === 'subscription'
      ? subscriptionPriceList
      : priceList;

  return (
    <section id="pricing-plans" className={`w-full py-12 md:py-16 text-white ${isPricing ? "" : "background-div"}`}>
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-8 md:mb-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3.5 py-1 text-xs font-semibold text-indigo-300 backdrop-blur-md">
            <SparklesIcon className="w-4 h-4 text-indigo-400" />
            <span>Pay As You Go — Flexible AI Pricing</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            {pricingText?.h1Text || 'Simple & Transparent Pricing'}
          </h2>

          <p className="text-base text-slate-300 leading-relaxed max-w-2xl mx-auto">
            Choose between non-expiring one-time credits or monthly/annual plans for high-resolution Qwen-Image-2.1 AI image generation.
          </p>

          {/* Highlight Banner */}
          <div className="inline-flex items-center gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-xs font-semibold text-emerald-200">
            <BoltIcon className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>⚡ <strong>Starter Pack ($4.99):</strong> 100 Credits, one-time payment, never expires. No recurring subscription!</span>
          </div>

          {/* Billing Switcher (All vs One-Time vs Subscriptions) */}
          <div className="pt-4 flex items-center justify-center">
            <div className="inline-flex p-1.5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl flex-wrap justify-center gap-1">
              <button
                type="button"
                onClick={() => setBillingMode('all')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  billingMode === 'all'
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>All Plans (3)</span>
              </button>
              <button
                type="button"
                onClick={() => setBillingMode('onetime')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  billingMode === 'onetime'
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <BoltIcon className="w-3.5 h-3.5 text-cyan-400" />
                <span>One-Time ($4.99)</span>
              </button>
              <button
                type="button"
                onClick={() => setBillingMode('subscription')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  billingMode === 'subscription'
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>Subscriptions ($19.90 / $118.80)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className={`grid grid-cols-1 ${displayedPlans.length === 3 ? 'md:grid-cols-3' : displayedPlans.length === 2 ? 'md:grid-cols-2 max-w-4xl' : 'max-w-md'} gap-6 lg:gap-8 items-stretch max-w-6xl mx-auto`}>
          {displayedPlans.map((plan) => {
            const isPopular = plan.isPopular;
            const priceFormatted = (plan.unit_amount / 100).toFixed(2);
            const isOneTime = plan.type === 'one_time';
            const costPerCredit = (plan.unit_amount / 100 / plan.credits).toFixed(3);

            return (
              <div
                key={plan.id}
                className={`relative flex flex-col justify-between rounded-3xl p-7 transition-all duration-300 backdrop-blur-xl ${
                  isPopular
                    ? 'border-2 border-indigo-500 bg-slate-900/95 shadow-2xl shadow-indigo-500/25 md:-translate-y-2'
                    : 'border border-slate-800 bg-slate-900/60 shadow-xl hover:border-slate-700'
                }`}
              >
                {/* Popular Pill / Badge */}
                {plan.badge && (
                  <div className="mb-4">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider ${
                        isPopular
                          ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 shadow-md'
                          : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                      }`}
                    >
                      {plan.badge}
                    </span>
                  </div>
                )}

                {/* Plan Info */}
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                  <div className="flex items-baseline gap-1 mb-2">
                    <span className="text-4xl sm:text-5xl font-black text-white tracking-tight">
                      ${priceFormatted}
                    </span>
                    <span className="text-xs text-slate-400">
                      {isOneTime ? ' one-time' : plan.id.includes('yearly') ? '/ year ($9.90/mo)' : '/ month'}
                    </span>
                  </div>

                  <p className="text-xs text-cyan-300 font-semibold mb-3 flex items-center gap-1.5">
                    <BoltIcon className="w-3.5 h-3.5 text-cyan-400" />
                    <span>
                      {plan.credits.toLocaleString()} AI Credits
                      {isOneTime ? ` ($${costPerCredit}/credit · Never expires)` : ' refreshed each period'}
                    </span>
                  </p>

                  {/* Accounting Transparency Pill */}
                  <div className="mb-5 rounded-2xl bg-slate-950/60 border border-slate-800/80 p-3 text-left space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Estimated Output:</span>
                      <strong className="text-white font-mono">~{plan.credits.toLocaleString()} standard edits</strong>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Failure Protection:</span>
                      <span className="text-emerald-400 font-medium">Automatic refund ($0 loss)</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">HD Download:</span>
                      <span className="text-cyan-300 font-medium">Included ($0 extra fee)</span>
                    </div>
                  </div>

                  {/* Features List */}
                  <ul className="space-y-3 pt-4 border-t border-slate-800/80 mb-6 text-xs text-slate-300">
                    {plan.features.map((feat, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-2.5">
                        <CheckIcon className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTA Button */}
                <button
                  type="button"
                  disabled={priceIdLoading === plan.id}
                  onClick={() => handleCheckout(plan)}
                  className={`w-full py-3.5 px-6 rounded-2xl text-xs font-extrabold transition-all shadow-lg cursor-pointer flex items-center justify-center gap-2 ${
                    isPopular
                      ? 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:opacity-95 text-white shadow-indigo-500/30 ring-2 ring-indigo-400/40'
                      : 'border border-slate-700 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white'
                  } disabled:opacity-50`}
                >
                  {priceIdLoading === plan.id ? (
                    <LoadingDots />
                  ) : (
                    <>
                      <SparklesIcon className="w-4 h-4" />
                      <span>
                        {isOneTime
                          ? `Get ${plan.credits} Credits ($${priceFormatted})`
                          : `Subscribe ($${priceFormatted})`}
                      </span>
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Security & Money Back Trust Badges */}
        <div className="mt-14 max-w-3xl mx-auto text-center space-y-3.5 text-xs text-slate-400 border-t border-slate-800/80 pt-8">
          <div className="flex flex-wrap items-center justify-center gap-6 text-slate-300">
            <span className="flex items-center gap-1.5">
              <ShieldCheckIcon className="w-4 h-4 text-emerald-400" />
              <span>SSL 256-Bit Encrypted Payments</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="text-amber-400 font-semibold">🛡️ 7-Day Money-Back Guarantee</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span>💳 Supported Cards: Visa, MasterCard, Apple Pay, Google Pay, PayPal</span>
            </span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            All payments are processed securely under strict PCI-DSS Level 1 compliance. One-time credits never expire and require no recurring commitment.
          </p>
          <div className="text-[11px] text-slate-500 flex items-center justify-center gap-4 pt-1">
            <span>By proceeding to checkout, you agree to our</span>
            <Link href="/terms-of-service" className="text-indigo-400 hover:text-indigo-300 underline underline-offset-2">
              Terms of Service
            </Link>
            <span>&amp;</span>
            <Link href="/privacy-policy" className="text-indigo-400 hover:text-indigo-300 underline underline-offset-2">
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
