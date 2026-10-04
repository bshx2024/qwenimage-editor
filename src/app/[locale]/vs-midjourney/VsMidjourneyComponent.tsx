'use client'
import HeadInfo from "~/components/HeadInfo";
import Header from "~/components/Header";
import Footer from "~/components/Footer";
import Link from "next/link";
import { useState } from "react";
import { getLinkHref } from "~/configs/buildLink";
import {
  SparklesIcon,
  ChevronDownIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowsRightLeftIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";

export default function VsMidjourneyComponent({ locale = 'en' }: { locale?: string }) {
  const [faqOpen, setFaqOpen] = useState<{ [key: number]: boolean }>({ 0: true, 1: true });

  const comparisonTable = [
    { feature: 'Core Architecture', qwen: '7B Unified Vision-Language Transformer', mj: 'Proprietary Closed Diffusion Model' },
    { feature: 'Bilingual Text Rendering', qwen: 'Exceptional (English + Chinese precision)', mj: 'Moderate (English short phrases only)' },
    { feature: 'Natural Language Inpainting', qwen: 'Native (Direct text instruction editing)', mj: 'Vary (Region) brush in Discord' },
    { feature: 'Ecosystem & Openness', qwen: 'Open Weights & Web API available', mj: 'Closed garden (Discord / Web subscription)' },
    { feature: 'Starting Cost', qwen: 'Free Online Tier available', mj: 'Paid only (from $10/month)' },
    { feature: 'Artistic Stylization', qwen: 'High Photorealism & Commercial Design', mj: 'Signature painterly & aesthetic flair' },
    { feature: 'Image-to-Image Consistency', qwen: 'Strong character & structural retention', mj: 'High variance per generation' },
  ];

  const faqList = [
    {
      q: 'Which is better overall: Qwen Image 2.1 or Midjourney?',
      a: 'The choice depends on your production workflow. Qwen Image 2.1 dominates in precise text-guided editing, localized inpainting, accurate text and typography rendering, and developer API availability. Midjourney excels in out-of-the-box stylized artistic renders with its distinctive aesthetic presets.',
    },
    {
      q: 'Can Qwen Image 2.1 replace Midjourney for graphic design?',
      a: 'Yes, especially for packaging, poster design, and commercial ads where legible typography and predictable layout are essential. Qwen accurately spells words specified in prompts, whereas Midjourney often scrambles multi-word phrases.',
    },
    {
      q: 'How does localized editing compare between Qwen and Midjourney?',
      a: 'Qwen Image 2.1 allows natural language instruction editing (e.g., "change jacket to red, replace coffee with iced tea") directly. Midjourney requires using its manual "Vary Region" inpainting tool and regenerating partial selections through Discord or its web portal.',
    },
    {
      q: 'Is Qwen Image 2.1 open source?',
      a: 'Yes, the Qwen foundation model weights are open-sourced under permissive community terms, enabling self-hosting on local GPUs (via ComfyUI or Diffusers) as well as cloud API deployment on Replicate.',
    },
    {
      q: 'What is the cost difference between the two platforms?',
      a: 'Midjourney has no free trial and charges a minimum of $10 to $60 per month. Qwen Image Editor offers free daily tiers online, and pay-as-you-go GPU costs that are significantly cheaper for high-volume enterprise tasks.',
    },
    {
      q: 'Can Qwen Image 2.1 understand complex bilingual prompts?',
      a: 'Yes, trained extensively on both rich English and Chinese multimodal corpuses, Qwen Image understands nuanced idioms, cultural context, and bilingual character sets natively.',
    },
  ];

  const schemaData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        headline: 'Qwen Image 2.1 vs Midjourney — Which Is Better?',
        description:
          'Comprehensive comparison between Qwen Image 2.1 vs Midjourney evaluating image quality, typography rendering, instruction inpainting, and pricing.',
        image: '/images/model_compare_demo.jpg',
        author: {
          '@type': 'Organization',
          name: 'Qwen Image Editor',
        },
      },
      {
        '@type': 'FAQPage',
        mainEntity: faqList.map((item) => ({
          '@type': 'Question',
          name: item.q,
          acceptedAnswer: {
            '@type': 'Answer',
            text: item.a,
          },
        })),
      },
    ],
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white">
      <HeadInfo
        locale={locale}
        page="vs-midjourney"
        title="Qwen Image 2.1 vs Midjourney — Which Is Better?"
        description="Detailed comparison between Qwen Image 2.1 vs Midjourney. Compare image quality, text rendering accuracy, editing capabilities, speed, pricing, and openness."
        image="/images/model_compare_demo.jpg"
        schemaData={schemaData}
      />

      <Header locale={locale} page="vs-midjourney" />

      <main className="flex-1 w-full">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-10 pb-16 lg:pt-16 lg:pb-20 border-b border-slate-900">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-indigo-600/15 blur-[120px] pointer-events-none rounded-full" />
          
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-300">
              <ArrowsRightLeftIcon className="w-4 h-4 text-indigo-400" />
              <span>Head-to-Head AI Benchmark</span>
            </div>
            
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Qwen Image 2.1 vs Midjourney — Which Is Better?
            </h1>
            
            <p className="text-base sm:text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed">
              Discover how Alibaba&apos;s open-weights vision champion Qwen Image 2.1 compares against Midjourney V6 in photorealism, typography rendering, instruction-based editing, and production cost.
            </p>

            <div className="flex items-center justify-center gap-4 pt-4">
              <Link
                href={getLinkHref(locale, '')}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 hover:opacity-95 transition-all"
              >
                <SparklesIcon className="w-4 h-4" />
                Try Qwen Image Editor Free
              </Link>
              <Link
                href={getLinkHref(locale, 'generator')}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/80 px-5 py-2.5 text-xs sm:text-sm font-semibold text-slate-200 hover:border-slate-500 transition-all"
              >
                Launch Generator
              </Link>
            </div>
          </div>
        </section>

        {/* Quick Verdict Summary Table */}
        <section className="py-14 border-b border-slate-900 bg-slate-950/60">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white tracking-tight">Executive Verdict & Comparison Table</h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Key capability breakdown across critical AI imaging dimensions.
              </p>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-800 shadow-xl">
              <table className="min-w-full divide-y divide-slate-800 text-left text-xs sm:text-sm">
                <thead className="bg-slate-900/90 text-slate-200 font-semibold">
                  <tr>
                    <th scope="col" className="px-6 py-4">Evaluation Metric</th>
                    <th scope="col" className="px-6 py-4 text-indigo-400 font-bold">Qwen Image 2.1</th>
                    <th scope="col" className="px-6 py-4 text-slate-300">Midjourney V6</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 bg-slate-950/40 text-slate-300">
                  {comparisonTable.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-900/40 transition-colors">
                      <td className="px-6 py-4 font-semibold text-white">{row.feature}</td>
                      <td className="px-6 py-4 text-indigo-300 font-medium">{row.qwen}</td>
                      <td className="px-6 py-4 text-slate-400">{row.mj}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Side by Side Visual Comparison Demonstration */}
        <section className="py-16 border-b border-slate-900">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="text-center max-w-2xl mx-auto">
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Visual Comparison: Typography & Precision
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-2">
                Real-world benchmark rendering poster typography and complex object layout.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 sm:p-6 shadow-2xl">
              <img
                src="/images/model_compare_demo.jpg"
                alt="Qwen Image 2.1 vs Midjourney Text Rendering Benchmark"
                className="w-full rounded-xl object-contain shadow-lg"
              />
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-300 pt-2">
                <div className="rounded-lg bg-slate-950/60 p-3 border border-slate-800">
                  <span className="font-semibold text-slate-200 block mb-1">Standard AI Generation:</span>
                  Characters often merge together, producing pseudo-Latin scribbles and distorted glyphs.
                </div>
                <div className="rounded-lg bg-slate-950/60 p-3 border border-indigo-500/30">
                  <span className="font-semibold text-indigo-300 block mb-1">Qwen Image 2.1 Output:</span>
                  Crisp, legible font types with correct spelling matching prompt keywords and proper kerning.
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Detailed Comparison Categories */}
        <section className="py-16 border-b border-slate-900 bg-slate-950/30">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-12">
            <article className="space-y-4">
              <h2 className="text-2xl font-bold text-white tracking-tight">
                1. Text-Guided Inpainting & Iterative Editing
              </h2>
              <p className="text-sm leading-relaxed text-slate-300">
                While Midjourney was created as a prompt-to-image artistic sandbox, <strong>Qwen Image 2.1</strong> was designed from inception with unified image editing capabilities. In production environments, creators rarely want to regenerate entire images from scratch; instead, they want to modify specific attributes—such as changing apparel, replacing backgrounds, adjusting localized lighting, or adding accessories.
              </p>
              <p className="text-sm leading-relaxed text-slate-300">
                With Qwen Image Editor, you can upload any existing photo and supply conversational edit instructions. The underlying model accurately isolates the target region while maintaining photorealistic shading and facial consistency.
              </p>
            </article>

            <article className="space-y-4">
              <h2 className="text-2xl font-bold text-white tracking-tight">
                2. Legible Typography & Graphic Design Adherence
              </h2>
              <p className="text-sm leading-relaxed text-slate-300">
                For commercial branding, YouTube thumbnails, and marketing banners, spelling accuracy inside the generated image is paramount. While Midjourney V6 made commendable progress with short English phrases, it frequently suffers from garbled letters when prompts require specific slogans or bilingual copy.
              </p>
              <p className="text-sm leading-relaxed text-slate-300">
                Qwen Image 2.1 achieves unprecedented benchmarks in character recognition and text rendering, making it the definitive platform for marketing mockups, book covers, and localized graphic collateral.
              </p>
            </article>

            <article className="space-y-4">
              <h2 className="text-2xl font-bold text-white tracking-tight">
                3. Ecosystem, API Access & Commercial Freedom
              </h2>
              <p className="text-sm leading-relaxed text-slate-300">
                Midjourney remains strictly walled behind proprietary interfaces and Discord bot subscriptions, with no official developer API for automated backend integration. In contrast, Qwen Image 2.1 provides open community weights, Replicate API endpoints, and seamless web embedding in custom applications like <Link href={getLinkHref(locale, '')} className="text-indigo-400 hover:underline">Qwen Image Editor</Link>.
              </p>
            </article>
          </div>
        </section>

        {/* Who Should Choose Which */}
        <section className="py-16 border-b border-slate-900">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Who Should Choose Which Model?
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="rounded-2xl border border-indigo-500/40 bg-indigo-950/20 p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <SparklesIcon className="w-5 h-5 text-indigo-400" />
                  <h3 className="text-lg font-bold text-white">Choose Qwen Image 2.1 if you need:</h3>
                </div>
                <ul className="space-y-2.5 text-xs sm:text-sm text-slate-300">
                  <li className="flex items-start gap-2">
                    <CheckIcon className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Precise image-to-image editing, inpainting, and prompt-driven alterations.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckIcon className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Flawless English or bilingual text spelling on posters and products.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckIcon className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>API-driven automated content workflows with transparent pricing.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckIcon className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Free online browser-based interface without Discord setup.</span>
                  </li>
                </ul>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <SparklesIcon className="w-5 h-5 text-slate-400" />
                  <h3 className="text-lg font-bold text-white">Choose Midjourney if you need:</h3>
                </div>
                <ul className="space-y-2.5 text-xs sm:text-sm text-slate-300">
                  <li className="flex items-start gap-2">
                    <CheckIcon className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <span>Abstract fantasy concepts where exact literal prompt adherence is secondary.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckIcon className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <span>Signature default stylization with cinematic atmospheric lighting.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckIcon className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <span>Exploration of surrealist moods and creative serendipity.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Related Comparisons Module */}
        <section className="py-14 border-b border-slate-900 bg-slate-950/60">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-6">
            <h2 className="text-xl font-bold text-white">Related Comparisons & Resources</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Link
                href={getLinkHref(locale, 'vs-nano-banana')}
                className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 hover:border-indigo-500/50 transition-colors group"
              >
                <div className="text-xs text-indigo-400 font-semibold mb-1">Benchmark</div>
                <div className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">
                  Qwen Image 2.1 vs Nano Banana →
                </div>
                <p className="text-xs text-slate-400 mt-1">Full comparison on speed and hardware efficiency.</p>
              </Link>
              <Link
                href={getLinkHref(locale, 'vs-flux')}
                className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 hover:border-indigo-500/50 transition-colors group"
              >
                <div className="text-xs text-indigo-400 font-semibold mb-1">Benchmark</div>
                <div className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">
                  Qwen Image 2.1 vs Flux →
                </div>
                <p className="text-xs text-slate-400 mt-1">Quality, VRAM cost, and generation speed.</p>
              </Link>
              <Link
                href={getLinkHref(locale, 'generator')}
                className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 hover:border-indigo-500/50 transition-colors group"
              >
                <div className="text-xs text-purple-400 font-semibold mb-1">Tool</div>
                <div className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors">
                  Qwen Image Generator →
                </div>
                <p className="text-xs text-slate-400 mt-1">Try text-to-image synthesis online for free.</p>
              </Link>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Comparison FAQ
              </h2>
            </div>
            <div className="space-y-4">
              {faqList.map((faq, idx) => (
                <div key={idx} className="rounded-2xl border border-slate-800 bg-slate-900/40 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setFaqOpen((prev) => ({ ...prev, [idx]: !prev[idx] }))}
                    className="w-full flex items-center justify-between p-5 text-left text-sm sm:text-base font-semibold text-slate-100 hover:text-indigo-400 transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDownIcon
                      className={`w-5 h-5 text-slate-400 transition-transform ${
                        faqOpen[idx] ? 'rotate-180 text-indigo-400' : ''
                      }`}
                    />
                  </button>
                  {faqOpen[idx] && (
                    <div className="px-5 pb-5 text-xs sm:text-sm text-slate-400 leading-relaxed border-t border-slate-800/60 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer locale={locale} page="vs-midjourney" />
    </div>
  );
}
