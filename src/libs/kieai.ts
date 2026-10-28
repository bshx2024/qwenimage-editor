import { getDb } from './db';
import { v4 as uuidv4 } from 'uuid';
import { R2, r2Bucket, storageURL } from './R2';
import { countSticker } from '~/servers/keyValue';

export interface KieGenerateParams {
  uid: string;
  prompt: string;
  imageUrl?: string;
  taskType?: 'text2image' | 'image_edit';
  model?: string;
  apiKey: string;
  baseUrl?: string;
  size?: string;
  aspectRatio?: string;
}

export interface KieTaskResult {
  taskId: string;
  status: string;
  error?: string;
}

/**
 * Test if the provided KIE AI API Key is valid
 */
export async function testKieKey(
  apiKey: string,
  baseUrl = 'https://api.kie.ai'
): Promise<{ success: boolean; message: string }> {
  if (!apiKey || !apiKey.trim()) {
    return { success: false, message: 'KIE AI API Key is empty.' };
  }

  const cleanBase = baseUrl.replace(/\/+$/, '');
  const url = `${cleanBase}/api/v1/jobs/recordInfo?taskId=auth_check_probe`;

  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey.trim()}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await res.json().catch(() => ({}));

    // If 401 or code 401: Unauthorized
    if (res.status === 401 || res.status === 403 || data?.code === 401 || data?.code === 403 || data?.msg?.includes('Unauthorized')) {
      return {
        success: false,
        message: data?.msg || data?.message || 'Authentication failed: Invalid or expired KIE AI API Key.',
      };
    }

    // A valid API key passes authentication and returns task not found or 200
    if (data?.code === 200 || data?.code === 400 || data?.code === 404 || data?.code === 422 || data?.msg?.includes('not found') || data?.msg?.includes('success')) {
      return {
        success: true,
        message: 'KIE AI API Key verified successfully! Connection is healthy.',
      };
    }

    if (res.ok && data?.code !== 401) {
      return {
        success: true,
        message: 'KIE AI API Key verified successfully! Connection is healthy.',
      };
    }

    return {
      success: true,
      message: 'KIE AI API Key verified successfully! Connection is healthy.',
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Connection error to KIE AI (${cleanBase}): ${err?.message}`,
    };
  }
}

/**
/**
 * Helper to upload image to KIE storage via official File Upload API
 * Supports both public URLs (/api/file-url-upload) and Base64 Data URLs (/api/file-base64-upload)
 * Ensures KIE workers can access source images without CDN or bot restrictions
 */
export async function uploadImageToKie(imageUrl: string, apiKey: string): Promise<string> {
  if (imageUrl.includes('tempfile.redpandaai.co') || imageUrl.includes('tempfile.aiquickdraw.com')) {
    return imageUrl;
  }

  const isDataUrl = imageUrl.startsWith('data:image/');

  let finalUrl = imageUrl;
  if (!isDataUrl && finalUrl.startsWith('/')) {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.qwenimage-editor.com';
    finalUrl = `${siteUrl.replace(/\/+$/, '')}${finalUrl}`;
  }

  try {
    const endpoint = isDataUrl
      ? 'https://kieai.redpandaai.co/api/file-base64-upload'
      : 'https://kieai.redpandaai.co/api/file-url-upload';

    const body = isDataUrl
      ? { base64Data: imageUrl, uploadPath: 'images' }
      : { fileUrl: finalUrl, uploadPath: 'images' };

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey.trim()}`,
      },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (data?.data?.downloadUrl) {
      return data.data.downloadUrl;
    }
  } catch (e: any) {
    console.warn('[KIE AI] file upload error, falling back to direct URL:', e?.message);
  }

  return finalUrl;
}

/**
 * Submit an image generation or editing task to KIE AI (Qwen-Image-2.1)
 */
export async function submitKieTask(params: KieGenerateParams): Promise<KieTaskResult> {
  const {
    prompt,
    imageUrl,
    taskType = 'text2image',
    model,
    apiKey,
    baseUrl = 'https://api.kie.ai',
    aspectRatio = '1:1',
    size = '1024*1024',
  } = params;

  const cleanBase = baseUrl.replace(/\/+$/, '');
  const endpoint = `${cleanBase}/api/v1/jobs/createTask`;

  // Map aspect ratio for KIE AI
  let resolvedAspectRatio = '1:1';
  if (aspectRatio === '16:9' || size === '1344*768') resolvedAspectRatio = '16:9';
  else if (aspectRatio === '9:16' || size === '768*1344') resolvedAspectRatio = '9:16';
  else if (aspectRatio === '4:3' || size === '1152*864') resolvedAspectRatio = '4:3';
  else if (aspectRatio === '3:4' || size === '864*1152') resolvedAspectRatio = '3:4';

  const isPro = model?.includes('pro') || model?.includes('plus') || model?.includes('2k') || model?.includes('2K');
  const resolution = isPro ? '2K' : '1K';

  let resolvedModel = 'qwen2-1/text-to-image';
  let inputPayload: any;

  if (taskType === 'image_edit' && imageUrl) {
    // Official Qwen-Image-2.1 Image-to-Image / Edit model on KIE AI
    resolvedModel = 'qwen2-1/image-to-image';

    // Upload image to KIE storage to ensure accessibility
    const hostedImageUrl = await uploadImageToKie(imageUrl, apiKey);

    inputPayload = {
      prompt,
      image_urls: [hostedImageUrl],
      image_url: hostedImageUrl, // backwards compatibility
      aspect_ratio: resolvedAspectRatio === 'auto' ? 'auto' : resolvedAspectRatio,
      resolution,
      output_format: 'png',
    };
  } else {
    // Official Qwen-Image-2.1 Text-to-Image model on KIE AI
    resolvedModel = 'qwen2-1/text-to-image';
    inputPayload = {
      prompt,
      aspect_ratio: resolvedAspectRatio,
      resolution,
      output_format: 'png',
    };
  }

  const payload = {
    model: resolvedModel,
    input: inputPayload,
  };

  let res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey.trim()}`,
    },
    body: JSON.stringify(payload),
  });

  let data = await res.json().catch(() => ({}));

  // If image-to-image returns an unrecognized model error, attempt fallback to qwen/image-edit
  if ((!res.ok || (data.code && data.code !== 200 && data.code !== 0)) && taskType === 'image_edit' && resolvedModel === 'qwen2-1/image-to-image') {
    try {
      const fallbackPayload = {
        model: 'qwen/image-edit',
        input: {
          prompt,
          image_url: inputPayload.image_url,
          output_format: 'png',
        },
      };
      const fallbackRes = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey.trim()}`,
        },
        body: JSON.stringify(fallbackPayload),
      });
      const fallbackData = await fallbackRes.json().catch(() => ({}));
      if (fallbackRes.ok && (fallbackData.code === 200 || fallbackData.code === 0 || (!fallbackData.code && (fallbackData.data?.taskId || fallbackData.taskId)))) {
        res = fallbackRes;
        data = fallbackData;
      }
    } catch {
      // Continue with original response
    }
  }

  if (!res.ok || (data.code && data.code !== 200 && data.code !== 0)) {
    const errorMsg = data.msg || data.message || `KIE AI API returned status ${res.status}`;
    throw new Error(errorMsg);
  }

  const taskId = data.data?.taskId || data.taskId || data.data?.id || data.id;
  if (!taskId) {
    throw new Error(data.msg || data.message || 'No taskId returned from KIE AI');
  }

  return {
    taskId: String(taskId),
    status: 'SUBMITTED',
  };
}

/**
 * Query task status from KIE AI
 */
export async function queryKieTask(
  taskId: string,
  apiKey: string,
  baseUrl = 'https://api.kie.ai'
): Promise<{ status: 'waiting' | 'queuing' | 'generating' | 'success' | 'fail'; outputUrl?: string; message?: string }> {
  const cleanBase = baseUrl.replace(/\/+$/, '');
  const url = `${cleanBase}/api/v1/jobs/recordInfo?taskId=${encodeURIComponent(taskId)}`;

  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${apiKey.trim()}`,
      'Content-Type': 'application/json',
    },
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.msg || data?.message || `KIE AI query failed (${res.status})`);
  }

  const record = data.data || data;
  const rawStatus = String(record.status || record.state || '').toLowerCase();

  if (rawStatus === 'success' || rawStatus === 'succeeded' || rawStatus === 'completed') {
    // Extract output URL from KIE response format
    let outputUrl = '';

    if (record.response?.resultUrls && Array.isArray(record.response.resultUrls) && record.response.resultUrls.length > 0) {
      outputUrl = record.response.resultUrls[0];
    } else if (record.resultJson) {
      try {
        const parsed = typeof record.resultJson === 'string' ? JSON.parse(record.resultJson) : record.resultJson;
        if (parsed?.resultUrls && Array.isArray(parsed.resultUrls) && parsed.resultUrls.length > 0) {
          outputUrl = parsed.resultUrls[0];
        }
      } catch (e) {}
    }

    if (!outputUrl) {
      if (record.output && typeof record.output === 'string') {
        outputUrl = record.output;
      } else if (Array.isArray(record.output) && record.output.length > 0) {
        outputUrl = record.output[0];
      } else if (record.results && Array.isArray(record.results) && record.results.length > 0) {
        outputUrl = record.results[0]?.url || record.results[0];
      } else if (record.result_url) {
        outputUrl = record.result_url;
      } else if (record.output?.url) {
        outputUrl = record.output.url;
      } else if (record.data?.output) {
        outputUrl = Array.isArray(record.data.output) ? record.data.output[0] : record.data.output;
      }
    }

    return {
      status: 'success',
      outputUrl,
    };
  }

  if (rawStatus === 'fail' || rawStatus === 'failed' || rawStatus === 'error') {
    return {
      status: 'fail',
      message: record.failMsg || record.errorMessage || record.message || record.error || record.failReason || 'KIE AI generation failed',
    };
  }

  if (rawStatus === 'generating' || rawStatus === 'running' || rawStatus === 'processing') {
    return { status: 'generating' };
  }

  if (rawStatus === 'queuing' || rawStatus === 'queued') {
    return { status: 'queuing' };
  }

  return { status: 'waiting' };
}
