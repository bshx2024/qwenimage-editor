/**
 * GeoIP Country Resolution Utility
 * Resolves ISO 3166-1 alpha-2 country codes from IPv4/IPv6 addresses
 * Features in-memory caching and fast multi-source fallback
 */

const ipCountryCache = new Map<string, string>();
const MAX_CACHE_SIZE = 10000;

/**
 * Converts 2-letter ISO country code into Unicode Flag Emoji
 * e.g. 'DE' -> '🇩🇪', 'US' -> '🇺🇸', 'JP' -> '🇯🇵'
 */
export function getCountryFlag(countryCode: string): string {
  if (!countryCode || countryCode.length !== 2) return '🌐';
  const code = countryCode.toUpperCase();
  if (code === 'LOCAL' || code === 'UNKNOWN') return '🌐';
  const codePoints = code.split('').map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

/**
 * Checks if IP is a local/private IP address
 */
function isPrivateIp(ip: string): boolean {
  if (!ip) return true;
  const clean = ip.trim();
  if (
    clean === '127.0.0.1' ||
    clean === '::1' ||
    clean === 'localhost' ||
    clean.startsWith('10.') ||
    clean.startsWith('192.168.') ||
    clean.startsWith('172.16.') ||
    clean.startsWith('172.17.') ||
    clean.startsWith('172.18.') ||
    clean.startsWith('172.19.') ||
    clean.startsWith('172.2') ||
    clean.startsWith('172.30.') ||
    clean.startsWith('172.31.')
  ) {
    return true;
  }
  return false;
}

/**
 * Resolves 2-letter country code from IP address
 */
export async function resolveCountryFromIp(ip: string): Promise<string> {
  if (!ip) return '';
  const cleanIp = ip.split(',')[0].trim();

  if (isPrivateIp(cleanIp)) {
    return 'LOCAL';
  }

  // Check in-memory cache
  if (ipCountryCache.has(cleanIp)) {
    return ipCountryCache.get(cleanIp)!;
  }

  // 1. Try country.is (High speed, zero config, global CDN)
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 1800);
    const res = await fetch(`https://api.country.is/${cleanIp}`, {
      signal: controller.signal,
      headers: { 'User-Agent': 'qwenimage-editor-geoip' },
    });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      if (data && data.country && typeof data.country === 'string') {
        const country = data.country.toUpperCase().trim();
        if (country.length === 2) {
          if (ipCountryCache.size < MAX_CACHE_SIZE) {
            ipCountryCache.set(cleanIp, country);
          }
          return country;
        }
      }
    }
  } catch {
    // Continue to fallback
  }

  // 2. Fallback to ip-api.com
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 1800);
    const res = await fetch(`http://ip-api.com/json/${cleanIp}?fields=countryCode`, {
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      if (data && data.countryCode && typeof data.countryCode === 'string') {
        const country = data.countryCode.toUpperCase().trim();
        if (country.length === 2) {
          if (ipCountryCache.size < MAX_CACHE_SIZE) {
            ipCountryCache.set(cleanIp, country);
          }
          return country;
        }
      }
    }
  } catch {
    // Ignore fallback errors
  }

  return '';
}
