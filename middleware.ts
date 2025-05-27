import { withAuth } from 'next-auth/middleware'
import { getToken } from 'next-auth/jwt'
import { NextResponse, NextRequest } from 'next/server'

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
  const token = await getToken({ req });
  if (token?.banned) {
    // Clear the session cookie to sign out
    const response = NextResponse.redirect('/');
    response.cookies.set('next-auth.session-token', '', { maxAge: 0 });
    response.cookies.set('__Secure-next-auth.session-token', '', { maxAge: 0 });
    response.cookies.set('next-auth.callback-url', '', { maxAge: 0 });
    return response;
  }
  return NextResponse.next();
}
