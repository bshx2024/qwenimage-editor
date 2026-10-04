import { setRequestLocale } from 'next-intl/server';
import VsMidjourneyComponent from './VsMidjourneyComponent';

export const revalidate = 3600;

export default async function VsMidjourneyPage({
  params: { locale = 'en' },
}: {
  params: { locale: string };
}) {
  setRequestLocale(locale);

  return <VsMidjourneyComponent locale={locale} />;
}
