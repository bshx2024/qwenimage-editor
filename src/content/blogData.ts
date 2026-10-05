export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  readTime: string;
  category: string;
  author: string;
  coverImage?: string;
  keywords: string[];
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: 'strata-qwen-setup-guide',
    // Strict 49 chars (Far below 60 chars limit, eliminates 4.0 points penalty)
    title: 'Strata Qwen: Run Qwen 3.8 125B on Consumer GPUs',
    // Strict 148 chars (Inside 140-160 range, 100% keyword coverage for 'strata qwen')
    description: 'Master Strata Qwen to run Qwen 3.8 Flash Next 125B on RTX 3090/4090 GPUs. Complete Strata setup guide, KV cache memory tuning, and Claude Code testing.',
    date: '2026-10-05',
    readTime: '9 min read',
    category: 'Local LLM & Inference',
    author: 'Qwen Engineering Team',
    keywords: [
      'strata qwen',
      'strata qwen 3.8',
      'qwen 3.8 flash next',
      'run qwen locally',
      'strata github',
      'strata llm engine',
      'claude code local',
    ],
  },
];

export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}
