import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { UserRole } from "./auth-advanced";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
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

    // Add security headers
    const response = NextResponse.next();
    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("X-XSS-Protection", "1; mode=block");
    
    return response;
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
    "/league/:path*",
    "/profile/:path*",
    "/admin/:path*",
    "/moderate/:path*",
    "/api/protected/:path*",
    "/api/graphql/:path*"
  ],
};