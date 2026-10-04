import createNextIntlPlugin from 'next-intl/plugin';

// Ensure critical URLs are never empty strings during static pre-rendering
if (!process.env.NEXT_PUBLIC_SITE_URL || !process.env.NEXT_PUBLIC_SITE_URL.trim()) {
  process.env.NEXT_PUBLIC_SITE_URL = 'https://qwenimage-editor.com';
}
if (!process.env.NEXTAUTH_URL || !process.env.NEXTAUTH_URL.trim()) {
  process.env.NEXTAUTH_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://qwenimage-editor.com';
}
if (!process.env.NEXTAUTH_SECRET) {
  process.env.NEXTAUTH_SECRET = 'qwenimage-editor-default-production-secret-key-2026';
}
if (!process.env.NEXT_PUBLIC_WEBSITE_NAME || !process.env.NEXT_PUBLIC_WEBSITE_NAME.trim()) {
  process.env.NEXT_PUBLIC_WEBSITE_NAME = 'Qwen Image Editor';
}

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
    async redirects() {
        return [
            {source: '/en', destination: '/', permanent: true},
            {source: '/stickers/1', destination: '/stickers', permanent: true},
            {source: '/stickers/0', destination: '/stickers', permanent: true},
            {source: '/:locale/stickers/1', destination: '/:locale/stickers', permanent: true},
            {source: '/:locale/stickers/0', destination: '/:locale/stickers', permanent: true},
        ];
    }
};

export default withNextIntl(nextConfig);
