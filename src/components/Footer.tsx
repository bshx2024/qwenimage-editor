'use client'
import Link from "next/link";
import { getLinkHref } from "~/configs/buildLink";
import { useCommonContext } from "~/context/common-context";

export default function Footer({
  locale = 'en',
  page = '',
}: {
  locale?: string;
  page?: string;
}) {
  const {
    userData,
    setShowLoadingModal,
    menuText,
  } = useCommonContext();

  const manageSubscribe = async () => {
    if (!userData?.user_id) return;
    setShowLoadingModal(true);
    try {
      const responseData = await fetch(`/api/stripe/create-portal-link`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userData.user_id }),
      });
      const result = await responseData.json();
      setShowLoadingModal(false);
      if (result.url) {
        window.location.href = result.url;
      }
    } catch (e) {
      setShowLoadingModal(false);
    }
  };

  const checkPageAndLoading = (toPage: string) => {
    if (page !== toPage) {
      setShowLoadingModal(true);
    }
  };

  return (
    <footer className="border-t border-slate-800/80 bg-slate-950 text-slate-400 py-12" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">Footer</h2>
      
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand Col */}
          <div className="md:col-span-1 space-y-4">
            <Link
              href={getLinkHref(locale, '')}
              className="flex items-center gap-2.5 group"
              onClick={() => checkPageAndLoading('')}
            >
              <img
                className="h-8 w-8 rounded-lg"
                src="/appicon.svg"
                width={32}
                height={32}
                alt="Qwen Image Editor"
              />
              <span className="font-extrabold text-lg text-white group-hover:text-indigo-400 transition-colors">
                Qwen Image Editor
              </span>
            </Link>
            <p className="text-xs leading-relaxed text-slate-400">
              Free online AI-powered visual suite for photo transformation, text-guided image editing, inpainting, and high-fidelity generation.
            </p>
            <div className="pt-2 text-xs space-y-1.5 text-slate-400 border-t border-slate-800/80">
              <div className="font-semibold text-slate-300">Customer Support:</div>
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500">Email:</span>
                <a href="mailto:support@qwenimage-editor.com" className="text-indigo-400 hover:text-indigo-300 transition-colors">
                  support@qwenimage-editor.com
                </a>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500">Report Abuse:</span>
                <a href="mailto:report@qwenimage-editor.com" className="text-indigo-400 hover:text-indigo-300 transition-colors">
                  report@qwenimage-editor.com
                </a>
              </div>
            </div>
            <div className="text-xs text-slate-500">
              © {new Date().getFullYear()} Qwen Image Editor. All rights reserved.
            </div>
          </div>

          {/* Tools & Generator */}
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-200">Products & Tools</div>
            <ul role="list" className="mt-4 space-y-2.5">
              <li>
                <Link
                  href={getLinkHref(locale, '')}
                  className="text-xs hover:text-indigo-400 transition-colors"
                  onClick={() => checkPageAndLoading('')}
                >
                  Qwen Image Editor
                </Link>
              </li>
              <li>
                <Link
                  href={getLinkHref(locale, 'generator')}
                  className="text-xs hover:text-indigo-400 transition-colors"
                  onClick={() => checkPageAndLoading('generator')}
                >
                  Qwen Image Generator
                </Link>
              </li>
              <li>
                <Link
                  href={getLinkHref(locale, 'qwen-image-2-1')}
                  className="text-xs hover:text-indigo-400 transition-colors"
                  onClick={() => checkPageAndLoading('qwen-image-2-1')}
                >
                  Qwen Image 2.1 Studio
                </Link>
              </li>
              <li>
                <Link
                  href={getLinkHref(locale, 'background-remover')}
                  className="text-xs hover:text-indigo-400 transition-colors"
                  onClick={() => checkPageAndLoading('background-remover')}
                >
                  AI Background Remover
                </Link>
              </li>
              <li>
                <Link
                  href={getLinkHref(locale, 'product-photo-editor')}
                  className="text-xs hover:text-indigo-400 transition-colors"
                  onClick={() => checkPageAndLoading('product-photo-editor')}
                >
                  Product Photo Staging
                </Link>
              </li>
              <li>
                <Link
                  href={getLinkHref(locale, 'blog')}
                  className="text-xs hover:text-indigo-400 transition-colors"
                  onClick={() => checkPageAndLoading('blog')}
                >
                  Engineering Blog
                </Link>
              </li>
              <li>
                <Link
                  href={getLinkHref(locale, 'prompt')}
                  className="text-xs hover:text-indigo-400 transition-colors"
                  onClick={() => checkPageAndLoading('prompt')}
                >
                  Prompt Guide & Formula
                </Link>
              </li>
              <li>
                <Link
                  href={getLinkHref(locale, 'transparent')}
                  className="text-xs hover:text-indigo-400 transition-colors"
                  onClick={() => checkPageAndLoading('transparent')}
                >
                  Transparent PNG Tool
                </Link>
              </li>
            </ul>
          </div>

          {/* Comparisons */}
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-200">Model Comparisons</div>
            <ul role="list" className="mt-4 space-y-2.5">
              <li>
                <Link
                  href={getLinkHref(locale, 'vs-midjourney')}
                  className="text-xs hover:text-indigo-400 transition-colors"
                  onClick={() => checkPageAndLoading('vs-midjourney')}
                >
                  Qwen Image 2.1 vs Midjourney
                </Link>
              </li>
              <li>
                <Link
                  href={getLinkHref(locale, 'vs-nano-banana')}
                  className="text-xs hover:text-indigo-400 transition-colors"
                  onClick={() => checkPageAndLoading('vs-nano-banana')}
                >
                  Qwen Image 2.1 vs Nano Banana
                </Link>
              </li>
              <li>
                <Link
                  href={getLinkHref(locale, 'vs-flux')}
                  className="text-xs hover:text-indigo-400 transition-colors"
                  onClick={() => checkPageAndLoading('vs-flux')}
                >
                  Qwen Image 2.1 vs Flux
                </Link>
              </li>
              <li>
                <Link
                  href={getLinkHref(locale, 'alternative')}
                  className="text-xs hover:text-indigo-400 transition-colors"
                  onClick={() => checkPageAndLoading('alternative')}
                >
                  Best Qwen Image Alternatives
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Plans */}
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-200">Resources & Legal</div>
            <ul role="list" className="mt-4 space-y-2.5">
              {process.env.NEXT_PUBLIC_CHECK_AVAILABLE_TIME !== '0' && (
                <li>
                  <Link
                    href={getLinkHref(locale, 'pricing')}
                    className="text-xs hover:text-indigo-400 transition-colors"
                    onClick={() => checkPageAndLoading('pricing')}
                  >
                    Pricing & Credits
                  </Link>
                </li>
              )}
              {userData && process.env.NEXT_PUBLIC_CHECK_AVAILABLE_TIME !== '0' && (
                <li>
                  <button
                    onClick={manageSubscribe}
                    className="text-xs hover:text-indigo-400 transition-colors text-left"
                  >
                    Manage Subscription
                  </button>
                </li>
              )}
              <li>
                <Link
                  href={getLinkHref(locale, 'disclaimer')}
                  className="text-xs hover:text-indigo-400 transition-colors flex items-center gap-1.5"
                  onClick={() => checkPageAndLoading('disclaimer')}
                >
                  <span>Brand Disclaimer</span>
                  <span className="rounded bg-amber-500/10 text-amber-400 text-[10px] px-1 py-0.5 border border-amber-500/20">Notice</span>
                </Link>
              </li>
              <li>
                <Link
                  href={getLinkHref(locale, 'terms-of-service')}
                  className="text-xs hover:text-indigo-400 transition-colors"
                  onClick={() => checkPageAndLoading('terms-of-service')}
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  href={getLinkHref(locale, 'privacy-policy')}
                  className="text-xs hover:text-indigo-400 transition-colors"
                  onClick={() => checkPageAndLoading('privacy-policy')}
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href={getLinkHref(locale, 'aup')}
                  className="text-xs hover:text-indigo-400 transition-colors"
                  onClick={() => checkPageAndLoading('aup')}
                >
                  Acceptable Use Policy (AUP)
                </Link>
              </li>
              <li>
                <a
                  href="mailto:support@qwenimage-editor.com"
                  className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  Contact Support
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Third-Party Service & Trademark Compliance Disclaimer */}
        <div className="mt-10 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 sm:p-5 text-slate-300">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 rounded-lg bg-amber-500/10 p-1.5 text-amber-400 shrink-0">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="space-y-1.5 text-xs">
              <div className="font-semibold text-amber-200 flex flex-wrap items-center gap-2">
                <span>{locale?.startsWith('zh') ? '平台独立性与品牌免责声明' : 'Independent Third-Party Service & Brand Disclaimer'}</span>
                <span className="text-[11px] text-slate-400 font-normal">| qwenimage-editor.com</span>
              </div>
              <p className="leading-relaxed text-slate-400 text-[11px] sm:text-xs">
                {locale?.startsWith('zh')
                  ? '本平台为独立第三方服务，通过官方合规API调用相关模型，与阿里巴巴（Alibaba Group）及通义千问官方不存在关联、从属或官方授权关系。“Qwen”、“通义千问”商标为阿里巴巴集团所有，本站提及仅用于说明底层调用的模型算法与技术来源。'
                  : 'This platform is an independent third-party service and tool. We access generative AI models through compliant official APIs and are NOT affiliated with, authorized, sponsored, or endorsed by Alibaba Group or Tongyi Qianwen (Qwen) official. "Qwen", "Tongyi Qianwen", and related trademarks belong to Alibaba Group and are referenced solely for nominative descriptive purposes.'}
              </p>
              <div className="pt-1">
                <Link
                  href={getLinkHref(locale, 'disclaimer')}
                  className="inline-flex items-center gap-1 text-[11px] text-amber-400 hover:text-amber-300 underline underline-offset-2 transition-colors"
                  onClick={() => checkPageAndLoading('disclaimer')}
                >
                  {locale?.startsWith('zh') ? '阅读完整品牌免责声明 →' : 'Read Full Brand Disclaimer & Legal Notice →'}
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Contextual Internal Linking Hub (Entity Graph Interlinking) */}
        <div className="mt-10 pt-8 border-t border-slate-900 text-xs space-y-4">
          <div className="text-slate-300 font-semibold tracking-wider uppercase text-[11px]">
            AI Image Editing & Generative Knowledge Graph
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-slate-400">
            <Link href={getLinkHref(locale, '')} className="hover:text-indigo-400 transition-colors">
              Online AI Inpainting Studio
            </Link>
            <span className="text-slate-700">•</span>
            <Link href={getLinkHref(locale, 'generator')} className="hover:text-indigo-400 transition-colors">
              High-Fidelity Text to Image Generator
            </Link>
            <span className="text-slate-700">•</span>
            <Link href={getLinkHref(locale, 'vs-midjourney')} className="hover:text-indigo-400 transition-colors">
              Qwen 2.1 vs Midjourney v6 Comparison
            </Link>
            <span className="text-slate-700">•</span>
            <Link href={getLinkHref(locale, 'vs-flux')} className="hover:text-indigo-400 transition-colors">
              Qwen 2.1 vs Flux.1 DiT Benchmark
            </Link>
            <span className="text-slate-700">•</span>
            <Link href={getLinkHref(locale, 'pricing')} className="hover:text-indigo-400 transition-colors">
              Flexible Credits & Pricing Plans
            </Link>
            <span className="text-slate-700">•</span>
            <Link href={getLinkHref(locale, 'blog/strata-qwen-setup-guide')} className="hover:text-indigo-400 transition-colors">
              Strata Qwen 3.8 Local Inference Guide
            </Link>
            <span className="text-slate-700">•</span>
            <Link href={getLinkHref(locale, 'blog/higgsfield-genjutsu-workflow-guide-free-alternatives')} className="hover:text-indigo-400 transition-colors">
              Higgsfield Genjutsu Video Guide
            </Link>
            <span className="text-slate-700">•</span>
            <Link href={getLinkHref(locale, 'blog/minimax-h3-comfyui-guide-vram-workflow')} className="hover:text-indigo-400 transition-colors">
              MiniMax H3 ComfyUI Video Guide
            </Link>
            <span className="text-slate-700">•</span>
            <Link href={getLinkHref(locale, 'blog/vidu-s2-realtime-interactive-video-guide')} className="hover:text-cyan-400 transition-colors">
              Vidu S2 Real-Time Video Guide
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
