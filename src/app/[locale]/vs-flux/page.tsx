import { setRequestLocale } from 'next-intl/server';
import VsFluxComponent from './VsFluxComponent';

export const revalidate = 3600;

export default async function VsFluxPage({
  params: { locale = 'en' },
}: {
  params: { locale: string };
}) {
  setRequestLocale(locale);

  return <VsFluxComponent locale={locale} />;
}
