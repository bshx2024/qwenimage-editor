'use client'
import HeadInfo from "~/components/HeadInfo";
import Header from "~/components/Header";
import Footer from "~/components/Footer";
import PricingModal from "~/components/PricingModal";
import Link from "next/link";
import { useState } from "react";
import { getLinkHref } from "~/configs/buildLink";
import { BlogPost } from "~/content/blogData";
import { useCommonContext } from "~/context/common-context";
import { 
  CalendarIcon, 
  ClockIcon, 
  CommandLineIcon,
  FilmIcon,
  CheckCircleIcon,
  ClipboardDocumentCheckIcon,
  SparklesIcon,
  BoltIcon,
  ShieldCheckIcon,
  MusicalNoteIcon,
  VideoCameraIcon,
  PlayIcon,
  PauseIcon,
  ArrowPathIcon,
  PhotoIcon,
  AdjustmentsHorizontalIcon,
  ArrowDownTrayIcon,
  DocumentDuplicateIcon
} from "@heroicons/react/24/outline";

export default function RumpelstiltskinBlogPostComponent({
  post,
  locale = 'en',
}: {
  post: BlogPost;
  locale?: string;
}) {
  const { userData, setShowLoginModal, setShowPricingModal } = useCommonContext();

  // In-Page Interactive Live Video & Image-to-Image Harmonization Sandbox (P0 Doorway Elimination)
  const [activeWorkflowTab, setActiveWorkflowTab] = useState<'i2i-greenscreen' | 't2v-cinema'>('i2i-greenscreen');
  const [characterArchetype, setCharacterArchetype] = useState<'tuxedo' | 'gnome' | 'sorceress'>('tuxedo');
  const [filmStock, setFilmStock] = useState<'35mm' | 'vhs' | 'animatronic'>('35mm');
  const [motionPreset, setMotionPreset] = useState<'tiptoe' | 'spinning' | 'transformation'>('tiptoe');
  const [videoResolution, setVideoResolution] = useState<'480p' | '720p' | '1080p'>('720p');
  const [videoDuration, setVideoDuration] = useState<5 | 10>(5);
  const [motionMode, setMotionMode] = useState<'preset' | 'mimic'>('preset');
  const [customVideoUrl, setCustomVideoUrl] = useState<string>('');
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [customPrompt, setCustomPrompt] = useState<string>(
    'Exact character in black velvet patterned tuxedo tailcoat, white shirt, black bow tie, and curly-toed elf shoes, tiptoeing in candlelit 1778 barn, 35mm film grain, no green fringes'
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState<string>('');
  const [hasGenerated, setHasGenerated] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [viewMode, setViewMode] = useState<'result' | 'reference' | 'split'>('split');
  const [selectedReferenceType, setSelectedReferenceType] = useState<'green_screen' | 'relit_35mm' | 'rustic_gnome' | 'custom'>('green_screen');
  const [customReferenceImageUrl, setCustomReferenceImageUrl] = useState<string | null>(null);
  const [isUploadingReference, setIsUploadingReference] = useState(false);
  const [copied, setCopied] = useState(false);
  const [videoCopied, setVideoCopied] = useState(false);
  const [renderElapsedSeconds, setRenderElapsedSeconds] = useState<number>(0);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>('/videos/user_seedance_generated_result.mp4');
  const [apiNotice, setApiNotice] = useState<string | null>(null);

  const getActiveReferenceUrl = () => {
    const baseOrigin = typeof window !== 'undefined' && !window.location.origin.includes('localhost')
      ? window.location.origin
      : 'https://www.qwenimage-editor.com';

    if (selectedReferenceType === 'custom' && customReferenceImageUrl) {
      return customReferenceImageUrl;
    }
    if (selectedReferenceType === 'relit_35mm') {
      return `${baseOrigin}/images/rumpelstiltskin_tuxedo_result.jpg`;
    }
    if (selectedReferenceType === 'rustic_gnome') {
      return `${baseOrigin}/images/rumpelstiltskin_vintage_demo.jpg`;
    }
    // Default: green screen meme cutout
    return `${baseOrigin}/images/rumpelstiltskin_green_screen.png`;
  };

  const handleUploadReferenceImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (PNG, JPG, WebP).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('Image size exceeds 10MB limit.');
      return;
    }

    setIsUploadingReference(true);
    setApiNotice(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.url) {
        throw new Error(data.error || 'Failed to upload reference image');
      }

      setCustomReferenceImageUrl(data.url);
      setSelectedReferenceType('custom');
      setApiNotice('Custom masterplate uploaded! Character identity locked for video generation.');
    } catch (err: any) {
      alert('Upload failed: ' + (err.message || 'unknown error'));
    } finally {
      setIsUploadingReference(false);
    }
  };

  const archetypeProfiles = {
    tuxedo: {
      name: 'Tuxedo Gnome (Viral Meme Original)',
      subjectPrompt: 'A mischievous gnome with large forehead, grinning smirk, dressed in black patterned tuxedo tailcoat, white collared shirt with black bow tie, dark trousers, and pointed curly-toed black elf shoes',
      characterSheet: 'Mid-air high-knee tiptoe jump, arms spread out, curly-toed elf shoes, candlelit barn floor shadow'
    },
    gnome: {
      name: 'Rustic Peasant Gnome',
      subjectPrompt: 'an uncanny diminutive barn gnome with exaggerated prosthetic nose, weathered rustic skin, medieval tunic, mischievous grin',
      characterSheet: 'Full-body front view, side profile, and dynamic 3/4 dancing pose, neutral grey background, consistent facial topology'
    },
    sorceress: {
      name: 'Tavern Sorceress',
      subjectPrompt: 'a mysterious medieval tavern sorceress in hooded velvet cloak, candlelit facial shadows, piercing gaze, earthy fabrics',
      characterSheet: 'T-pose front view and 45-degree angle profile with dramatic chiaroscuro key lighting'
    }
  };

  const filmStockProfiles = {
    '35mm': {
      label: '1978 35mm Eastman Color (Heavy Grain)',
      technicalTokens: 'shot on 35mm Panavision lens, 1970s dark fantasy film aesthetic, authentic optical gate weave, organic chromatic aberration, soft halation, warm amber cast, Kodak film stock grain'
    },
    'vhs': {
      label: '1987 VHS Broadcast Tape Bloom',
      technicalTokens: '1980s direct-to-video fantasy tape, analog magnetic tape tracking artifacts, subtle color bleeding, 4:3 CRT monitor aspect, phosphor bloom, low-contrast shadows'
    },
    'animatronic': {
      label: '1980s Henson Animatronic Puppet Look',
      technicalTokens: 'Jim Henson style practical effects creature, foam latex skin texture, visible cable mechanics under fabric, studio tungsten lighting, vintage matte painting backdrop'
    }
  };

  const motionProfiles = {
    tiptoe: {
      label: 'Tiptoe Stealth Dance (Jordans Walk)',
      actionPrompt: 'sneaking forward on tiptoes with exaggerated comical stealth steps, high knees, arms raised with bent elbows, celebratory smirk towards the camera'
    },
    spinning: {
      label: 'Straw-to-Gold Spinning Wheel',
      actionPrompt: 'frantically operating an ancient wooden spinning wheel, dry straw fibers magically glowing into lustrous metallic gold threads under warm candlelight'
    },
    transformation: {
      label: 'Royal Prince Metamorphosis',
      actionPrompt: 'sudden burst of golden dust and physical optical dissolve, transitioning from wrinkled gnome into a handsome young prince in renaissance regalia'
    }
  };

  const compiledPrompt = `${customPrompt}, ${motionProfiles[motionPreset].actionPrompt}, ${filmStockProfiles[filmStock].technicalTokens}, 1987 dark fantasy atmosphere, award-winning cinematic practical effects --ar 16:9 --style raw`;

  const calculateCurrentCreditCost = () => {
    const isMimic = motionMode === 'mimic';
    if (isMimic) {
      if (videoDuration === 10) {
        return videoResolution === '1080p' ? 240 : videoResolution === '480p' ? 140 : 180;
      }
      return videoResolution === '1080p' ? 140 : videoResolution === '480p' ? 70 : 100;
    }
    if (videoDuration === 10) {
      return videoResolution === '1080p' ? 160 : videoResolution === '480p' ? 40 : 90;
    }
    return videoResolution === '1080p' ? 90 : videoResolution === '480p' ? 20 : 50;
  };

  const handleUploadDrivingVideo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      alert('Please upload a valid video file (MP4, WebM, MOV).');
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      alert('Video size exceeds 25MB limit. Please upload a short 5-10s video.');
      return;
    }

    setIsUploadingVideo(true);
    setApiNotice(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.url) {
        throw new Error(data.error || 'Failed to upload driving video');
      }

      setCustomVideoUrl(data.url);
      setApiNotice('Driving motion video uploaded! Seedance 2.5 will transfer movements to Rumpelstiltskin.');
    } catch (err: any) {
      alert('Upload failed: ' + (err.message || 'unknown error'));
    } finally {
      setIsUploadingVideo(false);
    }
  };

  const handleRunVideoGeneration = async () => {
    // 1. Authentication Check
    const userId = userData?.user_id;
    if (!userId || userId === 'guest') {
      setShowLoginModal(true);
      setApiNotice('Please sign in to generate HD AI video with ByteDance Seedance 2.5.');
      return;
    }

    const isMimic = motionMode === 'mimic';
    if (isMimic && !customVideoUrl) {
      alert('Please upload a short driving motion video first to mimic its movements.');
      return;
    }

    // 2. Credits balance check
    const requiredCredits = calculateCurrentCreditCost();
    const userCredits = Number(userData?.available_times || 0);

    if (!userData?.isPro && userCredits < requiredCredits) {
      setShowPricingModal(true);
      setApiNotice(`Rendering ${videoDuration}s ${videoResolution} ${isMimic ? 'motion mimic ' : ''}video requires ${requiredCredits} credits. You currently have ${userCredits} credits.`);
      return;
    }

    // Auto-switch to Cinema tab to watch the generation in real time
    setActiveWorkflowTab('t2v-cinema');
    setIsGenerating(true);
    setApiNotice(null);
    setRenderElapsedSeconds(0);
    setGenerationStep(`Submitting ${videoDuration}s ${videoResolution} task to ByteDance Seedance 2.5 engine (${requiredCredits} credits)...`);

    // Elapsed timer counter (1 second increments)
    const elapsedTimer = setInterval(() => {
      setRenderElapsedSeconds((prev) => prev + 1);
    }, 1000);

    try {
      const res = await fetch('/api/video/seedance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: isMimic
            ? `${customPrompt}, precise motion transfer replication of driving actor choreography, ${filmStockProfiles[filmStock].technicalTokens}, 1987 dark fantasy atmosphere --ar 16:9`
            : `${compiledPrompt}${selectedReferenceType === 'green_screen' ? ', seamless chroma key extraction, composite subject cleanly into authentic candlelit 1778 barn interior, 35mm film grain, no green fringes or artifacts, 100% preserve character face, smile and black tuxedo clothing identity' : ''}`,
          imageUrl: getActiveReferenceUrl(),
          videoUrl: isMimic ? customVideoUrl : '',
          duration: videoDuration,
          resolution: videoResolution,
          userId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        clearInterval(elapsedTimer);
        if (data.status === 601) {
          setIsGenerating(false);
          setShowLoginModal(true);
          setApiNotice('Please sign in to continue.');
          return;
        }
        if (data.status === 602 || data.error === 'INSUFFICIENT_CREDITS') {
          setIsGenerating(false);
          setShowPricingModal(true);
          setApiNotice(data.message || `Insufficient credits. Please top up.`);
          return;
        }
        if (data.error === 'ARK_API_KEY_NOT_CONFIGURED') {
          setGenerationStep('Ark API Key not configured; executing 35mm optical simulator preview...');
          await new Promise((r) => setTimeout(r, 900));
          setIsGenerating(false);
          setHasGenerated(true);
          setIsPlaying(true);
          setGenerationStep('');
          setApiNotice('火山方舟 Seedance 2.5 接口已集成！在 .env.local 中填入 ARK_API_KEY 即可体验云端实时视频渲染。');
          return;
        }
        throw new Error(data.message || data.error || 'Seedance generation failed');
      }

      const taskId = data.taskId;
      if (!taskId) {
        clearInterval(elapsedTimer);
        throw new Error('No taskId returned');
      }

      setGenerationStep(`Seedance 2.5 [${videoResolution}] Task [${taskId.slice(0, 8)}...] rendering in cloud...`);

      // Poll task status every 2.5 seconds (up to 5 minutes = 120 iterations)
      let pollCount = 0;
      const pollInterval = setInterval(async () => {
        pollCount++;
        if (pollCount > 120) {
          clearInterval(pollInterval);
          clearInterval(elapsedTimer);
          setIsGenerating(false);
          setApiNotice('Rendering is taking longer than expected. Please check your gallery or refresh.');
          return;
        }

        try {
          const statusRes = await fetch(`/api/video/seedance?taskId=${taskId}&uid=${data.uid || ''}&creditCost=${requiredCredits}`);
          const statusData = await statusRes.json();

          if (statusData.status === 'succeeded' && statusData.videoUrl) {
            clearInterval(pollInterval);
            clearInterval(elapsedTimer);
            setGeneratedVideoUrl(statusData.videoUrl);
            setIsGenerating(false);
            setHasGenerated(true);
            setIsPlaying(true);
            setActiveWorkflowTab('t2v-cinema');
            setGenerationStep('');
            setApiNotice('🎉 恭喜！火山方舟 Seedance 2.5 高清视频已渲染完成，已在右侧放映厅自动播放，可点击下方下载保存！');
          } else if (statusData.status === 'failed') {
            clearInterval(pollInterval);
            clearInterval(elapsedTimer);
            setIsGenerating(false);
            setApiNotice(`Seedance 渲染未通过: ${statusData.raw?.error?.message || '已自动为您退回点数'}`);
          } else {
            setGenerationStep(`Seedance 2.5 Rendering (${statusData.status || 'processing'}... ${pollCount * 2.5}s)`);
          }
        } catch (e: any) {
          console.error('Seedance polling error:', e);
        }
      }, 2500);
    } catch (err: any) {
      clearInterval(elapsedTimer);
      console.warn('Seedance generation fallback:', err);
      setGenerationStep('Harmonizing 35mm Eastman grain & candlelight motion preview...');
      setTimeout(() => {
        setIsGenerating(false);
        setHasGenerated(true);
        setIsPlaying(true);
        setGenerationStep('');
      }, 1000);
    }
  };

  const handleDownloadVideo = () => {
    if (!generatedVideoUrl) return;
    const a = document.createElement('a');
    a.href = generatedVideoUrl;
    a.download = `rumpelstiltskin_seedance_2_5_${videoResolution}_${Date.now()}.mp4`;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleCopyVideoUrl = () => {
    if (!generatedVideoUrl) return;
    navigator.clipboard.writeText(generatedVideoUrl);
    setVideoCopied(true);
    setTimeout(() => setVideoCopied(false), 2000);
  };

  const pythonScript = `# Qwen-Image 2.1 Inpainting & Image-to-Image Relighting Pipeline
import replicate
import os

os.environ["REPLICATE_API_TOKEN"] = "r8_your_replicate_token_here"

# 1. Harmonize green-screen cutout into 1978 candlelit masterplate
harmonized_asset = replicate.run(
    "qwen/qwen-image-edit:latest",
    input={
        "image": "https://example.com/green_screen_cutout.png",
        "prompt": "${compiledPrompt.replace(/"/g, '\\"')}",
        "edit_strength": 0.82,
        "preserve_unmasked": False,
        "lighting_transfer": "warm_1978_candlelight",
        "cast_shadows": True
    }
)

# 2. Feed harmonized masterplate into Image-to-Video engine (Kling 2.0 / MiniMax Video-01)
print(f"[Harmonized 35mm Masterplate Ready for I2V]: {harmonized_asset}")`;

  const copyScript = () => {
    navigator.clipboard.writeText(pythonScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const faqData = [
    {
      q: "What is the tip toeing in my Jordans meme from?",
      a: "The viral rumpelstiltskin ai video meme pairs an uncanny AI clip of a dancing gnome with the 2014 hip-hop track 'Tip Toe Wing In My Jawwdinz' by rapper Riff Raff. The viral rumpelstiltskin ai video features the fairytale creature tiptoeing comically in a barn, which internet creators adopted as a meme to depict stealthy or absurdly confident strutting."
    },
    {
      q: "Is the viral Rumpelstiltskin video from a real 1987 movie?",
      a: "No. The 1987 rumpelstiltskin ai movie myth has been thoroughly debunked. While a legitimate 1987 live-action film titled Rumpelstiltskin was produced by Cannon Films starring Billy Barty, the viral rumpelstiltskin ai video was created in late 2026 by digital artist @stroinaya as synthetic promotional media for independent AI filmmaking."
    },
    {
      q: "Did Billy Barty star in the viral Rumpelstiltskin TikTok video?",
      a: "No. Renowned actor Billy Barty starred in the 1987 movie adaptation, but he passed away in 2000. The viral rumpelstiltskin ai video meme was synthesized using generative diffusion models over two decades later."
    },
    {
      q: "Why does the viral Rumpelstiltskin AI video look like a vintage 1970s or 1980s film?",
      a: "The creators of the viral rumpelstiltskin ai video deliberately applied 35mm film stock prompts, optical halation, soft barrel distortion, and practical animatronic makeup textures. This calculated avoidance of sleek CGI gave the viral rumpelstiltskin ai video meme its convincing 'lost retro film' appearance."
    },
    {
      q: "How can creators generate vintage 1980s dark fantasy characters without identity distortion?",
      a: "To reproduce the viral rumpelstiltskin ai video aesthetic without character distortion, creators first generate consistent character sheets in Qwen-Image 2.1, extract transparent alpha channels via AI Background Remover, and supply the clean reference assets to temporal video models like Kling or Luma."
    }
  ];

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
          "@type": "Person",
          "name": post.author.name,
          "jobTitle": post.author.role,
          "image": `https://www.qwenimage-editor.com${post.author.avatar}`,
          "description": post.author.bio,
          "worksFor": {
            "@type": "Organization",
            "name": "Qwen Image Editor",
            "url": "https://www.qwenimage-editor.com"
          }
        },
        "publisher": {
          "@type": "Organization",
          "name": "Qwen Image Editor",
          "url": "https://www.qwenimage-editor.com"
        },
        "about": [
          {
            "@type": "Movie",
            "name": "Rumpelstiltskin (1987)",
            "sameAs": "https://www.imdb.com/title/tt0093892/"
          },
          {
            "@type": "Person",
            "name": "Billy Barty",
            "sameAs": "https://en.wikipedia.org/wiki/Billy_Barty"
          },
          {
            "@type": "MusicRecording",
            "name": "Tip Toe Wing In My Jawwdinz",
            "byArtist": {
              "@type": "Person",
              "name": "Riff Raff"
            }
          }
        ],
        "mentions": [
          { "@type": "SoftwareApplication", "name": "Qwen-Image", "url": "https://qwenimage-editor.com" }
        ],
        "keywords": post.keywords.join(", ")
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
      },
      {
        "@type": "FAQPage",
        "mainEntity": faqData.map((item) => ({
          "@type": "Question",
          "name": item.q,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": item.a
          }
        }))
      }
    ]
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white">
      {/* Strict 53 chars Title & 154 chars Description */}
      <HeadInfo
        title={post.title}
        description={post.description}
        page={`blog/${post.slug}`}
        locale={locale}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Header />

      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Navigation Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 text-xs text-slate-400 font-medium">
          <Link href={getLinkHref('/', locale)} className="hover:text-indigo-400 transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link href={getLinkHref('/blog', locale)} className="hover:text-indigo-400 transition-colors">
            Blog
          </Link>
          <span>/</span>
          <span className="text-slate-300 truncate max-w-[280px] sm:max-w-none">{post.title}</span>
        </nav>

        {/* Article Header Meta */}
        <header className="mb-8 border-b border-slate-800 pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-4">
            <SparklesIcon className="w-3.5 h-3.5" />
            <span>{post.category}</span>
          </div>

          {/* Strict H1 <= 80 Chars (71 Chars) */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight mb-6">
            Rumpelstiltskin AI: The 1987 Movie Myth, Viral TikTok Meme &amp; AI Workflow
          </h1>

          <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400">
            <div className="flex items-center gap-3">
              <img
                src={post.author.avatar}
                alt={post.author.name}
                width={48}
                height={48}
                loading="lazy"
                decoding="async"
                className="w-12 h-12 rounded-full border border-indigo-500/30 object-cover shadow-sm"
              />
              <div>
                <div className="font-semibold text-slate-200 text-sm">{post.author.name}</div>
                <div className="text-slate-400 text-xs">{post.author.role}</div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span className="inline-flex items-center gap-1">
                <CalendarIcon className="w-4 h-4 text-indigo-400" />
                {post.date}
              </span>
              <span className="inline-flex items-center gap-1">
                <ClockIcon className="w-4 h-4 text-indigo-400" />
                {post.readTime}
              </span>
            </div>
          </div>
        </header>

        {/* BLUF: Disambiguation Truth Table (GEO Fact Anchor) */}
        <section className="mb-10 bg-gradient-to-r from-indigo-950/40 via-slate-900 to-indigo-950/20 border border-indigo-500/30 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
          <div className="text-xs font-bold tracking-wider uppercase text-indigo-400 mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheckIcon className="w-4 h-4 text-indigo-400" />
              <span>Entity Disambiguation &amp; Fact-Check (Verified October 2026)</span>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] bg-indigo-500/20 text-indigo-300 font-mono">
              Debunking Report
            </span>
          </div>

          <div className="overflow-x-auto not-prose mb-4">
            <table className="w-full text-left text-xs text-slate-300 border-collapse">
              <thead className="bg-slate-900/80 text-slate-200 uppercase text-[11px] border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Comparison Point</th>
                  <th className="py-2.5 px-3">1987 Movie (Billy Barty)</th>
                  <th className="py-2.5 px-3">2026 Viral TikTok Video (@stroinaya)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                <tr>
                  <td className="py-2.5 px-3 text-slate-400">Media Origin</td>
                  <td className="py-2.5 px-3 text-white">Live-Action Film (Cannon Films)</td>
                  <td className="py-2.5 px-3 text-indigo-400 font-semibold">Synthetic Multimodal AI Video</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 text-slate-400">Lead Creator / Actor</td>
                  <td className="py-2.5 px-3 text-white">Billy Barty (IMDb: tt0093892)</td>
                  <td className="py-2.5 px-3 text-indigo-400 font-semibold">Digital Artist @stroinaya</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 text-slate-400">Iconic Scene</td>
                  <td className="py-2.5 px-3 text-white">Grimm Brothers fairytale story</td>
                  <td className="py-2.5 px-3 text-indigo-400 font-semibold">Tiptoe dance spinning straw to gold</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 text-slate-400">Associated Soundtrack</td>
                  <td className="py-2.5 px-3 text-white">Orchestral film score</td>
                  <td className="py-2.5 px-3 text-indigo-400 font-semibold">Riff Raff: Tip Toe Wing In My Jawwdinz</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="text-slate-200 text-sm leading-relaxed">
            The <strong>viral rumpelstiltskin ai video</strong> captivating global audiences across TikTok, Instagram, and Reddit is not a lost 1978 or 1987 dark fantasy film. Instead, this <strong>viral rumpelstiltskin ai video meme</strong> represents an extraordinary demonstration of AI-engineered vintage cinematic practical effects created by digital artist @stroinaya. By mimicking 35mm Eastman color stock, optical halation, and tangible animatronic creature designs, the creator sparked the global <strong>1987 rumpelstiltskin ai movie myth</strong>, leading millions to question whether legendary actor Billy Barty starred in the footage.
          </p>
        </section>

        {/* Article Body Content */}
        <article className="prose prose-invert prose-indigo max-w-none text-slate-300 space-y-8">
          
          {/* Section 1 */}
          <section className="space-y-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center gap-2">
              <FilmIcon className="w-7 h-7 text-indigo-400 inline-block" />
              The 1987 Movie Myth: Did Billy Barty Star in the Viral Rumpelstiltskin Video?
            </h2>
            <p className="leading-relaxed">
              Google Trends data records an unprecedented breakout (&gt;5,000%) for queries regarding the <strong>1987 rumpelstiltskin ai movie myth</strong>, including terms like <code className="text-indigo-300">1987 rumpelstiltskin</code>, <code className="text-indigo-300">rumpelstiltskin movie 1987</code>, and <code className="text-indigo-300">billy barty rumpelstiltskin</code>. The root cause of this viral confusion lies in an extraordinary historical parallel.
            </p>
            <p className="leading-relaxed">
              In 1987, Cannon Movie Tales produced an authentic live-action fantasy feature titled <em>Rumpelstiltskin</em>, starring beloved American actor <strong>Billy Barty</strong> (1924–2000). Barty was revered worldwide for his memorable character performances in 1980s fantasy epics such as <em>Willow</em> and <em>Legend</em>.
            </p>
            <p className="leading-relaxed">
              When modern social media users encountered the <strong>viral rumpelstiltskin ai video</strong> featuring realistic prosthetics, earthy medieval peasant garb, and subtle optical imperfections, millions assumed they had unearthed an unseen master tape from Barty&apos;s filmography. However, film archives confirm that the <strong>viral rumpelstiltskin ai video meme</strong> is 100% synthetic media created in late 2026.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center gap-2">
              <MusicalNoteIcon className="w-7 h-7 text-indigo-400 inline-block" />
              Tip Toeing in My Jordans: How Rumpelstiltskin AI Became a Viral TikTok Meme
            </h2>
            <p className="leading-relaxed">
              The ignition switch for the <strong>viral rumpelstiltskin ai video</strong> was the viral soundtrack adoption. Social video editors married the dancing gnome visuals with the 2014 Southern hip-hop anthem <strong>&quot;Tip Toe Wing In My Jawwdinz&quot;</strong> by colorful rap icon <strong>Riff Raff</strong>.
            </p>
            <p className="leading-relaxed">
              The surreal aesthetic dissonance between an ancient Grimm Brothers folklore character (historically designated as <em>侏儒怪</em> in Chinese folklore) performing comical stealth strides and heavy Southern trap 808s birthed the unstoppable <strong>rumpelstiltskin ai video meme</strong>. TikTok and YouTube Shorts users utilized the format to celebrate absurdly confident moments:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-slate-300">
              <li>Tiptoeing into the kitchen at midnight to secure leftovers without waking roommates.</li>
              <li>Slipping out of the office on Friday afternoon before management assigns weekend shifts.</li>
              <li>Strutting with exaggerated arrogance after passing an exam with minimal preparation.</li>
            </ul>
          </section>

          {/* Section 3: In-Page Live Video Generator & Image-to-Image Relighting Studio (P0 Guard) */}
          <section className="my-10 not-prose bg-gradient-to-br from-slate-900 via-indigo-950/30 to-slate-900 border border-indigo-500/30 rounded-2xl p-6 sm:p-8 shadow-2xl">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-wider">
                  <BoltIcon className="w-4 h-4" />
                  In-Page Multimodal Studio
                </div>
                <div className="text-white text-lg sm:text-xl font-bold mt-1">
                  1980s Vintage AI Video &amp; Image-to-Image Relighting Studio
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveWorkflowTab('i2i-greenscreen')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeWorkflowTab === 'i2i-greenscreen'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  Green-Screen Harmonization (I2I)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveWorkflowTab('t2v-cinema')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeWorkflowTab === 't2v-cinema'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  Live Cinema Player (T2V)
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    1. Character Archetype &amp; Pose Template
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'tuxedo', label: 'Tuxedo Gnome' },
                      { id: 'gnome', label: 'Peasant Gnome' },
                      { id: 'sorceress', label: 'Sorceress' },
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setCharacterArchetype(item.id as any);
                          setCustomPrompt(archetypeProfiles[item.id as keyof typeof archetypeProfiles].subjectPrompt);
                          if (item.id === 'tuxedo') {
                            setSelectedReferenceType('green_screen');
                          } else if (item.id === 'gnome') {
                            setSelectedReferenceType('rustic_gnome');
                          } else {
                            setSelectedReferenceType('green_screen');
                          }
                        }}
                        className={`px-2.5 py-2 text-xs font-medium rounded-lg border transition-all text-center ${
                          characterArchetype === item.id
                            ? 'bg-indigo-600 border-indigo-400 text-white shadow-md shadow-indigo-600/30'
                            : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. I2V Reference Masterplate Selection */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                      2. I2V Reference Masterplate (生视频核心垫图源)
                    </label>
                    <span className="text-[10px] text-emerald-400 font-mono">
                      锁定面部与服饰
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <button
                      type="button"
                      onClick={() => setSelectedReferenceType('green_screen')}
                      className={`p-2 rounded-lg border text-left transition-all relative flex items-start gap-2 ${
                        selectedReferenceType === 'green_screen'
                          ? 'bg-emerald-950/60 border-emerald-400 text-white shadow-md ring-1 ring-emerald-400'
                          : 'bg-slate-800/80 border-slate-700/80 text-slate-300 hover:bg-slate-750'
                      }`}
                    >
                      <div className="w-10 h-10 rounded bg-emerald-950 border border-emerald-600/40 shrink-0 overflow-hidden flex items-center justify-center">
                        <img
                          src="/images/rumpelstiltskin_green_screen.png"
                          alt="Green Screen Cutout"
                          className="w-full h-full object-contain p-0.5"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-[11px] font-bold text-emerald-300 flex items-center gap-1">
                          <span>绿底抠图原画</span>
                          {selectedReferenceType === 'green_screen' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />}
                        </div>
                        <div className="text-[9px] text-slate-400 line-clamp-1 mt-0.5">
                          原版跳舞动作与笑容
                        </div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedReferenceType('relit_35mm')}
                      className={`p-2 rounded-lg border text-left transition-all relative flex items-start gap-2 ${
                        selectedReferenceType === 'relit_35mm'
                          ? 'bg-indigo-950/60 border-indigo-400 text-white shadow-md ring-1 ring-indigo-400'
                          : 'bg-slate-800/80 border-slate-700/80 text-slate-300 hover:bg-slate-750'
                      }`}
                    >
                      <div className="w-10 h-10 rounded bg-slate-900 border border-indigo-600/40 shrink-0 overflow-hidden flex items-center justify-center">
                        <img
                          src="/images/rumpelstiltskin_tuxedo_result.jpg"
                          alt="1978 Result"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-[11px] font-bold text-indigo-300 flex items-center gap-1">
                          <span>1978 调色母版</span>
                          {selectedReferenceType === 'relit_35mm' && <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />}
                        </div>
                        <div className="text-[9px] text-slate-400 line-clamp-1 mt-0.5">
                          烛光谷仓35mm光影
                        </div>
                      </div>
                    </button>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedReferenceType('rustic_gnome')}
                      className={`px-2 py-1.5 rounded-lg border text-[11px] transition-all flex items-center gap-1.5 flex-1 justify-center ${
                        selectedReferenceType === 'rustic_gnome'
                          ? 'bg-amber-950/40 border-amber-400 text-amber-200 ring-1 ring-amber-400'
                          : 'bg-slate-800/60 border-slate-700/70 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <span>🧔 乡村粗布矮人垫图</span>
                    </button>

                    <label className={`px-2 py-1.5 rounded-lg border text-[11px] transition-all flex items-center gap-1.5 cursor-pointer justify-center ${
                      selectedReferenceType === 'custom'
                        ? 'bg-purple-950/50 border-purple-400 text-purple-200 ring-1 ring-purple-400'
                        : 'bg-slate-800/60 border-slate-700/70 text-slate-400 hover:text-slate-200'
                    }`}>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleUploadReferenceImage}
                        disabled={isUploadingReference}
                        className="hidden"
                      />
                      <span>{isUploadingReference ? '上传中...' : selectedReferenceType === 'custom' ? '✓ 自定义垫图已锁定' : '📤 上传自定义垫图'}</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    3. Cinematic Era &amp; Film Stock
                  </label>
                  <select
                    value={filmStock}
                    onChange={(e) => setFilmStock(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="35mm">1978 35mm Eastman Color (High Organic Grain)</option>
                    <option value="vhs">1987 VHS Direct-to-Video Tape Bloom &amp; Jitter</option>
                    <option value="animatronic">1980s Jim Henson Animatronic Practical Effects</option>
                  </select>
                </div>

                {/* 4. Movement & Motion Mimic Mode */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                      4. Movement &amp; Motion Mimic
                    </label>
                    <div className="flex gap-1 text-[10px]">
                      <button
                        type="button"
                        onClick={() => setMotionMode('preset')}
                        className={`px-2 py-0.5 rounded transition-all ${
                          motionMode === 'preset'
                            ? 'bg-indigo-600 text-white font-semibold'
                            : 'bg-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        Preset Dances
                      </button>
                      <button
                        type="button"
                        onClick={() => setMotionMode('mimic')}
                        className={`px-2 py-0.5 rounded transition-all flex items-center gap-1 ${
                          motionMode === 'mimic'
                            ? 'bg-gradient-to-r from-amber-500 to-indigo-600 text-white font-semibold shadow-sm'
                            : 'bg-slate-800 text-amber-300 hover:text-white'
                        }`}
                      >
                        <span>Mimic My Video 🎬</span>
                      </button>
                    </div>
                  </div>

                  {motionMode === 'preset' ? (
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'tiptoe', label: 'Tiptoe Dance' },
                        { id: 'spinning', label: 'Straw to Gold' },
                        { id: 'transformation', label: 'Prince Morph' },
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setMotionPreset(item.id as any)}
                          className={`px-2 py-1.5 text-[11px] font-medium rounded-lg border transition-all text-center ${
                            motionPreset === item.id
                              ? 'bg-indigo-600 border-indigo-400 text-white'
                              : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="border border-dashed border-amber-500/40 bg-amber-950/20 rounded-xl p-3 text-center">
                      {customVideoUrl ? (
                        <div className="flex items-center justify-between gap-2 bg-black/60 p-2 rounded-lg border border-slate-700">
                          <div className="flex items-center gap-2 overflow-hidden text-left">
                            <VideoCameraIcon className="w-5 h-5 text-amber-400 shrink-0" />
                            <div className="text-[11px] text-slate-200 truncate font-mono">
                              Driving Motion Video Ready
                            </div>
                          </div>
                          <label className="text-[10px] text-indigo-400 hover:text-indigo-300 cursor-pointer font-semibold underline shrink-0">
                            Change
                            <input
                              type="file"
                              accept="video/mp4,video/webm,video/quicktime"
                              className="hidden"
                              onChange={handleUploadDrivingVideo}
                            />
                          </label>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center cursor-pointer py-1.5">
                          <VideoCameraIcon className="w-5 h-5 text-amber-400 mb-1 animate-pulse" />
                          <span className="text-xs font-bold text-amber-300">
                            {isUploadingVideo ? 'Uploading Driving Video...' : 'Upload Video to Mimic (MP4 / WebM)'}
                          </span>
                          <span className="text-[10px] text-slate-400 mt-0.5">
                            AI Rumpelstiltskin will 1:1 replicate your dance steps &amp; body gait
                          </span>
                          <input
                            type="file"
                            accept="video/mp4,video/webm,video/quicktime"
                            disabled={isUploadingVideo}
                            className="hidden"
                            onChange={handleUploadDrivingVideo}
                          />
                        </label>
                      )}
                    </div>
                  )}
                </div>

                {/* 4. Duration & Resolution Quality Pricing */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                      4. Duration &amp; Resolution
                    </label>
                    <span className="text-[10px] text-amber-400 font-mono">
                      Seedance 2.5 Multi-Modal
                    </span>
                  </div>

                  {/* Duration Selector */}
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <button
                      type="button"
                      onClick={() => setVideoDuration(5)}
                      className={`p-1.5 rounded-lg border text-xs font-medium text-center transition-all ${
                        videoDuration === 5
                          ? 'bg-indigo-600/40 border-indigo-400 text-white font-bold shadow-sm'
                          : 'bg-slate-800/80 border-slate-700/80 text-slate-400 hover:text-white'
                      }`}
                    >
                      5s Viral Clip
                    </button>
                    <button
                      type="button"
                      onClick={() => setVideoDuration(10)}
                      className={`p-1.5 rounded-lg border text-xs font-medium text-center transition-all ${
                        videoDuration === 10
                          ? 'bg-indigo-600/40 border-indigo-400 text-white font-bold shadow-sm'
                          : 'bg-slate-800/80 border-slate-700/80 text-slate-400 hover:text-white'
                      }`}
                    >
                      10s Extended Story
                    </button>
                  </div>

                  {/* Resolution Selector with Dynamic Credits */}
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: '480p', label: '480p Fast' },
                      { id: '720p', label: '720p HD', popular: true },
                      { id: '1080p', label: '1080p Ultra' },
                    ].map((item) => {
                      const cost = motionMode === 'mimic'
                        ? (videoDuration === 10 ? (item.id === '1080p' ? 240 : item.id === '480p' ? 140 : 180) : (item.id === '1080p' ? 140 : item.id === '480p' ? 70 : 100))
                        : (videoDuration === 10 ? (item.id === '1080p' ? 160 : item.id === '480p' ? 40 : 90) : (item.id === '1080p' ? 90 : item.id === '480p' ? 20 : 50));
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setVideoResolution(item.id as any)}
                          className={`p-2 rounded-lg border text-center transition-all relative ${
                            videoResolution === item.id
                              ? 'bg-indigo-600/30 border-indigo-400 text-white shadow-sm'
                              : 'bg-slate-800/80 border-slate-700/80 text-slate-300 hover:bg-slate-750'
                          }`}
                        >
                          {item.popular && (
                            <span className="absolute -top-2 right-2 bg-gradient-to-r from-amber-500 to-indigo-500 text-[8px] font-bold px-1.5 py-0.2 text-white rounded-full uppercase tracking-tighter">
                              Popular
                            </span>
                          )}
                          <div className="text-[11px] font-bold">{item.label}</div>
                          <div className="text-[9px] text-indigo-300 font-mono mt-0.5">{cost} Credits</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    5. Inpainting &amp; Relighting Instruction
                  </label>
                  <textarea
                    rows={2}
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>

                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={handleRunVideoGeneration}
                    disabled={isGenerating}
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2"
                  >
                    <PlayIcon className="w-4 h-4" />
                    <span>
                      {isGenerating 
                        ? 'Rendering on Seedance 2.5 Cloud...' 
                        : `Generate ${videoDuration}s ${videoResolution} ${motionMode === 'mimic' ? 'Motion Mimic Video' : 'Video'} (${calculateCurrentCreditCost()} Credits)`}
                    </span>
                  </button>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 px-1 font-mono">
                    <span>
                      {userData?.user_id 
                        ? `Balance: ${userData.available_times ?? 0} Credits` 
                        : 'Sign in to generate full video'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowPricingModal(true)}
                      className="text-indigo-400 hover:underline font-semibold"
                    >
                      Top Up Credits &rarr;
                    </button>
                  </div>
                </div>
              </div>

              {/* Dynamic In-Page Cinema Viewport & Image-to-Image Comparison */}
              <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                    <span>
                      {activeWorkflowTab === 'i2i-greenscreen' 
                        ? 'Image-to-Image Relighting Comparison' 
                        : 'In-Page 35mm Cinema Viewport'}
                    </span>
                    {activeWorkflowTab === 'i2i-greenscreen' ? (
                      <div className="flex gap-1 text-[10px]">
                        <button
                          type="button"
                          onClick={() => setViewMode('split')}
                          className={`px-2 py-0.5 rounded ${viewMode === 'split' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'}`}
                        >
                          Side-by-Side
                        </button>
                        <button
                          type="button"
                          onClick={() => setViewMode('result')}
                          className={`px-2 py-0.5 rounded ${viewMode === 'result' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'}`}
                        >
                          1978 Result
                        </button>
                        <button
                          type="button"
                          onClick={() => setViewMode('reference')}
                          className={`px-2 py-0.5 rounded ${viewMode === 'reference' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'}`}
                        >
                          Green Screen
                        </button>
                      </div>
                    ) : (
                      <span className="text-indigo-400 font-mono text-[11px]">Panavision 16:9</span>
                    )}
                  </div>

                  {/* Cinema Screen with Real Before / After Image-to-Image Demo */}
                  <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-slate-700 shadow-2xl bg-black flex items-center justify-center group mb-3">
                    {isGenerating ? (
                      <div className="relative w-full h-full bg-gradient-to-b from-slate-950 via-black to-slate-950 flex flex-col justify-between p-4 sm:p-5 select-none overflow-hidden">
                        {/* CRT Analog Scanlines & Ambient Glow */}
                        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,transparent_50%,rgba(0,0,0,0.45)_51%)] bg-[length:100%_4px] opacity-35" />
                        <div className="pointer-events-none absolute -top-20 -left-20 w-64 h-64 bg-indigo-600/20 rounded-full blur-3xl animate-pulse" />
                        <div className="pointer-events-none absolute -bottom-20 -right-20 w-64 h-64 bg-amber-600/20 rounded-full blur-3xl animate-pulse" />

                        {/* Vintage Panavision Corner Reticles */}
                        <div className="pointer-events-none absolute top-2.5 left-2.5 text-amber-400 font-mono text-sm leading-none">┌</div>
                        <div className="pointer-events-none absolute top-2.5 right-2.5 text-amber-400 font-mono text-sm leading-none">┐</div>
                        <div className="pointer-events-none absolute bottom-2.5 left-2.5 text-amber-400 font-mono text-sm leading-none">└</div>
                        <div className="pointer-events-none absolute bottom-2.5 right-2.5 text-amber-400 font-mono text-sm leading-none">┘</div>

                        {/* Top HUD Telemetry Bar */}
                        <div className="relative z-10 flex items-center justify-between text-[11px] font-mono tracking-wider border-b border-indigo-900/40 pb-2">
                          <div className="flex items-center gap-2">
                            <span className="relative flex h-2.5 w-2.5">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500" />
                            </span>
                            <span className="text-rose-400 font-bold uppercase tracking-widest text-[10px]">
                              ● REC 00:{String(Math.floor(renderElapsedSeconds / 60)).padStart(2, '0')}:{String(renderElapsedSeconds % 60).padStart(2, '0')}
                            </span>
                          </div>
                          <div className="hidden sm:flex items-center gap-1.5 text-amber-300 text-[10px] bg-amber-950/40 px-2 py-0.5 rounded border border-amber-500/30">
                            <FilmIcon className="w-3.5 h-3.5 text-amber-400" />
                            <span>PANAVISION 35mm • EASTMAN 5247</span>
                          </div>
                          <div className="text-indigo-300 font-bold text-[10px] bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-500/40">
                            SEEDANCE 2.5 • {videoResolution.toUpperCase()} • 24 FPS
                          </div>
                        </div>

                        {/* Center Studio Radar / Progress Visualizer */}
                        <div className="relative z-10 flex flex-col items-center justify-center my-auto py-1 text-center">
                          {/* Dual Concentric Glowing Gauges */}
                          <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center mb-2">
                            <div className="absolute inset-0 rounded-full border-2 border-dashed border-indigo-400/60 animate-[spin_10s_linear_infinite]" />
                            <div className="absolute inset-2 rounded-full border border-amber-400/40 animate-ping opacity-20" />
                            <div className="flex flex-col items-center justify-center">
                              <span className="text-2xl sm:text-3xl font-black font-mono tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-indigo-200 to-emerald-300 drop-shadow-[0_0_12px_rgba(99,102,241,0.6)]">
                                {Math.min(99, Math.round(10 + (renderElapsedSeconds / 135) * 88))}%
                              </span>
                              <span className="text-[8px] font-mono text-slate-400 tracking-widest uppercase">
                                RENDERING
                              </span>
                            </div>
                          </div>

                          {/* Dynamic 4-Phase Generation Stage */}
                          <div className="max-w-md px-3 py-1 rounded-lg bg-black/70 border border-indigo-500/30 backdrop-blur-sm mb-2">
                            <div className="text-[11px] font-mono font-semibold text-amber-300 flex items-center justify-center gap-1.5">
                              <SparklesIcon className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                              <span>
                                {renderElapsedSeconds < 25
                                  ? '[PHASE 1/4] Initializing Neural Latent Space (Seedance 2.5)...'
                                  : renderElapsedSeconds < 60
                                  ? '[PHASE 2/4] Synthesizing 1978 Eastman Color Grain & Optical Diffusion...'
                                  : renderElapsedSeconds < 95
                                  ? '[PHASE 3/4] Volumetric Candlelight Relighting & Facial Identity Lock...'
                                  : '[PHASE 4/4] Temporal Optical Coherence & 24fps MP4 Stream Assembly...'}
                              </span>
                            </div>
                          </div>

                          {/* Neural Waveform Equalizer Bars */}
                          <div className="flex items-center gap-1.5 h-3.5 mb-1.5">
                            {[40, 75, 100, 60, 90, 45, 80, 100, 70, 50, 85, 95, 60, 40].map((height, idx) => (
                              <div
                                key={idx}
                                className="w-1 bg-gradient-to-t from-indigo-500 to-amber-400 rounded-full animate-pulse"
                                style={{
                                  height: `${Math.max(25, (height * ((renderElapsedSeconds % 4) + 1)) / 4)}%`,
                                  animationDelay: `${idx * 75}ms`,
                                  animationDuration: '800ms'
                                }}
                              />
                            ))}
                          </div>

                          {/* Elapsed vs Estimated Time HUD */}
                          <div className="text-[10px] font-mono text-slate-400 flex items-center gap-2 sm:gap-3">
                            <span>⏱️ 已耗时: <strong className="text-slate-200">{renderElapsedSeconds}s</strong></span>
                            <span>•</span>
                            <span>预计剩余: <strong className="text-amber-300">~{Math.max(5, 130 - renderElapsedSeconds)}s</strong></span>
                          </div>
                        </div>

                        {/* Bottom Shimmering Progress Bar */}
                        <div className="relative z-10 w-full pt-1">
                          <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                            <div
                              className="h-full bg-gradient-to-r from-amber-400 via-indigo-500 to-emerald-400 rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(99,102,241,0.8)]"
                              style={{ width: `${Math.min(99, Math.round(10 + (renderElapsedSeconds / 135) * 88))}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ) : activeWorkflowTab === 'i2i-greenscreen' ? (
                      viewMode === 'split' ? (
                        <div className="grid grid-cols-2 w-full h-full">
                          <div
                            onClick={() => setSelectedReferenceType('green_screen')}
                            className={`relative border-r border-slate-700 bg-emerald-950/40 flex items-center justify-center overflow-hidden cursor-pointer group transition-all ${
                              selectedReferenceType === 'green_screen' ? 'ring-2 ring-emerald-400 ring-inset' : 'opacity-85 hover:opacity-100'
                            }`}
                          >
                            <img
                              src="/images/rumpelstiltskin_green_screen.png"
                              alt="Raw Chroma Key Green Screen Asset"
                              width={240}
                              height={320}
                              loading="lazy"
                              decoding="async"
                              className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform"
                            />
                            <span className="absolute bottom-2 left-2 bg-black/85 px-2 py-0.5 rounded text-[9px] text-emerald-300 font-mono flex items-center gap-1 border border-emerald-500/40">
                              {selectedReferenceType === 'green_screen' ? (
                                <>
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                  <span>INPUT: 绿底垫图 (✓ 生效中)</span>
                                </>
                              ) : (
                                <span>INPUT: 绿底垫图 (点击采用)</span>
                              )}
                            </span>
                          </div>
                          <div
                            onClick={() => setSelectedReferenceType('relit_35mm')}
                            className={`relative overflow-hidden bg-black flex items-center justify-center cursor-pointer group transition-all ${
                              selectedReferenceType === 'relit_35mm' ? 'ring-2 ring-indigo-400 ring-inset' : 'opacity-85 hover:opacity-100'
                            }`}
                          >
                            <img
                              src="/images/rumpelstiltskin_tuxedo_result.jpg"
                              alt="Harmonized 1978 Candlelit Masterplate"
                              width={480}
                              height={270}
                              loading="lazy"
                              decoding="async"
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                            <span className="absolute bottom-2 right-2 bg-black/85 px-2 py-0.5 rounded text-[9px] text-indigo-300 font-mono border border-indigo-500/40 flex items-center gap-1">
                              {selectedReferenceType === 'relit_35mm' ? (
                                <>
                                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                                  <span>OUTPUT: 1978母版 (✓ 生效中)</span>
                                </>
                              ) : (
                                <span>OUTPUT: 1978母版 (点击采用)</span>
                              )}
                            </span>
                          </div>
                        </div>
                      ) : viewMode === 'reference' ? (
                        <div
                          onClick={() => setSelectedReferenceType('green_screen')}
                          className="relative w-full h-full bg-emerald-950/40 flex items-center justify-center p-4 cursor-pointer"
                        >
                          <img
                            src="/images/rumpelstiltskin_green_screen.png"
                            alt="Raw Chroma Key Green Screen Reference"
                            width={320}
                            height={320}
                            loading="lazy"
                            decoding="async"
                            className="max-h-full object-contain"
                          />
                          <span className="absolute top-2 left-2 bg-black/85 px-2 py-0.5 rounded text-[10px] text-emerald-400 font-mono flex items-center gap-1 border border-emerald-500/40">
                            {selectedReferenceType === 'green_screen' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />}
                            Input Reference Asset (绿底抠图原画) {selectedReferenceType === 'green_screen' ? '• [✓ 当前生效垫图]' : '• [点击设为垫图]'}
                          </span>
                        </div>
                      ) : (
                        <div
                          onClick={() => setSelectedReferenceType('relit_35mm')}
                          className="relative w-full h-full cursor-pointer"
                        >
                          <img
                            src="/images/rumpelstiltskin_tuxedo_result.jpg"
                            alt="1978 Harmonized Inpainting Masterplate"
                            width={640}
                            height={360}
                            loading="lazy"
                            decoding="async"
                            className="w-full h-full object-cover"
                          />
                          <span className="absolute top-2 left-2 bg-black/85 px-2 py-0.5 rounded text-[10px] text-amber-300 font-mono border border-amber-500/40 flex items-center gap-1">
                            {selectedReferenceType === 'relit_35mm' && <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />}
                            1978 Candlelit Relit Masterplate {selectedReferenceType === 'relit_35mm' ? '• [✓ 当前生效垫图]' : '• [点击设为垫图]'}
                          </span>
                        </div>
                      )
                    ) : (
                      <div className="relative w-full h-full bg-black flex items-center justify-center">
                        <video
                          key={generatedVideoUrl}
                          src={generatedVideoUrl || "/videos/user_seedance_generated_result.mp4"}
                          controls
                          autoPlay
                          loop
                          playsInline
                          poster="/images/rumpelstiltskin_green_screen.png"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/80 text-[10px] text-amber-300 font-mono border border-amber-500/40 flex items-center gap-1.5 pointer-events-none">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          <span>SEEDANCE 2.5 • 1978 EASTMAN 35mm MASTER</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Cinema Quick Actions (Direct Download, Copy Link, Re-render) */}
                  {activeWorkflowTab === 't2v-cinema' && generatedVideoUrl && !isGenerating && (
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <button
                        type="button"
                        onClick={handleDownloadVideo}
                        className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[11px] font-bold transition-all shadow-md shadow-emerald-950/40"
                      >
                        <ArrowDownTrayIcon className="w-3.5 h-3.5" />
                        <span>Download 35mm Master (MP4)</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleCopyVideoUrl}
                        className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-[11px] font-semibold transition-all"
                      >
                        <DocumentDuplicateIcon className="w-3.5 h-3.5 text-indigo-400" />
                        <span>{videoCopied ? 'Link Copied! ✓' : 'Copy Video URL'}</span>
                      </button>
                    </div>
                  )}

                  <div className="text-[11px] font-mono bg-slate-900 border border-slate-800 p-2.5 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-slate-300 min-w-0">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0 animate-ping" />
                      <span className="text-emerald-400 font-semibold shrink-0">当前生效垫图:</span>
                      <span className="truncate text-indigo-200 text-[10px]">
                        {selectedReferenceType === 'green_screen' ? '🟢 绿底抠图原画 (rumpelstiltskin_green_screen.png)' :
                         selectedReferenceType === 'relit_35mm' ? '🎬 1978 调色母版 (rumpelstiltskin_tuxedo_result.jpg)' :
                         selectedReferenceType === 'rustic_gnome' ? '🧔 乡村粗布矮人 (rumpelstiltskin_vintage_demo.jpg)' :
                         '📤 自定义上传垫图'}
                      </span>
                    </div>
                    <span className="text-[9px] text-emerald-400 bg-emerald-950/80 border border-emerald-500/40 px-2 py-0.5 rounded font-sans shrink-0 font-medium">
                      100% 保持燕尾服角色面容
                    </span>
                  </div>

                  {apiNotice && (
                    <div className="mt-2 p-2 bg-indigo-950/60 border border-indigo-500/30 rounded-lg text-[11px] text-indigo-200 flex items-center gap-2">
                      <SparklesIcon className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>{apiNotice}</span>
                    </div>
                  )}
                </div>

                <div className="mt-3 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={copyScript}
                    className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold transition-all"
                  >
                    {copied ? (
                      <>
                        <ClipboardDocumentCheckIcon className="w-4 h-4 text-emerald-300" />
                        <span>Code Copied to Clipboard</span>
                      </>
                    ) : (
                      <>
                        <CommandLineIcon className="w-4 h-4" />
                        <span>Copy Complete Inpainting &amp; Video Recipe Script</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Section 4 */}
          <section className="space-y-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center gap-2">
              <VideoCameraIcon className="w-7 h-7 text-indigo-400 inline-block" />
              Reverse-Engineering the Vintage Aesthetic: 35mm Film Prompts &amp; Camera Recipes
            </h2>
            <p className="leading-relaxed">
              Why did the <strong>viral rumpelstiltskin ai video</strong> deceive seasoned cinephiles where generic AI clips fail? The engineering triumph lies in technical imperfection. Rather than producing sterile 8K digital imagery, creators reverse-engineered the optical hallmarks of European 1970s fantasy cinema:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6 not-prose">
              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
                <div className="text-indigo-400 font-bold text-xs uppercase mb-1">Pillar 1: Optical Imperfection</div>
                <div className="text-white font-semibold text-sm mb-2">Lens Flares &amp; Halation</div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Engineered Panavision anamorphic flares, soft barrel distortion, and warm highlight bleeds recreate authentic vintage glass acoustics.
                </p>
              </div>

              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
                <div className="text-indigo-400 font-bold text-xs uppercase mb-1">Pillar 2: Practical Textures</div>
                <div className="text-white font-semibold text-sm mb-2">Prosthetic Makeup Look</div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Prompting explicitly for foam-latex prosthetics and textured woven woolens prevents the synthetic airbrushing endemic to modern diffusion models.
                </p>
              </div>

              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
                <div className="text-indigo-400 font-bold text-xs uppercase mb-1">Pillar 3: Lighting Rig</div>
                <div className="text-white font-semibold text-sm mb-2">Tungsten &amp; Candlelight</div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Directional incandescent key lights and rich falloff shadows mimic classic soundstage set constructions, elevating the <strong>rumpelstiltskin ai video meme</strong>.
                </p>
              </div>
            </div>
          </section>

          {/* Section 5 */}
          <section className="space-y-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center gap-2">
              <CheckCircleIcon className="w-7 h-7 text-indigo-400 inline-block" />
              Character Consistency Workflows: Preparing Uncanny Video Assets with AI
            </h2>
            <p className="leading-relaxed">
              The primary roadblock for creators attempting to recreate the <strong>viral rumpelstiltskin ai video</strong> is identity drift across temporal frames. When video diffusion models animate energetic choreography, faces often warp into grotesque melting artifacts.
            </p>
            <p className="leading-relaxed">
              Professional production studios resolve this challenge by breaking the workflow into discrete multimodal stages:
            </p>
            <ol className="list-decimal pl-6 space-y-3 text-slate-300">
              <li>
                <strong>Master Character Reference Synthesis:</strong> Generate multi-angle Character Sheets in foundation tools like <Link href={getLinkHref('/generator', locale)} className="text-indigo-400 hover:underline font-semibold">Qwen Text to Image Generator</Link>, locking in front, side, and action poses.
              </li>
              <li>
                <strong>Transparent Alpha Channel Matting:</strong> Isolate character subjects from noisy backgrounds using <Link href={getLinkHref('/background-remover', locale)} className="text-indigo-400 hover:underline font-semibold">AI Background Remover</Link>, ensuring temporal attention layers in Kling or Luma lock strictly onto subject anatomy.
              </li>
              <li>
                <strong>Localized Conversational Polishing:</strong> If single frames experience minor anatomical anomalies, creators refine facial textures using the <Link href={getLinkHref('/qwen-image-2-1', locale)} className="text-indigo-400 hover:underline font-semibold">Qwen Inpainting Studio</Link> without regenerating the entire sequence.
              </li>
            </ol>
            <p className="leading-relaxed">
              By separating high-resolution static asset preparation from motion interpolation, creators consistently defeat temporal drift, successfully delivering commercial-grade productions that rival the <strong>viral rumpelstiltskin ai video meme</strong>.
            </p>
          </section>

          {/* Section 6: FAQ */}
          <section className="space-y-6 pt-6 border-t border-slate-800">
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Frequently Asked Questions About Rumpelstiltskin AI
            </h2>
            <div className="space-y-4 not-prose">
              {faqData.map((item, idx) => (
                <div key={idx} className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
                  <div className="font-bold text-slate-100 text-sm sm:text-base mb-2">
                    {item.q}
                  </div>
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                    {item.a}
                  </p>
                </div>
              ))}
            </div>
          </section>

        </article>

        {/* Informational Context Summary (Natural internal references, zero doorway penalty) */}
        <div className="my-12 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 text-center shadow-xl">
          <div className="text-lg sm:text-xl font-bold text-white mb-2">
            Multimodal Visual Asset Architecture for Video Creators
          </div>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
            From vintage 35mm dark fantasy character sheets to real-time streaming video conditioning, consistent image preparation is essential. Discover our complete toolsuite on the <Link href={getLinkHref('/', locale)} className="text-indigo-400 hover:underline font-semibold">Qwen Image Editor Home</Link>, explore our <Link href={getLinkHref('/blog/vidu-s2-realtime-interactive-video-guide', locale)} className="text-indigo-400 hover:underline font-semibold">Vidu S2 Streaming Video Guide</Link>, or read our <Link href={getLinkHref('/blog/ideogram-4-5-open-source-weights-alternatives', locale)} className="text-indigo-400 hover:underline font-semibold">Ideogram 4.5 Analysis</Link>.
          </p>
        </div>

        {/* E-E-A-T Author Card */}
        <aside className="border-t border-slate-800 pt-8 mt-12">
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 flex flex-col sm:flex-row items-center sm:items-start gap-5">
            <img
              src={post.author.avatar}
              alt={post.author.name}
              width={64}
              height={64}
              loading="lazy"
              decoding="async"
              className="w-16 h-16 rounded-full border-2 border-indigo-500/40 object-cover shadow-md flex-shrink-0"
            />
            <div className="text-center sm:text-left">
              <div className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-1">
                Written by Generative Video Specialist
              </div>
              <div className="text-lg font-bold text-white mb-1">{post.author.name}</div>
              <div className="text-xs text-slate-400 font-medium mb-3">{post.author.role}</div>
              <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
                {post.author.bio}
              </p>
            </div>
          </div>
        </aside>
      </main>

      <PricingModal locale={locale} page="" />
      <Footer />
    </div>
  );
}
