import { setRequestLocale } from 'next-intl/server';
import AdminDashboardComponent from './AdminDashboardComponent';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Master Admin Console — Qwen Image Editor',
  description: 'Webmaster administration and analytics studio.',
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = 'force-dynamic';

export default async function AdminPage({
  params: { locale = 'en' },
}: {
  params: { locale: string };
}) {
  setRequestLocale(locale);

  return <AdminDashboardComponent locale={locale} />;
}
