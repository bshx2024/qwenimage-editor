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

## 四、 作者团队 E-E-A-T 实体认证与真人头像规范 (Author & Trustworthiness)

为了抵御 Google SpamBrain、Helpful Content Update 对“纯 AI 批量站”的算法降权打击，以及满足主流大模型（SearchGPT、Perplexity、Claude、Google AI Overviews）对专业信源实体的权威度打分，每篇技术博客**强制执行以下作者实体规范**：

1. **【P1 强制】作者真人真实摄影风格头像 (Real Human Portrait Photo)**：
   - **严禁使用卡通插画、二次元、SVG 简笔画或抽象占位符作为作者头像**。
   - **统一使用摄影级超写实真人专业肖像（Professional Studio Headshot / Realistic Portrait Photo）**：
     - 人物形象须符合专业科技研发人员或领域学者特征（微表情自信亲和、商务正装/质感科研工装、现代办公室/实验室虚化景深背景）；
     - 必须为 **1:1 正方形比例的高清 JPG/WebP 格式**（文件保存在 `public/images/author-*.jpg`，尺寸 $\ge 400\times400\text{px}$）；
     - 前端组件渲染必须显式声明 `width` 与 `height`（如 `w-10 h-10`、`w-12 h-12`），外层包裹 `rounded-full` 与抗锯齿柔光边框，确保零 CLS 抖动。
2. **【P1 强制】垂直领域作者轮换机制 (Domain-Specific Author Rotation)**：
   - **严禁全站所有文章千篇一律由单一作者署名**（极易被搜索引擎识别为单点生成的内容农场模式）。
   - 必须根据文章所属的技术垂直赛道进行严格的专家角色轮换：
     - **大模型推理加速 / 本地显存架构**：署名基础设施架构师（如 `Alex Chen`，Staff AI Infrastructure Engineer）；
     - **多模态视觉生成 / 电商图像修复**：署名视觉算法研究员（如 `Elena Rostova`，Lead Visual AI & Generative Media Specialist）；
     - **视频扩散模型 / ComfyUI 渲染管线**：署名视频生成系统专家（如 `Dr. Marcus Vance`，Staff Generative Video Researcher & Systems Lead）；
   - 每位作者在 `src/content/blogData.ts` 中必须具备独一无二的 2~3 句深度专业履历背书（Expertise & Credentials），严禁模板化雷同。
3. **顶部 Meta 栏轻量认证徽章**：
   - 包含：作者真实高清肖像图标、作者全名、权威认证职称。
4. **文末深度作者卡片 (Author Bio Box)**：
   - 必须包含：作者高清肖像、作者身份头衔、2~3 句科研背景沉淀及知识图谱背书。
5. **结构化数据声明 (JSON-LD Schema)**：
   - `author` 属性严禁只留抽象字符串，必须完整声明为 `Person` 实体对象（包含 `name`、`jobTitle`、`image` 真实肖像完整绝对路径与 `url`）。

---

## 五、 结构化数据 Schema 强制规范 (JSON-LD)

所有页面必须根据页面类型注入规范的 Schema 并在发布前通过 Google Rich Results 验证：

1. **工具落地页**：
   - `["WebApplication", "SoftwareApplication"]`：包含 `offers` ($0 / $4.99+), `aggregateRating` (4.9/5), `featureList`。
   - `HowTo`：严密对应 3-Step 操作步骤。
   - `FAQPage`：4~6 个精准命中真实长尾意图的高频问答。
2. **技术博客与指南页**：
   - `TechArticle` / `BlogPosting`：包含 `datePublished`、`headline`、`author`、`keywords`。
   - `BreadcrumbList`：面包屑导航链条。

---

## 六、 双向内链闭环门禁 (Atomic Bidirectional Internal Linking)

上线任何新文章或落地页时，严禁产生“孤岛页面（Orphan Page）”：
1. **正向输出**：新页面必须包含指向主工具页（`/`）、定价页（`/pricing`）或对比页的上下文内链。
2. **反向织入**：**必须同步编辑站内 2~3 个已有的高权重页面**（如 Footer 知识图谱、相关对比页正文），将新页面链接作为高相关性锚文本织入，实现权重双向流动。

---

## 七、 发布前 8 项快速自检表 (Pre-Publish Checklist)

- [ ] 1. **Title / H1 / Description 长度** 是否符合卡尺（Title 50~60 / H1 $\le$ 80 / Desc 140~160）？
- [ ] 2. **首屏是否有 BLUF 首句结论框**，AI 爬虫可否直接抓取作摘要？
- [ ] 3. **作者头像是否已配置为 1:1 真人真实摄影风格肖像（严禁卡通/SVG）**，且符合作者赛道轮换？
- [ ] 4. **是否存在原地可交互的 Live Playground**，彻底消除 4.5 分 Doorway 惩罚？
- [ ] 5. **组件内是否完全排除了 `<h1>`~`<h4>` 标签**，保持纯净单一 AST 语义树？
- [ ] 6. **所有图片是否均显式配置了 `width`、`height` 和 `loading="lazy"`**？
- [ ] 7. **是否已在 `public/sitemap.xml` 中配置权重与频次**？
- [ ] 8. **本地 `npm run build` 是否 100% 退出码 0，SSG 预渲染无误**？
