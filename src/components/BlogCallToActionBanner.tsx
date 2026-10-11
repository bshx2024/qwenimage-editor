'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  SparklesIcon,
  XMarkIcon,
  ArrowRightIcon,
  PhotoIcon,
  BoltIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';

interface BlogCallToActionBannerProps {
  locale?: string;
  slug?: string;
  postTitle?: string;
}

export default function BlogCallToActionBanner({
  locale = 'en',
  slug = '',
  postTitle = '',
}: BlogCallToActionBannerProps) {
  const [topBannerDismissed, setTopBannerDismissed] = useState<boolean>(false);
  const [showFloatingWidget, setShowFloatingWidget] = useState<boolean>(false);
  const [floatingDismissed, setFloatingDismissed] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (sessionStorage.getItem('qwen_blog_top_banner_dismissed') === '1') {
      setTopBannerDismissed(true);
    }
    if (sessionStorage.getItem('qwen_blog_float_dismissed') === '1') {
      setFloatingDismissed(true);
    }

    const handleScroll = () => {
      // Show floating widget after scrolling down 400px
      if (window.scrollY > 400) {
        setShowFloatingWidget(true);
      } else {
        setShowFloatingWidget(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleDismissTop = () => {
    setTopBannerDismissed(true);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('qwen_blog_top_banner_dismissed', '1');
    }
  };

  const handleDismissFloat = () => {
    setFloatingDismissed(true);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('qwen_blog_float_dismissed', '1');
    }
  };

  const homeUrl = `/${locale}`;

  const fashionPresets = [
    { label: '👗 AI Clothes & Dress Swap', prompt: 'Swap clothes to elegant red silk evening dress' },
    { label: '👙 Summer Bikini Swap', prompt: 'Change outfit to fitted summer bikini swimwear' },
    { label: '👔 Business Suit', prompt: 'Change clothing to sharp navy business suit' },
    { label: '🌅 Golden Hour Lighting', prompt: 'Add golden hour sunset lighting and warmth' },
  ];

  return (
    <>
      {/* 1. Top Fixed Notification Bar */}
      {!topBannerDismissed && (
        <div className="relative z-50 bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-950 border-b border-indigo-500/30 text-white shadow-xl shadow-indigo-950/40">
          <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex items-center justify-between gap-3 text-xs sm:text-sm">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold text-[10px] sm:text-xs shrink-0 shadow-sm animate-pulse">
                <SparklesIcon className="w-3.5 h-3.5" />
                <span>TRY ONLINE FREE</span>
              </span>
              <p className="truncate text-slate-200">
                <span className="font-semibold text-white">Qwen Image Editor:</span>{' '}
                <span className="hidden sm:inline">
                  Edit photos, replace clothes &amp; inpaint with natural AI prompts.
                </span>{' '}
                <span className="text-cyan-300 font-medium">2 Free Generations, No VRAM Needed!</span>
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Link
                href={homeUrl}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-bold text-xs shadow-md shadow-indigo-500/20 transition-all cursor-pointer whitespace-nowrap"
              >
                <span>Launch Free Editor</span>
                <ArrowRightIcon className="w-3.5 h-3.5" />
              </Link>
              <button
                type="button"
                onClick={handleDismissTop}
                className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                aria-label="Dismiss banner"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Floating Bottom High-Converting Widget (Appears upon scrolling) */}
      {showFloatingWidget && !floatingDismissed && (
        <aside
          aria-label="Try Qwen Image Editor floating card"
          className="fixed bottom-4 right-4 z-40 max-w-sm w-[calc(100vw-2rem)] sm:w-96 rounded-2xl border border-indigo-500/40 bg-slate-900/95 backdrop-blur-xl p-4 shadow-2xl shadow-indigo-950/60 transition-all transform animate-in fade-in slide-in-from-bottom-4 duration-300"
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/30">
                <SparklesIcon className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
                  <span>Qwen Image Editor</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-cyan-500/20 text-cyan-300 font-mono">
                    Online
                  </span>
                </h4>
                <p className="text-[11px] text-slate-400">
                  Ready to test AI photo editing &amp; fashion swap?
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleDismissFloat}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              aria-label="Dismiss floating widget"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Presets Carousel / Chips */}
          <div className="py-2.5 space-y-1.5">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
              Popular 1-Click Presets:
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              {fashionPresets.map((preset, idx) => (
                <Link
                  key={idx}
                  href={`${homeUrl}?prompt=${encodeURIComponent(preset.prompt)}`}
                  className="px-2 py-1.5 rounded-lg border border-slate-800 bg-slate-950/60 hover:border-indigo-500/50 hover:bg-slate-800/80 text-[11px] text-slate-300 hover:text-white transition-all truncate block text-left font-medium"
                  title={preset.prompt}
                >
                  {preset.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Primary CTA Button */}
          <div className="pt-2 flex items-center gap-2">
            <Link
              href={homeUrl}
              className="flex-1 inline-flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-indigo-500/25 transition-all text-center"
            >
              <BoltIcon className="w-3.5 h-3.5" />
              <span>Start Free Editing (2 Free Trials)</span>
            </Link>
          </div>

          {/* Trust Guarantee */}
          <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400 pt-1.5 border-t border-slate-800/60">
            <span className="flex items-center gap-1">
              <ShieldCheckIcon className="w-3 h-3 text-emerald-400" />
              <span>No credit card needed</span>
            </span>
            <span className="text-slate-500">2.5s Cloud GPU inference</span>
          </div>
        </aside>
      )}
    </>
  );
}
