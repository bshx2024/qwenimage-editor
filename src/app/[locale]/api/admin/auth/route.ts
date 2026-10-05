import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
  verifyAdmin,
  generateAdminToken,
  getAdminPassword,
  getAdminEmails,
  ADMIN_COOKIE_NAME,
} from '~/libs/adminAuth';
import { getToken } from 'next-auth/jwt';

export async function GET(request: Request) {
  try {
    const auth = await verifyAdmin(request);
    return NextResponse.json({
      authenticated: auth.isAdmin,
      adminType: auth.adminType,
      identifier: auth.identifier,
    });
  } catch (err: any) {
    return NextResponse.json({ authenticated: false, error: err?.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, password } = body;

    if (action === 'login') {
      const correctPassword = getAdminPassword();
      if (!password || password !== correctPassword) {
        return NextResponse.json(
          { success: false, message: 'Incorrect administrator password.' },
          { status: 401 }
        );
      }

      const token = generateAdminToken();
      const cookieStore = cookies();
      cookieStore.set(ADMIN_COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 7 * 24 * 60 * 60, // 7 days
      });

      return NextResponse.json({
        success: true,
        adminType: 'password',
        identifier: 'Master Webmaster',
      });
    }

    if (action === 'google_verify') {
      // @ts-ignore
      const nextAuthToken = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
      const userEmail = nextAuthToken?.email?.toLowerCase();
      const allowedEmails = getAdminEmails();

      if (userEmail && allowedEmails.includes(userEmail)) {
        // Issue session token as well for smooth API persistence
        const token = generateAdminToken();
        const cookieStore = cookies();
        cookieStore.set(ADMIN_COOKIE_NAME, token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
          maxAge: 7 * 24 * 60 * 60,
        });

        return NextResponse.json({
          success: true,
          adminType: 'google',
          identifier: userEmail,
        });
      }

      return NextResponse.json(
        {
          success: false,
          message: userEmail
            ? `Google account (${userEmail}) is not in ADMIN_EMAILS whitelist.`
            : 'Google login session not detected.',
        },
        { status: 403 }
      );
    }

    if (action === 'logout') {
      const cookieStore = cookies();
      cookieStore.delete(ADMIN_COOKIE_NAME);
      return NextResponse.json({ success: true, message: 'Logged out successfully.' });
    }

    return NextResponse.json({ success: false, message: 'Unknown action.' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err?.message }, { status: 500 });
  }
}
