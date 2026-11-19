import { getWaffoClientAsync } from '~/libs/waffo';
import { ScanSemanticMode } from '@waffo/pancake-ts';
import { scanImageWithSeeApi, SeeApiModerationResult } from '~/libs/seeapi';

export interface PromptScanResult {
  safe: boolean;
  action: 'allow' | 'review' | 'block' | 'skipped';
  reasonCode?: string;
  matchedCategories?: string[];
  requestId?: string;
  message?: string;
}

export interface ImageSafetyScanResult {
  safe: boolean;
  action: 'allow' | 'block' | 'skipped';
  flagged: boolean;
  categories: string[];
  message?: string;
  taskId?: string;
}

/**
 * Audit an image URL for NSFW and illegal content via SeeAPI
 */
export async function scanImageSafety(
  imageUrl: string,
  rawLocale: string = 'en'
): Promise<ImageSafetyScanResult> {
  const result = await scanImageWithSeeApi(imageUrl);

  let userFriendlyMessage = result.message || '';
  if (result.flagged) {
    const isZh = (rawLocale || '').toLowerCase().startsWith('zh');
    userFriendlyMessage = isZh
      ? `检测到上传的图片包含违规或不适宜内容 (${result.categories.join(', ') || 'NSFW'})，已被系统拦截。`
      : `The image contains prohibited or NSFW content (${result.categories.join(', ') || 'NSFW'}) and was blocked.`;
  }

  return {
    safe: result.safe,
    action: result.action,
    flagged: result.flagged,
    categories: result.categories,
    message: userFriendlyMessage,
    taskId: result.taskId,
  };
}

/**
 * Scans a user's generative prompt using Waffo Content Safety Prompt Screening API
 * Docs: https://docs.waffo.ai/zh/api-reference/endpoints/content-safety/scan-prompt
 *
 * Rules:
 * - 'allow': Safe to proceed with generation.
 * - 'review': Needs manual review or service degraded. Block generation for compliance.
 * - 'block': Violates content safety policies. Strictly block generation.
 */
export async function scanPromptSafety(
  prompt: string,
  rawLocale: string = 'en'
): Promise<PromptScanResult> {
  const cleanPrompt = (prompt || '').trim();
  if (!cleanPrompt) {
    return {
      safe: false,
      action: 'block',
      message: 'Prompt cannot be empty.',
    };
  }

  // Waffo API supports: 'ja', 'en', 'zh'
  let locale: 'en' | 'zh' | 'ja' = 'en';
  const lowerLocale = (rawLocale || '').toLowerCase();
  if (lowerLocale.startsWith('zh')) {
    locale = 'zh';
  } else if (lowerLocale.startsWith('ja')) {
    locale = 'ja';
  }

  try {
    const client = await getWaffoClientAsync();
    if (!client) {
      // Waffo credentials not yet configured in current environment, allow fallback
      return {
        safe: true,
        action: 'skipped',
        message: 'Content safety check skipped (Waffo credentials not set).',
      };
    }

    // Call Waffo official Prompt Screening API
    const verdict = await client.contentSafety.scanPrompt({
      prompt: cleanPrompt.slice(0, 10000), // Max 10,000 characters
      locale,
      semantic: ScanSemanticMode.Enforce,
    });

    if (verdict.action === 'allow') {
      return {
        safe: true,
        action: 'allow',
        reasonCode: verdict.reasonCode,
        requestId: verdict.requestId,
      };
    }

    // Handled blocked or review status
    let userFriendlyMessage = 'Your prompt contains sensitive or restricted content and cannot be processed.';
    if (locale === 'zh') {
      userFriendlyMessage = '您的提示词包含受限或不合规内容，未通过内容安全扫描，请修改后重试。';
    } else if (locale === 'ja') {
      userFriendlyMessage = 'プロンプトに不適切なコンテンツが含まれているため、生成を続行できません。';
    }

    return {
      safe: false,
      action: verdict.action,
      reasonCode: verdict.reasonCode,
      matchedCategories: verdict.matchedCategories || [],
      requestId: verdict.requestId,
      message: userFriendlyMessage,
    };
  } catch (error: any) {
    console.error('Waffo Prompt Screening API error:', error?.message || error);
    // In case of rate limits (429) or transient network issues, fail-safe or log
    return {
      safe: true,
      action: 'skipped',
      message: 'Safety screening temporary bypass: ' + (error?.message || 'network error'),
    };
  }
}
