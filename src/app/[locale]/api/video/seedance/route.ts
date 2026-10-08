import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { getDb } from "~/libs/db";
import { checkUserTimes, countDownUserTimes, refundUserTimes, markWorkFailedAndRefund } from "~/servers/manageUserTimes";
import { checkSubscribe } from "~/servers/subscribe";

const ARK_BASE_URL = process.env.ARK_BASE_URL || "https://ark.cn-beijing.volces.com/api/v3";
const ARK_API_KEY = process.env.ARK_API_KEY;
const DEFAULT_MODEL = process.env.ARK_SEEDANCE_MODEL || "doubao-seedance-2-5";

const RESOLUTION_CREDIT_MAP: Record<string, number> = {
  "480p": 20,
  "720p": 50,
  "1080p": 90,
};

/**
 * POST: Create video generation task with Volcengine Ark Seedance & Deduct Credits
 */
export async function POST(req: NextRequest) {
  let deductedUserId: string | null = null;
  let creditCost = 50;
  let workUid: string = uuidv4();
  let isSubscribed = false;

  try {
    const body = await req.json();
    const {
      prompt,
      imageUrl,
      resolution = "720p",
      userId,
      model = DEFAULT_MODEL,
    } = body;

    if (!prompt) {
      return NextResponse.json({ error: "Missing required prompt" }, { status: 400 });
    }

    creditCost = RESOLUTION_CREDIT_MAP[resolution] || 50;

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
            message: `Rendering ${resolution} video requires ${creditCost} credits. Please top up your balance.`,
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
        [workUid, prompt, "", 1, 0, userId, resolution, 1, "en", "en", imageUrl || "", "video_seedance_2_5"]
      );
    } catch (dbErr: any) {
      console.warn("Works DB insert notice:", dbErr?.message);
    }

    // 3. Check ARK_API_KEY
    if (!ARK_API_KEY) {
      // Refund credits if server environment is not configured
      if (deductedUserId && !isSubscribed) {
        await refundUserTimes(deductedUserId, creditCost);
      }
      return NextResponse.json(
        {
          error: "ARK_API_KEY_NOT_CONFIGURED",
          message: "火山方舟 ARK_API_KEY 未在 .env.local 中配置。请先在服务器环境变量中填入密钥。",
        },
        { status: 400 }
      );
    }

    // 4. Build content payload for Volcengine Ark Video Generation
    const contentPayload: Array<{ type: string; text?: string; image_url?: { url: string } }> = [
      {
        type: "text",
        text: prompt,
      },
    ];

    if (imageUrl) {
      contentPayload.push({
        type: "image_url",
        image_url: {
          url: imageUrl,
        },
      });
    }

    const arkResponse = await fetch(`${ARK_BASE_URL}/contents/generations/tasks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${ARK_API_KEY}`,
      },
      body: JSON.stringify({
        model,
        content: contentPayload,
      }),
    });

    if (!arkResponse.ok) {
      const errText = await arkResponse.text();
      console.error("[Volcengine Ark Seedance Error]:", arkResponse.status, errText);

      // Refund deducted credits on API failure
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
    return NextResponse.json({
      success: true,
      uid: workUid,
      taskId: data.id || data.task_id,
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
    if (!ARK_API_KEY) {
      return NextResponse.json(
        {
          error: "ARK_API_KEY_NOT_CONFIGURED",
          message: "火山方舟 ARK_API_KEY 未在 .env.local 中配置。",
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

    const arkResponse = await fetch(`${ARK_BASE_URL}/contents/generations/tasks/${taskId}`, {
      headers: {
        Authorization: `Bearer ${ARK_API_KEY}`,
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
