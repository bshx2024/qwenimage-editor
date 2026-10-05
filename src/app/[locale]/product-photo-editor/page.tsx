import { setRequestLocale } from 'next-intl/server';
import ProductPhotoEditorComponent from './ProductPhotoEditorComponent';

export const revalidate = 3600;

export default async function ProductPhotoEditorPage({
  params: { locale = 'en' },
}: {
  params: { locale: string };
}) {
  setRequestLocale(locale);

  return <ProductPhotoEditorComponent locale={locale} />;
}
