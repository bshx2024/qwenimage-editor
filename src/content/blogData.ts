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
    // Strict 58 chars (Fits 50-60 range)
    title: 'Strata Qwen 3.8: Complete Guide to Strata AI LLM Engine',
    // Strict 152 chars (Fits 140-160 range)
    description: 'Learn how the Strata AI LLM engine runs Qwen 3.8 Flash Next on RTX 3090/4090 GPUs. Setup guide, KV cache tuning, and Claude Code integration benchmarks.',
    date: '2026-10-05',
    readTime: '9 min read',
    category: 'Local LLM & Inference',
    author: 'Qwen Engineering Team',
    keywords: [
      'strata qwen 3.8',
      'strata ai',
      'qwen flash next',
      'qwen 3.8 next',
      'qwen 3.8 flash next',
      'strata github',
      'strata llm',
      'strata ai github',
      'strata llm engine',
      'niko strata',
    ],
  },
];

export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}
