import { translateContent } from "~/servers/translate";

export const getQwenEditInput = async (imageUrl: string, textStr: string, checkSubscribeStatus: boolean = false) => {
  // Translate to English if needed
  let revised_text = textStr;
  try {
    revised_text = await translateContent(textStr, "en");
  } catch (e) {
    revised_text = textStr;
  }

  return {
    image: imageUrl,
    prompt: revised_text,
    go_fast: true,
    output_format: "webp",
    output_quality: checkSubscribeStatus ? 95 : 85,
  };
};

export const getQwenGeneratorInput = async (
  textStr: string,
  checkSubscribeStatus: boolean = false,
  options?: { width?: number; height?: number }
) => {
  let revised_text = textStr;
  try {
    revised_text = await translateContent(textStr, "en");
  } catch (e) {
    revised_text = textStr;
  }

  const width = options?.width || (checkSubscribeStatus ? 1024 : 768);
  const height = options?.height || (checkSubscribeStatus ? 1024 : 768);

  return {
    prompt: revised_text,
    width,
    height,
    output_format: "webp",
    output_quality: checkSubscribeStatus ? 95 : 85,
    negative_prompt:
      "NSFW, nudity, low quality, bad anatomy, deformed limbs, blurry, distorted text, violence",
  };
};

export const getInput = async (textStr: string, checkSubscribeStatus: boolean = false) => {
  return getQwenGeneratorInput(textStr, checkSubscribeStatus);
};
