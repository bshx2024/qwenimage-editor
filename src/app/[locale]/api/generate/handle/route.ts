import { getUserById } from "~/servers/user";
import { checkUserTimes, countDownUserTimes } from "~/servers/manageUserTimes";
import { v4 as uuidv4 } from "uuid";
import { getReplicateClient } from "~/libs/replicateClient";
import { getQwenEditInput, getQwenGeneratorInput } from "~/libs/replicate";
import { getDb } from "~/libs/db";
import { getLanguage } from "~/servers/language";
import { checkSubscribe } from "~/servers/subscribe";
import { checkSensitiveInputText, inspectSensitiveInputText } from "~/servers/checkInput";
import { getAISettings, getSetting, setSetting } from "~/servers/keyValue";
import { submitBailianTask, processBailianTaskInBackground } from "~/libs/bailian";
import { submitKieTask } from "~/libs/kieai";
import { scanPromptSafety } from "~/servers/contentSafety";

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const textStr = json.textStr || "";
    const user_id = json.user_id || "";
    let is_public = Boolean(json.is_public);
    let imageUrl = json.imageUrl || ""; // Input image for editing
    if (imageUrl && imageUrl.startsWith("/")) {
      const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.qwenimage-editor.com").replace(/\/+$/, "");
      imageUrl = `${siteUrl}${imageUrl}`;
    }
    const taskType = json.taskType || (imageUrl ? "image_edit" : "text2image");
    const requestedModel = String(json.model || "");
    const aspectRatio = String(json.aspectRatio || "1:1");

    // Compute target dimensions & size string for text-to-image / image-edit
    let resolvedSize = "1024*1024";
    let width = 1024;
    let height = 1024;

    if (aspectRatio === "auto") {
      resolvedSize = imageUrl ? "auto" : "1024*1024";
    } else if (aspectRatio === "16:9") {
      resolvedSize = "1344*768";
      width = 1344;
      height = 768;
    } else if (aspectRatio === "9:16") {
      resolvedSize = "768*1344";
      width = 768;
      height = 1344;
    } else if (aspectRatio === "4:3") {
      resolvedSize = "1152*864";
      width = 1152;
      height = 864;
    } else if (aspectRatio === "3:4") {
      resolvedSize = "864*1152";
      width = 864;
      height = 1152;
    } else if (json.size) {
      resolvedSize = String(json.size).replace("x", "*");
      const parts = resolvedSize.split("*");
      if (parts.length === 2 && !isNaN(Number(parts[0])) && !isNaN(Number(parts[1]))) {
        width = Number(parts[0]);
        height = Number(parts[1]);
      }
    }

    // Differentiated Credit Deduction:
    // Standard models (wanx2.1-t2i-turbo, wanx2.1-imageedit, wanx2.1-i2i-turbo): 1 Credit
    // Pro / Flagship models (qwen-image-2.1-pro, qwen-image-3.0-pro, wanx2.1-t2i-plus, wanx2.1-i2i-plus): 2 Credits
    const isProModel =
      requestedModel.includes("pro") ||
      requestedModel.includes("plus") ||
      requestedModel.includes("3.0");
    const creditCost = isProModel ? 2 : 1;

    const isGuest = !user_id || user_id === "guest";
    const isRealUser = !isGuest;
    let checkSubscribeStatus = false;

    if (isGuest) {
      return Response.json({
        msg: "Please sign in and get credits to start generating images.",
        status: 601,
        guestLimitReached: true,
      });
    } else {
      // Authenticated User Verification
      if (process.env.NEXT_PUBLIC_CHECK_GOOGLE_LOGIN != "0") {
        const resultsUser = await getUserById(user_id);
        if (!resultsUser?.email) {
          return Response.json({ msg: "Login to continue.", status: 601 });
        }
      }

      checkSubscribeStatus = await checkSubscribe(user_id);
      if (!is_public) {
        if (!checkSubscribeStatus) {
          return Response.json({ msg: "Pricing to continue.", status: 602 });
        }
      }

      if (!checkSubscribeStatus) {
        if (isRealUser || process.env.NEXT_PUBLIC_CHECK_AVAILABLE_TIME != "0") {
          const check = await checkUserTimes(user_id, creditCost);
          if (!check) {
            return Response.json({ msg: "Pricing to continue.", status: 602 });
          }
        }
      }
    }

    const checkSensitive = await inspectSensitiveInputText(textStr);
    if (!checkSensitive.isSafe) {
      return Response.json({
        msg: "Your prompt contains prohibited, NSFW, or sensitive content and cannot be processed.",
        status: 400,
        safetyBlock: true,
        matchedReason: checkSensitive.reason,
      });
    }

    // Waffo Content Safety Screening API check
    const safetyCheck = await scanPromptSafety(textStr, json.locale || 'en');
    if (!safetyCheck.safe) {
      return Response.json({
        msg: safetyCheck.message || "Prompt contains restricted content. Generation aborted.",
        status: 400,
        safetyBlock: true,
        reasonCode: safetyCheck.reasonCode,
        requestId: safetyCheck.requestId
      });
    }

    const uid = uuidv4();
    const origin_language = await getLanguage(textStr);

    // Retrieve active AI Provider settings from DB / Environment
    const aiSettings = await getAISettings();
    const activeProvider = aiSettings.provider;
    let revisedText = textStr;

    let initialOutputUrl = "";
    let dispatched = false;

    // 1. Primary Route: KIE AI (Qwen-Image-2.1 @ $0.02/image) with Bailian Standby Failover
    if (activeProvider === 'kie' && aiSettings.kieApiKey) {
      try {
        const kieTask = await submitKieTask({
          uid,
          prompt: textStr,
          imageUrl: imageUrl || undefined,
          taskType: imageUrl ? "image_edit" : "text2image",
          model: requestedModel || "qwen2-1/text-to-image",
          apiKey: aiSettings.kieApiKey,
          baseUrl: aiSettings.kieBaseUrl,
          aspectRatio,
          size: resolvedSize,
        });

        if (kieTask?.taskId) {
          initialOutputUrl = `kie:${kieTask.taskId}`;
          await setSetting(`kie_task_${uid}`, kieTask.taskId).catch(() => {});
          dispatched = true;
        }
      } catch (kieErr: any) {
        console.warn('[KIE AI] Task dispatch failed, checking Bailian fallback:', kieErr?.message);
        if (!aiSettings.bailianApiKey) {
          throw kieErr;
        }
      }
    }

    // 2. Bailian Route (Primary if provider === 'bailian', or Fallback for KIE AI)
    if (!dispatched && aiSettings.bailianApiKey && (activeProvider === 'bailian' || activeProvider === 'kie')) {
      const bailianTask = await submitBailianTask({
        uid,
        prompt: textStr,
        imageUrl: imageUrl || undefined,
        taskType: imageUrl ? "image_edit" : "text2image",
        model: requestedModel || aiSettings.bailianModel || "wanx2.1-t2i-turbo",
        apiKey: aiSettings.bailianApiKey,
        baseUrl: aiSettings.bailianBaseUrl,
        size: resolvedSize,
      });

      if (bailianTask?.taskId) {
        initialOutputUrl = `bailian:${bailianTask.taskId}`;
      }

      await setSetting(`bailian_task_${uid}`, bailianTask.taskId).catch(() => {});
      processBailianTaskInBackground(
        uid,
        bailianTask.taskId,
        aiSettings.bailianApiKey,
        aiSettings.bailianBaseUrl
      );
      dispatched = true;
    }

    // 3. Fallback Route: Replicate (Legacy)
    if (!dispatched) {
      const replicateClient = getReplicateClient(aiSettings.replicateToken);
      let input: any;
      let predictionParams: any = {
        webhook: `${process.env.REPLICATE_WEBHOOK || process.env.NEXT_PUBLIC_SITE_URL}/api/generate/callByReplicate?uid=${uid}`,
        webhook_events_filter: ["completed"],
      };

      if (imageUrl) {
        input = await getQwenEditInput(imageUrl, textStr, checkSubscribeStatus);
        if (process.env.REPLICATE_EDIT_VERSION) {
          predictionParams.version = process.env.REPLICATE_EDIT_VERSION;
        } else {
          predictionParams.model = "qwen/qwen-image-edit";
        }
      } else {
        input = await getQwenGeneratorInput(textStr, checkSubscribeStatus, { width, height });
        if (process.env.REPLICATE_API_VERSION) {
          predictionParams.version = process.env.REPLICATE_API_VERSION;
        } else {
          predictionParams.model = "qwen/qwen-image-2.1";
        }
      }

      predictionParams.input = input;
      revisedText = input?.prompt || textStr;
      const prediction = await replicateClient.predictions.create(predictionParams);
      initialOutputUrl = prediction.id;
    }

    // Save record to database with fallback if new columns aren't migrated yet
    try {
      const db = getDb();
      try {
        await db.query(
          "insert into works(uid, input_text, output_url, is_public, status, user_id, revised_text, is_origin, origin_language, current_language, input_image_url, task_type) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)",
          [
            uid,
            textStr,
            initialOutputUrl,
            is_public,
            0,
            user_id,
            revisedText,
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
            initialOutputUrl,
            is_public,
            0,
            user_id,
            revisedText,
            true,
            origin_language,
            origin_language,
          ]
        );
      }
    } catch (dbErr) {
      console.warn("DB insert error in generate/handle:", dbErr);
    }

    // Track trial for guests or deduct credits for registered users
    if (isGuest) {
      const forwarded =
        req.headers.get("x-forwarded-for") ||
        req.headers.get("x-real-ip") ||
        req.headers.get("cf-connecting-ip");
      const clientIp = forwarded ? forwarded.split(",")[0].trim() : "127.0.0.1";
      const cleanIp = clientIp.replace(/[^a-zA-Z0-9_.-]/g, "_");
      const guestUsedCountStr = await getSetting(`guest_trial_${cleanIp}`).catch(() => "0");
      const nextCount = Number(guestUsedCountStr || 0) + 1;
      await setSetting(`guest_trial_${cleanIp}`, String(nextCount)).catch(() => {});
    }

    if (isRealUser) {
      const checkSubscribeStatus = await checkSubscribe(user_id);
      if (!checkSubscribeStatus) {
        await countDownUserTimes(user_id, creditCost).catch(() => {});
      }
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
