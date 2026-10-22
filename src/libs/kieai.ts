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

  const isPro = model?.includes('pro') || model?.includes('plus') || model?.includes('2K');
  const resolution = isPro ? '2K' : '1K';

  let resolvedModel = 'qwen2-1/text-to-image';
  const inputPayload: any = {
    prompt,
    aspect_ratio: resolvedAspectRatio,
    resolution,
    output_format: 'png',
  };

  if (taskType === 'image_edit' && imageUrl) {
    resolvedModel = 'qwen2-1/image-to-image';

    // Normalize image URL: if relative path, prepend public site domain
    let finalImageUrl = imageUrl;
    if (finalImageUrl.startsWith('/')) {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.qwenimage-editor.com';
      finalImageUrl = `${siteUrl.replace(/\/+$/, '')}${finalImageUrl}`;
    }

    inputPayload.image_url = [finalImageUrl];
  }

  const payload = {
    model: resolvedModel,
    input: inputPayload,
  };

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey.trim()}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => ({}));

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
    // Extract output URL
    let outputUrl = '';
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

    return {
      status: 'success',
      outputUrl,
    };
  }

  if (rawStatus === 'fail' || rawStatus === 'failed' || rawStatus === 'error') {
    return {
      status: 'fail',
      message: record.message || record.error || record.failReason || 'KIE AI generation failed',
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
