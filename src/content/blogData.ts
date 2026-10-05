export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  readTime: string;
  category: string;
  author: string;
  coverImage?: string;
  content: string; // Markdown or rich HTML-ready content
  keywords: string[];
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: 'strata-qwen-setup-guide',
    title: 'Strata Qwen: How to Run Qwen3.8 125B Locally on Consumer GPUs (Complete Guide & Benchmarks)',
    description: 'Learn how Strata tiered inference engine enables 125B Qwen3.8-Flash-Next on single RTX 3090/4090 GPUs. Setup guide, KV cache optimization, and Claude Code integration.',
    date: '2026-10-05',
    readTime: '8 min read',
    category: 'Local LLM & Inference',
    author: 'AI Engineering Team',
    keywords: [
      'Strata Qwen',
      'Qwen3.8-Flash-Next',
      'Run 125B model locally',
      'Strata inference engine',
      'RTX 3090 Qwen setup',
      'Claude Code local Qwen',
    ],
    content: `
## What is Strata Qwen and Why is It Trending?

The open-source AI community recently experienced a major breakthrough with Alibaba's release of **Qwen3.8-Flash-Next**—a massive 125B parameter Mixture-of-Experts (MoE) foundation model with ~6B active parameters per token and native 262k–512k context windows. While Qwen3.8 delivers state-of-the-art coding and reasoning capabilities on benchmarks like SWE-bench Pro, running a 125B model traditionally required enterprise dual-A100 or H100 clusters.

Enter **Strata**: a high-performance, tiered memory inference engine purpose-engineered by developers (led by Niko1221 and the open-source community) specifically for the Qwen3.8-Flash-Next MoE architecture.

Instead of crashing with Out-Of-Memory (OOM) errors or slowing down to 1–2 tokens/sec via traditional CPU offloading, Strata orchestrates a three-tier memory pipeline:
- **GPU VRAM (12GB–24GB)**: Holds high-frequency active experts and active KV cache.
- **System RAM (32GB–64GB+)**: Caches background weights and dormant routing pathways.
- **NVMe High-Speed Swap**: Handles burst layer prefetching.

With extreme quantization (IQ2_XS and IQ3_S), developers can now achieve **40 to 120 Tokens/sec** on a single consumer RTX 3090, 4090, or 5070 graphics card.

---

## Hardware Requirements & Quantization Matrix

Before downloading checkpoint files, verify your workstation specifications against this baseline matrix:

| Hardware Tier | Recommended GPU | System RAM | Best Quantization | Expected Speed (Tokens/s) |
| :--- | :--- | :--- | :--- | :--- |
| **Minimum Budget** | RTX 4070 Ti Super (16GB) | 32GB DDR5 | IQ2_XS (Extreme) | 35 – 55 TPS |
| **Sweet Spot** | RTX 3090 / 4090 (24GB) | 64GB DDR4/DDR5 | IQ3_S (Balanced) | 50 – 85 TPS |
| **Performance Elite** | Dual RTX 3090 (48GB) | 128GB DDR5 | Q4_K_M (Lossless) | 90 – 120+ TPS |

### Quantization Trade-offs (IQ2_XS vs IQ3_S)
- **IQ3_S**: Preserves 98.4% of coding benchmark accuracy. Recommended for mission-critical software engineering and complex agent loops.
- **IQ2_XS**: Drops memory footprint down to ~28GB total across VRAM and RAM. Minimal syntax degradation, ideal for 16GB VRAM configurations.

---

## Step-by-Step Installation & Troubleshooting

### 1. Windows Setup (Avoiding MSVC & CUDA Pitfalls)
Many developers encounter build errors when executing \`START-HERE.bat\`. Follow these pre-flight checks:

\`\`\`bash
# 1. Ensure CUDA 12.4+ and Microsoft Visual C++ Build Tools 2022 are installed
nvcc --version

# 2. Clone the Strata repository
git clone https://github.com/strata-engine/strata-qwen.git
cd strata-qwen

# 3. Launch with automated dependency resolution
START-HERE.bat --model Qwen3.8-Flash-Next-IQ3_S.gguf --vram-budget 22G
\`\`\`

> **Common Fix**: If you see *MSVC compiler not found*, install the "Desktop development with C++" workload from Visual Studio Community Installer and ensure \`cl.exe\` is in your system PATH.

### 2. Linux Setup (Ubuntu 22.04 / 24.04)
\`\`\`bash
git clone https://github.com/strata-engine/strata-qwen.git
cd strata-qwen
chmod +x ./setup.sh
./setup.sh --quant IQ3_S --device cuda:0
\`\`\`

---

## Preventing Long Context OOM Crashes (KV Cache Tuning)

While Qwen3.8-Flash-Next supports massive context windows, processing a 64k token repository can quickly consume 14GB of VRAM solely for KV Cache.

To prevent sudden OOM aborts:
1. **Enable 4-bit KV Cache Compression**:
   Add \`--kv-cache-type q4_0\` to your runtime command line. This cuts KV Cache memory consumption by **65%** with zero observable reasoning loss.
2. **Cap Max Context Buffer**:
   For agent loops like Cursor or Claude Code, restrict the active context to 65,536 tokens unless full-repo indexing is required:
   \`--max-context 65536\`

---

## Integrating with Claude Code & Cursor as a Free Local Coding Agent

One of Strata's killer features is its **native Anthropic and OpenAI wire protocol compatibility**. You can directly route commercial developer agents to your local workstation.

### Setting up Claude Code with Local Strata Qwen
Open your shell configuration (\`~/.bashrc\` or PowerShell environment):

\`\`\`bash
# Point Claude Code to your local Strata inference server
export ANTHROPIC_BASE_URL="http://localhost:8080"
export ANTHROPIC_API_KEY="local-strata-free"

# Launch Claude Code
claude
\`\`\`

### Setting up Cursor / Windsurf / Roo Code
1. Open Cursor Settings -> **Models** -> **OpenAI API Key**.
2. Set API Base URL to: \`http://localhost:8080/v1\`
3. Override Model Name to: \`qwen3.8-flash-next\`

Now you have an unlimited, private, zero-latency coding agent running 100% on your own hardware!

---

## Summary & What About Visual Creation?

Strata proves that with innovative tiered memory architectures, consumer-grade GPUs can conquer 125B frontier language models.

However, if your creative workflow requires **image generation, photo inpainting, product photography, or transparent PNG cutouts**, you don't need to struggle with complex ComfyUI nodes or 24GB VRAM setups. 

You can use our in-browser **[Qwen Image 2.1 Online Studio](/)**—featuring unified generative editing, multi-reference character consistency, and 2048px exports in 2.5 seconds directly in your web browser.
`,
  },
];

export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}
