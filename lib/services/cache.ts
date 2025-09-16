import { getRedisService } from '@/lib/redis/client';

interface CacheOptions {
  ttl?: number; // Time to live in seconds
  prefix?: string; // Key prefix
  compress?: boolean; // Whether to compress large values
}

export class CacheService {
  private redis = getRedisService();
  private readonly DEFAULT_TTL = 300; // 5 minutes
  private readonly KEY_PREFIX = 'cache:';

  async connect() {
    await this.redis.connect();
  }

  // Generate cache key
  private getCacheKey(key: string, prefix?: string): string {
    const keyPrefix = prefix || this.KEY_PREFIX;
    return `${keyPrefix}${key}`;
  }

  // Generic get method
  async get<T>(key: string, options?: CacheOptions): Promise<T | null> {
    const cacheKey = this.getCacheKey(key, options?.prefix);
    const value = await this.redis.get(cacheKey);
    
    if (!value) {
      return null;
    }
    
    try {
      return JSON.parse(value) as T;
    } catch (error) {
      console.error('Failed to parse cached value:', error);
      return null;
    }
  }

  // Generic set method
  async set<T>(key: string, value: T, options?: CacheOptions): Promise<void> {
    const cacheKey = this.getCacheKey(key, options?.prefix);
    const ttl = options?.ttl || this.DEFAULT_TTL;
    const serialized = JSON.stringify(value);
    
    await this.redis.set(cacheKey, serialized, ttl);
  }

  // Delete cached value
  async del(key: string, options?: CacheOptions): Promise<void> {
    const cacheKey = this.getCacheKey(key, options?.prefix);
    await this.redis.del(cacheKey);
  }

  // Check if key exists
  async exists(key: string, options?: CacheOptions): Promise<boolean> {
    const cacheKey = this.getCacheKey(key, options?.prefix);
    return await this.redis.exists(cacheKey);
  }

  // Clear cache by pattern
  async clearByPattern(pattern: string, options?: CacheOptions): Promise<number> {
    const prefix = options?.prefix || this.KEY_PREFIX;
    const keys = await this.redis.keys(`${prefix}${pattern}`);
    
    if (keys.length === 0) {
      return 0;
    }
    
    let deleted = 0;
    for (const key of keys) {
      deleted += await this.redis.del(key);
    }
    
    return deleted;
  }

  // Cache with loader function
  async getOrSet<T>(
    key: string,
    loader: () => Promise<T>,
    options?: CacheOptions
  ): Promise<T> {
    // Try to get from cache first
    const cached = await this.get<T>(key, options);
    if (cached !== null) {
      return cached;
    }
    
    // Load fresh data
    const value = await loader();
    
    // Cache the result
    await this.set(key, value, options);
    
    return value;
  }

  // Batch get
  async mget<T>(keys: string[], options?: CacheOptions): Promise<Map<string, T | null>> {
    const result = new Map<string, T | null>();
    
    for (const key of keys) {
      const value = await this.get<T>(key, options);
      result.set(key, value);
    }
    
    return result;
  }

  // Batch set
  async mset<T>(entries: Map<string, T>, options?: CacheOptions): Promise<void> {
    const promises: Promise<void>[] = [];
    
    for (const [key, value] of entries) {
      promises.push(this.set(key, value, options));
    }
    
    await Promise.all(promises);
  }

  // Invalidate related caches
  async invalidateRelated(tags: string[]): Promise<number> {
    let totalDeleted = 0;
    
    for (const tag of tags) {
      totalDeleted += await this.clearByPattern(`*:${tag}:*`);
    }
    
    return totalDeleted;
  }

  // Get cache statistics
  async getStats(): Promise<{
    totalKeys: number;
    memoryUsage: string;
    patterns: Record<string, number>;
  }> {
    const keys = await this.redis.keys(`${this.KEY_PREFIX}*`);
    const patterns: Record<string, number> = {};
    
    // Count keys by pattern
    for (const key of keys) {
      const parts = key.split(':');
      if (parts.length > 2) {
        const pattern = parts[1];
        patterns[pattern] = (patterns[pattern] || 0) + 1;
      }
    }
    
    // Get memory info (this is approximate)
    const info = await this.redis.getClient().info('memory');
    const memoryMatch = info.match(/used_memory_human:(.+)/);
    const memoryUsage = memoryMatch ? memoryMatch[1].trim() : 'Unknown';
    
    return {
      totalKeys: keys.length,
      memoryUsage,
      patterns
    };
  }
}

// GraphQL-specific cache helpers
export class GraphQLCache extends CacheService {
  // Cache GraphQL query result
  async cacheQuery(
    operationName: string,
    variables: Record<string, any>,
    result: any,
    ttl?: number
  ): Promise<void> {
    const key = this.generateQueryKey(operationName, variables);
    await this.set(key, result, { ttl, prefix: 'gql:query:' });
  }

  // Get cached GraphQL query result
  async getCachedQuery<T>(
    operationName: string,
    variables: Record<string, any>
  ): Promise<T | null> {
    const key = this.generateQueryKey(operationName, variables);
    return await this.get<T>(key, { prefix: 'gql:query:' });
  }

  // Cache player data
  async cachePlayer(region: string, summonerId: string, data: any, ttl: number = 300): Promise<void> {
    const key = `player:${region}:${summonerId}`;
    await this.set(key, data, { ttl, prefix: 'league:' });
  }

  // Get cached player data
  async getCachedPlayer(region: string, summonerId: string): Promise<any | null> {
    const key = `player:${region}:${summonerId}`;
    return await this.get(key, { prefix: 'league:' });
  }

  // Cache match data
  async cacheMatch(matchId: string, data: any, ttl: number = 3600): Promise<void> {
    const key = `match:${matchId}`;
    await this.set(key, data, { ttl, prefix: 'league:' });
  }

  // Get cached match data
  async getCachedMatch(matchId: string): Promise<any | null> {
    const key = `match:${matchId}`;
    return await this.get(key, { prefix: 'league:' });
  }

  // Generate consistent cache key for queries
  private generateQueryKey(operationName: string, variables: Record<string, any>): string {
    const sortedVars = Object.keys(variables).sort().reduce((acc, key) => {
      acc[key] = variables[key];
      return acc;
    }, {} as Record<string, any>);
    
    return `${operationName}:${JSON.stringify(sortedVars)}`;
  }

  // Invalidate all player-related caches
  async invalidatePlayerCaches(region: string, summonerId: string): Promise<void> {
    await this.clearByPattern(`player:${region}:${summonerId}*`, { prefix: 'league:' });
    await this.clearByPattern(`*:${summonerId}*`, { prefix: 'gql:query:' });
  }
}

// Singleton instances
let cacheService: CacheService | null = null;
let graphqlCache: GraphQLCache | null = null;

export function getCacheService(): CacheService {
  if (!cacheService) {
    cacheService = new CacheService();
  }
  return cacheService;
}

export function getGraphQLCache(): GraphQLCache {
  if (!graphqlCache) {
    graphqlCache = new GraphQLCache();
  }
  return graphqlCache;
}