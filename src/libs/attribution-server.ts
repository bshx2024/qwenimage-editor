import { TouchAttribution, AttributionPayload } from './attribution';

export interface ClientEnv {
  ip: string;
  country: string;
  device: 'pc' | 'mobile' | 'tablet' | 'unknown';
  os: 'windows' | 'macos' | 'ios' | 'android' | 'linux' | 'other';
  browser: 'chrome' | 'safari' | 'edge' | 'firefox' | 'opera' | 'other';
  lang: string;
}

export interface ServerAttribution {
  attribution: AttributionPayload;
  clientEnv: ClientEnv;
}

/**
 * Parses user-agent string into device, OS, and browser
 */
export function parseUserAgent(ua: string): {
  device: ClientEnv['device'];
  os: ClientEnv['os'];
  browser: ClientEnv['browser'];
} {
  const uaLower = (ua || '').toLowerCase();

  // 1. Device
  let device: ClientEnv['device'] = 'pc';
  if (/ipad|tablet|(android(?!.*mobile))/i.test(uaLower)) {
    device = 'tablet';
  } else if (/mobile|iphone|ipod|android|blackberry|opera mini|iemobile|wpdesktop/i.test(uaLower)) {
    device = 'mobile';
  }

  // 2. OS
  let os: ClientEnv['os'] = 'other';
  if (/windows|win32|win64/i.test(uaLower)) {
    os = 'windows';
  } else if (/iphone|ipad|ipod/i.test(uaLower)) {
    os = 'ios';
  } else if (/macintosh|mac os x/i.test(uaLower)) {
    os = 'macos';
  } else if (/android/i.test(uaLower)) {
    os = 'android';
  } else if (/linux/i.test(uaLower)) {
    os = 'linux';
  }

  // 3. Browser
  let browser: ClientEnv['browser'] = 'other';
  if (/edg\//i.test(uaLower)) {
    browser = 'edge';
  } else if (/opr\/|opera/i.test(uaLower)) {
    browser = 'opera';
  } else if (/chrome|crios/i.test(uaLower)) {
    browser = 'chrome';
  } else if (/firefox|fxios/i.test(uaLower)) {
    browser = 'firefox';
  } else if (/safari/i.test(uaLower) && !/chrome|crios/i.test(uaLower)) {
    browser = 'safari';
  }

  return { device, os, browser };
}

/**
 * Extracts client environment details from request headers
 */
export function extractClientEnv(headerMap: Headers): ClientEnv {
  // IP resolution with Cloudflare & proxy priority
  const cfIp = headerMap.get('cf-connecting-ip');
  const realIp = headerMap.get('x-real-ip');
  const forwardedFor = headerMap.get('x-forwarded-for');
  
  let ip = cfIp || realIp || '';
  if (!ip && forwardedFor) {
    ip = forwardedFor.split(',')[0].trim();
  }
  if (!ip) {
    ip = '127.0.0.1';
  }

  // Country resolution
  const country = (
    headerMap.get('cf-ipcountry') ||
    headerMap.get('x-country-code') ||
    headerMap.get('x-vercel-ip-country') ||
    ''
  ).trim().toUpperCase();

  // Language
  const acceptLang = headerMap.get('accept-language') || '';
  const lang = acceptLang ? acceptLang.split(',')[0].split(';')[0].trim() : '';

  // UA parsing
  const ua = headerMap.get('user-agent') || '';
  const { device, os, browser } = parseUserAgent(ua);

  return {
    ip,
    country,
    device,
    os,
    browser,
    lang,
  };
}

/**
 * Extracts First Touch & Last Touch attribution payload from cookies and headers
 */
export function extractAttributionFromRequest(
  headerMap: Headers,
  cookieGetter?: (name: string) => string | undefined
): ServerAttribution {
  const clientEnv = extractClientEnv(headerMap);

  let ft: TouchAttribution | null = null;
  let lt: TouchAttribution | null = null;

  // Extract from cookie header if cookieGetter is not provided
  const cookieHeader = headerMap.get('cookie') || '';
  const getCookieVal = (name: string): string | null => {
    if (cookieGetter) {
      const v = cookieGetter(name);
      if (v) return v;
    }
    const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
    return match ? decodeURIComponent(match[1]) : null;
  };

  const rawFt = getCookieVal('attr_ft');
  if (rawFt) {
    try {
      ft = JSON.parse(rawFt);
    } catch {
      // ignore
    }
  }

  const rawLt = getCookieVal('attr_lt');
  if (rawLt) {
    try {
      lt = JSON.parse(rawLt);
    } catch {
      // ignore
    }
  }

  // Fallback: If no cookie stored yet, derive initial touch from Referer header
  if (!ft) {
    const rawReferer = headerMap.get('referer') || '';
    if (rawReferer) {
      try {
        const refUrl = new URL(rawReferer);
        const host = refUrl.hostname.toLowerCase();
        let source = host;
        let medium = 'referral';

        if (host.includes('google.')) {
          source = 'google';
          medium = 'organic';
        } else if (host.includes('bing.')) {
          source = 'bing';
          medium = 'organic';
        } else if (host.includes('twitter.') || host.includes('t.co') || host.includes('x.com')) {
          source = 'twitter';
          medium = 'social';
        }

        ft = {
          source,
          medium,
          referrer: rawReferer,
          landing: '/',
          timestamp: Math.floor(Date.now() / 1000),
        };
      } catch {
        // ignore
      }
    }
  }

  const payload: AttributionPayload = {
    first_source: ft?.source || 'direct',
    first_medium: ft?.medium || 'none',
    first_campaign: ft?.campaign || '',
    first_referrer: ft?.referrer || '',
    first_landing: ft?.landing || '',
    first_touch_at: ft?.timestamp || Math.floor(Date.now() / 1000),

    last_source: lt?.source || ft?.source || 'direct',
    last_medium: lt?.medium || ft?.medium || 'none',
    last_campaign: lt?.campaign || ft?.campaign || '',

    register_lang: clientEnv.lang,
  };

  return {
    attribution: payload,
    clientEnv,
  };
}
