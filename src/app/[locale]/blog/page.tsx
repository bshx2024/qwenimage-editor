import { setRequestLocale } from 'next-intl/server';
import BlogListComponent from './BlogListComponent';

export const revalidate = 3600;

export default async function BlogListPage({
  params: { locale = 'en' },
}: {
  params: { locale: string };
}) {
  setRequestLocale(locale);

  return <BlogListComponent locale={locale} />;
}
