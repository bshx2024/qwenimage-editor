'use client'
import HeadInfo from "~/components/HeadInfo";
import Header from "~/components/Header";
import Footer from "~/components/Footer";
import Markdown from "react-markdown";
import TopBlurred from "~/components/TopBlurred";
import {useEffect, useRef, useState} from "react";
import {useCommonContext} from "~/context/common-context";


const PageComponent = ({
                         locale,
                         termsOfServiceText,
                       }) => {
  const [pagePath] = useState("terms-of-service");
  const {setShowLoadingModal} = useCommonContext();

  const useCustomEffect = (effect, deps) => {
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
    return () => {
    }
  }, []);

  const schemaData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        name: termsOfServiceText?.title || 'Terms of Service - Qwen Image Editor',
        description: termsOfServiceText?.description || 'Terms of service, acceptable use guidelines, and licensing terms for Qwen Image Editor.',
        url: 'https://qwenimage-editor.com/terms-of-service',
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
            name: 'Terms of Service',
            item: 'https://qwenimage-editor.com/terms-of-service',
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
        title={termsOfServiceText.title}
        description={termsOfServiceText.description}
        schemaData={schemaData}
      />
      <Header
        locale={locale}
        page={pagePath}
      />

      <div className="mt-6 my-auto min-h-[90vh]">
        <TopBlurred/>
        <main className="w-[95%] md:w-[65%] lg:w-[55%] 2xl:w-[45%] mx-auto h-full my-8">
          <div className="p-6 prose mx-auto text-gray-300 div-markdown-color">
            <Markdown>
              {termsOfServiceText.detailText}
            </Markdown>
          </div>
        </main>
      </div>

      <Footer
        locale={locale}
        page={pagePath}
      />
    </>
  )
}

export default PageComponent
