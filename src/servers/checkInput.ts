import {getDb} from "~/libs/db";


export const checkSensitiveInputText = async (input_text: string) => {
  try {
    const db = getDb();
    const { rows: sensitiveWords } = await db.query('select * from sensitive_words');
    if (sensitiveWords && sensitiveWords.length > 0) {
      for (let i = 0; i < sensitiveWords.length; i++) {
        const currentSensitive = sensitiveWords[i];
        const currentWords = currentSensitive?.words;
        if (currentWords && input_text.indexOf(currentWords) !== -1) {
          return false;
        }
      }
    }
  } catch (err: any) {
    console.warn('checkSensitiveInputText warning:', err?.message);
  }
  return true;
};
