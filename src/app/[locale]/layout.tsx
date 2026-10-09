import clsx from 'clsx';
import Script from 'next/script';
import { GoogleAnalytics } from '@next/third-parties/google';
import { Inter } from 'next/font/google';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { ReactNode } from 'react';
import { locales } from '~/i18n/config';
import { CommonProvider } from '~/context/common-context';
import { NextAuthProvider } from '~/context/next-auth-context';
import { AttributionTracker } from '~/components/AttributionTracker';
import { getAuthText, getCommonText, getMenuText, getPricingText } from "~/i18n/languageText";

const inter = Inter({ subsets: ['latin'] });

type Props = {
  children: ReactNode;
  params: { locale: string };
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params: { locale }
}: Props) {

  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as any)) notFound();

  // Enable static rendering
  setRequestLocale(locale);

  const commonText = await getCommonText();
  const authText = await getAuthText();
  const menuText = await getMenuText();
  const pricingText = await getPricingText();

  return (
    <html lang={locale}>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/appicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/favicon.ico" />
      </head>
      <body suppressHydrationWarning={true} className={clsx(inter.className, 'flex flex-col background-div')}>
        <Script
          src="https://accounts.google.com/gsi/client"
          strategy="lazyOnload"
        />
        <NextAuthProvider>
          <AttributionTracker />
          <CommonProvider
            commonText={commonText}
            authText={authText}
            menuText={menuText}
            pricingText={pricingText}
          >
            {children}
          </CommonProvider>
        </NextAuthProvider>
        {process.env.NEXT_PUBLIC_GOOGLE_TAG_ID && (
          <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GOOGLE_TAG_ID} />
        )}
      </body>
    </html>
  );
}

