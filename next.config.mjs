import createNextIntlPlugin from 'next-intl/plugin';

// Ensure critical URLs are never empty strings during static pre-rendering
if (!process.env.NEXT_PUBLIC_SITE_URL || !process.env.NEXT_PUBLIC_SITE_URL.trim()) {
  process.env.NEXT_PUBLIC_SITE_URL = 'https://www.qwenimage-editor.com';
}
if (!process.env.NEXTAUTH_URL || !process.env.NEXTAUTH_URL.trim()) {
  process.env.NEXTAUTH_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.qwenimage-editor.com';
} else {
  let cleanUrl = process.env.NEXTAUTH_URL.trim();
  cleanUrl = cleanUrl.replace(/^(https?:\/\/)+/i, 'https://');
  cleanUrl = cleanUrl.replace(/\/api\/auth.*$/i, '').replace(/\/callback.*$/i, '').replace(/\/+$/, '');
  process.env.NEXTAUTH_URL = cleanUrl;
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
    images: {
        formats: ['image/avif', 'image/webp'],
        minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
        deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
        imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    },
    async headers() {
        return [
            {
                source: '/(.*)',
                headers: [
                    {
                        key: 'X-Content-Type-Options',
                        value: 'nosniff',
                    },
                    {
                        key: 'X-Frame-Options',
                        value: 'DENY',
                    },
                    {
                        key: 'X-XSS-Protection',
                        value: '1; mode=block',
                    },
                ],
            },
            {
                source: '/(images|icons|fonts)/(.*)',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=31536000, immutable',
                    },
                ],
            },
        ];
    },
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
