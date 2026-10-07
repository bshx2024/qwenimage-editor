import { R2, r2Bucket, storageURL } from "~/libs/R2";
import { getDb } from "~/libs/db";
import { countSticker } from "~/servers/keyValue";
import { v4 as uuidv4 } from "uuid";

export const POST = async (req: Request) => {
  try {
    const query = new URL(req.url).searchParams;
    const uid = query.get("uid");

    if (!uid) {
      return Response.json({ error: "Missing uid parameter" }, { status: 400 });
    }

    const json = await req.json();
    const rawOutput = json.output;
    const taskStatus = json.status;
    console.log("callByReplicate received for uid:", uid, "status:", taskStatus, "output:", rawOutput);

    // If Replicate explicitly reported failure or canceled
    if (taskStatus === 'failed' || taskStatus === 'canceled' || json.error) {
      const errorMsg = json.error || `Replicate task ${taskStatus}`;
      const { markWorkFailedAndRefund } = await import('~/servers/manageUserTimes');
      await markWorkFailedAndRefund(uid, typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg));
      return Response.json({ msg: 200, uid, status: 'failed' });
    }

    // Replicate may return string, array of strings, or object
    const rawList: string[] = Array.isArray(rawOutput)
      ? rawOutput
      : typeof rawOutput === "string"
      ? [rawOutput]
      : [];

    if (rawList.length === 0 && taskStatus === 'succeeded') {
      const { markWorkFailedAndRefund } = await import('~/servers/manageUserTimes');
      await markWorkFailedAndRefund(uid, 'No output image generated');
      return Response.json({ msg: 200, uid, status: 'failed' });
    }

    const output_urls: string[] = [];

    for (let i = 0; i < rawList.length; i++) {
      const url = rawList[i];
      let finalUrl = url;

      if (r2Bucket && process.env.R2_ACCOUNT_ID) {
        try {
          const currentFileContent = await fetch(url)
            .then((v) => v.arrayBuffer())
            .then(Buffer.from);

          const currentKey = `generated/${uuidv4()}.png`;
          await R2.upload({
            Bucket: r2Bucket,
            Key: currentKey,
            Body: currentFileContent,
            ContentType: "image/png",
          }).promise();

          finalUrl = `${storageURL}/${currentKey}`;
        } catch (r2Err) {
          console.warn("R2 transfer failed, using direct URL:", r2Err);
        }
      }

      output_urls.push(finalUrl);
    }

    const output_url = JSON.stringify(output_urls);

    try {
      const db = getDb();
      const results = await db.query("select * from works where uid=$1", [uid]);
      const rows = results.rows;
      if (rows.length > 0) {
        const row = rows[0];
        if (row.is_public) {
          await countSticker("countSticker", 1);
        }
        await db.query(
          "update works set output_url=$1, status=$2, updated_at=now() where uid=$3",
          [output_url, 1, uid]
        );
      }
    } catch (dbErr) {
      console.warn("DB update failed in callByReplicate:", dbErr);
    }

    return Response.json({ msg: 200, uid, count: output_urls.length });
  } catch (err: any) {
    console.error("Webhook processing error:", err);
    return Response.json({ error: err?.message || "Internal error" }, { status: 500 });
  }
};
