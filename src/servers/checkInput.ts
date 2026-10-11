import { getDb } from "~/libs/db";

export interface SensitiveCheckResult {
  isSafe: boolean;
  matchedWord?: string;
  reason?: string;
}

// 转义正则表达式特殊字符
function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * 内置高危/涉黄/NSFW/露骨性暗示及违规黑名单词库 (中英文通用底线保障)
 * 采用智能分词匹配：
 * - 纯英文/数字单/短语使用 \b 单词边界匹配，杜绝误杀 (如不会误杀 document, accumulate 等)
 * - 复合词组、脱衣指令短语及中文使用子串匹配
 */
const BUILTIN_BLOCKED_PHRASES: string[] = [
  // 露骨脱衣 / 裸露指令
  "remove clothes",
  "remove the clothes",
  "remove her clothes",
  "remove his clothes",
  "strip clothes",
  "strip naked",
  "take off clothes",
  "without clothes",
  "clothes off",
  "naked body",
  "nude body",
  "completely naked",
  "fully naked",
  "fully nude",
  "bare breasts",
  "bare nipples",
  "bare chest",
  "topless",
  "bottomless",
  "expose herself",
  "expose himself",

  // 极端违法 / 儿童保护 (CSAM 零容忍)
  "child porn",
  "childporn",
  "pedophile",
  "paedophile",
  "underage sex",
  "lolita sex",
  "shota sex",

  // 涉黄 / 性行为 / 露骨体液词组
  "copious amounts of cum",
  "drench in cum",
  "covered in cum",
  "cum on face",
  "cumshot",
  "creampie",
  "deepthroat",
  "blowjob",
  "handjob",
  "gangbang",
  "bukkake",
  "threesome sex",
  "group sex",
  "anal sex",
  "oral sex",

  // 中文高危违规词
  "脱衣服",
  "脱掉衣服",
  "脱光衣服",
  "脱光",
  "全裸",
  "半裸",
  "裸体",
  "裸照",
  "露点",
  "露出胸部",
  "露奶",
  "无码",
  "阴道",
  "阴茎",
  "私处",
  "射精",
  "精液",
  "做爱",
  "打炮",
  "自慰",
  "口交",
  "肛交",
  "高潮",
  "幼女",
  "幼齿",
  "强奸",
  "乱伦",
  "色情",
  "黄片",
  "春药",
  "斩首",
  "分尸",
  "血腥虐待"
];

// 纯英文独立高危单核敏感词 (严格使用 \b 边界匹配)
const BUILTIN_BLOCKED_WORDS_BOUNDARY: string[] = [
  "cum",
  "cumming",
  "jizz",
  "semen",
  "pussy",
  "vagina",
  "clitoris",
  "penis",
  "dick",
  "cock",
  "dildo",
  "buttplug",
  "anus",
  "anal",
  "porn",
  "porno",
  "pornography",
  "xxx",
  "hentai",
  "ecchi",
  "erotic",
  "erotica",
  "nude",
  "nudes",
  "naked",
  "undress",
  "undressed",
  "masturbate",
  "masturbation",
  "orgasm",
  "incest",
  "bdsm",
  "bestiality",
  "snuff",
  "beheading",
  "decapitation"
];

// 简单内存缓存，避免高并发下每次都全量读库
let cachedDbWords: string[] = [];
let lastDbWordsFetchTime = 0;
const DB_CACHE_TTL_MS = 60 * 1000; // 1 分钟缓存

async function getDatabaseSensitiveWords(): Promise<string[]> {
  const now = Date.now();
  if (cachedDbWords.length > 0 && now - lastDbWordsFetchTime < DB_CACHE_TTL_MS) {
    return cachedDbWords;
  }

  try {
    const db = getDb();
    const { rows } = await db.query("SELECT words FROM sensitive_words");
    if (rows && rows.length > 0) {
      cachedDbWords = rows
        .map((r: any) => (r?.words || "").trim().toLowerCase())
        .filter((w: string) => Boolean(w));
      lastDbWordsFetchTime = now;
      return cachedDbWords;
    }
  } catch (err: any) {
    console.warn("getDatabaseSensitiveWords error, fallback to builtin words:", err?.message);
  }

  return cachedDbWords;
}

/**
 * 核心敏感词与风控检测函数
 * @param input_text 待检测的用户 Prompt
 * @returns SensitiveCheckResult
 */
export const inspectSensitiveInputText = async (
  input_text: string
): Promise<SensitiveCheckResult> => {
  if (!input_text || typeof input_text !== "string") {
    return { isSafe: true };
  }

  const normalized = input_text.toLowerCase().trim();
  if (!normalized) {
    return { isSafe: true };
  }

  // 1. 检查内置复合短语与指令 (直接子串包含检测)
  for (const phrase of BUILTIN_BLOCKED_PHRASES) {
    if (normalized.includes(phrase)) {
      return {
        isSafe: false,
        matchedWord: phrase,
        reason: `Matched restricted phrase: ${phrase}`
      };
    }
  }

  // 2. 检查内置英文单核敏感词 (单词边界正则匹配，防止误伤 normal English words)
  for (const word of BUILTIN_BLOCKED_WORDS_BOUNDARY) {
    const regex = new RegExp(`\\b${escapeRegExp(word)}\\b`, "i");
    if (regex.test(normalized)) {
      return {
        isSafe: false,
        matchedWord: word,
        reason: `Matched restricted keyword: ${word}`
      };
    }
  }

  // 3. 检查数据库中配置的自定义敏感词
  const dbWords = await getDatabaseSensitiveWords();
  for (const rawDbWord of dbWords) {
    const word = rawDbWord.toLowerCase().trim();
    if (!word) continue;

    // 如果是纯英文/数字，使用单词边界匹配
    if (/^[a-z0-9_-]+$/i.test(word)) {
      const regex = new RegExp(`\\b${escapeRegExp(word)}\\b`, "i");
      if (regex.test(normalized)) {
        return {
          isSafe: false,
          matchedWord: word,
          reason: `Matched custom sensitive word: ${word}`
        };
      }
    } else {
      // 包含空格或中文/多语言短语，使用子串包含检测
      if (normalized.includes(word)) {
        return {
          isSafe: false,
          matchedWord: word,
          reason: `Matched custom sensitive phrase: ${word}`
        };
      }
    }
  }

  return { isSafe: true };
};

/**
 * 兼容旧版调用函数
 * @param input_text 待检测的提示词
 * @returns true: 安全 / false: 违规拦截
 */
export const checkSensitiveInputText = async (input_text: string): Promise<boolean> => {
  const result = await inspectSensitiveInputText(input_text);
  return result.isSafe;
};
