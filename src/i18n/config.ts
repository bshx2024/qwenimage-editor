export const locales = ["en"] as const;

export const languages = [
  {
    code: "en-US",
    lang: "en",
    language: "English",
  },
];

export const getLanguageByLang = (lang) => {
  for (let i = 0; i < languages.length; i++) {
    if (lang == languages[i].lang) {
      return languages[i];
    }
  }
  return languages[0];
};
