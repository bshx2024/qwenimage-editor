import { setRequestLocale } from 'next-intl/server';
import EditTextInImageComponent from './EditTextInImageComponent';

export const revalidate = 3600;

export default async function EditTextInImagePage({
  params: { locale = 'en' },
}: {
  params: { locale: string };
}) {
  setRequestLocale(locale);

  return <EditTextInImageComponent locale={locale} />;
}
