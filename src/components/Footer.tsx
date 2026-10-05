'use client'
import Link from "next/link";
import { getLinkHref } from "~/configs/buildLink";
import { useCommonContext } from "~/context/common-context";
import { GoogleAnalytics } from "@next/third-parties/google";

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

        {/* Contextual Internal Linking Hub (Entity Graph Interlinking) */}
        <div className="mt-12 pt-8 border-t border-slate-900 text-xs space-y-4">
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
            <Link href={getLinkHref(locale, 'aup')} className="hover:text-indigo-400 transition-colors">
              Commercial AI Licensing & AUP
            </Link>
          </div>
        </div>
      </div>

      {process.env.NEXT_PUBLIC_GOOGLE_TAG_ID && (
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GOOGLE_TAG_ID} />
      )}
    </footer>
  );
}
