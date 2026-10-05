import { getDb } from './db';
import { v4 as uuidv4 } from 'uuid';
import { R2, r2Bucket, storageURL } from './R2';
import { countSticker } from '~/servers/keyValue';

export interface BailianGenerateParams {
  uid: string;
  prompt: string;
  imageUrl?: string;
  taskType?: 'text2image' | 'image_edit';
  model?: string;
  apiKey: string;
  baseUrl?: string;
  size?: string;
}

/**
 * Test if the provided Alibaba Cloud Bailian API Key is valid
 */
export async function testBailianKey(apiKey: string, baseUrl = 'https://dashscope.aliyuncs.com'): Promise<{ success: boolean; message: string }> {
  if (!apiKey || !apiKey.trim()) {
    return { success: false, message: 'API Key is empty.' };
  }

  const cleanBase = baseUrl.replace(/\/+$/, '');
  const url = `${cleanBase}/api/v1/tasks/test-health-check-probe`;

  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey.trim()}`
      }
    });

    const data = await res.json().catch(() => ({}));

    // If 401 or 403, key is unauthorized
    if (res.status === 401 || res.status === 403 || data?.code === 'InvalidApiKey' || data?.code === 'Unauthorized') {
      return {
        success: false,
        message: data?.message || 'Authentication failed: Invalid or expired API Key.'
      };
    }

    // 404 or 400 with TaskNotFound means the API key was authenticated by DashScope!
    if (res.status === 404 || res.status === 400 || data?.code === 'TaskNotFound' || res.status === 200) {
      return {
        success: true,
        message: 'Bailian API Key verified successfully! Connection is healthy.'
      };
    }

    return {
      success: true,
      message: `Bailian endpoint responded (${res.status}). Key format is accepted.`
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Connection error to ${cleanBase}: ${err?.message}`
    };
  }
}

/**
 * Submit an image generation or editing task to Alibaba Cloud Bailian (DashScope)
 */
export async function submitBailianTask(params: BailianGenerateParams): Promise<{ taskId: string; status: string }> {
  const {
    prompt,
    imageUrl,
    taskType = 'text2image',
    model = 'wanx2.1-t2i-turbo',
    apiKey,
    baseUrl = 'https://dashscope.aliyuncs.com',
    size = '1024*1024'
  } = params;

  const cleanBase = baseUrl.replace(/\/+$/, '');
  
  // Choose endpoint and payload based on task type
  let endpoint = `${cleanBase}/api/v1/services/aigc/text2image/image-synthesis`;
  let payload: any = {
    model: model || 'wanx2.1-t2i-turbo',
    input: {
      prompt: prompt
    },
    parameters: {
      size: size,
      n: 1
    }
  };

  // If input image is provided (Image Edit)
  if (taskType === 'image_edit' && imageUrl) {
    endpoint = `${cleanBase}/api/v1/services/aigc/image2image/image-synthesis`;
    let editModel = 'wanx2.1-i2i-turbo';
    if (model?.includes('imageedit')) {
      editModel = 'wanx2.1-imageedit';
    } else if (model?.includes('qwen-image')) {
      editModel = model;
    } else if (model?.includes('plus')) {
      editModel = 'wanx2.1-i2i-plus';
    } else if (model?.includes('i2i')) {
      editModel = model;
    }

    payload = {
      model: editModel,
      input: {
        prompt: prompt,
        image_url: imageUrl
      },
      parameters: {
        n: 1
      }
    };
  }

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey.trim()}`,
      'X-DashScope-Async': 'enable'
    },
    body: JSON.stringify(payload)
  });

  const data = await res.json();

  if (!res.ok || data.code) {
    throw new Error(data.message || data.code || `Bailian API error (${res.status})`);
  }

  const taskId = data?.output?.task_id;
  if (!taskId) {
    throw new Error('No task_id returned from Bailian API');
  }

  return {
    taskId,
    status: data?.output?.task_status || 'PENDING'
  };
}

/**
 * Poll task result from DashScope
 */
export async function queryBailianTask(taskId: string, apiKey: string, baseUrl = 'https://dashscope.aliyuncs.com') {
  const cleanBase = baseUrl.replace(/\/+$/, '');
  const url = `${cleanBase}/api/v1/tasks/${taskId}`;

  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${apiKey.trim()}`
    }
  });

  if (!res.ok) {
    throw new Error(`Failed to query Bailian task ${taskId} (${res.status})`);
  }

  return await res.json();
}

/**
 * Background worker to poll task result and write to Neon DB works table
 */
export async function processBailianTaskInBackground(
  uid: string,
  taskId: string,
  apiKey: string,
  baseUrl?: string
): Promise<void> {
  const MAX_ATTEMPTS = 30; // 30 * 2.5s = 75 seconds max wait
  let attempts = 0;

  const interval = setInterval(async () => {
    attempts++;
    try {
      const data = await queryBailianTask(taskId, apiKey, baseUrl);
      const status = data?.output?.task_status;

      if (status === 'SUCCEEDED') {
        clearInterval(interval);
        const results = data?.output?.results;
        const rawUrl = results?.[0]?.url || '';

        if (rawUrl) {
          let finalUrl = rawUrl;

          // If R2 is configured, transfer image permanently to Cloudflare R2 bucket
          if (r2Bucket && process.env.R2_ACCOUNT_ID) {
            try {
              const fileContent = await fetch(rawUrl)
                .then((v) => v.arrayBuffer())
                .then(Buffer.from);

              const currentKey = `generated/${uuidv4()}.png`;
              await R2.upload({
                Bucket: r2Bucket,
                Key: currentKey,
                Body: fileContent,
                ContentType: 'image/png',
              }).promise();

              finalUrl = `${storageURL}/${currentKey}`;
            } catch (r2Err) {
              console.warn('[Bailian] R2 upload failed, keeping direct OSS URL:', r2Err);
            }
          }

          const db = getDb();
          const workRes = await db.query('SELECT is_public FROM works WHERE uid = $1', [uid]);
          if (workRes.rows.length > 0 && workRes.rows[0].is_public) {
            await countSticker('countSticker', 1).catch(() => {});
          }

          await db.query(
            'UPDATE works SET output_url = $1, status = 1, updated_at = NOW() WHERE uid = $2',
            [JSON.stringify([finalUrl]), uid]
          );
          console.log(`[Bailian] Task ${taskId} succeeded, updated work ${uid}`);
        }
      } else if (status === 'FAILED' || status === 'CANCELED') {
        clearInterval(interval);
        const errorMsg = data?.output?.message || 'Bailian generation failed';
        console.error(`[Bailian] Task ${taskId} failed:`, errorMsg);
        const db = getDb();
        try {
          await db.query(
            'UPDATE works SET status = 2, message = $1, updated_at = NOW() WHERE uid = $2',
            [errorMsg, uid]
          );
        } catch {
          await db.query(
            'UPDATE works SET status = 2, updated_at = NOW() WHERE uid = $1',
            [uid]
          );
        }
      } else if (attempts >= MAX_ATTEMPTS) {
        clearInterval(interval);
        console.warn(`[Bailian] Task ${taskId} timed out after ${MAX_ATTEMPTS} attempts`);
      }
    } catch (err: any) {
      console.warn(`[Bailian] Error polling task ${taskId}:`, err?.message);
      if (attempts >= MAX_ATTEMPTS) {
        clearInterval(interval);
      }
    }
  }, 2500);
}
