import { NextRequest, NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

const handleI18n = createMiddleware(routing);

export default async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  // Let robots.txt, sitemaps, and static media pass through without i18n redirect
  let response;
  if (
    pathname === "/robots.txt" ||
    pathname.includes("sitemap") ||
    pathname.startsWith("/videos/") ||
    pathname.startsWith("/images/") ||
    pathname.endsWith(".mp4") ||
    pathname.endsWith(".webm") ||
    pathname.endsWith(".mov")
  ) {
    return NextResponse.next();
  } else if (pathname === "/_stats" || pathname === "/stats" || pathname === "/en/_stats") {
    // Rewrite _stats to [locale] stats page directly to pass locale validation
    const url = req.nextUrl.clone();
    url.pathname = "/en/stats";
    response = NextResponse.rewrite(url);
  } else {
    response = handleI18n(req);
  }

  // Asynchronously log bot and genuine visitor telemetry without blocking
  const userAgent = req.headers.get("user-agent") || "";
  if (
    !pathname.startsWith("/_next") &&
    !pathname.startsWith("/api") &&
    !pathname.startsWith("/_stats") &&
    !pathname.startsWith("/stats") &&
    !pathname.startsWith("/videos/") &&
    !pathname.startsWith("/images/") &&
    userAgent
  ) {
    const forwarded =
      req.headers.get("x-forwarded-for") ||
      req.headers.get("x-real-ip") ||
      req.headers.get("cf-connecting-ip");
    const ip = forwarded ? forwarded.split(",")[0].trim() : "127.0.0.1";
    const country = req.headers.get("cf-ipcountry") || (req as any).geo?.country || "Unknown";
    const referer = req.headers.get("referer") || "";

    const recordUrl = new URL("/api/admin/bot-monitor/record", req.nextUrl.origin).toString();
    fetch(recordUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pathname, userAgent, ip, referer, country }),
    }).catch(() => {});
  }

  return response;
}

export const config = {
  matcher: [
    "/",
    "/(en)/:path*",
    "/robots.txt",
    "/sitemap.xml",
    "/((?!_next|_vercel|videos|images|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|css|js|mp4|webm|mov|mp3|ogg|wav)).*)",
  ],
};
