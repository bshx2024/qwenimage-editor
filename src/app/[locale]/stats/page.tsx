import { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import StatsDashboardComponent from '~/components/StatsDashboardComponent';

export const metadata: Metadata = {
  title: '实时蜘蛛与访客流量看板 (_stats) — Qwen Image Editor',
  description: '全天候实时监控各大搜索引擎蜘蛛抓取足迹与自然访客引荐流量。',
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = 'force-dynamic';

export default async function StatsPage({
  params: { locale = 'en' },
}: {
  params: { locale: string };
}) {
  setRequestLocale(locale);

  return <StatsDashboardComponent />;
}
