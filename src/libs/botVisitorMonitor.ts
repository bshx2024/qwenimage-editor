import dns from 'dns';
import { promisify } from 'util';
import { getDb } from './db';

const reverseDns = promisify(dns.reverse);

// In-memory cache for IP verification to prevent repeated DNS lookups
const ipVerificationCache = new Map<string, boolean>();

export interface BotDetection {
  isBot: boolean;
  botType: string;
  isContentPage: boolean;
}

export interface VisitorDetection {
  isGenuineVisitor: boolean;
  source: string;
  country: string;
}

const KNOWN_BOT_PATTERNS: { type: string; regex: RegExp; hostSuffixes?: string[] }[] = [
  { type: 'Googlebot', regex: /Googlebot/i, hostSuffixes: ['.googlebot.com', '.google.com'] },
  { type: 'OAI-SearchBot (ChatGPT 搜索索引)', regex: /OAI-SearchBot/i },
  { type: 'ChatGPT-User (ChatGPT 替用户读网页)', regex: /ChatGPT-User/i },
  { type: 'GPTBot', regex: /GPTBot/i },
  { type: 'ClaudeBot', regex: /ClaudeBot|Claude-Web|Anthropic/i },
  { type: 'Bingbot', regex: /bingbot|msnbot/i, hostSuffixes: ['.msn.com', '.bing.com'] },
  { type: 'Applebot', regex: /Applebot/i, hostSuffixes: ['.applebot.apple.com'] },
  { type: 'PerplexityBot', regex: /PerplexityBot/i },
  { type: 'Bytespider', regex: /Bytespider/i },
];

/**
 * Identify if an incoming user-agent is a targeted search/AI bot
 */
export function detectBot(userAgent: string, pathname: string): BotDetection {
  if (!userAgent) return { isBot: false, botType: '', isContentPage: false };

  const isContentPage =
    !pathname.includes('robots.txt') &&
    !pathname.includes('sitemap') &&
    !pathname.includes('indexnow') &&
    !pathname.startsWith('/api/') &&
    !pathname.includes('favicon.ico');

  for (const item of KNOWN_BOT_PATTERNS) {
    if (item.regex.test(userAgent)) {
      return {
        isBot: true,
        botType: item.type,
        isContentPage,
      };
    }
  }

  return { isBot: false, botType: '', isContentPage };
}

/**
 * Verify whether an IP actually belongs to the claimed crawler via Reverse DNS
 */
export async function verifyCrawlerIp(ip: string, botType: string): Promise<boolean> {
  // If IP is localhost or private, treat as verified for local dev/testing
  if (ip === '127.0.0.1' || ip === '::1' || ip.startsWith('192.168.') || ip.startsWith('10.')) {
    return true;
  }

  const cacheKey = `${botType}:${ip}`;
  if (ipVerificationCache.has(cacheKey)) {
    return ipVerificationCache.get(cacheKey)!;
  }

  try {
    const botConfig = KNOWN_BOT_PATTERNS.find((b) => b.type === botType);
    if (!botConfig || !botConfig.hostSuffixes) {
      // For OpenAI bots / Claude bots that don't maintain reverse PTR domains, accept by default
      ipVerificationCache.set(cacheKey, true);
      return true;
    }

    const hostnames = await reverseDns(ip).catch(() => []);
    const isValid = hostnames.some((h) =>
      botConfig.hostSuffixes!.some((suffix) => h.toLowerCase().endsWith(suffix.toLowerCase()))
    );

    ipVerificationCache.set(cacheKey, isValid);
    return isValid;
  } catch {
    ipVerificationCache.set(cacheKey, false);
    return false;
  }
}

/**
 * Categorize genuine human visitor referrer
 */
export function detectVisitorSource(referer: string): string {
  if (!referer) return '直接访问';
  const r = referer.toLowerCase();
  if (r.includes('google.') || r.includes('google-analytics')) return 'Google';
  if (r.includes('chatgpt.com') || r.includes('openai.com')) return 'ChatGPT';
  if (r.includes('bing.com')) return 'Bing';
  if (r.includes('perplexity.ai')) return 'Perplexity';
  if (r.includes('claude.ai') || r.includes('anthropic.com')) return 'Claude';
  if (r.includes('twitter.com') || r.includes('x.com')) return 'Twitter/X';
  if (r.includes('facebook.com') || r.includes('instagram.com')) return 'Meta';
  return '其他外部引荐';
}

// In-memory cache flag to prevent sending 4 DDL queries on every single request
let monitorTablesEnsured = false;
let monitorTablesPromise: Promise<void> | null = null;

/**
 * Ensure database schema exists
 */
export async function ensureMonitorTablesExist(): Promise<void> {
  if (monitorTablesEnsured) return;
  if (monitorTablesPromise) return monitorTablesPromise;

  monitorTablesPromise = (async () => {
    try {
      const db = getDb();
      await db.query(`
        CREATE TABLE IF NOT EXISTS bot_crawl_logs (
          id SERIAL PRIMARY KEY,
          bot_type VARCHAR(64) NOT NULL,
          ip VARCHAR(64) NOT NULL,
          path TEXT NOT NULL,
          user_agent TEXT,
          is_verified BOOLEAN DEFAULT FALSE,
          is_content_page BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );

        CREATE INDEX IF NOT EXISTS idx_bot_crawl_type_date ON bot_crawl_logs(bot_type, created_at);

        CREATE TABLE IF NOT EXISTS genuine_visitor_logs (
          id SERIAL PRIMARY KEY,
          source VARCHAR(64) NOT NULL,
          ip VARCHAR(64) NOT NULL,
          country VARCHAR(64) DEFAULT 'Unknown',
          landing_path TEXT NOT NULL,
          referer TEXT,
          user_agent TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );

        CREATE INDEX IF NOT EXISTS idx_genuine_visitor_source_date ON genuine_visitor_logs(source, created_at);
      `);
      monitorTablesEnsured = true;
    } catch (err) {
      console.warn('ensureMonitorTablesExist error:', err);
    } finally {
      monitorTablesPromise = null;
    }
  })();

  return monitorTablesPromise;
}

/**
 * Record a bot crawl event
 */
export async function recordBotCrawl(
  botType: string,
  ip: string,
  path: string,
  userAgent: string,
  isContentPage: boolean
): Promise<void> {
  try {
    await ensureMonitorTablesExist();
    const isVerified = await verifyCrawlerIp(ip, botType);
    const db = getDb();
    await db.query(
      `INSERT INTO bot_crawl_logs(bot_type, ip, path, user_agent, is_verified, is_content_page)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [botType, ip, path, userAgent, isVerified, isContentPage]
    );
  } catch (err) {
    console.warn('recordBotCrawl error:', err);
  }
}

/**
 * Record a genuine human visitor
 */
export async function recordGenuineVisitor(
  ip: string,
  landingPath: string,
  referer: string,
  userAgent: string,
  country: string = 'Unknown'
): Promise<void> {
  try {
    await ensureMonitorTablesExist();
    const source = detectVisitorSource(referer);
    const db = getDb();

    // Deduplicate: same IP and same source within 30 minutes counted once
    const existing = await db.query(
      `SELECT id FROM genuine_visitor_logs 
       WHERE ip = $1 AND source = $2 AND created_at > NOW() - INTERVAL '30 minutes'
       LIMIT 1`,
      [ip, source]
    );

    if (existing.rows && existing.rows.length > 0) {
      return;
    }

    await db.query(
      `INSERT INTO genuine_visitor_logs(source, ip, country, landing_path, referer, user_agent)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [source, ip, country, landingPath, referer, userAgent]
    );
  } catch (err) {
    console.warn('recordGenuineVisitor error:', err);
  }
}

/**
 * Fetch formatted reports matching the reference dashboard format (Beijing Time UTC+8)
 */
export async function getMonitorReports() {
  await ensureMonitorTablesExist();
  const db = getDb();

  // 1. Bot Crawl Logs Aggregation
  const botsToQuery = [
    'Googlebot',
    'OAI-SearchBot (ChatGPT 搜索索引)',
    'Bingbot',
    'Applebot',
    'ClaudeBot',
    'ChatGPT-User (ChatGPT 替用户读网页)',
    'GPTBot',
    'PerplexityBot',
  ];

  const botRows = [];

  for (const bot of botsToQuery) {
    // First visit (verified only)
    const firstVisitRes = await db.query(
      `SELECT created_at, path, is_content_page 
       FROM bot_crawl_logs 
       WHERE bot_type = $1 AND is_verified = TRUE 
       ORDER BY created_at ASC LIMIT 1`,
      [bot]
    );

    // First content page visit
    const firstPageRes = await db.query(
      `SELECT created_at 
       FROM bot_crawl_logs 
       WHERE bot_type = $1 AND is_verified = TRUE AND is_content_page = TRUE 
       ORDER BY created_at ASC LIMIT 1`,
      [bot]
    );

    // Daily count for past 7 days (Beijing time UTC+8)
    const dailyRes = await db.query(
      `SELECT to_char(created_at AT TIME ZONE 'Asia/Shanghai', 'MM-DD') as day_str, count(*) as count
       FROM bot_crawl_logs
       WHERE bot_type = $1 AND is_verified = TRUE AND is_content_page = TRUE
         AND created_at >= NOW() - INTERVAL '7 days'
       GROUP BY day_str
       ORDER BY day_str ASC`,
      [bot]
    );

    const firstVisit = firstVisitRes.rows[0];
    const firstPage = firstPageRes.rows[0];

    let firstTimeStr = '还没有';
    if (firstVisit) {
      const dt = new Date(firstVisit.created_at);
      const bjDate = new Date(dt.getTime() + 8 * 3600 * 1000);
      const mm = String(bjDate.getUTCMonth() + 1).padStart(2, '0');
      const dd = String(bjDate.getUTCDate()).padStart(2, '0');
      const hh = String(bjDate.getUTCHours()).padStart(2, '0');
      const min = String(bjDate.getUTCMinutes()).padStart(2, '0');
      firstTimeStr = `${mm}-${dd} ${hh}:${min}`;
      if (!firstVisit.is_content_page) {
        if (firstVisit.path.includes('robots')) firstTimeStr += ' (只读 robots.txt)';
        else if (firstVisit.path.includes('sitemap')) firstTimeStr += ' (只读 sitemap)';
        else if (firstVisit.path.includes('indexnow')) firstTimeStr += ' (只读 IndexNow key 文件)';
      }
    }

    let firstPageStr = '还没有';
    if (firstPage) {
      if (firstVisit && firstVisit.is_content_page) {
        firstPageStr = '同时';
      } else {
        const dt = new Date(firstPage.created_at);
        const bjDate = new Date(dt.getTime() + 8 * 3600 * 1000);
        const mm = String(bjDate.getUTCMonth() + 1).padStart(2, '0');
        const dd = String(bjDate.getUTCDate()).padStart(2, '0');
        const hh = String(bjDate.getUTCHours()).padStart(2, '0');
        const min = String(bjDate.getUTCMinutes()).padStart(2, '0');
        firstPageStr = `${mm}-${dd} ${hh}:${min}`;
      }
    }

    const dailySummary =
      dailyRes.rows.length > 0
        ? dailyRes.rows.map((r: any) => `${r.day_str}: ${r.count}`).join(', ')
        : '0';

    botRows.push({
      botName: bot,
      firstVisit: firstTimeStr,
      firstPage: firstPageStr,
      dailySummary,
    });
  }

  // 2. Genuine Human Visitors Aggregation
  const sourcesToQuery = ['Google', 'ChatGPT', '直接访问', 'Bing', 'Perplexity'];
  const visitorRows = [];

  for (const src of sourcesToQuery) {
    const firstVisitorRes = await db.query(
      `SELECT created_at, country, landing_path 
       FROM genuine_visitor_logs 
       WHERE source = $1 
       ORDER BY created_at ASC LIMIT 1`,
      [src]
    );

    const dailyRes = await db.query(
      `SELECT to_char(created_at AT TIME ZONE 'Asia/Shanghai', 'MM-DD') as day_str, count(*) as count
       FROM genuine_visitor_logs
       WHERE source = $1 AND created_at >= NOW() - INTERVAL '7 days'
       GROUP BY day_str
       ORDER BY day_str ASC`,
      [src]
    );

    const firstV = firstVisitorRes.rows[0];
    let firstVisitorStr = '还没有';
    if (firstV) {
      const dt = new Date(firstV.created_at);
      const bjDate = new Date(dt.getTime() + 8 * 3600 * 1000);
      const mm = String(bjDate.getUTCMonth() + 1).padStart(2, '0');
      const dd = String(bjDate.getUTCDate()).padStart(2, '0');
      const hh = String(bjDate.getUTCHours()).padStart(2, '0');
      const min = String(bjDate.getUTCMinutes()).padStart(2, '0');
      firstVisitorStr = `${mm}-${dd} ${hh}:${min} (${firstV.country || '海外'}, ${firstV.landing_path === '/' ? '首页' : firstV.landing_path})`;
    }

    const dailySummary =
      dailyRes.rows.length > 0
        ? dailyRes.rows.map((r: any) => `${r.day_str}: ${r.count}`).join(' / ')
        : '—';

    visitorRows.push({
      source: src,
      firstVisitor: firstVisitorStr,
      dailySummary,
    });
  }

  return {
    botRows,
    visitorRows,
  };
}
