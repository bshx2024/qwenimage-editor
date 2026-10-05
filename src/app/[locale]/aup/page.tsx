import PageComponent from "./PageComponent";
import { setRequestLocale } from 'next-intl/server';
import { getAupText } from "~/i18n/languageText";

export default async function IndexPage({ params: { locale = '' } }) {
  setRequestLocale(locale);
  const aupText = await getAupText();

  return (
    <PageComponent
      locale={locale}
      aupText={aupText}
    />
  );
}
