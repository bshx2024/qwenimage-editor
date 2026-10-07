'use client';

import { Fragment, useRef, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { useCommonContext } from "~/context/common-context";

export default function LoadingModal({
  loadingText = 'Loading...',
}: {
  loadingText?: string;
}) {
  const cancelButtonRef = useRef(null);
  const { showLoadingModal, setShowLoadingModal } = useCommonContext();

  // Safety auto-dismiss: ensure modal never traps the user indefinitely
  useEffect(() => {
    if (!showLoadingModal) return;
    const timer = setTimeout(() => {
      setShowLoadingModal(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, [showLoadingModal, setShowLoadingModal]);

  return (
    <Transition.Root show={showLoadingModal} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-50"
        initialFocus={cancelButtonRef}
        onClose={() => setShowLoadingModal(false)}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4"
              enterTo="opacity-100 translate-y-0"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0"
              leaveTo="opacity-0 translate-y-4"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl text-slate-100">
                <div className="flex items-center justify-center gap-3">
                  <svg
                    className="animate-spin h-7 w-7 text-indigo-400"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span className="text-sm font-semibold tracking-wide text-slate-200">
                    {loadingText}
                  </span>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
