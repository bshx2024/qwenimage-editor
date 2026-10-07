import PageComponent from "./PageComponent";
import { setRequestLocale } from 'next-intl/server';

export default async function DisclaimerPage({ params: { locale = '' } }: { params: { locale?: string } }) {
  setRequestLocale(locale);

  return (
    <PageComponent
      locale={locale}
    />
  );
}
