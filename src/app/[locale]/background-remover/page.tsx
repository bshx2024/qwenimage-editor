import { setRequestLocale } from 'next-intl/server';
import BackgroundRemoverComponent from './BackgroundRemoverComponent';

export const revalidate = 3600;

export default async function BackgroundRemoverPage({
  params: { locale = 'en' },
}: {
  params: { locale: string };
}) {
  setRequestLocale(locale);

  return <BackgroundRemoverComponent locale={locale} />;
}
