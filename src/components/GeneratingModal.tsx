'use client';

import { Fragment, useRef, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { useCommonContext } from "~/context/common-context";
import {
  SparklesIcon,
  CpuChipIcon,
  PhotoIcon,
  CheckIcon,
  XMarkIcon,
} from '@heroicons/react/24/solid';

const TIPS = [
  'Wanx 2.1 executes maskless inpainting with native bilingual typography.',
  'Preserving 68+ facial consistency landmarks during character modifications.',
  'Generated outputs are commercial-use friendly with 2K high-resolution downloads.',
  'Try natural language commands like "Add golden hour sunset" or "Change background to cyberpunk".',
];

export default function GeneratingModal({
  generatingText = 'Processing image...',
}: {
  generatingText?: string;
}) {
  const cancelButtonRef = useRef(null);
  const { showGeneratingModal, setShowGeneratingModal } = useCommonContext();

  const [elapsed, setElapsed] = useState(0);
  const [tipIndex, setTipIndex] = useState(0);

  // Timer & progress calculation while modal is visible
  useEffect(() => {
    if (!showGeneratingModal) {
      setElapsed(0);
      return;
    }

    const startTime = Date.now();
    const interval = setInterval(() => {
      const now = Date.now();
      setElapsed(Number(((now - startTime) / 1000).toFixed(1)));
    }, 100);

    const tipInterval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % TIPS.length);
    }, 3800);

    return () => {
      clearInterval(interval);
      clearInterval(tipInterval);
    };
  }, [showGeneratingModal]);

  // Smooth simulated progress from 0% to 92% over 10 seconds
  const progressPercent = Math.min(
    92,
    Math.round(
      elapsed <= 2
        ? elapsed * 18 // 0-36% in 2s
        : elapsed <= 6
        ? 36 + (elapsed - 2) * 10 // 36-76% in 4s
        : 76 + (elapsed - 6) * 4 // 76-92% up to 10s
    )
  );

  // Current stage determination
  const currentStage = elapsed < 2.5 ? 1 : elapsed < 6.5 ? 2 : 3;

  return (
    <Transition.Root show={showGeneratingModal} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-50"
        initialFocus={cancelButtonRef}
        onClose={() => {}}
      >
        {/* Sleek dark backdrop */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95 translate-y-4"
              enterTo="opacity-100 scale-100 translate-y-0"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100 translate-y-0"
              leaveTo="opacity-0 scale-95 translate-y-4"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-2xl bg-slate-900/95 border border-indigo-500/30 p-6 sm:p-7 text-left shadow-2xl shadow-indigo-950/80 backdrop-blur-2xl max-w-md w-full transition-all">
                {/* Header with Title & Minimize button */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
                  <div className="flex items-center gap-2.5">
                    <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/30">
                      <SparklesIcon className="w-4 h-4 text-indigo-400 animate-pulse" />
                      <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                      </span>
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white tracking-wide">
                        {generatingText}
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        Alibaba Qwen & Wanx 2.1 Cloud Neural Inference
                      </p>
                    </div>
                  </div>

                  {/* Minimize / Background button */}
                  <button
                    type="button"
                    ref={cancelButtonRef}
                    onClick={() => setShowGeneratingModal(false)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                    title="Run in background (Minimize)"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </div>

                {/* Central AI Glowing Orb Animation */}
                <div className="py-6 flex flex-col items-center justify-center relative">
                  <div className="relative flex items-center justify-center w-24 h-24 mb-3">
                    {/* Concentric pulsing rings */}
                    <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-cyan-500/20 via-indigo-500/20 to-purple-500/20 animate-ping opacity-30" />
                    <div className="absolute -inset-1 rounded-full border border-indigo-500/30 animate-spin [animation-duration:6s]" />
                    <div className="absolute -inset-2.5 rounded-full border border-dashed border-cyan-500/20 animate-spin [animation-duration:12s] [animation-direction:reverse]" />
                    
                    {/* Glowing Core */}
                    <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 border border-indigo-400/30">
                      <CpuChipIcon className="w-8 h-8 text-white animate-pulse" />
                    </div>
                  </div>

                  {/* Progress Stats */}
                  <div className="flex items-center gap-3 text-xs font-medium text-slate-300">
                    <span className="flex items-center gap-1.5 text-cyan-400 font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                      Elapsed: {elapsed.toFixed(1)}s
                    </span>
                    <span className="text-slate-600">•</span>
                    <span className="text-slate-400">Est. ~6-10s</span>
                    <span className="text-slate-600">•</span>
                    <span className="text-indigo-300 font-bold">{progressPercent}%</span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-slate-950/80 rounded-full h-2 overflow-hidden border border-slate-800 mb-5 relative">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-indigo-500 to-purple-500 transition-all duration-300 shadow-[0_0_12px_rgba(99,102,241,0.6)]"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>

                {/* Step-by-Step Stage Flow */}
                <div className="space-y-2 mb-5">
                  {/* Step 1 */}
                  <div
                    className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${
                      currentStage === 1
                        ? 'bg-indigo-950/50 border border-indigo-500/30 text-white'
                        : currentStage > 1
                        ? 'bg-slate-950/40 text-slate-400'
                        : 'opacity-40 text-slate-500'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        currentStage > 1
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : currentStage === 1
                          ? 'bg-indigo-500 text-white'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {currentStage > 1 ? <CheckIcon className="w-3.5 h-3.5" /> : '1'}
                    </div>
                    <div className="text-xs font-medium flex-1">
                      Semantic Prompt & Feature Analysis
                    </div>
                    {currentStage === 1 && (
                      <span className="text-[10px] text-cyan-400 font-mono animate-pulse">Running</span>
                    )}
                  </div>

                  {/* Step 2 */}
                  <div
                    className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${
                      currentStage === 2
                        ? 'bg-indigo-950/50 border border-indigo-500/30 text-white'
                        : currentStage > 2
                        ? 'bg-slate-950/40 text-slate-400'
                        : 'opacity-40 text-slate-500'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        currentStage > 2
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : currentStage === 2
                          ? 'bg-indigo-500 text-white'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {currentStage > 2 ? <CheckIcon className="w-3.5 h-3.5" /> : '2'}
                    </div>
                    <div className="text-xs font-medium flex-1">
                      Neural Diffusion Latent Sampling
                    </div>
                    {currentStage === 2 && (
                      <span className="text-[10px] text-cyan-400 font-mono animate-pulse">Running</span>
                    )}
                  </div>

                  {/* Step 3 */}
                  <div
                    className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${
                      currentStage === 3
                        ? 'bg-indigo-950/50 border border-indigo-500/30 text-white'
                        : 'opacity-40 text-slate-500'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        currentStage === 3 ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      3
                    </div>
                    <div className="text-xs font-medium flex-1">
                      Texture Refinement & HD Synthesis
                    </div>
                    {currentStage === 3 && (
                      <span className="text-[10px] text-cyan-400 font-mono animate-pulse">Finalizing</span>
                    )}
                  </div>
                </div>

                {/* Cycling Tips Footer */}
                <div className="rounded-xl bg-slate-950/70 border border-slate-800/80 p-3 flex items-start gap-2.5">
                  <PhotoIcon className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                  <p className="text-[11px] text-slate-300 leading-relaxed min-h-[32px] transition-all">
                    {TIPS[tipIndex]}
                  </p>
                </div>

                {/* Background execution notice */}
                <div className="mt-3 text-center">
                  <button
                    type="button"
                    onClick={() => setShowGeneratingModal(false)}
                    className="text-[11px] text-slate-400 hover:text-slate-200 underline decoration-slate-600 transition-colors"
                  >
                    Hide modal & run in background (Canvas updates automatically)
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
