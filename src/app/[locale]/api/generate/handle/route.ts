import { getUserById } from "~/servers/user";
import { checkUserTimes, countDownUserTimes } from "~/servers/manageUserTimes";
import { v4 as uuidv4 } from "uuid";
import { getReplicateClient } from "~/libs/replicateClient";
import { getQwenEditInput, getQwenGeneratorInput } from "~/libs/replicate";
import { getDb } from "~/libs/db";
import { getLanguage } from "~/servers/language";
import { checkSubscribe } from "~/servers/subscribe";
import { checkSensitiveInputText } from "~/servers/checkInput";

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const textStr = json.textStr || "";
    const user_id = json.user_id || "";
    let is_public = Boolean(json.is_public);
    const imageUrl = json.imageUrl || ""; // Input image for editing
    const taskType = json.taskType || (imageUrl ? "image_edit" : "text2image");

    if (!user_id && process.env.NEXT_PUBLIC_CHECK_GOOGLE_LOGIN != "0") {
      return Response.json({ msg: "Login to continue.", status: 601 });
    }

    // Verify user in DB if login check is enabled
    if (user_id && process.env.NEXT_PUBLIC_CHECK_GOOGLE_LOGIN != "0") {
      const resultsUser = await getUserById(user_id);
      if (!resultsUser?.email) {
        return Response.json({ msg: "Login to continue.", status: 601 });
      }
    }

    const checkSubscribeStatus = await checkSubscribe(user_id);
    if (!is_public) {
      if (!checkSubscribeStatus) {
        return Response.json({ msg: "Pricing to continue.", status: 602 });
      }
    }

    if (!checkSubscribeStatus) {
      const check = await checkUserTimes(user_id);
      if (!check && process.env.NEXT_PUBLIC_CHECK_AVAILABLE_TIME != "0") {
        return Response.json({ msg: "Pricing to continue.", status: 602 });
      }
    }

    const checkSensitive = await checkSensitiveInputText(textStr);
    if (!checkSensitive) {
      if (!checkSubscribeStatus) {
        return Response.json({ msg: "Pricing to continue.", status: 602 });
      } else {
        is_public = false;
      }
    }

    const uid = uuidv4();
    const replicateClient = getReplicateClient();
    const origin_language = await getLanguage(textStr);

    let input: any;
    let predictionParams: any = {
      webhook: `${process.env.REPLICATE_WEBHOOK || process.env.NEXT_PUBLIC_SITE_URL}/api/generate/callByReplicate?uid=${uid}`,
      webhook_events_filter: ["completed"],
    };

    if (imageUrl) {
      // Qwen Image Edit
      input = await getQwenEditInput(imageUrl, textStr, checkSubscribeStatus);
      if (process.env.REPLICATE_EDIT_VERSION) {
        predictionParams.version = process.env.REPLICATE_EDIT_VERSION;
      } else {
        predictionParams.model = "qwen/qwen-image-edit";
      }
    } else {
      // Qwen Image Generator
      input = await getQwenGeneratorInput(textStr, checkSubscribeStatus);
      if (process.env.REPLICATE_API_VERSION) {
        predictionParams.version = process.env.REPLICATE_API_VERSION;
      } else {
        predictionParams.model = "qwen/qwen-image";
      }
    }
    predictionParams.input = input;

    // Call Replicate API
    await replicateClient.predictions.create(predictionParams);

    // Save record to database with fallback if new columns aren't migrated yet
    try {
      const db = getDb();
      try {
        await db.query(
          "insert into works(uid, input_text, output_url, is_public, status, user_id, revised_text, is_origin, origin_language, current_language, input_image_url, task_type) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)",
          [
            uid,
            textStr,
            "",
            is_public,
            0,
            user_id,
            input.prompt,
            true,
            origin_language,
            origin_language,
            imageUrl,
            taskType,
          ]
        );
      } catch (colErr) {
        // Fallback for base table without new columns
        await db.query(
          "insert into works(uid, input_text, output_url, is_public, status, user_id, revised_text, is_origin, origin_language, current_language) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)",
          [
            uid,
            textStr,
            "",
            is_public,
            0,
            user_id,
            input.prompt,
            true,
            origin_language,
            origin_language,
          ]
        );
      }
    } catch (dbErr) {
      console.warn("DB insert error in generate/handle:", dbErr);
    }

    if (
      process.env.NEXT_PUBLIC_CHECK_GOOGLE_LOGIN != "0" &&
      process.env.NEXT_PUBLIC_CHECK_AVAILABLE_TIME != "0" &&
      !checkSubscribeStatus
    ) {
      await countDownUserTimes(user_id);
    }

    return Response.json({ uid });
  } catch (error: any) {
    console.error("Generate error:", error);
    return Response.json(
      { error: error?.message || "Generation request failed", status: 500 },
      { status: 500 }
    );
  }
}
