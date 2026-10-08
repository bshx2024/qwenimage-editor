'use client'
import HeadInfo from "~/components/HeadInfo";
import Header from "~/components/Header";
import Footer from "~/components/Footer";
import { useEffect, useRef, useState } from "react";
import { useCommonContext } from "~/context/common-context";
import Link from "next/link";
import { getCompressionImageLink, getLinkHref, getShareToPinterest } from "~/configs/buildLink";
import { pinterestSvg } from "~/components/svg";
import {
  SparklesIcon,
  PhotoIcon,
  ArrowDownTrayIcon,
  DocumentDuplicateIcon,
  CheckIcon,
  ArrowPathIcon,
  TrashIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

interface PageComponentProps {
  locale: string;
  worksText: {
    title: string;
    description: string;
    h1Text: string;
    descriptionBelowH1Text?: string;
    descText?: string;
    toContinue?: string;
  };
}

const PageComponent = ({ locale, worksText }: PageComponentProps) => {
  const [pagePath] = useState('my');
  const [resultInfoList, setResultInfoList] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [alreadyLoadAll, setAlreadyLoadAll] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedUid, setCopiedUid] = useState<string | null>(null);
  const [checkingUid, setCheckingUid] = useState<string | null>(null);
  const [brokenImages, setBrokenImages] = useState<Record<string, boolean>>({});

  const {
    setShowLoadingModal,
    setShowLoginModal,
    userData,
  } = useCommonContext();

  const handleDeleteWork = async (uid: string) => {
    if (!window.confirm('Remove this record from your gallery?')) return;
    try {
      const res = await fetch('/api/works/updateWork', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid }),
      });
      if (res.ok) {
        setResultInfoList((prev) => prev.filter((item) => item.uid !== uid));
      }
    } catch (e) {
      console.error('Failed to remove creation:', e);
    }
  };

  const handleCheckStatus = async (uid: string) => {
    setCheckingUid(uid);
    try {
      const res = await fetch(`/api/works/getResultInfo?uid=${uid}&userId=${userData?.user_id || 'guest'}`);
      const data = await res.json();
      if (data.status === 1 && Array.isArray(data.output_url) && data.output_url.length > 0) {
        setResultInfoList((prev) =>
          prev.map((item) => (item.uid === uid ? { ...item, ...data, status: 1, output_url: data.output_url } : item))
        );
      } else if (data.status === 2) {
        setResultInfoList((prev) =>
          prev.map((item) => (item.uid === uid ? { ...item, status: 2, message: data.message } : item))
        );
      } else {
        alert('Creation is still rendering in the cloud. Please check again shortly.');
      }
    } catch (e) {
      console.error('Failed to refresh task status:', e);
    } finally {
      setCheckingUid(null);
    }
  };

  const fetchWorkList = async (page: number) => {
    if (!userData?.user_id) {
      setShowLoadingModal(false);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/works/getWorkList', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userData.user_id,
          current_page: page,
        }),
      });
      const result = await response.json();
      setShowLoadingModal(false);
      setIsLoading(false);

      if (!Array.isArray(result) || result.length === 0) {
        setAlreadyLoadAll(true);
      } else {
        setResultInfoList((prev) => (page === 1 ? result : [...prev, ...result]));
        setCurrentPage(page);
      }
    } catch (e) {
      console.error('Failed to load visual creations:', e);
      setShowLoadingModal(false);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userData?.user_id) {
      fetchWorkList(1);
    } else {
      setShowLoadingModal(false);
    }
  }, [userData]);

  const copyPrompt = (text: string, uid: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedUid(uid);
    setTimeout(() => setCopiedUid(null), 2000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white">
      <meta name="robots" content="noindex" />
      <HeadInfo
        locale={locale}
        page={pagePath}
        title={worksText.title}
        description={worksText.description}
      />
      <Header locale={locale} page={pagePath} />

      <main className="flex-1 w-full pb-20">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-10 pb-8 border-b border-slate-900 bg-slate-900/30">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[260px] bg-gradient-to-r from-purple-600/15 via-indigo-600/15 to-pink-600/10 blur-[130px] pointer-events-none rounded-full" />
          
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-300 mb-2.5">
                <SparklesIcon className="w-3.5 h-3.5 text-indigo-400" />
                <span>Personal AI Creation Studio</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                {worksText.h1Text || 'My Visual Creations'}
              </h1>
              <p className="text-sm text-slate-400 mt-1 max-w-xl">
                {worksText.descriptionBelowH1Text || 'Browse, download, and iterate on your AI generated artworks and photo edits.'}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href={getLinkHref(locale, '')}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-500 via-indigo-500 to-pink-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-purple-500/20 hover:opacity-95 transition-all"
              >
                <SparklesIcon className="w-4 h-4" />
                <span>New Generation</span>
              </Link>
              <Link
                href={getLinkHref(locale, 'generator')}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-800 px-4 py-2.5 text-sm font-medium text-slate-300 hover:text-white transition-colors"
              >
                <span>AI Generator</span>
              </Link>
            </div>
          </div>
        </section>

        {/* Gallery Content */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8">
          {!userData ? (
            /* Unauthenticated State */
            <div className="mx-auto max-w-md my-16 text-center p-8 rounded-3xl border border-slate-800 bg-slate-900/50 backdrop-blur-xl space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto text-indigo-400">
                <PhotoIcon className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-white">Sign In to View Your Creations</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Log in with your Google account to access all your generated artworks and photo edits synced securely in the cloud.
              </p>
              <button
                type="button"
                onClick={() => setShowLoginModal(true)}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-500 via-indigo-500 to-pink-500 py-3 text-sm font-semibold text-white shadow-lg hover:opacity-95 transition-all"
              >
                Sign In with Google
              </button>
            </div>
          ) : resultInfoList.length === 0 && !isLoading ? (
            /* Empty Creations State */
            <div className="mx-auto max-w-md my-16 text-center p-8 rounded-3xl border border-slate-800 bg-slate-900/50 backdrop-blur-xl space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto text-indigo-400">
                <SparklesIcon className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-white">No Visual Creations Yet</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Start your creative journey! Enter a prompt to synthesize photorealistic images with Qwen & Wanx 2.1 models.
              </p>
              <Link
                href={getLinkHref(locale, '')}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-500 via-indigo-500 to-pink-500 px-6 py-3 text-sm font-semibold text-white shadow-lg hover:opacity-95 transition-all"
              >
                <SparklesIcon className="w-4 h-4" />
                <span>Start Generating Now</span>
              </Link>
            </div>
          ) : (
            /* Visual Creations Grid */
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {resultInfoList.map((file: any, index: number) => {
                  const rawUrl = Array.isArray(file.output_url)
                    ? file.output_url[0] || file.output_url[1] || ''
                    : typeof file.output_url === 'string'
                    ? file.output_url
                    : '';
                  const isTaskPrefix = typeof rawUrl === 'string' && (rawUrl.startsWith('ark:') || rawUrl.startsWith('bailian:'));
                  const validUrl = isTaskPrefix ? '' : rawUrl;
                  const cleanImgUrl = getCompressionImageLink(validUrl);
                  const isCopied = copiedUid === file.uid;
                  const isSuccess = !!cleanImgUrl && Number(file.status) === 1;
                  const isPending = !isSuccess && Number(file.status) === 0;
                  const isFailed = !isSuccess && !isPending;
                  const isChecking = checkingUid === file.uid;
                  const isVideo = file.task_type?.startsWith('video_') || cleanImgUrl.endsWith('.mp4') || cleanImgUrl.includes('.mp4?');

                  return (
                    <div
                      key={file.uid || index}
                      className={`group rounded-2xl border transition-all duration-300 overflow-hidden flex flex-col ${
                        isFailed
                          ? 'border-amber-500/20 bg-slate-900/60 hover:border-amber-500/40'
                          : isPending
                          ? 'border-indigo-500/30 bg-slate-900/70 hover:border-indigo-500/50'
                          : 'border-slate-800 bg-slate-900/70 hover:border-indigo-500/50 hover:shadow-2xl hover:shadow-indigo-500/10'
                      }`}
                    >
                      {/* Media Preview Box (Image or Video) */}
                      <div className="relative w-full aspect-square bg-slate-950 overflow-hidden flex items-center justify-center">
                        {isSuccess ? (
                          isVideo ? (
                            <div className="relative w-full h-full bg-black flex items-center justify-center">
                              <video
                                src={cleanImgUrl}
                                controls
                                loop
                                playsInline
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : brokenImages[file.uid] ? (
                            <div className="flex flex-col items-center justify-center p-5 text-center space-y-2 bg-slate-900/90 w-full h-full">
                              <PhotoIcon className="w-8 h-8 text-slate-500 mb-0.5" />
                              <div className="text-xs font-semibold text-slate-300">临时链接已过期 (24h)</div>
                              <p className="text-[10px] text-slate-400 max-w-[170px] leading-tight">
                                阿里百炼临时文件已到期销毁，支持一键重绘
                              </p>
                              <Link
                                href={getLinkHref(locale, `?prompt=${encodeURIComponent(file.input_text || '')}`)}
                                className="mt-1 inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-600/90 hover:bg-indigo-600 text-[10px] font-semibold text-white transition-colors"
                              >
                                <SparklesIcon className="w-3 h-3 text-pink-300" />
                                <span>重新生成</span>
                              </Link>
                            </div>
                          ) : (
                            <img
                              src={cleanImgUrl}
                              alt={file.input_text || 'AI Visual Creation'}
                              width={400}
                              height={400}
                              loading="lazy"
                              onError={() => setBrokenImages((prev) => ({ ...prev, [file.uid]: true }))}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          )
                        ) : isPending ? (
                          <div className="flex flex-col items-center justify-center text-center p-6 space-y-2.5">
                            <ArrowPathIcon
                              className={`w-9 h-9 text-indigo-400 ${isChecking ? 'animate-spin' : 'animate-pulse'}`}
                            />
                            <div className="text-xs font-semibold text-slate-200">Generating Artwork...</div>
                            <p className="text-[11px] text-slate-400 leading-relaxed max-w-[200px]">
                              Synthesis in progress. Click to check if it has completed.
                            </p>
                            <button
                              type="button"
                              onClick={() => handleCheckStatus(file.uid)}
                              disabled={isChecking}
                              className="mt-1 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/90 hover:bg-indigo-600 text-[11px] font-semibold text-white shadow transition-colors disabled:opacity-50"
                            >
                              <ArrowPathIcon className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin' : ''}`} />
                              <span>{isChecking ? 'Checking...' : 'Check Status'}</span>
                            </button>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center text-center p-6 space-y-2">
                            <ExclamationTriangleIcon className="w-9 h-9 text-amber-400/90" />
                            <div className="text-xs font-semibold text-slate-200">Generation Failed</div>
                            <p className="text-[11px] text-emerald-400 font-medium">
                              Points refunded automatically
                            </p>
                            <div className="flex items-center gap-2 pt-2">
                              <Link
                                href={getLinkHref(locale, `?prompt=${encodeURIComponent(file.input_text || '')}`)}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-medium text-slate-200 transition-colors"
                              >
                                <SparklesIcon className="w-3.5 h-3.5 text-pink-400" />
                                <span>Retry</span>
                              </Link>
                              <button
                                type="button"
                                onClick={() => handleDeleteWork(file.uid)}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-[11px] font-medium text-red-400 transition-colors"
                                title="Delete record"
                              >
                                <TrashIcon className="w-3.5 h-3.5" />
                                <span>Remove</span>
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Top Badges */}
                        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none z-10">
                          {isSuccess ? (
                            <span className="px-2 py-0.5 rounded-md bg-slate-950/80 backdrop-blur-md border border-slate-800 text-[10px] font-semibold text-slate-300 uppercase tracking-wider">
                              {file.task_type?.startsWith('video_') ? 'Video' : file.task_type === 'image_edit' ? 'Edit' : 'T2I'}
                            </span>
                          ) : isPending ? (
                            <span className="px-2 py-0.5 rounded-md bg-indigo-500/20 backdrop-blur-md border border-indigo-500/30 text-[10px] font-semibold text-indigo-300 uppercase tracking-wider">
                              Processing
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-md bg-amber-500/20 backdrop-blur-md border border-amber-500/30 text-[10px] font-semibold text-amber-300 tracking-wider">
                              Failed · Refunded
                            </span>
                          )}

                          <div className="flex items-center gap-1.5 pointer-events-auto">
                            {isSuccess && (
                              <Link
                                href={`https://pinterest.com/pin/create/button/?url=${getShareToPinterest(locale, 'sticker/' + file.uid, file.input_text)}`}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1.5 rounded-lg bg-slate-950/80 hover:bg-red-600/90 border border-slate-800 hover:border-red-500 text-slate-300 hover:text-white transition-colors"
                                title="Share on Pinterest"
                              >
                                <span className="w-3.5 h-3.5 block">{pinterestSvg}</span>
                              </Link>
                            )}
                            <button
                              type="button"
                              onClick={() => handleDeleteWork(file.uid)}
                              className="p-1.5 rounded-lg bg-slate-950/80 hover:bg-red-600/90 border border-slate-800 hover:border-red-500 text-slate-400 hover:text-white transition-colors"
                              title="Delete Creation"
                            >
                              <TrashIcon className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Hover Overlay with Quick Actions (Only for Successful Images) */}
                        {isSuccess && (
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-between p-3 z-10">
                            <div className="flex items-center gap-1.5">
                              <a
                                href={cleanImgUrl}
                                download={`qwen-${file.uid || 'image'}.png`}
                                target="_blank"
                                rel="noreferrer"
                                className="p-2 rounded-xl bg-slate-900/90 hover:bg-indigo-600 border border-slate-700/80 text-white transition-colors shadow-lg"
                                title="Download High-Res"
                              >
                                <ArrowDownTrayIcon className="w-4 h-4" />
                              </a>
                              <button
                                type="button"
                                onClick={() => copyPrompt(file.input_text, file.uid)}
                                className="p-2 rounded-xl bg-slate-900/90 hover:bg-purple-600 border border-slate-700/80 text-white transition-colors shadow-lg"
                                title="Copy Prompt"
                              >
                                {isCopied ? (
                                  <CheckIcon className="w-4 h-4 text-emerald-400" />
                                ) : (
                                  <DocumentDuplicateIcon className="w-4 h-4" />
                                )}
                              </button>
                              <Link
                                href={getLinkHref(locale, `?prompt=${encodeURIComponent(file.input_text || '')}`)}
                                className="p-2 rounded-xl bg-slate-900/90 hover:bg-pink-600 border border-slate-700/80 text-white transition-colors shadow-lg"
                                title="Re-mix in Studio"
                              >
                                <SparklesIcon className="w-4 h-4" />
                              </Link>
                            </div>

                            <Link
                              href={getLinkHref(locale, `sticker/${file.uid}`)}
                              className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-[11px] font-semibold text-white transition-colors"
                            >
                              Details →
                            </Link>
                          </div>
                        )}
                      </div>

                      {/* Card Content & Metadata */}
                      <div className="p-3.5 flex-1 flex flex-col justify-between">
                        <p
                          className="text-xs text-slate-300 font-medium line-clamp-2 leading-relaxed"
                          title={file.input_text}
                        >
                          {file.input_text || 'Generated Visual artwork'}
                        </p>
                        <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                          <span>{file.created_at ? new Date(file.created_at).toLocaleDateString() : 'Recent'}</span>
                          {isCopied ? (
                            <span className="text-emerald-400 font-sans font-semibold">Prompt Copied!</span>
                          ) : isSuccess ? (
                            <Link
                              href={getLinkHref(locale, `sticker/${file.uid}`)}
                              className="text-indigo-400 hover:text-indigo-300 font-sans"
                            >
                              View →
                            </Link>
                          ) : isFailed ? (
                            <span className="text-emerald-400/90 font-sans text-[10px]">Points Refunded</span>
                          ) : (
                            <span className="text-indigo-400 font-sans text-[10px]">Processing</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Load More Button */}
              {!alreadyLoadAll && (
                <div className="mt-12 text-center">
                  <button
                    type="button"
                    onClick={() => fetchWorkList(currentPage + 1)}
                    disabled={isLoading}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-800 px-6 py-2.5 text-xs font-semibold text-slate-200 transition-colors disabled:opacity-50"
                  >
                    {isLoading ? (
                      <>
                        <ArrowPathIcon className="w-4 h-4 animate-spin" />
                        <span>Loading more...</span>
                      </>
                    ) : (
                      <span>Load More Creations</span>
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <Footer locale={locale} page={pagePath} />
    </div>
  );
};

export default PageComponent;
