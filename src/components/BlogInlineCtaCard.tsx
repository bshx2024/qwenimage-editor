'use client';

import React from 'react';
import Link from 'next/link';
import {
  SparklesIcon,
  ArrowRightIcon,
  BoltIcon,
  ShieldCheckIcon,
  CpuChipIcon,
  CheckBadgeIcon
} from '@heroicons/react/24/outline';

interface BlogInlineCtaCardProps {
  locale?: string;
  contextTitle?: string;
  variant?: 'compact' | 'full';
  customTitle?: string;
  customDescription?: string;
  customBadge?: string;
  customButtonText?: string;
  customPresets?: Array<{
    label: string;
    prompt: string;
    tag: string;
  }>;
}

export default function BlogInlineCtaCard({
  locale = 'en',
  contextTitle = '',
  variant = 'full',
  customTitle,
  customDescription,
  customBadge,
  customButtonText,
  customPresets,
}: BlogInlineCtaCardProps) {
  const homeUrl = `/${locale}`;

  const defaultPresets = [
    {
      label: '👗 Fashion & Clothes Try-On',
      prompt: 'Swap clothes to elegant emerald green silk gala evening dress, high slit',
      tag: 'Trending'
    },
    {
      label: '🤵 Bespoke Tuxedo & Suit Swap',
      prompt: 'Change outfit to a sharp bespoke black velvet tuxedo with satin peak lapels',
      tag: 'Portrait'
    },
    {
      label: '🌆 Cyberpunk Background Inpaint',
      prompt: 'Change background to a neon-lit cyberpunk Tokyo street at night',
      tag: 'Lighting'
    },
    {
      label: '🔤 Clean Text & Typography Edit',
      prompt: 'Inpaint magazine cover title to "QWEN 2026", perfectly crisp typography',
      tag: 'Precise'
    },
  ];

  const presets = customPresets && customPresets.length > 0 ? customPresets : defaultPresets;

  if (variant === 'compact') {
    return (
      <aside
        aria-label="Try visual AI editor inline"
        className="my-8 relative overflow-hidden rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-slate-950 via-indigo-950/40 to-slate-950 p-5 shadow-xl shadow-indigo-950/20"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                <BoltIcon className="w-3 h-3" /> Zero GPU Setup
              </span>
              <span className="text-xs text-slate-400">Cloud Web Edition</span>
            </div>
            <h4 className="text-base font-bold text-white tracking-tight">
              {customTitle || 'Prefer testing Visual AI online without local VRAM limits?'}
            </h4>
            <p className="text-xs text-slate-300">
              {customDescription || 'Try inpainting, fashion swapping & prompt editing in your browser with 2 free instant trials.'}
            </p>
          </div>

          <Link
            href={`${homeUrl}?utm_source=blog_inline_compact`}
            data-umami-event="blog_inline_compact_click"
            data-umami-event-context={contextTitle}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-600 to-cyan-500 hover:from-indigo-400 hover:to-cyan-400 text-white font-bold text-xs shadow-lg shadow-indigo-500/25 transition-all whitespace-nowrap self-start sm:self-center"
          >
            <span>Launch Web Editor</span>
            <ArrowRightIcon className="w-3.5 h-3.5" />
          </Link>
        </div>
      </aside>
    );
  }

  return (
    <aside
      aria-label="Try interactive diffusion sandbox"
      className="my-10 relative overflow-hidden rounded-3xl border border-indigo-500/40 bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950/70 p-6 sm:p-8 shadow-2xl shadow-indigo-950/40 backdrop-blur-xl"
    >
      {/* Background radial highlight */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 space-y-5">
        {/* Header Tag & Title */}
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-indigo-300 border border-indigo-500/30">
              <SparklesIcon className="w-3.5 h-3.5 text-cyan-400" />
              <span>Interactive Cloud Alternative</span>
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
              <CpuChipIcon className="w-3 h-3 text-emerald-400" />
              <span>No 16GB–24GB VRAM or CUDA Required</span>
            </span>
          </div>

          <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            {customTitle || 'Skip Local Environment Setup — Test Visual AI Live'}
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            {customDescription || "Don't want to struggle with HuggingFace weights, multi-GPU quantization, or CUDA OOM errors? Test fast diffusion and neural inpainting directly in our cloud-accelerated web studio with zero setup."}
          </p>
        </div>

        {/* 1-Click Preset Tiles */}
        <div className="space-y-2 pt-1">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Click to Launch with 1-Click Interactive Demo:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {presets.map((item, idx) => (
              <Link
                key={idx}
                href={`${homeUrl}?utm_source=blog_inline&prompt=${encodeURIComponent(item.prompt)}`}
                data-umami-event="blog_inline_preset_click"
                data-umami-event-context={contextTitle}
                data-umami-event-preset={item.label}
                className="group relative flex items-center justify-between p-3 rounded-2xl border border-slate-800 bg-slate-900/80 hover:bg-slate-800/90 hover:border-indigo-500/60 transition-all shadow-sm"
              >
                <div className="space-y-0.5 truncate pr-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors truncate">
                      {item.label}
                    </span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-400 font-mono">
                      {item.tag}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 truncate group-hover:text-slate-300 transition-colors">
                    &quot;{item.prompt}&quot;
                  </p>
                </div>
                <div className="w-7 h-7 rounded-lg bg-indigo-500/10 group-hover:bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 transition-colors">
                  <ArrowRightIcon className="w-3.5 h-3.5" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Bottom CTA Row & Trust Signals */}
        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-800/80">
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
            <span className="inline-flex items-center gap-1.5 text-slate-300">
              <CheckBadgeIcon className="w-4 h-4 text-emerald-400" />
              <span>2 Free Instant Trials</span>
            </span>
            <span className="inline-flex items-center gap-1.5 text-slate-300">
              <ShieldCheckIcon className="w-4 h-4 text-cyan-400" />
              <span>No Credit Card Needed</span>
            </span>
            <span className="hidden md:inline text-slate-500">
              • High-Speed GPU Offloading (~8–15s per generation)
            </span>
          </div>

          <Link
            href={`${homeUrl}?utm_source=blog_inline_btn`}
            data-umami-event="blog_inline_full_click"
            data-umami-event-context={contextTitle}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-600 to-cyan-500 hover:from-indigo-400 hover:to-cyan-400 text-white font-extrabold text-xs sm:text-sm shadow-xl shadow-indigo-500/25 transition-all text-center"
          >
            <BoltIcon className="w-4 h-4" />
            <span>{customButtonText || 'Open Web Studio (Free)'}</span>
            <ArrowRightIcon className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </aside>
  );
}
