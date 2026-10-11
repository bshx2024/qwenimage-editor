import { NextRequest } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

const handleI18n = createMiddleware(routing);

export default async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  // Let robots.txt and sitemap pass through without i18n redirect
  let response;
  if (pathname === "/robots.txt" || pathname.includes("sitemap")) {
    response = undefined;
  } else {
    response = handleI18n(req);
  }

  // Asynchronously log bot and genuine visitor telemetry without blocking
  const userAgent = req.headers.get("user-agent") || "";
  if (
    !pathname.startsWith("/_next") &&
    !pathname.startsWith("/api/admin/bot-monitor") &&
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
    "/((?!_next|_vercel|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|css|js)).*)",
  ],
};
