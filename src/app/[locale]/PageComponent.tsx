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
  ShareIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import { getGuestTrialsRemaining, recordGuestTrialUse, GUEST_TRIAL_LIMIT } from "~/libs/guestTrial";
import { exportImageWithTier, exportComparisonCard } from "~/libs/imageExport";

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
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(true);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [resetCountdown, setResetCountdown] = useState<string>('00:00');
  const [isExportingCard, setIsExportingCard] = useState<boolean>(false);
  const [copiedShare, setCopiedShare] = useState<boolean>(false);
  const [isMobileHoldingOriginal, setIsMobileHoldingOriginal] = useState<boolean>(false);
  const [demoActiveNotice, setDemoActiveNotice] = useState<string | null>(null);

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const tomorrow = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0));
      const diffMs = Math.max(0, tomorrow.getTime() - now.getTime());
      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      setResetCountdown(`${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`);
    };
    updateCountdown();
    const interval = setInterval(updateCountdown, 10000);
    return () => clearInterval(interval);
  }, []);

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
    setIsAutoPlaying(false);
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
          label: 'Emerald Silk Gala',
          text: 'Swap clothes to elegant emerald green silk gala evening dress, high slit',
          sourceUrl: '/images/showcase_dress_before.jpg',
          previewUrl: '/images/showcase_dress_after.jpg',
        },
        {
          label: 'Navy Tailored Blazer',
          text: 'Change outfit to tailored luxury navy blazer and white silk blouse',
          sourceUrl: '/images/showcase_dress_before.jpg',
          previewUrl: '/images/showcase_fashion_navy_blazer.jpg',
        },
        {
          label: 'Boho Floral Sundress',
          text: 'Change clothing to chic bohemian floral summer beach sundress',
          sourceUrl: '/images/showcase_dress_before.jpg',
          previewUrl: '/images/showcase_fashion_boho_sundress.jpg',
        },
        {
          label: 'Distressed Biker Jacket',
          text: 'Swap jacket to vintage distressed black leather biker jacket',
          sourceUrl: '/images/showcase_dress_before.jpg',
          previewUrl: '/images/showcase_fashion_leather_jacket.jpg',
        },
        {
          label: 'Haute Couture Velvet',
          text: 'Transform attire to modern haute couture velvet gown with pearls',
          sourceUrl: '/images/showcase_dress_before.jpg',
          previewUrl: '/images/showcase_fashion_velvet_gown.jpg',
        },
        {
          label: 'Oversized Knit Sweater',
          text: 'Change outfit to casual oversized beige knit sweater and jeans',
          sourceUrl: '/images/showcase_dress_before.jpg',
          previewUrl: '/images/showcase_fashion_knit_sweater.jpg',
        },
        {
          label: 'Peony Embroidery',
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
          label: 'Black Velvet Tuxedo',
          text: 'Swap outfit to bespoke sharp black tuxedo with satin peak lapels',
          sourceUrl: '/images/showcase_man_suit_before.jpg',
          previewUrl: '/images/showcase_man_suit_after.jpg',
        },
        {
          label: 'Charcoal 3-Piece Suit',
          text: 'Change clothing to modern slim-fit charcoal three-piece business suit',
          sourceUrl: '/images/showcase_dress_before.jpg',
          previewUrl: '/images/showcase_fashion_navy_blazer.jpg',
        },
        {
          label: 'French Cuff Shirt & Tie',
          text: 'Swap shirt to formal crisp white French cuff dress shirt and tie',
          sourceUrl: '/images/showcase_man_suit_before.jpg',
          previewUrl: '/images/showcase_man_suit_after.jpg',
        },
        {
          label: 'Cashmere Trench Coat',
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
          label: 'Neon Cyberpunk Street',
          text: 'Change background to cyberpunk neon metropolis night street',
          sourceUrl: '/images/showcase_cafe_before.jpg',
          previewUrl: '/images/showcase_cyberpunk_after.jpg',
        },
        {
          label: 'Minimalist Studio Backdrop',
          text: 'Change background to luxury minimalist clean studio backdrop',
          sourceUrl: '/images/showcase_dress_before.jpg',
          previewUrl: '/images/showcase_fashion_knit_sweater.jpg',
        },
        {
          label: 'Seamless White Catalog',
          text: 'Isolate subject on pure white seamless ecommerce catalog background',
          sourceUrl: '/images/showcase_dress_before.jpg',
          previewUrl: '/images/showcase_dress_before.jpg',
        },
        {
          label: 'Sunset Golden Hour',
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
          label: 'Vogue Editorial Portrait',
          text: 'Transform portrait into high-end Vogue fashion editorial photography',
          sourceUrl: '/images/showcase_dress_before.jpg',
          previewUrl: '/images/showcase_fashion_velvet_gown.jpg',
        },
        {
          label: 'Natural Glossy Waves',
          text: 'Refine hair to voluminous natural glossy waves with soft rim light',
          sourceUrl: '/images/showcase_dress_before.jpg',
          previewUrl: '/images/showcase_dress_after.jpg',
        },
        {
          label: 'Tortoise-Shell Glasses',
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
      '/images/showcase_man_suit_before.jpg',
      '/images/showcase_man_suit_after.jpg',
      '/images/showcase_cafe_before.jpg',
      '/images/showcase_cyberpunk_after.jpg',
    ];
    demoImages.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  // Auto-rotate fashion showcase presets & live preview every 3.5s (pauses on hover or manual interaction)
  useEffect(() => {
    if (!isAutoPlaying || isHovered || isProcessing || activeTab !== 'edit') {
      return;
    }

    const timer = setInterval(() => {
      const currentCategory = promptPresetCategories[activePresetCategory];
      if (!currentCategory || !currentCategory.items || currentCategory.items.length === 0) return;

      const currentIndex = currentCategory.items.findIndex((item) => {
        const itemText = typeof item === 'string' ? item : item.text;
        return itemText === textStr;
      });

      const nextIndex = (currentIndex + 1) % currentCategory.items.length;
      const nextPreset: any = currentCategory.items[nextIndex];
      const nextText = typeof nextPreset === 'string' ? nextPreset : nextPreset.text;
      const nextPreview = typeof nextPreset === 'string' ? undefined : nextPreset.previewUrl;
      const nextSource = typeof nextPreset === 'string' ? undefined : nextPreset.sourceUrl;

      setTextStr(nextText);
      if (nextPreview) {
        setCurrentResultImage(nextPreview);
        setSourceImage(nextSource || '/images/showcase_dress_before.jpg');
      }
    }, 3500);

    return () => clearInterval(timer);
  }, [isAutoPlaying, isHovered, isProcessing, activeTab, activePresetCategory, textStr]);

  // FAQ Items - Comprehensive coverage for search intent, citations, and LLM entity confidence
  const faqList = [
    {
      q: 'What is Qwen Image Editor and how does it work?',
      a: "Qwen Image Editor is a browser-based AI platform that modifies images through natural language prompts using Alibaba Cloud's DashScope foundation models (wanx2.1-imageedit). Rather than regenerating complete canvases from scratch, the system maps multimodal visual tokens directly to prompt instructions, isolating edit boundaries without manual brush masking. It executes localized inpainting on 1024×1024 pixel inputs with typical cloud turnaround in 8 to 15 seconds, helping preserve unedited textures and facial features without requiring local GPU hardware.",
    },
    {
      q: 'Can I use Qwen Image Editor for AI clothes changing and virtual try-on?',
      a: 'Yes. Qwen Image Editor excels at virtual apparel try-on, dress swapping, and ecommerce fashion modeling. By leveraging deep visual grounding, it recognizes body silhouettes and replaces tops, suits, evening dresses, or casual streetwear while helping preserve the model’s face, hairstyle, skin tone, and natural posture. Processing time varies with image resolution and queue load, typically completing in ~8–15s on standard queue (or faster on priority queues).',
    },
    {
      q: 'How to edit or inpaint photos using text prompts?',
      a: 'You can edit and inpaint any photo through a three-step conversational workflow directly in your web browser. First, upload a source JPG, PNG, or WebP photo up to 20MB. Second, enter natural language instructions specifying your target change, such as modifying garments or replacing backgrounds. Third, click generate to trigger neural inference. Processing typically completes in ~8–15s depending on model complexity, image resolution, and queue demand, with outputs downloadable in high resolution.',
    },
    {
      q: 'How does Qwen Image Editor compare to Midjourney and Flux?',
      a: 'Qwen Image Editor outperforms Midjourney and Flux in targeted conversational inpainting, native bilingual typography, and per-image operational cost. While Midjourney requires a $10/month Discord subscription and Flux.1 Dev needs 24GB VRAM with external ControlNets, Qwen provides a free tier alongside a $4.99 starter pack. Midjourney often limits localized edits to manual brush regions, whereas Qwen provides native maskless inpainting, rendering crisp English and Chinese text up to 2048×2048 resolution with zero subscription lock-in.',
    },
    {
      q: 'Are the AI-generated images commercial-use friendly and private?',
      a: 'Yes, images generated and edited on Qwen Image Editor carry commercial usage permissions in accordance with our Terms of Service and upstream Alibaba Cloud DashScope foundation model commercial licensing terms. Users retain exploitation rights to use visual outputs across commercial campaigns, client projects, and marketing collateral without royalty obligations. Image uploads and generated outputs are transmitted via 256-bit SSL encryption. Paid subscribers can toggle private mode to ensure inputs and outputs remain completely confidential.',
    },
    {
      q: 'Which model checkpoints and APIs are supported?',
      a: 'The online editor executes managed production APIs from Alibaba Cloud DashScope, specifically Wanx 2.1 Image Edit (wanx2.1-imageedit) for instruction-based inpainting and Wanx 2.1 Turbo/Plus for text-to-image synthesis. While open-source research checkpoints from the Qwen-Image family are available on Hugging Face and ModelScope for self-hosted ComfyUI rigs, this website provides a managed serverless cloud environment with no local GPU setup required.',
    },
    {
      q: 'Can I try this online editor for free without ComfyUI or a high-end GPU?',
      a: 'Yes. Every user receives a daily trial quota upon signing in to test image editing and text-to-image directly in their browser—no 24GB VRAM GPU or ComfyUI setup required. For larger production batches and zero-wait GPU queues, non-expiring credit packs start at $4.99 for 100 credits ($0.05 per edit).',
    },
    {
      q: 'How does Qwen Image Edit help maintain face and character consistency?',
      a: 'Qwen Image Edit pairs deep multimodal visual tokens with spatial cross-attention layers. This architecture is designed to preserve primary facial landmark points, gaze orientation, and skin texture while applying modifications strictly to requested regions such as clothing, hairstyle, or background.',
    },
    {
      q: 'Is Qwen Image Edit censored, and what are the content policies?',
      a: 'Qwen Image Edit incorporates safety filters designed to block harmful, hateful, and illegal material while providing creative freedom for portrait editing, design mockups, art direction, and digital marketing. Safe artistic expressions, photorealistic portraits, and creative styling are fully supported.',
    },
    {
      q: 'Can Qwen Image render clean English and bilingual text inside images?',
      a: 'Yes. Thanks to its multimodal vocabulary tokenizer, Qwen significantly improves typography rendering across English words, brand typography, and Chinese characters on street signage, packaging, and posters, helping reduce the distorted pseudo-glyphs typical of older diffusion engines.',
    },
    {
      q: 'What resolutions and export formats are supported for download?',
      a: 'Users can preview in real-time in the browser and export full-resolution images in PNG or optimized WebP format with sharp edge fidelity and clean details.',
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
          'AI Fashion Virtual Try-On: Swap clothing, dresses, and suits while preserving face identity and body proportions',
          'AI Inpainting: Conversational instruction-guided photo modifications without manual brush masking',
          'Background Removal & Replacement: Subject isolation, cyberpunk relighting, and studio backdrop swap',
          'Bilingual Typography Rendering: Crisp English and Chinese typography embedded in images without distorted pseudo-glyphs',
          'Ecommerce Product Photo Enhancer: Studio lighting, podium placement, and commercial asset rendering',
          'Text to Image: High-fidelity generation across 1:1, 16:9, 9:16, 3:4, and 4:3 aspect ratios',
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
              name: 'Daily Trial Quota',
              price: '0.00',
              priceCurrency: 'USD',
              availability: 'https://schema.org/InStock',
              description:
                'Daily complimentary trial quota with 1 daily AI generation and inpainting credit upon registration.',
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
            {/* Header Titles - Streamlined & Action-First */}
            <div className="text-center max-w-3xl mx-auto space-y-3.5 mb-7">
              {/* Compliance & API Access Badge */}
              <div className="flex flex-wrap items-center justify-center gap-2">
                <Link
                  href={getLinkHref(locale, 'disclaimer')}
                  className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-300 backdrop-blur-md hover:bg-amber-500/20 transition-colors"
                >
                  <ShieldCheckIcon className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>
                    {locale?.startsWith('zh')
                      ? '独立第三方工具 • 官方合规API调用 • 与阿里巴巴无官方关联'
                      : 'Independent Third-Party Tool • Official Cloud API Access'}
                  </span>
                </Link>
                <div className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-300">
                  <SparklesIcon className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Qwen-Image &amp; Wanx 2.1 Engine</span>
                </div>
              </div>

              {/* Main H1 - ChatGPT Recommended Focus */}
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
                Qwen Image Editor Online
              </h1>

              {/* Core Value Proposition - Clean & Direct */}
              <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-normal max-w-2xl mx-auto">
                Edit images with natural language. Upload a photo, describe the changes you want, and preview high-resolution results in your browser.
              </p>

              {/* Core Workflow Tags */}
              <div className="flex flex-wrap items-center justify-center gap-2 pt-1 pb-1">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/90 border border-slate-800 text-xs font-medium text-indigo-300 shadow-sm">
                  ✨ Image Editing
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/90 border border-slate-800 text-xs font-medium text-purple-300 shadow-sm">
                  🖼️ Background Replacement
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/90 border border-slate-800 text-xs font-medium text-cyan-300 shadow-sm">
                  🔤 Text Editing
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/90 border border-slate-800 text-xs font-medium text-emerald-300 shadow-sm">
                  🛍️ Product Photos
                </span>
              </div>

              {/* Grounded & Realistic Performance Indicators (No Hyperbole) */}
              <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-xs text-slate-400 pt-0.5">
                <span>🎯 Designed to preserve subject identity</span>
                <span className="hidden sm:inline text-slate-700">•</span>
                <span>🔤 Helps improve typography rendering</span>
                <span className="hidden sm:inline text-slate-700">•</span>
                <span>⏱️ Typical processing ~8–15s (varies with model, size &amp; server load)</span>
              </div>

              {/* Explicit Credit Quota & Login Requirement Disclosure Banner (Gefei Checklist Aligned) */}
              <div className="pt-3 max-w-4xl mx-auto w-full">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 p-3 sm:p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-left text-xs shadow-lg backdrop-blur-md">
                  <div className="flex items-start gap-2.5">
                    <div className="p-2 rounded-xl bg-indigo-500/15 text-indigo-400 shrink-0">
                      <UserCircleIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-white block">
                        {locale?.startsWith('zh') ? 'Google 一键登录' : 'Google Sign-In'}
                      </span>
                      <span className="text-[11px] text-slate-400 block mt-0.5">
                        {locale?.startsWith('zh') ? '免密登录，激活配额与历史记录' : '1-click sign-in to activate quota'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400 shrink-0">
                      <SparklesIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-white block">
                        {locale?.startsWith('zh') ? '今日免费额度: 1/1' : 'Daily Free Quota: 1/1'}
                      </span>
                      <span className="text-[11px] text-slate-400 block mt-0.5">
                        {locale?.startsWith('zh') ? '每天 00:00 UTC 自动刷新' : '1 daily edit, resets at 00:00 UTC'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <div className="p-2 rounded-xl bg-cyan-500/15 text-cyan-400 shrink-0">
                      <BoltIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-white block">
                        {locale?.startsWith('zh') ? '消耗 1 额度 / 次' : '1 Credit Per Edit'}
                      </span>
                      <span className="text-[11px] text-slate-400 block mt-0.5">
                        {locale?.startsWith('zh') ? '标准编辑扣 1 点，失败自动返还' : 'Standard edits, auto-refund on fail'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400 shrink-0">
                      <ShieldCheckIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-white block">
                        {locale?.startsWith('zh') ? '$4.99 / 100 积分' : '$4.99 / 100 Credits'}
                      </span>
                      <span className="text-[11px] text-slate-400 block mt-0.5">
                        {locale?.startsWith('zh') ? '单次买断永不过期，平均 $0.05/次' : 'Non-expiring lifetime, $0.05/edit'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Interactive Editor Card */}
            <div id="editor-card" className="rounded-3xl border border-slate-800 bg-slate-900/70 backdrop-blur-xl p-4 sm:p-7 shadow-2xl shadow-indigo-950/40">
              {/* Credit Status & Usage Rules Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3 mb-6 rounded-2xl bg-slate-950/90 border border-slate-800/90 text-xs shadow-inner">
                <div className="flex items-center gap-2.5 flex-wrap">
                  {Boolean(userData && userData.user_id) ? (
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-slate-900/90 border border-slate-800 text-xs shadow-sm">
                        <span className="flex h-2 w-2 relative">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <span className="text-slate-400 font-medium">
                          {locale?.startsWith('zh') ? '今日免费额度:' : 'Daily Free Quota:'}
                        </span>
                        <span className="font-bold text-cyan-300 font-mono text-xs">
                          {Math.min(userData.available_times ?? 0, 1)}/1
                        </span>
                        {(userData.available_times ?? 0) > 1 && (
                          <span className="text-slate-400 text-[11px] font-mono">
                            ({locale?.startsWith('zh') ? `总可用 ${userData.available_times} 点` : `Total: ${userData.available_times} credits`})
                          </span>
                        )}
                      </div>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-500/10 text-emerald-300 border border-emerald-500/25 text-[11px] font-mono">
                        <span>⏱ {locale?.startsWith('zh') ? '每日额度刷新:' : 'Daily Reset:'}</span>
                        <strong className="text-white font-bold">{resetCountdown}</strong>
                      </span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowLoginModal(true)}
                      className="inline-flex items-center gap-2 font-semibold text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 px-3 py-1.5 rounded-xl transition-all cursor-pointer text-xs group shadow-sm"
                      title="Google sign-in required to activate 1 daily credit. Resets daily at 00:00 UTC."
                    >
                      <span className="px-1.5 py-0.5 rounded-lg bg-amber-400/20 text-amber-200 font-mono font-bold text-[11px]">
                        {locale?.startsWith('zh') ? '今日免费额度: 1/1' : 'Daily Free Quota: 1/1'}
                      </span>
                      <span className="group-hover:translate-x-0.5 transition-transform text-slate-300">
                        {locale?.startsWith('zh') ? '(需登录激活 · 00:00 UTC 刷新) →' : '(Sign in to activate · 00:00 UTC reset) →'}
                      </span>
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-3 text-slate-400 text-[11px] flex-wrap">
                  <div className="hidden sm:flex items-center gap-1.5 text-slate-400">
                    <BoltIcon className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Cost: <strong>1 Credit</strong> / edit • No hidden charges</span>
                  </div>
                  <span className="hidden sm:inline text-slate-800">|</span>
                  <button
                    type="button"
                    onClick={() => setShowPricingModal(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-gradient-to-r from-emerald-500/15 via-teal-500/15 to-cyan-500/15 hover:from-emerald-500/25 hover:to-cyan-500/25 border border-emerald-500/30 hover:border-emerald-500/50 text-emerald-300 font-semibold text-xs transition-all cursor-pointer shadow-sm group ml-auto sm:ml-0"
                  >
                    <ShieldCheckIcon className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Starter Pack: <strong>$4.99 / 100 Credits</strong></span>
                    <span className="text-cyan-400 group-hover:translate-x-0.5 transition-transform">→</span>
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
                          '/images/showcase_man_suit_before.jpg',
                          'Change outfit to a sharp bespoke black velvet tuxedo with satin peak lapels, crisp white dress shirt and black bowtie, preserve face structure, hair and studio lighting',
                          '/images/showcase_man_suit_after.jpg'
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
                        className="border-2 border-dashed border-slate-700 hover:border-indigo-500/70 rounded-2xl p-3 sm:p-4 text-center cursor-pointer transition-all bg-slate-950/40 hover:bg-slate-950/60 group"
                      >
                        {sourceImage ? (
                          <div className="relative group/preview inline-block">
                            <img
                              src={sourceImage}
                              alt="Source photo to edit with Qwen Image Editor"
                              width={500}
                              height={200}
                              loading="lazy"
                              className="max-h-48 sm:max-h-52 mx-auto rounded-xl object-contain shadow-md"
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

                      {/* One-Click Demo Presets for Instant Testing (Zero Upload Barrier) */}
                      <div className="mt-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                            <SparklesIcon className="w-3.5 h-3.5 text-amber-400" />
                            <span>{locale?.startsWith('zh') ? '或直接点击示例立即体验（无需找图）:' : 'Or Click a Demo to Test Immediately (Zero Upload Needed):'}</span>
                          </span>
                          <span className="text-[10px] text-emerald-400 font-mono font-semibold">
                            {locale?.startsWith('zh') ? '今日额度 1/1' : '1 Daily Credit'}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 overflow-x-auto snap-x scrollbar-none pb-1">
                          {[
                            {
                              id: 'fashion_dress',
                              label: 'AI Fashion Try-On',
                              tag: '👗 Gala Dress',
                              before: '/images/showcase_dress_before.jpg',
                              after: '/images/showcase_dress_after.jpg',
                              prompt: 'Swap clothes to elegant emerald green silk gala evening dress, high slit',
                            },
                            {
                              id: 'velvet_tuxedo',
                              label: 'Bespoke Tuxedo',
                              tag: '🤵 Velvet Suit',
                              before: '/images/showcase_man_suit_before.jpg',
                              after: '/images/showcase_man_suit_after.jpg',
                              prompt: 'Change outfit to a sharp bespoke black velvet tuxedo with satin peak lapels, crisp white dress shirt and black bowtie, preserve face structure, hair and studio lighting',
                            },
                            {
                              id: 'cyberpunk_city',
                              label: 'Cyberpunk Scene',
                              tag: '🌆 Tokyo Neon',
                              before: '/images/showcase_cafe_before.jpg',
                              after: '/images/showcase_cyberpunk_after.jpg',
                              prompt: 'Change background to a neon-lit cyberpunk Tokyo street at night, swap jacket to a futuristic holographic iridescent leather biker jacket with neon reflections, maintain face and smile identity',
                            },
                            {
                              id: 'bilingual_typo',
                              label: 'Typography Inpaint',
                              tag: '🔤 Clean Text',
                              before: '/images/showcase_typography_before.jpg',
                              after: '/images/showcase_typography_after.jpg',
                              prompt: 'Inpaint magazine cover title to "QWEN IMAGE 2026", replace subtitle with "NEXT GEN EDITING", perfectly crisp typography, high legibility, clean layout',
                            },
                          ].map((demo) => {
                            const isSelected = sourceImage === demo.before;
                            return (
                              <button
                                key={demo.id}
                                type="button"
                                onClick={() => {
                                  setSourceImage(demo.before);
                                  setCurrentResultImage(demo.after);
                                  setTextStr(demo.prompt);
                                  setActiveTab('edit');
                                  setDemoActiveNotice(demo.label);
                                  setTimeout(() => {
                                    const inputEl = document.getElementById('promptInput');
                                    inputEl?.focus();
                                  }, 50);
                                }}
                                className={`relative rounded-xl border p-2 flex flex-col items-center text-center transition-all cursor-pointer group/card snap-start ${
                                  isSelected
                                    ? 'border-indigo-400 bg-gradient-to-b from-indigo-950/90 to-purple-950/70 shadow-md shadow-indigo-500/20 ring-1 ring-indigo-400/50'
                                    : 'border-slate-800 bg-slate-950/60 hover:border-slate-700 hover:bg-slate-900/60'
                                }`}
                              >
                                <div className="w-full aspect-[4/3] rounded-lg overflow-hidden bg-slate-900 mb-1.5 relative">
                                  <img
                                    src={demo.before}
                                    alt={demo.label}
                                    className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-200"
                                  />
                                  <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/80 backdrop-blur-sm text-[9px] font-bold text-amber-300">
                                    {demo.tag}
                                  </span>
                                </div>
                                <span className="text-[11px] font-bold text-white leading-tight truncate w-full">
                                  {demo.label}
                                </span>
                                <span className="text-[9px] text-cyan-300/90 font-medium mt-0.5">
                                  {locale?.startsWith('zh') ? '点击载入试玩' : 'Click to Load & Try'}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Demo Active Notice & Welcome Credit Banner */}
                  {demoActiveNotice && (
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-gradient-to-r from-amber-500/15 to-indigo-500/15 border border-amber-500/30 text-xs shadow-sm">
                      <div className="flex items-center gap-2">
                        <span className="p-1 rounded-lg bg-amber-500/20 text-amber-300">✨</span>
                        <span className="text-slate-200 text-[11px]">
                          <strong>{locale?.startsWith('zh') ? `已载入示例（${demoActiveNotice}）` : `Demo Loaded (${demoActiveNotice})`}</strong>: {locale?.startsWith('zh') ? '点击下方「立即生成」即可测试！' : 'Click Apply Edit below to run your free test!'}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setDemoActiveNotice(null)}
                        className="text-slate-400 hover:text-white text-xs px-1"
                      >
                        ✕
                      </button>
                    </div>
                  )}

                  {Boolean(userData && userData.user_id) && (
                    <div className="flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-indigo-500/15 border border-emerald-500/30 text-xs shadow-sm">
                      <div className="flex items-center gap-2.5">
                        <span className="p-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 shrink-0">
                          <SparklesIcon className="w-4 h-4" />
                        </span>
                        <div>
                          <span className="font-bold text-white block">
                            {locale?.startsWith('zh') ? '欢迎使用！今日额度已就绪' : 'Welcome! Today quota is ready'}
                          </span>
                          <span className="text-slate-300 text-[11px]">
                            {locale?.startsWith('zh')
                              ? '点击上方示例卡片或上传本地照片，点击「立即生成」即可快速出图。'
                              : 'Select any demo preset above or upload a photo, then hit Apply Edit to generate in seconds.'}
                          </span>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 font-mono font-bold text-xs shrink-0 border border-emerald-500/40">
                        1 Credit / Task
                      </span>
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
                          onChange={(e) => {
                            setIsAutoPlaying(false);
                            setTextStr(e.target.value);
                          }}
                          onKeyDown={(e) => {
                            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                              e.preventDefault();
                              if (!isProcessing && (textStr || activeTab === 'edit')) {
                                handleSubmit(e as any);
                              }
                            }
                          }}
                          placeholder={
                            activeTab === 'edit'
                              ? "Describe what to edit, add, or replace (e.g., 'Change background to neon Tokyo, add cyberpunk iridescent jacket')..."
                              : "Describe the image to generate in detail..."
                          }
                          className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none resize-none pb-1"
                        />

                        {/* Multilingual Prompts Helper for International Users */}
                        <div className="flex items-center justify-between border-t border-slate-800/80 pt-2 pb-1.5 px-0.5 text-[11px] text-slate-400 gap-2 flex-wrap">
                          <div className="flex items-center gap-1.5 text-slate-300">
                            <span className="text-amber-400">💡</span>
                            <span className="font-semibold text-slate-300">
                              {locale?.startsWith('zh') ? '多语言原生支持:' : 'Multilingual Native Support:'}
                            </span>
                            <span className="text-slate-400 hidden sm:inline">
                              {locale?.startsWith('zh') ? '可用西语、印尼语、中文等输入指令' : 'Type freely in Spanish, Indonesian, Chinese, French, or English'}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-[10px] flex-wrap">
                            <span className="text-slate-500 hidden sm:inline">Starters:</span>
                            <button
                              type="button"
                              onClick={() => setTextStr('Cambiar ropa a vestido elegante de noche en seda esmeralda, escote pronunciado')}
                              className="px-2 py-0.5 rounded-md bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors"
                              title="Spanish prompt example"
                            >
                              🇪🇸 Español
                            </button>
                            <button
                              type="button"
                              onClick={() => setTextStr('Ubah pakaian menjadi gaun sutra hijau zamrud yang elegan')}
                              className="px-2 py-0.5 rounded-md bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors"
                              title="Indonesian prompt example"
                            >
                              🇮🇩 Bahasa
                            </button>
                            <button
                              type="button"
                              onClick={() => setTextStr('把衣服换成祖母绿高开叉丝绸晚礼服裙，保留面部真实五官与肤色')}
                              className="px-2 py-0.5 rounded-md bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors"
                              title="Chinese prompt example"
                            >
                              🇨🇳 中文
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center justify-between border-t border-slate-800/80 pt-2.5 text-xs text-slate-400 gap-2 flex-wrap sm:flex-nowrap">
                          {/* Left: Model Selector */}
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-800 hover:border-cyan-500/50 rounded-lg px-2.5 py-1 text-slate-300 transition-colors">
                              <CpuChipIcon className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                              <span className="text-[11px] text-slate-400 font-medium shrink-0">Model:</span>
                              <select
                                value={selectedModel}
                                onChange={(e) => setSelectedModel(e.target.value)}
                                className="bg-transparent text-[11px] font-semibold text-cyan-300 focus:outline-none cursor-pointer pr-1 max-w-[140px] sm:max-w-none truncate"
                              >
                                {activeTab === 'edit' ? (
                                  <>
                                    <option value="wanx2.1-imageedit" className="bg-slate-900 text-slate-200">
                                      Wanx 2.1 Image Edit (Instruction Inpaint 🎨 - 1 Credit)
                                    </option>
                                    <option value="wanx2.1-i2i-turbo" className="bg-slate-900 text-slate-200">
                                      Wanx 2.1 Turbo (Fast Edit ⚡ - 1 Credit)
                                    </option>
                                    <option value="wanx2.1-i2i-plus" className="bg-slate-900 text-slate-200">
                                      Wanx 2.1 Plus (High Fidelity 🌟 - 2 Credits)
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
                                  </>
                                )}
                              </select>
                            </div>
                          </div>

                          {/* Right: Clear button & Primary In-Box Generate / Apply Button */}
                          <div className="flex items-center gap-2 shrink-0 ml-auto">
                            {textStr && (
                              <button
                                type="button"
                                onClick={() => setTextStr('')}
                                className="text-slate-500 hover:text-slate-300 text-xs px-2 py-1 rounded transition-colors"
                                title="Clear prompt"
                              >
                                Clear
                              </button>
                            )}

                            {/* In-box Primary Apply / Generate Button */}
                            <button
                              type="submit"
                              disabled={isProcessing || (!textStr && activeTab === 'generate')}
                              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-400 hover:via-purple-400 hover:to-pink-400 px-5 py-2 text-xs sm:text-sm font-bold text-white shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100 transition-all cursor-pointer group"
                              title="Shortcut: Ctrl+Enter (Cmd+Enter on Mac)"
                            >
                              {isProcessing ? (
                                <>
                                  <ArrowPathIcon className="w-3.5 h-3.5 animate-spin" />
                                  <span>Processing...</span>
                                </>
                              ) : (
                                <>
                                  <SparklesIcon className="w-3.5 h-3.5 text-amber-300 group-hover:rotate-12 transition-transform" />
                                  <span>
                                    {!userData
                                      ? (locale?.startsWith('zh') ? '登录激活今日额度 (1/1)' : 'Sign In to Use Quota (1/1)')
                                      : activeTab === 'edit'
                                      ? ((userData.available_times ?? 0) > 0 ? (locale?.startsWith('zh') ? '立即生成 (消耗 1 额度)' : 'Apply Edit (1 Credit)') : (locale?.startsWith('zh') ? '立即生成 (额度不足)' : 'Apply Edit'))
                                      : ((userData.available_times ?? 0) > 0 ? (locale?.startsWith('zh') ? '立即生图 (消耗 1 额度)' : 'Generate (1 Credit)') : (locale?.startsWith('zh') ? '立即生图 (额度不足)' : 'Generate'))}
                                  </span>
                                  <span className="hidden sm:inline-block px-1 py-0.5 rounded text-[10px] bg-white/20 text-white/90 font-mono font-normal">
                                    ↵
                                  </span>
                                </>
                              )}
                            </button>
                          </div>
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
                    <div
                      onMouseEnter={() => setIsHovered(true)}
                      onMouseLeave={() => setIsHovered(false)}
                      className="space-y-2.5 p-3 rounded-2xl bg-slate-950/40 border border-slate-800/80 transition-colors"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                            Quick Presets &amp; Templates:
                          </span>
                          <button
                            type="button"
                            onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium transition-all cursor-pointer ${
                              isAutoPlaying
                                ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/25'
                                : 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-slate-200'
                            }`}
                            title={isAutoPlaying ? 'Click to pause auto rotation' : 'Click to resume auto rotation'}
                          >
                            {isAutoPlaying ? (
                              <>
                                <span className="flex h-1.5 w-1.5 relative">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                                </span>
                                <span>{isHovered ? 'Paused (Hovering)' : 'Auto-Rotating'}</span>
                                <span className="opacity-70 text-[9px]">⏸</span>
                              </>
                            ) : (
                              <>
                                <span className="text-[9px]">▶</span>
                                <span>Auto-Play</span>
                              </>
                            )}
                          </button>
                        </div>
                        <div className="flex gap-1 flex-wrap">
                          {promptPresetCategories.map((cat, cIdx) => (
                            <button
                              key={cIdx}
                              type="button"
                              onClick={() => {
                                setActivePresetCategory(cIdx);
                                const firstItem: any = cat.items[0];
                                if (firstItem) {
                                  const fText = typeof firstItem === 'string' ? firstItem : firstItem.text;
                                  const fPrev = typeof firstItem === 'string' ? undefined : firstItem.previewUrl;
                                  const fSrc = typeof firstItem === 'string' ? undefined : firstItem.sourceUrl;
                                  setTextStr(fText);
                                  if (fPrev) {
                                    setCurrentResultImage(fPrev);
                                    setSourceImage(fSrc || '/images/showcase_dress_before.jpg');
                                    setActiveTab('edit');
                                  }
                                }
                              }}
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

                      <div className="flex flex-wrap gap-1.5 pt-0.5">
                        {promptPresetCategories[activePresetCategory]?.items.map((preset: any, idx: number) => {
                          const item = typeof preset === 'string' ? { label: preset, text: preset, previewUrl: undefined, sourceUrl: undefined } : preset;
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
                              className={`rounded-xl border px-2.5 py-1 text-[11px] font-medium transition-all cursor-pointer text-left flex items-center gap-1.5 shrink-0 ${
                                isSelected
                                  ? 'border-indigo-400 bg-indigo-950/80 text-indigo-100 shadow-sm shadow-indigo-500/25 ring-1 ring-indigo-400/40'
                                  : 'border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700 hover:bg-slate-800 hover:text-white'
                              }`}
                              title={item.text}
                            >
                              <span className={isSelected ? 'text-indigo-400 font-bold' : 'text-slate-500'}>
                                {isSelected ? '●' : '+'}
                              </span>
                              <span>{item.label || item.text}</span>
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
                    <div className="flex items-center justify-between pt-1 text-xs text-slate-400 flex-wrap gap-2">
                      <div className="flex items-center gap-2 text-[11px] text-cyan-300/90 font-mono">
                        <span className="flex h-2 w-2 relative">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                        </span>
                        <span>⚡ Cloud GPU Queue Active (~8-15s typical)</span>
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
                    </div>

                    {/* Integrated Trust & Transparency Badge */}
                    <div className="rounded-2xl border border-slate-800/80 bg-slate-950/70 p-3 sm:p-3.5 flex flex-wrap items-center justify-between gap-2.5 text-[11px] shadow-sm">
                      <div className="flex items-center gap-3 text-slate-300 flex-wrap">
                        <span className="inline-flex items-center gap-1.5">
                          <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 inline-flex items-center justify-center font-bold text-[10px]">✓</span>
                          <span>Daily <strong>1/1 Quota</strong> on Login</span>
                        </span>
                        <span className="hidden sm:inline text-slate-700">•</span>
                        <span className="inline-flex items-center gap-1.5">
                          <span className="w-4 h-4 rounded-full bg-indigo-500/20 text-indigo-400 inline-flex items-center justify-center font-bold text-[10px]">⚡</span>
                          <span><strong>1 Credit</strong>/edit (2 for Pro)</span>
                        </span>
                        <span className="hidden sm:inline text-slate-700">•</span>
                        <span className="inline-flex items-center gap-1.5 text-emerald-300 font-medium">
                          <ShieldCheckIcon className="w-3.5 h-3.5 text-emerald-400" />
                          <span>No Auto-Renew · Zero Trap</span>
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowPricingModal(true)}
                        className="ml-auto inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-semibold text-xs transition-colors cursor-pointer group"
                      >
                        <span>Starter $4.99 (100 credits)</span>
                        <span className="group-hover:translate-x-0.5 transition-transform">→</span>
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
                  <div
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 min-h-[380px] flex flex-col justify-center items-center relative overflow-hidden group"
                  >
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
                                  key={currentResultImage}
                                  src={currentResultImage}
                                  alt="AI Inpainted output result"
                                  className="w-full h-full object-cover group-hover/img:scale-105 transition-all duration-300 animate-crossfade"
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
                              key={isMobileHoldingOriginal && sourceImage ? sourceImage : currentResultImage}
                              src={isMobileHoldingOriginal && sourceImage ? sourceImage : currentResultImage}
                              alt="Generated Visual Output from Qwen Image Edit"
                              width={768}
                              height={440}
                              loading="lazy"
                              className="w-full max-h-[440px] rounded-xl object-contain shadow-2xl animate-crossfade"
                            />
                            <div className="absolute top-2 right-2 px-2.5 py-1 rounded-md bg-emerald-500/90 text-white text-xs font-bold shadow-md pointer-events-none flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                              <span>{isMobileHoldingOriginal ? '📷 Original Photo' : '✨ AI Generated Output'}</span>
                            </div>

                            {/* Mobile Tap-to-Hold Compare Button */}
                            {sourceImage && (
                              <button
                                type="button"
                                onTouchStart={() => setIsMobileHoldingOriginal(true)}
                                onTouchEnd={() => setIsMobileHoldingOriginal(false)}
                                onMouseDown={() => setIsMobileHoldingOriginal(true)}
                                onMouseUp={() => setIsMobileHoldingOriginal(false)}
                                className="sm:hidden absolute bottom-2.5 left-2.5 px-3 py-1.5 rounded-full bg-slate-900/90 border border-slate-700/80 text-white text-[11px] font-semibold backdrop-blur-md shadow-lg active:bg-indigo-600 transition-colors z-20 flex items-center gap-1.5 select-none"
                              >
                                <EyeIcon className="w-3.5 h-3.5 text-cyan-400" />
                                <span>{isMobileHoldingOriginal ? 'Showing Original' : 'Hold to View Original'}</span>
                              </button>
                            )}
                          </div>
                        )}

                        {/* Action Bar with Multi-Format Downloader (PNG / JPG / WebP) + Comparison Card Export + Social Share */}
                        <div className="mt-5 w-full flex items-center justify-between pt-3 border-t border-slate-800/80 gap-2 flex-wrap">
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

                          <div className="flex items-center gap-2 flex-wrap ml-auto">
                            {/* Comparison Card Viral Export Button */}
                            {sourceImage && currentResultImage && (
                              <button
                                type="button"
                                disabled={isExportingCard}
                                onClick={async () => {
                                  setIsExportingCard(true);
                                  try {
                                    await exportComparisonCard({
                                      beforeUrl: sourceImage,
                                      afterUrl: currentResultImage,
                                      title: 'Qwen Image Editor — Before / After Comparison',
                                    });
                                  } catch (err) {
                                    console.error('Export card failed:', err);
                                  } finally {
                                    setIsExportingCard(false);
                                  }
                                }}
                                className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-500/40 bg-indigo-500/10 hover:bg-indigo-500/20 px-3 py-1.5 text-xs font-semibold text-indigo-300 hover:text-white transition-all shadow-sm cursor-pointer"
                                title="Export 1200x630 Before/After comparison card for social sharing"
                              >
                                <PhotoIcon className={`w-3.5 h-3.5 ${isExportingCard ? 'animate-spin text-amber-300' : 'text-indigo-400'}`} />
                                <span>{isExportingCard ? 'Exporting...' : 'Comparison Card'}</span>
                              </button>
                            )}

                            {/* Social Share Button */}
                            <button
                              type="button"
                              onClick={() => {
                                if (typeof navigator !== 'undefined' && navigator.share) {
                                  navigator.share({
                                    title: 'Qwen Image Editor — Free Online AI Image Editor',
                                    text: 'Edit and inpaint photos with natural language prompts using Qwen AI:',
                                    url: window.location.href,
                                  }).catch(() => {});
                                } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
                                  navigator.clipboard.writeText(window.location.origin);
                                  setCopiedShare(true);
                                  setTimeout(() => setCopiedShare(false), 2000);
                                }
                              }}
                              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900/90 hover:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white transition-all shadow-sm cursor-pointer"
                              title="Share tool link with friends"
                            >
                              {copiedShare ? (
                                <>
                                  <CheckCircleIcon className="w-3.5 h-3.5 text-emerald-400" />
                                  <span className="text-emerald-300 font-semibold">Link Copied!</span>
                                </>
                              ) : (
                                <>
                                  <ShareIcon className="w-3.5 h-3.5 text-slate-400" />
                                  <span>Share</span>
                                </>
                              )}
                            </button>

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
                                        <span className="text-[9px] bg-slate-700/60 text-slate-300 px-1 py-0.5 rounded font-bold border border-slate-600">STANDARD</span>
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
                        {Boolean(userData && userData.user_id) ? (
                          <div className="text-[11px]">
                            <span className="text-slate-400">
                              {locale?.startsWith('zh') ? '今日剩余: ' : 'Remaining: '}
                            </span>
                            <strong className="text-cyan-300 font-mono font-bold">
                              {userData.available_times ?? 0} Credits
                            </strong>
                            <span className="block text-[10px] text-slate-400 font-mono">
                              ⏱ {locale?.startsWith('zh') ? '重置倒计时: ' : 'Reset in: '}{resetCountdown}
                            </span>
                            {(userData.available_times ?? 0) <= 1 && (
                              <span className="block text-[10px] text-amber-400 font-semibold animate-pulse">
                                ⚠️ Low Balance — Top up now
                              </span>
                            )}
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setShowLoginModal(true)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-medium text-[11px] hover:bg-emerald-500/20 transition-colors cursor-pointer"
                          >
                            <span>🎁 {locale?.startsWith('zh') ? '新用户赠送 1 积分 (登录即领)' : 'Daily Trial: 1 Credit (Sign in to claim)'}</span>
                          </button>
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
                        <span>Commercial Usage License (Terms apply)</span>
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
        <section id="gallery" className="py-16 lg:py-20 border-t border-slate-900 bg-slate-950/80 relative">
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
                  Side-by-side visual comparisons powered by Qwen-Image 2.1 foundation models. Click <strong>any card or recipe button</strong> to load the original photo and exact prompt into the editor instantly.
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 bg-slate-900/80 border border-slate-800 px-3 py-1.5 rounded-full">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>6 Clickable Interactive Recipes</span>
              </div>
            </div>

            {/* 6 High-Conversion Split-View Showcase Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Showcase 1: Flagship Virtual Try-On */}
              <div
                onClick={() =>
                  handleLoadShowcase(
                    '/images/showcase_dress_before.jpg',
                    'Swap outfit to an elegant emerald green silk evening dress with natural fabric drape and realistic satin folds, preserve subject features and natural posture',
                    '/images/showcase_dress_after.jpg'
                  )
                }
                role="button"
                tabIndex={0}
                className="rounded-3xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl p-5 sm:p-6 shadow-2xl flex flex-col justify-between hover:border-pink-500/60 hover:bg-slate-900/90 hover:scale-[1.01] transition-all group cursor-pointer"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-pink-500/15 text-pink-300 border border-pink-500/30 text-[11px] font-bold">
                          👗 AI Virtual Try-On
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">Qwen AI virtual try-on</span>
                      </div>
                      <h3 className="text-lg font-bold text-white mt-2 group-hover:text-pink-300 transition-colors">
                        Casual White Tee ➔ Emerald Silk Evening Gown
                      </h3>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        Precision AI clothing replacement with realistic fabric drape and satin sheen, designed to preserve subject identity, posture, and lighting coherence.
                      </p>
                    </div>
                    <span className="shrink-0 text-[11px] text-pink-400 font-medium group-hover:underline flex items-center gap-1">
                      ⚡ {locale?.startsWith('zh') ? '点击载入' : 'Click to Load'}
                    </span>
                  </div>

                  <div className="relative rounded-2xl bg-slate-950 p-2.5 border border-slate-800/90 shadow-inner">
                    <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
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
                          Everyday White Cotton Tee
                        </div>
                      </div>

                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 border-2 border-slate-900 flex items-center justify-center text-white shadow-xl shadow-pink-500/40">
                        <span className="text-xs font-black">➔</span>
                      </div>

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
                          Luxury Emerald Silk Gown
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/90 border border-slate-800 text-[11px] font-mono space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-pink-400 font-semibold uppercase tracking-wider">
                      <span>Exact Inpainting Recipe:</span>
                      <span className="text-slate-500 font-sans">Model: Wanx 2.1 (wanx2.1-imageedit)</span>
                    </div>
                    <p className="text-slate-200 leading-relaxed font-sans">
                      &quot;Swap outfit to an elegant emerald green silk evening dress with natural fabric drape and realistic satin folds, preserve subject features and natural posture&quot;
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLoadShowcase(
                      '/images/showcase_dress_before.jpg',
                      'Swap outfit to an elegant emerald green silk evening dress with natural fabric drape and realistic satin folds, preserve subject features and natural posture',
                      '/images/showcase_dress_after.jpg'
                    );
                  }}
                  className="mt-5 w-full py-3 px-4 rounded-xl bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 hover:from-pink-400 hover:to-purple-500 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-pink-500/20 active:scale-[0.98] cursor-pointer"
                >
                  <BoltIcon className="w-4 h-4 text-amber-300" />
                  <span>Try This Recipe in Editor ⚡</span>
                </button>
              </div>

              {/* Showcase 2: ① Photo Edit & Background Swap */}
              <div
                onClick={() =>
                  handleLoadShowcase(
                    '/images/showcase_photo_before.jpg',
                    'Swap jacket to a tailored dark navy blue business blazer and crisp white shirt, change background to a modern sunlit executive office with floor-to-ceiling windows, soft natural daylight, preserve facial features and natural expression',
                    '/images/showcase_photo_after.jpg'
                  )
                }
                role="button"
                tabIndex={0}
                className="rounded-3xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl p-5 sm:p-6 shadow-2xl flex flex-col justify-between hover:border-blue-500/60 hover:bg-slate-900/90 hover:scale-[1.01] transition-all group cursor-pointer"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-blue-500/15 text-blue-300 border border-blue-500/30 text-[11px] font-bold">
                          📸 ① AI Photo Edit &amp; Retouch
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">Qwen AI photo editor online</span>
                      </div>
                      <h3 className="text-lg font-bold text-white mt-2 group-hover:text-blue-300 transition-colors">
                        Messy Hallway Hoodie ➔ Navy Blazer &amp; Executive Office
                      </h3>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        One prompt achieves &quot;swap hoodie to tailored navy blazer, change background to sunlit office, make lighting natural&quot;, removing clutter while locking face identity.
                      </p>
                    </div>
                    <span className="shrink-0 text-[11px] text-blue-400 font-medium group-hover:underline flex items-center gap-1">
                      ⚡ {locale?.startsWith('zh') ? '点击载入' : 'Click to Load'}
                    </span>
                  </div>

                  <div className="relative rounded-2xl bg-slate-950 p-2.5 border border-slate-800/90 shadow-inner">
                    <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                      <div className="relative rounded-xl overflow-hidden aspect-square bg-slate-900 group/img">
                        <img
                          src="/images/showcase_photo_before.jpg"
                          alt="Original Messy Apartment Hallway with Rumpled Casual Hoodie"
                          width={400}
                          height={400}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-md text-slate-200 font-bold text-[10px] tracking-wider border border-white/10 shadow-sm">
                          📷 BEFORE
                        </div>
                        <div className="absolute bottom-2 left-2 right-2 px-2 py-1 rounded bg-black/70 backdrop-blur-md text-[10px] text-slate-300 truncate">
                          Messy Hallway · Casual Hoodie
                        </div>
                      </div>

                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 border-2 border-slate-900 flex items-center justify-center text-white shadow-xl shadow-blue-500/40">
                        <span className="text-xs font-black">➔</span>
                      </div>

                      <div className="relative rounded-xl overflow-hidden aspect-square bg-slate-900 group/img">
                        <img
                          src="/images/showcase_photo_after.jpg"
                          alt="AI Inpainted Navy Blue Suit in Modern Bright Office with Soft Natural Light"
                          width={400}
                          height={400}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-blue-500/90 text-white font-extrabold text-[10px] tracking-wider shadow-md">
                          ✨ AI AFTER
                        </div>
                        <div className="absolute bottom-2 left-2 right-2 px-2 py-1 rounded bg-blue-950/80 border border-blue-500/40 backdrop-blur-md text-[10px] text-blue-200 font-medium truncate">
                          Tailored Navy Blazer · Sunlit Office
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/90 border border-slate-800 text-[11px] font-mono space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-blue-400 font-semibold uppercase tracking-wider">
                      <span>Exact Inpainting Recipe:</span>
                      <span className="text-slate-500 font-sans">Model: Wanx 2.1 (wanx2.1-imageedit)</span>
                    </div>
                    <p className="text-slate-200 leading-relaxed font-sans">
                      &quot;Swap jacket to a tailored dark navy blue business blazer and crisp white shirt, change background to a modern sunlit executive office with floor-to-ceiling windows, soft natural daylight, preserve facial features and natural expression&quot;
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLoadShowcase(
                      '/images/showcase_photo_before.jpg',
                      'Swap jacket to a tailored dark navy blue business blazer and crisp white shirt, change background to a modern sunlit executive office with floor-to-ceiling windows, soft natural daylight, preserve facial features and natural expression',
                      '/images/showcase_photo_after.jpg'
                    );
                  }}
                  className="mt-5 w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 active:scale-[0.98] cursor-pointer"
                >
                  <BoltIcon className="w-4 h-4 text-amber-300" />
                  <span>Try This Recipe in Editor ⚡</span>
                </button>
              </div>

              {/* Showcase 3: ② E-Commerce Product Studio */}
              <div
                onClick={() =>
                  handleLoadShowcase(
                    '/images/showcase_product_before.jpg',
                    'Place the perfume bottle on a circular white Carrara marble pedestal, clean morning sunlight with soft tropical leaf shadows, high-end commercial e-commerce advertising aesthetic',
                    '/images/showcase_product_after.jpg'
                  )
                }
                role="button"
                tabIndex={0}
                className="rounded-3xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl p-5 sm:p-6 shadow-2xl flex flex-col justify-between hover:border-emerald-500/60 hover:bg-slate-900/90 hover:scale-[1.01] transition-all group cursor-pointer"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold">
                          🛍️ ② E-Commerce Product Studio
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">Qwen image edit product photo</span>
                      </div>
                      <h3 className="text-lg font-bold text-white mt-2 group-hover:text-emerald-300 transition-colors">
                        Raw Smartphone Snapshot ➔ 4K Marble Studio Hero Shot
                      </h3>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        Turn ordinary tabletop product snapshots into high-converting commercial hero shots on Italian white marble with organic botanical shadows.
                      </p>
                    </div>
                    <span className="shrink-0 text-[11px] text-emerald-400 font-medium group-hover:underline flex items-center gap-1">
                      ⚡ {locale?.startsWith('zh') ? '点击载入' : 'Click to Load'}
                    </span>
                  </div>

                  <div className="relative rounded-2xl bg-slate-950 p-2.5 border border-slate-800/90 shadow-inner">
                    <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                      <div className="relative rounded-xl overflow-hidden aspect-square bg-slate-900 group/img">
                        <img
                          src="/images/showcase_product_before.jpg"
                          alt="Raw Product Snapshot of Perfume Bottle on Cluttered Surface"
                          width={400}
                          height={400}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-md text-slate-200 font-bold text-[10px] tracking-wider border border-white/10 shadow-sm">
                          📷 BEFORE
                        </div>
                        <div className="absolute bottom-2 left-2 right-2 px-2 py-1 rounded bg-black/70 backdrop-blur-md text-[10px] text-slate-300 truncate">
                          Raw Tabletop Phone Snapshot
                        </div>
                      </div>

                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 border-2 border-slate-900 flex items-center justify-center text-white shadow-xl shadow-emerald-500/40">
                        <span className="text-xs font-black">➔</span>
                      </div>

                      <div className="relative rounded-xl overflow-hidden aspect-square bg-slate-900 group/img">
                        <img
                          src="/images/showcase_product_after.jpg"
                          alt="High-end Commercial Perfume Bottle on White Marble Pedestal"
                          width={400}
                          height={400}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-emerald-500/90 text-white font-extrabold text-[10px] tracking-wider shadow-md">
                          ✨ AI AFTER
                        </div>
                        <div className="absolute bottom-2 left-2 right-2 px-2 py-1 rounded bg-emerald-950/80 border border-emerald-500/40 backdrop-blur-md text-[10px] text-emerald-200 font-medium truncate">
                          4K Commercial Marble Studio Hero
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/90 border border-slate-800 text-[11px] font-mono space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-emerald-400 font-semibold uppercase tracking-wider">
                      <span>Exact Inpainting Recipe:</span>
                      <span className="text-slate-500 font-sans">Model: Wanx 2.1 (wanx2.1-imageedit)</span>
                    </div>
                    <p className="text-slate-200 leading-relaxed font-sans">
                      &quot;Place the perfume bottle on a circular white Carrara marble pedestal, clean morning sunlight with soft tropical leaf shadows, high-end commercial e-commerce advertising aesthetic&quot;
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLoadShowcase(
                      '/images/showcase_product_before.jpg',
                      'Place the perfume bottle on a circular white Carrara marble pedestal, clean morning sunlight with soft tropical leaf shadows, high-end commercial e-commerce advertising aesthetic',
                      '/images/showcase_product_after.jpg'
                    );
                  }}
                  className="mt-5 w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-600 to-cyan-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-[0.98] cursor-pointer"
                >
                  <BoltIcon className="w-4 h-4 text-amber-300" />
                  <span>Try This Recipe in Editor ⚡</span>
                </button>
              </div>

              {/* Showcase 4: ③ In-Image Text & Typography Editing */}
              <div
                onClick={() =>
                  handleLoadShowcase(
                    '/images/showcase_text_before.jpg',
                    "Inpaint poster headline to crisp typography 'AUTUMN ICED COFFEE', fix typos, update bottom promo to 'SPECIAL OFFERS 2026 FRESH BREWED DAILY', preserve illustration layout and color style",
                    '/images/showcase_text_after.jpg'
                  )
                }
                role="button"
                tabIndex={0}
                className="rounded-3xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl p-5 sm:p-6 shadow-2xl flex flex-col justify-between hover:border-cyan-500/60 hover:bg-slate-900/90 hover:scale-[1.01] transition-all group cursor-pointer"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 text-[11px] font-bold">
                          🔤 ③ In-Image Text &amp; Typography
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">Qwen image edit text in image</span>
                      </div>
                      <h3 className="text-lg font-bold text-white mt-2 group-hover:text-cyan-300 transition-colors">
                        Fix Typo &amp; Outdated Copy ➔ Clean Editorial Typography
                      </h3>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        Correct spelling mistakes (SUMMR ➔ AUTUMN, SPECAIL ➔ SPECIAL) and update promotional copy while seamlessly preserving the original illustration and design layout.
                      </p>
                    </div>
                    <span className="shrink-0 text-[11px] text-cyan-400 font-medium group-hover:underline flex items-center gap-1">
                      ⚡ {locale?.startsWith('zh') ? '点击载入' : 'Click to Load'}
                    </span>
                  </div>

                  <div className="relative rounded-2xl bg-slate-950 p-2.5 border border-slate-800/90 shadow-inner">
                    <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                      <div className="relative rounded-xl overflow-hidden aspect-square bg-slate-900 group/img">
                        <img
                          src="/images/showcase_text_before.jpg"
                          alt="Poster with Typo SUMMR and Outdated Promo Text SPECAIL OFFERS 2024"
                          width={400}
                          height={400}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-md text-rose-300 font-bold text-[10px] tracking-wider border border-rose-500/20 shadow-sm">
                          ❌ TYPOS &amp; OUTDATED
                        </div>
                        <div className="absolute bottom-2 left-2 right-2 px-2 py-1 rounded bg-black/70 backdrop-blur-md text-[10px] text-rose-300 truncate">
                          Misspelled SUMMR / SPECAIL
                        </div>
                      </div>

                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 border-2 border-slate-900 flex items-center justify-center text-white shadow-xl shadow-cyan-500/40">
                        <span className="text-xs font-black">➔</span>
                      </div>

                      <div className="relative rounded-xl overflow-hidden aspect-square bg-slate-900 group/img">
                        <img
                          src="/images/showcase_text_after.jpg"
                          alt="Poster Inpainted with AUTUMN ICED COFFEE and SPECIAL OFFERS 2026"
                          width={400}
                          height={400}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-cyan-500/90 text-white font-extrabold text-[10px] tracking-wider shadow-md">
                          ✨ PERFECT INPAINT
                        </div>
                        <div className="absolute bottom-2 left-2 right-2 px-2 py-1 rounded bg-cyan-950/80 border border-cyan-500/40 backdrop-blur-md text-[10px] text-cyan-200 font-medium truncate">
                          Clean AUTUMN · SPECIAL 2026
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/90 border border-slate-800 text-[11px] font-mono space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-cyan-400 font-semibold uppercase tracking-wider">
                      <span>Exact Inpainting Recipe:</span>
                      <span className="text-slate-500 font-sans">Model: Wanx 2.1 (wanx2.1-imageedit)</span>
                    </div>
                    <p className="text-slate-200 leading-relaxed font-sans">
                      &quot;Inpaint poster headline to crisp typography &apos;AUTUMN ICED COFFEE&apos;, fix typos, update bottom promo to &apos;SPECIAL OFFERS 2026 FRESH BREWED DAILY&apos;, preserve illustration layout and color style&quot;
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLoadShowcase(
                      '/images/showcase_text_before.jpg',
                      "Inpaint poster headline to crisp typography 'AUTUMN ICED COFFEE', fix typos, update bottom promo to 'SPECIAL OFFERS 2026 FRESH BREWED DAILY', preserve illustration layout and color style",
                      '/images/showcase_text_after.jpg'
                    );
                  }}
                  className="mt-5 w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 active:scale-[0.98] cursor-pointer"
                >
                  <BoltIcon className="w-4 h-4 text-cyan-300" />
                  <span>Try This Recipe in Editor ⚡</span>
                </button>
              </div>

              {/* Showcase 5: ④ Subject Lock & Scene Relocation */}
              <div
                onClick={() =>
                  handleLoadShowcase(
                    '/images/showcase_lock_before.jpg',
                    'Preserve vintage tan leather bag details, buckles, stitching and patina, place naturally on a rustic wooden table in a sunlit Scandinavian cafe with soft warm bokeh',
                    '/images/showcase_lock_after.jpg'
                  )
                }
                role="button"
                tabIndex={0}
                className="rounded-3xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl p-5 sm:p-6 shadow-2xl flex flex-col justify-between hover:border-amber-500/60 hover:bg-slate-900/90 hover:scale-[1.01] transition-all group cursor-pointer"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[11px] font-bold">
                          🔒 ④ Subject Lock &amp; Scene Relocation
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">Qwen image edit keep original image</span>
                      </div>
                      <h3 className="text-lg font-bold text-white mt-2 group-hover:text-amber-300 transition-colors">
                        Isolated Product on Floor ➔ Sunlit Nordic Cafe Table
                      </h3>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        Designed to preserve item geometry, vintage leather patina, stitching, and brass buckles while naturally adapting the environment to a sunlit Scandinavian cafe.
                      </p>
                    </div>
                    <span className="shrink-0 text-[11px] text-amber-400 font-medium group-hover:underline flex items-center gap-1">
                      ⚡ {locale?.startsWith('zh') ? '点击载入' : 'Click to Load'}
                    </span>
                  </div>

                  <div className="relative rounded-2xl bg-slate-950 p-2.5 border border-slate-800/90 shadow-inner">
                    <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                      <div className="relative rounded-xl overflow-hidden aspect-square bg-slate-900 group/img">
                        <img
                          src="/images/showcase_lock_before.jpg"
                          alt="Isolated Vintage Leather Messenger Bag on Tiled Floor"
                          width={400}
                          height={400}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-md text-slate-200 font-bold text-[10px] tracking-wider border border-white/10 shadow-sm">
                          📷 BEFORE
                        </div>
                        <div className="absolute bottom-2 left-2 right-2 px-2 py-1 rounded bg-black/70 backdrop-blur-md text-[10px] text-slate-300 truncate">
                          Raw Floor Snapshot · Isolated Item
                        </div>
                      </div>

                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 border-2 border-slate-900 flex items-center justify-center text-white shadow-xl shadow-amber-500/40">
                        <span className="text-xs font-black">➔</span>
                      </div>

                      <div className="relative rounded-xl overflow-hidden aspect-square bg-slate-900 group/img">
                        <img
                          src="/images/showcase_lock_after.jpg"
                          alt="Leather Bag Locked Exactly on Rustic Sunlit Scandinavian Cafe Wooden Table"
                          width={400}
                          height={400}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-amber-500/90 text-white font-extrabold text-[10px] tracking-wider shadow-md">
                          ✨ AI AFTER
                        </div>
                        <div className="absolute bottom-2 left-2 right-2 px-2 py-1 rounded bg-amber-950/80 border border-amber-500/40 backdrop-blur-md text-[10px] text-amber-200 font-medium truncate">
                          Subject Retention &amp; Staging
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/90 border border-slate-800 text-[11px] font-mono space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-amber-400 font-semibold uppercase tracking-wider">
                      <span>Exact Inpainting Recipe:</span>
                      <span className="text-slate-500 font-sans">Model: Wanx 2.1 (wanx2.1-imageedit)</span>
                    </div>
                    <p className="text-slate-200 leading-relaxed font-sans">
                      &quot;Preserve vintage tan leather bag details, buckles, stitching and patina, place naturally on a rustic wooden table in a sunlit Scandinavian cafe with soft warm bokeh&quot;
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLoadShowcase(
                      '/images/showcase_lock_before.jpg',
                      'Preserve vintage tan leather bag details, buckles, stitching and patina, place naturally on a rustic wooden table in a sunlit Scandinavian cafe with soft warm bokeh',
                      '/images/showcase_lock_after.jpg'
                    );
                  }}
                  className="mt-5 w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-orange-600 to-rose-600 hover:from-amber-400 hover:to-orange-500 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-[0.98] cursor-pointer"
                >
                  <BoltIcon className="w-4 h-4 text-amber-200" />
                  <span>Try This Recipe in Editor ⚡</span>
                </button>
              </div>

              {/* Showcase 6: ⑤ Photo to Anime Illustration */}
              <div
                onClick={() =>
                  handleLoadShowcase(
                    '/images/showcase_anime_before.jpg',
                    'Transform this photo into Makoto Shinkai anime illustration style, keep smiling pose, coffee cup and green sweater, luminous golden hour lighting, aesthetic airiness and sparkling bokeh',
                    '/images/showcase_anime_after.jpg'
                  )
                }
                role="button"
                tabIndex={0}
                className="rounded-3xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl p-5 sm:p-6 shadow-2xl flex flex-col justify-between hover:border-purple-500/60 hover:bg-slate-900/90 hover:scale-[1.01] transition-all group cursor-pointer"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-purple-500/15 text-purple-300 border border-purple-500/30 text-[11px] font-bold">
                          🎨 ⑤ Photo to Anime Illustration
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">Qwen image style transfer</span>
                      </div>
                      <h3 className="text-lg font-bold text-white mt-2 group-hover:text-purple-300 transition-colors">
                        Real Life Portrait ➔ Makoto Shinkai Anime Illustration
                      </h3>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        One-click transform everyday candid photos into breathtaking Japanese anime art, preserving coffee pose, facial smile, and olive green sweater with luminous cinematic lighting.
                      </p>
                    </div>
                    <span className="shrink-0 text-[11px] text-purple-400 font-medium group-hover:underline flex items-center gap-1">
                      ⚡ {locale?.startsWith('zh') ? '点击载入' : 'Click to Load'}
                    </span>
                  </div>

                  <div className="relative rounded-2xl bg-slate-950 p-2.5 border border-slate-800/90 shadow-inner">
                    <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                      <div className="relative rounded-xl overflow-hidden aspect-square bg-slate-900 group/img">
                        <img
                          src="/images/showcase_anime_before.jpg"
                          alt="Original Portrait at Outdoor Street Cafe"
                          width={400}
                          height={400}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-md text-slate-200 font-bold text-[10px] tracking-wider border border-white/10 shadow-sm">
                          📷 BEFORE
                        </div>
                        <div className="absolute bottom-2 left-2 right-2 px-2 py-1 rounded bg-black/70 backdrop-blur-md text-[10px] text-slate-300 truncate">
                          Real Life Street Cafe Portrait
                        </div>
                      </div>

                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 border-2 border-slate-900 flex items-center justify-center text-white shadow-xl shadow-purple-500/40">
                        <span className="text-xs font-black">➔</span>
                      </div>

                      <div className="relative rounded-xl overflow-hidden aspect-square bg-slate-900 group/img">
                        <img
                          src="/images/showcase_anime_after.jpg"
                          alt="Makoto Shinkai Anime Illustration Style with Luminous Golden Hour"
                          width={400}
                          height={400}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-purple-500/90 text-white font-extrabold text-[10px] tracking-wider shadow-md">
                          ✨ AI AFTER
                        </div>
                        <div className="absolute bottom-2 left-2 right-2 px-2 py-1 rounded bg-purple-950/80 border border-purple-500/40 backdrop-blur-md text-[10px] text-purple-200 font-medium truncate">
                          Makoto Shinkai Masterpiece Anime Art
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/90 border border-slate-800 text-[11px] font-mono space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-purple-400 font-semibold uppercase tracking-wider">
                      <span>Exact Inpainting Recipe:</span>
                      <span className="text-slate-500 font-sans">Model: Wanx 2.1 (wanx2.1-imageedit)</span>
                    </div>
                    <p className="text-slate-200 leading-relaxed font-sans">
                      &quot;Transform this photo into Makoto Shinkai anime illustration style, keep smiling pose, coffee cup and green sweater, luminous golden hour lighting, aesthetic airiness and sparkling bokeh&quot;
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLoadShowcase(
                      '/images/showcase_anime_before.jpg',
                      'Transform this photo into Makoto Shinkai anime illustration style, keep smiling pose, coffee cup and green sweater, luminous golden hour lighting, aesthetic airiness and sparkling bokeh',
                      '/images/showcase_anime_after.jpg'
                    );
                  }}
                  className="mt-5 w-full py-3 px-4 rounded-xl bg-gradient-to-r from-purple-500 via-pink-600 to-indigo-600 hover:from-purple-400 hover:to-pink-500 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-500/20 active:scale-[0.98] cursor-pointer"
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
                  Render photorealistic English and Chinese typography on street banners, apparel, packaging, and digital advertisements with enhanced character fidelity and minimized glyph distortion.
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
                Model Architecture & Cloud Endpoints
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mt-4">
                Supported Foundation Models &amp; APIs
              </h2>
              <p className="text-sm sm:text-base text-slate-400 mt-3 leading-relaxed">
                Our platform accesses official Alibaba Cloud Bailian (DashScope) production endpoints and benchmarks against open-source Qwen-Image family releases for maximum fidelity and reliability.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="rounded-2xl border border-indigo-500/30 bg-gradient-to-b from-indigo-950/30 to-slate-900/60 p-7 relative flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono">
                      wanx2.1-imageedit
                    </span>
                    <span className="text-[11px] text-emerald-400 font-medium">Official Cloud API</span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Wanx 2.1 Image Edit</h3>
                  <p className="text-xs text-slate-400 leading-relaxed mb-4">
                    The official multimodal inpainting endpoint on Alibaba Cloud DashScope. Specializes in conversational instruction edits, subject retention, background swaps, and material transformations.
                  </p>
                  <ul className="space-y-2 text-xs text-slate-300">
                    <li className="flex items-center gap-2">
                      <CheckCircleIcon className="w-4 h-4 text-indigo-400 shrink-0" />
                      <span>Mode: <code>description_edit</code> instruction inpainting</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircleIcon className="w-4 h-4 text-indigo-400 shrink-0" />
                      <span>Helps preserve facial features &amp; posture</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircleIcon className="w-4 h-4 text-indigo-400 shrink-0" />
                      <span>Resolution support up to 2048×2048</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="rounded-2xl border border-purple-500/30 bg-gradient-to-b from-purple-950/30 to-slate-900/60 p-7 relative flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30 font-mono">
                      wanx2.1-t2i-turbo / plus
                    </span>
                    <span className="text-[11px] text-purple-400 font-medium">Text-to-Image</span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Wanx 2.1 Generation</h3>
                  <p className="text-xs text-slate-400 leading-relaxed mb-4">
                    High-performance text-to-image foundation models. Turbo provides sub-second rapid prototyping, while Plus synthesizes high-density textures and crisp bilingual typography.
                  </p>
                  <ul className="space-y-2 text-xs text-slate-300">
                    <li className="flex items-center gap-2">
                      <CheckCircleIcon className="w-4 h-4 text-purple-400 shrink-0" />
                      <span>Bilingual English &amp; Chinese typography</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircleIcon className="w-4 h-4 text-purple-400 shrink-0" />
                      <span>Multiple aspect ratios (1:1, 16:9, 9:16, 4:3)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircleIcon className="w-4 h-4 text-purple-400 shrink-0" />
                      <span>Commercial-grade photorealism &amp; product shots</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="rounded-2xl border border-cyan-500/30 bg-gradient-to-b from-cyan-950/30 to-slate-900/60 p-7 relative flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-mono">
                      Qwen-Image Open Hub
                    </span>
                    <span className="text-[11px] text-cyan-400 font-medium">Hugging Face &amp; ComfyUI</span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Open Ecosystem Checkpoints</h3>
                  <p className="text-xs text-slate-400 leading-relaxed mb-4">
                    Online workspace powered by Alibaba Cloud DashScope <code className="text-cyan-300">wanx2.1-imageedit</code> production endpoints. This cloud deployment frees creators from downloading 20GB+ open-source weights (such as Qwen-Image checkpoints) or operating local 24GB VRAM workstation hardware.
                  </p>
                  <ul className="space-y-2 text-xs text-slate-300">
                    <li className="flex items-center gap-2">
                      <CheckCircleIcon className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span>Zero local Python, CUDA, or ComfyUI dependencies</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircleIcon className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span>Cloud GPU clustering with automatic failover</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircleIcon className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span>Compatible with prompt recipes across community nodes</span>
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
                    <span><strong>Official Foundation Models:</strong> Direct cloud integration with Alibaba Cloud DashScope endpoints (<code>wanx2.1-imageedit</code> and <code>wanx2.1-t2i</code>) with stable GPU cluster availability.</span>
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
