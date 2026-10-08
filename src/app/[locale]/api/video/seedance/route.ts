import { NextRequest, NextResponse } from "next/server";

const ARK_BASE_URL = process.env.ARK_BASE_URL || "https://ark.cn-beijing.volces.com/api/v3";
const ARK_API_KEY = process.env.ARK_API_KEY;
const DEFAULT_MODEL = process.env.ARK_SEEDANCE_MODEL || "doubao-seedance-2-5";

/**
 * POST: Create video generation task with Volcengine Ark Seedance
 */
export async function POST(req: NextRequest) {
  try {
    if (!ARK_API_KEY) {
      return NextResponse.json(
        {
          error: "ARK_API_KEY_NOT_CONFIGURED",
          message: "火山方舟 ARK_API_KEY 未在 .env.local 中配置。请先配置您的 API Key。",
        },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { prompt, imageUrl, model = DEFAULT_MODEL } = body;

    if (!prompt) {
      return NextResponse.json({ error: "Missing required prompt" }, { status: 400 });
    }

    // Build content payload for Volcengine Ark Video Generation
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
      taskId: data.id || data.task_id,
      status: data.status,
      raw: data,
    });
  } catch (err: any) {
    console.error("[Seedance Route POST Exception]:", err);
    return NextResponse.json(
      { error: "INTERNAL_SERVER_ERROR", message: err.message },
      { status: 500 }
    );
  }
}

/**
 * GET: Query status of task
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

    return NextResponse.json({
      taskId,
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
