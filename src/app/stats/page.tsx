import { Metadata } from 'next';
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

export default function RootStatsPage() {
  return <StatsDashboardComponent />;
}
