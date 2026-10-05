'use client'
import { useState } from 'react'
import { Dialog, Menu, Transition } from '@headlessui/react'
import { Bars3Icon, XMarkIcon, ChevronDownIcon, SparklesIcon, BoltIcon } from '@heroicons/react/24/outline'
import { Fragment } from 'react'
import Link from "next/link";
import { useCommonContext } from '~/context/common-context'
import LoadingModal from "./LoadingModal";
import GeneratingModal from "~/components/GeneratingModal";
import LoginButton from './LoginButton';
import LoginModal from './LoginModal';
import LogoutModal from "./LogoutModal";
import { getLinkHref } from "~/configs/buildLink";

export default function Header({
  locale = 'en',
  page = ''
}: {
  locale?: string;
  page?: string;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const {
    setShowLoadingModal,
    userData,
    commonText,
    authText,
    menuText
  } = useCommonContext();

  const [pageResult] = useState(getLinkHref(locale, page))

  const checkPageAndLoading = (toPage: string) => {
    setMobileMenuOpen(false);
    if (page !== toPage) {
      setShowLoadingModal(true);
    }
  }

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-slate-950/80 border-b border-slate-800/80">
      <LoadingModal loadingText={commonText?.loadingText || 'Loading...'} />
      <GeneratingModal generatingText={commonText?.generateText || 'Processing...'} />
      <LoginModal
        loadingText={commonText?.loadingText || 'Loading...'}
        redirectPath={pageResult}
        loginModalDesc={authText?.loginModalDesc || 'Please sign in to continue'}
        loginModalButtonText={authText?.loginModalButtonText || 'Sign in with Google'}
      />
      <LogoutModal
        logoutModalDesc={authText?.logoutModalDesc || 'Are you sure you want to sign out?'}
        confirmButtonText={authText?.confirmButtonText || 'Confirm'}
        cancelButtonText={authText?.cancelButtonText || 'Cancel'}
        redirectPath={pageResult}
      />
      
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8" aria-label="Global">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <Link
            href={getLinkHref(locale, '')}
            className="flex items-center gap-2.5 group"
            onClick={() => checkPageAndLoading('')}
          >
            <img
              className="h-9 w-9 rounded-xl shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform"
              src="/appicon.svg"
              width={36}
              height={36}
              alt="Qwen Image Editor Logo"
            />
            <span className="font-extrabold text-xl tracking-tight text-white group-hover:text-indigo-400 transition-colors">
              Qwen Image Editor
            </span>
          </Link>
        </div>

        {/* Mobile menu trigger */}
        <div className="flex lg:hidden">
          <button
            type="button"
            className="-m-2.5 inline-flex items-center justify-center rounded-lg p-2.5 text-slate-300 hover:text-white"
            onClick={() => setMobileMenuOpen(true)}
          >
            <span className="sr-only">Open main menu</span>
            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>

        {/* Desktop Navigation Links */}
        <div className="hidden lg:flex lg:items-center lg:gap-x-7">
          <Link
            href={getLinkHref(locale, '')}
            onClick={() => checkPageAndLoading('')}
            className={`text-sm font-medium transition-colors ${page === '' ? 'text-indigo-400 font-semibold' : 'text-slate-200 hover:text-white'}`}
          >
            Online Editor
          </Link>
          <Link
            href={getLinkHref(locale, 'generator')}
            onClick={() => checkPageAndLoading('generator')}
            className={`text-sm font-medium transition-colors ${page === 'generator' ? 'text-indigo-400 font-semibold' : 'text-slate-200 hover:text-white'}`}
          >
            AI Generator
          </Link>
          <Link
            href={getLinkHref(locale, 'qwen-image-2-1')}
            onClick={() => checkPageAndLoading('qwen-image-2-1')}
            className={`text-sm font-medium transition-colors ${page === 'qwen-image-2-1' ? 'text-indigo-400 font-semibold' : 'text-slate-200 hover:text-white'}`}
          >
            Qwen 2.1
          </Link>

          {/* Comparisons Dropdown */}
          <Menu as="div" className="relative inline-block text-left">
            <Menu.Button className="inline-flex items-center gap-1 text-sm font-medium text-slate-200 hover:text-white transition-colors focus:outline-none">
              <span>Comparisons</span>
              <ChevronDownIcon className="h-4 w-4 text-slate-400" aria-hidden="true" />
            </Menu.Button>
            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute left-0 mt-2 w-56 origin-top-left rounded-xl bg-slate-900 border border-slate-800 p-1.5 shadow-2xl focus:outline-none z-50">
                <Menu.Item>
                  {({ active }) => (
                    <Link
                      href={getLinkHref(locale, 'vs-midjourney')}
                      onClick={() => checkPageAndLoading('vs-midjourney')}
                      className={`block rounded-lg px-3 py-2 text-xs font-medium transition-colors ${active ? 'bg-indigo-600 text-white' : 'text-slate-300'}`}
                    >
                      vs Midjourney
                    </Link>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <Link
                      href={getLinkHref(locale, 'vs-nano-banana')}
                      onClick={() => checkPageAndLoading('vs-nano-banana')}
                      className={`block rounded-lg px-3 py-2 text-xs font-medium transition-colors ${active ? 'bg-indigo-600 text-white' : 'text-slate-300'}`}
                    >
                      vs Nano Banana
                    </Link>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <Link
                      href={getLinkHref(locale, 'vs-flux')}
                      onClick={() => checkPageAndLoading('vs-flux')}
                      className={`block rounded-lg px-3 py-2 text-xs font-medium transition-colors ${active ? 'bg-indigo-600 text-white' : 'text-slate-300'}`}
                    >
                      vs Flux
                    </Link>
                  )}
                </Menu.Item>
              </Menu.Items>
            </Transition>
          </Menu>

          <Link
            href={getLinkHref(locale, 'pricing')}
            onClick={() => checkPageAndLoading('pricing')}
            className={`text-sm font-medium transition-colors ${page === 'pricing' ? 'text-indigo-400 font-semibold' : 'text-slate-200 hover:text-white'}`}
          >
            Pricing
          </Link>

          {userData?.email && (
            <Link
              href={getLinkHref(locale, 'my')}
              onClick={() => checkPageAndLoading('my')}
              className={`text-sm font-medium transition-colors ${page === 'my' ? 'text-indigo-400 font-semibold' : 'text-slate-200 hover:text-white'}`}
            >
              My Gallery
            </Link>
          )}
        </div>

        {/* Right CTA / Auth */}
        <div className="hidden lg:flex lg:items-center lg:gap-3">
          {userData?.email && (
            <Link
              href={getLinkHref(locale, 'pricing')}
              onClick={() => checkPageAndLoading('pricing')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-bold transition-all shadow-sm shadow-amber-500/10 cursor-pointer"
              title="Available Credits — Click to Get More"
            >
              <BoltIcon className="w-3.5 h-3.5 text-amber-400" />
              <span>{userData?.available_times ?? 0} Credits</span>
            </Link>
          )}

          <Link
            href={getLinkHref(locale, '')}
            className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-3.5 py-1.5 text-xs font-semibold text-white shadow-md hover:opacity-95 transition-opacity"
          >
            <SparklesIcon className="w-3.5 h-3.5" />
            Launch Editor
          </Link>
          <LoginButton locale={locale} />
        </div>
      </nav>

      {/* Mobile Dialog */}
      <Dialog as="div" className="lg:hidden" open={mobileMenuOpen} onClose={setMobileMenuOpen}>
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />
        <Dialog.Panel className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-slate-950 px-6 py-6 sm:max-w-sm border-l border-slate-800">
          <div className="flex items-center justify-between">
            <Link href={getLinkHref(locale, '')} className="flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
              <img className="h-8 w-8 rounded-lg" src="/appicon.svg" width={32} height={32} alt="Qwen Image Editor" />
              <span className="font-bold text-lg text-white">Qwen Image Editor</span>
            </Link>
            <button
              type="button"
              className="-m-2.5 rounded-md p-2.5 text-slate-400 hover:text-white"
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="sr-only">Close menu</span>
              <XMarkIcon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
          <div className="mt-8 flow-root">
            <div className="-my-6 divide-y divide-slate-800">
              <div className="space-y-2 py-6">
                <Link
                  href={getLinkHref(locale, '')}
                  onClick={() => checkPageAndLoading('')}
                  className="block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-white hover:bg-slate-900"
                >
                  Online Editor
                </Link>
                <Link
                  href={getLinkHref(locale, 'generator')}
                  onClick={() => checkPageAndLoading('generator')}
                  className="block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-white hover:bg-slate-900"
                >
                  AI Generator
                </Link>
                <div className="pt-2 pb-1 pl-3 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                  Comparisons
                </div>
                <Link
                  href={getLinkHref(locale, 'vs-midjourney')}
                  onClick={() => checkPageAndLoading('vs-midjourney')}
                  className="block rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-slate-900"
                >
                  Qwen Image 2.1 vs Midjourney
                </Link>
                <Link
                  href={getLinkHref(locale, 'vs-nano-banana')}
                  onClick={() => checkPageAndLoading('vs-nano-banana')}
                  className="block rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-slate-900"
                >
                  Qwen Image 2.1 vs Nano Banana
                </Link>
                <Link
                  href={getLinkHref(locale, 'vs-flux')}
                  onClick={() => checkPageAndLoading('vs-flux')}
                  className="block rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-slate-900"
                >
                  Qwen Image 2.1 vs Flux
                </Link>
                <Link
                  href={getLinkHref(locale, 'pricing')}
                  onClick={() => checkPageAndLoading('pricing')}
                  className="block rounded-lg px-3 py-2 text-base font-semibold text-white hover:bg-slate-900"
                >
                  Pricing
                </Link>
                {userData?.email && (
                  <Link
                    href={getLinkHref(locale, 'my')}
                    onClick={() => checkPageAndLoading('my')}
                    className="block rounded-lg px-3 py-2 text-base font-semibold text-white hover:bg-slate-900"
                  >
                    My Gallery
                  </Link>
                )}
              </div>
              <div className="py-6">
                <LoginButton locale={locale} />
              </div>
            </div>
          </div>
        </Dialog.Panel>
      </Dialog>
    </header>
  );
}
