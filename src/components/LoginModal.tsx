'use client'
import React, { Fragment, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { FcGoogle } from 'react-icons/fc'
import { blackLoadingSvg } from './svg'
import { useCommonContext } from "~/context/common-context";
import { signInUseAuth } from "~/libs/nextAuthClient";
import { SparklesIcon, CheckCircleIcon, ArrowDownTrayIcon, CloudArrowUpIcon, XMarkIcon } from '@heroicons/react/24/outline';

const LoginModal = ({
  loadingText = "Signing in...",
  redirectPath,
  loginModalDesc,
  loginModalButtonText = "Continue with Google",
}: {
  loadingText?: string;
  redirectPath?: string;
  loginModalDesc?: string;
  loginModalButtonText?: string;
}) => {
  const [loadGoogle, setLoadGoogle] = useState(false)
  const { showLoginModal, setShowLoginModal } = useCommonContext();

  return (
    <Transition.Root show={showLoginModal} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={() => setShowLoginModal(false)}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-2xl bg-slate-900 border border-slate-800 px-6 pb-6 pt-6 text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-md">
                {/* Close Button */}
                <button
                  type="button"
                  onClick={() => setShowLoginModal(false)}
                  className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>

                <div className="text-center">
                  <div className="inline-flex p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mb-3 shadow-inner">
                    <SparklesIcon className="w-8 h-8" />
                  </div>
                  
                  <Dialog.Title as="h3" className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                    Unlock Creator Access
                  </Dialog.Title>

                  <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {loginModalDesc || "Sign in with Google to claim your free welcome credits, save your generated artwork, and unlock full HD downloads."}
                  </p>
                </div>

                {/* Creator Benefits Checklist */}
                <div className="my-5 rounded-xl bg-slate-950/60 border border-slate-800/80 p-3.5 space-y-2.5">
                  <div className="flex items-center gap-2.5 text-xs text-slate-200 font-medium">
                    <CheckCircleIcon className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span><strong>Free Welcome Credits:</strong> Instant bonus to create more</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs text-slate-200 font-medium">
                    <CloudArrowUpIcon className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                    <span><strong>Permanent Cloud Vault:</strong> Never lose your creative history</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs text-slate-200 font-medium">
                    <ArrowDownTrayIcon className="w-4 h-4 text-amber-400 flex-shrink-0" />
                    <span><strong>Lossless HD Downloads:</strong> Export crisp 2K/4K PNG assets</span>
                  </div>
                </div>

                {/* Action Button */}
                <div className="space-y-3">
                  {loadGoogle ? (
                    <button
                      type="button"
                      className="w-full flex justify-center items-center gap-2.5 rounded-xl bg-slate-800 py-3 text-sm font-semibold text-slate-400 cursor-not-allowed border border-slate-700"
                      disabled
                    >
                      {blackLoadingSvg}
                      <span>{loadingText}</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="w-full flex justify-center items-center gap-3 rounded-xl bg-white hover:bg-slate-100 py-3 px-4 text-sm font-bold text-slate-900 shadow-lg hover:shadow-indigo-500/10 transition-all active:scale-[0.98]"
                      onClick={async () => {
                        setLoadGoogle(true);
                        await signInUseAuth({
                          redirectPath: redirectPath
                        });
                      }}
                    >
                      <FcGoogle className="text-xl flex-shrink-0" />
                      <span>{loginModalButtonText}</span>
                    </button>
                  )}
                  <p className="text-[11px] text-center text-slate-500">
                    🔒 One-click sign in. No password required. Cancel anytime.
                  </p>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}

export default LoginModal
