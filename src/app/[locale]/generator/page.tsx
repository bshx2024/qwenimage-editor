import { setRequestLocale } from 'next-intl/server';
import GeneratorPageComponent from './GeneratorPageComponent';

export const revalidate = 3600;

export default async function GeneratorPage({
  params: { locale = 'en' },
  searchParams,
}: {
  params: { locale: string };
  searchParams: { prompt?: string };
}) {
  setRequestLocale(locale);

  return (
    <GeneratorPageComponent
      locale={locale}
      searchParams={searchParams}
    />
  );
}
