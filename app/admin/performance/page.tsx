'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
  FaChartLine, 
  FaClock, 
  FaServer, 
  FaExclamationTriangle,
  FaCheckCircle,
  FaMemory,
  FaMicrochip,
  FaNetworkWired,
  FaDatabase
} from 'react-icons/fa';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface PerformanceData {
  summary: {
    totalRequests: number;
    averageResponseTime: number;
    errorRate: number;
    uptime: number;
    cacheHitRate: number;
  };
  topEndpoints: Array<{
    endpoint: string;
    totalRequests: number;
    averageResponseTime: number;
    p95ResponseTime: number;
    p99ResponseTime: number;
    errorRate: number;
    requestsPerMinute: number;
  }>;
  slowestEndpoints: Array<{
    endpoint: string;
    averageResponseTime: number;
  }>;
  errorProne: Array<{
    endpoint: string;
    errorRate: number;
  }>;
  systemHealth: {
    status: 'healthy' | 'degraded' | 'critical';
    cpuUsage: number;
    memoryUsage: number;
    activeConnections: number;
    queuedJobs: number;
    cacheHitRate: number;
  } | null;
  alerts: string[];
}

export default function PerformanceDashboard() {
  const { data: session } = useSession();
  const router = useRouter();
  const [performanceData, setPerformanceData] = useState<PerformanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [timeRange, setTimeRange] = useState('1h');
  const [historicalData, setHistoricalData] = useState<any[]>([]);

  // Mock data generation
  useEffect(() => {
    const fetchPerformanceData = async () => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generate mock data
      const mockData: PerformanceData = {
        summary: {
          totalRequests: 1456789,
          averageResponseTime: 125,
          errorRate: 0.23,
          uptime: 99.98,
          cacheHitRate: 87.5
        },
        topEndpoints: [
          {
            endpoint: '/api/graphql',
            totalRequests: 523456,
            averageResponseTime: 89,
            p95ResponseTime: 125,
            p99ResponseTime: 245,
            errorRate: 0.1,
            requestsPerMinute: 872.4
          },
          {
            endpoint: '/api/protected/league-stats',
            totalRequests: 234567,
            averageResponseTime: 156,
            p95ResponseTime: 234,
            p99ResponseTime: 456,
            errorRate: 0.5,
            requestsPerMinute: 391.0
          },
          {
            endpoint: '/api/auth/session',
            totalRequests: 189234,
            averageResponseTime: 45,
            p95ResponseTime: 67,
            p99ResponseTime: 89,
            errorRate: 0.05,
            requestsPerMinute: 315.4
          }
        ],
        slowestEndpoints: [
          { endpoint: '/api/ml/predict', averageResponseTime: 1234 },
          { endpoint: '/api/tournament/generate', averageResponseTime: 892 },
          { endpoint: '/api/champion/3d-model', averageResponseTime: 567 }
        ],
        errorProne: [
          { endpoint: '/api/riot/spectator', errorRate: 2.3 },
          { endpoint: '/api/protected/admin', errorRate: 1.5 }
        ],
        systemHealth: {
          status: 'healthy',
          cpuUsage: 45.2,
          memoryUsage: 62.8,
          activeConnections: 1234,
          queuedJobs: 56,
          cacheHitRate: 87.5
        },
        alerts: []
      };

      // Generate historical data
      const historical = Array.from({ length: 24 }, (_, i) => ({
        time: new Date(Date.now() - (23 - i) * 3600000).toISOString(),
        requests: Math.floor(Math.random() * 10000 + 40000),
        responseTime: Math.floor(Math.random() * 50 + 100),
        errorRate: Math.random() * 0.5
      }));

      setPerformanceData(mockData);
      setHistoricalData(historical);
      setLoading(false);
    };

    fetchPerformanceData();
    
    if (autoRefresh) {
      const interval = setInterval(fetchPerformanceData, 30000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  // Check admin role
  useEffect(() => {
    if (session && (session.user as any).role !== 'ADMIN') {
      router.push('/unauthorized');
    }
  }, [session, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white">Loading performance data...</p>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-400';
      case 'degraded': return 'text-yellow-400';
      case 'critical': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
      }
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.6)'
        }
      },
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.6)'
        }
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h1 className="text-4xl font-bold text-white flex items-center gap-3">
              <FaChartLine className="text-green-500" />
              Performance Dashboard
            </h1>
            <p className="text-gray-400 mt-2">Real-time application performance monitoring</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4"
          >
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg border border-gray-700"
            >
              <option value="1h">Last Hour</option>
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
            </select>

            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                autoRefresh 
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                  : 'bg-gray-800 text-gray-400 border border-gray-700'
              }`}
            >
              {autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
            </button>

            <button
              onClick={() => router.push('/admin')}
              className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Back to Admin
            </button>
          </motion.div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800"
          >
            <div className="flex items-center justify-between mb-4">
              <FaNetworkWired className="text-blue-500 text-2xl" />
              <span className="text-xs text-gray-500">Total</span>
            </div>
            <h3 className="text-gray-400 text-sm mb-1">Requests</h3>
            <p className="text-3xl font-bold text-white">
              {(performanceData?.summary.totalRequests || 0).toLocaleString()}
            </p>
            <p className="text-sm text-green-400 mt-2">+12.5% from yesterday</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800"
          >
            <div className="flex items-center justify-between mb-4">
              <FaClock className="text-purple-500 text-2xl" />
              <span className="text-xs text-gray-500">Average</span>
            </div>
            <h3 className="text-gray-400 text-sm mb-1">Response Time</h3>
            <p className="text-3xl font-bold text-white">
              {performanceData?.summary.averageResponseTime}ms
            </p>
            <p className="text-sm text-green-400 mt-2">-5ms improvement</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800"
          >
            <div className="flex items-center justify-between mb-4">
              <FaExclamationTriangle className="text-red-500 text-2xl" />
              <span className="text-xs text-gray-500">Current</span>
            </div>
            <h3 className="text-gray-400 text-sm mb-1">Error Rate</h3>
            <p className="text-3xl font-bold text-white">
              {performanceData?.summary.errorRate}%
            </p>
            <p className="text-sm text-green-400 mt-2">Within normal range</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800"
          >
            <div className="flex items-center justify-between mb-4">
              <FaServer className="text-green-500 text-2xl" />
              <span className="text-xs text-gray-500">System</span>
            </div>
            <h3 className="text-gray-400 text-sm mb-1">Uptime</h3>
            <p className="text-3xl font-bold text-white">
              {performanceData?.summary.uptime}%
            </p>
            <p className="text-sm text-green-400 mt-2">Excellent</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800"
          >
            <div className="flex items-center justify-between mb-4">
              <FaDatabase className="text-orange-500 text-2xl" />
              <span className="text-xs text-gray-500">Cache</span>
            </div>
            <h3 className="text-gray-400 text-sm mb-1">Hit Rate</h3>
            <p className="text-3xl font-bold text-white">
              {performanceData?.summary.cacheHitRate}%
            </p>
            <p className="text-sm text-yellow-400 mt-2">Could be improved</p>
          </motion.div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Request Volume Chart */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800"
          >
            <h2 className="text-xl font-bold text-white mb-4">Request Volume</h2>
            <div className="h-64">
              <Line
                data={{
                  labels: historicalData.map(d => new Date(d.time).getHours() + ':00'),
                  datasets: [{
                    label: 'Requests',
                    data: historicalData.map(d => d.requests),
                    borderColor: 'rgb(59, 130, 246)',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    tension: 0.4,
                    fill: true
                  }]
                }}
                options={chartOptions}
              />
            </div>
          </motion.div>

          {/* Response Time Chart */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800"
          >
            <h2 className="text-xl font-bold text-white mb-4">Response Time Trend</h2>
            <div className="h-64">
              <Line
                data={{
                  labels: historicalData.map(d => new Date(d.time).getHours() + ':00'),
                  datasets: [{
                    label: 'Response Time (ms)',
                    data: historicalData.map(d => d.responseTime),
                    borderColor: 'rgb(168, 85, 247)',
                    backgroundColor: 'rgba(168, 85, 247, 0.1)',
                    tension: 0.4,
                    fill: true
                  }]
                }}
                options={chartOptions}
              />
            </div>
          </motion.div>
        </div>

        {/* System Health */}
        {performanceData?.systemHealth && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800 mb-8"
          >
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <FaServer className="text-blue-500" />
              System Health
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400 flex items-center gap-2">
                    <FaMicrochip /> CPU Usage
                  </span>
                  <span className="text-sm font-medium text-white">
                    {performanceData.systemHealth.cpuUsage}%
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      performanceData.systemHealth.cpuUsage > 80 
                        ? 'bg-red-500' 
                        : performanceData.systemHealth.cpuUsage > 60 
                        ? 'bg-yellow-500' 
                        : 'bg-green-500'
                    }`}
                    style={{ width: `${performanceData.systemHealth.cpuUsage}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400 flex items-center gap-2">
                    <FaMemory /> Memory Usage
                  </span>
                  <span className="text-sm font-medium text-white">
                    {performanceData.systemHealth.memoryUsage}%
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      performanceData.systemHealth.memoryUsage > 80 
                        ? 'bg-red-500' 
                        : performanceData.systemHealth.memoryUsage > 60 
                        ? 'bg-yellow-500' 
                        : 'bg-green-500'
                    }`}
                    style={{ width: `${performanceData.systemHealth.memoryUsage}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-center flex-1">
                  <p className="text-2xl font-bold text-white">
                    {performanceData.systemHealth.activeConnections}
                  </p>
                  <p className="text-xs text-gray-400">Active Connections</p>
                </div>
                <div className="text-center flex-1">
                  <p className="text-2xl font-bold text-white">
                    {performanceData.systemHealth.queuedJobs}
                  </p>
                  <p className="text-xs text-gray-400">Queued Jobs</p>
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-center">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                performanceData.systemHealth.status === 'healthy' 
                  ? 'bg-green-500/20 text-green-400' 
                  : performanceData.systemHealth.status === 'degraded'
                  ? 'bg-yellow-500/20 text-yellow-400'
                  : 'bg-red-500/20 text-red-400'
              }`}>
                {performanceData.systemHealth.status === 'healthy' 
                  ? <FaCheckCircle /> 
                  : <FaExclamationTriangle />
                }
                <span className="font-medium uppercase">
                  {performanceData.systemHealth.status}
                </span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Endpoints Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Endpoints */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.9 }}
            className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800"
          >
            <h2 className="text-xl font-bold text-white mb-4">Top Endpoints</h2>
            <div className="space-y-3">
              {performanceData?.topEndpoints.slice(0, 5).map((endpoint, index) => (
                <div key={endpoint.endpoint} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-white">
                        {endpoint.endpoint}
                      </span>
                      <span className="text-xs text-gray-400">
                        {endpoint.requestsPerMinute} req/min
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>Avg: {endpoint.averageResponseTime}ms</span>
                      <span>P95: {endpoint.p95ResponseTime}ms</span>
                      <span>Errors: {endpoint.errorRate}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Alerts & Issues */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.0 }}
            className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800"
          >
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <FaExclamationTriangle className="text-yellow-500" />
              Performance Issues
            </h2>
            
            {performanceData?.alerts.length === 0 && 
             performanceData?.slowestEndpoints.length === 0 && 
             performanceData?.errorProne.length === 0 ? (
              <div className="text-center py-8">
                <FaCheckCircle className="text-5xl text-green-400 mx-auto mb-3" />
                <p className="text-green-400 font-medium">No performance issues detected</p>
                <p className="text-sm text-gray-500 mt-1">All systems operating normally</p>
              </div>
            ) : (
              <div className="space-y-4">
                {performanceData?.slowestEndpoints.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-orange-400 mb-2">Slow Endpoints</h3>
                    {performanceData.slowestEndpoints.map((endpoint, i) => (
                      <div key={i} className="flex items-center justify-between py-1">
                        <span className="text-sm text-gray-300">{endpoint.endpoint}</span>
                        <span className="text-sm text-orange-400">
                          {endpoint.averageResponseTime}ms
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                
                {performanceData?.errorProne.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-red-400 mb-2">High Error Rates</h3>
                    {performanceData.errorProne.map((endpoint, i) => (
                      <div key={i} className="flex items-center justify-between py-1">
                        <span className="text-sm text-gray-300">{endpoint.endpoint}</span>
                        <span className="text-sm text-red-400">{endpoint.errorRate}%</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}