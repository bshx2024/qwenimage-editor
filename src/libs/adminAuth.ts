import crypto from 'crypto';
import { getToken } from 'next-auth/jwt';
import { cookies } from 'next/headers';

const ADMIN_COOKIE_NAME = 'qwen_admin_session';
const SECRET_SALT = process.env.NEXTAUTH_SECRET || 'qwen-image-editor-admin-secret-salt-2026';

export function getAdminPassword(): string {
  return process.env.ADMIN_PASSWORD || 'admin123456';
}

export function getAdminEmails(): string[] {
  const envEmails = process.env.ADMIN_EMAILS || '';
  return envEmails
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

/**
 * Generate a signed session token for master password authentication
 */
export function generateAdminToken(): string {
  const currentPassword = getAdminPassword();
  const timestamp = Date.now().toString();
  const signature = crypto
    .createHmac('sha256', SECRET_SALT)
    .update(`${currentPassword}:${timestamp}`)
    .digest('hex');
  return `${timestamp}.${signature}`;
}

/**
 * Verify if the signed token matches current admin password and hasn't expired (7 days)
 */
export function verifyAdminToken(token: string | null | undefined): boolean {
  if (!token) return false;
  const parts = token.split('.');
  if (parts.length !== 2) return false;

  const [timestampStr, providedSignature] = parts;
  const timestamp = parseInt(timestampStr, 10);
  if (isNaN(timestamp)) return false;

  // Expire after 7 days
  const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
  if (Date.now() - timestamp > SEVEN_DAYS_MS || Date.now() < timestamp - 60000) {
    return false;
  }

  const currentPassword = getAdminPassword();
  const expectedSignature = crypto
    .createHmac('sha256', SECRET_SALT)
    .update(`${currentPassword}:${timestampStr}`)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(providedSignature),
    Buffer.from(expectedSignature)
  );
}

export interface AdminAuthResult {
  isAdmin: boolean;
  adminType: 'password' | 'google' | null;
  identifier?: string;
}

/**
 * Comprehensive dual-auth validator:
 * 1. Checks Master Password session cookie (`qwen_admin_session`)
 * 2. Checks Google OAuth session token against ADMIN_EMAILS whitelist
 */
export async function verifyAdmin(request?: Request): Promise<AdminAuthResult> {
  // 1. Check Cookie first
  const cookieStore = cookies();
  const sessionCookie = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  if (sessionCookie && verifyAdminToken(sessionCookie)) {
    return {
      isAdmin: true,
      adminType: 'password',
      identifier: 'Master Webmaster',
    };
  }

  // 2. Check NextAuth Google Session
  try {
    if (request) {
      // @ts-ignore
      const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
      const userEmail = token?.email?.toLowerCase();
      if (userEmail) {
        const allowedEmails = getAdminEmails();
        if (allowedEmails.includes(userEmail)) {
          return {
            isAdmin: true,
            adminType: 'google',
            identifier: userEmail,
          };
        }
      }
    }
  } catch (err) {
    console.warn('Error reading NextAuth token for admin verification:', err);
  }

  return {
    isAdmin: false,
    adminType: null,
  };
}

export { ADMIN_COOKIE_NAME };
