'use client'
import HeadInfo from "~/components/HeadInfo";
import Header from "~/components/Header";
import Footer from "~/components/Footer";
import Link from "next/link";
import { getLinkHref } from "~/configs/buildLink";
import { BLOG_POSTS } from "~/content/blogData";
import { 
  BookOpenIcon, 
  CalendarIcon, 
  ClockIcon, 
  ArrowRightIcon, 
  SparklesIcon,
  TagIcon
} from "@heroicons/react/24/outline";

export default function BlogListComponent({ locale = 'en' }: { locale?: string }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "name": "Qwen AI Research & Engineering Blog",
    "url": "https://www.qwenimage-editor.com/blog",
    "description": "Technical guides, local inference benchmarks, and prompt engineering tutorials for Qwen foundation models.",
    "blogPost": BLOG_POSTS.map((post) => ({
      "@type": "BlogPosting",
      "headline": post.title,
      "description": post.description,
      "datePublished": post.date,
      "url": `https://www.qwenimage-editor.com/blog/${post.slug}`,
    })),
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white">
      <HeadInfo
        title="Qwen AI Engineering Blog & Inference Guides | Qwen Image Editor"
        description="Explore technical tutorials, local inference optimization, and model benchmarks across the Qwen foundation ecosystem."
        page="blog"
        locale={locale}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Header locale={locale} page="blog" />

      <main className="flex-1 w-full">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-14 sm:py-20 border-b border-slate-900">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gradient-to-tr from-indigo-600/15 via-purple-600/15 to-pink-600/10 blur-[120px] pointer-events-none rounded-full" />
          
          <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-xs font-semibold">
              <BookOpenIcon className="w-4 h-4 text-indigo-400" />
              <span>Technical Knowledge Hub</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Qwen Research &amp; Engineering Blog
            </h1>

            <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
              In-depth architecture benchmarks, local GPU deployment tutorials, and generative AI guides for developers and creators.
            </p>
          </div>
        </section>

        {/* Blog Post Grid */}
        <section className="py-14">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {BLOG_POSTS.map((post) => (
                <article
                  key={post.slug}
                  className="rounded-3xl border border-slate-800 bg-slate-900/50 p-6 sm:p-8 flex flex-col justify-between hover:border-indigo-500/50 transition-all group"
                >
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      <span className="px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-medium">
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

                    <h2 className="text-xl font-bold text-white group-hover:text-indigo-300 transition-colors leading-snug">
                      <Link href={getLinkHref(locale, `blog/${post.slug}`)}>
                        {post.title}
                      </Link>
                    </h2>

                    <p className="text-xs sm:text-sm text-slate-400 leading-relaxed line-clamp-3">
                      {post.description}
                    </p>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {post.keywords.slice(0, 3).map((kw, idx) => (
                        <span key={idx} className="text-[11px] text-slate-500 bg-slate-950 px-2 py-0.5 rounded border border-slate-800/80">
                          #{kw}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-800/60 mt-6 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <img
                        src={post.author.avatar}
                        alt={post.author.name}
                        width={24}
                        height={24}
                        className="w-6 h-6 rounded-full object-cover border border-indigo-500/30"
                        loading="lazy"
                        decoding="async"
                      />
                      <span className="text-xs text-slate-300 font-medium">{post.author.name}</span>
                    </div>
                    <Link
                      href={getLinkHref(locale, `blog/${post.slug}`)}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 group-hover:text-indigo-300 transition-colors"
                    >
                      <span>Read Guide</span>
                      <ArrowRightIcon className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer locale={locale} page="blog" />
    </div>
  );
}
