import { languages } from "~/i18n/config";

interface HeadInfoProps {
  locale?: string;
  page?: string;
  title: string;
  description: string;
  image?: string;
  schemaData?: any;
}

const HeadInfo = ({
  locale = 'en',
  page = '',
  title,
  description,
  image = '/images/og-image.jpg',
  schemaData,
}: HeadInfoProps) => {
  const siteUrl =
    (process.env.NEXT_PUBLIC_SITE_URL && process.env.NEXT_PUBLIC_SITE_URL.replace(/\/+$/, '')) ||
    'http://localhost';

  // Normalize siteUrl and paths
  const cleanSiteUrl = siteUrl.replace(/\/+$/, '');
  const cleanPage = page ? page.replace(/^\/+/, '').replace(/\/+$/, '') : '';

  // Calculate accurate canonical URL preserving 'as-needed' locale routing
  const canonicalUrl = cleanPage
    ? (locale === 'en' ? `${cleanSiteUrl}/${cleanPage}` : `${cleanSiteUrl}/${locale}/${cleanPage}`)
    : (locale === 'en' ? `${cleanSiteUrl}/` : `${cleanSiteUrl}/${locale}/`);

  const imageUrl = image.startsWith('http')
    ? image
    : `${cleanSiteUrl}${image.startsWith('/') ? '' : '/'}${image}`;

  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="robots" content="index, follow" />

      {/* Favicon & Icons */}
      <link rel="icon" href="/favicon.ico" sizes="any" />
      <link rel="icon" href="/appicon.svg" type="image/svg+xml" />
      <link rel="apple-touch-icon" href="/favicon.ico" />

      {/* Canonical Link */}
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:site_name" content="Qwen Image Editor" />
      <meta property="og:type" content="website" />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={title} />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />

      {/* Alternate Language Links */}
      {languages.map((item) => {
        const hrefLang = item.lang === 'en' ? 'x-default' : item.code;
        const localizedPath = cleanPage
          ? (item.lang === 'en' ? cleanPage : `${item.lang}/${cleanPage}`)
          : (item.lang === 'en' ? '' : `${item.lang}/`);
        const href = `${cleanSiteUrl}/${localizedPath}`;
        return <link key={`${hrefLang}-${href}`} rel="alternate" hrefLang={hrefLang} href={href} />;
      })}

      {/* Structured Data (JSON-LD) */}
      {schemaData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
        />
      )}
    </>
  );
};

export default HeadInfo;
