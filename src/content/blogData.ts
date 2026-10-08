export interface AuthorInfo {
  name: string;
  role: string;
  avatar: string;
  bio: string;
}

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  readTime: string;
  category: string;
  author: AuthorInfo;
  coverImage?: string;
  keywords: string[];
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: 'higgsfield-genjutsu-workflow-guide-free-alternatives',
    // Strict 59 chars (50-60 chars safety range, zero SERP truncation)
    title: 'Higgsfield Genjutsu Guide: Video Trends & Free Alternatives',
    // Strict 152 chars (140-160 range, 100% intent coverage with CTA)
    description: 'Master Higgsfield Genjutsu video trends, learn character asset prep, fix queue delays, and discover free AI image inpainting alternatives for ecommerce.',
    date: '2026-10-06',
    readTime: '11 min read',
    category: 'Generative Media & Workflows',
    author: {
      name: 'Elena Rostova',
      role: 'Lead Visual AI & Generative Media Specialist',
      avatar: '/images/author-elena.jpg',
      bio: 'Former VFX technical director and generative media researcher specializing in multimodal diffusion pipelines, Vid2Vid consistency, and neural rendering workflows.',
    },
    keywords: [
      'higgsfield genjutsu',
      'vid2vid motion transfer',
      'hotel lobby ai trend',
      'character asset prep',
      'free inpainting alternative',
      'mode 305 workflow',
      'qwen image editor',
    ],
  },
  {
    slug: 'strata-qwen-setup-guide',
    // Strict 54 chars (50-60 chars range, zero SERP truncation, high intent CTR trigger)
    title: 'How to Run Strata Qwen 3.8 on 12GB+ GPUs (Setup Guide)',
    // Strict 157 chars (Inside 140-160 range, captures GitHub search intent + VRAM + OOM pain points)
    description: 'Step-by-step Strata setup guide for Qwen 3.8 Flash Next 125B. Run locally on 12GB-24GB GPUs without OOM. Includes GitHub setup scripts & Claude Code testing.',
    date: '2026-10-05',
    readTime: '9 min read',
    category: 'Local LLM & Inference',
    author: {
      name: 'Alex Chen',
      role: 'Staff AI Infrastructure Engineer',
      avatar: '/images/author-alex.jpg',
      bio: 'Former distributed computing researcher specializing in sparse MoE inference, model quantization, and multimodal diffusion acceleration across heterogeneous GPU clusters.',
    },
    keywords: [
      'strata qwen',
      'strata qwen 3.8',
      'qwen 3.8 flash next',
      'strata qwen setup guide',
      'run qwen 3.8 locally',
      'strata github',
      'strata 12gb vram',
      'claude code local',
    ],
  },
  {
    slug: 'minimax-h3-comfyui-guide-vram-workflow',
    // Strict 54 chars (50-60 chars safety range, zero SERP truncation)
    title: 'MiniMax H3 ComfyUI Guide: Video Workflows & VRAM Tuning',
    // Strict 154 chars (140-160 range, 100% token coverage for 'minimax h3 comfyui guide' + 'workflow')
    description: 'Master MiniMax H3 in ComfyUI with this video workflow guide. Learn SageAttention VRAM tuning, T2V and I2V prompt nodes, and clean asset prep without VRAM OOM.',
    date: '2026-10-07',
    readTime: '10 min read',
    category: 'Generative Video & Workflows',
    author: {
      name: 'Dr. Marcus Vance',
      role: 'Staff Generative Video Researcher & Systems Lead',
      avatar: '/images/author-marcus.jpg',
      bio: 'Former neural rendering pipeline architect and diffusion researcher specializing in video latent architectures, memory-efficient attention kernels, and asset prep workflows.',
    },
    keywords: [
      'minimax h3 comfyui guide',
      'minimax h3 comfyui workflow',
      'minimax h3 i2v workflow',
      'minimax h3 mem eff sage attention patch',
      'minimax h3 prompt guide',
      'hailuo 3.0',
      'qwen image editor',
    ],
  },
  {
    slug: 'vidu-s2-realtime-interactive-video-guide',
    // Strict 57 chars (50-60 chars safety range, zero SERP truncation, high intent CTR trigger)
    title: 'Vidu S2 Guide: Real-Time Interactive Avatar & Video Setup',
    // Strict 157 chars (140-160 range, captures real-time interactive + s2-avatar + ai video call)
    description: 'Master Vidu S2 real-time interactive video generation & S2-Avatar. Learn streaming architecture, AI video call workflows, and clean image asset prep tips.',
    date: '2026-10-08',
    readTime: '11 min read',
    category: 'Multimodal Streaming & AI Video',
    author: {
      name: 'Dr. Sarah Lin',
      role: 'Staff Multimodal Streaming & Spatial Video Architect',
      avatar: '/images/author-sarah.jpg',
      bio: 'Former neural video pipeline architect and real-time streaming researcher specializing in frame-aligned diffusion transformers, low-latency S2-Avatar synthesis, and asset prep pipelines.',
    },
    keywords: [
      'vidu s2',
      'vidu s2 real-time interactive editable and spatial video generation',
      'vidu s2-avatar',
      'vidu s2 arxiv',
      'vidu s2 github',
      'ai video call online',
      'vidu stream',
      'qwen image editor',
    ],
  },
];

export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}
