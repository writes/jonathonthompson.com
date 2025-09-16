import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-advanced';
import { getAPIRateLimiter } from '@/lib/services/rate-limiter';
import { getGraphQLCache } from '@/lib/services/cache';
import { getLeaderboardService } from '@/lib/services/leaderboard';

// Initialize services
const rateLimiter = getAPIRateLimiter();
const cache = getGraphQLCache();
const leaderboard = getLeaderboardService();

export async function GET(request: NextRequest) {
  try {
    // Get session
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check rate limit
    const rateLimit = await rateLimiter.checkGraphQLLimit(session.user.id, 1);
    
    // Set rate limit headers
    const headers = new Headers({
      'X-RateLimit-Limit': String(rateLimit.limit),
      'X-RateLimit-Remaining': String(rateLimit.remaining),
      'X-RateLimit-Reset': rateLimit.resetAt.toISOString(),
    });

    if (!rateLimit.allowed) {
      headers.set('Retry-After', String(rateLimit.retryAfter));
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded',
          message: `Please try again in ${rateLimit.retryAfter} seconds`,
          retryAfter: rateLimit.retryAfter
        },
        { status: 429, headers }
      );
    }

    // Get region from query params
    const { searchParams } = new URL(request.url);
    const region = searchParams.get('region') || 'NA1';

    // Try to get from cache first
    const cacheKey = `api:league-stats:${region}`;
    const cached = await cache.get(cacheKey);
    if (cached) {
      return NextResponse.json(cached, { headers });
    }

    // Connect services if needed
    await Promise.all([
      cache.connect(),
      leaderboard.connect()
    ]);

    // Get data from services
    const [topPlayers, regionalStats] = await Promise.all([
      leaderboard.getTopPlayers(region, 10),
      leaderboard.getRegionalStats(region)
    ]);

    const response = {
      region,
      timestamp: new Date().toISOString(),
      topPlayers,
      stats: regionalStats,
      user: {
        id: session.user.id,
        name: session.user.name,
        role: (session.user as any).role
      }
    };

    // Cache the response
    await cache.set(cacheKey, response, { ttl: 300 }); // 5 minutes

    return NextResponse.json(response, { headers });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get session
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is admin
    if ((session.user as any).role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden', message: 'Admin access required' },
        { status: 403 }
      );
    }

    // Check rate limit
    const rateLimit = await rateLimiter.checkGraphQLLimit(session.user.id, 5);
    
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded',
          retryAfter: rateLimit.retryAfter
        },
        { 
          status: 429,
          headers: {
            'Retry-After': String(rateLimit.retryAfter),
            'X-RateLimit-Limit': String(rateLimit.limit),
            'X-RateLimit-Remaining': String(rateLimit.remaining),
            'X-RateLimit-Reset': rateLimit.resetAt.toISOString(),
          }
        }
      );
    }

    // Parse request body
    const body = await request.json();
    const { action, region, data } = body;

    // Connect services
    await Promise.all([
      cache.connect(),
      leaderboard.connect()
    ]);

    let result;

    switch (action) {
      case 'clearCache':
        await cache.clearByPattern(`*:${region}:*`);
        result = { message: 'Cache cleared successfully' };
        break;

      case 'clearLeaderboard':
        await leaderboard.clearLeaderboard(region);
        result = { message: 'Leaderboard cleared successfully' };
        break;

      case 'updatePlayer':
        if (!data) {
          return NextResponse.json(
            { error: 'Missing player data' },
            { status: 400 }
          );
        }
        const update = await leaderboard.updatePlayer(region, data);
        result = { message: 'Player updated', update };
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      ...result,
      timestamp: new Date().toISOString(),
      user: session.user.name
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}