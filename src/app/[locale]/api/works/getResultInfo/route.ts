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

  if ((!userId || userId === 'undefined') && process.env.NEXT_PUBLIC_CHECK_GOOGLE_LOGIN != '0') {
    return Response.json(result);
  }

  const db = getDb();

  let results;
  if (process.env.NEXT_PUBLIC_CHECK_GOOGLE_LOGIN != '0') {
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
      const bailianTaskId = await getSetting(`bailian_task_${uid}`);
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
            data.status = 2;
            data.message = errorMsg;
          }
        }
      }
    } catch (pollErr: any) {
      console.warn('[Bailian Poll] Error querying task status:', pollErr?.message);
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
