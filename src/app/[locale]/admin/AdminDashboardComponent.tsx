'use client'
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { signIn, useSession } from 'next-auth/react';
import {
  ChartBarIcon,
  UsersIcon,
  PhotoIcon,
  CreditCardIcon,
  ShieldCheckIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  ArrowTopRightOnSquareIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  TrashIcon,
  EyeIcon,
  EyeSlashIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  CpuChipIcon,
  SparklesIcon,
  ArrowPathIcon,
  KeyIcon,
} from '@heroicons/react/24/outline';

interface AdminDashboardProps {
  locale?: string;
}

export default function AdminDashboardComponent({ locale = 'en' }: AdminDashboardProps) {
  const { data: session } = useSession();

  // Authentication State
  const [authChecking, setAuthChecking] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [adminType, setAdminType] = useState<string | null>(null);
  const [adminIdentifier, setAdminIdentifier] = useState<string | null>(null);

  // Login Form State
  const [loginMode, setLoginMode] = useState<'password' | 'google'>('password');
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
  const [loginError, setLoginError] = useState<string>('');

  // Dashboard Tabs
  const [activeTab, setActiveTab] = useState<
    'overview' | 'users' | 'works' | 'subscriptions' | 'sensitive' | 'config'
  >('overview');

  // Overview Data
  const [stats, setStats] = useState<any>(null);
  const [statsLoading, setStatsLoading] = useState<boolean>(false);

  // Users Data
  const [users, setUsers] = useState<any[]>([]);
  const [userPage, setUserPage] = useState<number>(1);
  const [userTotalPages, setUserTotalPages] = useState<number>(1);
  const [userSearch, setUserSearch] = useState<string>('');
  const [usersLoading, setUsersLoading] = useState<boolean>(false);
  const [creditModalUser, setCreditModalUser] = useState<any>(null);
  const [creditAmount, setCreditAmount] = useState<number>(10);
  const [creditMode, setCreditMode] = useState<'add' | 'set'>('add');
  const [isUpdatingCredit, setIsUpdatingCredit] = useState<boolean>(false);

  // Works Data
  const [works, setWorks] = useState<any[]>([]);
  const [workPage, setWorkPage] = useState<number>(1);
  const [workTotalPages, setWorkTotalPages] = useState<number>(1);
  const [workSearch, setWorkSearch] = useState<string>('');
  const [workTaskType, setWorkTaskType] = useState<string>('all');
  const [workPublicFilter, setWorkPublicFilter] = useState<string>('all');
  const [worksLoading, setWorksLoading] = useState<boolean>(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Subscriptions Data
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [subsLoading, setSubsLoading] = useState<boolean>(false);

  // Sensitive Words Data
  const [sensitiveWords, setSensitiveWords] = useState<any[]>([]);
  const [newWord, setNewWord] = useState<string>('');
  const [newWordLevel, setNewWordLevel] = useState<string>('1');
  const [sensitiveLoading, setSensitiveLoading] = useState<boolean>(false);

  // Global Notification Toast
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(
    null
  );

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Check auth on load
  const checkAuth = async () => {
    setAuthChecking(true);
    try {
      const res = await fetch(`/api/admin/auth`);
      const data = await res.json();
      if (data.authenticated) {
        setIsAuthenticated(true);
        setAdminType(data.adminType);
        setAdminIdentifier(data.identifier);
      } else {
        setIsAuthenticated(false);
      }
    } catch (e) {
      setIsAuthenticated(false);
    } finally {
      setAuthChecking(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  // Fetch data when activeTab changes
  useEffect(() => {
    if (!isAuthenticated) return;
    if (activeTab === 'overview') fetchStats();
    if (activeTab === 'users') fetchUsers();
    if (activeTab === 'works') fetchWorks();
    if (activeTab === 'subscriptions') fetchSubscriptions();
    if (activeTab === 'sensitive') fetchSensitiveWords();
  }, [activeTab, isAuthenticated]);

  // Login handler
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordInput.trim()) return;
    setIsLoggingIn(true);
    setLoginError('');

    try {
      const res = await fetch(`/api/admin/auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'login', password: passwordInput }),
      });
      const data = await res.json();
      if (data.success) {
        setIsAuthenticated(true);
        setAdminType(data.adminType);
        setAdminIdentifier(data.identifier);
        showToast('Successfully logged in as Master Admin.');
      } else {
        setLoginError(data.message || 'Login failed. Please check password.');
      }
    } catch (err: any) {
      setLoginError(err?.message || 'Network error.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleGoogleVerify = async () => {
    setIsLoggingIn(true);
    setLoginError('');
    try {
      const res = await fetch(`/api/admin/auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'google_verify' }),
      });
      const data = await res.json();
      if (data.success) {
        setIsAuthenticated(true);
        setAdminType(data.adminType);
        setAdminIdentifier(data.identifier);
        showToast(`Welcome back, ${data.identifier}!`);
      } else {
        setLoginError(data.message || 'Google account not authorized.');
      }
    } catch (err: any) {
      setLoginError(err?.message || 'Google verification failed.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch(`/api/admin/auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'logout' }),
      });
      setIsAuthenticated(false);
      setAdminType(null);
      setAdminIdentifier(null);
      showToast('Logged out of Admin Console.');
    } catch (e) {
      console.error(e);
    }
  };

  // Stats Fetcher
  const fetchStats = async () => {
    setStatsLoading(true);
    try {
      const res = await fetch(`/api/admin/stats`);
      const data = await res.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setStatsLoading(false);
    }
  };

  // Users Fetcher
  const fetchUsers = async (page = userPage, query = userSearch) => {
    setUsersLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: '15',
        search: query,
      });
      const res = await fetch(`/api/admin/users?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setUsers(data.users);
        setUserPage(data.pagination.page);
        setUserTotalPages(data.pagination.totalPages);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setUsersLoading(false);
    }
  };

  const handleSaveCredits = async () => {
    if (!creditModalUser) return;
    setIsUpdatingCredit(true);
    try {
      const res = await fetch(`/api/admin/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'adjust_credits',
          userId: creditModalUser.user_id,
          amount: creditAmount,
          mode: creditMode,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Credits updated for ${creditModalUser.email || creditModalUser.name}`);
        setCreditModalUser(null);
        fetchUsers();
      } else {
        showToast(data.error || 'Failed to update credits', 'error');
      }
    } catch (err: any) {
      showToast(err?.message || 'Error updating credits', 'error');
    } finally {
      setIsUpdatingCredit(false);
    }
  };

  // Works Fetcher
  const fetchWorks = async (
    page = workPage,
    query = workSearch,
    task = workTaskType,
    pub = workPublicFilter
  ) => {
    setWorksLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: '18',
        search: query,
        task_type: task,
        is_public: pub,
      });
      const res = await fetch(`/api/admin/works?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setWorks(data.works);
        setWorkPage(data.pagination.page);
        setWorkTotalPages(data.pagination.totalPages);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setWorksLoading(false);
    }
  };

  const handleTogglePublicWork = async (uid: string, currentPublic: boolean) => {
    try {
      const res = await fetch(`/api/admin/works`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'toggle_public',
          uid,
          isPublic: !currentPublic,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message);
        setWorks((prev) =>
          prev.map((w) => (w.uid === uid ? { ...w, is_public: !currentPublic } : w))
        );
      }
    } catch (e) {
      showToast('Failed to toggle public state', 'error');
    }
  };

  const handleDeleteWork = async (uid: string) => {
    if (!confirm('Are you sure you want to delete/hide this work?')) return;
    try {
      const res = await fetch(`/api/admin/works`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', uid }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message);
        setWorks((prev) => prev.filter((w) => w.uid !== uid));
      }
    } catch (e) {
      showToast('Failed to delete work', 'error');
    }
  };

  // Subscriptions Fetcher
  const fetchSubscriptions = async () => {
    setSubsLoading(true);
    try {
      const res = await fetch(`/api/admin/subscriptions`);
      const data = await res.json();
      if (data.success) {
        setSubscriptions(data.subscriptions);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubsLoading(false);
    }
  };

  // Sensitive Words Fetcher
  const fetchSensitiveWords = async () => {
    setSensitiveLoading(true);
    try {
      const res = await fetch(`/api/admin/sensitive`);
      const data = await res.json();
      if (data.success) {
        setSensitiveWords(data.words);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSensitiveLoading(false);
    }
  };

  const handleAddSensitiveWord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWord.trim()) return;
    try {
      const res = await fetch(`/api/admin/sensitive`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'add', word: newWord.trim(), level: newWordLevel }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Added word: "${newWord}"`);
        setNewWord('');
        fetchSensitiveWords();
      }
    } catch (e) {
      showToast('Failed to add word', 'error');
    }
  };

  const handleDeleteSensitiveWord = async (id: number) => {
    try {
      const res = await fetch(`/api/admin/sensitive`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', id }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('Sensitive word removed');
        setSensitiveWords((prev) => prev.filter((w) => w.id !== id));
      }
    } catch (e) {
      showToast('Failed to remove word', 'error');
    }
  };

  // ----------------------------------------------------
  // Render: Loading Screen
  // ----------------------------------------------------
  if (authChecking) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-300">
        <div className="flex flex-col items-center gap-3">
          <ArrowPathIcon className="w-8 h-8 text-cyan-400 animate-spin" />
          <span className="text-sm font-medium tracking-wide">Checking Webmaster Authorization...</span>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // Render: Login Screen (Dual Authentication)
  // ----------------------------------------------------
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center px-4 relative overflow-hidden">
        {/* Glow Background */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-r from-cyan-600/20 via-indigo-600/20 to-purple-600/20 blur-[130px] rounded-full pointer-events-none" />

        <div className="w-full max-w-md relative z-10">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 backdrop-blur-2xl p-7 sm:p-8 shadow-2xl">
            {/* Header */}
            <div className="text-center space-y-2 mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 mb-1">
                <ShieldCheckIcon className="w-6 h-6" />
              </div>
              <h1 className="text-2xl font-extrabold text-white tracking-tight">
                Master Admin Console
              </h1>
              <p className="text-xs text-slate-400">
                Qwen Image Editor Webmaster Studio
              </p>
            </div>

            {/* Auth Method Selector Tabs */}
            <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-slate-950/80 border border-slate-800/80 mb-6">
              <button
                type="button"
                onClick={() => {
                  setLoginMode('password');
                  setLoginError('');
                }}
                className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                  loginMode === 'password'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Master Password
              </button>
              <button
                type="button"
                onClick={() => {
                  setLoginMode('google');
                  setLoginError('');
                }}
                className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                  loginMode === 'google'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Google Whitelist
              </button>
            </div>

            {/* Error Message */}
            {loginError && (
              <div className="mb-4 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300 flex items-start gap-2">
                <ExclamationTriangleIcon className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{loginError}</span>
              </div>
            )}

            {/* Mode 1: Master Password Login */}
            {loginMode === 'password' && (
              <form onSubmit={handlePasswordLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Administrator Master Password
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      placeholder="Enter ADMIN_PASSWORD..."
                      className="w-full rounded-xl border border-slate-800 bg-slate-950/90 px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all"
                    />
                    <KeyIcon className="w-5 h-5 text-slate-500 absolute right-3.5 top-3.5 pointer-events-none" />
                  </div>
                  <p className="mt-2 text-[11px] text-slate-500 text-right">
                    Authorized webmasters only
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-lg hover:opacity-95 disabled:opacity-50 transition-all cursor-pointer"
                >
                  {isLoggingIn ? (
                    <>
                      <ArrowPathIcon className="w-4 h-4 animate-spin" />
                      <span>Authenticating...</span>
                    </>
                  ) : (
                    <span>Access Admin Console</span>
                  )}
                </button>
              </form>
            )}

            {/* Mode 2: Google Whitelist Login */}
            {loginMode === 'google' && (
              <div className="space-y-4 text-center">
                <p className="text-xs text-slate-400 leading-relaxed">
                  Log in with your Google account. Access will be granted if your email is present in the <code className="text-cyan-300">ADMIN_EMAILS</code> configuration.
                </p>

                {session?.user ? (
                  <div className="p-3 rounded-xl border border-slate-800 bg-slate-950 text-xs text-slate-300">
                    Currently signed in as:{' '}
                    <strong className="text-white">{session.user.email}</strong>
                  </div>
                ) : null}

                <div className="space-y-2">
                  {session?.user ? (
                    <button
                      type="button"
                      onClick={handleGoogleVerify}
                      disabled={isLoggingIn}
                      className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-lg hover:opacity-95 disabled:opacity-50 transition-all cursor-pointer"
                    >
                      {isLoggingIn ? (
                        <>
                          <ArrowPathIcon className="w-4 h-4 animate-spin" />
                          <span>Verifying Whitelist...</span>
                        </>
                      ) : (
                        <span>Verify & Enter Console</span>
                      )}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => signIn('google')}
                      className="w-full inline-flex items-center justify-center gap-2.5 rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800 transition-all cursor-pointer"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                        />
                      </svg>
                      <span>Sign in with Google</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Back to Homepage */}
            <div className="mt-6 pt-4 border-t border-slate-800/80 text-center">
              <Link
                href={`/${locale}`}
                className="text-xs text-slate-400 hover:text-cyan-400 transition-colors inline-flex items-center gap-1.5"
              >
                <span>← Return to Public Website</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // Render: Authenticated Admin Dashboard
  // ----------------------------------------------------
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-white">
      {/* Toast Alert */}
      {toastMessage && (
        <div
          className={`fixed bottom-5 right-5 z-50 rounded-xl px-4 py-3 text-xs sm:text-sm font-semibold shadow-2xl backdrop-blur-md border animate-fade-in ${
            toastMessage.type === 'success'
              ? 'bg-emerald-950/90 border-emerald-500/40 text-emerald-200'
              : 'bg-rose-950/90 border-rose-500/40 text-rose-200'
          }`}
        >
          {toastMessage.text}
        </div>
      )}

      {/* Top Navbar */}
      <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 text-white font-black text-base shadow-md shadow-cyan-500/20">
              Q
            </div>
            <div>
              <div className="text-sm font-extrabold text-white tracking-tight flex items-center gap-2">
                <span>Qwen Master Console</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Logged in as:{' '}
                <strong className="text-cyan-300 font-semibold">{adminIdentifier}</strong>{' '}
                <span className="text-slate-500">({adminType})</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href={`/${locale}`}
              target="_blank"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-1.5 text-xs text-slate-300 hover:text-white hover:border-slate-700 transition-colors"
            >
              <span>View Site</span>
              <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5 text-slate-400" />
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-1.5 text-xs text-rose-300 hover:bg-rose-500/10 hover:border-rose-500/40 transition-colors cursor-pointer"
            >
              <ArrowRightOnRectangleIcon className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Layout (Sidebar + Content) */}
      <div className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar Tabs */}
          <aside className="w-full md:w-60 shrink-0">
            <nav className="space-y-1.5 rounded-2xl border border-slate-800 bg-slate-900/50 p-2 backdrop-blur-md sticky top-22">
              {[
                { id: 'overview', name: 'Overview', icon: ChartBarIcon },
                { id: 'users', name: 'Users & Credits', icon: UsersIcon },
                { id: 'works', name: 'Works & Gallery', icon: PhotoIcon },
                { id: 'subscriptions', name: 'Subscriptions', icon: CreditCardIcon },
                { id: 'sensitive', name: 'Sensitive Words', icon: ShieldCheckIcon },
                { id: 'config', name: 'Environment', icon: Cog6ToothIcon },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 border border-cyan-500/30 text-cyan-300 shadow-md shadow-cyan-500/5'
                        : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                    <span>{tab.name}</span>
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 min-w-0">
            {/* ---------------------------------------------------- */}
            {/* TAB 1: OVERVIEW */}
            {/* ---------------------------------------------------- */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white tracking-tight">System Overview</h2>
                  <button
                    onClick={fetchStats}
                    disabled={statsLoading}
                    className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-cyan-400 transition-colors"
                  >
                    <ArrowPathIcon className={`w-3.5 h-3.5 ${statsLoading ? 'animate-spin' : ''}`} />
                    <span>Refresh Metrics</span>
                  </button>
                </div>

                {/* 4 Metric Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-md">
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                      <span>Total Users</span>
                      <UsersIcon className="w-4 h-4 text-cyan-400" />
                    </div>
                    <div className="text-2xl sm:text-3xl font-extrabold text-white">
                      {stats ? stats.metrics.totalUsers : '--'}
                    </div>
                    <div className="text-[11px] text-emerald-400 mt-1">
                      +{stats ? stats.metrics.todayUsers : 0} registered today
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-md">
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                      <span>Generated Works</span>
                      <PhotoIcon className="w-4 h-4 text-indigo-400" />
                    </div>
                    <div className="text-2xl sm:text-3xl font-extrabold text-white">
                      {stats ? stats.metrics.totalWorks : '--'}
                    </div>
                    <div className="text-[11px] text-cyan-400 mt-1">
                      +{stats ? stats.metrics.todayWorks : 0} created today
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-md">
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                      <span>Active Subscriptions</span>
                      <CreditCardIcon className="w-4 h-4 text-purple-400" />
                    </div>
                    <div className="text-2xl sm:text-3xl font-extrabold text-white">
                      {stats ? stats.metrics.activeSubscriptions : '--'}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">Stripe paying subscribers</div>
                  </div>

                  <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-md">
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                      <span>Credits Pool</span>
                      <SparklesIcon className="w-4 h-4 text-amber-400" />
                    </div>
                    <div className="text-2xl sm:text-3xl font-extrabold text-white">
                      {stats ? stats.metrics.totalCreditsPool : '--'}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">Total points in user balances</div>
                  </div>
                </div>

                {/* System Services Health Matrix */}
                <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-md">
                  <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                    <CpuChipIcon className="w-4 h-4 text-cyan-400" />
                    <span>Cloud Services & Gateway Health</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {stats?.systemHealth &&
                      Object.entries(stats.systemHealth).map(([service, info]: [string, any]) => (
                        <div
                          key={service}
                          className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-3.5 flex items-start justify-between"
                        >
                          <div>
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-1">
                              {service}
                            </span>
                            <span className="text-[11px] text-slate-400">{info.message}</span>
                          </div>
                          <span
                            className={`w-2.5 h-2.5 rounded-full shrink-0 mt-1 ${
                              info.status === 'healthy'
                                ? 'bg-emerald-400 shadow-sm shadow-emerald-400'
                                : info.status === 'warning'
                                ? 'bg-amber-400 shadow-sm shadow-amber-400'
                                : 'bg-slate-600'
                            }`}
                          />
                        </div>
                      ))}
                  </div>
                </div>

                {/* Recent Works Grid */}
                <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-md">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-white">Latest Generated Creations</h3>
                    <button
                      onClick={() => setActiveTab('works')}
                      className="text-xs text-cyan-400 hover:underline"
                    >
                      View All Works →
                    </button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    {stats?.recentWorks?.map((w: any) => (
                      <div
                        key={w.uid}
                        className="group relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950 aspect-square"
                      >
                        {w.output_url ? (
                          <img
                            src={Array.isArray(w.output_url) ? w.output_url[0] : w.output_url}
                            alt={w.input_text || 'Work'}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs text-slate-600">
                            No Preview
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-2 flex flex-col justify-end">
                          <p className="text-[10px] text-slate-200 line-clamp-2">{w.input_text}</p>
                          <span className="text-[9px] text-cyan-400 font-medium mt-1">
                            {w.task_type || 'image'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ---------------------------------------------------- */}
            {/* TAB 2: USERS & CREDITS */}
            {/* ---------------------------------------------------- */}
            {activeTab === 'users' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <h2 className="text-xl font-bold text-white tracking-tight">User Accounts & Credits</h2>
                  <div className="relative w-full sm:w-64">
                    <input
                      type="text"
                      placeholder="Search email, name or UID..."
                      value={userSearch}
                      onChange={(e) => {
                        setUserSearch(e.target.value);
                        fetchUsers(1, e.target.value);
                      }}
                      className="w-full rounded-xl border border-slate-800 bg-slate-900/80 px-3.5 py-2 pl-9 text-xs text-slate-200 placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                    />
                    <MagnifyingGlassIcon className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  </div>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur-md shadow-xl">
                  <table className="min-w-full divide-y divide-slate-800 text-left text-xs">
                    <thead className="bg-slate-900 text-slate-300 font-semibold">
                      <tr>
                        <th className="px-5 py-3.5">User</th>
                        <th className="px-5 py-3.5">Email</th>
                        <th className="px-5 py-3.5">Credits Available</th>
                        <th className="px-5 py-3.5">Registered</th>
                        <th className="px-5 py-3.5">Last Login IP</th>
                        <th className="px-5 py-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-slate-300">
                      {users.length > 0 ? (
                        users.map((u) => (
                          <tr key={u.id} className="hover:bg-slate-900/60 transition-colors">
                            <td className="px-5 py-3 flex items-center gap-2.5">
                              {u.image ? (
                                <img
                                  src={u.image}
                                  alt={u.name || 'User'}
                                  className="w-7 h-7 rounded-full object-cover border border-slate-700"
                                />
                              ) : (
                                <div className="w-7 h-7 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center font-bold">
                                  {(u.name || u.email || 'U')[0].toUpperCase()}
                                </div>
                              )}
                              <span className="font-semibold text-white">{u.name || 'Anonymous'}</span>
                            </td>
                            <td className="px-5 py-3 font-mono text-[11px] text-slate-300">{u.email || '--'}</td>
                            <td className="px-5 py-3">
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 font-bold">
                                <SparklesIcon className="w-3 h-3 text-amber-400" />
                                {u.available_times}
                              </span>
                            </td>
                            <td className="px-5 py-3 text-slate-400 text-[11px]">
                              {u.created_at ? new Date(u.created_at).toLocaleDateString() : '--'}
                            </td>
                            <td className="px-5 py-3 text-slate-500 text-[11px]">{u.last_login_ip || '--'}</td>
                            <td className="px-5 py-3 text-right">
                              <button
                                onClick={() => {
                                  setCreditModalUser(u);
                                  setCreditAmount(10);
                                  setCreditMode('add');
                                }}
                                className="rounded-lg bg-cyan-500/10 border border-cyan-500/30 px-2.5 py-1 text-[11px] font-semibold text-cyan-300 hover:bg-cyan-500/20 transition-colors cursor-pointer"
                              >
                                Adjust Points
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="px-5 py-8 text-center text-slate-500">
                            {usersLoading ? 'Loading users...' : 'No users found.'}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {userTotalPages > 1 && (
                  <div className="flex items-center justify-between text-xs text-slate-400 pt-2">
                    <span>Page {userPage} of {userTotalPages}</span>
                    <div className="flex gap-2">
                      <button
                        disabled={userPage <= 1}
                        onClick={() => fetchUsers(userPage - 1)}
                        className="px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900 disabled:opacity-40"
                      >
                        Previous
                      </button>
                      <button
                        disabled={userPage >= userTotalPages}
                        onClick={() => fetchUsers(userPage + 1)}
                        className="px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900 disabled:opacity-40"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ---------------------------------------------------- */}
            {/* TAB 3: WORKS MODERATION */}
            {/* ---------------------------------------------------- */}
            {activeTab === 'works' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <h2 className="text-xl font-bold text-white tracking-tight">Works Gallery Moderation</h2>
                  <div className="flex flex-wrap items-center gap-2">
                    <select
                      value={workTaskType}
                      onChange={(e) => {
                        setWorkTaskType(e.target.value);
                        fetchWorks(1, workSearch, e.target.value, workPublicFilter);
                      }}
                      className="rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-slate-300 focus:outline-none"
                    >
                      <option value="all">All Models</option>
                      <option value="text2img">Text-to-Image</option>
                      <option value="image2img">Image-to-Image / Inpaint</option>
                    </select>

                    <select
                      value={workPublicFilter}
                      onChange={(e) => {
                        setWorkPublicFilter(e.target.value);
                        fetchWorks(1, workSearch, workTaskType, e.target.value);
                      }}
                      className="rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-slate-300 focus:outline-none"
                    >
                      <option value="all">Public Status: All</option>
                      <option value="true">Public Only</option>
                      <option value="false">Private Only</option>
                    </select>

                    <input
                      type="text"
                      placeholder="Search prompt..."
                      value={workSearch}
                      onChange={(e) => {
                        setWorkSearch(e.target.value);
                        fetchWorks(1, e.target.value, workTaskType, workPublicFilter);
                      }}
                      className="rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-slate-200 placeholder-slate-500 w-44 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Works Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {works.map((w) => {
                    const imgUrl = Array.isArray(w.output_url) ? w.output_url[0] : w.output_url;
                    return (
                      <div
                        key={w.uid}
                        className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden flex flex-col backdrop-blur-md"
                      >
                        <div
                          className="relative aspect-video bg-slate-950 cursor-pointer overflow-hidden group"
                          onClick={() => imgUrl && setPreviewImage(imgUrl)}
                        >
                          {imgUrl ? (
                            <img
                              src={imgUrl}
                              alt={w.input_text || 'Work'}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs text-slate-600">
                              No Image Available
                            </div>
                          )}
                          <div className="absolute top-2 left-2 flex gap-1.5">
                            <span className="rounded-md bg-slate-950/80 px-2 py-0.5 text-[10px] font-semibold text-cyan-300 border border-slate-800">
                              {w.task_type || 'image'}
                            </span>
                            {w.is_public && (
                              <span className="rounded-md bg-emerald-950/80 px-2 py-0.5 text-[10px] font-semibold text-emerald-300 border border-emerald-800">
                                Public
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                          <div>
                            <p className="text-xs text-slate-200 line-clamp-3 leading-relaxed">
                              {w.input_text || 'No prompt specified'}
                            </p>
                            <div className="text-[11px] text-slate-400 mt-2 flex items-center justify-between">
                              <span>By: {w.user_email || 'Guest User'}</span>
                              <span>{w.created_at ? new Date(w.created_at).toLocaleDateString() : ''}</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                            <button
                              type="button"
                              onClick={() => handleTogglePublicWork(w.uid, w.is_public)}
                              className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-300 hover:text-cyan-400 transition-colors"
                            >
                              {w.is_public ? (
                                <>
                                  <EyeSlashIcon className="w-3.5 h-3.5 text-slate-400" />
                                  <span>Make Private</span>
                                </>
                              ) : (
                                <>
                                  <EyeIcon className="w-3.5 h-3.5 text-cyan-400" />
                                  <span>Set Public</span>
                                </>
                              )}
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteWork(w.uid)}
                              className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-400 hover:text-rose-300 transition-colors"
                            >
                              <TrashIcon className="w-3.5 h-3.5" />
                              <span>Delete</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {works.length === 0 && (
                  <div className="text-center py-12 text-slate-500 text-xs">
                    {worksLoading ? 'Loading creations...' : 'No works match the criteria.'}
                  </div>
                )}

                {/* Pagination */}
                {workTotalPages > 1 && (
                  <div className="flex items-center justify-between text-xs text-slate-400 pt-2">
                    <span>Page {workPage} of {workTotalPages}</span>
                    <div className="flex gap-2">
                      <button
                        disabled={workPage <= 1}
                        onClick={() => fetchWorks(workPage - 1)}
                        className="px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900 disabled:opacity-40"
                      >
                        Previous
                      </button>
                      <button
                        disabled={workPage >= workTotalPages}
                        onClick={() => fetchWorks(workPage + 1)}
                        className="px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900 disabled:opacity-40"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ---------------------------------------------------- */}
            {/* TAB 4: SUBSCRIPTIONS */}
            {/* ---------------------------------------------------- */}
            {activeTab === 'subscriptions' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white tracking-tight">Stripe Subscriptions</h2>
                  <button
                    onClick={fetchSubscriptions}
                    className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-cyan-400"
                  >
                    <ArrowPathIcon className="w-3.5 h-3.5" />
                    <span>Refresh</span>
                  </button>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur-md shadow-xl">
                  <table className="min-w-full divide-y divide-slate-800 text-left text-xs">
                    <thead className="bg-slate-900 text-slate-300 font-semibold">
                      <tr>
                        <th className="px-5 py-3.5">Customer Email</th>
                        <th className="px-5 py-3.5">Subscription ID</th>
                        <th className="px-5 py-3.5">Status</th>
                        <th className="px-5 py-3.5">Created Date</th>
                        <th className="px-5 py-3.5">Current Period Ends</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-slate-300">
                      {subscriptions.length > 0 ? (
                        subscriptions.map((sub) => (
                          <tr key={sub.subscription_id} className="hover:bg-slate-900/60 transition-colors">
                            <td className="px-5 py-3 font-semibold text-white">
                              {sub.user_email || sub.user_name || sub.user_id || 'Unknown'}
                            </td>
                            <td className="px-5 py-3 font-mono text-[11px] text-slate-400">
                              {sub.subscription_id}
                            </td>
                            <td className="px-5 py-3">
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                  sub.status === 'active'
                                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                    : 'bg-slate-800 text-slate-400 border border-slate-700'
                                }`}
                              >
                                {sub.status}
                              </span>
                            </td>
                            <td className="px-5 py-3 text-slate-400 text-[11px]">
                              {sub.created ? new Date(sub.created).toLocaleDateString() : '--'}
                            </td>
                            <td className="px-5 py-3 text-slate-400 text-[11px]">
                              {sub.current_period_end
                                ? new Date(sub.current_period_end).toLocaleDateString()
                                : '--'}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="px-5 py-8 text-center text-slate-500">
                            {subsLoading ? 'Loading subscriptions...' : 'No subscriptions recorded yet.'}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ---------------------------------------------------- */}
            {/* TAB 5: SENSITIVE WORDS */}
            {/* ---------------------------------------------------- */}
            {activeTab === 'sensitive' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white tracking-tight">Sensitive Word Blacklist</h2>
                  <span className="text-xs text-slate-400">
                    Total Protected Keywords: {sensitiveWords.length}
                  </span>
                </div>

                {/* Add new word form */}
                <form
                  onSubmit={handleAddSensitiveWord}
                  className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-md flex flex-col sm:flex-row gap-3"
                >
                  <input
                    type="text"
                    placeholder="Enter banned word or sensitive phrase..."
                    value={newWord}
                    onChange={(e) => setNewWord(e.target.value)}
                    className="flex-1 rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                  />
                  <select
                    value={newWordLevel}
                    onChange={(e) => setNewWordLevel(e.target.value)}
                    className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5 text-xs text-slate-300 focus:outline-none"
                  >
                    <option value="1">Level 1 (Strict Block)</option>
                    <option value="2">Level 2 (Warning)</option>
                  </select>
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-md hover:opacity-95 cursor-pointer"
                  >
                    <PlusIcon className="w-4 h-4" />
                    <span>Add to Blacklist</span>
                  </button>
                </form>

                {/* Words Tags Display */}
                <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-md">
                  <div className="flex flex-wrap gap-2">
                    {sensitiveWords.map((item) => (
                      <span
                        key={item.id}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-xs text-rose-200"
                      >
                        <span>{item.words}</span>
                        <button
                          type="button"
                          onClick={() => handleDeleteSensitiveWord(item.id)}
                          className="hover:text-white transition-colors"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                    {sensitiveWords.length === 0 && (
                      <span className="text-xs text-slate-500">
                        {sensitiveLoading ? 'Loading words...' : 'No sensitive words configured.'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ---------------------------------------------------- */}
            {/* TAB 6: ENVIRONMENT & CONFIG */}
            {/* ---------------------------------------------------- */}
            {activeTab === 'config' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-white tracking-tight">Active Environment Summary</h2>
                <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-md space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950">
                      <span className="text-slate-400 block mb-1">Site Public URL:</span>
                      <strong className="text-white font-mono">{process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost'}</strong>
                    </div>

                    <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950">
                      <span className="text-slate-400 block mb-1">Google Login Check:</span>
                      <strong className="text-cyan-300">
                        {process.env.NEXT_PUBLIC_CHECK_GOOGLE_LOGIN === '1' ? 'Enabled (1)' : 'Disabled / Free Mode (0)'}
                      </strong>
                    </div>

                    <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950">
                      <span className="text-slate-400 block mb-1">Stripe Billing Enforcement:</span>
                      <strong className="text-cyan-300">
                        {process.env.NEXT_PUBLIC_CHECK_AVAILABLE_TIME === '1' ? 'Enabled (1)' : 'Disabled / Free Tier Mode (0)'}
                      </strong>
                    </div>

                    <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950">
                      <span className="text-slate-400 block mb-1">Default Free Credits Per User:</span>
                      <strong className="text-amber-300">{process.env.FREE_TIMES || '2'} Free Generations</strong>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border border-indigo-500/20 bg-indigo-950/20 text-xs text-indigo-200 leading-relaxed">
                    <strong className="text-indigo-300 block mb-1">Admin Security Tip:</strong>
                    You can change your master administrator password anytime by updating <code className="text-white bg-slate-900 px-1.5 py-0.5 rounded">ADMIN_PASSWORD</code> in your <code className="text-white bg-slate-900 px-1.5 py-0.5 rounded">.env.local</code> file and restarting your Node.js instance. To add multiple Google admin accounts, specify them comma-separated in <code className="text-white bg-slate-900 px-1.5 py-0.5 rounded">ADMIN_EMAILS=&quot;email1@gmail.com,email2@gmail.com&quot;</code>.
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Adjust Points Modal */}
      {creditModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white">Adjust User Credits</h3>
            <p className="text-xs text-slate-400">
              User: <strong className="text-slate-200">{creditModalUser.email || creditModalUser.name}</strong>
              <br />
              Current Points: <span className="text-amber-400 font-bold">{creditModalUser.available_times}</span>
            </p>

            <div className="space-y-3">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setCreditMode('add')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold ${
                    creditMode === 'add'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      : 'bg-slate-950 text-slate-400 border border-slate-800'
                  }`}
                >
                  Add Points (+)
                </button>
                <button
                  type="button"
                  onClick={() => setCreditMode('set')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold ${
                    creditMode === 'set'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      : 'bg-slate-950 text-slate-400 border border-slate-800'
                  }`}
                >
                  Set Absolute (=)
                </button>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Point Amount</label>
                <input
                  type="number"
                  value={creditAmount}
                  onChange={(e) => setCreditAmount(parseInt(e.target.value, 10) || 0)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex gap-1.5 pt-1">
                {[10, 50, 100, 500].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setCreditAmount(preset)}
                    className="flex-1 py-1 rounded-md bg-slate-800 text-[10px] text-slate-300 hover:bg-slate-700"
                  >
                    +{preset}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setCreditModalUser(null)}
                className="flex-1 py-2 rounded-xl border border-slate-800 bg-slate-950 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isUpdatingCredit}
                onClick={handleSaveCredits}
                className="flex-1 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-xs font-bold text-white hover:opacity-95 disabled:opacity-50"
              >
                {isUpdatingCredit ? 'Saving...' : 'Apply Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Lightbox Preview Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md cursor-pointer"
          onClick={() => setPreviewImage(null)}
        >
          <div className="max-w-4xl max-h-[90vh] relative rounded-2xl overflow-hidden shadow-2xl border border-slate-800">
            <img
              src={previewImage}
              alt="High Res Preview"
              className="max-w-full max-h-[85vh] object-contain"
            />
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-3 right-3 rounded-full bg-slate-950/80 text-white w-8 h-8 flex items-center justify-center border border-slate-700"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
