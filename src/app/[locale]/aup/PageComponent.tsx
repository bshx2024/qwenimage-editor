'use client';
import HeadInfo from "~/components/HeadInfo";
import Header from "~/components/Header";
import Footer from "~/components/Footer";
import Markdown from "react-markdown";
import TopBlurred from "~/components/TopBlurred";
import { useEffect, useRef, useState } from "react";
import { useCommonContext } from "~/context/common-context";

const PageComponent = ({
  locale,
  aupText,
}: {
  locale: string;
  aupText: {
    title: string;
    description: string;
    h1Text: string;
    detailText: string;
  };
}) => {
  const [pagePath] = useState("aup");
  const { setShowLoadingModal } = useCommonContext();

  const useCustomEffect = (effect: () => void, deps: any[]) => {
    const isInitialMount = useRef(true);
    useEffect(() => {
      if (process.env.NODE_ENV === 'production' || isInitialMount.current) {
        isInitialMount.current = false;
        return effect();
      }
    }, deps);
  };

  useCustomEffect(() => {
    setShowLoadingModal(false);
  }, []);

  const schemaData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        name: aupText?.title || 'Acceptable Use Policy (AUP) - Qwen Image Editor',
        description: aupText?.description || 'Acceptable use guidelines, safety policies, and commercial licensing standards for Qwen Image Editor.',
        url: 'https://qwenimage-editor.com/aup',
        publisher: {
          '@type': 'Organization',
          name: 'Qwen Image Editor',
          url: 'https://qwenimage-editor.com',
        },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: 'https://qwenimage-editor.com',
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Acceptable Use Policy',
            item: 'https://qwenimage-editor.com/aup',
          },
        ],
      },
    ],
  };

  return (
    <>
      <HeadInfo
        locale={locale}
        page={pagePath}
        title={aupText.title}
        description={aupText.description}
        schemaData={schemaData}
      />
      <Header
        locale={locale}
        page={pagePath}
      />

      <div className="mt-6 my-auto min-h-[90vh]">
        <TopBlurred />
        <main className="w-[95%] md:w-[65%] lg:w-[55%] 2xl:w-[45%] mx-auto h-full my-8">
          <div className="p-6 prose mx-auto text-gray-300 div-markdown-color">
            <Markdown>
              {aupText.detailText}
            </Markdown>
          </div>
        </main>
      </div>

      <Footer
        locale={locale}
        page={pagePath}
      />
    </>
  );
};

export default PageComponent;
