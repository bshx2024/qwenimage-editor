# QwenImage-Editor 项目开发进度与复盘记录

> **记录时间**：2026-10-04  
> **项目域名**：qwenimage-editor.com  
> **代码仓库**：[https://github.com/bshx2024/qwenimage-editor.git](https://github.com/bshx2024/qwenimage-editor.git)  
> **分支**：`main`  
> **最新交付版本**：`7a5a35e` (Phase 1 完整交付)

---

## 一、 项目背景与任务目标

本项目以哥飞社群开源生产级底座 **StickerShow**（Next.js 14 App Router + TypeScript + Tailwind CSS + PostgreSQL + NextAuth + Stripe + Replicate + Cloudflare R2）为基础进行二次开发。

**核心任务**：
1. **保留底座**：保留 Google 登录、PostgreSQL 原生连接、Cloudflare R2 对象存储、Stripe 订阅骨架以及异步 Webhook 架构。
2. **业务改造**：从「贴纸生成」全面彻底重构为 **「Qwen Image Editor（在线 AI 图片编辑器与生成器）」**。
3. **SEO 页面矩阵加建**：针对高搜索意图词，加建包含首页、生成器工具、对比组、开发者组、特性组在内的高权重页面矩阵。

---

## 二、 今日开发完成事项清单

### 1. 仓库独立与架构整理 (Phase 0)
- [x] **目录扁平化**：将原克隆出的 `StickerShow/` 子目录内所有代码平铺至根目录 `e:/kaifa/qwenimage-editor`。
- [x] **解绑原 Git 历史**：删除原 `.git`，重新执行 `git init -b main`。
- [x] **初始化基线提交**：提交 `chore: initial commit from StickerShow baseline` 并推送到独立的个人 GitHub 仓库。
- [x] **输出代码地图**：完成 auth / 支付 / 数据库 / 图片存储 / 生成调用 / 页面路由 / i18n 完整代码地图比对。

### 2. 底座排错与构建加固（关键踩坑修复）
- [x] **修复 SSG 空 URL 崩溃**：原底座在 `.env.production` 环境变量为空时，`helpers.ts` 中的 `process?.env?.NEXT_PUBLIC_SITE_URL ??` 表达式会评估为 `""`，引发 `new URL("")` 抛出 `TypeError: Invalid URL`。现已加入安全清洗与 `http://localhost/` 自动兜底。
- [x] **修复数据库离线导致的静态预渲染中断**：原底座各页面在 `next build` 时直接访问未启动的本地 Postgres，抛出 `ECONNREFUSED 127.0.0.1:5432` 导致打包失败。已在 [src/servers/works.ts](file:///e:/kaifa/qwenimage-editor/src/servers/works.ts)、[keyValue.ts](file:///e:/kaifa/qwenimage-editor/src/servers/keyValue.ts)、[search.ts](file:///e:/kaifa/qwenimage-editor/src/servers/search.ts) 对查询做安全包装与容错降级。
- [x] **收敛单语言（阶段一）**：按照提示词要求，在 [src/i18n/config.ts](file:///e:/kaifa/qwenimage-editor/src/i18n/config.ts) 与 [src/middleware.ts](file:///e:/kaifa/qwenimage-editor/src/middleware.ts) 中收敛为仅启用 `en` 语言，避免初期机翻稀释权重。

### 3. 品牌统一与贴纸残留彻底清除
- [x] **品牌三处严格一致**：
  - 站名：`Qwen Image Editor`
  - Logo 文字：`Qwen Image Editor`
  - 首页 Title：`Qwen Image Editor — Free Online AI Image Editor`（≤ 60 字符，不出现 2.1）
- [x] **视觉资产升级**：
  - 设计全新的 AI 图像编辑器矢量 Logo 图标：[public/appicon.svg](file:///e:/kaifa/qwenimage-editor/public/appicon.svg) 与 [public/website.svg](file:///e:/kaifa/qwenimage-editor/public/website.svg)。
  - 生成 1200×630 OpenGraph 社交分享横幅：[public/images/og-image.jpg](file:///e:/kaifa/qwenimage-editor/public/images/og-image.jpg)。
  - 生成高质感真实修图与文字渲染对比图：`public/images/qwen_editor_demo.jpg`、`public/images/model_compare_demo.jpg`。
- [x] **全站文案重写**：全面重构 [messages/en.json](file:///e:/kaifa/qwenimage-editor/messages/en.json)，清除 Footer 中遗留的 Sticker.Show 外链和旧文案。

### 4. 生成通道扩展与支付加固
- [x] **支持 Qwen 模型双通道**：
  - 文生图：`qwen/qwen-image`
  - 图生图/修图：`qwen/qwen-image-edit`
  - 更新 [src/libs/replicate.ts](file:///e:/kaifa/qwenimage-editor/src/libs/replicate.ts) 与 [src/app/[locale]/api/generate/handle/route.ts](file:///e:/kaifa/qwenimage-editor/src/app/[locale]/api/generate/handle/route.ts)。
- [x] **原图上传接口**：新增 [src/app/[locale]/api/upload/route.ts](file:///e:/kaifa/qwenimage-editor/src/app/[locale]/api/upload/route.ts)，支持拖拽/点击图片上传至 Cloudflare R2 并生成公网 URL。
- [x] **数据库拓展字段迁移**：创建 [sql/tables/9_add_image_edit_fields.sql](file:///e:/kaifa/qwenimage-editor/sql/tables/9_add_image_edit_fields.sql)，添加 `input_image_url` 与 `task_type` 字段，后端代码兼具向前兼容。
- [x] **Webhook 健壮性**：[callByReplicate/route.ts](file:///e:/kaifa/qwenimage-editor/src/app/[locale]/api/generate/callByReplicate/route.ts) 支持单个字符串与数组多格式输出，并在 R2 故障时自动直连源链接。
- [x] **Stripe 支付防护**：
  - [create-checkout-session](file:///e:/kaifa/qwenimage-editor/src/app/[locale]/api/stripe/create-checkout-session/route.ts)：加入活跃订阅查询，阻止用户重复订阅扣费。
  - [webhooks](file:///e:/kaifa/qwenimage-editor/src/app/[locale]/api/stripe/webhooks/route.ts)：利用 `key_value` 表实现事件幂等性校验，防止重复消费；增加 `invoice.payment_failed` 与 `charge.refunded` 监控。

### 5. 第一批次（Phase 1）页面矩阵全量交付
| 页面路径 | 页面定位 | Title / H1 核心规范 | 交付内容 |
| :--- | :--- | :--- | :--- |
| **`/`** | 首页 在线编辑器 | **Title**: `Qwen Image Editor — Free Online AI Image Editor`<br>**H1**: `Free Online Qwen Image Editor` | 真实可交互在线修图器、拖拽原图上传、快捷修图 Tag、文生图与图生图双模式、Before/After 对比预览、HD 下载、快捷工具矩阵、3步指引、4大特性、FAQ、`SoftwareApplication`+`FAQPage` Schema |
| **`/generator`** | 文生图工具页 | **Title**: `Qwen Image Generator — Free Online AI Image Generator`<br>**H1**: `Free Online Qwen Image Generator` | 独立文生图工具、1:1/16:9/9:16 比例切换、一键试用 Prompt、三步教程、参数规格表（CFG/Steps/Text）、≥800 词深度科普、FAQ、内链推荐 |
| **`/vs-midjourney`** | 对比组（最高优先） | **Title**: `Qwen Image 2.1 vs Midjourney — Which Is Better?`<br>**H1**: `Qwen Image 2.1 vs Midjourney: Comprehensive Comparison` | 结论速览表、文字渲染实测对比、局部图生图 vs 盲盒生成、适合谁、并排示例图、FAQ (6条)、Related comparisons 互链、`Article` Schema |
| **`/vs-nano-banana`** | 对比组（最高优先） | **Title**: `Qwen Image 2.1 vs Nano Banana — Full Comparison`<br>**H1**: `Qwen Image 2.1 vs Nano Banana: Full Comparison` | 结论速览表（7B vs 端侧架构）、VRAM 开销与速度对比、适合谁、深度分析、FAQ、互链 |
| **`/vs-flux`** | 对比组（最高优先） | **Title**: `Qwen Image 2.1 vs Flux — Quality, Speed & Cost`<br>**H1**: `Qwen Image 2.1 vs Flux: Quality, Speed & Cost Comparison` | 结论速览表、12B DiT 显存开销与商业授权对比、双语文字排印对比、局部编辑 vs 重绘流程、FAQ、互链 |

### 6. SEO 技术标准落地
- [x] **语义化结构**：所有页面均严格采用 `header` / `main` / `article` / `section` / `nav` / `footer`。
- [x] **TDK 精准控制**：Title ≤ 60 字符，Meta Description 140~158 字符，每页唯一 H1。
- [x] **互链矩阵**：三组对比页通过 "Related comparisons" 互相交织链接，内页底部均带有工具推荐和链回首页。
- [x] **Sitemap & Robots**：
  - [public/sitemap.xml](file:///e:/kaifa/qwenimage-editor/public/sitemap.xml) 清除全部 sticker.show 废链，收录全部新交付路由。
  - [public/robots.txt](file:///e:/kaifa/qwenimage-editor/public/robots.txt) 允许搜索引擎抓取全站公开内容。
- [x] **构建验证**：全量执行 `npm run build`，15 个路由全部静态/服务端预渲染成功，0 报错。

---

## 三、 关键代码提交历史

1. `e34d13b` - `chore: initial commit from StickerShow baseline`
2. `0340f23` - `fix: stabilize build by normalizing URLs and adding DB offline fallbacks`
3. `7a5a35e` - `feat(phase-1): deliver homepage editor, generator, vs-midjourney, vs-nano-banana, vs-flux with full SEO matrix`

---

## 四、 下一步工作计划（复盘指引）

### 第二批交付（Phase 2）
1. [ ] `/prompt`：Qwen Image Prompt Guide — Prompts, Examples & Generator（包含提示词生成器、写作公式、分类提示词库 ≥30 条真实示例、FAQ）
2. [ ] `/alternative`：Best Qwen Image 2.1 Alternatives in 2026（结论速览表、逐项对比、适合谁、并排示例图、FAQ）
3. [ ] `/api-pricing`：Qwen Image 2.1 API Pricing — Compare All Providers（主流服务商价格对比矩阵与计算器）
4. [ ] `/api`：Qwen Image 2.1 API — Get Your API Key & Quickstart
5. [ ] `/api-example`：Qwen Image 2.1 API Examples — Python, Node.js & cURL

### 第三批交付（Phase 3）
1. [ ] `/transparent`：Qwen Image 2.1 Transparent PNG
2. [ ] `/workflow`：Qwen Image 2.1 ComfyUI Workflow
3. [ ] `/multi-reference`：Qwen Image 2.1 Multi-Reference
4. [ ] `/product-image`：Qwen Image 2.1 Product Image Generator
5. [ ] `/comfyui`：Qwen Image 2.1 ComfyUI Setup Guide

---

## 五、 本地运行与联调提示

在 `.env.local` 中配置以下几项即可跑通实际在线生图与支付：
```bash
# 1. 图像回调地址 (本地调试请配合 ngrok 生成公网域名)
REPLICATE_WEBHOOK="https://your-ngrok-domain.ngrok-free.app"
REPLICATE_API_TOKEN="r8_xxx"

# 2. 数据库与存储
POSTGRES_URL="postgres://user:pass@localhost:5432/dbname"
R2_BUCKET="qwen-images"
STORAGE_DOMAIN="your-domain.r2.cloudflarestorage.com"
```
运行服务命令：
```bash
npm run dev
# 或 build 验证
npm run build
```
