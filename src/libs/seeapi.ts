import { v4 as uuidv4 } from 'uuid';
import { getSetting } from '~/servers/keyValue';

export interface SeeApiModerationResult {
  safe: boolean;
  flagged: boolean;
  action: 'allow' | 'block' | 'skipped';
  categories: string[];
  taskId?: string;
  consumedCredits?: number;
  message?: string;
}

/**
 * Scan an image for NSFW / prohibited content using SeeAPI NSFW Filter 2.0
 * Official Docs: https://www.seeapi.com/docs/nsfw-filter-2/image-moderation/
 *
 * Capabilities:
 * - Model: 'nsfw-filter-2' (NSFW Filter 2.0)
 * - Endpoint: 'image-moderation'
 * - Provider: 'seeapi'
 * - Supports: Public HTTPS URLs AND Base64 Data URLs (data:image/png;base64,... or data:image/jpeg;base64,...)
 * - Threshold: 0.01 - 0.99 (default: 0.5)
 * - strict_special_care: boolean (default: true)
 * - Dimensions: 256–8192px, 78,400–32,000,000 pixels
 */
export async function scanImageWithSeeApi(
  imageUrl: string,
  options?: {
    apiKey?: string;
    threshold?: number;
    strictSpecialCare?: boolean;
    maxWaitMs?: number;
    pollIntervalMs?: number;
  }
): Promise<SeeApiModerationResult> {
  const cleanUrl = (imageUrl || '').trim();
  if (!cleanUrl) {
    return {
      safe: false,
      flagged: false,
      action: 'block',
      categories: [],
      message: 'Image URL is empty.',
    };
  }

  // Retrieve API key from DB or process.env
  const apiKey =
    options?.apiKey ||
    (await getSetting('SEEAPI_API_KEY', 'SEEAPI_API_KEY')) ||
    process.env.SEEAPI_API_KEY ||
    '';

  if (!apiKey) {
    console.warn('[SeeAPI] No SEEAPI_API_KEY configured; skipping image moderation.');
    return {
      safe: true,
      flagged: false,
      action: 'skipped',
      categories: [],
      message: 'Moderation skipped: SEEAPI_API_KEY is not configured.',
    };
  }

  // Valid formats: HTTPS URL, HTTP URL, or Base64 Data URL (data:image/png;base64,... or data:image/jpeg;base64,...)
  const isHttpUrl = cleanUrl.startsWith('https://') || cleanUrl.startsWith('http://');
  const isDataUrl = cleanUrl.startsWith('data:image/');

  if (!isHttpUrl && !isDataUrl) {
    console.warn('[SeeAPI] Image is neither HTTP/HTTPS URL nor Base64 Data URL:', cleanUrl.slice(0, 50));
    return {
      safe: true,
      flagged: false,
      action: 'skipped',
      categories: [],
      message: 'Skipped: Unsupported image format.',
    };
  }

  const threshold = options?.threshold ?? 0.5;
  const strictSpecialCare = options?.strictSpecialCare ?? true;
  const maxWaitMs = options?.maxWaitMs || 10000; // 10s default max wait
  const pollIntervalMs = options?.pollIntervalMs || 1000;

  try {
    const idempotencyKey = uuidv4();

    // 1. Submit inference task to NSFW Filter 2.0
    const postRes = await fetch('https://api.seeapi.com/v1/inferences', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey.trim()}`,
        'Content-Type': 'application/json',
        'Idempotency-Key': idempotencyKey,
      },
      body: JSON.stringify({
        model: 'nsfw-filter-2',
        endpoint: 'image-moderation',
        provider: 'seeapi',
        input: {
          image_url: cleanUrl,
          threshold,
          strict_special_care: strictSpecialCare,
        },
      }),
    });

    const initData = await postRes.json().catch(() => ({}));

    if (!postRes.ok) {
      console.error('[SeeAPI] Initiate task failed:', postRes.status, initData);
      return {
        safe: true,
        flagged: false,
        action: 'skipped',
        categories: [],
        message: `SeeAPI request failed: ${initData?.error?.message || postRes.statusText}`,
      };
    }

    const taskId = initData.id;
    if (!taskId) {
      console.warn('[SeeAPI] No taskId returned:', initData);
      return {
        safe: true,
        flagged: false,
        action: 'skipped',
        categories: [],
      };
    }

    // 2. Poll inference status (HTTP 202 -> 200)
    const startTime = Date.now();
    while (Date.now() - startTime < maxWaitMs) {
      await new Promise((r) => setTimeout(r, pollIntervalMs));

      const pollRes = await fetch(`https://api.seeapi.com/v1/inferences/${taskId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey.trim()}`,
        },
      });

      if (!pollRes.ok) {
        continue;
      }

      const pollData = await pollRes.json().catch(() => ({}));
      if (pollData.status === 'succeeded') {
        const flagged = Boolean(pollData.result?.data?.flagged);
        const nsfwCategories: string[] = pollData.result?.data?.categories?.nsfw || [];
        const specialCare: string[] = pollData.result?.data?.categories?.special_care || [];
        const allCategories = [...nsfwCategories, ...specialCare];

        return {
          safe: !flagged,
          flagged,
          action: flagged ? 'block' : 'allow',
          categories: allCategories,
          taskId,
          consumedCredits: pollData.consumed_credits,
          message: flagged
            ? `Prohibited or NSFW content detected: ${allCategories.join(', ') || 'NSFW'}`
            : 'Image is safe.',
        };
      }

      if (pollData.status === 'failed') {
        const errorCode = pollData.error?.code;
        // If image dimensions are too small or irregular, fail open to avoid blocking harmless small icons
        if (errorCode === 'IMAGE_DIMENSIONS_INVALID') {
          console.warn('[SeeAPI] Image dimensions outside supported range (256-8192px), bypassed safely.');
          return {
            safe: true,
            flagged: false,
            action: 'skipped',
            taskId,
            message: 'Image dimensions outside model bounds, bypassed.',
            categories: [],
          };
        }

        console.warn('[SeeAPI] Task failed:', pollData.error);
        return {
          safe: true,
          flagged: false,
          action: 'skipped',
          taskId,
          message: `SeeAPI processing failed: ${pollData.error?.message || 'Unknown error'}`,
          categories: [],
        };
      }
    }

    // Timeout fallback (fail-open)
    console.warn(`[SeeAPI] Task ${taskId} timed out after ${maxWaitMs}ms.`);
    return {
      safe: true,
      flagged: false,
      action: 'skipped',
      taskId,
      message: 'Moderation timed out, bypassed safely.',
      categories: [],
    };
  } catch (err: any) {
    console.error('[SeeAPI] Execution error:', err);
    return {
      safe: true,
      flagged: false,
      action: 'skipped',
      categories: [],
      message: `SeeAPI execution error: ${err?.message}`,
    };
  }
}

/**
 * Fast test function for verifying SeeAPI key validity in Admin Dashboard
 */
export async function testSeeApiKey(apiKey: string): Promise<{ success: boolean; message: string }> {
  if (!apiKey || !apiKey.trim()) {
    return { success: false, message: 'SeeAPI API Key is empty.' };
  }

  try {
    const res = await fetch('https://api.seeapi.com/v1/inferences', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey.trim()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });

    const data = await res.json().catch(() => ({}));

    // 401 Unauthorized indicates invalid key format or key
    if (res.status === 401 || data?.error?.code === 'unauthorized') {
      return {
        success: false,
        message: data?.error?.message || 'Authentication failed: Invalid or expired SeeAPI Key.',
      };
    }

    // If key passed authentication, it will return 400 bad_request (because of missing fields like Idempotency-Key)
    if (res.status === 400 && data?.error?.code === 'bad_request') {
      return {
        success: true,
        message: 'SeeAPI Key verified successfully! Connection is healthy.',
      };
    }

    if (res.ok) {
      return {
        success: true,
        message: 'SeeAPI Key verified successfully!',
      };
    }

    return {
      success: true,
      message: 'SeeAPI Key connected successfully.',
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Connection error to SeeAPI: ${err?.message}`,
    };
  }
}
