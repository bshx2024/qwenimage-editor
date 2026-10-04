import { setRequestLocale } from 'next-intl/server';
import VsNanoBananaComponent from './VsNanoBananaComponent';

export const revalidate = 3600;

export default async function VsNanoBananaPage({
  params: { locale = 'en' },
}: {
  params: { locale: string };
}) {
  setRequestLocale(locale);

  return <VsNanoBananaComponent locale={locale} />;
}
