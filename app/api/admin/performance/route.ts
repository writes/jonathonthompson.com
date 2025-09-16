import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-simple';
import { getPerformanceMonitor } from '@/lib/services/monitoring';
import os from 'os';

const monitor = getPerformanceMonitor();

export async function GET(request: NextRequest) {
  try {
    // Check authentication and admin role
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Connect monitor if needed
    await monitor.connect();

    // Get performance report
    const report = await monitor.generatePerformanceReport();

    // Add real system metrics
    const cpuUsage = os.loadavg()[0] * 10; // Simplified CPU usage
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const memoryUsage = ((totalMemory - freeMemory) / totalMemory) * 100;

    // Record current system health
    await monitor.recordSystemHealth({
      status: report.alerts.length === 0 ? 'healthy' : 
              report.alerts.length < 3 ? 'degraded' : 'critical',
      uptime: monitor.getUptime(),
      cpuUsage: Math.round(cpuUsage),
      memoryUsage: Math.round(memoryUsage),
      activeConnections: Math.floor(Math.random() * 2000), // Mock active connections
      queuedJobs: Math.floor(Math.random() * 100), // Mock queued jobs
      cacheHitRate: report.summary.cacheHitRate
    });

    return NextResponse.json({
      ...report,
      systemMetrics: {
        cpuUsage: Math.round(cpuUsage),
        memoryUsage: Math.round(memoryUsage),
        uptime: process.uptime()
      }
    });

  } catch (error) {
    console.error('Performance API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Record a performance metric
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { endpoint, method, statusCode, duration } = body;

    if (!endpoint || !method || !statusCode || !duration) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    await monitor.connect();
    await monitor.recordMetric({
      endpoint,
      method,
      statusCode,
      duration,
      timestamp: new Date(),
      userId: session.user.id,
      error: statusCode >= 400 ? body.error : undefined
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Performance metric recording error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}