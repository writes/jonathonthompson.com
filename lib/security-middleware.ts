import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 100;

// In-memory rate limit store (use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Security headers
const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Content-Security-Policy': `
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live;
    style-src 'self' 'unsafe-inline';
    img-src 'self' data: https: blob:;
    font-src 'self' data:;
    connect-src 'self' https: wss: ws:;
    media-src 'self';
    object-src 'none';
    frame-src 'self';
    worker-src 'self' blob:;
    frame-ancestors 'none';
    form-action 'self';
    base-uri 'self';
    manifest-src 'self';
  `.replace(/\s+/g, ' ').trim()
};

// Protected routes configuration
const protectedRoutes = ['/league', '/admin', '/profile'];
const apiRoutes = ['/api'];
const publicApiRoutes = ['/api/auth'];

// Rate limiting function
function checkRateLimit(identifier: string): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now();
  const limit = rateLimitStore.get(identifier);

  if (!limit || now > limit.resetTime) {
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW
    });
    return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - 1, resetIn: RATE_LIMIT_WINDOW };
  }

  if (limit.count >= RATE_LIMIT_MAX_REQUESTS) {
    const resetIn = limit.resetTime - now;
    return { allowed: false, remaining: 0, resetIn };
  }

  limit.count++;
  return { 
    allowed: true, 
    remaining: RATE_LIMIT_MAX_REQUESTS - limit.count, 
    resetIn: limit.resetTime - now 
  };
}

// Clean up old rate limit entries periodically
if (typeof window === 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, value] of rateLimitStore.entries()) {
      if (now > value.resetTime) {
        rateLimitStore.delete(key);
      }
    }
  }, RATE_LIMIT_WINDOW);
}

export async function securityMiddleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Apply security headers to all responses
  const response = NextResponse.next();
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  // Get client identifier (IP or user ID)
  const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
  const token = await getToken({ req: request });
  const identifier = token?.sub || ip;

  // API rate limiting
  if (pathname.startsWith('/api')) {
    // Skip rate limiting for auth endpoints
    const isPublicApi = publicApiRoutes.some(route => pathname.startsWith(route));
    if (!isPublicApi) {
      const { allowed, remaining, resetIn } = checkRateLimit(`api:${identifier}`);
      
      response.headers.set('X-RateLimit-Limit', RATE_LIMIT_MAX_REQUESTS.toString());
      response.headers.set('X-RateLimit-Remaining', remaining.toString());
      response.headers.set('X-RateLimit-Reset', new Date(Date.now() + resetIn).toISOString());

      if (!allowed) {
        return NextResponse.json(
          { 
            error: 'Too Many Requests',
            message: 'Rate limit exceeded. Please try again later.',
            retryAfter: Math.ceil(resetIn / 1000)
          },
          { 
            status: 429,
            headers: {
              'Retry-After': Math.ceil(resetIn / 1000).toString(),
              ...Object.fromEntries(response.headers.entries())
            }
          }
        );
      }
    }
  }

  // Protected route authentication
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  
  if (isProtectedRoute) {
    if (!token) {
      const signInUrl = new URL('/auth/signin', request.url);
      signInUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(signInUrl);
    }

    // Admin route protection
    if (pathname.startsWith('/admin')) {
      const userRole = (token as any).role || 'USER';
      if (userRole !== 'ADMIN') {
        return NextResponse.redirect(new URL('/auth/unauthorized', request.url));
      }
    }
  }

  // GraphQL specific protection
  if (pathname === '/api/graphql') {
    // Get request body for complexity analysis
    const requestClone = request.clone();
    try {
      const body = await requestClone.text();
      const queryComplexity = (body.match(/{/g) || []).length;
      
      if (queryComplexity > 10) {
        const { allowed } = checkRateLimit(`graphql-complex:${identifier}`);
        
        if (!allowed) {
          return NextResponse.json(
            { 
              error: 'Query Too Complex',
              message: 'Your query is too complex. Please simplify it or wait before retrying.'
            },
            { status: 429, headers: Object.fromEntries(response.headers.entries()) }
          );
        }
      }
    } catch (error) {
      // If body parsing fails, continue with normal processing
      console.error('Failed to parse GraphQL body:', error);
    }
  }

  // CORS configuration for API routes
  if (pathname.startsWith('/api')) {
    const origin = request.headers.get('origin');
    const allowedOrigins = [
      process.env.NEXTAUTH_URL || 'http://localhost:3000',
      'https://jonathonthompson.com'
    ];

    if (origin && allowedOrigins.includes(origin)) {
      response.headers.set('Access-Control-Allow-Origin', origin);
      response.headers.set('Access-Control-Allow-Credentials', 'true');
      response.headers.set('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
      response.headers.set(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
      );
    }

    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 200, headers: response.headers });
    }
  }

  return response;
}