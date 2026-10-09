'use client';

import React, { useState, useEffect } from 'react';
import { useCommonContext } from '~/context/common-context';
import { getStripe } from '~/libs/stripeClient';
import { priceList } from '~/configs/stripeConfig';
import { SparklesIcon, XMarkIcon, CheckCircleIcon, ClockIcon, BoltIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

const SURVEY_DONE_KEY = 'qwen_welcome_survey_done';
const OFFER_DISMISSED_KEY = 'qwen_welcome_offer_dismissed';

export function WelcomeSurveyModal() {
  const { userData, setShowLoginModal } = useCommonContext();
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [useCase, setUseCase] = useState<string>('');
  const [priority, setPriority] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState(14 * 60 + 59); // 14:59
  const [isLoading, setIsLoading] = useState(false);

  // Check whether to show the modal automatically
  useEffect(() => {
    if (!userData || !userData.user_id) return;

    // Check if user already dismissed recently (within 24 hours) or already paid
    const dismissedTime = localStorage.getItem(`${OFFER_DISMISSED_KEY}_${userData.user_id}`);
    if (dismissedTime && Date.now() - Number(dismissedTime) < 24 * 60 * 60 * 1000) {
      return;
    }

    // If survey already completed, jump to step 2 directly
    const hasDoneSurvey = localStorage.getItem(`${SURVEY_DONE_KEY}_${userData.user_id}`);
    if (hasDoneSurvey) {
      setStep(2);
    }

    // Delay slightly after mount for smoother entrance
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 1800);

    return () => clearTimeout(timer);
  }, [userData]);

  // Support manual event trigger (e.g. from credit limit alert or button)
  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('open-welcome-offer', handleOpen);
    return () => window.removeEventListener('open-welcome-offer', handleOpen);
  }, []);

  // Countdown timer for session urgency
  useEffect(() => {
    if (!isOpen || step !== 2) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen, step]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCompleteSurvey = () => {
    if (!useCase || !priority) return;
    if (userData?.user_id) {
      localStorage.setItem(`${SURVEY_DONE_KEY}_${userData.user_id}`, JSON.stringify({ useCase, priority, at: Date.now() }));
    }
    setStep(2);
  };

  const handleDismiss = () => {
    setIsOpen(false);
    if (userData?.user_id) {
      localStorage.setItem(`${OFFER_DISMISSED_KEY}_${userData.user_id}`, String(Date.now()));
    }
  };

  const handleClaimOffer = async () => {
    if (!userData || !userData.user_id) {
      setShowLoginModal(true);
      return;
    }

    setIsLoading(true);
    try {
      const paymentProvider = process.env.NEXT_PUBLIC_PAYMENT_GATEWAY || 'waffo';

      if (paymentProvider === 'waffo') {
        const response = await fetch('/api/waffo/create-checkout-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            planId: 'credits-pack-100',
            userId: userData.user_id,
            userEmail: userData.email || '',
            bonusCredits: 160,
            redirectUrl: (typeof window !== 'undefined' ? window.location.origin : '') + '/pricing?payment_success=true&welcome_bonus=160&provider=waffo',
          }),
        });
        const res = await response.json();
        if (res.checkoutUrl) {
          window.location.href = res.checkoutUrl;
          return;
        } else if (res.error) {
          alert('Checkout notice: ' + res.error);
        }
      } else {
        // Stripe flow for $4.99 Starter Pack + 60 Bonus Credits
        const starterPrice = priceList.find((p) => p.id === 'price_starter') || priceList[0];
        const response = await fetch('/api/stripe/create-checkout-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            price: starterPrice,
            quantity: 1,
            user_id: userData.user_id,
            redirectUrl: '/pricing?payment_success=true&welcome_bonus=160',
            metadata: {
              credits: '160',
              is_welcome_bonus: 'true',
              survey_use_case: useCase,
              survey_priority: priority,
            },
          }),
        });
        const data = await response.json();
        if (data.sessionId) {
          const stripe = await getStripe();
          // @ts-ignore
          await stripe?.redirectToCheckout({ sessionId: data.sessionId });
          return;
        }
      }
    } catch (e: any) {
      console.error('Error claiming welcome offer:', e);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-slate-700/80 bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-950 p-6 sm:p-8 shadow-2xl shadow-cyan-950/40 text-slate-100">
        {/* Glow ambient accent */}
        <div className="absolute -top-24 -right-24 w-52 h-52 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-52 h-52 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors"
          aria-label="Close"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>

        {step === 1 ? (
          /* STEP 1: Micro Personalization Quiz */
          <div className="space-y-6">
            <div className="space-y-2 text-center">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                <SparklesIcon className="w-3.5 h-3.5" /> Fast Setup · 15 Seconds
              </span>
              <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                Customize Your AI Workspace
              </h3>
              <p className="text-xs sm:text-sm text-slate-400">
                Help us calibrate the optimal GPU model parameters and unlock your Creator Welcome Pass.
              </p>
            </div>

            {/* Question 1 */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">
                1. What is your primary creation goal?
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'ecommerce', icon: '🛍️', label: 'E-commerce Photos' },
                  { id: 'social', icon: '🎨', label: 'Social & Visual Art' },
                  { id: 'stickers', icon: '🏷️', label: 'Stickers & Merch' },
                  { id: 'design', icon: '💼', label: 'Graphic Design' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setUseCase(item.id)}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-medium text-left transition-all ${
                      useCase === item.id
                        ? 'border-cyan-400 bg-cyan-500/15 text-white ring-1 ring-cyan-400 shadow-sm'
                        : 'border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700 hover:bg-slate-800/50'
                    }`}
                  >
                    <span className="text-base">{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Question 2 */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">
                2. What matters most to you?
              </label>
              <div className="grid grid-cols-1 gap-2">
                {[
                  { id: 'speed', icon: '⚡', label: 'Ultra-fast Dedicated GPU Queue (No Wait)' },
                  { id: 'quality', icon: '🔍', label: '4K Ultra-HD & Flawless Text Rendering' },
                  { id: 'license', icon: '🏢', label: 'Commercial Usage License & Never-Expiring Vault' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setPriority(item.id)}
                    className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs font-medium text-left transition-all ${
                      priority === item.id
                        ? 'border-cyan-400 bg-cyan-500/15 text-white ring-1 ring-cyan-400 shadow-sm'
                        : 'border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700 hover:bg-slate-800/50'
                    }`}
                  >
                    <span className="text-base">{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="pt-2">
              <button
                type="button"
                disabled={!useCase || !priority}
                onClick={handleCompleteSurvey}
                className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 transition-all shadow-lg shadow-cyan-500/25 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Unlock My Welcome Creator Pass</span>
                <span>→</span>
              </button>
            </div>
          </div>
        ) : (
          /* STEP 2: Value-Add Welcome Boost Offer ($4.99 for $7.99 Value / 160 Credits) */
          <div className="space-y-5 text-center">
            {/* Header Badge & Urgency */}
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                  🎁 Profile Configured · Exclusive Privilege Unlocked
                </span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Starter Boost Pack
              </h3>
              <p className="text-xs text-slate-400">
                Special bonus awarded for completing your creator setup.
              </p>
            </div>

            {/* Urgency Countdown Banner */}
            <div className="flex items-center justify-center gap-2 py-1.5 px-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-medium">
              <ClockIcon className="w-4 h-4 animate-pulse" />
              <span>Session Bonus expires in: <strong className="font-mono text-white text-sm">{formatTimer(timeLeft)}</strong></span>
            </div>

            {/* Main Value Box */}
            <div className="relative overflow-hidden rounded-2xl border-2 border-cyan-400/80 bg-slate-800/60 p-5 shadow-xl text-left space-y-4">
              <div className="flex items-baseline justify-between border-b border-slate-700/80 pb-3">
                <div>
                  <div className="text-xs uppercase tracking-wider font-semibold text-cyan-400">
                    Full AI Power
                  </div>
                  <div className="text-3xl font-black text-white flex items-baseline gap-2">
                    160 <span className="text-base font-bold text-slate-300">AI Credits</span>
                  </div>
                  <div className="text-[11px] text-amber-300 font-semibold mt-0.5">
                    ✨ 100 Base + 60 Extra Bonus Credits Free!
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs text-slate-400 line-through">
                    Total Value $7.99
                  </div>
                  <div className="text-2xl font-black text-cyan-300">
                    $4.99
                  </div>
                  <div className="text-[10px] font-bold text-emerald-400 uppercase">
                    Save 38% Instantly
                  </div>
                </div>
              </div>

              {/* Feature Checklist */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircleIcon className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span><strong>Never Expire</strong> · Use Anytime</span>
                </div>
                <div className="flex items-center gap-2">
                  <BoltIcon className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span><strong>Priority GPU Queue</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheckIcon className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span><strong>Full Commercial Rights</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircleIcon className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span><strong>4K Ultra-HD</strong> & No Watermarks</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                disabled={isLoading}
                onClick={handleClaimOffer}
                className="w-full py-3.5 px-6 rounded-xl font-bold text-base bg-gradient-to-r from-amber-400 via-cyan-400 to-blue-500 hover:from-amber-300 hover:via-cyan-300 hover:to-blue-400 text-slate-950 transition-all shadow-xl shadow-cyan-500/25 active:scale-[0.98] cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <span>Connecting to secure checkout...</span>
                ) : (
                  <>
                    <span>Claim 160 Credits for $4.99</span>
                    <span>→</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleDismiss}
                className="text-xs text-slate-500 hover:text-slate-300 transition-colors py-1 cursor-pointer block mx-auto"
              >
                Maybe later, continue with free trial
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
