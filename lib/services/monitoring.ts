import { getRedisService } from '@/lib/redis/client';

interface PerformanceMetric {
  endpoint: string;
  method: string;
  statusCode: number;
  duration: number;
  timestamp: Date;
  userId?: string;
  error?: string;
}

interface AggregatedMetrics {
  endpoint: string;
  totalRequests: number;
  averageResponseTime: number;
  p95ResponseTime: number;
  p99ResponseTime: number;
  errorRate: number;
  requestsPerMinute: number;
}

interface SystemHealth {
  status: 'healthy' | 'degraded' | 'critical';
  uptime: number;
  cpuUsage: number;
  memoryUsage: number;
  activeConnections: number;
  queuedJobs: number;
  cacheHitRate: number;
  lastCheck: Date;
}

export class PerformanceMonitor {
  private redis = getRedisService();
  private readonly METRICS_PREFIX = 'metrics:';
  private readonly HEALTH_KEY = 'system:health';
  private readonly METRIC_TTL = 86400; // 24 hours
  private startTime = Date.now();

  async connect() {
    await this.redis.connect();
  }

  // Record a performance metric
  async recordMetric(metric: PerformanceMetric): Promise<void> {
    const key = `${this.METRICS_PREFIX}${metric.endpoint}:${metric.method}`;
    const timestamp = metric.timestamp.getTime();
    
    // Store in sorted set for time-based queries
    await this.redis.zAdd(key, timestamp, JSON.stringify(metric));
    
    // Update aggregated stats
    await this.updateAggregatedStats(metric);
    
    // Set TTL
    await this.redis.expire(key, this.METRIC_TTL);
  }

  // Update aggregated statistics
  private async updateAggregatedStats(metric: PerformanceMetric): Promise<void> {
    const statsKey = `${this.METRICS_PREFIX}stats:${metric.endpoint}:${metric.method}`;
    const hourKey = this.getHourKey(metric.timestamp);
    
    // Increment counters
    await this.redis.hIncrBy(statsKey, 'totalRequests', 1);
    await this.redis.hIncrBy(statsKey, `requests:${hourKey}`, 1);
    
    if (metric.statusCode >= 400) {
      await this.redis.hIncrBy(statsKey, 'errorCount', 1);
    }
    
    // Update response time stats
    await this.redis.lPush(`${statsKey}:durations`, metric.duration.toString());
    await this.redis.lTrim(`${statsKey}:durations`, 0, 999); // Keep last 1000
    
    await this.redis.expire(statsKey, this.METRIC_TTL);
  }

  // Get aggregated metrics for an endpoint
  async getAggregatedMetrics(endpoint: string, method: string = 'GET'): Promise<AggregatedMetrics> {
    const statsKey = `${this.METRICS_PREFIX}stats:${endpoint}:${method}`;
    const stats = await this.redis.hGetAll(statsKey);
    
    const totalRequests = parseInt(stats.totalRequests || '0');
    const errorCount = parseInt(stats.errorCount || '0');
    
    // Get response times
    const durations = await this.redis.lRange(`${statsKey}:durations`, 0, -1);
    const responseTimes = durations.map(d => parseInt(d)).sort((a, b) => a - b);
    
    const avgResponseTime = responseTimes.length > 0 
      ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length 
      : 0;
    
    const p95Index = Math.floor(responseTimes.length * 0.95);
    const p99Index = Math.floor(responseTimes.length * 0.99);
    
    // Calculate requests per minute for the last hour
    const currentHour = this.getHourKey(new Date());
    const hourRequests = parseInt(stats[`requests:${currentHour}`] || '0');
    const requestsPerMinute = hourRequests / 60;
    
    return {
      endpoint,
      totalRequests,
      averageResponseTime: Math.round(avgResponseTime),
      p95ResponseTime: responseTimes[p95Index] || 0,
      p99ResponseTime: responseTimes[p99Index] || 0,
      errorRate: totalRequests > 0 ? (errorCount / totalRequests) * 100 : 0,
      requestsPerMinute: Math.round(requestsPerMinute * 10) / 10
    };
  }

  // Get metrics for a time range
  async getMetricsForTimeRange(
    endpoint: string,
    method: string,
    startTime: Date,
    endTime: Date
  ): Promise<PerformanceMetric[]> {
    const key = `${this.METRICS_PREFIX}${endpoint}:${method}`;
    const metrics = await this.redis.zRange(
      key,
      startTime.getTime(),
      endTime.getTime(),
      { BY: 'SCORE' }
    ) as string[];
    
    return metrics.map(m => {
      const metric = JSON.parse(m);
      metric.timestamp = new Date(metric.timestamp);
      return metric;
    });
  }

  // Record system health
  async recordSystemHealth(health: Omit<SystemHealth, 'lastCheck'>): Promise<void> {
    const healthData: SystemHealth = {
      ...health,
      lastCheck: new Date()
    };
    
    await this.redis.set(this.HEALTH_KEY, JSON.stringify(healthData), 300); // 5 minute TTL
    
    // Record historical health metrics
    const historyKey = `${this.HEALTH_KEY}:history`;
    await this.redis.zAdd(historyKey, Date.now(), JSON.stringify(healthData));
    
    // Keep only last 24 hours
    const cutoff = Date.now() - (24 * 60 * 60 * 1000);
    await this.redis.getClient().zRemRangeByScore(historyKey, '-inf', cutoff.toString());
  }

  // Get current system health
  async getSystemHealth(): Promise<SystemHealth | null> {
    const data = await this.redis.get(this.HEALTH_KEY);
    if (!data) return null;
    
    const health = JSON.parse(data);
    health.lastCheck = new Date(health.lastCheck);
    return health;
  }

  // Get health history
  async getHealthHistory(hours: number = 1): Promise<SystemHealth[]> {
    const historyKey = `${this.HEALTH_KEY}:history`;
    const cutoff = Date.now() - (hours * 60 * 60 * 1000);
    
    const history = await this.redis.zRange(
      historyKey,
      cutoff,
      Date.now(),
      { BY: 'SCORE' }
    ) as string[];
    
    return history.map(h => {
      const health = JSON.parse(h);
      health.lastCheck = new Date(health.lastCheck);
      return health;
    });
  }

  // Calculate cache hit rate
  async calculateCacheHitRate(): Promise<number> {
    const hits = await this.redis.get('cache:hits') || '0';
    const misses = await this.redis.get('cache:misses') || '0';
    
    const totalRequests = parseInt(hits) + parseInt(misses);
    if (totalRequests === 0) return 0;
    
    return (parseInt(hits) / totalRequests) * 100;
  }

  // Get top endpoints by metric
  async getTopEndpoints(
    metric: 'requests' | 'responseTime' | 'errors',
    limit: number = 10
  ): Promise<AggregatedMetrics[]> {
    const pattern = `${this.METRICS_PREFIX}stats:*`;
    const keys = await this.redis.keys(pattern);
    
    const metrics: AggregatedMetrics[] = [];
    
    for (const key of keys) {
      const [, , endpoint, method] = key.split(':');
      const aggregated = await this.getAggregatedMetrics(endpoint, method);
      metrics.push(aggregated);
    }
    
    // Sort by requested metric
    return metrics.sort((a, b) => {
      switch (metric) {
        case 'requests':
          return b.totalRequests - a.totalRequests;
        case 'responseTime':
          return b.averageResponseTime - a.averageResponseTime;
        case 'errors':
          return b.errorRate - a.errorRate;
        default:
          return 0;
      }
    }).slice(0, limit);
  }

  // Create performance report
  async generatePerformanceReport(): Promise<{
    summary: {
      totalRequests: number;
      averageResponseTime: number;
      errorRate: number;
      uptime: number;
      cacheHitRate: number;
    };
    topEndpoints: AggregatedMetrics[];
    slowestEndpoints: AggregatedMetrics[];
    errorProne: AggregatedMetrics[];
    systemHealth: SystemHealth | null;
    alerts: string[];
  }> {
    const [
      topEndpoints,
      slowestEndpoints,
      errorProne,
      systemHealth,
      cacheHitRate
    ] = await Promise.all([
      this.getTopEndpoints('requests', 10),
      this.getTopEndpoints('responseTime', 5),
      this.getTopEndpoints('errors', 5),
      this.getSystemHealth(),
      this.calculateCacheHitRate()
    ]);
    
    // Calculate summary stats
    let totalRequests = 0;
    let totalResponseTime = 0;
    let totalErrors = 0;
    
    for (const endpoint of topEndpoints) {
      totalRequests += endpoint.totalRequests;
      totalResponseTime += endpoint.averageResponseTime * endpoint.totalRequests;
      totalErrors += (endpoint.errorRate / 100) * endpoint.totalRequests;
    }
    
    const averageResponseTime = totalRequests > 0 ? totalResponseTime / totalRequests : 0;
    const errorRate = totalRequests > 0 ? (totalErrors / totalRequests) * 100 : 0;
    const uptime = ((Date.now() - this.startTime) / 1000 / 60 / 60); // Hours
    
    // Generate alerts
    const alerts: string[] = [];
    
    if (errorRate > 5) {
      alerts.push(`High error rate detected: ${errorRate.toFixed(2)}%`);
    }
    
    if (averageResponseTime > 1000) {
      alerts.push(`High average response time: ${averageResponseTime.toFixed(0)}ms`);
    }
    
    if (systemHealth?.status !== 'healthy') {
      alerts.push(`System health status: ${systemHealth?.status}`);
    }
    
    if (systemHealth && systemHealth.cpuUsage > 80) {
      alerts.push(`High CPU usage: ${systemHealth.cpuUsage}%`);
    }
    
    if (systemHealth && systemHealth.memoryUsage > 80) {
      alerts.push(`High memory usage: ${systemHealth.memoryUsage}%`);
    }
    
    return {
      summary: {
        totalRequests,
        averageResponseTime: Math.round(averageResponseTime),
        errorRate: Math.round(errorRate * 100) / 100,
        uptime: Math.round(uptime * 100) / 100,
        cacheHitRate: Math.round(cacheHitRate * 100) / 100
      },
      topEndpoints,
      slowestEndpoints,
      errorProne: errorProne.filter(e => e.errorRate > 0),
      systemHealth,
      alerts
    };
  }

  // Helper to get hour key
  private getHourKey(date: Date): string {
    return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}-${date.getHours()}`;
  }

  // Record cache hit/miss
  async recordCacheHit(hit: boolean): Promise<void> {
    const key = hit ? 'cache:hits' : 'cache:misses';
    await this.redis.incr(key);
  }

  // Get uptime
  getUptime(): number {
    return Date.now() - this.startTime;
  }
}

// Performance tracking middleware
export function createPerformanceMiddleware(monitor: PerformanceMonitor) {
  return async (req: any, res: any, next: any) => {
    const startTime = Date.now();
    const endpoint = req.path;
    const method = req.method;

    // Capture the original end function
    const originalEnd = res.end;

    res.end = async function(...args: any[]) {
      const duration = Date.now() - startTime;
      
      // Record metric
      await monitor.recordMetric({
        endpoint,
        method,
        statusCode: res.statusCode,
        duration,
        timestamp: new Date(),
        userId: req.user?.id,
        error: res.statusCode >= 400 ? res.statusMessage : undefined
      });

      // Call the original end function
      originalEnd.apply(res, args);
    };

    next();
  };
}

// Singleton instance
let performanceMonitor: PerformanceMonitor | null = null;

export function getPerformanceMonitor(): PerformanceMonitor {
  if (!performanceMonitor) {
    performanceMonitor = new PerformanceMonitor();
  }
  return performanceMonitor;
}