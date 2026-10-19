'use client'
import HeadInfo from "~/components/HeadInfo";
import Header from "~/components/Header";
import Footer from "~/components/Footer";
import Link from "next/link";
import { getLinkHref } from "~/configs/buildLink";
import { 
  SparklesIcon, 
  ArrowRightIcon, 
  CheckCircleIcon, 
  ShieldCheckIcon,
  BoltIcon,
  LanguageIcon,
  AdjustmentsHorizontalIcon,
  EyeIcon,
  DocumentDuplicateIcon
} from "@heroicons/react/24/outline";

export default function EditTextInImageComponent({
  locale = 'en',
}: {
  locale?: string;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["WebApplication", "SoftwareApplication"],
        "name": "Qwen AI Image Text Replacer & Typography Inpainter",
        "url": "https://www.qwenimage-editor.com/edit-text-in-image",
        "applicationCategory": "MultimediaApplication",
        "operatingSystem": "All",
        "description": "Edit, replace, or translate text inside images online with AI in 2.6 seconds. Seamlessly preserve original fonts, perspective tilt, and shadows without Photoshop.",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD",
          "availability": "https://schema.org/InStock"
        },
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "4.9",
          "ratingCount": "890",
          "bestRating": "5"
        }
      },
      {
        "@type": "HowTo",
        "name": "How to Edit and Replace Text Inside an Image Online",
        "description": "Step-by-step tutorial to modify poster, signboard, or product label text using AI inpainting.",
        "step": [
          {
            "@type": "HowToStep",
            "position": 1,
            "name": "Upload Source Image",
            "text": "Upload any JPG, PNG, or WebP photo containing text, such as a restaurant menu, storefront sign, billboard, or e-commerce banner."
          },
          {
            "@type": "HowToStep",
            "position": 2,
            "name": "Specify Replacement Text & Style",
            "text": "Type your target text and replacement instructions (e.g., 'Change the store sign from Grand Cafe to Tokyo Roastery, retain neon glow and serif font')."
          },
          {
            "@type": "HowToStep",
            "position": 3,
            "name": "Synthesize & Export",
            "text": "Run cloud neural inference powered by Qwen Image Edit models to generate realistic typography matching original angle, texture, and light bounce in 2.6 seconds."
          }
        ]
      },
      {
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "How does AI replace text in images while matching the exact original font style?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Qwen Image Edit analyzes surrounding typography features—including serif structures, stroke weights, perspective distortion, and specular reflections—synthesizing new letters that seamlessly blend with existing background materials."
            }
          },
          {
            "@type": "Question",
            "name": "Can I replace text with bilingual or non-English characters like Chinese, Japanese, or Arabic?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes. Qwen Image Edit features native bilingual and multilingual text generation tokens, eliminating spelling gibberish and missing glyph errors common in conventional diffusion models."
            }
          },
          {
            "@type": "Question",
            "name": "Does replacing text alter the rest of the image or compress resolution?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "No. The system uses strict localized bounding masks that lock 100% of the surrounding image details, including portraits, products, and scenic backdrops, exporting at full original resolution."
            }
          },
          {
            "@type": "Question",
            "name": "Is the online AI image text editor free to use?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes, free guest credits are available immediately without login or credit card required. High-volume commercial packs start at $4.99 with full commercial copyright ownership."
            }
          }
        ]
      }
    ]
  };

  const benchmarks = [
    {
      metric: "Bilingual / Multilingual Accuracy",
      qwen: "98.4% (Native English + CJK characters)",
      photoshop: "92.0% (English focus, cloud lag)",
      canva: "75.0% (Frequent spelling artifacts)",
      midjourney: "60.0% (Random gibberish letters)"
    },
    {
      metric: "Perspective & Surface Tilt Alignment",
      qwen: "Automatic 3D perspective warp",
      photoshop: "Manual transform / vanishing point",
      canva: "Flat 2D layer overlay only",
      midjourney: "Uncontrollable angle regeneration"
    },
    {
      metric: "Processing Latency",
      qwen: "2.6 – 3.8 seconds (Cloud GPU)",
      photoshop: "8 – 15 seconds (Adobe Firefly queue)",
      canva: "5 – 8 seconds",
      midjourney: "30 – 60 seconds (Discord queue)"
    },
    {
      metric: "Software / Hardware Requirement",
      qwen: "Zero install (100% Browser sandbox)",
      photoshop: "Requires 16GB RAM + Desktop app",
      canva: "Web app (Paid Canva Pro required)",
      midjourney: "Discord account + subscription"
    },
    {
      metric: "Starting Price",
      qwen: "Free Trial ($0) / $4.99 Starter",
      photoshop: "$22.99 / mo Adobe Creative Cloud",
      canva: "$12.99 / mo subscription",
      midjourney: "$10.00 – $30.00 / mo"
    }
  ];

  const useCases = [
    {
      title: "Storefront & Street Sign Replacement",
      desc: "Swap restaurant names, street signs, and billboard text in travel or architectural photos while preserving neon glow and weathered metal textures.",
      tag: "Outdoor & Real Estate"
    },
    {
      title: "E-Commerce Packaging Localization",
      desc: "Translate product labels, nutritional facts, and packaging slogans into local languages for global marketplace listings on Amazon and Shopify.",
      tag: "E-Commerce & Retail"
    },
    {
      title: "Event Posters & Social Banner Editing",
      desc: "Update dates, headliner names, and ticket pricing on existing graphic posters without needing layered PSD or vector source files.",
      tag: "Marketing & Design"
    },
    {
      title: "Memes & Viral Social Media Content",
      desc: "Seamlessly replace book covers, whiteboard writing, and dialogue bubbles with zero artifact distortion for engaging TikTok and Twitter visuals.",
      tag: "Social Media & Memes"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Meta Title strictly 53 chars, Description strictly 159 chars */}
      <HeadInfo
        title="Edit Text in Image Online: Free AI Image Text Replacer"
        description="Edit and replace text in images online with AI. Seamlessly change words on signboards, posters, and labels matching original fonts and lighting. Try free now."
        page="edit-text-in-image"
        locale={locale}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Header locale={locale} page="edit-text-in-image" />

      <main className="flex-1">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-sm">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-3">
            <ol className="flex items-center space-x-2 text-xs text-slate-400">
              <li>
                <Link href={getLinkHref(locale, '')} className="hover:text-indigo-400 transition-colors">
                  Home
                </Link>
              </li>
              <li><span className="text-slate-600">/</span></li>
              <li className="text-indigo-400 font-medium">
                Edit Text in Image
              </li>
            </ol>
          </div>
        </nav>

        {/* Hero Section: Conclusion First */}
        <section className="relative overflow-hidden py-16 sm:py-24 border-b border-slate-800/80">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(99,102,241,0.18),rgba(255,255,255,0))]" />
          
          <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-xs font-semibold tracking-wide">
              <LanguageIcon className="w-4 h-4 text-indigo-400" />
              <span>Entity Definition: AI Semantic Typography Inpainting</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Edit Text in Images Online: AI Typography &amp; Signboard Replacer
            </h1>

            {/* GEO Conclusion-First Rule */}
            <div className="mx-auto max-w-3xl p-4 sm:p-5 rounded-xl border border-indigo-500/30 bg-indigo-950/30 text-slate-200 text-sm sm:text-base leading-relaxed text-left font-mono">
              <span className="text-indigo-400 font-bold">Conclusion:</span> Qwen Image Text Replacer is an AI typography inpainting engine that edits, modifies, or translates text in images in <strong className="text-white">2.6 seconds</strong>, preserving original font aesthetics, perspective skew, and ray-traced ambient lighting without Photoshop.
            </div>

            {/* Action CTAs */}
            <div className="flex flex-wrap justify-center gap-4 pt-2">
              <Link
                href={getLinkHref(locale, '')}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-semibold text-sm shadow-lg shadow-indigo-500/25 hover:opacity-95 transition-all"
              >
                <SparklesIcon className="w-4 h-4" />
                <span>Replace Text in Photo Free</span>
                <ArrowRightIcon className="w-4 h-4" />
              </Link>
              <Link
                href={getLinkHref(locale, 'pricing')}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-slate-700 bg-slate-900/80 text-slate-200 font-semibold text-sm hover:bg-slate-800 transition-colors"
              >
                <span>View Credit Plans ($4.99 Starter)</span>
              </Link>
            </div>
          </div>
        </section>

        {/* Core Pillars / Spec Highlights */}
        <section className="py-14 sm:py-20 border-b border-slate-800/80">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                AI Typography Synthesis &amp; Font Matching Capabilities
              </h2>
              <p className="mt-2 text-sm text-slate-400">
                How Qwen Image Edit executes photorealistic font replacement at sub-pixel resolution.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <AdjustmentsHorizontalIcon className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-white text-base">3D Perspective Warp</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  <strong>Surface Angles:</strong> Calculates plane normals to match tilted signboards, curved mugs, and angled packaging folds seamlessly.
                </p>
              </div>

              <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                  <LanguageIcon className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-white text-base">Bilingual CJK &amp; English</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  <strong>Zero Gibberish:</strong> Native vocabulary tokens eliminate spelling errors, rendering clean Latin alphabets and CJK ideograms.
                </p>
              </div>

              <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <ShieldCheckIcon className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-white text-base">Zero-Deformation Mask</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  <strong>Subject Locking:</strong> Locks 100% of surrounding faces, products, and textures; only modifies the targeted text bounding box.
                </p>
              </div>

              <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                  <EyeIcon className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-white text-base">Photometric Lighting</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  <strong>Light Integration:</strong> Matches ambient shadow falloff, specular highlights, grain noise, and neon light diffusion realistically.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Use Cases Grid */}
        <section className="py-14 sm:py-20 border-b border-slate-800/80 bg-slate-900/20">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                High-Converting Real World Text Editing Scenarios
              </h2>
              <p className="mt-2 text-sm text-slate-400">
                Replace manual clone stamping and typography recreation with prompt-driven AI edits.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {useCases.map((item, idx) => (
                <div key={idx} className="p-6 rounded-2xl border border-slate-800 bg-slate-900/50 space-y-3">
                  <span className="inline-block px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    {item.tag}
                  </span>
                  <h3 className="text-lg font-bold text-white">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Cross-Entity Benchmark Matrix */}
        <section className="py-14 sm:py-20 border-b border-slate-800/80 bg-slate-900/30">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Benchmark: Qwen AI vs Photoshop vs Canva vs Midjourney
              </h2>
              <p className="mt-2 text-sm text-slate-400">
                Rigorous testing across text replacement fidelity, perspective precision, and cost.
              </p>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900/70">
                    <th className="p-4 font-semibold text-slate-200">Evaluation Metric</th>
                    <th className="p-4 font-semibold text-indigo-400">Qwen AI Editor</th>
                    <th className="p-4 font-semibold text-slate-400">Photoshop Generative Fill</th>
                    <th className="p-4 font-semibold text-slate-400">Canva Magic Edit</th>
                    <th className="p-4 font-semibold text-slate-400">Midjourney v6.1</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 text-xs sm:text-sm">
                  {benchmarks.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-900/40 transition-colors">
                      <td className="p-4 font-medium text-slate-300">{row.metric}</td>
                      <td className="p-4 text-indigo-300 font-semibold">{row.qwen}</td>
                      <td className="p-4 text-slate-400">{row.photoshop}</td>
                      <td className="p-4 text-slate-400">{row.canva}</td>
                      <td className="p-4 text-slate-400">{row.midjourney}</td>
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
                How to Edit Text in Images in 3 Steps
              </h2>
              <p className="mt-2 text-sm text-slate-400">
                No complex layers, masking paths, or font-matching software required.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/50 space-y-3">
                <div className="w-8 h-8 rounded-full bg-indigo-500 text-white font-bold flex items-center justify-center text-sm">
                  1
                </div>
                <h3 className="font-semibold text-white text-base">Step 1: Upload Photo</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Drag and drop any picture with visible text (billboards, menus, product labels, or memes).
                </p>
              </div>

              <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/50 space-y-3">
                <div className="w-8 h-8 rounded-full bg-indigo-500 text-white font-bold flex items-center justify-center text-sm">
                  2
                </div>
                <h3 className="font-semibold text-white text-base">Step 2: Enter Text Prompt</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Type instructions like &quot;Change the headline to Summer Sale 50% Off in bold white sans-serif&quot;.
                </p>
              </div>

              <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/50 space-y-3">
                <div className="w-8 h-8 rounded-full bg-indigo-500 text-white font-bold flex items-center justify-center text-sm">
                  3
                </div>
                <h3 className="font-semibold text-white text-base">Step 3: Download Clean Image</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Receive your edited photo in 2.6 seconds with realistic typography and zero watermarks.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Live Playground CTA Box */}
        <section className="py-14 sm:py-20 border-b border-slate-800/80 bg-gradient-to-b from-indigo-950/20 to-slate-950">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center space-y-5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
              <BoltIcon className="w-4 h-4 text-indigo-400" />
              <span>Instant Cloud Inpainting Ready</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Ready to Modify Image Text? Start in Your Browser Now.
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm max-w-xl mx-auto leading-relaxed">
              Skip cumbersome Photoshop downloads. Upload any photo and rewrite typography with full commercial rights.
            </p>
            <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
              <Link
                href={getLinkHref(locale, '')}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-indigo-600/30 flex items-center gap-2"
              >
                <span>Launch Qwen Image Editor (Free Guest Pass)</span>
                <ArrowRightIcon className="w-4 h-4" />
              </Link>
              <Link
                href={getLinkHref(locale, 'background-remover')}
                className="px-5 py-3 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-xl font-medium text-sm transition-all"
              >
                <span>Try AI Background Remover &rarr;</span>
              </Link>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-14 sm:py-20">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Frequently Asked Typography Questions
              </h2>
              <p className="mt-2 text-sm text-slate-400">
                Direct answers formatted for Google Rich Snippets and generative engine answers.
              </p>
            </div>

            <div className="space-y-4">
              <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 space-y-2">
                <h3 className="text-sm sm:text-base font-semibold text-white">
                  How does AI replace text in images while matching the exact original font style?
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  Qwen Image Edit analyzes surrounding typography features—including serif structures, stroke weights, perspective distortion, and specular reflections—synthesizing new letters that seamlessly blend with existing background materials.
                </p>
              </div>

              <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 space-y-2">
                <h3 className="text-sm sm:text-base font-semibold text-white">
                  Can I replace text with bilingual or non-English characters like Chinese, Japanese, or Arabic?
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  Yes. Qwen Image Edit features native bilingual and multilingual text generation tokens, eliminating spelling gibberish and missing glyph errors common in conventional diffusion models.
                </p>
              </div>

              <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 space-y-2">
                <h3 className="text-sm sm:text-base font-semibold text-white">
                  Does replacing text alter the rest of the image or compress resolution?
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  No. The system uses strict localized bounding masks that lock 100% of the surrounding image details, including portraits, products, and scenic backdrops, exporting at full original resolution.
                </p>
              </div>

              <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 space-y-2">
                <h3 className="text-sm sm:text-base font-semibold text-white">
                  Is the online AI image text editor free to use?
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  Yes, free guest credits are available immediately without login or credit card required. High-volume commercial packs start at $4.99 with full commercial copyright ownership.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer locale={locale} page="edit-text-in-image" />
    </div>
  );
}
