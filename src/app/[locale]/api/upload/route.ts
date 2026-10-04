import { NextResponse } from "next/server";
import { R2, r2Bucket, storageURL } from "~/libs/R2";
import { v4 as uuidv4 } from "uuid";

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
      const ext = file.name.split(".").pop() || "png";
      const key = `uploads/${uuidv4()}.${ext}`;

      if (r2Bucket && process.env.R2_ACCOUNT_ID) {
        try {
          await R2.upload({
            Bucket: r2Bucket,
            Key: key,
            Body: buffer,
            ContentType: file.type || "image/png",
          }).promise();
          const publicUrl = `${storageURL}/${key}`;
          return NextResponse.json({ url: publicUrl });
        } catch (r2Err) {
          console.warn("R2 upload error, falling back to base64 data url:", r2Err);
        }
      }

      // Fallback to data URL if R2 credentials are not configured yet
      const base64 = buffer.toString("base64");
      const mime = file.type || "image/png";
      return NextResponse.json({ url: `data:${mime};base64,${base64}` });
    }

    // JSON base64 support
    const json = await req.json();
    if (json.imageBase64) {
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
          return NextResponse.json({ url: `${storageURL}/${key}` });
        } catch (r2Err) {
          console.warn("R2 upload error:", r2Err);
        }
      }
      return NextResponse.json({ url: json.imageBase64 });
    }

    return NextResponse.json({ error: "Unsupported upload format" }, { status: 400 });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: error?.message || "Upload failed" }, { status: 500 });
  }
}
