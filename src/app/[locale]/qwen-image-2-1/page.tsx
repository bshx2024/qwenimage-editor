import { setRequestLocale } from 'next-intl/server';
import Qwen21Component from './Qwen21Component';

export const revalidate = 3600;

export default async function Qwen21Page({
  params: { locale = 'en' },
}: {
  params: { locale: string };
}) {
  setRequestLocale(locale);

  return <Qwen21Component locale={locale} />;
}
