'use client'
import HeadInfo from "~/components/HeadInfo";
import Header from "~/components/Header";
import Footer from "~/components/Footer";
import Pricing from "~/components/PricingComponent";
import {useEffect, useRef, useState} from "react";
import TopBlurred from "~/components/TopBlurred";
import {useCommonContext} from "~/context/common-context";


const PageComponent = ({
                         locale,
                       }) => {
  const [pagePath] = useState('pricing');

  const {
    setShowLoadingModal,
    pricingText
  } = useCommonContext();

  const useCustomEffect = (effect, deps) => {
    const isInitialMount = useRef(true);

    useEffect(() => {
      if (process.env.NODE_ENV === 'production' || isInitialMount.current) {
        isInitialMount.current = false;
        return effect();
      }
    }, deps);
  };

  useCustomEffect(() => {
    setShowLoadingModal(false);
    return () => {
    }
  }, []);

  const schemaData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Product',
        name: 'Qwen Image Editor AI Subscription & Credits',
        description: 'Flexible credits and recurring subscription plans for Qwen AI image generation, inpainting, and high-resolution photo editing.',
        brand: {
          '@type': 'Brand',
          name: 'Qwen Image Editor',
        },
        offers: {
          '@type': 'AggregateOffer',
          priceCurrency: 'USD',
          lowPrice: '4.99',
          highPrice: '118.80',
          offerCount: '3',
          offers: [
            {
              '@type': 'Offer',
              name: 'Starter Pack',
              price: '4.99',
              priceCurrency: 'USD',
              availability: 'https://schema.org/InStock',
              description: '100 AI Edit & Generation Credits, one-time payment, lifetime validity.',
            },
            {
              '@type': 'Offer',
              name: 'Pro Monthly',
              price: '19.90',
              priceCurrency: 'USD',
              availability: 'https://schema.org/InStock',
              description: '500 AI Credits Per Month, commercial license, fast GPU queue.',
            },
            {
              '@type': 'Offer',
              name: 'Pro Yearly',
              price: '118.80',
              priceCurrency: 'USD',
              availability: 'https://schema.org/InStock',
              description: '6,000 AI Credits Per Year ($9.90/month), VIP priority queue, 24/7 support.',
            },
          ],
        },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: 'https://qwenimage-editor.com',
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Pricing',
            item: 'https://qwenimage-editor.com/pricing',
          },
        ],
      },
    ],
  };

  return (
    <>
      <HeadInfo
        locale={locale}
        page={pagePath}
        title={pricingText.title}
        description={pricingText.description}
        schemaData={schemaData}
      />
      <Header
        locale={locale}
        page={pagePath}
      />
      <div className={"mt-8 my-auto min-h-[90vh]"}>
        <TopBlurred/>

        {/* Conclusion First & Feature-Bullet Chunking Header */}
        <div className="max-w-4xl mx-auto px-4 text-center pt-6 pb-4 space-y-4">
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Transparent Pricing & Flexible AI Credits
          </h1>
          <p className="text-base sm:text-lg text-slate-200 leading-relaxed max-w-3xl mx-auto font-normal">
            <strong>Qwen Image Editor Pricing</strong> offers flexible AI image generation and inpainting credits, starting from a $0.00 free tier up to a $118.80 annual subscription (equivalent to $9.90/month, saving 50%), with 100% commercial usage rights and zero contract commitments.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-2 text-left text-xs">
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-2.5">
              <span className="font-semibold text-emerald-300 block">Free Daily Tier</span>
              <span className="text-slate-400 text-[11px]">$0.00, daily renewal, 1024×1024 resolution</span>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-2.5">
              <span className="font-semibold text-indigo-300 block">Starter Pack</span>
              <span className="text-slate-400 text-[11px]">$4.99 one-time, 100 credits, never expires</span>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-2.5">
              <span className="font-semibold text-purple-300 block">Pro Monthly</span>
              <span className="text-slate-400 text-[11px]">$19.90/mo, 500 credits, GPU priority queue</span>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-2.5">
              <span className="font-semibold text-pink-300 block">Pro Yearly</span>
              <span className="text-slate-400 text-[11px]">$118.80/yr ($9.90/mo), 6000 credits, save 50%</span>
            </div>
          </div>
        </div>

        <Pricing
          redirectUrl={`${locale}/pricing`}
          isPricing={true}
        />

        {/* 3-Step How-To Workflow Section for Purchasing & Using Credits */}
        <section className="py-12 border-t border-slate-900 bg-slate-950/60 max-w-5xl mx-auto px-4 mt-12 rounded-3xl">
          <div className="text-center mb-8">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              Purchasing Workflow
            </span>
            <h2 className="text-2xl font-extrabold text-white tracking-tight mt-3">
              How to Get Started in 3 Simple Steps
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 space-y-2 text-xs">
              <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 font-bold flex items-center justify-center border border-indigo-500/30">
                1
              </div>
              <h3 className="text-sm font-bold text-white">Step 1: Select Credit Plan</h3>
              <p className="text-slate-400 leading-relaxed">
                Choose between the $4.99 non-expiring Starter Pack or monthly/annual subscription tiers according to your usage.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 space-y-2 text-xs">
              <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-400 font-bold flex items-center justify-center border border-purple-500/30">
                2
              </div>
              <h3 className="text-sm font-bold text-white">Step 2: Instant Secure Checkout</h3>
              <p className="text-slate-400 leading-relaxed">
                Complete payment via 256-bit encrypted Stripe or Waffo gateways with zero recurring hidden lock-ins.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 space-y-2 text-xs">
              <div className="w-7 h-7 rounded-lg bg-pink-500/20 text-pink-400 font-bold flex items-center justify-center border border-pink-500/30">
                3
              </div>
              <h3 className="text-sm font-bold text-white">Step 3: Immediate High-Speed Access</h3>
              <p className="text-slate-400 leading-relaxed">
                Credits reflect immediately on your balance with high-speed GPU priority inference enabled.
              </p>
            </div>
          </div>
        </section>

        {/* Cross-Entity Pricing Comparison Matrix */}
        <section className="py-12 border-t border-slate-900 max-w-5xl mx-auto px-4 mt-8">
          <div className="text-center mb-8">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20">
              Pricing Benchmark
            </span>
            <h2 className="text-2xl font-extrabold text-white tracking-tight mt-3">
              Market Pricing & Commercial Rights Comparison
            </h2>
          </div>

          <div className="rounded-2xl border border-slate-800 overflow-hidden bg-slate-900/50">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm text-slate-300">
                <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 uppercase text-[11px]">
                  <tr>
                    <th className="py-3.5 px-4 font-semibold">Evaluation Metric</th>
                    <th className="py-3.5 px-4 font-bold text-indigo-400">Qwen Image Editor</th>
                    <th className="py-3.5 px-4 font-semibold text-slate-300">Midjourney v6.1</th>
                    <th className="py-3.5 px-4 font-semibold text-slate-300">Flux.1 (Replicate API)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-normal">
                  <tr>
                    <td className="py-3.5 px-4 font-medium text-white">Billing Flexibility</td>
                    <td className="py-3.5 px-4 text-indigo-300 font-medium">$4.99 lifetime pack + monthly/yearly options</td>
                    <td className="py-3.5 px-4 text-slate-400">Mandatory recurring subscription only</td>
                    <td className="py-3.5 px-4 text-slate-400">Pure raw API per-second billing</td>
                  </tr>
                  <tr>
                    <td className="py-3.5 px-4 font-medium text-white">Commercial Rights</td>
                    <td className="py-3.5 px-4 text-emerald-400 font-medium">100% Commercial rights (all tiers)</td>
                    <td className="py-3.5 px-4 text-slate-400">Active paying members only</td>
                    <td className="py-3.5 px-4 text-slate-400">Dev model requires expensive enterprise license</td>
                  </tr>
                  <tr>
                    <td className="py-3.5 px-4 font-medium text-white">Effective Cost / Image</td>
                    <td className="py-3.5 px-4 text-indigo-300 font-medium">$0.019 (Yearly) to $0.049 (Starter)</td>
                    <td className="py-3.5 px-4 text-slate-400">~$0.05/image (Basic 200 fast gens)</td>
                    <td className="py-3.5 px-4 text-slate-400">~$0.03–$0.055/image (headless API)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
      <Footer
        locale={locale}
        page={pagePath}
      />
    </>
  )
}

export default PageComponent
