import { NextRequest, NextResponse } from 'next/server';
import {
  detectBot,
  recordBotCrawl,
  recordGenuineVisitor,
} from '~/libs/botVisitorMonitor';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { pathname, userAgent, ip, referer, country } = body;

    if (!pathname || !userAgent) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    // 1. Check if it is a search or AI crawler
    const botResult = detectBot(userAgent, pathname);
    if (botResult.isBot) {
      await recordBotCrawl(
        botResult.botType,
        ip || '127.0.0.1',
        pathname,
        userAgent,
        botResult.isContentPage
      );
      return NextResponse.json({ ok: true, type: 'bot', botType: botResult.botType });
    }

    // 2. Otherwise treat content/page visits from browsers as genuine visitors
    const isAsset =
      pathname.startsWith('/_next') ||
      pathname.startsWith('/api') ||
      pathname.includes('.') ||
      pathname === '/favicon.ico';

    if (!isAsset) {
      await recordGenuineVisitor(
        ip || '127.0.0.1',
        pathname,
        referer || '',
        userAgent,
        country || 'Unknown'
      );
      return NextResponse.json({ ok: true, type: 'visitor' });
    }

    return NextResponse.json({ ok: true, ignored: true });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
