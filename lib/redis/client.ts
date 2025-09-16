import { createClient, RedisClientType } from 'redis';

export class RedisService {
  private client: RedisClientType;
  private isConnected: boolean = false;

  constructor() {
    // Skip Redis initialization if disabled
    if (process.env.DISABLE_REDIS === 'true') {
      console.log('Redis disabled via DISABLE_REDIS environment variable');
      return;
    }

    this.client = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
      socket: {
        reconnectStrategy: (retries) => Math.min(retries * 50, 5000)
      }
    });

    this.client.on('error', (err) => console.error('Redis Client Error', err));
    this.client.on('connect', () => {
      console.log('Redis Client Connected');
      this.isConnected = true;
    });
    this.client.on('disconnect', () => {
      console.log('Redis Client Disconnected');
      this.isConnected = false;
    });
  }

  async connect() {
    if (process.env.DISABLE_REDIS === 'true') {
      return;
    }
    if (!this.isConnected) {
      await this.client.connect();
    }
  }

  async disconnect() {
    if (this.isConnected) {
      await this.client.disconnect();
    }
  }

  // Cache operations
  async get(key: string): Promise<string | null> {
    return await this.client.get(key);
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (ttlSeconds) {
      await this.client.setEx(key, ttlSeconds, value);
    } else {
      await this.client.set(key, value);
    }
  }

  async del(key: string): Promise<number> {
    return await this.client.del(key);
  }

  async exists(key: string): Promise<boolean> {
    const result = await this.client.exists(key);
    return result === 1;
  }

  async expire(key: string, seconds: number): Promise<boolean> {
    return await this.client.expire(key, seconds);
  }

  // Hash operations for complex objects
  async hSet(key: string, field: string, value: string): Promise<number> {
    return await this.client.hSet(key, field, value);
  }

  async hGet(key: string, field: string): Promise<string | undefined> {
    return await this.client.hGet(key, field);
  }

  async hGetAll(key: string): Promise<Record<string, string>> {
    return await this.client.hGetAll(key);
  }

  async hDel(key: string, field: string): Promise<number> {
    return await this.client.hDel(key, field);
  }

  // List operations for queues
  async lPush(key: string, ...values: string[]): Promise<number> {
    return await this.client.lPush(key, values);
  }

  async rPop(key: string): Promise<string | null> {
    return await this.client.rPop(key);
  }

  async lRange(key: string, start: number, stop: number): Promise<string[]> {
    return await this.client.lRange(key, start, stop);
  }

  async lLen(key: string): Promise<number> {
    return await this.client.lLen(key);
  }

  // Sorted set operations for leaderboards
  async zAdd(key: string, score: number, member: string): Promise<number> {
    return await this.client.zAdd(key, { score, value: member });
  }

  async zScore(key: string, member: string): Promise<number | null> {
    return await this.client.zScore(key, member);
  }

  async zRank(key: string, member: string): Promise<number | null> {
    return await this.client.zRank(key, member);
  }

  async zRevRank(key: string, member: string): Promise<number | null> {
    return await this.client.zRevRank(key, member);
  }

  async zRange(key: string, start: number, stop: number, withScores: boolean = false): Promise<string[] | { value: string; score: number }[]> {
    if (withScores) {
      return await this.client.zRangeWithScores(key, start, stop);
    }
    return await this.client.zRange(key, start, stop);
  }

  async zRevRange(key: string, start: number, stop: number, withScores: boolean = false): Promise<string[] | { value: string; score: number }[]> {
    if (withScores) {
      return await this.client.zRangeWithScores(key, start, stop, { REV: true });
    }
    return await this.client.zRange(key, start, stop, { REV: true });
  }

  async zIncrBy(key: string, increment: number, member: string): Promise<number> {
    return await this.client.zIncrBy(key, increment, member);
  }

  async zCard(key: string): Promise<number> {
    return await this.client.zCard(key);
  }

  async zRem(key: string, member: string): Promise<number> {
    return await this.client.zRem(key, member);
  }

  // Set operations
  async sAdd(key: string, ...members: string[]): Promise<number> {
    return await this.client.sAdd(key, members);
  }

  async sMembers(key: string): Promise<string[]> {
    return await this.client.sMembers(key);
  }

  async sIsMember(key: string, member: string): Promise<boolean> {
    return await this.client.sIsMember(key, member);
  }

  async sRem(key: string, member: string): Promise<number> {
    return await this.client.sRem(key, member);
  }

  // Increment operations
  async incr(key: string): Promise<number> {
    return await this.client.incr(key);
  }

  async incrBy(key: string, increment: number): Promise<number> {
    return await this.client.incrBy(key, increment);
  }

  // Pub/Sub operations
  async publish(channel: string, message: string): Promise<number> {
    return await this.client.publish(channel, message);
  }

  // Transaction operations
  async multi() {
    return this.client.multi();
  }

  // Utility methods
  async flushDb(): Promise<void> {
    await this.client.flushDb();
  }

  async keys(pattern: string): Promise<string[]> {
    return await this.client.keys(pattern);
  }

  getClient(): RedisClientType {
    return this.client;
  }
}

// Singleton instance
let redisService: RedisService | null = null;

export function getRedisService(): RedisService {
  if (!redisService) {
    redisService = new RedisService();
  }
  return redisService;
}