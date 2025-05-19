interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

export class InMemoryCache {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private readonly defaultTTL = 60000; // 1 minute

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  set<T>(key: string, data: T, ttl?: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL
    });
  }

  clear(): void {
    this.cache.clear();
  }

  // Clean up expired entries periodically
  startCleanup(): void {
    setInterval(() => {
      const now = Date.now();
      const entries = Array.from(this.cache.entries());
      for (const [key, entry] of entries) {
        if (now - entry.timestamp > entry.ttl) {
          this.cache.delete(key);
        }
      }
    }, 60000); // Run every minute
  }
}

export class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private readonly limits = {
    development: { requests: 100, window: 120000 }, // 100 requests per 2 minutes
    production: { requests: 3000, window: 10000 }   // 3000 requests per 10 seconds
  };

  async checkLimit(apiKey: string, endpoint: string): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
    const keyType = this.getKeyType(apiKey);
    const limit = this.limits[keyType];
    const key = `${apiKey}:${endpoint}`;
    const now = Date.now();
    
    let timestamps = this.requests.get(key) || [];
    
    // Remove old timestamps outside the window
    timestamps = timestamps.filter(ts => now - ts < limit.window);
    
    if (timestamps.length >= limit.requests) {
      const oldestTimestamp = timestamps[0];
      const resetTime = oldestTimestamp + limit.window;
      return {
        allowed: false,
        remaining: 0,
        resetTime
      };
    }
    
    // Add current timestamp
    timestamps.push(now);
    this.requests.set(key, timestamps);
    
    return {
      allowed: true,
      remaining: limit.requests - timestamps.length,
      resetTime: now + limit.window
    };
  }

  private getKeyType(apiKey: string): 'development' | 'production' {
    return apiKey.startsWith('RGAPI-') ? 'development' : 'production';
  }
}