import { withAuth } from 'next-auth/middleware'

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
