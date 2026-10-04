# Qwen Image Editor — Free Online AI Image Editor

<p align="center">
  <img src="public/appicon.svg" width="100" height="100" alt="Qwen Image Editor Logo" />
</p>

<p align="center">
  <b>Next-generation online AI image editing and visual synthesis powered by Alibaba's Qwen vision foundation models.</b>
</p>

<p align="center">
  <a href="https://qwenimage-editor.com">Website</a> •
  <a href="#key-features">Key Features</a> •
  <a href="#quickstart">Quickstart</a> •
  <a href="#seo--page-matrix">SEO Matrix</a> •
  <a href="#deployment">Deployment</a>
</p>

---

## 🌟 Overview

**Qwen Image Editor** (`qwenimage-editor.com`) is a full-stack, production-ready web application built on **Next.js 14 (App Router)**, **TypeScript**, and **Tailwind CSS**. It enables creators, designers, and marketers to transform photos, execute localized inpainting, generate photorealistic art, and render crisp bilingual typography in their browser.

- **Frontend & UI**: Next.js 14 App Router, Tailwind CSS, Headless UI, Heroicons
- **AI Inference**: Replicate API (`qwen/qwen-image-edit` & `qwen/qwen-image`)
- **Storage**: Cloudflare R2 (S3-compatible object storage) with CDN image compression
- **Database**: PostgreSQL with connection pooling
- **Authentication**: NextAuth with Google OAuth
- **Payments**: Stripe Subscriptions with webhook idempotency and duplicate subscription prevention
- **SEO Engine**: Dynamic sitemap, OpenGraph (1200x630), JSON-LD schemas (`SoftwareApplication`, `Article`, `FAQPage`)

---

## ✨ Key Features

1. **Interactive In-Browser Image Editor**:
   - Drag-and-drop or click to upload source photos.
   - Conversational text-guided inpainting and localized editing without manual layer masking.
   - Before / After side-by-side comparison slider and high-resolution export.
2. **Text-to-Image Generation (`/generator`)**:
   - Multi-aspect ratio selection (`1:1`, `16:9`, `9:16`).
   - Deep prompt adherence and industry-leading bilingual typography rendering.
3. **Comprehensive Benchmark Matrix**:
   - `/vs-midjourney`: Qwen Image 2.1 vs Midjourney V6
   - `/vs-nano-banana`: Qwen Image 2.1 vs Nano Banana
   - `/vs-flux`: Qwen Image 2.1 vs Flux.1 (Dev/Schnell)
4. **Hardened Payment & Account Security**:
   - Duplicate subscription prevention and active plan verification.
   - Idempotent Stripe webhook handling via database event logs.
   - Graceful fallback for offline databases during static site builds.

---

## 🚀 Quickstart

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/bshx2024/qwenimage-editor.git
cd qwenimage-editor

# Install dependencies (Node v20+ recommended)
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env.local` and fill in your service credentials:

```bash
cp .env.example .env.local
```

Key environment configurations:

```env
# Website URL
NEXT_PUBLIC_SITE_URL=http://localhost
NEXT_PUBLIC_WEBSITE_NAME="Qwen Image Editor"

# PostgreSQL Database
POSTGRES_URL="postgres://user:password@localhost:5432/qwen_editor"

# Replicate API (https://replicate.com/account/api-tokens)
REPLICATE_API_TOKEN="r8_xxxxxxxxxxxxxxxxxxxxxxxx"
# Webhook URL for async prediction results (use ngrok for local dev)
REPLICATE_WEBHOOK="https://your-ngrok-domain.ngrok-free.app"

# Cloudflare R2 Storage
STORAGE_DOMAIN="your-domain.r2.cloudflarestorage.com"
R2_BUCKET="qwen-images"
R2_ACCOUNT_ID="your_account_id"
R2_ACCESS_KEY_ID="your_access_key"
R2_SECRET_ACCESS_KEY="your_secret_key"

# Stripe Payments (Test mode supported)
NEXT_PUBLIC_CHECK_AVAILABLE_TIME=1
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_xxx"
STRIPE_SECRET_KEY="sk_test_xxx"
STRIPE_WEBHOOK_SECRET="whsec_xxx"
```

### 3. Initialize Database Tables

Execute the SQL scripts located in [`sql/tables/`](./sql/tables/):
- `1_user_info.sql`
- `2_user_available.sql`
- `3_stripe_customers.sql`
- `4_stripe_subscriptions.sql`
- `5_works.sql`
- `6_key_value.sql`
- `7_search_log.sql`
- `8_sensitive_words.sql`
- `9_add_image_edit_fields.sql`

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost](http://localhost) in your browser.

---

## 📦 Production Build

```bash
npm run build
npm run start
```

---

## 🗺️ Page Matrix & SEO Structure

- `/` — Homepage & Interactive Image Editor
- `/generator` — AI Text-to-Image Generator
- `/vs-midjourney` — Qwen Image 2.1 vs Midjourney Comparison
- `/vs-nano-banana` — Qwen Image 2.1 vs Nano Banana Comparison
- `/vs-flux` — Qwen Image 2.1 vs Flux Comparison
- `/pricing` — Subscription Plans & Credits
- `/my` — User Visual Gallery & History
- `/privacy-policy` — Privacy Policy
- `/terms-of-service` — Terms of Service
- `/sitemap.xml` — Complete Search Engine Sitemap

---

## 📄 License

MIT License. Built for creators and developers worldwide.
