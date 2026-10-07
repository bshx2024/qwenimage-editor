export const getLinkHref = (locale = 'en', page = '') => {
  if (page == '') {
    if (locale == 'en') {
      return '/';
    }
    return `/${locale}/`;
  }
  if (locale == 'en') {
    return `/${page}`;
  }
  return `/${locale}/${page}`;
}


export const getCompressionImageLink = (url: any) => {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('//') || trimmed.startsWith('/')) {
    return trimmed;
  }
  const storageUrl = process.env.NEXT_PUBLIC_STORAGE_URL;
  if (!storageUrl) return trimmed;
  return `${storageUrl.replace(/\/+$/, '')}/${trimmed.replace(/^\/+/, '')}`;
}


export const getArrayUrlResult = (origin: any): string[] => {
  if (!origin) return [];
  try {
    const parsed = typeof origin === 'string' ? JSON.parse(origin) : origin;
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.filter(Boolean);
    }
    if (typeof parsed === 'string' && parsed.startsWith('http')) {
      return [parsed];
    }
  } catch (e) {
    if (typeof origin === 'string' && origin.trim().startsWith('http')) {
      return [origin.trim()];
    }
  }
  return [];
}

export const getTotalLinkHref = (locale = 'en', page = '') => {
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL && process.env.NEXT_PUBLIC_SITE_URL.replace(/\/+$/, '')) || 'http://localhost';
  if (page == '') {
    if (locale == 'en') {
      return siteUrl + '/';
    }
    return siteUrl + `/${locale}/`;
  }
  if (locale == 'en') {
    return siteUrl + `/${page}`;
  }
  return siteUrl + `/${locale}/${page}`;
}

export const getShareToPinterest = (locale = 'en', page = '', sticker:string) => {
  const pinterestUrl = 'https://pinterest.com/pin/create/button/';
  return pinterestUrl + `?description=${encodeURIComponent(sticker)}` + `&url=` + encodeURIComponent(getTotalLinkHref(locale, page));
}
