'use client';
import React, { useState, Fragment } from 'react';
import Link from 'next/link';
import { Menu, Transition } from '@headlessui/react';
import {
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  PhotoIcon,
  ChevronDownIcon,
  BoltIcon,
  SparklesIcon,
  CreditCardIcon,
} from '@heroicons/react/24/outline';
import { useCommonContext } from '~/context/common-context';
import { useSession } from 'next-auth/react';
import { getLinkHref } from '~/configs/buildLink';

interface LoginButtonProps {
  buttonType?: number;
  loginText?: string;
  locale?: string;
}

export default function LoginButton({
  buttonType,
  loginText = 'Log in',
  locale = 'en'
}: LoginButtonProps) {
  const { data: session, status } = useSession();
  const {
    userData,
    setShowLoginModal,
    setShowLogoutModal,
    setShowPricingModal,
    authText
  } = useCommonContext();

  const [imgError, setImgError] = useState(false);

  // Active user data prioritizing common-context, falling back to next-auth session
  const activeUser = (userData && userData.email)
    ? userData
    : (session?.user?.email ? session.user : null);

  const isLoggedIn = status === 'authenticated' || (!!activeUser && !!activeUser.email);

  const displayName = activeUser?.name || (activeUser?.email ? activeUser.email.split('@')[0] : 'User');
  const userEmail = activeUser?.email || '';
  const userImage = (!imgError && activeUser?.image) ? activeUser.image : null;
  const initialChar = (displayName || userEmail || 'U')[0].toUpperCase();

  // If user is authenticated, display the user avatar and profile dropdown
  if (isLoggedIn) {
    return (
      <Menu as="div" className="relative inline-block text-left z-20">
        <div>
          <Menu.Button className="group flex items-center gap-2 rounded-full p-0.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 hover:opacity-90 transition-all">
            {userImage ? (
              <img
                className="h-8 w-8 rounded-full border border-indigo-500/40 object-cover ring-2 ring-indigo-500/20 group-hover:ring-indigo-400 transition-all"
                src={userImage}
                alt={displayName}
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 text-xs font-bold text-white shadow-md ring-2 ring-indigo-500/20 group-hover:ring-indigo-400 transition-all">
                {initialChar}
              </div>
            )}
            <ChevronDownIcon className="w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-colors hidden sm:block" />
          </Menu.Button>
        </div>

        <Transition
          as={Fragment}
          enter="transition ease-out duration-150"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-100"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Menu.Items className="absolute right-0 mt-2.5 w-64 origin-top-right divide-y divide-slate-800 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl ring-1 ring-black/60 focus:outline-none z-50">
            {/* User Profile Card */}
            <div className="px-4 py-3 bg-slate-950/60 rounded-t-xl">
              <div className="flex items-center gap-3">
                {userImage ? (
                  <img
                    className="h-9 w-9 rounded-full border border-indigo-500/40 object-cover ring-1 ring-indigo-500/30"
                    src={userImage}
                    alt={displayName}
                  />
                ) : (
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-xs font-bold text-white ring-1 ring-indigo-500/30">
                    {initialChar}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-white">{displayName}</p>
                  <p className="truncate text-xs text-slate-400">{userEmail}</p>
                </div>
              </div>
            </div>

            {/* Credits & Subscription Status Box */}
            <div className="p-3 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/40 border-b border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 block">
                    Available Credits
                  </span>
                  <div className="flex items-center gap-1 mt-0.5">
                    <BoltIcon className="w-4 h-4 text-amber-400 shrink-0" />
                    <span className="text-base font-extrabold text-amber-300">
                      {userData?.available_times ?? 0}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">Credits</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 block">
                    Active Plan
                  </span>
                  <span className={`inline-block mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                    userData?.isPro
                      ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40 shadow-sm shadow-indigo-500/10'
                      : 'bg-slate-800 text-slate-300 border-slate-700'
                  }`}>
                    {userData?.activePlan || 'Free Plan'}
                  </span>
                </div>
              </div>

              {/* Upgrade / Top up Button */}
              <Menu.Item>
                {({ close }) => (
                  <button
                    type="button"
                    onClick={() => {
                      close();
                      if (typeof window !== 'undefined' && window.location.pathname.includes('/pricing')) {
                        const pricingEl = document.getElementById('pricing-plans') || document.querySelector('section');
                        pricingEl?.scrollIntoView({ behavior: 'smooth' });
                      } else {
                        setShowPricingModal(true);
                      }
                    }}
                    className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:opacity-95 text-white text-xs font-bold shadow-md shadow-indigo-500/20 transition-all cursor-pointer"
                  >
                    <SparklesIcon className="w-3.5 h-3.5" />
                    <span>Get Credits / Upgrade Plan</span>
                  </button>
                )}
              </Menu.Item>
            </div>

            {/* Quick Links */}
            <div className="p-1.5 space-y-0.5">
              <Menu.Item>
                {({ active, close }) => (
                  <Link
                    href={getLinkHref(locale, 'my')}
                    onClick={() => close()}
                    className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                      active ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    <PhotoIcon className="w-4 h-4 text-indigo-400" />
                    <span>My Gallery</span>
                  </Link>
                )}
              </Menu.Item>

              <Menu.Item>
                {({ active, close }) => (
                  <Link
                    href={getLinkHref(locale, 'pricing')}
                    onClick={() => close()}
                    className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                      active ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    <CreditCardIcon className="w-4 h-4 text-amber-400" />
                    <span>Pricing &amp; Plans</span>
                  </Link>
                )}
              </Menu.Item>
            </div>

            {/* Sign Out Button */}
            <div className="p-1.5">
              <Menu.Item>
                {({ active }) => (
                  <button
                    type="button"
                    onClick={() => setShowLogoutModal(true)}
                    className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                      active ? 'bg-red-500/15 text-red-300' : 'text-red-400 hover:bg-red-500/10'
                    }`}
                  >
                    <ArrowRightOnRectangleIcon className="w-4 h-4" />
                    <span>Sign out</span>
                  </button>
                )}
              </Menu.Item>
            </div>
          </Menu.Items>
        </Transition>
      </Menu>
    );
  }

  // If user is unauthenticated, render the Log In button
  return (
    <button
      type="button"
      onClick={() => setShowLoginModal(true)}
      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900/90 px-3.5 py-1.5 text-xs font-semibold text-slate-200 shadow-sm hover:border-indigo-500/60 hover:bg-slate-800 hover:text-white transition-all duration-200"
    >
      <UserCircleIcon className="w-4 h-4 text-slate-400" />
      <span>{loginText || authText?.loginText || 'Log in'}</span>
    </button>
  );
}
