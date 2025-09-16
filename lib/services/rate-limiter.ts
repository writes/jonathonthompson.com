import { getRedisService } from '@/lib/redis/client';

interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds
  max: number; // Maximum requests in window
  keyPrefix?: string; // Custom key prefix
  skipSuccessfulRequests?: boolean; // Don't count successful requests
  skipFailedRequests?: boolean; // Don't count failed requests
}

interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAt: Date;
  retryAfter?: number;
}

export class RateLimiterService {
  private redis = getRedisService();
  private readonly DEFAULT_WINDOW_MS = 60000; // 1 minute
  private readonly DEFAULT_MAX_REQUESTS = 100;

  async connect() {
    await this.redis.connect();
  }

  // Check rate limit using sliding window algorithm
  async checkLimit(
    identifier: string,
    options: RateLimitOptions
  ): Promise<RateLimitResult> {
    const windowMs = options.windowMs || this.DEFAULT_WINDOW_MS;
    const max = options.max || this.DEFAULT_MAX_REQUESTS;
    const keyPrefix = options.keyPrefix || 'ratelimit:';
    const key = `${keyPrefix}${identifier}`;

    const now = Date.now();
    const windowStart = now - windowMs;

    // Remove old entries
    await this.redis.getClient().zRemRangeByScore(key, '-inf', windowStart.toString());

    // Count current requests in window
    const currentCount = await this.redis.zCard(key);

    if (currentCount >= max) {
      // Get oldest request time to calculate retry after
      const oldestRequests = await this.redis.zRange(key, 0, 0, true) as { value: string; score: number }[];
      const oldestTime = oldestRequests[0]?.score || now;
      const resetAt = new Date(oldestTime + windowMs);
      const retryAfter = Math.ceil((oldestTime + windowMs - now) / 1000);

      return {
        allowed: false,
        limit: max,
        remaining: 0,
        resetAt,
        retryAfter
      };
    }

    // Add current request
    await this.redis.zAdd(key, now, `${now}-${Math.random()}`);
    await this.redis.expire(key, Math.ceil(windowMs / 1000));

    const remaining = max - currentCount - 1;
    const resetAt = new Date(now + windowMs);

    return {
      allowed: true,
      limit: max,
      remaining: Math.max(0, remaining),
      resetAt
    };
  }

  // Reset rate limit for identifier
  async reset(identifier: string, keyPrefix?: string): Promise<void> {
    const prefix = keyPrefix || 'ratelimit:';
    const key = `${prefix}${identifier}`;
    await this.redis.del(key);
  }

  // Get current usage for identifier
  async getUsage(
    identifier: string,
    windowMs: number,
    keyPrefix?: string
  ): Promise<{ count: number; oldestRequest: Date | null }> {
    const prefix = keyPrefix || 'ratelimit:';
    const key = `${prefix}${identifier}`;
    const now = Date.now();
    const windowStart = now - windowMs;

    // Remove old entries
    await this.redis.getClient().zRemRangeByScore(key, '-inf', windowStart.toString());

    const count = await this.redis.zCard(key);
    
    if (count === 0) {
      return { count: 0, oldestRequest: null };
    }

    const oldestRequests = await this.redis.zRange(key, 0, 0, true) as { value: string; score: number }[];
    const oldestRequest = oldestRequests[0] ? new Date(oldestRequests[0].score) : null;

    return { count, oldestRequest };
  }

  // Create middleware for Express/Next.js API routes
  createMiddleware(options: RateLimitOptions) {
    return async (req: any, res: any, next: any) => {
      const identifier = this.getIdentifier(req);
      const result = await this.checkLimit(identifier, options);

      // Set rate limit headers
      res.setHeader('X-RateLimit-Limit', result.limit);
      res.setHeader('X-RateLimit-Remaining', result.remaining);
      res.setHeader('X-RateLimit-Reset', result.resetAt.toISOString());

      if (!result.allowed) {
        res.setHeader('Retry-After', result.retryAfter!);
        return res.status(429).json({
          error: 'Too Many Requests',
          message: `Rate limit exceeded. Try again in ${result.retryAfter} seconds.`,
          retryAfter: result.retryAfter,
          resetAt: result.resetAt
        });
      }

      // Track response status for conditional counting
      if (options.skipSuccessfulRequests || options.skipFailedRequests) {
        const originalSend = res.send;
        res.send = function(data: any) {
          const shouldSkip = 
            (options.skipSuccessfulRequests && res.statusCode < 400) ||
            (options.skipFailedRequests && res.statusCode >= 400);
          
          if (shouldSkip) {
            // Remove the request we just added
            const key = `${options.keyPrefix || 'ratelimit:'}${identifier}`;
            redis.getClient().zRemRangeByScore(key, Date.now().toString(), Date.now().toString());
          }
          
          return originalSend.call(this, data);
        };
      }

      next();
    };
  }

  // Get identifier from request (IP or user ID)
  private getIdentifier(req: any): string {
    // Try to get user ID from session
    if (req.session?.user?.id) {
      return `user:${req.session.user.id}`;
    }

    // Fall back to IP address
    const ip = req.headers['x-forwarded-for'] || 
                req.headers['x-real-ip'] || 
                req.connection?.remoteAddress ||
                req.socket?.remoteAddress ||
                'unknown';
    
    return `ip:${ip}`;
  }
}

// Specific rate limiters for different endpoints
export class APIRateLimiter {
  private rateLimiter = new RateLimiterService();

  // Rate limit for Riot API calls
  async checkRiotAPILimit(apiKey: string): Promise<RateLimitResult> {
    return await this.rateLimiter.checkLimit(apiKey, {
      windowMs: 120000, // 2 minutes
      max: 100, // Riot development key limit
      keyPrefix: 'riot:api:'
    });
  }

  // Rate limit for GraphQL queries
  async checkGraphQLLimit(userId: string, complexity: number = 1): Promise<RateLimitResult> {
    // Adjust max based on query complexity
    const baseMax = 1000;
    const adjustedMax = Math.floor(baseMax / complexity);
    
    return await this.rateLimiter.checkLimit(userId, {
      windowMs: 60000, // 1 minute
      max: adjustedMax,
      keyPrefix: 'graphql:'
    });
  }

  // Rate limit for authentication attempts
  async checkAuthLimit(identifier: string): Promise<RateLimitResult> {
    return await this.rateLimiter.checkLimit(identifier, {
      windowMs: 900000, // 15 minutes
      max: 5, // 5 attempts per 15 minutes
      keyPrefix: 'auth:attempt:',
      skipSuccessfulRequests: true
    });
  }

  // Rate limit for WebSocket connections
  async checkWebSocketLimit(ip: string): Promise<RateLimitResult> {
    return await this.rateLimiter.checkLimit(ip, {
      windowMs: 60000, // 1 minute
      max: 10, // 10 new connections per minute
      keyPrefix: 'ws:connect:'
    });
  }

  // Rate limit for tournament creation
  async checkTournamentLimit(userId: string): Promise<RateLimitResult> {
    return await this.rateLimiter.checkLimit(userId, {
      windowMs: 86400000, // 24 hours
      max: 5, // 5 tournaments per day
      keyPrefix: 'tournament:create:'
    });
  }
}

// Singleton instances
let rateLimiterService: RateLimiterService | null = null;
let apiRateLimiter: APIRateLimiter | null = null;

export function getRateLimiterService(): RateLimiterService {
  if (!rateLimiterService) {
    rateLimiterService = new RateLimiterService();
  }
  return rateLimiterService;
}

export function getAPIRateLimiter(): APIRateLimiter {
  if (!apiRateLimiter) {
    apiRateLimiter = new APIRateLimiter();
  }
  return apiRateLimiter;
}