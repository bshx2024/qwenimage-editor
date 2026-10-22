import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { deleteUserCompletely, getUserById, getUserByEmail } from '~/servers/user';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    // 1. Authenticate user from session token
    let authenticatedEmail = '';
    let authenticatedUserId = '';

    try {
      // @ts-ignore
      const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
      if (token?.email) {
        authenticatedEmail = token.email.toLowerCase();
      }
      // @ts-ignore
      if (token?.user_id) {
        // @ts-ignore
        authenticatedUserId = token.user_id;
      }
    } catch (tokenErr) {
      console.warn('Error extracting session token:', tokenErr);
    }

    // 2. Also check request body
    let bodyUserId = '';
    let bodyEmail = '';
    try {
      const body = await request.json();
      bodyUserId = body?.userId || body?.user_id || '';
      bodyEmail = (body?.email || '').toLowerCase();
    } catch {}

    const targetUserId = authenticatedUserId || bodyUserId;
    const targetEmail = authenticatedEmail || bodyEmail;

    if (!targetUserId && !targetEmail) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Unable to verify account ownership.' },
        { status: 401 }
      );
    }

    // Security check: if user is authenticated via NextAuth, ensure they can only delete their own account
    if (authenticatedEmail && targetEmail && authenticatedEmail !== targetEmail) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: You can only delete your own account.' },
        { status: 403 }
      );
    }

    // Resolve userId if only email is known
    let finalUserId = targetUserId;
    if (!finalUserId && targetEmail) {
      const u = await getUserByEmail(targetEmail);
      finalUserId = u?.user_id || '';
    }

    if (!finalUserId && !targetEmail) {
      return NextResponse.json(
        { success: false, error: 'Account not found or already deleted.' },
        { status: 404 }
      );
    }

    // 3. Perform GDPR permanent cascade erasure
    const result = await deleteUserCompletely(finalUserId, targetEmail);

    return NextResponse.json({
      success: true,
      message: 'Your account and all associated personal data have been permanently deleted in compliance with GDPR.',
      result,
    });
  } catch (error: any) {
    console.error('Self-service delete account error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to delete account. Please try again or contact support.' },
      { status: 500 }
    );
  }
}
