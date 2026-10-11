'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  CpuChipIcon,
  ArrowPathIcon,
  ArrowTopRightOnSquareIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
  UserGroupIcon,
  SparklesIcon,
  CheckCircleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

interface BotRow {
  botName: string;
  firstVisit: string;
  firstPage: string;
  dailySummary: string;
}

interface VisitorRow {
  source: string;
  firstVisitor: string;
  dailySummary: string;
}

interface MonitorData {
  botRows: BotRow[];
  visitorRows: VisitorRow[];
}

export default function StatsDashboardComponent() {
  const [data, setData] = useState<MonitorData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res = await fetch('/api/admin/bot-monitor/stats', {
        cache: 'no-store',
      });
      if (!res.ok) {
        throw new Error(`API responded with status ${res.status}`);
      }
      const json = await res.json();
      if (json.ok && json.data) {
        setData(json.data);
        const now = new Date();
        const bjTime = new Date(now.getTime() + (8 - now.getTimezoneOffset() / -60) * 3600 * 1000);
        setLastUpdated(
          `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`
        );
      } else {
        throw new Error(json.error || 'Failed to load monitoring data');
      }
    } catch (err: any) {
      console.error('Failed to fetch monitor stats:', err);
      setError(err?.message || 'Network error fetching stats');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto-refresh interval (every 30 seconds if enabled)
  useEffect(() => {
    if (!autoRefresh) return;
    const timer = setInterval(() => {
      fetchData();
    }, 30000);
    return () => clearInterval(timer);
  }, [autoRefresh, fetchData]);

  // Derived metrics
  const activeBotsCount = data?.botRows?.filter((r) => r.firstVisit !== '还没有').length || 0;
  const activeVisitorsCount = data?.visitorRows?.filter((r) => r.firstVisitor !== '还没有').length || 0;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Background ambient decorative glows */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Top Header Bar */}
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                <CpuChipIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
                  <span>Qwen Image Editor</span>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-mono">
                    _stats
                  </span>
                </h1>
                <p className="text-xs text-slate-400 mt-0.5">
                  搜索引擎蜘蛛与 AI 爬虫真实抓取足迹 • 真实访客流量监控看板 (UTC+8 北京时间)
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`text-xs px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 cursor-pointer ${
                autoRefresh
                  ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
                  : 'border-slate-800 bg-slate-900 text-slate-400'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  autoRefresh ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'
                }`}
              />
              <span>{autoRefresh ? '自动刷新 (30s)' : '自动刷新已暂停'}</span>
            </button>

            <button
              type="button"
              onClick={fetchData}
              disabled={loading}
              className="text-xs font-semibold px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <ArrowPathIcon className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
              <span>刷新</span>
            </button>

            <Link
              href="/"
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 transition-all flex items-center gap-1.5"
            >
              <span>访问网站</span>
              <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5" />
            </Link>
          </div>
        </header>

        {/* Status / Metric Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4 backdrop-blur-md">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>已捕获活跃爬虫</span>
              <CpuChipIcon className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black text-white">{activeBotsCount}</span>
              <span className="text-xs text-slate-500">/ 8 类主流蜘蛛</span>
            </div>
            <div className="mt-1 text-[11px] text-cyan-400 flex items-center gap-1">
              <CheckCircleIcon className="w-3.5 h-3.5" />
              <span>反向 DNS 严格鉴权</span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4 backdrop-blur-md">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>已记录访客来源</span>
              <UserGroupIcon className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black text-white">{activeVisitorsCount}</span>
              <span className="text-xs text-slate-500">/ 5 大主渠道</span>
            </div>
            <div className="mt-1 text-[11px] text-indigo-300 flex items-center gap-1">
              <SparklesIcon className="w-3.5 h-3.5" />
              <span>真人浏览器精准归因</span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4 backdrop-blur-md">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>反爬与防伪造状态</span>
              <ShieldCheckIcon className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-xl font-bold text-emerald-400">100% Verified</span>
            </div>
            <div className="mt-1 text-[11px] text-slate-400">
              已过滤非官方伪造 User-Agent
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4 backdrop-blur-md">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>看板更新状态</span>
              <ClockIcon className="w-4 h-4 text-purple-400" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-base font-bold text-slate-200 font-mono">
                {lastUpdated || '加载中...'}
              </span>
            </div>
            <div className="mt-1 text-[11px] text-slate-500">
              数据源: Neon PostgreSQL
            </div>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl border border-rose-500/30 bg-rose-500/10 text-xs text-rose-300 flex items-center gap-2">
            <span>数据加载失败: {error}</span>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* Table 1: 爬虫什么时候来的（北京时间，只算 IP 验证为真的） */}
        {/* ---------------------------------------------------- */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-md p-5 sm:p-6 shadow-2xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400" />
                <span>爬虫什么时候来的（北京时间，只算 IP 验证为真的）</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                实时追踪 Google、OpenAI、Claude、Bing 等各大模型与搜索引擎蜘蛛的收录进度。
              </p>
            </div>
            <span className="text-[11px] text-slate-500 font-mono">
              Reverse DNS PTR Verified Only
            </span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800/80 bg-slate-950/40">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 bg-slate-900/50">
                  <th className="py-3.5 px-4 font-semibold text-slate-300">爬虫</th>
                  <th className="py-3.5 px-4 font-semibold text-slate-300">第一次来</th>
                  <th className="py-3.5 px-4 font-semibold text-slate-300">第一次抓页面</th>
                  <th className="py-3.5 px-4 font-semibold text-slate-300">每天抓的页面数 (最近 7 天)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {loading && !data ? (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-slate-500">
                      <ArrowPathIcon className="w-5 h-5 mx-auto mb-2 animate-spin text-cyan-400" />
                      正在加载爬虫日志...
                    </td>
                  </tr>
                ) : data?.botRows && data.botRows.length > 0 ? (
                  data.botRows.map((row, idx) => {
                    const hasVisited = row.firstVisit !== '还没有';
                    const hasPage = row.firstPage !== '还没有';

                    return (
                      <tr
                        key={idx}
                        className={`hover:bg-slate-800/40 transition-colors ${
                          hasVisited ? 'bg-cyan-950/10' : ''
                        }`}
                      >
                        <td className="py-3.5 px-4 font-medium text-white flex items-center gap-2">
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              hasVisited ? 'bg-cyan-400 shadow-sm shadow-cyan-400' : 'bg-slate-600'
                            }`}
                          />
                          <span>{row.botName}</span>
                        </td>
                        <td className="py-3.5 px-4">
                          {hasVisited ? (
                            <span className="text-slate-200 font-mono">{row.firstVisit}</span>
                          ) : (
                            <span className="text-slate-500">还没有</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          {hasPage ? (
                            <span
                              className={`font-mono font-semibold ${
                                row.firstPage === '同时' ? 'text-emerald-400' : 'text-cyan-400'
                              }`}
                            >
                              {row.firstPage}
                            </span>
                          ) : (
                            <span className="text-slate-500">还没有</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[11px]">
                          {row.dailySummary !== '0' ? (
                            <span className="text-amber-300 font-semibold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                              {row.dailySummary}
                            </span>
                          ) : (
                            <span className="text-slate-600">0</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-500">
                      暂无爬虫记录
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-slate-500 pt-1 gap-1">
            <span>
              💡 统计规则：自动排除伪造 UA，仅放行具备权威反向 DNS 验证或官方 IP 段的合法搜索爬虫。
            </span>
            <span>时区：UTC+8 (Asia/Shanghai)</span>
          </div>
        </section>

        {/* ---------------------------------------------------- */}
        {/* Table 2: 什么时候带来真实访客（只算真人浏览器） */}
        {/* ---------------------------------------------------- */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-md p-5 sm:p-6 shadow-2xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>什么时候带来真实访客（只算真人浏览器）</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                监控主流 AI 平台推荐转化与搜索引擎自然带量情况（30 分钟内同一访客自动去重）。
              </p>
            </div>
            <span className="text-[11px] text-slate-500 font-mono">
              Referrer-Based Attribution
            </span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800/80 bg-slate-950/40">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 bg-slate-900/50">
                  <th className="py-3.5 px-4 font-semibold text-slate-300">来源</th>
                  <th className="py-3.5 px-4 font-semibold text-slate-300">第一个真实访客</th>
                  <th className="py-3.5 px-4 font-semibold text-slate-300">每天访客数 (最近 7 天)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {loading && !data ? (
                  <tr>
                    <td colSpan={3} className="py-12 text-center text-slate-500">
                      <ArrowPathIcon className="w-5 h-5 mx-auto mb-2 animate-spin text-emerald-400" />
                      正在加载访客日志...
                    </td>
                  </tr>
                ) : data?.visitorRows && data.visitorRows.length > 0 ? (
                  data.visitorRows.map((row, idx) => {
                    const hasVisitor = row.firstVisitor !== '还没有';

                    return (
                      <tr
                        key={idx}
                        className={`hover:bg-slate-800/40 transition-colors ${
                          hasVisitor ? 'bg-emerald-950/10' : ''
                        }`}
                      >
                        <td className="py-3.5 px-4 font-medium text-white flex items-center gap-2">
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              hasVisitor
                                ? 'bg-emerald-400 shadow-sm shadow-emerald-400'
                                : 'bg-slate-600'
                            }`}
                          />
                          <span>{row.source}</span>
                        </td>
                        <td className="py-3.5 px-4">
                          {hasVisitor ? (
                            <span className="text-emerald-400 font-medium font-mono">
                              {row.firstVisitor}
                            </span>
                          ) : (
                            <span className="text-slate-500">还没有</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[11px]">
                          {row.dailySummary !== '—' ? (
                            <span className="text-emerald-300 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                              {row.dailySummary}
                            </span>
                          ) : (
                            <span className="text-slate-600">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={3} className="py-8 text-center text-slate-500">
                      暂无真人访客记录
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-slate-500 pt-1 gap-1">
            <span>
              💡 统计规则：严格剔除无头浏览器与离线扫描器，仅记录来自公网自然访问的真实 IP 会话。
            </span>
            <span>归因方式：HTTP Referer + Geo IP 粗粒度解析</span>
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center text-xs text-slate-600 pt-4 pb-8 space-y-1">
          <p>
            Qwen Image Editor © {new Date().getFullYear()} • 站长实时收录与访客监控管道
          </p>
          <p className="text-[11px] text-slate-700">
            Powered by Next.js Telemetry &amp; Serverless PostgreSQL
          </p>
        </footer>
      </div>
    </div>
  );
}
