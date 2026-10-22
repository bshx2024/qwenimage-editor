'use client';

import { Fragment, useRef, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { useCommonContext } from '~/context/common-context';
import { signOut } from 'next-auth/react';
import { ExclamationTriangleIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

interface DeleteAccountModalProps {
  redirectPath?: string;
}

export default function DeleteAccountModal({ redirectPath = '/' }: DeleteAccountModalProps) {
  const cancelButtonRef = useRef<HTMLButtonElement | null>(null);
  const { showDeleteAccountModal, setShowDeleteAccountModal, userData, setUserData } = useCommonContext();
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleDelete = async () => {
    setIsDeleting(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/user/deleteAccount', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userData?.user_id,
          email: userData?.email,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setShowDeleteAccountModal(false);
        setUserData({});
        sessionStorage.removeItem('user_id');
        localStorage.removeItem('user_id');
        // Sign out and redirect to home
        await signOut({ callbackUrl: redirectPath });
      } else {
        setErrorMsg(data.error || 'Failed to delete account. Please try again.');
      }
    } catch (err: any) {
      console.error('Delete account error:', err);
      setErrorMsg(err?.message || 'Network error occurred while deleting account.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Transition.Root show={Boolean(showDeleteAccountModal)} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-50"
        initialFocus={cancelButtonRef}
        onClose={() => {
          if (!isDeleting) setShowDeleteAccountModal(false);
        }}
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
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-2xl bg-slate-900 border border-red-500/30 px-5 pb-6 pt-5 text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-md sm:p-6 text-slate-100">
                {/* Header */}
                <div className="flex items-start gap-4">
                  <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-red-500/10 border border-red-500/30 sm:mx-0">
                    <ExclamationTriangleIcon className="h-6 w-6 text-red-400" aria-hidden="true" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-2">
                      <Dialog.Title as="h3" className="text-base font-bold text-white">
                        Delete Account &amp; Personal Data
                      </Dialog.Title>
                      <span className="inline-flex items-center gap-1 rounded-md bg-cyan-500/10 border border-cyan-500/30 px-1.5 py-0.5 text-[10px] font-semibold text-cyan-300">
                        <ShieldCheckIcon className="w-3 h-3" /> GDPR
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-400">
                      Right to Erasure (Article 17 GDPR)
                    </p>
                  </div>
                </div>

                {/* Account details */}
                <div className="mt-4 rounded-xl bg-slate-950/80 border border-slate-800 p-3 space-y-1 text-xs">
                  <div className="text-slate-400">
                    Account: <strong className="text-white">{userData?.name || 'User'}</strong>
                  </div>
                  {userData?.email && (
                    <div className="text-slate-400">
                      Email: <strong className="text-cyan-300 font-mono">{userData.email}</strong>
                    </div>
                  )}
                  {userData?.available_times !== undefined && (
                    <div className="text-slate-400">
                      Remaining Credits: <span className="text-amber-400 font-semibold">{userData.available_times}</span>
                    </div>
                  )}
                </div>

                {/* Warning message */}
                <div className="mt-3.5 space-y-2 text-xs text-slate-300">
                  <p className="leading-relaxed">
                    Are you sure you want to delete your profile? This action will <strong>permanently and irreversibly</strong> erase:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-slate-400 text-[11px] bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/60">
                    <li>Your profile credentials, email, and Google login link</li>
                    <li>All generated artworks and creation history from your gallery</li>
                    <li>Any remaining credits and active subscription plans</li>
                    <li>Onboarding preferences and survey feedback</li>
                  </ul>
                  <p className="text-[11px] text-red-400 font-medium">
                    ⚠️ This process cannot be undone. Once deleted, your account and creations cannot be recovered.
                  </p>
                </div>

                {errorMsg && (
                  <div className="mt-3 rounded-lg bg-red-500/10 border border-red-500/30 p-2.5 text-xs text-red-300">
                    {errorMsg}
                  </div>
                )}

                {/* Buttons */}
                <div className="mt-5 flex gap-2.5">
                  <button
                    type="button"
                    disabled={isDeleting}
                    className="flex-1 rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                    onClick={() => setShowDeleteAccountModal(false)}
                    ref={cancelButtonRef}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={isDeleting}
                    className="flex-1 rounded-xl bg-red-600 px-3 py-2 text-xs font-bold text-white shadow-sm hover:bg-red-500 transition-colors disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5"
                    onClick={handleDelete}
                  >
                    {isDeleting ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Deleting...</span>
                      </>
                    ) : (
                      'Permanently Delete'
                    )}
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
