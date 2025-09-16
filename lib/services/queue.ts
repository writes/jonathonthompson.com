import { getRedisService } from '@/lib/redis/client';

interface QueueJob<T = any> {
  id: string;
  data: T;
  createdAt: Date;
  attempts: number;
  maxAttempts: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error?: string;
  result?: any;
  processedAt?: Date;
  completedAt?: Date;
}

interface QueueOptions {
  maxAttempts?: number;
  retryDelay?: number; // Milliseconds
  processingTimeout?: number; // Milliseconds
}

export class QueueService<T = any> {
  private redis = getRedisService();
  private readonly queueName: string;
  private readonly options: Required<QueueOptions>;
  private processingJobs = new Map<string, NodeJS.Timeout>();

  constructor(queueName: string, options: QueueOptions = {}) {
    this.queueName = queueName;
    this.options = {
      maxAttempts: options.maxAttempts || 3,
      retryDelay: options.retryDelay || 5000,
      processingTimeout: options.processingTimeout || 30000
    };
  }

  async connect() {
    await this.redis.connect();
  }

  // Add job to queue
  async addJob(data: T): Promise<string> {
    const jobId = `${this.queueName}:${Date.now()}-${Math.random().toString(36).substring(7)}`;
    const job: QueueJob<T> = {
      id: jobId,
      data,
      createdAt: new Date(),
      attempts: 0,
      maxAttempts: this.options.maxAttempts,
      status: 'pending'
    };

    // Add to pending queue
    await this.redis.lPush(this.getPendingKey(), jobId);
    
    // Store job data
    await this.redis.set(this.getJobKey(jobId), JSON.stringify(job));
    
    return jobId;
  }

  // Process next job in queue
  async processNext(handler: (job: QueueJob<T>) => Promise<any>): Promise<boolean> {
    // Move job from pending to processing
    const jobId = await this.redis.rPop(this.getPendingKey());
    
    if (!jobId) {
      return false; // No jobs to process
    }

    const jobData = await this.redis.get(this.getJobKey(jobId));
    if (!jobData) {
      console.error(`Job ${jobId} not found`);
      return false;
    }

    const job: QueueJob<T> = JSON.parse(jobData);
    job.status = 'processing';
    job.processedAt = new Date();
    job.attempts++;

    // Add to processing set
    await this.redis.sAdd(this.getProcessingKey(), jobId);
    await this.redis.set(this.getJobKey(jobId), JSON.stringify(job));

    // Set timeout for job processing
    const timeout = setTimeout(async () => {
      await this.handleJobTimeout(jobId);
    }, this.options.processingTimeout);

    this.processingJobs.set(jobId, timeout);

    try {
      // Process the job
      const result = await handler(job);
      
      // Mark as completed
      job.status = 'completed';
      job.result = result;
      job.completedAt = new Date();
      
      await this.redis.set(this.getJobKey(jobId), JSON.stringify(job));
      await this.redis.sRem(this.getProcessingKey(), jobId);
      await this.redis.sAdd(this.getCompletedKey(), jobId);
      
      // Clear timeout
      clearTimeout(timeout);
      this.processingJobs.delete(jobId);
      
      return true;
    } catch (error) {
      // Clear timeout
      clearTimeout(timeout);
      this.processingJobs.delete(jobId);
      
      // Handle job failure
      await this.handleJobFailure(jobId, error);
      
      return false;
    }
  }

  // Handle job timeout
  private async handleJobTimeout(jobId: string): Promise<void> {
    const jobData = await this.redis.get(this.getJobKey(jobId));
    if (!jobData) return;

    const job: QueueJob<T> = JSON.parse(jobData);
    
    if (job.status === 'processing') {
      await this.handleJobFailure(jobId, new Error('Job processing timeout'));
    }
  }

  // Handle job failure
  private async handleJobFailure(jobId: string, error: any): Promise<void> {
    const jobData = await this.redis.get(this.getJobKey(jobId));
    if (!jobData) return;

    const job: QueueJob<T> = JSON.parse(jobData);
    job.error = error?.message || 'Unknown error';

    if (job.attempts < job.maxAttempts) {
      // Retry job
      job.status = 'pending';
      await this.redis.set(this.getJobKey(jobId), JSON.stringify(job));
      await this.redis.sRem(this.getProcessingKey(), jobId);
      
      // Add back to queue with delay
      setTimeout(async () => {
        await this.redis.lPush(this.getPendingKey(), jobId);
      }, this.options.retryDelay);
    } else {
      // Mark as failed
      job.status = 'failed';
      await this.redis.set(this.getJobKey(jobId), JSON.stringify(job));
      await this.redis.sRem(this.getProcessingKey(), jobId);
      await this.redis.sAdd(this.getFailedKey(), jobId);
    }
  }

  // Get job by ID
  async getJob(jobId: string): Promise<QueueJob<T> | null> {
    const jobData = await this.redis.get(this.getJobKey(jobId));
    return jobData ? JSON.parse(jobData) : null;
  }

  // Get queue statistics
  async getStats(): Promise<{
    pending: number;
    processing: number;
    completed: number;
    failed: number;
  }> {
    const [pending, processing, completed, failed] = await Promise.all([
      this.redis.lLen(this.getPendingKey()),
      this.redis.sMembers(this.getProcessingKey()).then(m => m.length),
      this.redis.sMembers(this.getCompletedKey()).then(m => m.length),
      this.redis.sMembers(this.getFailedKey()).then(m => m.length)
    ]);

    return { pending, processing, completed, failed };
  }

  // Get jobs by status
  async getJobsByStatus(status: 'pending' | 'processing' | 'completed' | 'failed', limit: number = 10): Promise<QueueJob<T>[]> {
    let jobIds: string[] = [];

    switch (status) {
      case 'pending':
        jobIds = await this.redis.lRange(this.getPendingKey(), 0, limit - 1);
        break;
      case 'processing':
        jobIds = Array.from(await this.redis.sMembers(this.getProcessingKey())).slice(0, limit);
        break;
      case 'completed':
        jobIds = Array.from(await this.redis.sMembers(this.getCompletedKey())).slice(0, limit);
        break;
      case 'failed':
        jobIds = Array.from(await this.redis.sMembers(this.getFailedKey())).slice(0, limit);
        break;
    }

    const jobs: QueueJob<T>[] = [];
    for (const jobId of jobIds) {
      const job = await this.getJob(jobId);
      if (job) jobs.push(job);
    }

    return jobs;
  }

  // Clear completed jobs
  async clearCompleted(): Promise<number> {
    const completedIds = await this.redis.sMembers(this.getCompletedKey());
    let cleared = 0;

    for (const jobId of completedIds) {
      await this.redis.del(this.getJobKey(jobId));
      await this.redis.sRem(this.getCompletedKey(), jobId);
      cleared++;
    }

    return cleared;
  }

  // Clear failed jobs
  async clearFailed(): Promise<number> {
    const failedIds = await this.redis.sMembers(this.getFailedKey());
    let cleared = 0;

    for (const jobId of failedIds) {
      await this.redis.del(this.getJobKey(jobId));
      await this.redis.sRem(this.getFailedKey(), jobId);
      cleared++;
    }

    return cleared;
  }

  // Retry failed jobs
  async retryFailed(): Promise<number> {
    const failedIds = await this.redis.sMembers(this.getFailedKey());
    let retried = 0;

    for (const jobId of failedIds) {
      const job = await this.getJob(jobId);
      if (job) {
        job.status = 'pending';
        job.attempts = 0;
        job.error = undefined;
        await this.redis.set(this.getJobKey(jobId), JSON.stringify(job));
        await this.redis.sRem(this.getFailedKey(), jobId);
        await this.redis.lPush(this.getPendingKey(), jobId);
        retried++;
      }
    }

    return retried;
  }

  // Key generators
  private getPendingKey(): string {
    return `queue:${this.queueName}:pending`;
  }

  private getProcessingKey(): string {
    return `queue:${this.queueName}:processing`;
  }

  private getCompletedKey(): string {
    return `queue:${this.queueName}:completed`;
  }

  private getFailedKey(): string {
    return `queue:${this.queueName}:failed`;
  }

  private getJobKey(jobId: string): string {
    return `job:${jobId}`;
  }
}

// Specific queue implementations
export class LeagueUpdateQueue extends QueueService<{
  region: string;
  summonerId: string;
  updateType: 'player' | 'matches' | 'current_game';
}> {
  constructor() {
    super('league-updates', {
      maxAttempts: 3,
      retryDelay: 10000,
      processingTimeout: 60000
    });
  }
}

export class TournamentQueue extends QueueService<{
  tournamentId: string;
  action: 'start_round' | 'calculate_standings' | 'generate_brackets';
}> {
  constructor() {
    super('tournaments', {
      maxAttempts: 5,
      retryDelay: 5000,
      processingTimeout: 120000
    });
  }
}

export class NotificationQueue extends QueueService<{
  userId: string;
  type: 'match_start' | 'tournament_update' | 'rank_change';
  data: any;
}> {
  constructor() {
    super('notifications', {
      maxAttempts: 3,
      retryDelay: 2000,
      processingTimeout: 10000
    });
  }
}

// Queue manager for processing multiple queues
export class QueueManager {
  private queues: Map<string, QueueService> = new Map();
  private intervals: Map<string, NodeJS.Timeout> = new Map();

  registerQueue(name: string, queue: QueueService, handler: (job: any) => Promise<any>, intervalMs: number = 1000) {
    this.queues.set(name, queue);
    
    // Start processing
    const interval = setInterval(async () => {
      try {
        await queue.processNext(handler);
      } catch (error) {
        console.error(`Error processing queue ${name}:`, error);
      }
    }, intervalMs);
    
    this.intervals.set(name, interval);
  }

  unregisterQueue(name: string) {
    const interval = this.intervals.get(name);
    if (interval) {
      clearInterval(interval);
      this.intervals.delete(name);
    }
    this.queues.delete(name);
  }

  async getQueueStats(): Promise<Record<string, any>> {
    const stats: Record<string, any> = {};
    
    for (const [name, queue] of this.queues) {
      stats[name] = await queue.getStats();
    }
    
    return stats;
  }

  stopAll() {
    for (const interval of this.intervals.values()) {
      clearInterval(interval);
    }
    this.intervals.clear();
  }
}