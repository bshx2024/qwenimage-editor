import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { BLOG_POSTS, getBlogPostBySlug } from '~/content/blogData';
import BlogPostComponent from './BlogPostComponent';
import HiggsfieldBlogPostComponent from './HiggsfieldBlogPostComponent';
import MinimaxH3BlogPostComponent from './MinimaxH3BlogPostComponent';

export const revalidate = 3600;

export function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({
    slug: post.slug,
  }));
}

export default async function BlogPostPage({
  params: { locale = 'en', slug },
}: {
  params: { locale: string; slug: string };
}) {
  setRequestLocale(locale);

  const post = getBlogPostBySlug(slug);
  if (!post) {
    notFound();
  }

  if (slug === 'higgsfield-genjutsu-workflow-guide-free-alternatives') {
    return <HiggsfieldBlogPostComponent post={post} locale={locale} />;
  }

  if (slug === 'minimax-h3-comfyui-guide-vram-workflow') {
    return <MinimaxH3BlogPostComponent post={post} locale={locale} />;
  }

  return <BlogPostComponent post={post} locale={locale} />;
}

