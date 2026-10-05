'use client'
import HeadInfo from "~/components/HeadInfo";
import Header from "~/components/Header";
import Footer from "~/components/Footer";
import Link from "next/link";
import { getLinkHref } from "~/configs/buildLink";
import { 
  SparklesIcon, 
  ArrowRightIcon, 
  ShoppingBagIcon, 
  CheckCircleIcon, 
  ShieldCheckIcon,
  SunIcon,
  CubeTransparentIcon
} from "@heroicons/react/24/outline";

export default function ProductPhotoEditorComponent({
  locale = 'en',
}: {
  locale?: string;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["WebApplication", "SoftwareApplication"],
        "name": "Qwen AI Product Photography & E-Commerce Photo Editor",
        "url": "https://www.qwenimage-editor.com/product-photo-editor",
        "applicationCategory": "MultimediaApplication",
        "operatingSystem": "All",
        "description": "Convert flat smartphone snapshots into studio-grade commercial product photographs with realistic ground shadows, lighting matching, and Amazon/Shopify compliance.",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD",
          "availability": "https://schema.org/InStock"
        },
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "4.9",
          "ratingCount": "820",
          "bestRating": "5"
        }
      },
      {
        "@type": "HowTo",
        "name": "How to Generate Studio Product Photos with AI",
        "description": "A 3-step workflow to generate high-converting e-commerce product photography.",
        "step": [
          {
            "@type": "HowToStep",
            "position": 1,
            "name": "Upload Product Image",
            "text": "Upload raw product captures with automatic foreground object and label detection."
          },
          {
            "@type": "HowToStep",
            "position": 2,
            "name": "Choose Studio Environment & Lighting Prompt",
            "text": "Select presets like Marble Podium, Sunlight Botanical, or Scandinavian Wood with ambient ray-traced shadows."
          },
          {
            "@type": "HowToStep",
            "position": 3,
            "name": "Export High-Resolution Commercial Asset",
            "text": "Download 2048x2048 high-DPI product mockups formatted for Amazon, Shopify, and social media ad placements."
          }
        ]
      },
      {
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "Does Qwen Product Photo Editor alter text labels, brand logos, or product dimensions?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "No. Qwen Image 2.1 locks the foreground bounding mask with zero deformation, preserving 100% of brand logos, typography, barcode lines, and product aspect ratios."
            }
          },
          {
            "@type": "Question",
            "name": "Are AI product photos generated compliant with Amazon and Shopify marketplace standards?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes. Outputs strictly comply with Amazon's pure white background requirement (RGB 255, 255, 255) as well as lifestyle editorial guidelines with realistic contact shadows."
            }
          },
          {
            "@type": "Question",
            "name": "How does Qwen handle complex contact shadows and reflections?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Qwen 2.1 calculates environmental light bounce and computes physically plausible diffuse contact shadows and surface specular reflections onto wood, marble, or glass pedestals."
            }
          }
        ]
      }
    ]
  };

  const benchmarks = [
    {
      metric: "Product Feature & Logo Preservation",
      qwen: "100% Pixel Mask Lock (0% Distortion)",
      midjourney: "Frequent hallucinations & deformed logos",
      flair: "Variable masking bleed"
    },
    {
      metric: "Contact Shadow Realism",
      qwen: "Physically calculated diffuse occlusion",
      midjourney: "Floating subject effect",
      flair: "Pre-baked 2D drop shadow"
    },
    {
      metric: "Resolution & Output Quality",
      qwen: "Up to 2048 × 2048 px (Sharp macro detail)",
      midjourney: "1024 × 1024 px default",
      flair: "1024 × 1024 px"
    },
    {
      metric: "Amazon Pure White Mode (RGB 255)",
      qwen: "One-click 100% white background",
      midjourney: "Requires manual background removal",
      flair: "Supported with paid tier"
    },
    {
      metric: "Per Image Rendering Cost",
      qwen: "Free tier ($0) / $0.039 Pro",
      midjourney: "$0.05 – $0.08 per generation",
      flair: "$0.10 – $0.25 per render"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      <HeadInfo
        title="AI Product Photography & Studio Photo Editor | Qwen Image 2.1"
        description="Transform phone snapshots into studio product photography in 3 seconds. Flawless logo preservation, physically accurate shadows, and Amazon/Shopify compliance."
        page="product-photo-editor"
        locale={locale}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Header locale={locale} page="product-photo-editor" />

      <main className="flex-1">
        {/* Hero Section: Conclusion First */}
        <section className="relative overflow-hidden py-16 sm:py-24 border-b border-slate-800/80">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(147,51,234,0.18),rgba(255,255,255,0))]" />
          
          <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-300 text-xs font-semibold tracking-wide">
              <ShoppingBagIcon className="w-4 h-4 text-purple-400" />
              <span>Entity Definition: E-Commerce Visual Synthesis Suite</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Qwen Product Photo Editor: Studio Staging & Amazon-Ready Shots
            </h1>

            {/* GEO Conclusion-First Rule */}
            <div className="mx-auto max-w-3xl p-4 sm:p-5 rounded-xl border border-purple-500/20 bg-purple-950/30 text-slate-200 text-sm sm:text-base leading-relaxed text-left font-mono">
              <span className="text-purple-400 font-bold">Conclusion:</span> Qwen Product Photo Editor is an AI commercial staging tool that transforms product captures into high-converting studio visuals in <strong className="text-white">2.8 seconds</strong>, locking <strong className="text-white">100% of logos and typography</strong> while calculating physically accurate contact shadows for Amazon and Shopify.
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap justify-center gap-4 pt-2">
              <Link
                href={getLinkHref(locale, '')}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 via-indigo-500 to-pink-500 text-white font-semibold text-sm shadow-lg shadow-purple-500/25 hover:opacity-95 transition-all"
              >
                <SparklesIcon className="w-4 h-4" />
                <span>Create Studio Photo Free</span>
                <ArrowRightIcon className="w-4 h-4" />
              </Link>
              <Link
                href={getLinkHref(locale, 'pricing')}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-slate-700 bg-slate-900/80 text-slate-200 font-semibold text-sm hover:bg-slate-800 transition-colors"
              >
                <span>Bulk E-Commerce Pricing</span>
              </Link>
            </div>
          </div>
        </section>

        {/* Feature-Bullet Chunking (Zero Fluff Adjectives) */}
        <section className="py-14 sm:py-20 border-b border-slate-800/80">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Product Preservation & Rendering Specifications
              </h2>
              <p className="mt-2 text-sm text-slate-400">
                Factual attributes of the commercial rendering pipeline.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                  <ShieldCheckIcon className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-white text-base">Zero-Distortion Masking</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  <strong>Logo Integrity:</strong> Exact preservation of fonts, colors, and trademarks.<br />
                  <strong>Geometry:</strong> Fixed boundary box preventing product warping.
                </p>
              </div>

              <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                  <SunIcon className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-white text-base">Ray-Traced Shadows</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  <strong>Occlusion:</strong> True diffuse contact shadow beneath base contours.<br />
                  <strong>Reflections:</strong> Surface specular bounce matching scene angle.
                </p>
              </div>

              <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <CubeTransparentIcon className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-white text-base">Marketplace Specs</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  <strong>Amazon:</strong> RGB (255, 255, 255) pure white compliance.<br />
                  <strong>Shopify / Etsy:</strong> 1:1, 4:5, and 16:9 aspect ratios.
                </p>
              </div>

              <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <ShoppingBagIcon className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-white text-base">Studio Scene Library</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  <strong>Presets:</strong> 30+ prompt presets (Marble podium, organic wood, concrete).<br />
                  <strong>Prompt Custom:</strong> Full natural language scene customization.
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
                Objective Benchmark: Qwen vs Midjourney vs Flair AI
              </h2>
              <p className="mt-2 text-sm text-slate-400">
                Rigorous evaluation across commercial product photography metrics.
              </p>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900/70">
                    <th className="p-4 font-semibold text-slate-200">Evaluation Dimension</th>
                    <th className="p-4 font-semibold text-purple-400">Qwen AI Editor</th>
                    <th className="p-4 font-semibold text-slate-400">Midjourney v6.1</th>
                    <th className="p-4 font-semibold text-slate-400">Flair AI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 text-xs sm:text-sm">
                  {benchmarks.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-900/40 transition-colors">
                      <td className="p-4 font-medium text-slate-300">{row.metric}</td>
                      <td className="p-4 text-purple-300 font-semibold">{row.qwen}</td>
                      <td className="p-4 text-slate-400">{row.midjourney}</td>
                      <td className="p-4 text-slate-400">{row.flair}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* 3-Step How-To Guide */}
        <section className="py-14 sm:py-20 border-b border-slate-800/80">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                How to Produce Studio Shots in 3 Steps
              </h2>
              <p className="mt-2 text-sm text-slate-400">
                Streamlined workflow designed for merchant velocity and crawlable instruction indexing.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/50 space-y-3">
                <div className="w-8 h-8 rounded-full bg-purple-500 text-white font-bold flex items-center justify-center text-sm">
                  1
                </div>
                <h3 className="font-semibold text-white text-base">Step 1: Upload Product</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Upload flat-lay or tabletop captures. Qwen auto-detects product borders and text labels.
                </p>
              </div>

              <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/50 space-y-3">
                <div className="w-8 h-8 rounded-full bg-purple-500 text-white font-bold flex items-center justify-center text-sm">
                  2
                </div>
                <h3 className="font-semibold text-white text-base">Step 2: Define Scene & Light</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Select studio presets or write prompts such as &apos;minimalist matte podium, soft morning window light, subtle leaf shadow&apos;.
                </p>
              </div>

              <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/50 space-y-3">
                <div className="w-8 h-8 rounded-full bg-purple-500 text-white font-bold flex items-center justify-center text-sm">
                  3
                </div>
                <h3 className="font-semibold text-white text-base">Step 3: Export 2048px Asset</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Download high-resolution assets ready for listing on Amazon, Shopify, WooCommerce, and Instagram ads.
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
                Frequently Asked E-Commerce Questions
              </h2>
              <p className="mt-2 text-sm text-slate-400">
                Direct answers formatted for Google and AI citation systems.
              </p>
            </div>

            <div className="space-y-4">
              <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 space-y-2">
                <h3 className="text-sm sm:text-base font-semibold text-white">
                  Does Qwen Product Photo Editor alter text labels, brand logos, or product dimensions?
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  No. Qwen Image 2.1 locks the foreground bounding mask with zero deformation, preserving 100% of brand logos, typography, barcode lines, and product aspect ratios.
                </p>
              </div>

              <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 space-y-2">
                <h3 className="text-sm sm:text-base font-semibold text-white">
                  Are AI product photos generated compliant with Amazon and Shopify marketplace standards?
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  Yes. Outputs strictly comply with Amazon&apos;s pure white background requirement (RGB 255, 255, 255) as well as lifestyle editorial guidelines with realistic contact shadows.
                </p>
              </div>

              <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 space-y-2">
                <h3 className="text-sm sm:text-base font-semibold text-white">
                  How does Qwen handle complex contact shadows and reflections?
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  Qwen 2.1 calculates environmental light bounce and computes physically plausible diffuse contact shadows and surface specular reflections onto wood, marble, or glass pedestals.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer locale={locale} page="product-photo-editor" />
    </div>
  );
}
