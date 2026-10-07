'use client';
import HeadInfo from '~/components/HeadInfo';
import Header from '~/components/Header';
import Footer from '~/components/Footer';
import Markdown from 'react-markdown';
import TopBlurred from '~/components/TopBlurred';
import { useEffect, useRef, useState } from 'react';
import { useCommonContext } from '~/context/common-context';
import { ShieldCheckIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

const DISCLAIMER_CONTENT_EN = `
# Brand Disclaimer & Independent Third-Party Service Notice

**Last Updated:** October 7, 2026

Welcome to **Qwen Image Editor** (accessible at [https://qwenimage-editor.com](https://qwenimage-editor.com)). This document sets forth our official brand disclaimer and independent service notice to prevent any confusion regarding our relationship with upstream AI model providers.

---

### 1. Independent Third-Party Service Statement
**Qwen Image Editor is an independent, third-party software application and web service.** 
- This website and application are owned and operated independently by our software team.
- **We are NOT affiliated with, sponsored by, endorsed by, maintained by, or partnered with Alibaba Group Holding Limited, Alibaba Cloud, Tongyi Qianwen (通义千问), or any of their corporate affiliates or subsidiaries.**
- We do not represent ourselves as an official division, authorized distributor, or official agent of Alibaba Group.

---

### 2. Upstream AI Model Access & Compliance
- Our platform provides prompt-guided visual generation and editing workflows by accessing generative foundation models through **authorized and compliant official APIs** (including Alibaba Cloud Bailian / DashScope open API platforms and standard model providers).
- All inference calls adhere strictly to upstream API usage terms, rate limits, and regulatory licensing frameworks.
- The use of official APIs does not imply any official endorsement, sponsorship, or special partnership from Alibaba Cloud or the Tongyi Qianwen team.

---

### 3. Trademark & Intellectual Property Notice
- "Qwen", "Tongyi Qianwen", "通义千问", "Alibaba", and related names, logos, and emblems are registered trademarks or service marks owned by Alibaba Group Holding Limited or their respective owners.
- Any reference on this website to "Qwen", "Qwen-Image", or specific foundation model checkpoints (e.g., Qwen-Image-Edit 2511, Wanx 2.1) is purely for **nominative descriptive purposes** to accurately inform users which underlying models and technical capabilities power their visual tasks.
- Such nominative use does not constitute trademark infringement or imply any brand affiliation.

---

### 4. Content Safety & Regulatory Compliance
- In compliance with international content security standards and merchant policies, this platform operates proactive, multi-layered content screening on all user prompts and generative outputs.
- We integrate real-time content screening (including Waffo Content Safety Prompt Screening API) before generation to prevent harmful, defamatory, or restricted material from entering the generative inference pipeline.
- For our detailed acceptable use standards, please review our [Acceptable Use Policy (AUP)](/aup) and [Terms of Service](/terms-of-service).

---

### 5. Contact Information
If you have any questions, trademark inquiries, or compliance notices, please contact us promptly:
- **Compliance & Legal Contact:** \`legal@qwenimage-editor.com\`
- **Customer Support:** \`support@qwenimage-editor.com\`
- **Website:** [https://qwenimage-editor.com](https://qwenimage-editor.com)
`;

const DISCLAIMER_CONTENT_ZH = `
# 品牌免责声明与独立第三方服务声明

**最近更新：** 2026年10月7日

欢迎访问 **Qwen Image Editor**（网站：[https://qwenimage-editor.com](https://qwenimage-editor.com)）。本声明旨在向所有用户、监管机构与合作伙伴明确本平台的独立服务性质及品牌免责条款，以消除任何品牌混淆风险。

---

### 一、 独立第三方服务声明
**Qwen Image Editor（本平台）为独立开发运营的第三方工具应用与在线软件服务：**
- 本网站与应用由独立技术团队负责研发与维护运营。
- **本平台与阿里巴巴集团（Alibaba Group）、阿里云计算有限公司、通义千问（Qwen）官方团队及其关联公司不存在任何股权隶属、商业加盟、授权代理或官方背书关系。**
- 本平台并非阿里巴巴或通义千问的官方产品，亦未以官方名义开展任何运营活动。

---

### 二、 官方API合规接入说明
- 本平台旨在为全球视觉创作者、电商运营者及设计师提供高效的AI图像编辑与提示词修改工作流。
- 平台所提供的模型生成能力，均系通过合规合法途径接入**官方公开发布的开发者API**（包括阿里云百炼平台 Bailian / DashScope 官方开放接口及合规渠道）进行调用。
- 本平台合规使用官方商业化接口，但该等调用并不代表阿里巴巴或通义千问官方对本平台的运营提供特别担保、从属认可或联合开发。

---

### 三、 商标与知识产权归属
- “Qwen”、“通义千问”、“Alibaba”、“阿里云”及相关标识、图徽均为阿里巴巴集团或其关联权利人的合法注册商标。
- 本网站中提及“Qwen”、“Qwen-Image”、“通义千问模型”等名称，仅作**叙述性与指称性使用（Nominative Fair Use）**，用于客观说明底层所调用的AI算法模型版本与技术特性，便于用户了解其技术来源。
- 上述指称绝不构成对相关权利人商标权的侵害，亦不代表存在任何官方关联或授权。

---

### 四、 内容安全与合规保障
- 本平台严格恪守国内外AIGC内容合规政策，在生成链路前置接入了**专业提示词内容安全扫描API（Waffo Prompt Screening API）**及本地多重敏感词审核机制。
- 任何违反法律法规、侵犯他人合法权益或违背公序良俗的提示词及图片均会被系统实时拦截阻断。
- 详细规范请参阅本站的 [服务条款（Terms of Service）](/terms-of-service) 与 [可接受使用政策（AUP）](/aup)。

---

### 五、 联系方式
如您对本声明、商标事宜或合规问题有任何疑问，欢迎随时与我们取得联系：
- **合规法务邮箱：** \`legal@qwenimage-editor.com\`
- **客户支持邮箱：** \`support@qwenimage-editor.com\`
- **官方网址：** [https://qwenimage-editor.com](https://qwenimage-editor.com)
`;

export default function DisclaimerPageComponent({
  locale = 'en',
}: {
  locale?: string;
}) {
  const { setShowLoadingModal } = useCommonContext();

  const useCustomEffect = (effect: () => void, deps: any[]) => {
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
  }, []);

  const isZh = locale.startsWith('zh');
  const content = isZh ? DISCLAIMER_CONTENT_ZH : DISCLAIMER_CONTENT_EN;
  const pageTitle = isZh
    ? '品牌免责声明与第三方声明 — Qwen Image Editor'
    : 'Brand Disclaimer & Third-Party Service Notice — Qwen Image Editor';
  const pageDesc = isZh
    ? 'Qwen Image Editor 独立第三方服务声明与品牌免责说明，明确本平台与阿里巴巴/通义千问官方无关联，通过官方合规API接入调用相关AI模型。'
    : 'Official brand disclaimer and third-party service statement for Qwen Image Editor, clarifying independent operations and compliant official API usage.';

  const schemaData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        name: pageTitle,
        description: pageDesc,
        url: 'https://qwenimage-editor.com/disclaimer',
        publisher: {
          '@type': 'Organization',
          name: 'Qwen Image Editor',
          url: 'https://qwenimage-editor.com',
        },
      },
    ],
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white">
      <HeadInfo
        locale={locale}
        page="disclaimer"
        title={pageTitle}
        description={pageDesc}
        image="/images/og-image.jpg"
        schemaData={schemaData}
      />
      <Header locale={locale} page="disclaimer" />

      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <TopBlurred />

        {/* Notice Card */}
        <div className="mb-8 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5 backdrop-blur-md">
          <div className="flex items-start gap-3.5">
            <ShieldCheckIcon className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1 text-sm">
              <div className="font-semibold text-amber-200">
                {isZh ? '重要合规声明' : 'Important Compliance Notice'}
              </div>
              <p className="text-slate-300 leading-relaxed text-xs sm:text-sm">
                {isZh
                  ? '本平台为独立第三方服务工具，与阿里巴巴及通义千问官方无任何关联或授权关系。本站通过官方开放API合规调用相关AI模型。'
                  : 'This platform is an independent third-party service and is NOT affiliated with, authorized, or endorsed by Alibaba Group or Qwen official team.'}
              </p>
            </div>
          </div>
        </div>

        {/* Markdown Content */}
        <div className="prose prose-invert prose-slate max-w-none prose-headings:text-white prose-a:text-indigo-400 hover:prose-a:text-indigo-300 prose-strong:text-slate-100 bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 sm:p-10 shadow-xl">
          <Markdown>{content}</Markdown>
        </div>
      </main>

      <Footer locale={locale} page="disclaimer" />
    </div>
  );
}
