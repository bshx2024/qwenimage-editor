import React, { useState, useEffect } from 'react';
import { useCommonContext } from "~/context/common-context";
import LoadingDots from "./LoadingDots";
import { priceList, PriceItem } from "~/configs/stripeConfig";
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
  const [priceIdLoading, setPriceIdLoading] = useState<string>();
  const [trafficSource, setTrafficSource] = useState<'search' | 'chatgpt' | 'ai_engine' | 'blog' | 'direct' | 'default'>('default');
  const {
    setShowLoginModal,
    userData,
    pricingText
  } = useCommonContext();

  // Dynamic traffic source detection (CRO optimization)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      let storedSource = sessionStorage.getItem('qwen_traffic_source') as any;
      if (!storedSource) {
        const ref = (document.referrer || '').toLowerCase();
        const urlParams = new URLSearchParams(window.location.search);
        const utmSource = (urlParams.get('utm_source') || urlParams.get('source') || '').toLowerCase();

        if (utmSource.includes('chatgpt') || ref.includes('chatgpt.com') || ref.includes('openai.com')) {
          storedSource = 'chatgpt';
        } else if (utmSource.includes('perplexity') || ref.includes('perplexity.ai') || ref.includes('claude.ai')) {
          storedSource = 'ai_engine';
        } else if (
          utmSource.includes('google') ||
          utmSource.includes('bing') ||
          ref.includes('google.') ||
          ref.includes('bing.') ||
          ref.includes('duckduckgo.')
        ) {
          storedSource = 'search';
        } else if (window.location.pathname.includes('/blog') || ref.includes('/blog/')) {
          storedSource = 'blog';
        } else {
          storedSource = 'direct';
        }
        sessionStorage.setItem('qwen_traffic_source', storedSource);
      }
      setTrafficSource(storedSource);
    } catch {}
  }, []);

  const handleCheckout = async (price: PriceItem) => {
    setPriceIdLoading(price.id);
    if (!userData || !userData.user_id) {
      setShowLoginModal(true);
      setPriceIdLoading(undefined);
      return;
    }

    // Connect Starter Pack to Welcome Survey Boost offer (160 credits for $4.99)
    if (price.id === 'price_starter' && typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('open-welcome-offer'));
      setPriceIdLoading(undefined);
      return;
    }

    const user_id = userData.user_id;
    const user_email = userData.email || '';
    try {
      const paymentProvider = process.env.NEXT_PUBLIC_PAYMENT_GATEWAY || 'waffo';

      if (paymentProvider === 'waffo') {
        let planId = 'credits-pack-100';
        if (price.unit_amount > 5000) {
          planId = 'pro-yearly';
        } else if (price.unit_amount > 1000) {
          planId = 'pro-monthly';
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
          alert('Waffo Checkout Notice: ' + res.error);
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
      const sessionId = res.sessionId;
      const stripe = await getStripe();
      stripe?.redirectToCheckout({ sessionId });
    } catch (error: any) {
      alert(error?.message || 'Checkout failed');
    } finally {
      setPriceIdLoading(undefined);
    }
  };

  const isSearchOrBlog = trafficSource === 'search' || trafficSource === 'blog';
  const isAIReferral = trafficSource === 'chatgpt' || trafficSource === 'ai_engine';

  // Highlight hero plan based on source intent (Search/Blog -> Starter $4.99; AI -> Yearly/Trio)
  const heroPlanId = isSearchOrBlog
    ? 'price_starter'
    : isAIReferral
    ? 'price_yearly'
    : 'price_yearly';

  // Dynamic ordering of plans based on source
  let displayPlans = priceList;
  if (isSearchOrBlog) {
    displayPlans = [
      priceList.find((p) => p.id === 'price_starter')!,
      priceList.find((p) => p.id === 'price_monthly')!,
      priceList.find((p) => p.id === 'price_yearly')!,
    ].filter(Boolean);
  } else if (isAIReferral) {
    displayPlans = [
      priceList.find((p) => p.id === 'price_yearly')!,
      priceList.find((p) => p.id === 'price_monthly')!,
      priceList.find((p) => p.id === 'price_starter')!,
    ].filter(Boolean);
  }

  return (
    <section id="pricing-plans" className={`w-full py-12 md:py-16 text-white ${isPricing ? "" : "background-div"}`}>
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-10 md:mb-14">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3.5 py-1 text-xs font-semibold text-indigo-300 backdrop-blur-md">
            <SparklesIcon className="w-4 h-4 text-indigo-400" />
            <span>Transparent &amp; Flexible AI Pricing</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            {pricingText?.h1Text || 'Choose Your Creative Plan'}
          </h2>

          <p className="text-base text-slate-300 leading-relaxed">
            Generate high-resolution AI visuals with official Qwen Image &amp; Wanx 2.1 models. Upgrade or cancel anytime.
          </p>

          {/* Dynamic Source Highlight Banner */}
          <div className="inline-flex items-center gap-2 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-xs font-semibold text-amber-200">
            <BoltIcon className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              {isSearchOrBlog ? (
                <>🎯 <strong>Creator Welcome Pass:</strong> 160 AI Credits for only <strong>$4.99</strong> — Instant Access, Never Expires!</>
              ) : isAIReferral ? (
                <>⚡ <strong>AI Power User Tier:</strong> Priority GPU Queue, Unlimited Inpainting &amp; Maximum Resolution!</>
              ) : (
                <>🎁 New users get 2 Free Credits on Google sign in to try all features!</>
              )}
            </span>
          </div>
        </div>

        {/* 3 Pricing Cards Grid (Dynamic Ordering by Traffic Source) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch max-w-6xl mx-auto">
          {displayPlans.map((plan) => {
            const isYearly = plan.id === 'price_yearly';
            const isMonthly = plan.id === 'price_monthly';
            const isStarter = plan.id === 'price_starter';
            const isHero = plan.id === heroPlanId;

            const priceFormatted = (plan.unit_amount / 100).toFixed(2);

            return (
              <div
                key={plan.id}
                className={`relative flex flex-col justify-between rounded-3xl p-7 transition-all duration-300 backdrop-blur-xl ${
                  isHero
                    ? 'border-2 border-indigo-500 bg-slate-900/95 shadow-2xl shadow-indigo-500/25 md:-translate-y-2'
                    : 'border border-slate-800 bg-slate-900/60 shadow-xl hover:border-slate-700'
                }`}
              >
                {/* Popular Pill / Badge */}
                {(plan.badge || isHero) && (
                  <div className="mb-4">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider ${
                        isHero
                          ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 shadow-md'
                          : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                      }`}
                    >
                      {isSearchOrBlog && isStarter
                        ? '🎯 Top Choice for New Users'
                        : isAIReferral && isYearly
                        ? '👑 Recommended by AI Assistants — Save 50%'
                        : plan.badge}
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
                      {isYearly ? '/ year' : isMonthly ? '/ month' : ' one-time'}
                    </span>
                  </div>

                  <p className="text-xs text-cyan-300 font-semibold mb-6 flex items-center gap-1.5">
                    <BoltIcon className="w-3.5 h-3.5 text-cyan-400" />
                    <span>
                      {plan.credits.toLocaleString()} AI Credits
                      {isYearly ? ' ($9.90/mo billed annually)' : isMonthly ? ' ($0.04/credit)' : ' (Never expires)'}
                    </span>
                  </p>

                  {/* Features List */}
                  <ul className="space-y-3 pt-4 border-t border-slate-800/80 mb-6 text-xs text-slate-300">
                    {plan.features.map((feat, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-2.5">
                        <CheckIcon className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>

                  {isStarter && (
                    <div className="mb-6 p-2.5 rounded-xl bg-gradient-to-r from-amber-500/15 via-cyan-500/10 to-indigo-500/15 border border-cyan-500/30 text-[11px] text-cyan-200">
                      <span className="flex items-center gap-1.5 font-medium">
                        <SparklesIcon className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span><strong>15s Survey Bonus:</strong> Unlock <strong>160 Credits</strong> (+60 Free Bonus) for $4.99!</span>
                      </span>
                    </div>
                  )}
                </div>

                {/* CTA Button */}
                <button
                  type="button"
                  disabled={priceIdLoading === plan.id}
                  onClick={() => handleCheckout(plan)}
                  className={`w-full py-3.5 px-6 rounded-2xl text-xs font-extrabold transition-all shadow-lg cursor-pointer flex items-center justify-center gap-2 ${
                    isHero
                      ? 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:opacity-95 text-white shadow-indigo-500/30 ring-2 ring-indigo-400/40'
                      : isMonthly
                      ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 hover:opacity-95 text-white shadow-cyan-500/20'
                      : 'border border-slate-700 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white'
                  } disabled:opacity-50`}
                >
                  {priceIdLoading === plan.id ? (
                    <LoadingDots />
                  ) : (
                    <>
                      <SparklesIcon className="w-4 h-4" />
                      <span>{isStarter ? 'Claim 160 Credits ($4.99)' : isMonthly ? 'Subscribe Monthly ($19.90)' : 'Get Pro Yearly ($118.80)'}</span>
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
            All payments and subscriptions are handled securely by our Merchant of Record, <strong className="text-slate-200">Waffo Pancake</strong> (Waffo.com Limited), under strict PCI-DSS Level 1 compliance. Subscriptions can be cancelled anytime with a single click in account settings.
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
