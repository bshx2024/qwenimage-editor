import { NextResponse } from "next/server";
import { R2, r2Bucket, storageURL } from "~/libs/R2";
import { v4 as uuidv4 } from "uuid";
import { getAISettings } from "~/servers/keyValue";
import { uploadImageToKie } from "~/libs/kieai";
import { scanImageSafety } from "~/servers/contentSafety";

/**
 * Helper to moderate image URL via SeeAPI and clean up from storage if flagged
 */
async function auditAndVerifyUrl(
  publicUrl: string,
  r2Key?: string
): Promise<{ allowed: boolean; response?: NextResponse }> {
  try {
    const safety = await scanImageSafety(publicUrl);
    if (!safety.safe) {
      console.warn(`[ContentSafety] Upload blocked! Categories: ${safety.categories.join(', ')}, URL: ${publicUrl}`);

      // Delete from R2 to prevent storing NSFW/prohibited content
      if (r2Key && r2Bucket && process.env.R2_ACCOUNT_ID) {
        await R2.deleteObject({ Bucket: r2Bucket, Key: r2Key }).promise().catch((delErr) => {
          console.warn("[ContentSafety] Failed to delete blocked image from R2:", delErr);
        });
      }

      return {
        allowed: false,
        response: NextResponse.json(
          {
            error: safety.message || "The uploaded image was flagged for violating content safety policies (NSFW / prohibited content).",
            safetyBlock: true,
            categories: safety.categories,
          },
          { status: 400 }
        ),
      };
    }
  } catch (auditErr) {
    console.warn("[ContentSafety] Image moderation check error (fail-open):", auditErr);
  }

  return { allowed: true };
}

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      if (!file) {
        return NextResponse.json({ error: "No file provided" }, { status: 400 });
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const ext = file.name ? file.name.split(".").pop() || "png" : "png";
      const key = `uploads/${uuidv4()}.${ext}`;
      const mime = file.type || "image/png";

      // 1. Cloudflare R2 Upload (if configured)
      if (r2Bucket && process.env.R2_ACCOUNT_ID) {
        try {
          await R2.upload({
            Bucket: r2Bucket,
            Key: key,
            Body: buffer,
            ContentType: mime,
          }).promise();
          const publicUrl = `${storageURL}/${key}`;

          // Content Safety / NSFW Audit
          const audit = await auditAndVerifyUrl(publicUrl, key);
          if (!audit.allowed && audit.response) {
            return audit.response;
          }

          return NextResponse.json({ url: publicUrl });
        } catch (r2Err) {
          console.warn("R2 upload error, falling back:", r2Err);
        }
      }

      // 2. KIE AI Cloud Storage Upload (free public CDN URL for downstream model tasks)
      try {
        const aiSettings = await getAISettings().catch(() => null);
        if (aiSettings?.kieApiKey) {
          const base64 = buffer.toString("base64");
          const dataUrl = `data:${mime};base64,${base64}`;
          const kieUrl = await uploadImageToKie(dataUrl, aiSettings.kieApiKey);
          if (kieUrl && (kieUrl.startsWith("http://") || kieUrl.startsWith("https://"))) {
            // Content Safety / NSFW Audit
            const audit = await auditAndVerifyUrl(kieUrl);
            if (!audit.allowed && audit.response) {
              return audit.response;
            }

            return NextResponse.json({ url: kieUrl });
          }
        }
      } catch (kieErr) {
        console.warn("KIE storage upload fallback:", kieErr);
      }

      // 3. Fallback to Data URL
      const base64 = buffer.toString("base64");
      return NextResponse.json({ url: `data:${mime};base64,${base64}` });
    }

    // JSON base64 support
    let json: any = null;
    try {
      json = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON or unsupported upload format" }, { status: 400 });
    }

    if (json?.imageBase64) {
      const base64Data = json.imageBase64.replace(/^data:image\/\w+;base64,/, "");
      const buffer = Buffer.from(base64Data, "base64");
      const key = `uploads/${uuidv4()}.png`;

      if (r2Bucket && process.env.R2_ACCOUNT_ID) {
        try {
          await R2.upload({
            Bucket: r2Bucket,
            Key: key,
            Body: buffer,
            ContentType: "image/png",
          }).promise();
          const publicUrl = `${storageURL}/${key}`;

          // Content Safety / NSFW Audit
          const audit = await auditAndVerifyUrl(publicUrl, key);
          if (!audit.allowed && audit.response) {
            return audit.response;
          }

          return NextResponse.json({ url: publicUrl });
        } catch (r2Err) {
          console.warn("R2 upload error:", r2Err);
        }
      }

      try {
        const aiSettings = await getAISettings().catch(() => null);
        if (aiSettings?.kieApiKey) {
          const kieUrl = await uploadImageToKie(json.imageBase64, aiSettings.kieApiKey);
          if (kieUrl && (kieUrl.startsWith("http://") || kieUrl.startsWith("https://"))) {
            // Content Safety / NSFW Audit
            const audit = await auditAndVerifyUrl(kieUrl);
            if (!audit.allowed && audit.response) {
              return audit.response;
            }

            return NextResponse.json({ url: kieUrl });
          }
        }
      } catch (kieErr) {
        console.warn("KIE storage upload fallback:", kieErr);
      }

      return NextResponse.json({ url: json.imageBase64 });
    }

    return NextResponse.json({ error: "Unsupported upload format" }, { status: 400 });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: error?.message || "Upload failed" }, { status: 500 });
  }
}
