# Project Identity & Telemetry Rules (Qwen Image Editor)

## 1. Project Identity & Scope Boundary
- **Current Workspace & Project**: **Qwen Image Editor** (Official domain: `https://www.qwenimage-editor.com`).
- **Tech Stack**: Next.js App Router (i18n), PostgreSQL (`user_info`, `user_survey_logs`, `works`, `user_available`, `payment_orders`, `bot_crawl_logs`, `genuine_visitor_logs`), Umami Analytics (`https://umami-three-lac.vercel.app`), Waffo Pancake / Stripe payment gateways, Replicate / Volcengine Ark / Bailian AI models.
- **Strict Isolation Rule**:
  - **NEVER** mix, inspect, or query any external projects or external VPS servers (specifically: **APIVALE**, VPS `192.119.88.209`, `new-api`, gin log files, or files on drive `G:\`).
  - Even if the user's active editor tabs or cursor metadata show files from other projects (such as `g:\1.旅行携带资料\APIVALE\...`), **strictly ignore them** and focus **exclusively** on this repository: **Qwen Image Editor**.

## 2. Visitor, Telemetry & Conversion Analysis Protocol
When the user asks to analyze visitors, logs, surveys, trajectories, or conversion rates for "本项目" (this project):
1. **Data Sources**:
   - **Umami Analytics**: `https://umami-three-lac.vercel.app` (Site ID: `9960b608-c370-4866-a4f9-cfd5f973daed`). Tracks real human visitors, referrers, entry pages, countries, devices, and session trajectories.
   - **Qwen Production APIs**:
     - `/api/admin/bot-monitor/stats`: Crawler & genuine visitor attribution stats.
     - `/api/admin/survey`: User onboarding surveys (`user_survey_logs`).
     - PostgreSQL database tables: `user_info`, `works` (image generations/tests), `user_survey_logs`, `payment_orders` / `stripe_subscriptions`.
2. **Analysis Dimensions**:
   - Visitor Sources (Google, ChatGPT, Brave, Direct, etc.).
   - Nationalities & Geo distribution.
   - User Journey & Trajectory (Landing pages, Blog articles, Image generator, Editor tool).
   - Time spent & Engagement.
   - Questionnaire Responses (`user_survey_logs` use cases, priorities).
   - Image generation testing activity (Works generated vs registered users).
   - Commercial conversion & Willingness to pay.
