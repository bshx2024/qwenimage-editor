import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { getDb } from "~/libs/db";
import { checkUserTimes, countDownUserTimes, refundUserTimes, markWorkFailedAndRefund } from "~/servers/manageUserTimes";
import { checkSubscribe } from "~/servers/subscribe";

/**
 * Dynamically resolves Ark API Key and configuration with multi-layer fallbacks
 */
function getArkConfig() {
  let apiKey = process.env.ARK_API_KEY;
  let baseUrl = process.env.ARK_BASE_URL || "https://ark.cn-beijing.volces.com/api/v3";
  let model = process.env.ARK_SEEDANCE_MODEL || "doubao-seedance-2-5-260628";

  // Dynamic fallback 1: read directly from .env.local if local Node process was started before file edit
  if (!apiKey && typeof process !== "undefined") {
    try {
      const fs = require("fs");
      const path = require("path");
      const envLocal = path.join(process.cwd(), ".env.local");
      if (fs.existsSync(envLocal)) {
        const text = fs.readFileSync(envLocal, "utf8");
        const keyMatch = text.match(/^\s*ARK_API_KEY\s*=\s*(.+)$/m);
        if (keyMatch && keyMatch[1]) apiKey = keyMatch[1].trim();
        const baseMatch = text.match(/^\s*ARK_BASE_URL\s*=\s*(.+)$/m);
        if (baseMatch && baseMatch[1]) baseUrl = baseMatch[1].trim();
        const modelMatch = text.match(/^\s*ARK_SEEDANCE_MODEL\s*=\s*(.+)$/m);
        if (modelMatch && modelMatch[1]) model = modelMatch[1].trim();
      }
    } catch (e) {}
  }

  // Support alternative environment variable names
  if (!apiKey) {
    apiKey = process.env.VOLCENGINE_ARK_API_KEY || process.env.NEXT_PUBLIC_ARK_API_KEY;
  }

  if (model === "doubao-seedance-2-5") {
    model = "doubao-seedance-2-5-260628";
  } else if (model === "doubao-seedance-2-0") {
    model = "doubao-seedance-2-0-260128";
  }

  return { apiKey, baseUrl, model };
}

/**
 * POST: Create video generation task with Volcengine Ark Seedance & Deduct Credits
 */
export async function POST(req: NextRequest) {
  let deductedUserId: string | null = null;
  let creditCost = 50;
  let workUid: string = uuidv4();
  let isSubscribed = false;

  try {
    const arkConfig = getArkConfig();
    const body = await req.json();
    let {
      prompt,
      imageUrl,
      videoUrl,
      duration = 5,
      resolution = "720p",
      userId,
      model = arkConfig.model,
    } = body;

    // Resolve short aliases to official full Ark model version IDs
    if (model === "doubao-seedance-2-5") {
      model = "doubao-seedance-2-5-260628";
    } else if (model === "doubao-seedance-2-0") {
      model = "doubao-seedance-2-0-260128";
    }

    if (!prompt) {
      return NextResponse.json({ error: "Missing required prompt" }, { status: 400 });
    }

    const durSec = Number(duration) === 10 ? 10 : 5;
    const isMotionMimic = Boolean(videoUrl);

    // Tiered credit cost calculation
    if (isMotionMimic) {
      if (durSec === 10) {
        creditCost = resolution === "1080p" ? 240 : resolution === "480p" ? 140 : 180;
      } else {
        creditCost = resolution === "1080p" ? 140 : resolution === "480p" ? 70 : 100;
      }
    } else {
      if (durSec === 10) {
        creditCost = resolution === "1080p" ? 160 : resolution === "480p" ? 40 : 90;
      } else {
        creditCost = resolution === "1080p" ? 90 : resolution === "480p" ? 20 : 50;
      }
    }

    // 1. Check Authentication & User Credits (Anti-Abuse Guard)
    if (!userId || userId === "guest" || userId === "undefined") {
      return NextResponse.json(
        {
          error: "LOGIN_REQUIRED",
          status: 601,
          message: "Please sign in to generate cinematic AI videos with Seedance 2.5.",
        },
        { status: 401 }
      );
    }

    isSubscribed = await checkSubscribe(userId).catch(() => false);

    if (!isSubscribed) {
      const hasEnoughCredits = await checkUserTimes(userId, creditCost);
      if (!hasEnoughCredits) {
        return NextResponse.json(
          {
            error: "INSUFFICIENT_CREDITS",
            status: 602,
            creditCost,
            message: `Rendering ${durSec}s ${resolution} video requires ${creditCost} credits. Please top up your balance.`,
          },
          { status: 402 }
        );
      }

      // Deduct credits
      await countDownUserTimes(userId, creditCost);
      deductedUserId = userId;
    }

    // 2. Insert record into works DB
    try {
      const db = getDb();
      await db.query(
        `INSERT INTO works (uid, input_text, output_url, is_public, status, user_id, revised_text, is_origin, origin_language, current_language, input_image_url, task_type)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
        [workUid, prompt, "", 1, 0, userId, resolution, 1, "en", "en", imageUrl || "", isMotionMimic ? "video_motion_mimic" : "video_seedance_2_5"]
      );
    } catch (dbErr: any) {
      console.warn("Works DB insert notice:", dbErr?.message);
    }

    // 3. Check ARK_API_KEY
    if (!arkConfig.apiKey) {
      // Refund credits if server environment is not configured
      if (deductedUserId && !isSubscribed) {
        await refundUserTimes(deductedUserId, creditCost);
      }
      return NextResponse.json(
        {
          error: "ARK_API_KEY_NOT_CONFIGURED",
          message: "火山方舟 ARK_API_KEY 未在 .env.local 或 Vercel 环境变量中配置。请先配置密钥。",
        },
        { status: 400 }
      );
    }

    // 4. Resolve Image-to-Video input asset (ensure accessible public HTTPS URL for Volcengine Ark)
    let finalImageUrl = imageUrl;
    if (imageUrl) {
      if (imageUrl.startsWith("/")) {
        finalImageUrl = `https://www.qwenimage-editor.com${imageUrl}`;
      } else if (imageUrl.includes("localhost") || imageUrl.includes("127.0.0.1")) {
        try {
          const parsed = new URL(imageUrl);
          finalImageUrl = `https://www.qwenimage-editor.com${parsed.pathname}`;
        } catch {
          finalImageUrl = imageUrl;
        }
      }
    }

    // Build content payload for Volcengine Ark Video Generation
    const contentPayload: Array<{
      type: string;
      text?: string;
      image_url?: { url: string };
      video_url?: { url: string };
    }> = [
      {
        type: "text",
        text: prompt,
      },
    ];

    if (finalImageUrl) {
      contentPayload.push({
        type: "image_url",
        image_url: {
          url: finalImageUrl,
        },
      });
    }

    if (videoUrl) {
      contentPayload.push({
        type: "video_url",
        video_url: {
          url: videoUrl,
        },
      });
    }

    let arkResponse = await fetch(`${arkConfig.baseUrl}/contents/generations/tasks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${arkConfig.apiKey}`,
      },
      body: JSON.stringify({
        model,
        content: contentPayload,
        duration: durSec,
      }),
    });

    // If Ark flags real person face privacy on the input image, gracefully fall back to full prompt T2V
    if (!arkResponse.ok && finalImageUrl) {
      const initialErr = await arkResponse.text();
      if (initialErr.includes("SensitiveContentDetected") || initialErr.includes("real person")) {
        console.warn("[Ark Seedance Note] Privacy filter flagged input image, falling back to pure text-to-video generation...");
        arkResponse = await fetch(`${arkConfig.baseUrl}/contents/generations/tasks`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${arkConfig.apiKey}`,
          },
          body: JSON.stringify({
            model,
            content: [{ type: "text", text: prompt }],
            duration: durSec,
          }),
        });
      } else {
        console.error("[Volcengine Ark Seedance Error]:", arkResponse.status, initialErr);
        if (deductedUserId && !isSubscribed) {
          await refundUserTimes(deductedUserId, creditCost);
        }
        await markWorkFailedAndRefund(workUid, `Ark API error: ${initialErr}`, creditCost);
        return NextResponse.json(
          { error: "ARK_API_REQUEST_FAILED", status: arkResponse.status, details: initialErr },
          { status: arkResponse.status }
        );
      }
    }

    if (!arkResponse.ok) {
      const errText = await arkResponse.text();
      console.error("[Volcengine Ark Seedance Error]:", arkResponse.status, errText);
      if (deductedUserId && !isSubscribed) {
        await refundUserTimes(deductedUserId, creditCost);
      }
      await markWorkFailedAndRefund(workUid, `Ark API error: ${errText}`, creditCost);
      return NextResponse.json(
        {
          error: "ARK_API_REQUEST_FAILED",
          status: arkResponse.status,
          details: errText,
        },
        { status: arkResponse.status }
      );
    }

    const data = await arkResponse.json();
    const taskId = data.id || data.task_id;

    // Persist ark task reference to works record so gallery /my can poll status
    if (taskId && workUid) {
      try {
        const db = getDb();
        await db.query(
          "UPDATE works SET output_url = $1 WHERE uid = $2",
          [`ark:${taskId}`, workUid]
        );
      } catch (dbUpdateErr: any) {
        console.warn("Could not save ark task id to works:", dbUpdateErr?.message);
      }
    }

    return NextResponse.json({
      success: true,
      uid: workUid,
      taskId: taskId,
      status: data.status,
      creditCost,
      raw: data,
    });
  } catch (err: any) {
    console.error("[Seedance Route POST Exception]:", err);
    if (deductedUserId && !isSubscribed) {
      await refundUserTimes(deductedUserId, creditCost);
    }
    return NextResponse.json(
      { error: "INTERNAL_SERVER_ERROR", message: err.message },
      { status: 500 }
    );
  }
}

/**
 * GET: Query status of task & sync DB
 */
export async function GET(req: NextRequest) {
  try {
    const arkConfig = getArkConfig();
    if (!arkConfig.apiKey) {
      return NextResponse.json(
        {
          error: "ARK_API_KEY_NOT_CONFIGURED",
          message: "火山方舟 ARK_API_KEY 未配置。",
        },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(req.url);
    const taskId = searchParams.get("taskId");
    const uid = searchParams.get("uid");
    const creditCost = Number(searchParams.get("creditCost") || 50);

    if (!taskId) {
      return NextResponse.json({ error: "Missing taskId parameter" }, { status: 400 });
    }

    const arkResponse = await fetch(`${arkConfig.baseUrl}/contents/generations/tasks/${taskId}`, {
      headers: {
        Authorization: `Bearer ${arkConfig.apiKey}`,
      },
    });

    if (!arkResponse.ok) {
      const errText = await arkResponse.text();
      return NextResponse.json(
        { error: "ARK_QUERY_FAILED", details: errText },
        { status: arkResponse.status }
      );
    }

    const data = await arkResponse.json();
    const status = data.status; // pending, running, succeeded, failed
    const videoUrl = data.content?.video_url || data.output?.video_url;

    // Synchronize status with database works table
    if (uid) {
      try {
        const db = getDb();
        if (status === "succeeded" && videoUrl) {
          await db.query(
            "UPDATE works SET status = 1, output_url = $1, updated_at = NOW() WHERE uid = $2",
            [videoUrl, uid]
          );
        } else if (status === "failed") {
          const failMsg = data.error?.message || "Task failed on Ark Seedance engine";
          await markWorkFailedAndRefund(uid, failMsg, creditCost);
        }
      } catch (dbErr: any) {
        console.warn("Works status update notice:", dbErr?.message);
      }
    }

    return NextResponse.json({
      taskId,
      uid,
      status,
      videoUrl,
      raw: data,
    });
  } catch (err: any) {
    console.error("[Seedance Route GET Exception]:", err);
    return NextResponse.json(
      { error: "INTERNAL_SERVER_ERROR", message: err.message },
      { status: 500 }
    );
  }
}
