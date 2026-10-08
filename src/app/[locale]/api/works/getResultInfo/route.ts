import {getDb} from "~/libs/db";
import {getArrayUrlResult} from "~/configs/buildLink";
import {getAISettings, getSetting, countSticker} from "~/servers/keyValue";
import {queryBailianTask} from "~/libs/bailian";
import {R2, r2Bucket, storageURL} from "~/libs/R2";
import {v4 as uuidv4} from "uuid";

export const revalidate = 0;

export const GET = async (req: Request) => {
  const query = new URL(req.url).searchParams;

  const userId = query.get("userId");
  const uid = query.get("uid");

  const result = {
    status: 404,
    uid: uid,
    input_text: '',
    output_url: [] as any[],
    is_public: false,
    message: 'error',
    user_id: userId,
    revised_text: ''
  };

  const isGuestQuery = !userId || userId === 'undefined' || userId === 'guest';

  const db = getDb();

  let results;
  if (!isGuestQuery && process.env.NEXT_PUBLIC_CHECK_GOOGLE_LOGIN != '0') {
    results = await db.query('select * from works where uid=$1 and user_id=$2 and is_origin=$3 and is_delete=$4', [uid, userId, true, false]);
  } else {
    results = await db.query('select * from works where uid=$1 and is_origin=$2 and is_delete=$3', [uid, true, false]);
  }

  const resultData = results.rows;
  if (resultData.length <= 0) {
    return Response.json(result);
  }

  const data = resultData[0];

  // If work is still pending, poll Bailian task on-demand (essential for serverless runtimes)
  if (data.status === 0 && uid) {
    try {
      let bailianTaskId = '';
      if (typeof data.output_url === 'string' && data.output_url.startsWith('bailian:')) {
        bailianTaskId = data.output_url.replace('bailian:', '').trim();
      } else {
        bailianTaskId = await getSetting(`bailian_task_${uid}`).catch(() => '');
      }

      if (bailianTaskId) {
        const aiSettings = await getAISettings();
        if (aiSettings.provider === 'bailian' && aiSettings.bailianApiKey) {
          const taskData = await queryBailianTask(
            bailianTaskId,
            aiSettings.bailianApiKey,
            aiSettings.bailianBaseUrl
          );
          const taskStatus = taskData?.output?.task_status;

          if (taskStatus === 'SUCCEEDED') {
            const rawUrl = taskData?.output?.results?.[0]?.url || '';
            if (rawUrl) {
              let finalUrl = rawUrl;
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
                  console.warn('[Bailian] R2 upload error, keeping OSS URL:', r2Err);
                }
              }

              if (data.is_public) {
                await countSticker('countSticker', 1).catch(() => {});
              }

              await db.query(
                'UPDATE works SET output_url = $1, status = 1, updated_at = NOW() WHERE uid = $2',
                [JSON.stringify([finalUrl]), uid]
              );
              data.status = 1;
              data.output_url = JSON.stringify([finalUrl]);
            }
          } else if (taskStatus === 'FAILED' || taskStatus === 'CANCELED') {
            const errorMsg = taskData?.output?.message || 'Bailian generation failed';
            const { markWorkFailedAndRefund } = await import('~/servers/manageUserTimes');
            await markWorkFailedAndRefund(uid, errorMsg);
            data.status = 2;
            data.message = errorMsg;
          }
        }
      }
    } catch (pollErr: any) {
      console.warn('[Bailian Poll] Error querying task status:', pollErr?.message);
    }
  }

  // If work is still pending, poll Ark Seedance video task on-demand
  if (data.status === 0 && uid && (data.task_type?.startsWith('video_') || (typeof data.output_url === 'string' && data.output_url.startsWith('ark:')))) {
    try {
      let arkTaskId = '';
      if (typeof data.output_url === 'string' && data.output_url.startsWith('ark:')) {
        arkTaskId = data.output_url.replace('ark:', '').trim();
      }

      let apiKey = process.env.ARK_API_KEY || process.env.VOLCENGINE_ARK_API_KEY;
      const baseUrl = process.env.ARK_BASE_URL || "https://ark.cn-beijing.volces.com/api/v3";

      if (!apiKey && typeof process !== "undefined") {
        try {
          const fs = require("fs");
          const path = require("path");
          const envLocal = path.join(process.cwd(), ".env.local");
          if (fs.existsSync(envLocal)) {
            const text = fs.readFileSync(envLocal, "utf8");
            const keyMatch = text.match(/^\s*ARK_API_KEY\s*=\s*(.+)$/m);
            if (keyMatch && keyMatch[1]) apiKey = keyMatch[1].trim();
          }
        } catch (e) {}
      }

      // If arkTaskId is not stored directly, look up recent completed Ark task
      if (!arkTaskId && apiKey) {
        try {
          const listRes = await fetch(`${baseUrl}/contents/generations/tasks?page_num=1&page_size=5`, {
            headers: { Authorization: `Bearer ${apiKey}` },
          });
          if (listRes.ok) {
            const listData = await listRes.json();
            const matched = listData.items?.find((item: any) => item.status === 'succeeded' || item.status === 'running');
            if (matched && matched.id) {
              arkTaskId = matched.id;
            }
          }
        } catch (e) {}
      }

      if (arkTaskId && apiKey) {
        const arkResponse = await fetch(`${baseUrl}/contents/generations/tasks/${arkTaskId}`, {
          headers: { Authorization: `Bearer ${apiKey}` },
        });
        if (arkResponse.ok) {
          const arkTask = await arkResponse.json();
          if (arkTask.status === 'succeeded') {
            const videoUrl = arkTask.content?.video_url || arkTask.output?.video_url;
            if (videoUrl) {
              await db.query(
                'UPDATE works SET output_url = $1, status = 1, updated_at = NOW() WHERE uid = $2',
                [JSON.stringify([videoUrl]), uid]
              );
              data.status = 1;
              data.output_url = JSON.stringify([videoUrl]);
            }
          } else if (arkTask.status === 'failed') {
            const { markWorkFailedAndRefund } = await import('~/servers/manageUserTimes');
            const errorMsg = arkTask.error?.message || 'Ark Seedance video generation failed';
            await markWorkFailedAndRefund(uid, errorMsg);
            data.status = 2;
            data.message = errorMsg;
          }
        }
      }
    } catch (arkErr: any) {
      console.warn('[Ark Video Poll] Error querying task status:', arkErr?.message);
    }
  }

  result.status = data.status;
  result.input_text = data.input_text;
  result.output_url = getArrayUrlResult(data.output_url);
  result.is_public = data.is_public;
  result.user_id = data.user_id;
  result.uid = data.uid;
  result.revised_text = data.revised_text;
  result.message = data.message || '';

  return Response.json(result);
};
