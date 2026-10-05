# Qwen Image Editor: 博客与落地页 SEO/GEO 工业级发布标准 (Writing Standard)

> **版本**：v1.0 (2026-10-05)  
> **适用范围**：`qwenimage-editor.com` 整站所有任务落地页（`/`、`/qwen-image-2-1`、`/background-remover` 等）及博客技术文章（`/blog/*`）。  
> **核心目标**：100% 免疫 Google SpamBrain 惩罚、消灭 Doorway 纯跳转扣分，确保 Google On-Page 体检稳定达到 **98~100 分**，同时最大化海外 AI 搜索引擎（ChatGPT Search、Perplexity、Google AI Overviews、Claude）的引用召回率。

---

## 一、 核心发布红线 (Hard Prohibitions & Red Lines)

1. **【P0 致命】严禁纯跳转落地页（Doorway Page）**：
   - 凡页面、标题或 CTA 提及“试用 / 测试 / 体验 / 尝试”，**必须内嵌原地可交互微工具 (In-Page Live Playground)**（包含可实际输入的 `<textarea>`/`<input>`、`<select>` 及生成按钮）。
   - 杜绝用户必须二次点击跳转才能体验功能，彻底消除被 SEO 引擎判定为 Doorway 欺骗性桥页扣 4.5 分的风险。

2. **【P1 关键】严禁破坏 HTML 标题语法树 (Strict AST Cleanliness)**：
   - 页面与 Markdown 必须保持唯一的严格树状语义：`1 个 H1 -> 多个 H2 -> 对应 H3`。
   - 自定义内嵌 HTML 组件（如 Definition Box、Key Takeaways、Playground 卡片、CRO 转化框）中**严禁使用原生 `<h1>`~`<h4>` 标签**，统一使用 `<div class="font-bold text-white...">` 或 `<span>` 加 CSS 类名，严禁“标题跳级”扣 1.5 分。

3. **【P1 关键】严禁无脑堆砌与赛道错位**：
   - 单词与多词词组密度控制在 **3.0% ~ 4.5%** 的黄金健康区间，禁止单一词组反复机械重复（超过 5% 易被判过度优化）。
   - 必须锁定精准的商用或工具任务意图词（如 `qwen image 2 1 online`、`background remover ai`），避开已被论文/开源讨论占据的纯词赛道。

4. **【P1 关键】严禁虚构死链与编造方法论**：
   - 正文引用的所有 GitHub Issue、Reddit 帖子或外链必须 100% 真实且返回 `HTTP 200`，杜绝 404 死链。
   - 严禁编造虚假的专有名词或参数。

5. **【P2 细节】严禁布局抖动（CLS 零抖动）**：
   - 所有在页面展示的图片必须显式声明 `width` 与 `height` 属性。
   - 所有首屏视口（Above-the-fold）以外的图片必须显式配置 `loading="lazy"` 与 `decoding="async"`。

---

## 二、 严格字符与指标卡尺 (Metrics Range Guard)

每次提交或发布任何页面前，必须使用以下卡尺严格度量：

| 检查维度 | 达标安全区间 (Pass) | 违规扣分原因 (Fail) |
| :--- | :--- | :--- |
| **Meta Title** | **50 ～ 60 字符** (且像素宽度 $\le 600\text{px}$) | 太短权重不足；超过 60 字符在 Google SERP 会被 `...` 截断。 |
| **H1 标题** | **$\le$ 80 字符**，且全页唯一 | 超过 80 字符被扣 1 分；严禁一页多个 H1。 |
| **Meta Description** | **140 ～ 160 字符** (建议 148~155 字符) | 超过 160 字符在 SERP 列表页尾部被截断扣 1.5 分；必须包含明确 CTA。 |
| **正文可见词数** | **1,200 ～ 1,800 词** (英文单词计数) | 低于 1,000 词被判薄内容（Thin Content）扣 1.5 分；超 2,000 词稀释主题。 |
| **首句结论 (BLUF)** | **首屏 1~2 句确定性实体定义** | 必须采用【实体名 + 核心技术范畴 + 核心价值指标】客观陈述，严禁空洞寒暄。 |
| **关键词密度** | **3.0% ～ 4.5%** | 单一主词组密度超过 5% 被判过度优化扣 1.5 分。 |

---

## 三、 客观披露与横评标准 (Honesty Ranks Standard)

1. **客观中立对比矩阵 (Cross-Entity Benchmark)**：
   - 对比表格必须包含**客观事实时间戳**与**竞品正向优势列 (Best for...)**。
   - 坦诚承认竞品的物理优势（如承认 Midjourney 社区审美积累深厚、Flux 具备庞大的开源 ControlNet 生态），客观陈述 Qwen 在双语中英文字渲染、局部语义重绘与免本地 24GB 显存配置上的优势。
   - 真实公允的对比极大幅度提升海外 AI 搜索引擎（Perplexity、ChatGPT）的采信率与引用概率。

2. **痛点放大与转化漏斗 (Agitate & Solve)**：
   - 讨论本地环境部署（如 ComfyUI、Strata、GGUF 量化）时，核心目的是**展示本地硬件成本与运维痛点**。
   - 必须在技术对比中自然引导：“*如果你不想在本地折腾 24GB 显存或环境报错，可以直接使用免配置的在线版 [Qwen Image 2.1 Studio](/)。*”

---

## 四、 结构化数据 Schema 强制规范 (JSON-LD)

所有页面必须根据页面类型注入规范的 Schema 并在发布前通过 Google Rich Results 验证：

1. **工具落地页**：
   - `["WebApplication", "SoftwareApplication"]`：包含 `offers` ($0 / $4.99+), `aggregateRating` (4.9/5), `featureList`。
   - `HowTo`：严密对应 3-Step 操作步骤。
   - `FAQPage`：4~6 个精准命中真实长尾意图的高频问答。
2. **技术博客与指南页**：
   - `TechArticle` / `BlogPosting`：包含 `datePublished`、`headline`、`author`、`keywords`。
   - `BreadcrumbList`：面包屑导航链条。

---

## 五、 双向内链闭环门禁 (Atomic Bidirectional Internal Linking)

上线任何新文章或落地页时，严禁产生“孤岛页面（Orphan Page）”：
1. **正向输出**：新页面必须包含指向主工具页（`/`）、定价页（`/pricing`）或对比页的上下文内链。
2. **反向织入**：**必须同步编辑站内 2~3 个已有的高权重页面**（如 Footer 知识图谱、相关对比页正文），将新页面链接作为高相关性锚文本织入，实现权重双向流动。

---

## 六、 发布前 7 项快速自检表 (Pre-Publish Checklist)

- [ ] 1. **Title / H1 / Description 长度** 是否符合卡尺（Title 50~60 / H1 $\le$ 80 / Desc 140~160）？
- [ ] 2. **首屏是否有 BLUF 首句结论框**，AI 爬虫可否直接抓取作摘要？
- [ ] 3. **是否存在原地可交互的 Live Playground**，彻底消除 4.5 分 Doorway 惩罚？
- [ ] 4. **组件内是否完全排除了 `<h1>`~`<h4>` 标签**，保持纯净单一 AST 语义树？
- [ ] 5. **所有图片是否均显式配置了 `width`、`height` 和 `loading="lazy"`**？
- [ ] 6. **是否已在 `public/sitemap.xml` 中配置权重与频次**？
- [ ] 7. **本地 `npm run build` 是否 100% 退出码 0，SSG 预渲染无误**？
