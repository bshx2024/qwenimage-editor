/**
 * User Attribution & Traffic Source Tracking
 * Inspired by APIVALE dual-touch attribution model (First Touch + Last Touch)
 */

export interface TouchAttribution {
  source: string;
  medium: string;
  campaign?: string;
  term?: string;
  content?: string;
  referrer: string;
  landing: string;
  timestamp: number;
}

export interface AttributionPayload {
  first_source?: string;
  first_medium?: string;
  first_campaign?: string;
  first_referrer?: string;
  first_landing?: string;
  first_touch_at?: number;

  last_source?: string;
  last_medium?: string;
  last_campaign?: string;

  register_lang?: string;
}

const STORAGE_FT_KEY = 'attr_first_touch';
const STORAGE_LT_KEY = 'attr_last_touch';
const COOKIE_FT_KEY = 'attr_ft';
const COOKIE_LT_KEY = 'attr_lt';

const FT_MAX_AGE = 60 * 60 * 24 * 365; // 1 year
const LT_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

/**
 * Cookie helpers
 */
function setAttributionCookie(name: string, value: string, maxAgeSeconds: number): void {
  if (typeof document === 'undefined') return;
  try {
    const isSecure = window.location.protocol === 'https:';
    document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAgeSeconds}; SameSite=Lax${isSecure ? '; Secure' : ''}`;
  } catch {
    // Ignore cookie write errors
  }
}

function getAttributionCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  try {
    const cookies = document.cookie.split(';');
    for (let c of cookies) {
      c = c.trim();
      if (c.startsWith(name + '=')) {
        return decodeURIComponent(c.substring(name.length + 1));
      }
    }
  } catch {
    // Ignore cookie read errors
  }
  return null;
}

/**
 * Parses current visitor's traffic source from URL and Document Referrer
 */
export function parseTrafficSource(): {
  source: string;
  medium: string;
  campaign: string;
  term: string;
  content: string;
  referrer: string;
  hasExplicitMarketing: boolean;
} {
  if (typeof window === 'undefined') {
    return {
      source: '',
      medium: '',
      campaign: '',
      term: '',
      content: '',
      referrer: '',
      hasExplicitMarketing: false,
    };
  }

  const urlParams = new URLSearchParams(window.location.search);

  // 1. Check UTM and custom parameters
  const utmSource = urlParams.get('utm_source')?.trim();
  const utmMedium = urlParams.get('utm_medium')?.trim();
  const utmCampaign = urlParams.get('utm_campaign')?.trim();
  const utmTerm = urlParams.get('utm_term')?.trim();
  const utmContent = urlParams.get('utm_content')?.trim();

  const refParam = urlParams.get('ref')?.trim();
  const fParam = urlParams.get('f')?.trim();
  const channelParam = urlParams.get('channel')?.trim();
  const affParam = urlParams.get('aff')?.trim();

  let source = utmSource || channelParam || refParam || fParam || '';
  let medium = utmMedium || '';
  let campaign = utmCampaign || '';
  let term = utmTerm || '';
  let content = utmContent || '';
  let hasExplicitMarketing = false;

  if (affParam) {
    if (!source) {
      source = `aff_${affParam}`;
      medium = 'referral';
    }
  }

  if (source || medium || campaign) {
    hasExplicitMarketing = true;
    if (!medium) medium = 'campaign';
    return {
      source,
      medium,
      campaign,
      term,
      content,
      referrer: document.referrer || '',
      hasExplicitMarketing,
    };
  }

  // 2. Check Referrer
  const rawReferrer = document.referrer ? document.referrer.trim() : '';
  if (!rawReferrer) {
    return {
      source: 'direct',
      medium: 'none',
      campaign: '',
      term: '',
      content: '',
      referrer: '',
      hasExplicitMarketing: false,
    };
  }

  try {
    const refUrl = new URL(rawReferrer);
    const currentHost = window.location.hostname;

    // Internal referrer - do not treat as new external source
    if (refUrl.hostname === currentHost || refUrl.hostname.endsWith(`.${currentHost}`)) {
      return {
        source: '',
        medium: '',
        campaign: '',
        term: '',
        content: '',
        referrer: rawReferrer,
        hasExplicitMarketing: false,
      };
    }

    const host = refUrl.hostname.toLowerCase();

    // Search engines
    if (host.includes('google.')) {
      source = 'google';
      medium = 'organic';
    } else if (host.includes('bing.')) {
      source = 'bing';
      medium = 'organic';
    } else if (host.includes('baidu.')) {
      source = 'baidu';
      medium = 'organic';
    } else if (host.includes('duckduckgo.')) {
      source = 'duckduckgo';
      medium = 'organic';
    } else if (host.includes('yahoo.')) {
      source = 'yahoo';
      medium = 'organic';
    } else if (host.includes('yandex.')) {
      source = 'yandex';
      medium = 'organic';
    // Social / Community networks
    } else if (host.includes('t.co') || host.includes('twitter.') || host.includes('x.com')) {
      source = 'twitter';
      medium = 'social';
    } else if (host.includes('reddit.')) {
      source = 'reddit';
      medium = 'social';
    } else if (host.includes('facebook.') || host.includes('fb.com')) {
      source = 'facebook';
      medium = 'social';
    } else if (host.includes('instagram.')) {
      source = 'instagram';
      medium = 'social';
    } else if (host.includes('youtube.') || host.includes('youtu.be')) {
      source = 'youtube';
      medium = 'social';
    } else if (host.includes('tiktok.')) {
      source = 'tiktok';
      medium = 'social';
    } else if (host.includes('pinterest.')) {
      source = 'pinterest';
      medium = 'social';
    } else if (host.includes('linkedin.')) {
      source = 'linkedin';
      medium = 'social';
    } else if (host.includes('github.')) {
      source = 'github';
      medium = 'social';
    } else if (host.includes('v2ex.')) {
      source = 'v2ex';
      medium = 'community';
    } else if (host.includes('linux.do')) {
      source = 'linuxdo';
      medium = 'community';
    } else {
      source = refUrl.hostname;
      medium = 'referral';
    }

    return {
      source,
      medium,
      campaign: '',
      term: '',
      content: '',
      referrer: rawReferrer,
      hasExplicitMarketing: true,
    };
  } catch {
    return {
      source: 'referral',
      medium: 'referral',
      campaign: '',
      term: '',
      content: '',
      referrer: rawReferrer,
      hasExplicitMarketing: true,
    };
  }
}

function saveTouch(storageKey: string, cookieKey: string, data: TouchAttribution, maxAge: number): void {
  try {
    const serialized = JSON.stringify(data);
    window.localStorage.setItem(storageKey, serialized);
    setAttributionCookie(cookieKey, serialized, maxAge);
  } catch {
    // Ignore storage/cookie write errors
  }
}

function getStoredTouch(storageKey: string, cookieKey: string): TouchAttribution | null {
  if (typeof window === 'undefined') return null;
  try {
    const fromStorage = window.localStorage.getItem(storageKey);
    if (fromStorage) {
      return JSON.parse(fromStorage);
    }
    const fromCookie = getAttributionCookie(cookieKey);
    if (fromCookie) {
      return JSON.parse(fromCookie);
    }
  } catch {
    // Ignore parsing errors
  }
  return null;
}

/**
 * Initialize attribution tracker on page load
 */
export function initAttributionTracker(): void {
  if (typeof window === 'undefined') return;

  try {
    const traffic = parseTrafficSource();
    const now = Math.floor(Date.now() / 1000);
    const landing = `${window.location.pathname}${window.location.search}`;

    // 1. First Touch: persist if not already stored and we have a source
    const existingFT = getStoredTouch(STORAGE_FT_KEY, COOKIE_FT_KEY);
    if (!existingFT && traffic.source) {
      const ft: TouchAttribution = {
        source: traffic.source,
        medium: traffic.medium,
        campaign: traffic.campaign,
        term: traffic.term,
        content: traffic.content,
        referrer: traffic.referrer,
        landing,
        timestamp: now,
      };
      saveTouch(STORAGE_FT_KEY, COOKIE_FT_KEY, ft, FT_MAX_AGE);
    }

    // 2. Last Touch: update whenever visitor comes with explicit marketing parameters
    if (traffic.hasExplicitMarketing && traffic.source) {
      const lt: TouchAttribution = {
        source: traffic.source,
        medium: traffic.medium,
        campaign: traffic.campaign,
        term: traffic.term,
        content: traffic.content,
        referrer: traffic.referrer,
        landing,
        timestamp: now,
      };
      saveTouch(STORAGE_LT_KEY, COOKIE_LT_KEY, lt, LT_MAX_AGE);
    }
  } catch (err) {
    console.warn('Attribution tracker init error:', err);
  }
}

/**
 * Retrieve attribution payload for registration or checkout
 */
export function getAttributionPayload(): AttributionPayload {
  if (typeof window === 'undefined') return {};

  const ft = getStoredTouch(STORAGE_FT_KEY, COOKIE_FT_KEY);
  const lt = getStoredTouch(STORAGE_LT_KEY, COOKIE_LT_KEY) || ft;

  const payload: AttributionPayload = {};

  if (ft) {
    payload.first_source = ft.source;
    payload.first_medium = ft.medium;
    payload.first_campaign = ft.campaign;
    payload.first_referrer = ft.referrer;
    payload.first_landing = ft.landing;
    payload.first_touch_at = ft.timestamp;
  }

  if (lt) {
    payload.last_source = lt.source;
    payload.last_medium = lt.medium;
    payload.last_campaign = lt.campaign;
  }

  if (typeof navigator !== 'undefined' && navigator.language) {
    payload.register_lang = navigator.language;
  }

  return payload;
}
