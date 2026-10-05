'use client'
import HeadInfo from "~/components/HeadInfo";
import Header from "~/components/Header";
import Footer from "~/components/Footer";
import Link from "next/link";
import { getLinkHref } from "~/configs/buildLink";
import { BlogPost } from "~/content/blogData";
import { 
  CalendarIcon, 
  ClockIcon, 
  SparklesIcon, 
  ArrowLeftIcon,
  TagIcon,
  ShareIcon
} from "@heroicons/react/24/outline";

export default function BlogPostComponent({
  post,
  locale = 'en',
}: {
  post: BlogPost;
  locale?: string;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "TechArticle",
        "@id": `https://www.qwenimage-editor.com/blog/${post.slug}#article`,
        "headline": post.title,
        "description": post.description,
        "datePublished": post.date,
        "dateModified": post.date,
        "author": {
          "@type": "Organization",
          "name": "Qwen Image Editor Engineering Team",
          "url": "https://www.qwenimage-editor.com",
        },
        "publisher": {
          "@type": "Organization",
          "name": "Qwen Image Editor",
          "url": "https://www.qwenimage-editor.com",
          "logo": {
            "@type": "ImageObject",
            "url": "https://www.qwenimage-editor.com/appicon.svg"
          }
        },
        "keywords": post.keywords.join(", "),
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": "https://www.qwenimage-editor.com"
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Blog",
            "item": "https://www.qwenimage-editor.com/blog"
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": post.title,
            "item": `https://www.qwenimage-editor.com/blog/${post.slug}`
          }
        ]
      }
    ]
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white">
      <HeadInfo
        title={`${post.title} | Qwen Image Editor Blog`}
        description={post.description}
        page={`blog/${post.slug}`}
        locale={locale}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Header locale={locale} page="blog" />

      <main className="flex-1 w-full">
        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-sm">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-3">
            <ol className="flex items-center space-x-2 text-xs text-slate-400">
              <li>
                <Link href={getLinkHref(locale, '')} className="hover:text-indigo-400 transition-colors">
                  Home
                </Link>
              </li>
              <li><span className="text-slate-600">/</span></li>
              <li>
                <Link href={getLinkHref(locale, 'blog')} className="hover:text-indigo-400 transition-colors">
                  Blog
                </Link>
              </li>
              <li><span className="text-slate-600">/</span></li>
              <li className="text-indigo-400 font-medium truncate max-w-[200px] sm:max-w-none">
                {post.title}
              </li>
            </ol>
          </div>
        </nav>

        {/* Article Header */}
        <header className="py-12 border-b border-slate-900 bg-slate-900/20">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-4">
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
              <span className="px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-semibold">
                {post.category}
              </span>
              <div className="flex items-center gap-1">
                <CalendarIcon className="w-3.5 h-3.5 text-slate-500" />
                <span>{post.date}</span>
              </div>
              <div className="flex items-center gap-1">
                <ClockIcon className="w-3.5 h-3.5 text-slate-500" />
                <span>{post.readTime}</span>
              </div>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              {post.title}
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
              {post.description}
            </p>

            <div className="pt-2 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/60">
              <span>Author: <strong className="text-slate-200">{post.author}</strong></span>
              <div className="flex gap-2">
                {post.keywords.map((kw, i) => (
                  <span key={i} className="text-[11px] text-slate-500 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                    #{kw}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </header>

        {/* Article Markdown-Rendered Body */}
        <article className="py-12">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-8 text-slate-300 text-sm sm:text-base leading-relaxed">
            {/* Direct formatted guide blocks */}
            <div className="p-5 rounded-2xl border border-indigo-500/20 bg-indigo-950/20 text-indigo-200 text-xs sm:text-sm font-mono leading-relaxed">
              <strong>Quick Summary:</strong> Strata is an open-source tiered inference engine that distributes Qwen3.8-Flash-Next 125B weights across GPU VRAM, System RAM, and NVMe SSD, delivering 40–120 Tokens/sec on single consumer graphics cards (RTX 3090/4090).
            </div>

            <div className="space-y-6 [&>h2]:text-xl sm:[&>h2]:text-2xl [&>h2]:font-bold [&>h2]:text-white [&>h2]:pt-4 [&>h3]:text-lg [&>h3]:font-semibold [&>h3]:text-indigo-300 [&>p]:leading-relaxed [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:space-y-1.5">
              <h2 className="text-xl sm:text-2xl font-bold text-white pt-4">
                What is Strata Qwen and Why is It Trending?
              </h2>
              <p>
                The open-source AI community recently experienced a major breakthrough with Alibaba&apos;s release of <strong>Qwen3.8-Flash-Next</strong>—a massive 125B parameter Mixture-of-Experts (MoE) foundation model with ~6B active parameters per token and native 262k–512k context windows. While Qwen3.8 delivers state-of-the-art coding and reasoning capabilities on benchmarks like SWE-bench Pro, running a 125B model traditionally required enterprise dual-A100 or H100 clusters.
              </p>
              <p>
                Enter <strong>Strata</strong>: a high-performance, tiered memory inference engine purpose-engineered by open-source developers specifically for the Qwen3.8-Flash-Next MoE architecture.
              </p>
              <p>
                Instead of crashing with Out-Of-Memory (OOM) errors or slowing down to 1–2 tokens/sec via traditional CPU offloading, Strata orchestrates a three-tier memory pipeline:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
                <li><strong>GPU VRAM (12GB–24GB):</strong> Holds high-frequency active experts and active KV cache.</li>
                <li><strong>System RAM (32GB–64GB+):</strong> Caches background weights and dormant routing pathways.</li>
                <li><strong>NVMe High-Speed Swap:</strong> Handles burst layer prefetching.</li>
              </ul>
              <p>
                With extreme quantization (IQ2_XS and IQ3_S), developers can now achieve <strong>40 to 120 Tokens/sec</strong> on a single consumer RTX 3090, 4090, or 5070 graphics card.
              </p>

              <h2 className="text-xl sm:text-2xl font-bold text-white pt-4">
                Hardware Requirements &amp; Quantization Matrix
              </h2>
              <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/60 my-4">
                <table className="w-full text-left text-xs sm:text-sm text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="p-3">Hardware Tier</th>
                      <th className="p-3">Recommended GPU</th>
                      <th className="p-3">System RAM</th>
                      <th className="p-3">Quantization</th>
                      <th className="p-3">Expected Speed</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-xs">
                    <tr>
                      <td className="p-3 font-semibold text-white">Minimum Budget</td>
                      <td className="p-3">RTX 4070 Ti Super (16GB)</td>
                      <td className="p-3">32GB DDR5</td>
                      <td className="p-3 text-purple-300">IQ2_XS (Extreme)</td>
                      <td className="p-3 text-emerald-400">35 – 55 TPS</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-white">Sweet Spot</td>
                      <td className="p-3">RTX 3090 / 4090 (24GB)</td>
                      <td className="p-3">64GB DDR4/DDR5</td>
                      <td className="p-3 text-indigo-300">IQ3_S (Balanced)</td>
                      <td className="p-3 text-emerald-400">50 – 85 TPS</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-white">Performance Elite</td>
                      <td className="p-3">Dual RTX 3090 (48GB)</td>
                      <td className="p-3">128GB DDR5</td>
                      <td className="p-3 text-cyan-300">Q4_K_M (Lossless)</td>
                      <td className="p-3 text-emerald-400">90 – 120+ TPS</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h2 className="text-xl sm:text-2xl font-bold text-white pt-4">
                Step-by-Step Installation &amp; Troubleshooting
              </h2>
              <p className="text-xs sm:text-sm">
                Follow these commands to deploy Strata on Windows and Linux:
              </p>
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 font-mono text-xs text-indigo-300 space-y-2 overflow-x-auto">
                <p className="text-slate-500"># Windows Setup (Requires CUDA 12.4+ and MSVC 2022)</p>
                <p>git clone https://github.com/strata-engine/strata-qwen.git</p>
                <p>cd strata-qwen</p>
                <p>START-HERE.bat --model Qwen3.8-Flash-Next-IQ3_S.gguf --vram-budget 22G</p>
              </div>

              <h2 className="text-xl sm:text-2xl font-bold text-white pt-4">
                Preventing Long Context OOM Crashes (KV Cache Tuning)
              </h2>
              <p>
                When testing large codebases, the KV Cache can quickly devour 14GB of VRAM. Add <code>--kv-cache-type q4_0</code> to your launch parameters to cut memory consumption by <strong>65%</strong> without affecting reasoning logic.
              </p>

              <h2 className="text-xl sm:text-2xl font-bold text-white pt-4">
                Integrating with Claude Code &amp; Cursor
              </h2>
              <p>
                Strata features native Anthropic protocol emulation. You can bind Claude Code directly:
              </p>
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 font-mono text-xs text-emerald-300 space-y-1">
                <p>export ANTHROPIC_BASE_URL=&quot;http://localhost:8080&quot;</p>
                <p>export ANTHROPIC_API_KEY=&quot;local-strata-free&quot;</p>
                <p>claude</p>
              </div>

              {/* Conversion Callout to Qwen Image Studio */}
              <div className="mt-10 p-6 rounded-3xl border border-indigo-500/40 bg-gradient-to-r from-indigo-950/40 via-purple-950/40 to-slate-900/60 space-y-3">
                <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
                  <SparklesIcon className="w-5 h-5" />
                  <span>Looking for Qwen Visual AI &amp; Image Editing?</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  While Strata solves local LLM code inference, you don&apos;t need heavy GPUs or ComfyUI to edit images with Qwen. Try our in-browser <strong>Qwen Image 2.1 Online Studio</strong> for conversational inpainting, background removal, and 2048px generation in 2.5 seconds.
                </p>
                <div className="pt-1">
                  <Link
                    href={getLinkHref(locale, 'qwen-image-2-1')}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors"
                  >
                    <span>Launch Qwen 2.1 Online Studio Free &rarr;</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </article>
      </main>

      <Footer locale={locale} page="blog" />
    </div>
  );
}
