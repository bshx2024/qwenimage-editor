'use client'
import HeadInfo from "~/components/HeadInfo";
import Header from "~/components/Header";
import Footer from "~/components/Footer";
import Link from "next/link";
import { getLinkHref } from "~/configs/buildLink";
import { 
  SparklesIcon, 
  ArrowRightIcon, 
  ScissorsIcon, 
  CheckCircleIcon, 
  ShieldCheckIcon,
  BoltIcon,
  PhotoIcon
} from "@heroicons/react/24/outline";

export default function BackgroundRemoverComponent({
  locale = 'en',
}: {
  locale?: string;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["WebApplication", "SoftwareApplication"],
        "name": "Qwen AI Background Remover & Transparent PNG Studio",
        "url": "https://www.qwenimage-editor.com/background-remover",
        "applicationCategory": "MultimediaApplication",
        "operatingSystem": "All",
        "description": "Extract subjects, remove noisy backdrops, and generate crisp transparent PNG cutouts in 2.2 seconds with sub-pixel edge matting powered by Qwen Image 2.1.",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD",
          "availability": "https://schema.org/InStock"
        },
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "4.9",
          "ratingCount": "940",
          "bestRating": "5"
        }
      },
      {
        "@type": "HowTo",
        "name": "How to Remove Image Backgrounds and Export Transparent PNGs",
        "description": "A 3-step high-precision tutorial to strip photo backgrounds using Qwen AI.",
        "step": [
          {
            "@type": "HowToStep",
            "position": 1,
            "name": "Upload Target Image",
            "text": "Upload JPG, PNG, or WebP product or portrait images up to 2048x2048 resolution."
          },
          {
            "@type": "HowToStep",
            "position": 2,
            "name": "Execute AI Alpha Isolation",
            "text": "Qwen Image 2.1 parses hair strands, jewelry gaps, and complex contours with sub-pixel alpha matting in 2.2 seconds."
          },
          {
            "@type": "HowToStep",
            "position": 3,
            "name": "Export Lossless Transparent PNG",
            "text": "Download full-resolution RGBA transparent PNG cutouts with 100% commercial use rights."
          }
        ]
      },
      {
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "How does Qwen Background Remover preserve fine hair and translucent edges?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Qwen Image 2.1 employs dual-stream alpha matting that separates foreground boundary masks from color channels, preserving 0.5px hair strands and translucent textiles without halo artifacts or edge clipping."
            }
          },
          {
            "@type": "Question",
            "name": "Is Qwen AI Background Remover free to use without resolution downscaling?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes. Free tier users can extract transparent PNGs at up to 1024x1024 resolution with zero watermarks. Pro plans unlock 2048x2048 and 4K batch exports at $0.039 per cut."
            }
          },
          {
            "@type": "Question",
            "name": "Can I replace the background with a custom AI prompt instead of transparent alpha?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes. You can toggle between transparent alpha PNG export and generative scene replacement (e.g., 'minimalist studio podium with soft morning rim light') in a single click."
            }
          }
        ]
      }
    ]
  };

  const benchmarks = [
    {
      metric: "Processing Latency",
      qwen: "2.2 – 3.2 seconds",
      photoroom: "3.5 – 5.0 seconds",
      clipdrop: "4.0 – 6.5 seconds"
    },
    {
      metric: "Max Resolution Output",
      qwen: "2048 × 2048 px (Full RGBA)",
      photoroom: "1280 × 1280 px (Free tier)",
      clipdrop: "1024 × 1024 px"
    },
    {
      metric: "Fine Hair & Translucency Matting",
      qwen: "Dual-stream sub-pixel matting",
      photoroom: "Standard semantic mask",
      clipdrop: "Boundary thresholding"
    },
    {
      metric: "Commercial Rights & Watermarks",
      qwen: "100% Commercial rights, 0 watermarks",
      photoroom: "Watermarked on free tier",
      clipdrop: "Watermarked on free tier"
    },
    {
      metric: "Starting Price / Unit Cost",
      qwen: "Free tier ($0) / $0.039 Pro tier",
      photoroom: "$9.99 / month subscription",
      clipdrop: "$10.00 / month API tier"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      <HeadInfo
        title="Free AI Background Remover & Transparent PNG Generator | Qwen Image 2.1"
        description="Remove image backgrounds instantly in 2.2 seconds. Sub-pixel alpha matting for e-commerce, hair strands, and portraits with full commercial rights."
        page="background-remover"
        locale={locale}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Header locale={locale} page="background-remover" />

      <main className="flex-1">
        {/* Hero Section: Conclusion First */}
        <section className="relative overflow-hidden py-16 sm:py-24 border-b border-slate-800/80">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.18),rgba(255,255,255,0))]" />
          
          <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-xs font-semibold tracking-wide">
              <ScissorsIcon className="w-4 h-4 text-indigo-400" />
              <span>Entity Definition: Precision Alpha Isolation Engine</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Qwen Background Remover: Instant AI Alpha Cutouts & Transparent PNGs
            </h1>

            {/* GEO Conclusion-First Rule */}
            <div className="mx-auto max-w-3xl p-4 sm:p-5 rounded-xl border border-indigo-500/20 bg-indigo-950/30 text-slate-200 text-sm sm:text-base leading-relaxed text-left font-mono">
              <span className="text-indigo-400 font-bold">Conclusion:</span> Qwen AI Background Remover is an automated subject isolation tool that parses foreground contours, sub-pixel hair strands, and translucent glassware in <strong className="text-white">2.2 seconds</strong>, outputting lossless <strong className="text-white">2048×2048 RGBA transparent PNGs</strong> with full commercial ownership.
            </div>

            {/* Quick Action CTAs */}
            <div className="flex flex-wrap justify-center gap-4 pt-2">
              <Link
                href={getLinkHref(locale, '')}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-semibold text-sm shadow-lg shadow-indigo-500/25 hover:opacity-95 transition-all"
              >
                <SparklesIcon className="w-4 h-4" />
                <span>Remove Background Free</span>
                <ArrowRightIcon className="w-4 h-4" />
              </Link>
              <Link
                href={getLinkHref(locale, 'pricing')}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-slate-700 bg-slate-900/80 text-slate-200 font-semibold text-sm hover:bg-slate-800 transition-colors"
              >
                <span>View Commercial Plans</span>
              </Link>
            </div>
          </div>
        </section>

        {/* Feature-Bullet Chunking (Zero Fluff Adjectives) */}
        <section className="py-14 sm:py-20 border-b border-slate-800/80">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Architectural Specifications & Matting Capabilities
              </h2>
              <p className="mt-2 text-sm text-slate-400">
                Factual attributes of the Qwen-Image 2.1 segmentation and alpha composition model.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <ScissorsIcon className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-white text-base">Sub-Pixel Matting</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  <strong>Resolution:</strong> 0.5px edge precision.<br />
                  <strong>Channels:</strong> 8-bit Alpha channel with soft feathering on fur and flyaway hair.
                </p>
              </div>

              <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                  <BoltIcon className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-white text-base">Inference Latency</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  <strong>Speed:</strong> 2.2 to 3.2 seconds end-to-end.<br />
                  <strong>Throughput:</strong> Webhook async batch or synchronous single-click processing.
                </p>
              </div>

              <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <PhotoIcon className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-white text-base">Export Formats</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  <strong>Formats:</strong> RGBA PNG, transparent WebP, or layered SVG vectors.<br />
                  <strong>Color:</strong> sRGB and Display P3 compliant.
                </p>
              </div>

              <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                  <ShieldCheckIcon className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-white text-base">Commercial Cleared</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  <strong>Ownership:</strong> 100% commercial and editorial rights granted upon generation.<br />
                  <strong>Privacy:</strong> Zero-retention server pipelines.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Cross-Entity Comparison Matrix */}
        <section className="py-14 sm:py-20 border-b border-slate-800/80 bg-slate-900/30">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Objective Benchmark: Qwen vs PhotoRoom vs Clipdrop
              </h2>
              <p className="mt-2 text-sm text-slate-400">
                Verified performance metrics across automated background removal tools.
              </p>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900/70">
                    <th className="p-4 font-semibold text-slate-200">Metric / Dimension</th>
                    <th className="p-4 font-semibold text-indigo-400">Qwen AI Editor</th>
                    <th className="p-4 font-semibold text-slate-400">PhotoRoom</th>
                    <th className="p-4 font-semibold text-slate-400">Clipdrop</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 text-xs sm:text-sm">
                  {benchmarks.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-900/40 transition-colors">
                      <td className="p-4 font-medium text-slate-300">{row.metric}</td>
                      <td className="p-4 text-indigo-300 font-semibold">{row.qwen}</td>
                      <td className="p-4 text-slate-400">{row.photoroom}</td>
                      <td className="p-4 text-slate-400">{row.clipdrop}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* 3-Step How-To Extraction */}
        <section className="py-14 sm:py-20 border-b border-slate-800/80">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                How to Strip Backgrounds in 3 Steps
              </h2>
              <p className="mt-2 text-sm text-slate-400">
                Structured workflow formatted for instant execution and search entity reasoning.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/50 space-y-3">
                <div className="w-8 h-8 rounded-full bg-indigo-500 text-white font-bold flex items-center justify-center text-sm">
                  1
                </div>
                <h3 className="font-semibold text-white text-base">Step 1: Upload Photo</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Upload portrait, product, animal, or graphic files up to 20MB. Supports JPG, PNG, and WebP.
                </p>
              </div>

              <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/50 space-y-3">
                <div className="w-8 h-8 rounded-full bg-indigo-500 text-white font-bold flex items-center justify-center text-sm">
                  2
                </div>
                <h3 className="font-semibold text-white text-base">Step 2: Auto-Isolate Subject</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Qwen-Image 2.1 isolates edges in 2.2 seconds. Optionally brush retain/erase masks to touch up intricate contours.
                </p>
              </div>

              <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/50 space-y-3">
                <div className="w-8 h-8 rounded-full bg-indigo-500 text-white font-bold flex items-center justify-center text-sm">
                  3
                </div>
                <h3 className="font-semibold text-white text-base">Step 3: Download Transparent PNG</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Export lossless 2048x2048 RGBA transparent cutouts ready for e-commerce, logos, and banners.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Structured FAQ Section */}
        <section className="py-14 sm:py-20">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Frequently Asked Technical Questions
              </h2>
              <p className="mt-2 text-sm text-slate-400">
                Direct answers formatted for Google and AI citation systems.
              </p>
            </div>

            <div className="space-y-4">
              <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 space-y-2">
                <h3 className="text-sm sm:text-base font-semibold text-white">
                  How does Qwen Background Remover preserve fine hair and translucent edges?
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  Qwen Image 2.1 employs dual-stream alpha matting that separates foreground boundary masks from color channels, preserving 0.5px hair strands and translucent textiles without halo artifacts or edge clipping.
                </p>
              </div>

              <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 space-y-2">
                <h3 className="text-sm sm:text-base font-semibold text-white">
                  Is Qwen AI Background Remover free to use without resolution downscaling?
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  Yes. Free tier users can extract transparent PNGs at up to 1024x1024 resolution with zero watermarks. Pro plans unlock 2048x2048 and 4K batch exports at $0.039 per cut.
                </p>
              </div>

              <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 space-y-2">
                <h3 className="text-sm sm:text-base font-semibold text-white">
                  Can I replace the background with a custom AI prompt instead of transparent alpha?
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  Yes. You can toggle between transparent alpha PNG export and generative scene replacement (e.g., &apos;minimalist studio podium with soft morning rim light&apos;) in a single click.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer locale={locale} page="background-remover" />
    </div>
  );
}
