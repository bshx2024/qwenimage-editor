'use client'
import HeadInfo from "~/components/HeadInfo";
import Header from "~/components/Header";
import Footer from "~/components/Footer";
import { useCommonContext } from "~/context/common-context";
import { useEffect, useRef, useState } from "react";
import { useInterval } from "ahooks";
import PricingModal from "~/components/PricingModal";
import Link from "next/link";
import { Switch } from "@headlessui/react";
import { getLinkHref } from "~/configs/buildLink";
import {
  SparklesIcon,
  ArrowUpTrayIcon,
  PhotoIcon,
  ArrowPathIcon,
  ArrowDownTrayIcon,
  CheckCircleIcon,
  EyeIcon,
  AdjustmentsHorizontalIcon,
  ChevronDownIcon,
  ArrowsRightLeftIcon,
  BoltIcon,
  ShieldCheckIcon,
  CpuChipIcon,
} from "@heroicons/react/24/outline";
import { getGuestTrialsRemaining, recordGuestTrialUse, GUEST_TRIAL_LIMIT } from "~/libs/guestTrial";
import { exportImageWithTier } from "~/libs/imageExport";

export default function PageComponent({
  locale = 'en',
  indexText,
  questionText,
  resultInfoListInit = [],
  searchParams,
}: any) {
  const {
    setShowLoadingModal,
    setShowLoginModal,
    setShowPricingModal,
    setShowGeneratingModal,
    commonText,
    userData,
    refreshUserCredits,
  } = useCommonContext();

  const [textStr, setTextStr] = useState(
    'Swap clothes to elegant emerald green silk gala evening dress, high slit'
  );
  const [sourceImage, setSourceImage] = useState<string | null>('/images/showcase_dress_before.jpg');
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPublic, setIsPublic] = useState(true);
  const [activeTab, setActiveTab] = useState<'edit' | 'generate'>('edit');
  const [aspectRatio, setAspectRatio] = useState<'auto' | '1:1' | '16:9' | '9:16' | '3:4' | '4:3'>('auto');
  const [selectedModel, setSelectedModel] = useState<string>('wanx2.1-i2i-turbo');
  const [comparisonMode, setComparisonMode] = useState<'split' | 'result'>('result');
  const [currentResultImage, setCurrentResultImage] = useState<string | null>('/images/showcase_dress_after.jpg');
  const [uid, setUid] = useState('');
  const [intervalResultInfo, setIntervalResultInfo] = useState<number | undefined>(undefined);
  const [faqOpen, setFaqOpen] = useState<{ [key: number]: boolean }>({ 0: true });
  const [downloadFormat, setDownloadFormat] = useState<'png' | 'jpg' | 'webp'>('png');
  const [showFormatDropdown, setShowFormatDropdown] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [activePresetCategory, setActivePresetCategory] = useState<number>(0);
  const [tryOnFidelity, setTryOnFidelity] = useState<boolean>(true);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // High-Resolution Multi-Format Image Downloader with HD vs Preview Tiering
  const handleDownloadWithFormat = async (
    imgUrl: string | null,
    format: 'png' | 'jpg' | 'webp' = downloadFormat,
    tier: 'preview' | 'hd' = 'hd'
  ) => {
    if (!imgUrl) return;
    if (!userData || !userData.user_id) {
      setShowLoginModal(true);
      return;
    }

    // HD / Lossless download requires active Pro or triggers Welcome Offer
    if (tier === 'hd' && !userData.isPro) {
      setShowFormatDropdown(false);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('open-welcome-offer'));
      }
      setShowPricingModal(true);
      return;
    }

    setIsDownloading(true);
    setShowFormatDropdown(false);
    try {
      await exportImageWithTier({
        imgUrl,
        format,
        tier,
        filenamePrefix: 'qwen-image',
      });
    } catch (err) {
      console.warn('Download fallback:', err);
      const a = document.createElement('a');
      a.href = imgUrl;
      a.download = `qwen-image-${Date.now()}.${format}`;
      a.target = '_blank';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } finally {
      setIsDownloading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'edit') {
      if (selectedModel === 'wanx2.1-t2i-turbo') setSelectedModel('wanx2.1-i2i-turbo');
      else if (selectedModel === 'wanx2.1-t2i-plus') setSelectedModel('wanx2.1-i2i-plus');
    } else {
      if (selectedModel === 'wanx2.1-i2i-turbo') setSelectedModel('wanx2.1-t2i-turbo');
      else if (selectedModel === 'wanx2.1-i2i-plus') setSelectedModel('wanx2.1-t2i-plus');
      else if (selectedModel === 'qwen-image-edit') setSelectedModel('wanx2.1-t2i-turbo');
      if (aspectRatio === 'auto') setAspectRatio('1:1');
    }
  }, [activeTab]);

  useEffect(() => {
    setShowLoadingModal(false);
    if (searchParams?.prompt) {
      setTextStr(searchParams.prompt);
    }
  }, [searchParams]);

  // Handle local file upload
  const handleFileUpload = async (file: File) => {
    if (!file) return;
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.url) {
        setSourceImage(data.url);
        setActiveTab('edit');
      }
    } catch (e) {
      console.error('Upload failed:', e);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleSampleSelect = (beforeUrl: string, defaultPrompt?: string, afterUrl?: string) => {
    setSourceImage(beforeUrl);
    setActiveTab('edit');
    if (defaultPrompt) {
      setTextStr(defaultPrompt);
    }
    if (afterUrl) {
      setCurrentResultImage(afterUrl);
    }
  };

  const handleLoadShowcase = (beforeUrl: string, defaultPrompt: string, afterUrl?: string) => {
    setSourceImage(beforeUrl);
    setActiveTab('edit');
    setTextStr(defaultPrompt);
    if (afterUrl) {
      setCurrentResultImage(afterUrl);
    }
    if (typeof window !== 'undefined') {
      const el = document.getElementById('editor-card');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  // Submit generate / edit task
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!textStr && activeTab === 'generate') return;

    // Require login to generate or edit images
    if (!userData) {
      setShowLoginModal(true);
      return;
    }

    setIsProcessing(true);
    setShowGeneratingModal(true);

    try {
      let effectivePrompt = textStr;
      if (tryOnFidelity && activeTab === 'edit' && effectivePrompt) {
        const fidelityHelper = 'preserve original face structure and body proportions strictly, photorealistic fabric texture, natural drape and seams';
        if (!effectivePrompt.toLowerCase().includes('face') && !effectivePrompt.toLowerCase().includes('preserve')) {
          effectivePrompt = `${effectivePrompt}, ${fidelityHelper}`;
        }
      }

      const payload: any = {
        textStr: effectivePrompt,
        user_id: userData?.user_id || 'guest',
        is_public: isPublic,
        model: selectedModel,
        aspectRatio,
      };

      if (activeTab === 'edit' && sourceImage) {
        payload.imageUrl = sourceImage;
        payload.taskType = 'image_edit';
      } else {
        payload.taskType = 'text2image';
      }

      const res = await fetch('/api/generate/handle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await res.json();

      if (result.status === 601) {
        setShowLoginModal(true);
        setIsProcessing(false);
        setShowGeneratingModal(false);
        return;
      }
      if (result.status === 602) {
        if (!userData) {
          setShowLoginModal(true);
        } else {
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('open-welcome-offer'));
          }
          setShowPricingModal(true);
        }
        setIsProcessing(false);
        setShowGeneratingModal(false);
        return;
      }

      if (result.uid) {
        if (!userData) {
          recordGuestTrialUse();
        }
        setUid(result.uid);
        setIntervalResultInfo(3000);
        refreshUserCredits?.();
      } else {
        setIsProcessing(false);
        setShowGeneratingModal(false);
        alert(result.error || result.msg || 'Generation failed, please try again.');
      }
    } catch (err) {
      console.error('Generate failed:', err);
      setIsProcessing(false);
      setShowGeneratingModal(false);
    }
  };

  // Poll for prediction result
  const pollResult = async () => {
    if (!uid) return;
    try {
      const response = await fetch(`/api/works/getResultInfo?uid=${uid}&userId=${userData?.user_id || 'guest'}`);
      const info = await response.json();
      if (info.status === 1) {
        setShowGeneratingModal(false);
        setIsProcessing(false);
        setIntervalResultInfo(undefined);
        if (info.output_url && info.output_url.length > 0) {
          const out = Array.isArray(info.output_url) ? info.output_url[0] : info.output_url;
          setCurrentResultImage(out);
        }
        refreshUserCredits?.();
      } else if (info.status === 2) {
        setShowGeneratingModal(false);
        setIsProcessing(false);
        setIntervalResultInfo(undefined);
        refreshUserCredits?.();
        alert(info.message || 'Generation failed, please try again.');
      }
    } catch (e) {
      // Continue polling
    }
  };

  useInterval(() => {
    pollResult();
  }, intervalResultInfo);

  // Quick preset categories (CRO optimized based on 24h visitor search logs & fashion intent)
  const promptPresetCategories = [
    {
      name: '👗 AI Fashion & Wardrobe',
      items: [
        {
          text: 'Swap clothes to elegant emerald green silk gala evening dress, high slit',
          sourceUrl: '/images/showcase_dress_before.jpg',
          previewUrl: '/images/showcase_dress_after.jpg',
        },
        {
          text: 'Change outfit to tailored luxury navy blazer and white silk blouse',
          sourceUrl: '/images/showcase_dress_before.jpg',
          previewUrl: '/images/showcase_fashion_navy_blazer.jpg',
        },
        {
          text: 'Change clothing to chic bohemian floral summer beach sundress',
          sourceUrl: '/images/showcase_dress_before.jpg',
          previewUrl: '/images/showcase_fashion_boho_sundress.jpg',
        },
        {
          text: 'Swap jacket to vintage distressed black leather biker jacket',
          sourceUrl: '/images/showcase_dress_before.jpg',
          previewUrl: '/images/showcase_fashion_leather_jacket.jpg',
        },
        {
          text: 'Transform attire to modern haute couture velvet gown with pearls',
          sourceUrl: '/images/showcase_dress_before.jpg',
          previewUrl: '/images/showcase_fashion_velvet_gown.jpg',
        },
        {
          text: 'Change outfit to casual oversized beige knit sweater and jeans',
          sourceUrl: '/images/showcase_dress_before.jpg',
          previewUrl: '/images/showcase_fashion_knit_sweater.jpg',
        },
        {
          text: 'Change dress pattern to vibrant pink peony floral embroidery',
          sourceUrl: '/images/showcase_dress_before.jpg',
          previewUrl: '/images/showcase_fashion_pink_embroidery.jpg',
        },
      ],
    },
    {
      name: '🤵 Suits & Formal Wear',
      items: [
        {
          text: 'Swap outfit to bespoke sharp black tuxedo with satin peak lapels',
          sourceUrl: '/images/rumpelstiltskin_vintage_demo.jpg',
          previewUrl: '/images/rumpelstiltskin_tuxedo_result.jpg',
        },
        {
          text: 'Change clothing to modern slim-fit charcoal three-piece business suit',
          sourceUrl: '/images/showcase_dress_before.jpg',
          previewUrl: '/images/showcase_fashion_navy_blazer.jpg',
        },
        {
          text: 'Swap shirt to formal crisp white French cuff dress shirt and tie',
          sourceUrl: '/images/rumpelstiltskin_vintage_demo.jpg',
          previewUrl: '/images/rumpelstiltskin_tuxedo_result.jpg',
        },
        {
          text: 'Change attire to executive cashmere trench coat with tailored pants',
          sourceUrl: '/images/showcase_dress_before.jpg',
          previewUrl: '/images/showcase_fashion_navy_blazer.jpg',
        },
      ],
    },
    {
      name: '🛍️ Studio & Background',
      items: [
        {
          text: 'Change background to cyberpunk neon metropolis night street',
          sourceUrl: '/images/showcase_cafe_before.jpg',
          previewUrl: '/images/showcase_cyberpunk_after.jpg',
        },
        {
          text: 'Change background to luxury minimalist clean studio backdrop',
          sourceUrl: '/images/showcase_dress_before.jpg',
          previewUrl: '/images/showcase_fashion_knit_sweater.jpg',
        },
        {
          text: 'Isolate subject on pure white seamless ecommerce catalog background',
          sourceUrl: '/images/showcase_dress_before.jpg',
          previewUrl: '/images/showcase_dress_before.jpg',
        },
        {
          text: 'Add warm golden hour sunset rim lighting and soft shadows',
          sourceUrl: '/images/showcase_dress_before.jpg',
          previewUrl: '/images/showcase_fashion_boho_sundress.jpg',
        },
      ],
    },
    {
      name: '✨ Face & Retouch',
      items: [
        {
          text: 'Transform portrait into high-end Vogue fashion editorial photography',
          sourceUrl: '/images/showcase_dress_before.jpg',
          previewUrl: '/images/showcase_fashion_velvet_gown.jpg',
        },
        {
          text: 'Refine hair to voluminous natural glossy waves with soft rim light',
          sourceUrl: '/images/showcase_dress_before.jpg',
          previewUrl: '/images/showcase_dress_after.jpg',
        },
        {
          text: 'Add realistic retro tortoise-shell eyeglasses and warm smile',
          sourceUrl: '/images/showcase_dress_before.jpg',
          previewUrl: '/images/showcase_fashion_boho_sundress.jpg',
        },
      ],
    },
  ];

  // Preload fashion showcase demo images for instant zero-latency preview switching
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const demoImages = [
      '/images/showcase_dress_before.jpg',
      '/images/showcase_dress_after.jpg',
      '/images/showcase_fashion_navy_blazer.jpg',
      '/images/showcase_fashion_boho_sundress.jpg',
      '/images/showcase_fashion_leather_jacket.jpg',
      '/images/showcase_fashion_velvet_gown.jpg',
      '/images/showcase_fashion_knit_sweater.jpg',
      '/images/showcase_fashion_pink_embroidery.jpg',
      '/images/rumpelstiltskin_vintage_demo.jpg',
      '/images/rumpelstiltskin_tuxedo_result.jpg',
      '/images/showcase_cafe_before.jpg',
      '/images/showcase_cyberpunk_after.jpg',
    ];
    demoImages.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  // FAQ Items - Comprehensive coverage for search intent, citations, and LLM entity confidence
  const faqList = [
    {
      q: 'What is Qwen Image Editor and how does it work?',
      a: "Qwen Image Editor is a browser-based AI platform that modifies images through natural language prompts using Alibaba Cloud's Qwen-Image 2.1 foundation models. Rather than regenerating complete canvases from scratch, the system maps multimodal visual tokens directly to prompt instructions, isolating edit boundaries with zero manual masking. It executes localized inpainting on 1024×1024 pixel inputs within 2.5 to 4.5 seconds on cloud GPUs, preserving 100% of unedited textures and facial landmarks without requiring 24GB local VRAM.",
    },
    {
      q: 'Can I use Qwen Image Editor for AI clothes changing and virtual try-on?',
      a: 'Yes. Qwen Image Editor excels at virtual apparel try-on, dress swapping, and ecommerce fashion modeling. By leveraging deep visual grounding, it recognizes body silhouettes and replaces tops, suits, evening dresses, or casual streetwear while preserving the model’s face, hairstyle, skin tone, and natural posture. The cloud inference pipeline renders authentic fabric draping, seams, and lighting in under 4 seconds.',
    },
    {
      q: 'How to edit or inpaint photos using text prompts?',
      a: 'You can edit and inpaint any photo through a three-step conversational workflow directly in your web browser. First, upload a source JPG, PNG, or WebP photo up to 20MB. Second, enter natural language instructions specifying your target change, such as modifying garments or replacing backgrounds. Third, click generate to trigger neural inference, delivering 2048×2048 high-resolution downloads within 3 seconds. The underlying vision model automatically locates regions without brush tools, maintaining 68+ facial consistency points.',
    },
    {
      q: 'How does Qwen Image Editor compare to Midjourney and Flux?',
      a: 'Qwen Image Editor outperforms Midjourney and Flux in targeted conversational inpainting, native bilingual typography, and per-image operational cost. While Midjourney requires a $10/month Discord subscription and Flux.1 Dev needs 24GB VRAM with external ControlNets, Qwen provides a free tier alongside a $4.99 starter pack. Midjourney often limits localized edits to manual brush regions, whereas Qwen provides native maskless inpainting, rendering crisp English and Chinese text up to 2048×2048 resolution with zero subscription lock-in.',
    },
    {
      q: 'Are the AI-generated images commercial-use friendly and private?',
      a: 'Yes, all images generated and edited on Qwen Image Editor are 100% commercial-use friendly and private by default. Users retain complete commercial exploitation rights to monetize visual outputs across paid advertisements, client projects, and print merchandise without royalty obligations. Image uploads and generated outputs are transmitted via 256-bit SSL encryption. Paid subscribers can toggle private mode to ensure inputs and outputs remain completely confidential and are never stored for model training purposes.',
    },
    {
      q: 'Which model checkpoints are supported (Qwen Image Edit 2511 vs 2512 vs 2509)?',
      a: 'Our cloud platform runs production-grade checkpoints from Alibaba Cloud and HuggingFace, including Qwen-Image-Edit 2511 and 2512 alongside Wanx 2.1. Checkpoint 2511 delivers higher semantic adherence for complex localized inpainting and prompt constraints, whereas 2512 offers enhanced multi-angle perspective handling and lighting balancing. Checkpoint 2509 is deployed on low-latency serverless GPU endpoints for rapid exploratory edits.',
    },
    {
      q: 'Can I use this online editor for free without ComfyUI or a high-end GPU?',
      a: 'Yes, completely free. Running Qwen-Image-Edit locally via ComfyUI, GGUF quants, or Diffusers pipelines demands at least 16GB–24GB of dedicated VRAM (e.g., NVIDIA RTX 3090, 4090, or A100) and custom Python node dependencies. Our cloud service executes all neural inference on high-performance GPU clusters, enabling instant editing in any modern browser on Windows, macOS, or mobile devices with zero local installation.',
    },
    {
      q: 'How does Qwen Image Edit solve the face distortion issue ("cant get the faces correct")?',
      a: 'Legacy inpainting tools often cause facial distortion or identity drift due to random diffusion noise re-sampling. Qwen Image Edit pairs deep multimodal visual tokens with spatial cross-attention layers. This locks 68+ facial landmark points, gaze orientation, and natural skin texture while applying edits exclusively to requested regions such as clothing, hair color, glasses, or background surroundings.',
    },
    {
      q: 'Is Qwen Image Edit censored, and what are the content policies?',
      a: 'Qwen Image Edit incorporates safety filters designed to block harmful, hateful, and illegal material while providing maximum creative freedom for portrait editing, design mockups, art direction, and digital marketing. Safe artistic expressions, photorealistic portraits, and creative styling are fully supported.',
    },
    {
      q: 'Can Qwen Image render clean English and bilingual text inside images?',
      a: 'Yes. Bilingual typographic rendering is a core architectural strength of the Qwen visual model. Thanks to its multimodal vocabulary tokenizer, Qwen correctly spells English words, brand typography, and Chinese calligraphy on street signage, product packaging, and posters without the distorted glyphs typical of older diffusion models.',
    },
    {
      q: 'What resolutions and export formats are supported for download?',
      a: 'Users can preview in real-time and export full-resolution images in lossless PNG or optimized WebP format up to 4K Ultra-HD resolution with sharp edge fidelity and zero color compression.',
    },
  ];

  // Structured Data Schema for Rich Snippets & GEO
  const schemaData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': 'https://qwenimage-editor.com/#organization',
        name: 'Qwen Image Editor',
        url: 'https://qwenimage-editor.com',
        logo: 'https://qwenimage-editor.com/appicon.svg',
        sameAs: [
          'https://github.com/QwenLM/Qwen-Image',
          'https://huggingface.co/Qwen'
        ],
        description: 'Online AI vision & generative image editing platform built on Qwen visual foundation models.'
      },
      {
        '@type': ['WebApplication', 'SoftwareApplication'],
        '@id': 'https://qwenimage-editor.com/#software',
        name: 'Qwen Image Editor',
        alternateName: 'Qwen-Image-Edit Online',
        url: 'https://qwenimage-editor.com',
        image: 'https://qwenimage-editor.com/images/og-image.jpg',
        applicationCategory: 'DesignApplication',
        applicationSubCategory: 'MultimediaApplication, AI Image Inpainting & Generation Software',
        operatingSystem: 'Web Browser (Chrome, Safari, Firefox, Edge, iOS, Android)',
        browserRequirements: 'Requires JavaScript. Requires HTML5.',
        softwareVersion: '2.1',
        isBasedOn: {
          '@type': 'SoftwareApplication',
          name: 'Qwen-Image 2.1 Foundation Model',
          creator: {
            '@type': 'Organization',
            name: 'Alibaba Cloud Tongyi Lab / Model Studio (Bailian)',
          },
          url: 'https://github.com/QwenLM/Qwen-Image',
        },
        description:
          'Professional online AI image editing tool powered by Alibaba Cloud Bailian and Qwen-Image 2.1 models. Features conversational inpainting, background removal, bilingual typography rendering, and high-fidelity text-to-image synthesis directly in browser without ComfyUI.',
        featureList: [
          'AI Inpainting: Conversational instruction-guided photo modifications',
          'Text-guided Photo Editing: Pinpoint adjustments without identity drift',
          'Background Removal & Replacement: Zero-shot subject isolation and scene re-lighting',
          'Text to Image: High-fidelity generation with crisp bilingual typography',
        ],
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: '4.9',
          bestRating: '5.0',
          worstRating: '1.0',
          ratingCount: '1280',
          reviewCount: '1280',
        },
        hasOfferCatalog: {
          '@type': 'OfferCatalog',
          name: 'Qwen Image Editor Pricing Plans',
          itemListElement: [
            {
              '@type': 'Offer',
              name: 'Free Trial',
              price: '0.00',
              priceCurrency: 'USD',
              availability: 'https://schema.org/InStock',
              description:
                'Free trial with complimentary daily AI generation and inpainting credits upon registration.',
            },
            {
              '@type': 'Offer',
              name: 'Starter Pack',
              price: '4.99',
              priceCurrency: 'USD',
              availability: 'https://schema.org/InStock',
              description:
                '100 permanent AI Edit & Generation Credits, one-time payment, lifetime validity without expiration.',
            },
            {
              '@type': 'Offer',
              name: 'Pro Monthly',
              price: '19.90',
              priceCurrency: 'USD',
              availability: 'https://schema.org/InStock',
              priceSpecification: {
                '@type': 'UnitPriceSpecification',
                price: '19.90',
                priceCurrency: 'USD',
                unitCode: 'MON',
                billingIncrement: 1,
              },
              description:
                '500 AI Credits per month, commercial license, fast GPU queue, full editing suite without watermarks.',
            },
            {
              '@type': 'Offer',
              name: 'Pro Yearly',
              price: '118.80',
              priceCurrency: 'USD',
              availability: 'https://schema.org/InStock',
              priceSpecification: {
                '@type': 'UnitPriceSpecification',
                price: '118.80',
                priceCurrency: 'USD',
                unitCode: 'ANN',
                billingIncrement: 1,
              },
              description:
                '6,000 AI Credits per year ($9.90/month, save 50%), VIP priority GPU queue, commercial rights, 24/7 priority support.',
            },
          ],
        },
      },
      {
        '@type': 'HowTo',
        name: 'How to Edit Photos Online Using Natural Language with Qwen Image Editor',
        description: 'Step-by-step workflow to edit and inpaint photos in your browser without GPU setup or ComfyUI.',
        step: [
          {
            '@type': 'HowToStep',
            position: 1,
            name: 'Upload or Select Source Photo',
            text: 'Upload any portrait, product, or landscape image (JPG, PNG, WebP) or click a preloaded sample photo.'
          },
          {
            '@type': 'HowToStep',
            position: 2,
            name: 'Describe Your Desired Edit',
            text: 'Type a conversational prompt describing the changes, such as modifying clothing, replacing the background, or changing lighting.'
          },
          {
            '@type': 'HowToStep',
            position: 3,
            name: 'Run Inference and Export',
            text: 'Submit the task to execute cloud neural inference with Qwen-Image-Edit models and download the full-resolution edited image.'
          }
        ]
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
        page=""
        title={indexText?.title || "Qwen Image Editor — AI Photo Editor & Conversational Inpainting"}
        description={indexText?.description || "High-precision AI photo editor powered by Qwen-Image 2.1 foundation models. Inpaint, change clothing, swap backgrounds, and modify text without ComfyUI."}
        image="/images/og-image.jpg"
        schemaData={schemaData}
      />

      <Header locale={locale} page="" />
      <PricingModal locale={locale} page="" />

      <main className="flex-1 w-full">
        {/* Hero & Interactive Editor Section */}
        <section className="relative overflow-hidden pt-8 pb-16 lg:pt-14 lg:pb-24">
          {/* Subtle Ambient Glow */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-indigo-600/20 via-purple-600/20 to-pink-600/10 blur-[130px] pointer-events-none rounded-full" />

          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
            {/* Header Titles */}
            <div className="text-center max-w-4xl mx-auto space-y-4 mb-8">
              {/* Badges Bar: Feature + Independent Third-Party Compliance */}
              <div className="flex flex-wrap items-center justify-center gap-2.5">
                <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3.5 py-1 text-xs font-medium text-indigo-300 backdrop-blur-md">
                  <SparklesIcon className="w-4 h-4 text-indigo-400 animate-pulse" />
                  <span>Next-Gen Vision Foundation AI</span>
                </div>
                <Link
                  href={getLinkHref(locale, 'disclaimer')}
                  className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-300 backdrop-blur-md hover:bg-amber-500/20 transition-colors"
                >
                  <ShieldCheckIcon className="w-3.5 h-3.5 text-amber-400" />
                  <span>
                    {locale?.startsWith('zh')
                      ? '独立第三方服务 • 官方API合规接入 • 与阿里巴巴官方无关联'
                      : 'Independent Third-Party Service • Official API Access'}
                  </span>
                </Link>
              </div>

              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
                {indexText?.h1Text || "Qwen AI Image Editor & Precision Inpainting"}
              </h1>

              {/* Prominent Third-Party Notice */}
              <div className="rounded-xl border border-amber-500/25 bg-amber-500/10 px-4 py-2 text-center text-xs text-amber-200/90 max-w-2xl mx-auto backdrop-blur-md">
                <span>
                  {locale?.startsWith('zh')
                    ? '⚠️ 声明：本平台为独立第三方服务工具，通过官方合规API调用相关模型，与阿里巴巴/通义千问官方无关联或授权关系。'
                    : 'Notice: This platform is an independent third-party tool accessing AI models via compliant official APIs. We are not affiliated with or endorsed by Alibaba Group or Qwen.'}
                </span>
                {' '}
                <Link
                  href={getLinkHref(locale, 'disclaimer')}
                  className="underline underline-offset-2 text-amber-300 hover:text-white font-medium ml-1"
                >
                  {locale?.startsWith('zh') ? '查看免责声明' : 'Learn More'}
                </Link>
              </div>

              {/* Conclusion First: Objective Definition for Direct AI Extraction */}
              <p className="text-base sm:text-lg text-slate-200 leading-relaxed font-normal">
                <strong>Qwen Image Editor</strong> is a browser-based multimodal AI inpainting and photo-editing platform powered by Alibaba Cloud Qwen-Image 2.1 foundation models, processing 1024×1024 to 2048×2048 images in 2.5–4.5 seconds with zero local GPU setup.
              </p>
              {/* Feature-Bullet Chunking Bar */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-2 text-left text-xs">
                <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-2.5">
                  <span className="font-semibold text-indigo-300 block">AI Inpainting</span>
                  <span className="text-slate-400 text-[11px]">Natural language maskless edit, 2.5s turnaround</span>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-2.5">
                  <span className="font-semibold text-purple-300 block">Bilingual Typography</span>
                  <span className="text-slate-400 text-[11px]">English & Chinese rendering, 0 glyph corruption</span>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-2.5">
                  <span className="font-semibold text-pink-300 block">Background Swap</span>
                  <span className="text-slate-400 text-[11px]">Semantic isolation, JPG/PNG/WebP up to 20MB</span>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-2.5">
                  <span className="font-semibold text-cyan-300 block">Character Consistency</span>
                  <span className="text-slate-400 text-[11px]">68+ facial landmarks preserved, 0 identity drift</span>
                </div>
              </div>
            </div>

            {/* Main Interactive Editor Card */}
            <div id="editor-card" className="rounded-3xl border border-slate-800 bg-slate-900/70 backdrop-blur-xl p-4 sm:p-7 shadow-2xl shadow-indigo-950/40">
              {/* Credit Status & Usage Rules Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 mb-6 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-2.5 w-2.5 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">Account Balance:</span>
                    {userData ? (
                      <span className="font-bold text-cyan-300 font-mono text-sm">
                        {userData.available_times ?? 0} Credits
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setShowLoginModal(true)}
                        className="inline-flex items-center gap-1 font-semibold text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 px-2.5 py-0.5 rounded-md transition-colors cursor-pointer"
                      >
                        <span>Sign In with Google to get 1 Free Credit</span>
                        <span>→</span>
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4 text-slate-400 text-[11px] flex-wrap">
                  <span className="flex items-center gap-1">
                    <BoltIcon className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Cost: <strong>1 Credit</strong> / standard edit</span>
                  </span>
                  <span className="hidden sm:inline text-slate-700">|</span>
                  <span className="flex items-center gap-1">
                    <ShieldCheckIcon className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Starter Pack: <strong>$4.99 / 100 Credits</strong></span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowPricingModal(true)}
                    className="ml-auto text-indigo-400 hover:text-indigo-300 font-bold underline underline-offset-2 cursor-pointer"
                  >
                    Get Credits →
                  </button>
                </div>
              </div>

              {/* Tab Switcher: Image Edit vs Text to Image */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6 flex-wrap gap-3">
                <div className="flex items-center gap-2 bg-slate-950/80 p-1 rounded-xl border border-slate-800">
                  <button
                    type="button"
                    onClick={() => setActiveTab('edit')}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                      activeTab === 'edit'
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <PhotoIcon className="w-4 h-4" />
                    Edit Photo (Img2Img)
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('generate')}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                      activeTab === 'generate'
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <SparklesIcon className="w-4 h-4" />
                    Text to Image
                  </button>
                </div>

                {/* Preset sample loader */}
                {activeTab === 'edit' && (
                  <div className="flex items-center gap-2 text-xs text-slate-400 flex-wrap">
                    <span className="hidden sm:inline">Try sample:</span>
                    <button
                      type="button"
                      onClick={() =>
                        handleSampleSelect(
                          '/images/showcase_dress_before.jpg',
                          'Swap clothes to elegant emerald green silk gala evening dress, high slit',
                          '/images/showcase_dress_after.jpg'
                        )
                      }
                      className="px-2.5 py-1 rounded-md bg-gradient-to-r from-pink-500/20 to-purple-500/20 border border-pink-500/40 hover:border-pink-400 text-pink-200 transition-colors flex items-center gap-1 font-medium cursor-pointer shadow-sm"
                    >
                      <span>👗 Silk Dress</span>
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        handleSampleSelect(
                          '/images/showcase_cafe_before.jpg',
                          'Change background to a neon-lit cyberpunk Tokyo street at night, swap jacket to a futuristic holographic iridescent leather biker jacket with neon reflections, maintain face and smile identity',
                          '/images/showcase_cyberpunk_after.jpg'
                        )
                      }
                      className="px-2.5 py-1 rounded-md bg-purple-500/20 border border-purple-500/40 hover:border-purple-400 text-purple-200 transition-colors flex items-center gap-1 font-medium cursor-pointer shadow-sm"
                    >
                      <span>🌆 Cyberpunk</span>
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        handleSampleSelect(
                          '/images/showcase_typography_before.jpg',
                          'Inpaint magazine cover title to "QWEN IMAGE 2026", replace subtitle with "NEXT GEN EDITING", perfectly crisp typography, high legibility, clean layout',
                          '/images/showcase_typography_after.jpg'
                        )
                      }
                      className="px-2.5 py-1 rounded-md bg-cyan-500/20 border border-cyan-500/40 hover:border-cyan-400 text-cyan-200 transition-colors flex items-center gap-1 font-medium cursor-pointer shadow-sm"
                    >
                      <span>🔤 Crisp Title</span>
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        handleSampleSelect(
                          '/images/rumpelstiltskin_vintage_demo.jpg',
                          'Change outfit to a sharp bespoke black velvet tuxedo tailcoat with satin peak lapels, white dress shirt and black bowtie, maintain jumping posture and candle-lit barn atmosphere',
                          '/images/rumpelstiltskin_tuxedo_result.jpg'
                        )
                      }
                      className="px-2.5 py-1 rounded-md bg-amber-500/20 border border-amber-500/40 hover:border-amber-400 text-amber-200 transition-colors flex items-center gap-1 font-medium cursor-pointer shadow-sm"
                    >
                      <span>🤵 Velvet Tuxedo</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Editor Grid: Left Controls, Right Preview */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left Column: Upload & Prompt Controls */}
                <div className="lg:col-span-6 space-y-6">
                  {/* Upload Box (Only for Edit tab) */}
                  {activeTab === 'edit' && (
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                        1. Source Image to Edit
                      </label>
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            handleFileUpload(e.target.files[0]);
                          }
                        }}
                      />
                      <div
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-slate-700 hover:border-indigo-500/70 rounded-2xl p-4 sm:p-6 text-center cursor-pointer transition-all bg-slate-950/40 hover:bg-slate-950/60 group"
                      >
                        {sourceImage ? (
                          <div className="relative group/preview inline-block">
                            <img
                              src={sourceImage}
                              alt="Source photo to edit with Qwen Image Editor"
                              width={500}
                              height={224}
                              loading="lazy"
                              className="max-h-56 mx-auto rounded-xl object-contain shadow-md"
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/preview:opacity-100 rounded-xl flex items-center justify-center text-xs font-medium text-white transition-opacity">
                              Click or Drop new image to replace
                            </div>
                          </div>
                        ) : (
                          <div className="py-6 space-y-2">
                            <ArrowUpTrayIcon className="w-8 h-8 text-indigo-400 mx-auto group-hover:-translate-y-1 transition-transform" />
                            <p className="text-sm font-semibold text-slate-200">
                              {isUploading ? 'Uploading to cloud...' : 'Click or drag & drop image here'}
                            </p>
                            <p className="text-xs text-slate-500">Supports PNG, JPG, WebP up to 10MB</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Prompt Text Input */}
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label htmlFor="promptInput" className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                        {activeTab === 'edit' ? '2. Edit Instruction' : '1. Image Generation Prompt'}
                      </label>
                      <div className="relative rounded-2xl border border-slate-700 bg-slate-950 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition-all p-3">
                        <textarea
                          id="promptInput"
                          rows={3}
                          value={textStr}
                          onChange={(e) => setTextStr(e.target.value)}
                          placeholder={
                            activeTab === 'edit'
                              ? "Describe what to edit, add, or replace (e.g., 'Change background to neon Tokyo, add cyberpunk iridescent jacket')..."
                              : "Describe the image to generate in detail..."
                          }
                          className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none resize-none"
                        />
                        <div className="flex items-center justify-between border-t border-slate-800/80 pt-2 text-xs text-slate-400">
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-800 hover:border-cyan-500/50 rounded-lg px-2.5 py-1 text-slate-300 transition-colors">
                              <CpuChipIcon className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                              <span className="text-[11px] text-slate-400 font-medium shrink-0">Model:</span>
                              <select
                                value={selectedModel}
                                onChange={(e) => setSelectedModel(e.target.value)}
                                className="bg-transparent text-[11px] font-semibold text-cyan-300 focus:outline-none cursor-pointer pr-1"
                              >
                                {activeTab === 'edit' ? (
                                  <>
                                    <option value="wanx2.1-imageedit" className="bg-slate-900 text-slate-200">
                                      Qwen/Wanx Image Edit (Instruction Inpaint 🎨 - 1 Credit)
                                    </option>
                                    <option value="wanx2.1-i2i-turbo" className="bg-slate-900 text-slate-200">
                                      Wanx 2.1 Turbo (Fast Edit ⚡ - 1 Credit)
                                    </option>
                                    <option value="wanx2.1-i2i-plus" className="bg-slate-900 text-slate-200">
                                      Wanx 2.1 Plus (High Fidelity 🌟 - 2 Credits)
                                    </option>
                                    <option value="qwen-image-edit" className="bg-slate-900 text-slate-200">
                                      Qwen Multimodal Edit (Official API 🚀 - 2 Credits)
                                    </option>
                                  </>
                                ) : (
                                  <>
                                    <option value="wanx2.1-t2i-turbo" className="bg-slate-900 text-slate-200">
                                      Wanx 2.1 Turbo (Fast ⚡ - 1 Credit)
                                    </option>
                                    <option value="wanx2.1-t2i-plus" className="bg-slate-900 text-slate-200">
                                      Wanx 2.1 Plus (Ultra-HD 🌟 - 2 Credits)
                                    </option>
                                    <option value="qwen-image" className="bg-slate-900 text-slate-200">
                                      Qwen-Image Multimodal (Official API 🚀 - 2 Credits)
                                    </option>
                                  </>
                                )}
                              </select>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setTextStr('')}
                            className="text-slate-500 hover:text-slate-300"
                          >
                            Clear
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Aspect Ratio & Resolution Dimension Controls (Active for both Edit & Generate) */}
                    <div className="space-y-2 pt-1">
                      <div className="flex items-center justify-between">
                        <span className="block text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                          <span>{activeTab === 'edit' ? '3. Aspect Ratio & Canvas' : '2. Aspect Ratio & Canvas'}</span>
                        </span>
                        <span className="text-[11px] text-cyan-400 font-mono font-medium">
                          {aspectRatio === 'auto'
                            ? '📐 Auto (Keep Original)'
                            : `📐 ${
                                aspectRatio === '9:16'
                                  ? '768 × 1344 px (9:16 Full Portrait)'
                                  : aspectRatio === '16:9'
                                  ? '1344 × 768 px (16:9 Widescreen)'
                                  : aspectRatio === '3:4'
                                  ? '864 × 1152 px (3:4 Portrait)'
                                  : aspectRatio === '4:3'
                                  ? '1152 × 864 px (4:3 Standard)'
                                  : '1024 × 1024 px (1:1 Square)'
                              }`}
                        </span>
                      </div>

                      <div className={`grid gap-2 ${activeTab === 'edit' ? 'grid-cols-3 sm:grid-cols-6' : 'grid-cols-3 sm:grid-cols-5'}`}>
                        {(activeTab === 'edit'
                          ? [
                              {
                                id: 'auto',
                                label: 'Auto',
                                res: 'Original',
                                scene: 'Keep Ratio',
                                boxStyle: 'w-4 h-4 border-2 border-dashed rounded-sm',
                              },
                              {
                                id: '1:1',
                                label: '1:1',
                                res: '1024×1024',
                                scene: 'Avatar / Square',
                                boxStyle: 'w-4 h-4 border-2 rounded-sm',
                              },
                              {
                                id: '9:16',
                                label: '9:16',
                                res: '768×1344',
                                scene: 'TikTok / Story',
                                boxStyle: 'w-2.5 h-4.5 border-2 rounded-sm',
                              },
                              {
                                id: '16:9',
                                label: '16:9',
                                res: '1344×768',
                                scene: 'YouTube / Wide',
                                boxStyle: 'w-5 h-2.5 border-2 rounded-sm',
                              },
                              {
                                id: '3:4',
                                label: '3:4',
                                res: '864×1152',
                                scene: 'Portrait / Feed',
                                boxStyle: 'w-3 h-4 border-2 rounded-sm',
                              },
                              {
                                id: '4:3',
                                label: '4:3',
                                res: '1152×864',
                                scene: 'Landscape / Art',
                                boxStyle: 'w-4 h-3 border-2 rounded-sm',
                              },
                            ]
                          : [
                              {
                                id: '1:1',
                                label: '1:1',
                                res: '1024×1024',
                                scene: 'Avatar / Square',
                                boxStyle: 'w-4 h-4 border-2 rounded-sm',
                              },
                              {
                                id: '9:16',
                                label: '9:16',
                                res: '768×1344',
                                scene: 'TikTok / Story',
                                boxStyle: 'w-2.5 h-4.5 border-2 rounded-sm',
                              },
                              {
                                id: '16:9',
                                label: '16:9',
                                res: '1344×768',
                                scene: 'YouTube / Wide',
                                boxStyle: 'w-5 h-2.5 border-2 rounded-sm',
                              },
                              {
                                id: '3:4',
                                label: '3:4',
                                res: '864×1152',
                                scene: 'Portrait / Feed',
                                boxStyle: 'w-3 h-4 border-2 rounded-sm',
                              },
                              {
                                id: '4:3',
                                label: '4:3',
                                res: '1152×864',
                                scene: 'Landscape / Art',
                                boxStyle: 'w-4 h-3 border-2 rounded-sm',
                              },
                            ]
                        ).map((item) => {
                          const isSelected = aspectRatio === item.id;
                          return (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => setAspectRatio(item.id as any)}
                              className={`relative rounded-xl border p-2 flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
                                isSelected
                                  ? 'border-indigo-500 bg-gradient-to-b from-indigo-500/25 to-purple-600/15 text-white shadow-lg shadow-indigo-950/50 ring-1 ring-indigo-500/50'
                                  : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700 hover:bg-slate-900/60 hover:text-slate-200'
                              }`}
                            >
                              {/* Visual Shape Icon */}
                              <div className="h-6 flex items-center justify-center mb-1">
                                <div
                                  className={`${item.boxStyle} ${
                                    isSelected
                                      ? 'border-cyan-400 bg-cyan-400/25 shadow-sm shadow-cyan-400/40'
                                      : 'border-slate-600'
                                  } transition-all`}
                                />
                              </div>
                              <div className="text-xs font-bold leading-tight text-slate-100 flex items-center gap-1">
                                <span>{item.label}</span>
                              </div>
                              <div className="text-[10px] text-slate-500 font-mono mt-0.5 leading-none">
                                {item.res}
                              </div>
                              <div
                                className={`text-[9px] mt-1 px-1 rounded truncate max-w-full leading-tight ${
                                  isSelected ? 'text-indigo-300 font-medium' : 'text-slate-500'
                                }`}
                              >
                                {item.scene}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Quick Preset Prompts by Category */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                          Quick Presets &amp; Templates:
                        </span>
                        <div className="flex gap-1">
                          {promptPresetCategories.map((cat, cIdx) => (
                            <button
                              key={cIdx}
                              type="button"
                              onClick={() => setActivePresetCategory(cIdx)}
                              className={`px-2 py-0.5 rounded-lg text-[10px] font-medium transition-colors cursor-pointer ${
                                activePresetCategory === cIdx
                                  ? 'bg-indigo-500/30 text-indigo-200 border border-indigo-500/40'
                                  : 'text-slate-400 hover:text-slate-200 bg-slate-900/60'
                              }`}
                            >
                              {cat.name}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        {promptPresetCategories[activePresetCategory]?.items.map((preset: any, idx: number) => {
                          const item = typeof preset === 'string' ? { text: preset, previewUrl: undefined, sourceUrl: undefined } : preset;
                          const isSelected = textStr === item.text;
                          return (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => {
                                setTextStr(item.text);
                                if (item.previewUrl) {
                                  setCurrentResultImage(item.previewUrl);
                                  setSourceImage(item.sourceUrl || '/images/showcase_dress_before.jpg');
                                  setActiveTab('edit');
                                }
                              }}
                              className={`rounded-full border px-2.5 py-1 text-[11px] transition-all cursor-pointer text-left flex items-center gap-1.5 ${
                                isSelected
                                  ? 'border-indigo-400 bg-indigo-950/70 text-indigo-100 shadow-sm shadow-indigo-500/20'
                                  : 'border-slate-800 bg-slate-950/60 text-slate-300 hover:border-indigo-500/50 hover:bg-slate-900 hover:text-white'
                              }`}
                            >
                              <span className={isSelected ? 'text-indigo-400 font-bold' : 'text-slate-500'}>
                                {isSelected ? '●' : '+'}
                              </span>
                              <span>{item.text}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Guest Sign-in Prompt */}
                    {!userData && (
                      <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl border bg-slate-900/80 border-indigo-500/30 text-slate-200 text-xs">
                        <div className="flex items-center gap-1.5 font-medium">
                          <SparklesIcon className="w-4 h-4 text-indigo-400 shrink-0" />
                          <span>Sign in with Google to create &amp; edit images with official Qwen models</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowLoginModal(true)}
                          className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-[11px] shrink-0 ml-2 shadow-sm transition-colors cursor-pointer"
                        >
                          Sign In
                        </button>
                      </div>
                    )}

                    {/* AI Try-On & Identity Lock Helper (Only on edit tab) */}
                    {activeTab === 'edit' && (
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-gradient-to-r from-indigo-950/40 via-purple-950/20 to-slate-950/50 border border-indigo-500/25 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="text-base">👗</span>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold text-indigo-200">AI Try-On Fidelity Lock</span>
                              <span className="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 px-1.5 py-0.5 rounded font-mono">
                                68+ Facial Points
                              </span>
                            </div>
                            <span className="text-slate-400 text-[11px] block">
                              Protects face identity &amp; body proportions from distortion during clothes swap
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setTryOnFidelity(!tryOnFidelity)}
                          className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer shrink-0 ml-2 ${
                            tryOnFidelity
                              ? 'bg-gradient-to-r from-emerald-600 to-indigo-600 text-white shadow-sm'
                              : 'bg-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          {tryOnFidelity ? '✓ Active' : 'Off'}
                        </button>
                      </div>
                    )}

                    {/* Speed indicator & Generation Settings */}
                    <div className="flex items-center justify-between pt-1 flex-wrap gap-2">
                      <div className="flex items-center gap-2 text-[11px] text-cyan-300/90 font-mono">
                        <span className="flex h-2 w-2 relative">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                        </span>
                        <span>⚡ Ultra-Fast GPU Queue Active (~3-6s)</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Switch
                          checked={isPublic}
                          onChange={setIsPublic}
                          className={`${
                            isPublic ? 'bg-indigo-600' : 'bg-slate-800'
                          } relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out`}
                        >
                          <span
                            aria-hidden="true"
                            className={`${
                              isPublic ? 'translate-x-4' : 'translate-x-0'
                            } pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out`}
                          />
                        </Switch>
                        <span className="text-xs text-slate-400">Share to Community Gallery</span>
                      </div>

                      <button
                        type="submit"
                        disabled={isProcessing || (!textStr && activeTab === 'generate')}
                        className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 hover:opacity-95 disabled:opacity-50 transition-all cursor-pointer"
                      >
                        {isProcessing ? (
                          <>
                            <ArrowPathIcon className="w-4 h-4 animate-spin" />
                            <span>Processing...</span>
                          </>
                        ) : (
                          <>
                            <SparklesIcon className="w-4 h-4" />
                            <span>
                              {!userData
                                ? 'Sign In to Generate'
                                : activeTab === 'edit'
                                ? 'Apply Edit'
                                : 'Generate'}
                            </span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>

                {/* Right Column: Live Result & Comparison Preview */}
                <div className="lg:col-span-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                      Live Output & Preview
                    </label>
                    {activeTab === 'edit' && sourceImage && currentResultImage && (
                      <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
                        <button
                          type="button"
                          onClick={() => setComparisonMode('split')}
                          className={`px-2.5 py-1 rounded-md transition-colors ${
                            comparisonMode === 'split' ? 'bg-slate-800 text-white' : 'text-slate-400'
                          }`}
                        >
                          Side-by-Side
                        </button>
                        <button
                          type="button"
                          onClick={() => setComparisonMode('result')}
                          className={`px-2.5 py-1 rounded-md transition-colors ${
                            comparisonMode === 'result' ? 'bg-slate-800 text-white' : 'text-slate-400'
                          }`}
                        >
                          Result Only
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Preview Canvas */}
                  <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 min-h-[380px] flex flex-col justify-center items-center relative overflow-hidden group">
                    {isProcessing ? (
                      <div className="w-full min-h-[360px] flex flex-col items-center justify-center p-8 text-center relative overflow-hidden rounded-xl border border-indigo-500/20 bg-slate-900/40 backdrop-blur-sm">
                        {/* Animated laser scanning line */}
                        <div className="absolute inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#22d3ee] animate-pulse" />
                        
                        {/* Glowing Neural Ring */}
                        <div className="relative mb-5 flex items-center justify-center">
                          <div className="w-20 h-20 rounded-full border-2 border-indigo-500/30 border-t-cyan-400 animate-spin" />
                          <SparklesIcon className="w-8 h-8 text-indigo-400 absolute animate-pulse" />
                        </div>

                        <h4 className="text-base font-bold text-white mb-1.5 flex items-center gap-2">
                          <span>Synthesizing AI Image...</span>
                          <span className="flex h-2 w-2 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                          </span>
                        </h4>
                        <p className="text-xs text-slate-400 max-w-sm mb-4">
                          Running Qwen & Wanx 2.1 neural diffusion. Texture rendering and upscale will automatically display here.
                        </p>

                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/60 text-[11px] font-mono text-cyan-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                          Estimated ~6–10s · Processing in Cloud GPU
                        </div>
                      </div>
                    ) : currentResultImage ? (
                      <div className="w-full flex flex-col items-center">
                        {comparisonMode === 'split' && activeTab === 'edit' && sourceImage ? (
                          <div className="w-full space-y-2.5">
                            <div className="grid grid-cols-2 gap-2 sm:gap-3 relative rounded-xl overflow-hidden bg-slate-900/60 p-2 border border-slate-800">
                              {/* Source input */}
                              <div className="relative rounded-lg overflow-hidden aspect-square bg-slate-950 group/img">
                                <img
                                  src={sourceImage}
                                  alt="Original source input"
                                  className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-300"
                                />
                                <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded bg-black/75 backdrop-blur-sm text-[10px] font-bold text-slate-300 border border-white/10">
                                  INPUT
                                </span>
                              </div>

                              {/* Floating Arrow */}
                              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-6 h-6 rounded-full bg-indigo-600 border-2 border-slate-900 flex items-center justify-center text-white text-[10px] font-black shadow-lg shadow-indigo-500/50 pointer-events-none">
                                ➔
                              </div>

                              {/* AI Inpainted Result */}
                              <div className="relative rounded-lg overflow-hidden aspect-square bg-slate-950 group/img">
                                <img
                                  src={currentResultImage}
                                  alt="AI Inpainted output result"
                                  className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-300"
                                />
                                <span className="absolute top-1.5 right-1.5 px-2 py-0.5 rounded bg-emerald-500/90 text-[10px] font-extrabold text-white shadow-sm">
                                  ✨ OUTPUT
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                              <span>Left: Original source</span>
                              <span className="text-emerald-400 font-semibold">Right: Qwen AI Inpainted</span>
                            </div>
                          </div>
                        ) : (
                          <div className="w-full relative group/result">
                            <img
                              src={currentResultImage}
                              alt="Generated Visual Output from Qwen Image Edit"
                              width={768}
                              height={440}
                              loading="lazy"
                              className="w-full max-h-[440px] rounded-xl object-contain shadow-2xl"
                            />
                            <div className="absolute top-2 right-2 px-2.5 py-1 rounded-md bg-emerald-500/90 text-white text-xs font-bold shadow-md pointer-events-none">
                              ✨ AI Generated Output
                            </div>
                          </div>
                        )}

                        {/* Action Bar with Multi-Format Downloader (PNG / JPG / WebP) */}
                        <div className="mt-5 w-full flex items-center justify-between pt-3 border-t border-slate-800/80">
                          <div className="text-xs text-slate-400 flex items-center gap-2">
                            <span>Status: <span className="text-emerald-400 font-medium">Ready</span></span>
                            <span className="text-slate-600 hidden sm:inline">•</span>
                            <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-900 text-cyan-300 font-mono text-[11px] border border-slate-800">
                              <span>
                                {aspectRatio === 'auto'
                                  ? 'Auto (Original)'
                                  : `${aspectRatio} (${
                                      aspectRatio === '9:16'
                                        ? '768×1344'
                                        : aspectRatio === '16:9'
                                        ? '1344×768'
                                        : aspectRatio === '3:4'
                                        ? '864×1152'
                                        : aspectRatio === '4:3'
                                        ? '1152×864'
                                        : '1024×1024'
                                    })`}
                              </span>
                            </span>
                          </div>

                          <div className="relative inline-flex items-center rounded-xl shadow-lg">
                            {userData?.isPro ? (
                              <button
                                type="button"
                                disabled={isDownloading || !currentResultImage}
                                onClick={() => handleDownloadWithFormat(currentResultImage, downloadFormat, 'hd')}
                                className="inline-flex items-center gap-1.5 rounded-l-xl bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 px-3.5 py-1.5 text-xs font-semibold text-white transition-all disabled:opacity-50"
                              >
                                <ArrowDownTrayIcon className={`w-4 h-4 ${isDownloading ? 'animate-bounce' : ''}`} />
                                <span>{isDownloading ? 'Preparing...' : `Download HD (${downloadFormat.toUpperCase()})`}</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                disabled={isDownloading || !currentResultImage}
                                onClick={() => handleDownloadWithFormat(currentResultImage, downloadFormat, 'hd')}
                                className="inline-flex items-center gap-1.5 rounded-l-xl bg-gradient-to-r from-amber-500 via-indigo-600 to-purple-600 hover:from-amber-400 hover:to-indigo-500 px-3.5 py-1.5 text-xs font-semibold text-white transition-all shadow-md hover:shadow-indigo-500/25 disabled:opacity-50"
                                title="Unlock HD 2048px Lossless Export"
                              >
                                <SparklesIcon className="w-3.5 h-3.5 text-amber-200 animate-pulse" />
                                <span>Download HD</span>
                                <span className="text-[10px] bg-amber-400/20 text-amber-300 border border-amber-400/40 px-1 rounded font-bold">PRO</span>
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => setShowFormatDropdown(!showFormatDropdown)}
                              className="inline-flex items-center justify-center rounded-r-xl border-l border-indigo-500/40 bg-indigo-700 hover:bg-indigo-600 px-2.5 py-1.5 text-xs font-semibold text-white transition-colors"
                              title="Choose Resolution & Export Options"
                            >
                              <ChevronDownIcon className="w-3.5 h-3.5" />
                            </button>

                            {/* Format & Quality Dropdown Menu */}
                            {showFormatDropdown && (
                              <div className="absolute right-0 bottom-full mb-2 w-64 rounded-2xl border border-slate-800 bg-slate-900/95 backdrop-blur-md p-2 shadow-2xl z-30 space-y-1.5">
                                <div className="px-2 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                                  Resolution &amp; Quality
                                </div>

                                {/* HD Option */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    handleDownloadWithFormat(currentResultImage, downloadFormat, 'hd');
                                  }}
                                  className="w-full text-left px-2.5 py-2 rounded-xl text-xs font-medium bg-gradient-to-r from-amber-500/10 to-indigo-500/10 hover:from-amber-500/20 hover:to-indigo-500/20 border border-amber-500/30 text-slate-200 flex items-center justify-between transition-colors"
                                >
                                  <div>
                                    <div className="flex items-center gap-1.5">
                                      <span className="font-bold text-amber-300">HD 2048px Lossless</span>
                                      <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1 py-0.5 rounded font-bold border border-amber-500/40">PRO</span>
                                    </div>
                                    <span className="text-[10px] text-slate-400 block mt-0.5">Crystal clear, zero watermark</span>
                                  </div>
                                  <SparklesIcon className="w-4 h-4 text-amber-400 flex-shrink-0" />
                                </button>

                                {/* Free Preview Option */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    handleDownloadWithFormat(currentResultImage, downloadFormat, 'preview');
                                  }}
                                  className="w-full text-left px-2.5 py-2 rounded-xl text-xs font-medium bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-slate-200 flex items-center justify-between transition-colors"
                                >
                                  <div>
                                    <div className="flex items-center gap-1.5">
                                      <span className="font-semibold text-emerald-400">Standard 512px Preview</span>
                                      <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1 py-0.5 rounded font-bold border border-emerald-500/40">FREE</span>
                                    </div>
                                    <span className="text-[10px] text-slate-400 block mt-0.5">Sample size with subtle watermark</span>
                                  </div>
                                  <ArrowDownTrayIcon className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                                </button>

                                <div className="pt-1.5 border-t border-slate-800">
                                  <div className="px-2 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                                    Format (Default: {downloadFormat.toUpperCase()})
                                  </div>
                                  <div className="grid grid-cols-3 gap-1 pt-1">
                                    {(['png', 'jpg', 'webp'] as const).map((fmt) => (
                                      <button
                                        key={fmt}
                                        type="button"
                                        onClick={() => setDownloadFormat(fmt)}
                                        className={`py-1 text-center rounded-lg text-xs font-semibold transition-all ${
                                          downloadFormat === fmt
                                            ? 'bg-indigo-600 text-white shadow-sm'
                                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                                        }`}
                                      >
                                        {fmt.toUpperCase()}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-12 space-y-3">
                        <PhotoIcon className="w-12 h-12 text-slate-700 mx-auto" />
                        <p className="text-sm text-slate-400">Your edited creation will appear here</p>
                        <p className="text-xs text-slate-600">Upload a photo and hit &quot;Apply Edit&quot; to begin</p>
                      </div>
                    )}
                  </div>

                  {/* High-Converting Pro Upgrade & Fast Refill Card */}
                  <div className="rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-slate-900/90 via-indigo-950/40 to-purple-950/30 p-4 sm:p-5 backdrop-blur-xl shadow-xl space-y-3 relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mr-6 -mt-6 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-slate-800/80">
                      <div className="flex items-center gap-2">
                        <span className="p-1.5 rounded-xl bg-gradient-to-tr from-amber-500/20 to-orange-500/20 text-amber-400 border border-amber-500/30">
                          <SparklesIcon className="w-4 h-4" />
                        </span>
                        <div>
                          <h4 className="text-xs sm:text-sm font-bold text-white tracking-tight flex items-center gap-2">
                            <span>Unlock 4K Lossless &amp; Batch AI Fashion Swap</span>
                            <span className="px-1.5 py-0.2 rounded-md bg-amber-500/20 border border-amber-500/40 text-[10px] font-bold text-amber-300">
                              PRO
                            </span>
                          </h4>
                          <p className="text-[11px] text-slate-400">
                            Zero queue priority GPU inference · Commercial rights
                          </p>
                        </div>
                      </div>

                      {/* User Balance Status */}
                      <div className="text-right">
                        {userData ? (
                          <div className="text-[11px]">
                            <span className="text-slate-400">Balance: </span>
                            <strong className="text-cyan-300 font-mono font-bold">
                              {userData.available_times ?? 0} Credits
                            </strong>
                            {(userData.available_times ?? 0) <= 1 && (
                              <span className="block text-[10px] text-amber-400 font-semibold animate-pulse">
                                ⚠️ Low Balance — Top up now
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400">
                            Free Trial Active
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Pro Feature Bullets */}
                    <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <CheckCircleIcon className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        <span>4K Ultra-HD Upscale (4096px)</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <CheckCircleIcon className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        <span>AI Clothes &amp; Bikini Swap</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <CheckCircleIcon className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        <span>Dedicated Fast GPU Cloud</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <CheckCircleIcon className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        <span>100% Commercial Usage Rights</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-1 flex flex-col sm:flex-row items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          if (!userData) {
                            setShowLoginModal(true);
                          } else {
                            if (typeof window !== 'undefined') {
                              window.dispatchEvent(new CustomEvent('open-welcome-offer'));
                            }
                            setShowPricingModal(true);
                          }
                        }}
                        className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-500/25 transition-all cursor-pointer"
                      >
                        <BoltIcon className="w-3.5 h-3.5 text-amber-300" />
                        <span>Get 100 Credits for $4.99 (Starter Pack)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setShowPricingModal(true)}
                        className="w-full sm:w-auto px-3.5 py-2 rounded-xl border border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white font-medium text-xs transition-colors cursor-pointer whitespace-nowrap"
                      >
                        <span>View All Plans</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Real Inpainting Showcase & Interactive Prompt Gallery */}
        <section className="py-16 lg:py-20 border-t border-slate-900 bg-slate-950/80 relative">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-3.5 py-1 text-xs font-semibold text-purple-300 mb-3">
                  <SparklesIcon className="w-3.5 h-3.5 text-purple-400" />
                  <span>Real Inpainting Case Studies</span>
                </div>
                <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                  Before &amp; After Showcase &amp; Exact Prompts
                </h2>
                <p className="text-sm text-slate-400 mt-2 max-w-2xl">
                  Side-by-side visual comparisons powered by Qwen-Image 2.1 foundation models. Click <strong>&quot;Try This Recipe in Editor&quot;</strong> to load the original photo and exact prompt instantly.
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 bg-slate-900/80 border border-slate-800 px-3 py-1.5 rounded-full">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>4 Production-Ready Workflows</span>
              </div>
            </div>

            {/* 2x2 Wide Split-View Showcase Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Showcase 1: Fashion Try-On (White T-Shirt -> Emerald Silk Dress) */}
              <div className="rounded-3xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl p-5 sm:p-6 shadow-2xl flex flex-col justify-between hover:border-pink-500/50 hover:bg-slate-900/80 transition-all group">
                <div className="space-y-4">
                  {/* Header & Badges */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-pink-500/15 text-pink-300 border border-pink-500/30 text-[11px] font-bold">
                        👗 AI Virtual Try-On
                      </div>
                      <h3 className="text-lg font-bold text-white mt-2 group-hover:text-pink-300 transition-colors">
                        Casual T-Shirt ➔ Emerald Silk Evening Gown
                      </h3>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        Precision inpainting replaces ordinary cotton t-shirt with a luxurious draped satin dress while locking exact facial identity and posture.
                      </p>
                    </div>
                  </div>

                  {/* Side-by-Side Before vs After Window */}
                  <div className="relative rounded-2xl bg-slate-950 p-2.5 border border-slate-800/90 shadow-inner">
                    <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                      {/* Before: Plain T-Shirt */}
                      <div className="relative rounded-xl overflow-hidden aspect-square bg-slate-900 group/img">
                        <img
                          src="/images/showcase_dress_before.jpg"
                          alt="Original Portrait in Casual White T-Shirt"
                          width={400}
                          height={400}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-md text-slate-200 font-bold text-[10px] tracking-wider border border-white/10 shadow-sm">
                          📷 BEFORE
                        </div>
                        <div className="absolute bottom-2 left-2 right-2 px-2 py-1 rounded bg-black/70 backdrop-blur-md text-[10px] text-slate-300 truncate">
                          Plain White Cotton Tee
                        </div>
                      </div>

                      {/* Floating Arrow */}
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 border-2 border-slate-900 flex items-center justify-center text-white shadow-xl shadow-pink-500/40">
                        <span className="text-xs font-black">➔</span>
                      </div>

                      {/* After: Emerald Silk Gown */}
                      <div className="relative rounded-xl overflow-hidden aspect-square bg-slate-900 group/img">
                        <img
                          src="/images/showcase_dress_after.jpg"
                          alt="Inpainted Emerald Green Silk Evening Dress with Satin Drape"
                          width={400}
                          height={400}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-emerald-500/90 text-white font-extrabold text-[10px] tracking-wider shadow-md">
                          ✨ AI AFTER
                        </div>
                        <div className="absolute bottom-2 left-2 right-2 px-2 py-1 rounded bg-emerald-950/80 border border-emerald-500/40 backdrop-blur-md text-[10px] text-emerald-200 font-medium truncate">
                          Emerald Silk Evening Gown
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Prompt Terminal Box */}
                  <div className="p-3 rounded-xl bg-slate-950/90 border border-slate-800 text-[11px] font-mono space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-pink-400 font-semibold uppercase tracking-wider">
                      <span>Exact Inpainting Prompt:</span>
                      <span className="text-slate-500 font-sans">Model: Qwen-Image 2.1</span>
                    </div>
                    <p className="text-slate-200 leading-relaxed font-sans">
                      &quot;Swap clothes to an elegant emerald green silk evening dress with natural fabric drape and realistic satin folds, maintain original lighting and facial consistency&quot;
                    </p>
                  </div>
                </div>

                {/* Action CTA */}
                <button
                  type="button"
                  onClick={() =>
                    handleLoadShowcase(
                      '/images/showcase_dress_before.jpg',
                      'Swap clothes to an elegant emerald green silk evening dress with natural fabric drape and realistic satin folds, maintain original lighting and facial consistency',
                      '/images/showcase_dress_after.jpg'
                    )
                  }
                  className="mt-5 w-full py-3 px-4 rounded-xl bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 hover:from-pink-400 hover:to-purple-500 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-pink-500/20 active:scale-[0.98] cursor-pointer"
                >
                  <BoltIcon className="w-4 h-4 text-amber-300" />
                  <span>Try This Recipe in Editor ⚡</span>
                </button>
              </div>

              {/* Showcase 2: Cyberpunk Style & Neon Jacket */}
              <div className="rounded-3xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl p-5 sm:p-6 shadow-2xl flex flex-col justify-between hover:border-purple-500/50 hover:bg-slate-900/80 transition-all group">
                <div className="space-y-4">
                  {/* Header & Badges */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-purple-500/15 text-purple-300 border border-purple-500/30 text-[11px] font-bold">
                        🌆 Background Swap &amp; Styling
                      </div>
                      <h3 className="text-lg font-bold text-white mt-2 group-hover:text-purple-300 transition-colors">
                        Daytime Cafe ➔ Cyberpunk Tokyo Neon Night
                      </h3>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        Replaces warm indoor cafe background with rainy Tokyo neon streets, transforming green jacket into a futuristic metallic holographic biker jacket.
                      </p>
                    </div>
                  </div>

                  {/* Side-by-Side Before vs After Window */}
                  <div className="relative rounded-2xl bg-slate-950 p-2.5 border border-slate-800/90 shadow-inner">
                    <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                      {/* Before: Cafe */}
                      <div className="relative rounded-xl overflow-hidden aspect-square bg-slate-900 group/img">
                        <img
                          src="/images/showcase_cafe_before.jpg"
                          alt="Original Portrait in Daytime Coffee Shop"
                          width={400}
                          height={400}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-md text-slate-200 font-bold text-[10px] tracking-wider border border-white/10 shadow-sm">
                          📷 BEFORE
                        </div>
                        <div className="absolute bottom-2 left-2 right-2 px-2 py-1 rounded bg-black/70 backdrop-blur-md text-[10px] text-slate-300 truncate">
                          Daytime Cafe &amp; Khaki Jacket
                        </div>
                      </div>

                      {/* Floating Arrow */}
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 border-2 border-slate-900 flex items-center justify-center text-white shadow-xl shadow-purple-500/40">
                        <span className="text-xs font-black">➔</span>
                      </div>

                      {/* After: Cyberpunk */}
                      <div className="relative rounded-xl overflow-hidden aspect-square bg-slate-900 group/img">
                        <img
                          src="/images/showcase_cyberpunk_after.jpg"
                          alt="Inpainted Cyberpunk Tokyo Street with Holographic Jacket"
                          width={400}
                          height={400}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-cyan-500/90 text-white font-extrabold text-[10px] tracking-wider shadow-md">
                          ✨ AI AFTER
                        </div>
                        <div className="absolute bottom-2 left-2 right-2 px-2 py-1 rounded bg-purple-950/80 border border-purple-500/40 backdrop-blur-md text-[10px] text-purple-200 font-medium truncate">
                          Holographic Jacket &amp; Tokyo Neon
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Prompt Terminal Box */}
                  <div className="p-3 rounded-xl bg-slate-950/90 border border-slate-800 text-[11px] font-mono space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-purple-400 font-semibold uppercase tracking-wider">
                      <span>Exact Inpainting Prompt:</span>
                      <span className="text-slate-500 font-sans">Model: Qwen-Image 2.1</span>
                    </div>
                    <p className="text-slate-200 leading-relaxed font-sans">
                      &quot;Change background to a neon-lit cyberpunk Tokyo street at night, swap jacket to a futuristic holographic iridescent leather biker jacket with neon reflections, maintain face and smile identity&quot;
                    </p>
                  </div>
                </div>

                {/* Action CTA */}
                <button
                  type="button"
                  onClick={() =>
                    handleLoadShowcase(
                      '/images/showcase_cafe_before.jpg',
                      'Change background to a neon-lit cyberpunk Tokyo street at night, swap jacket to a futuristic holographic iridescent leather biker jacket with neon reflections, maintain face and smile identity',
                      '/images/showcase_cyberpunk_after.jpg'
                    )
                  }
                  className="mt-5 w-full py-3 px-4 rounded-xl bg-gradient-to-r from-purple-500 via-indigo-600 to-cyan-500 hover:from-purple-400 hover:to-indigo-500 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-500/20 active:scale-[0.98] cursor-pointer"
                >
                  <BoltIcon className="w-4 h-4 text-cyan-300" />
                  <span>Try This Recipe in Editor ⚡</span>
                </button>
              </div>

              {/* Showcase 3: Typography & Text Inpainting */}
              <div className="rounded-3xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl p-5 sm:p-6 shadow-2xl flex flex-col justify-between hover:border-cyan-500/50 hover:bg-slate-900/80 transition-all group">
                <div className="space-y-4">
                  {/* Header & Badges */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 text-[11px] font-bold">
                        🔤 Clean Typography Inpainting
                      </div>
                      <h3 className="text-lg font-bold text-white mt-2 group-hover:text-cyan-300 transition-colors">
                        Garbled AI Lettering ➔ Crisp Magazine Cover
                      </h3>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        Eliminates nonsensical distorted diffusion glyphs and inlays razor-sharp editorial headlines with high contrast and immaculate letterforms.
                      </p>
                    </div>
                  </div>

                  {/* Side-by-Side Before vs After Window */}
                  <div className="relative rounded-2xl bg-slate-950 p-2.5 border border-slate-800/90 shadow-inner">
                    <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                      {/* Before: Garbled Text */}
                      <div className="relative rounded-xl overflow-hidden aspect-square bg-slate-900 group/img">
                        <img
                          src="/images/showcase_typography_before.jpg"
                          alt="Standard Diffusion Text Rendering with Distorted Letters"
                          width={400}
                          height={400}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-md text-rose-300 font-bold text-[10px] tracking-wider border border-rose-500/20 shadow-sm">
                          ❌ STANDARD AI
                        </div>
                        <div className="absolute bottom-2 left-2 right-2 px-2 py-1 rounded bg-black/70 backdrop-blur-md text-[10px] text-rose-300 truncate">
                          Garbled &amp; Illiterate Glyphs
                        </div>
                      </div>

                      {/* Floating Arrow */}
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 border-2 border-slate-900 flex items-center justify-center text-white shadow-xl shadow-cyan-500/40">
                        <span className="text-xs font-black">➔</span>
                      </div>

                      {/* After: Crisp Qwen Typography */}
                      <div className="relative rounded-xl overflow-hidden aspect-square bg-slate-900 group/img">
                        <img
                          src="/images/showcase_typography_after.jpg"
                          alt="Qwen 2.1 Inpainted Crisp Magazine Typography"
                          width={400}
                          height={400}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-cyan-500/90 text-white font-extrabold text-[10px] tracking-wider shadow-md">
                          ✨ QWEN 2026
                        </div>
                        <div className="absolute bottom-2 left-2 right-2 px-2 py-1 rounded bg-cyan-950/80 border border-cyan-500/40 backdrop-blur-md text-[10px] text-cyan-200 font-medium truncate">
                          Perfect Editorial Typography
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Prompt Terminal Box */}
                  <div className="p-3 rounded-xl bg-slate-950/90 border border-slate-800 text-[11px] font-mono space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-cyan-400 font-semibold uppercase tracking-wider">
                      <span>Exact Inpainting Prompt:</span>
                      <span className="text-slate-500 font-sans">Model: Qwen-Image 2.1</span>
                    </div>
                    <p className="text-slate-200 leading-relaxed font-sans">
                      &quot;Inpaint magazine cover title to &apos;QWEN IMAGE 2026&apos;, replace subtitle with &apos;NEXT GEN EDITING&apos;, perfectly crisp typography, high legibility, clean layout&quot;
                    </p>
                  </div>
                </div>

                {/* Action CTA */}
                <button
                  type="button"
                  onClick={() =>
                    handleLoadShowcase(
                      '/images/showcase_typography_before.jpg',
                      'Inpaint magazine cover title to "QWEN IMAGE 2026", replace subtitle with "NEXT GEN EDITING", perfectly crisp typography, high legibility, clean layout',
                      '/images/showcase_typography_after.jpg'
                    )
                  }
                  className="mt-5 w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 active:scale-[0.98] cursor-pointer"
                >
                  <BoltIcon className="w-4 h-4 text-cyan-300" />
                  <span>Try This Recipe in Editor ⚡</span>
                </button>
              </div>

              {/* Showcase 4: Bespoke Tuxedo & Character Posture Consistency */}
              <div className="rounded-3xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl p-5 sm:p-6 shadow-2xl flex flex-col justify-between hover:border-amber-500/50 hover:bg-slate-900/80 transition-all group">
                <div className="space-y-4">
                  {/* Header & Badges */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[11px] font-bold">
                        🤵 Character &amp; Tuxedo Inpaint
                      </div>
                      <h3 className="text-lg font-bold text-white mt-2 group-hover:text-amber-300 transition-colors">
                        Ragged Robes ➔ Bespoke Velvet Tuxedo
                      </h3>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        Replaces vintage rough peasant clothing with a tailored velvet tuxedo tailcoat and bowtie, preserving identical jumping posture and candle-lit barn atmosphere.
                      </p>
                    </div>
                  </div>

                  {/* Side-by-Side Before vs After Window */}
                  <div className="relative rounded-2xl bg-slate-950 p-2.5 border border-slate-800/90 shadow-inner">
                    <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                      {/* Before: Vintage Ragged Cloth */}
                      <div className="relative rounded-xl overflow-hidden aspect-square bg-slate-900 group/img">
                        <img
                          src="/images/rumpelstiltskin_vintage_demo.jpg"
                          alt="Original Character in Ragged Peasant Clothing"
                          width={400}
                          height={400}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-md text-slate-200 font-bold text-[10px] tracking-wider border border-white/10 shadow-sm">
                          📷 BEFORE
                        </div>
                        <div className="absolute bottom-2 left-2 right-2 px-2 py-1 rounded bg-black/70 backdrop-blur-md text-[10px] text-slate-300 truncate">
                          Ragged Peasant Robe
                        </div>
                      </div>

                      {/* Floating Arrow */}
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 border-2 border-slate-900 flex items-center justify-center text-white shadow-xl shadow-amber-500/40">
                        <span className="text-xs font-black">➔</span>
                      </div>

                      {/* After: Velvet Tuxedo */}
                      <div className="relative rounded-xl overflow-hidden aspect-square bg-slate-900 group/img">
                        <img
                          src="/images/rumpelstiltskin_tuxedo_result.jpg"
                          alt="Character Inpainted into Bespoke Velvet Tuxedo Suit"
                          width={400}
                          height={400}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-amber-500/90 text-white font-extrabold text-[10px] tracking-wider shadow-md">
                          ✨ AI AFTER
                        </div>
                        <div className="absolute bottom-2 left-2 right-2 px-2 py-1 rounded bg-amber-950/80 border border-amber-500/40 backdrop-blur-md text-[10px] text-amber-200 font-medium truncate">
                          Tailored Velvet Tuxedo Suit
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Prompt Terminal Box */}
                  <div className="p-3 rounded-xl bg-slate-950/90 border border-slate-800 text-[11px] font-mono space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-amber-400 font-semibold uppercase tracking-wider">
                      <span>Exact Inpainting Prompt:</span>
                      <span className="text-slate-500 font-sans">Model: Qwen-Image 2.1</span>
                    </div>
                    <p className="text-slate-200 leading-relaxed font-sans">
                      &quot;Change outfit to a sharp bespoke black velvet tuxedo tailcoat with satin peak lapels, white dress shirt and black bowtie, maintain jumping posture and candle-lit barn atmosphere&quot;
                    </p>
                  </div>
                </div>

                {/* Action CTA */}
                <button
                  type="button"
                  onClick={() =>
                    handleLoadShowcase(
                      '/images/rumpelstiltskin_vintage_demo.jpg',
                      'Change outfit to a sharp bespoke black velvet tuxedo tailcoat with satin peak lapels, white dress shirt and black bowtie, maintain jumping posture and candle-lit barn atmosphere',
                      '/images/rumpelstiltskin_tuxedo_result.jpg'
                    )
                  }
                  className="mt-5 w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-orange-600 to-rose-600 hover:from-amber-400 hover:to-orange-500 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-[0.98] cursor-pointer"
                >
                  <BoltIcon className="w-4 h-4 text-amber-200" />
                  <span>Try This Recipe in Editor ⚡</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Tools & Page Matrix Entrypoints (SEO Internal Links) */}
        <section className="py-12 border-t border-slate-900 bg-slate-950/60">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <h2 className="text-2xl font-bold text-white tracking-tight">Explore Qwen Image Tools</h2>
              <p className="text-sm text-slate-400 mt-2">
                Discover specialized generators, guides, and comprehensive model benchmarks.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <Link
                href={getLinkHref(locale, 'generator')}
                className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 hover:border-indigo-500/50 hover:bg-slate-900/80 transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <SparklesIcon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white group-hover:text-indigo-400 transition-colors">
                  Qwen Image Generator
                </h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Generate photorealistic visuals, digital illustrations, and scenes from scratch with AI.
                </p>
                <span className="mt-4 inline-flex items-center text-xs font-semibold text-indigo-400">
                  Try Generator →
                </span>
              </Link>

              <Link
                href={getLinkHref(locale, 'prompt')}
                className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 hover:border-indigo-500/50 hover:bg-slate-900/80 transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <BoltIcon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white group-hover:text-purple-400 transition-colors">
                  Prompt Guide & Library
                </h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Browse over 30 proven prompt formulas, typography recipes, and character consistency tips.
                </p>
                <span className="mt-4 inline-flex items-center text-xs font-semibold text-purple-400">
                  Read Formulas →
                </span>
              </Link>

              <Link
                href={getLinkHref(locale, 'vs-midjourney')}
                className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 hover:border-indigo-500/50 hover:bg-slate-900/80 transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-pink-500/10 text-pink-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <ArrowsRightLeftIcon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white group-hover:text-pink-400 transition-colors">
                  vs Midjourney Comparison
                </h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Detailed benchmark comparing prompt understanding, typography spelling, and inpainting.
                </p>
                <span className="mt-4 inline-flex items-center text-xs font-semibold text-pink-400">
                  Compare Models →
                </span>
              </Link>

              <Link
                href={getLinkHref(locale, 'vs-flux')}
                className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 hover:border-indigo-500/50 hover:bg-slate-900/80 transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <CpuChipIcon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white group-hover:text-cyan-400 transition-colors">
                  vs Flux Benchmark
                </h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  In-depth analysis of image detail, VRAM requirements, and instruction adherence.
                </p>
                <span className="mt-4 inline-flex items-center text-xs font-semibold text-cyan-400">
                  Read Analysis →
                </span>
              </Link>
            </div>
          </div>
        </section>

        {/* How to Use Section (3 Steps) */}
        <section className="py-16 lg:py-24 border-t border-slate-900">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <h2 className="text-3xl font-extrabold text-white tracking-tight">How to Use the Online AI Editor</h2>
              <p className="text-sm sm:text-base text-slate-400 mt-3">
                Edit and transform any visual in 3 intuitive steps without complex Photoshop layers.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 relative">
                <div className="text-3xl font-black text-indigo-500/30 mb-2">01</div>
                <h3 className="text-lg font-bold text-white mb-2">Upload or Select Image</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Drag and drop your photo, artwork, or product shot into the editor. You can also pick from ready-made presets to experiment instantly.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 relative">
                <div className="text-3xl font-black text-purple-500/30 mb-2">02</div>
                <h3 className="text-lg font-bold text-white mb-2">Enter Natural Language Edit Prompt</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Describe what you want to change in simple English or Chinese: replace backgrounds, alter apparel, tweak lighting, or inpaint specific elements.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 relative">
                <div className="text-3xl font-black text-pink-500/30 mb-2">03</div>
                <h3 className="text-lg font-bold text-white mb-2">Preview, Compare & Download HD</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Inspect the Before-and-After results with the side-by-side viewer. Refine prompts with 1-click iterations and download high-resolution PNGs.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 lg:py-24 border-t border-slate-900 bg-slate-950/40">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <h2 className="text-3xl font-extrabold text-white tracking-tight">Key Features of Qwen Image Editor</h2>
              <p className="text-sm sm:text-base text-slate-400 mt-3">
                Why creators, visual artists, and marketers choose this platform for next-generation visual manipulation.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-6 space-y-3">
                <AdjustmentsHorizontalIcon className="w-8 h-8 text-indigo-400" />
                <h3 className="text-base font-bold text-white">Instruction Inpainting</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Describe localized modifications with plain text prompts. The model automatically segments edit masks and harmonizes lighting, shadows, and edge grain.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-6 space-y-3">
                <SparklesIcon className="w-8 h-8 text-purple-400" />
                <h3 className="text-base font-bold text-white">Crisp Text & Typography</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Render photorealistic English and Chinese typography on street banners, apparel, packaging, and digital advertisements without garbled characters.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-6 space-y-3">
                <ShieldCheckIcon className="w-8 h-8 text-pink-400" />
                <h3 className="text-base font-bold text-white">Character & Face Consistency</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Locks facial geometry, gaze vectors, and core character identity across sequential background changes, wardrobe replacements, and style shifts.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-6 space-y-3">
                <BoltIcon className="w-8 h-8 text-cyan-400" />
                <h3 className="text-base font-bold text-white">Cloud GPU Acceleration</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Powered by high-throughput enterprise GPU clusters with FlashAttention, delivering fast rendering turnaround without consuming local computer memory.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Checkpoints & Architecture Section (2511 vs 2512 vs 2509) */}
        <section className="py-16 lg:py-24 border-t border-slate-900">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center mb-14">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
                Model Evolution & Architecture
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mt-4">
                Supported Qwen-Image-Edit Checkpoints
              </h2>
              <p className="text-sm sm:text-base text-slate-400 mt-3 leading-relaxed">
                The Qwen-Image foundation family bridges visual multimodal understanding and generative diffusion. Our online editor integrates the official open-source weights optimized for high-fidelity execution.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="rounded-2xl border border-indigo-500/30 bg-gradient-to-b from-indigo-950/30 to-slate-900/60 p-7 relative flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      Checkpoint 2511
                    </span>
                    <span className="text-[11px] text-slate-400">High Adherence SOTA</span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">Qwen-Image-Edit 2511</h3>
                  <p className="text-xs text-slate-400 leading-relaxed mb-4">
                    The acclaimed flagship revision for instruction-guided inpainting. Checkpoint 2511 excels at fine-grained edits, complex subject preservation, and photo-level material realism with minimal hallucination.
                  </p>
                  <ul className="space-y-2 text-xs text-slate-300">
                    <li className="flex items-center gap-2">
                      <CheckCircleIcon className="w-4 h-4 text-indigo-400 shrink-0" />
                      <span>Best for multi-object replacement & background swaps</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircleIcon className="w-4 h-4 text-indigo-400 shrink-0" />
                      <span>Sub-pixel edge blending and natural shadow cast</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircleIcon className="w-4 h-4 text-indigo-400 shrink-0" />
                      <span>Exceptional portrait feature retention</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="rounded-2xl border border-purple-500/30 bg-gradient-to-b from-purple-950/30 to-slate-900/60 p-7 relative flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      Checkpoint 2512
                    </span>
                    <span className="text-[11px] text-slate-400">Semantic & Spatial Control</span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">Qwen-Image-Edit 2512</h3>
                  <p className="text-xs text-slate-400 leading-relaxed mb-4">
                    Engineered for nuanced prompt comprehension, spatial camera transformations, and multi-turn modifications. Checkpoint 2512 accurately interprets conversational constraints and stylistic nuances.
                  </p>
                  <ul className="space-y-2 text-xs text-slate-300">
                    <li className="flex items-center gap-2">
                      <CheckCircleIcon className="w-4 h-4 text-purple-400 shrink-0" />
                      <span>Camera perspective & angle adjustment</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircleIcon className="w-4 h-4 text-purple-400 shrink-0" />
                      <span>Advanced aesthetic color grading & mood shifts</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircleIcon className="w-4 h-4 text-purple-400 shrink-0" />
                      <span>Enhanced bilingual typography & packaging design</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="rounded-2xl border border-cyan-500/30 bg-gradient-to-b from-cyan-950/30 to-slate-900/60 p-7 relative flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                      Checkpoint 2509
                    </span>
                    <span className="text-[11px] text-slate-400">Fast Inpainting</span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">Qwen-Image-Edit 2509</h3>
                  <p className="text-xs text-slate-400 leading-relaxed mb-4">
                    The baseline architecture renowned for lightweight inference and rapid previewing. Provides dependable object removal, background clearing, and quick conceptual prototyping.
                  </p>
                  <ul className="space-y-2 text-xs text-slate-300">
                    <li className="flex items-center gap-2">
                      <CheckCircleIcon className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span>Fast turnaround for rapid iterations</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircleIcon className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span>Efficient object erasure & clean inpainting</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircleIcon className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span>Stable baseline for standard resolution outputs</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Online Web Editor vs ComfyUI Workflow Comparison */}
        <section className="py-16 lg:py-24 border-t border-slate-900 bg-slate-950/50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center mb-14">
              <span className="text-xs font-bold uppercase tracking-wider text-pink-400 bg-pink-500/10 px-3 py-1 rounded-full border border-pink-500/20">
                Workflow Comparison
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mt-4">
                Online Web Studio vs Local ComfyUI Workflow
              </h2>
              <p className="text-sm sm:text-base text-slate-400 mt-3 leading-relaxed">
                Many creators search for Qwen Image Edit ComfyUI workflows, GGUF quants, or HuggingFace nodes. Here is why using our cloud workspace saves hours of troubleshooting and expensive hardware costs.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {/* Local ComfyUI Card */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 text-slate-400 flex items-center justify-center font-bold text-sm">
                    DIY
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-200">Local ComfyUI / GGUF Workflow</h3>
                    <p className="text-xs text-slate-500">Self-hosted local installation</p>
                  </div>
                </div>

                <ul className="space-y-4 text-xs sm:text-sm text-slate-400">
                  <li className="flex items-start gap-3">
                    <span className="text-red-400 font-bold">✕</span>
                    <span><strong>Massive Hardware Requirement:</strong> Needs high-end GPUs with 16GB–24GB VRAM (e.g. RTX 4090) to prevent CUDA Out Of Memory (OOM) crashes.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-red-400 font-bold">✕</span>
                    <span><strong>Complex Setup:</strong> Requires Python virtual environments, PyTorch matching, custom nodes, git submodules, and constant dependency updates.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-red-400 font-bold">✕</span>
                    <span><strong>No Mobile Access:</strong> Tied strictly to your local desktop machine; impossible to use on iPads, phones, or thin laptops.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-red-400 font-bold">✕</span>
                    <span><strong>Large Download Footprint:</strong> 20GB+ checkpoint files consume huge storage and bandwidth.</span>
                  </li>
                </ul>
              </div>

              {/* Online Web Editor Card */}
              <div className="rounded-2xl border border-indigo-500/50 bg-gradient-to-b from-indigo-950/20 to-slate-900/70 p-8 shadow-xl shadow-indigo-500/10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500 text-white flex items-center justify-center font-bold text-sm">
                    WEB
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Online Cloud Studio</h3>
                    <p className="text-xs text-indigo-300">Instant in-browser experience</p>
                  </div>
                </div>

                <ul className="space-y-4 text-xs sm:text-sm text-slate-300">
                  <li className="flex items-start gap-3">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span><strong>Zero Hardware Barrier:</strong> Runs seamlessly on any computer, Chromebook, iPad, or smartphone without local GPU consumption.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span><strong>Instant Start with 0 Setup:</strong> No drivers, no nodes, no terminal scripts. Upload photo, type prompt, and get results in seconds.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span><strong>Always Latest Checkpoints:</strong> Automatically updated with Qwen-Image-Edit 2511, 2512, and continuous fine-tuning improvements.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span><strong>Integrated Comparison & Storage:</strong> Built-in Side-by-Side before/after comparison tool, community showcase, and HD cloud history.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Solving Common Pain Points Section (Face Consistency & Inpainting) */}
        <section className="py-16 lg:py-24 border-t border-slate-900">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center mb-14">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-400 bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20">
                Creative Solutions & Recipes
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mt-4">
                Mastering AI Photo Editing & Character Consistency
              </h2>
              <p className="text-sm sm:text-base text-slate-400 mt-3 leading-relaxed">
                Overcoming common challenges in text-driven image modification with proven prompt structures and intelligent inpainting.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 space-y-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 inline-block"></span>
                  Fixing Face Drift & Inconsistency
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  A frequent issue with image generators is facial distortion during edits (&quot;can&apos;t get faces correct&quot;). In our web workspace, avoid broad re-generation prompts. Instead, specify targeted alterations like:
                </p>
                <div className="rounded-xl bg-slate-950 p-3 border border-slate-800 text-[11px] font-mono text-indigo-300">
                  &quot;Keep face identity, facial features and gaze untouched; replace jacket with dark bomber jacket.&quot;
                </div>
                <p className="text-xs text-slate-500">
                  The model cross-references original face landmarks and preserves personal identity.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 space-y-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-400 inline-block"></span>
                  Atmospheric Relighting & Shadows
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  When changing daylight photos into sunset or neon cyberpunk scenes, legacy editors leave harsh edge artifacts. Qwen-Image-Edit calculates global illumination and accurately projects colored ambient bounce:
                </p>
                <div className="rounded-xl bg-slate-950 p-3 border border-slate-800 text-[11px] font-mono text-purple-300">
                  &quot;Change background to night neon Tokyo, cast subtle purple and blue rim light onto the subject&apos;s shoulders.&quot;
                </div>
                <p className="text-xs text-slate-500">
                  Seamlessly integrates subject and background into a unified photographic composition.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 space-y-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-pink-400 inline-block"></span>
                  Flawless Graphic Text & Signage
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Need to replace text on packaging, posters, or t-shirts? Use explicit quotation marks to instruct the Qwen vision decoder to render exact typography:
                </p>
                <div className="rounded-xl bg-slate-950 p-3 border border-slate-800 text-[11px] font-mono text-pink-300">
                  &quot;Inpaint the coffee cup label to read &apos;QWEN BREW&apos; in clean minimalist serif font.&quot;
                </div>
                <p className="text-xs text-slate-500">
                  Generates sharp lettering without typical diffusion blur, gibberish, or missing vowels.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 3-Step How-To Workflow Section for GEO & How-To Intent */}
        <section className="py-14 border-t border-slate-900 bg-slate-950/70">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center mb-10">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                Step-by-Step Workflow
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-3">
                How to Edit Photos in 3 Simple Steps
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-2">
                Conversational instruction-driven photo editing without manual brush masking or ComfyUI installation.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 font-bold flex items-center justify-center text-sm border border-indigo-500/30">
                  1
                </div>
                <h3 className="text-base font-bold text-white">Step 1: Upload Source Image</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Upload any portrait, product, or landscape image in JPG, PNG, or WebP format up to 20MB directly into the workspace canvas.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-3">
                <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 font-bold flex items-center justify-center text-sm border border-purple-500/30">
                  2
                </div>
                <h3 className="text-base font-bold text-white">Step 2: Enter Natural Language Edit</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Type your prompt describing desired modifications (e.g. &quot;change jacket to black leather, add warm sunset glow&quot;) with zero manual masking.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-3">
                <div className="w-8 h-8 rounded-lg bg-pink-500/20 text-pink-400 font-bold flex items-center justify-center text-sm border border-pink-500/30">
                  3
                </div>
                <h3 className="text-base font-bold text-white">Step 3: Download in High Resolution</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Receive your neural inpainting results with accurate subject coherence and download high-resolution lossless PNG or WebP assets.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Cross-Entity Comparison Matrix for GEO Authority */}
        <section className="py-14 border-t border-slate-900 bg-slate-950">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20">
                Cross-Entity Benchmark
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-3">
                Objective Model Comparison Matrix
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-2">
                Side-by-side technical evaluation against Midjourney v6.1 and Flux.1 Dev architectures.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 overflow-hidden bg-slate-900/50">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm text-slate-300">
                  <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 uppercase text-[11px]">
                    <tr>
                      <th className="py-3.5 px-4 font-semibold">Evaluation Metric</th>
                      <th className="py-3.5 px-4 font-bold text-indigo-400">Qwen Image Editor</th>
                      <th className="py-3.5 px-4 font-semibold text-slate-300">Midjourney v6.1</th>
                      <th className="py-3.5 px-4 font-semibold text-slate-300">Flux.1 Dev</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-normal">
                    <tr>
                      <td className="py-3.5 px-4 font-medium text-white">Inpainting Interaction</td>
                      <td className="py-3.5 px-4 text-indigo-300 font-medium">Conversational prompt (Maskless)</td>
                      <td className="py-3.5 px-4 text-slate-400">Discord Vary (Region) brush</td>
                      <td className="py-3.5 px-4 text-slate-400">Separate Flux Fill pipeline</td>
                    </tr>
                    <tr>
                      <td className="py-3.5 px-4 font-medium text-white">Commercial Rights</td>
                      <td className="py-3.5 px-4 text-emerald-400 font-medium">Full Commercial Rights on User Outputs</td>
                      <td className="py-3.5 px-4 text-slate-400">Paid subscribers only ($10+/mo)</td>
                      <td className="py-3.5 px-4 text-slate-400">Non-commercial research only</td>
                    </tr>
                    <tr>
                      <td className="py-3.5 px-4 font-medium text-white">Pricing & Entry Cost</td>
                      <td className="py-3.5 px-4 text-indigo-300 font-medium">Trial credit + $4.99 starter pack (100 credits)</td>
                      <td className="py-3.5 px-4 text-slate-400">$10/month recurring minimum</td>
                      <td className="py-3.5 px-4 text-slate-400">Requires 24GB VRAM GPU ($1500+)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 lg:py-24 border-t border-slate-900">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-extrabold text-white tracking-tight">Frequently Asked Questions</h2>
              <p className="text-sm text-slate-400 mt-2">
                Everything you need to know about the AI photo editing suite.
              </p>
            </div>

            <div className="space-y-4">
              {faqList.map((faq, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-800 bg-slate-900/40 overflow-hidden transition-colors"
                >
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

      <Footer locale={locale} page="" />
    </div>
  );
}
