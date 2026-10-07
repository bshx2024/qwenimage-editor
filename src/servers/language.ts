import {apiKey, baseUrl} from "~/configs/openaiConfig";

export const model = 'openai/gpt-4o';
export const temperature = 0
export const getLanguage = async (content: string) => {
  if (!content) return 'en';
  // Fast path: if no OpenAI API key is configured, detect language locally
  if (!apiKey) {
    return /[\u4e00-\u9fa5]/.test(content) ? 'zh' : 'en';
  }

  try {
    let body = {
      messages: [
        {
          role: 'system',
          content: `你是一个语言分析专家，能够直接识别文本是什么语言，并且区分繁体中文和简体中文，如果是繁体中文则返回tw，简体中文返回zh。`
        },
        {
          role: 'system',
          content: `识别这段文字的语言，只返回语言的英文缩写，不含任何解释！`
        },
        {
          role: 'user',
          content: `需要识别的内容: ${content}`
        }
      ],
      model: model,
      temperature: temperature,
      stream: false
    };
    let languageResult = await fetch(`${baseUrl}/v1/chat/completions`, {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${apiKey}`
      }
    })
      .then(v => v.json()).catch(err => {
        console.warn('getLanguage fetch error:', err);
        return null;
      });

    const lang = languageResult?.choices?.[0]?.message?.content?.trim()?.substring(0, 2) || (
      /[\u4e00-\u9fa5]/.test(content) ? 'zh' : 'en'
    );
    return lang;
  } catch (err) {
    console.warn('getLanguage error:', err);
    return /[\u4e00-\u9fa5]/.test(content) ? 'zh' : 'en';
  }
};
