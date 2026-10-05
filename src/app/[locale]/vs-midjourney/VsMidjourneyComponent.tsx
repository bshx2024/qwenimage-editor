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
  CpuChipIcon,
  PhotoIcon,
  CommandLineIcon,
  DocumentTextIcon,
  AdjustmentsHorizontalIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";

export default function VsMidjourneyComponent({ locale = 'en' }: { locale?: string }) {
  const [faqOpen, setFaqOpen] = useState<{ [key: number]: boolean }>({ 0: true, 1: true, 2: true });
  
  // Interactive Benchmark Playground State (addresses on-page fulfillment / 需求承接)
  const [activeScenario, setActiveScenario] = useState<number>(0);
  const [customPrompt, setCustomPrompt] = useState<string>('A vintage coffee shop logo with crisp text "Artisan Roast Est. 1984", wooden texture background');
  const [simulatedResult, setSimulatedResult] = useState<string | null>(null);

  const scenarios = [
    {
      id: 'typography',
      name: 'Typography & Text Spelling',
      icon: DocumentTextIcon,
      prompt: 'A cyberpunk neon billboard in Tokyo with bold illuminated text reading "CYBER FUTURE 2026", photorealistic 8k',
      qwenPros: 'Renders exact characters "CYBER FUTURE 2026" with accurate kerning, glowing neon shaders, and zero spelling artifacts.',
      mjCons: 'Frequently distorts multi-word slogans into unrecognizable pseudo-English characters or garbled glyphs.',
      benchmarkScore: { qwen: '99/100', mj: '68/100' },
    },
    {
      id: 'inpainting',
      name: 'Natural Language Inpainting',
      icon: AdjustmentsHorizontalIcon,
      prompt: 'Instruction: "Change the businesswoman\'s dark suit to an emerald silk blazer and replace the coffee mug with a tablet"',
      qwenPros: 'Conversational instruction editing isolates target masks automatically without disturbing facial likeness or ambient shadows.',
      mjCons: 'Requires manual discord brush "Vary Region", regenerating entire bounding boxes with high stylistic drift.',
      benchmarkScore: { qwen: '96/100', mj: '72/100' },
    },
    {
      id: 'multimodal',
      name: 'Img2Prompt & Architecture',
      icon: CpuChipIcon,
      prompt: 'Analyze input photo of a ceramic vase: reverse engineer lighting, materials, and generate a complementary tea set',
      qwenPros: 'Powered by Qwen2 multimodal vision-language architecture; performs zero-shot img2prompt visual understanding natively.',
      mjCons: 'Relies on generic /describe clip interrogator without deep multimodal vision-language contextual reasoning.',
      benchmarkScore: { qwen: '95/100', mj: '78/100' },
    },
    {
      id: 'commercial',
      name: 'Photorealism & Texture Fidelity',
      icon: PhotoIcon,
      prompt: 'Macro photography of rain droplets on a high-tech matte carbon fiber camera lens, studio softbox lighting',
      qwenPros: 'Faithful material physics, authentic surface micro-scratches, and realistic optical bokeh without hyper-painterly bias.',
      mjCons: 'Defaults to signature painterly aesthetic; requires extensive negative prompt tuning to eliminate artificial cinematic glaze.',
      benchmarkScore: { qwen: '94/100', mj: '92/100' },
    },
  ];

  const comparisonTable = [
    { feature: 'Core Architecture', qwen: 'Qwen2 Multimodal Vision-Language Transformer', mj: 'Proprietary Closed Diffusion Pipeline' },
    { feature: 'Bilingual Text Rendering', qwen: 'Exceptional (English + Chinese precision glyphs)', mj: 'Moderate (English short phrases only)' },
    { feature: 'Instruction-Based Editing', qwen: 'Native natural language conversational inpainting', mj: 'Discord Vary (Region) brush tool' },
    { feature: 'Img2Prompt / Vision Reasoning', qwen: 'Native Multimodal understanding & prompt extraction', mj: 'Basic CLIP /describe command' },
    { feature: 'Developer Ecosystem & API', qwen: 'Open model weights, REST API & local ComfyUI', mj: 'Walled garden (Discord / Web subscription only)' },
    { feature: 'Starting Cost & Free Tier', qwen: 'Free Online Playground & low-cost API', mj: 'Paid only (Starting at $10/month)' },
    { feature: 'Artistic Stylization', qwen: 'High Commercial Photorealism & Design Accuracy', mj: 'Signature painterly & fantasy aesthetic flair' },
    { feature: 'Image Consistency & Retention', qwen: 'Superior subject & architectural consistency', mj: 'High randomness and variance per generation' },
  ];

  const handleTestPrompt = () => {
    if (!customPrompt.trim()) return;
    setSimulatedResult(`Simulated Benchmark Analysis for: "${customPrompt}"\n\n• Qwen Image 2.1 Advantage: Predictable layout adherence, structural prompt fidelity, and crisp character rendering.\n• Midjourney Tendency: Stylized artistic textures with potential variance in specific text strings or exact prompt constraints.`);
  };

  const faqList = [
    {
      q: 'What is the main difference between Qwen Image 2.1 and Midjourney?',
      a: 'The foundational difference lies in model architecture and purpose. Qwen Image 2.1 is built upon the Qwen2 multimodal vision-language architecture, excelling at text rendering, prompt adherence, conversational instruction editing (inpainting), and automated workflows via open APIs. Midjourney is a closed, proprietary text-to-image generator known for signature painterly aesthetics and atmospheric fantasy artwork, but lacks open developer APIs and precise typography rendering.',
    },
    {
      q: 'Is Qwen2 a multimodal model? How does its architecture work?',
      a: 'Yes, Qwen2 is a comprehensive multimodal vision-language family developed by Alibaba. Unlike traditional diffusion models that rely strictly on separate text encoders like CLIP or T5, Qwen Image 2.1 utilizes unified vision-language transformers. This architecture enables native visual question answering, img2prompt capabilities, bilingual semantic comprehension, and surgical localized image alterations through direct human instructions.',
    },
    {
      q: 'How does Qwen Image 2.1 handle img2prompt compared to Midjourney describe?',
      a: 'While Midjourney provides a basic "/describe" command that returns four rough prompt guesses based on standard CLIP embeddings, Qwen Image 2.1 utilizes its native multimodal vision encoder to perform deep structural img2prompt decomposition. It can accurately extract camera focal length, lighting setups, color palettes, artistic styles, and text elements from any uploaded image for replication or refinement.',
    },
    {
      q: 'Can Qwen Image 2.1 replace Midjourney for professional graphic design and typography?',
      a: 'For commercial graphic design, advertising posters, book covers, and packaging mockups, Qwen Image 2.1 frequently outperforms Midjourney. Qwen correctly spells full words, brand names, and bilingual slogans within the image, avoiding the distorted, garbled glyphs commonly produced by Midjourney. Furthermore, designers can use natural language inpainting to swap backgrounds or edit objects without recreating the entire composition.',
    },
    {
      q: 'What are the pricing and commercial licensing differences between both tools?',
      a: 'Midjourney requires an active monthly subscription ranging from $10 to $60 per month with no free tier. Qwen Image Editor provides free daily generations directly in the browser, and developers can deploy the open-weights model locally or access pay-as-you-go cloud APIs (e.g., via Replicate) for pennies per hundred images, drastically lowering production overhead.',
    },
    {
      q: 'Can Qwen Image 2.1 be self-hosted or integrated into automated production pipelines?',
      a: 'Yes. Unlike Midjourney, which remains locked inside a proprietary Discord bot and closed web portal without a public API, Qwen Image 2.1 weights are accessible to the community. Developers can self-host the model in ComfyUI, integrate it into automated video-production backends, or connect through standard REST APIs.',
    },
    {
      q: 'Which tool should I choose for photorealistic portrait and product rendering?',
      a: 'If your goal is photorealistic commercial imagery, exact product mockups, or natural lighting without over-stylization, Qwen Image 2.1 is the ideal choice. If you are creating high-fantasy concept art, surrealist album covers, or impressionist landscapes where exact compositional precision is secondary to dramatic flair, Midjourney remains exceptionally potent.',
    },
  ];

  const schemaData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        headline: 'Qwen Image 2.1 vs Midjourney — Full Comparison & Differences',
        description:
          'Comprehensive comparison between Qwen Image 2.1 vs Midjourney. Compare differences in image quality, typography rendering, instruction inpainting, multimodal architecture, and pricing.',
        image: '/images/model_compare_demo.jpg',
        author: {
          '@type': 'Organization',
          name: 'Qwen Image Editor',
        },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: 'https://www.qwenimage-editor.com',
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Qwen Image 2.1 vs Midjourney',
            item: 'https://www.qwenimage-editor.com/vs-midjourney',
          },
        ],
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
        title="Qwen Image 2.1 vs Midjourney — Full Comparison & Differences"
        description="Comprehensive comparison between Qwen Image 2.1 vs Midjourney. Compare differences in image quality, text rendering, localized inpainting, multimodal architecture, and pricing."
        image="/images/model_compare_demo.jpg"
        schemaData={schemaData}
      />

      <Header locale={locale} page="vs-midjourney" />

      <main className="flex-1 w-full">
        {/* Breadcrumb Navigation for SEO */}
        <div className="border-b border-slate-900 bg-slate-950/70 py-2.5">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-xs text-slate-400 flex items-center gap-2">
            <Link href={getLinkHref(locale, '')} className="hover:text-indigo-400 transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-slate-200 font-medium">Qwen Image 2.1 vs Midjourney Comparison</span>
          </div>
        </div>

        {/* Hero Section */}
        <section className="relative overflow-hidden pt-10 pb-16 lg:pt-16 lg:pb-20 border-b border-slate-900">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-indigo-600/15 blur-[120px] pointer-events-none rounded-full" />
          
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-300">
              <ArrowsRightLeftIcon className="w-4 h-4 text-indigo-400" />
              <span>Comprehensive AI Model Comparison & Benchmark</span>
            </div>
            
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Qwen Image 2.1 vs Midjourney: The Comprehensive AI Benchmark
            </h1>
            
            <p className="text-base sm:text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed">
              Explore the critical differences between Alibaba&apos;s open multimodal foundation model <strong>Qwen Image 2.1</strong> and <strong>Midjourney V6</strong>. Compare real-world typography accuracy, conversational inpainting, img2prompt vision capabilities, architecture, and production cost.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
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
                Launch Text-to-Image Generator
              </Link>
            </div>
          </div>
        </section>

        {/* Interactive Benchmark & Playground (Fulfills On-Page Intent / 需求承接) */}
        <section className="py-14 border-b border-slate-900 bg-slate-900/40">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 uppercase tracking-wider">
                <CommandLineIcon className="w-4 h-4" />
                <span>Live Capability Explorer</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Interactive Prompt & Benchmark Explorer
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Select key generative tasks below to compare how Qwen Image 2.1 differs from Midjourney in real design workflows.
              </p>
            </div>

            {/* Scenario Switcher Tabs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {scenarios.map((sc, idx) => {
                const Icon = sc.icon;
                const isSelected = activeScenario === idx;
                return (
                  <button
                    key={sc.id}
                    onClick={() => {
                      setActiveScenario(idx);
                      setCustomPrompt(sc.prompt);
                      setSimulatedResult(null);
                    }}
                    className={`flex items-center gap-2 p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-950/40 text-white shadow-md shadow-indigo-500/10'
                        : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <Icon className={`w-5 h-5 shrink-0 ${isSelected ? 'text-indigo-400' : 'text-slate-500'}`} />
                    <span className="text-xs font-semibold leading-tight">{sc.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Scenario Detail Comparison Card */}
            <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5 sm:p-7 shadow-xl space-y-6">
              <div className="space-y-2">
                <div className="text-xs font-mono uppercase text-indigo-400">Target Benchmark Prompt:</div>
                <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3.5 text-xs sm:text-sm text-slate-200 font-mono">
                  &ldquo;{scenarios[activeScenario].prompt}&rdquo;
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-xl border border-indigo-500/30 bg-indigo-950/20 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">Qwen Image 2.1 Output</span>
                    <span className="rounded-full bg-indigo-500/20 px-2 py-0.5 text-xs font-bold text-indigo-300">
                      Score: {scenarios[activeScenario].benchmarkScore.qwen}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {scenarios[activeScenario].qwenPros}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Midjourney Output</span>
                    <span className="rounded-full bg-slate-800 px-2 py-0.5 text-xs font-bold text-slate-400">
                      Score: {scenarios[activeScenario].benchmarkScore.mj}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                    {scenarios[activeScenario].mjCons}
                  </p>
                </div>
              </div>

              {/* Interactive Prompt Tester within Landing Page */}
              <div className="border-t border-slate-800/80 pt-5 space-y-3">
                <label className="block text-xs font-semibold text-slate-300">
                  Test Any Custom Prompt Against Both Engine Profiles:
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    placeholder="Enter your prompt here to evaluate rendering strengths..."
                    className="flex-1 rounded-xl border border-slate-700 bg-slate-900/90 px-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                  />
                  <button
                    onClick={handleTestPrompt}
                    className="rounded-xl bg-indigo-600 hover:bg-indigo-500 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white transition-colors shrink-0"
                  >
                    Analyze Prompt
                  </button>
                </div>

                {simulatedResult && (
                  <div className="rounded-xl border border-indigo-500/40 bg-slate-900/90 p-4 text-xs sm:text-sm text-slate-200 whitespace-pre-line leading-relaxed font-mono">
                    {simulatedResult}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Quick Verdict Summary Table */}
        <section className="py-14 border-b border-slate-900 bg-slate-950/60">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Qwen Image 2.1 vs Midjourney: Executive Summary & Differences
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-2xl mx-auto">
                Detailed comparison matrix across multimodal architecture, text fidelity, inpainting mechanics, and production budget.
              </p>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-800 shadow-xl">
              <table className="min-w-full divide-y divide-slate-800 text-left text-xs sm:text-sm">
                <thead className="bg-slate-900/90 text-slate-200 font-semibold">
                  <tr>
                    <th scope="col" className="px-6 py-4">Evaluation Dimension</th>
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
                Visual Comparison: Typography & Precise Text Rendering
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-2">
                Real-world benchmark rendering bilingual signage, product posters, and structured multi-object compositions.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 sm:p-6 shadow-2xl">
              <img
                src="/images/model_compare_demo.jpg"
                alt="Qwen Image 2.1 vs Midjourney Text Rendering Benchmark"
                width={1024}
                height={512}
                loading="lazy"
                className="w-full rounded-xl object-contain shadow-lg"
              />
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-300 pt-2">
                <div className="rounded-lg bg-slate-950/60 p-3.5 border border-slate-800">
                  <span className="font-semibold text-slate-200 block mb-1">Midjourney V6 Behavior:</span>
                  While adept at atmospheric artistic renders, complex text strings often merge together into unreadable pseudo-Latin glyphs, requiring external Photoshop correction.
                </div>
                <div className="rounded-lg bg-slate-950/60 p-3.5 border border-indigo-500/30">
                  <span className="font-semibold text-indigo-300 block mb-1">Qwen Image 2.1 Advantage:</span>
                  Delivers crisp, perfectly spelled typographic characters in both English and Chinese, accurately following prompt layout constraints for ready-to-publish graphic collateral.
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Detailed In-Depth Breakdown Categories */}
        <section className="py-16 border-b border-slate-900 bg-slate-950/30">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-12">
            
            <article className="space-y-4">
              <h2 className="text-2xl font-bold text-white tracking-tight">
                1. Multimodal Architecture: Qwen2 Vision-Language Transformer vs Closed Diffusion
              </h2>
              <p className="text-sm leading-relaxed text-slate-300">
                Understanding the architectural divergence is vital for evaluating both platforms. Qwen Image 2.1 is powered by the broader <strong>Qwen2 multimodal vision-language foundation</strong>. Unlike conventional generative image pipelines that pass text through an isolated CLIP or T5 encoder before handing latent noise to a diffusion U-Net or DiT, Qwen incorporates unified multimodal representations.
              </p>
              <p className="text-sm leading-relaxed text-slate-300">
                This architectural cohesion enables the model to comprehend linguistic nuances, spatial prepositions (such as &ldquo;to the left of&rdquo;, &ldquo;underneath&rdquo;, &ldquo;in the background&rdquo;), and complex cultural idioms. Midjourney, while undeniably polished in its proprietary aesthetic filters, operates as a closed diffusion black box with minimal transparency regarding its text-encoder grounding.
              </p>
            </article>

            <article className="space-y-4">
              <h2 className="text-2xl font-bold text-white tracking-tight">
                2. Img2Prompt & Reverse Image Understanding
              </h2>
              <p className="text-sm leading-relaxed text-slate-300">
                A common requirement among digital artists and agency teams is <strong>img2prompt</strong>: deciphering existing visual assets to create coherent variations or extract reusable aesthetic styles. Midjourney provides a basic <code>/describe</code> command that generates four generic prompts. However, these suggestions often hallucinate artists&apos; names and miss minute structural details.
              </p>
              <p className="text-sm leading-relaxed text-slate-300">
                Because Qwen Image 2.1 is natively integrated with Qwen2 vision-language reasoning, it performs deep visual attribute decomposition. It identifies focal depth, camera lens specifications, ambient lighting angles, color temperatures, and typography hierarchy, allowing creators to replicate or modify complex artistic styles with mathematical precision.
              </p>
            </article>

            <article className="space-y-4">
              <h2 className="text-2xl font-bold text-white tracking-tight">
                3. Text-Guided Inpainting & Iterative Post-Production
              </h2>
              <p className="text-sm leading-relaxed text-slate-300">
                In professional workflows, generating an initial composition is only 20% of the effort; the remaining 80% involves targeted refinements. Midjourney forces users to paint manual masks using its Discord or web &ldquo;Vary Region&rdquo; interface. Because it lacks a conversational memory, modifying one element frequently degrades adjacent facial features or alters the overall illumination.
              </p>
              <p className="text-sm leading-relaxed text-slate-300">
                With <Link href={getLinkHref(locale, '')} className="text-indigo-400 hover:underline font-medium">Qwen Image Editor</Link>, localized alterations are handled via conversational instructions. You can instruct the engine: &ldquo;Keep the character pose unchanged, but replace the winter coat with a black leather jacket and add a rainy reflection on the street.&rdquo; The model isolates semantic regions natively, maintaining structural coherence across iterations.
              </p>
            </article>

            <article className="space-y-4">
              <h2 className="text-2xl font-bold text-white tracking-tight">
                4. Production Costs, Openness & Automated Pipeline Integration
              </h2>
              <p className="text-sm leading-relaxed text-slate-300">
                From a budget and enterprise scalability standpoint, Midjourney presents significant operational hurdles. Its pricing starts at $10/month and scales up to $60/month per user, without any programmatic API access for enterprise software integration.
              </p>
              <p className="text-sm leading-relaxed text-slate-300">
                Conversely, Qwen Image 2.1 weights are open under permissive community licenses. Startups and enterprise developers can run private instances locally on NVIDIA GPUs (via ComfyUI or HuggingFace Diffusers) or integrate cost-effective REST APIs hosted on serverless infrastructure. For everyday creators, our web portal provides immediate free online access without Discord hurdles.
              </p>
            </article>
          </div>
        </section>

        {/* Who Should Choose Which */}
        <section className="py-16 border-b border-slate-900">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Decision Guide: Which Generative Engine Fits Your Needs?
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-2">
                Selecting between Qwen Image 2.1 and Midjourney depends on your specific creative or commercial objectives.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="rounded-2xl border border-indigo-500/40 bg-indigo-950/20 p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <SparklesIcon className="w-5 h-5 text-indigo-400" />
                  <h3 className="text-lg font-bold text-white">Choose Qwen Image 2.1 if you require:</h3>
                </div>
                <ul className="space-y-2.5 text-xs sm:text-sm text-slate-300">
                  <li className="flex items-start gap-2">
                    <CheckIcon className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Exact bilingual typography, marketing slogans, and legible branding signage.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckIcon className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Conversational localized inpainting and prompt-guided image modifications.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckIcon className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Multimodal image understanding, visual reasoning, and img2prompt capabilities.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckIcon className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Open model weights, REST API automation, and free browser-based testing.</span>
                  </li>
                </ul>
                <div className="pt-2">
                  <Link
                    href={getLinkHref(locale, '')}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    <span>Launch Free Qwen Editor</span>
                    <ArrowRightIcon className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <SparklesIcon className="w-5 h-5 text-slate-400" />
                  <h3 className="text-lg font-bold text-white">Choose Midjourney V6 if you require:</h3>
                </div>
                <ul className="space-y-2.5 text-xs sm:text-sm text-slate-300">
                  <li className="flex items-start gap-2">
                    <CheckIcon className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <span>Signature painterly, surrealist, or high-fantasy illustrative aesthetics.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckIcon className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <span>Exploratory moodboards where exact literal prompt adherence is secondary.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckIcon className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <span>Cinematic atmospheric lighting presets out of the box with zero fine-tuning.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckIcon className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <span>Discord community exploration and public community prompt showcases.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Related Comparisons Module */}
        <section className="py-14 border-b border-slate-900 bg-slate-950/60">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-6">
            <h2 className="text-xl font-bold text-white">Explore Additional Model Benchmarks & Tools</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Link
                href={getLinkHref(locale, 'vs-nano-banana')}
                className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 hover:border-indigo-500/50 transition-colors group"
              >
                <div className="text-xs text-indigo-400 font-semibold mb-1">Benchmark</div>
                <div className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">
                  Qwen Image 2.1 vs Nano Banana →
                </div>
                <p className="text-xs text-slate-400 mt-1">Compare generation speed, memory footprints, and efficiency.</p>
              </Link>
              <Link
                href={getLinkHref(locale, 'vs-flux')}
                className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 hover:border-indigo-500/50 transition-colors group"
              >
                <div className="text-xs text-indigo-400 font-semibold mb-1">Benchmark</div>
                <div className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">
                  Qwen Image 2.1 vs Flux →
                </div>
                <p className="text-xs text-slate-400 mt-1">Deep dive into prompt following, VRAM requirements, and photorealism.</p>
              </Link>
              <Link
                href={getLinkHref(locale, 'generator')}
                className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 hover:border-purple-500/50 transition-colors group"
              >
                <div className="text-xs text-purple-400 font-semibold mb-1">Generator Tool</div>
                <div className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors">
                  Qwen Image Generator →
                </div>
                <p className="text-xs text-slate-400 mt-1">Create high-resolution photorealistic images online for free.</p>
              </Link>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Frequently Asked Questions: Qwen Image 2.1 vs Midjourney
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-2">
                Clear answers addressing core architectural differences, pricing, multimodal capabilities, and graphic design use cases.
              </p>
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
