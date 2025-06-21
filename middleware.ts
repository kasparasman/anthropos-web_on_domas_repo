import { withAuth } from 'next-auth/middleware'
import { getToken } from 'next-auth/jwt'
import { NextResponse, NextRequest } from 'next/server'
import { logNextAuthStatus } from '@/lib/loggers/nextAuthLogger'

export default withAuth({
  callbacks: {
    authorized({ token }) {
      // If token exists but is flagged banned, treat as not authorized
      if (token?.banned) return false
      return true
    },
  },
})

export const config = {
  matcher: ['/((?!api|_next|favicon.ico).*)'], // protect all pages
}

export async function middleware(req: NextRequest) {
  // Log NextAuth session status for every request
  await logNextAuthStatus(req)
  const token = await getToken({ req });
  if (token?.banned) {
    // Clear the session cookie to sign out
    const response = NextResponse.redirect('/');
    response.cookies.set('next-auth.session-token', '', { maxAge: 0 });
    response.cookies.set('__Secure-next-auth.session-token', '', { maxAge: 0 });
    response.cookies.set('next-auth.callback-url', '', { maxAge: 0 });
    return response;
  }

  // If user is authenticated but registration not finished, redirect to /register
  if (token && (token as any).registrationStatus && (token as any).registrationStatus !== 'ACTIVE') {
    const url = req.nextUrl.clone();
    if (!url.pathname.startsWith('/register')) {
      url.pathname = '/register';
      return NextResponse.redirect(url);
    }
  }
  return NextResponse.next();
}
