import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { BLOG_POSTS, getBlogPostBySlug } from '~/content/blogData';
import BlogPostComponent from './BlogPostComponent';
import HiggsfieldBlogPostComponent from './HiggsfieldBlogPostComponent';
import MinimaxH3BlogPostComponent from './MinimaxH3BlogPostComponent';
import ViduS2BlogPostComponent from './ViduS2BlogPostComponent';
import AiFontGeneratorBlogPostComponent from './AiFontGeneratorBlogPostComponent';
import IdeogramBlogPostComponent from './IdeogramBlogPostComponent';
import RumpelstiltskinBlogPostComponent from './RumpelstiltskinBlogPostComponent';
import PhotoCraftBlogPostComponent from './PhotoCraftBlogPostComponent';
import Qwen4ReleaseDateBlogPostComponent from './Qwen4ReleaseDateBlogPostComponent';
import MossImageBlogPostComponent from './MossImageBlogPostComponent';
import OpenH3RegenerateBlogPostComponent from './OpenH3RegenerateBlogPostComponent';
import ChatGptImages26BlogPostComponent from './ChatGptImages26BlogPostComponent';
import ZImageTurboBlogPostComponent from './ZImageTurboBlogPostComponent';
import GptImageSunburstBlogPostComponent from './GptImageSunburstBlogPostComponent';
import BlogCallToActionBanner from '~/components/BlogCallToActionBanner';

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

  let postComponent;
  if (slug === 'gpt-image-2-6-sunburst-vs-qwen-image-benchmark') {
    postComponent = <GptImageSunburstBlogPostComponent post={post} locale={locale} />;
  } else if (slug === 'z-image-turbo-guide-comfyui-workflows-prompting-online') {
    postComponent = <ZImageTurboBlogPostComponent post={post} locale={locale} />;
  } else if (slug === 'chatgpt-images-2-6-review-limitations-alternative') {
    postComponent = <ChatGptImages26BlogPostComponent post={post} locale={locale} />;
  } else if (slug === 'open-h3-regenerate-2k-comfyui-setup-alternatives') {
    postComponent = <OpenH3RegenerateBlogPostComponent post={post} locale={locale} />;
  } else if (slug === 'moss-image-guide-comfyui-workflow-prompting-edit') {
    postComponent = <MossImageBlogPostComponent post={post} locale={locale} />;
  } else if (slug === 'qwen-4-release-date-27b-specs-roadmap') {
    postComponent = <Qwen4ReleaseDateBlogPostComponent post={post} locale={locale} />;
  } else if (slug === 'photocraft-online-ai-review-photoshop-alternative') {
    postComponent = <PhotoCraftBlogPostComponent post={post} locale={locale} />;
  } else if (slug === 'rumpelstiltskin-ai-1987-movie-meme-workflow') {
    postComponent = <RumpelstiltskinBlogPostComponent post={post} locale={locale} />;
  } else if (slug === 'ideogram-4-5-open-source-weights-alternatives') {
    postComponent = <IdeogramBlogPostComponent post={post} locale={locale} />;
  } else if (slug === 'ai-font-generator-from-image-guide') {
    postComponent = <AiFontGeneratorBlogPostComponent post={post} locale={locale} />;
  } else if (slug === 'higgsfield-genjutsu-workflow-guide-free-alternatives') {
    postComponent = <HiggsfieldBlogPostComponent post={post} locale={locale} />;
  } else if (slug === 'minimax-h3-comfyui-guide-vram-workflow') {
    postComponent = <MinimaxH3BlogPostComponent post={post} locale={locale} />;
  } else if (slug === 'vidu-s2-realtime-interactive-video-guide') {
    postComponent = <ViduS2BlogPostComponent post={post} locale={locale} />;
  } else {
    postComponent = <BlogPostComponent post={post} locale={locale} />;
  }

  return (
    <>
      <BlogCallToActionBanner locale={locale} slug={slug} postTitle={post.title} />
      {postComponent}
    </>
  );
}

