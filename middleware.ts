import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "next-auth/middleware";
import { UserRole } from "./lib/auth-simple";
import { securityMiddleware } from "./lib/security-middleware";

// Combine auth and security middleware
export default withAuth(
  async function middleware(req: NextRequest) {
    // Apply security middleware first
    const securityResponse = await securityMiddleware(req);
    if (securityResponse.status !== 200) {
      return securityResponse;
    }

    const token = (req as any).nextauth?.token;
    const path = req.nextUrl.pathname;

    // Admin routes
    if (path.startsWith("/admin")) {
      if (token?.role !== UserRole.ADMIN) {
        return NextResponse.redirect(new URL("/auth/unauthorized", req.url));
      }
    }

    // Moderator routes
    if (path.startsWith("/moderate")) {
      if (![UserRole.ADMIN, UserRole.MODERATOR].includes(token?.role as UserRole)) {
        return NextResponse.redirect(new URL("/auth/unauthorized", req.url));
      }
    }

    // API protection
    if (path.startsWith("/api/protected")) {
      if (!token) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    // Apply security headers from security middleware
    return securityResponse;
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname;
        
        // Public routes
        if (path.startsWith("/auth")) return true;
        if (path === "/" || path.startsWith("/#")) return true;
        
        // Protected routes require authentication
        if (path.startsWith("/league") || 
            path.startsWith("/profile") ||
            path.startsWith("/admin") ||
            path.startsWith("/api/protected")) {
          return !!token;
        }
        
        return true;
      },
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.gif|.*\\.svg).*)',
  ],
};