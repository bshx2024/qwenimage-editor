/**
 * Automated Retention & Cloud Storage Cleanup Script
 * Can be run via crontab, systemd timer, or scheduled CI workflow:
 * Example cron (runs every 6 hours):
 * 0 */6 * * * node scripts/run-retention-cleanup.js >> /var/log/qwen_cleanup.log 2>&1
 */

const host = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.qwenimage-editor.com';
const secret = process.env.CRON_SECRET || process.env.ADMIN_PASSWORD || 'admin123456';

async function runCleanup() {
  console.log(`[${new Date().toISOString()}] Starting automated retention cleanup on ${host}...`);
  try {
    const res = await fetch(`${host}/api/admin/cleanup`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${secret}`,
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      console.error(`[Error] Cleanup failed with status ${res.status}:`, await res.text());
      return;
    }

    const data = await res.json();
    console.log('[Success] Cleanup stats:', JSON.stringify(data.stats, null, 2));
  } catch (err) {
    console.error('[Exception] Error executing cleanup:', err.message);
  }
}

runCleanup();
