'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
  FaShieldAlt, 
  FaBan, 
  FaChartLine, 
  FaExclamationTriangle,
  FaCheckCircle,
  FaTimesCircle,
  FaUserShield,
  FaServer
} from 'react-icons/fa';

interface SecurityMetrics {
  totalRequests: number;
  blockedRequests: number;
  uniqueIPs: number;
  rateLimitHits: number;
  suspiciousActivity: Array<{
    id: string;
    type: string;
    ip: string;
    timestamp: Date;
    details: string;
  }>;
  topEndpoints: Array<{
    endpoint: string;
    count: number;
    avgResponseTime: number;
  }>;
}

export default function SecurityDashboard() {
  const { data: session } = useSession();
  const router = useRouter();
  const [metrics, setMetrics] = useState<SecurityMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Mock data - in production, fetch from API
  useEffect(() => {
    const fetchMetrics = async () => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setMetrics({
        totalRequests: 145892,
        blockedRequests: 1247,
        uniqueIPs: 8934,
        rateLimitHits: 523,
        suspiciousActivity: [
          {
            id: '1',
            type: 'rate_limit',
            ip: '192.168.1.100',
            timestamp: new Date(Date.now() - 300000),
            details: 'Exceeded rate limit: 150 requests in 1 minute'
          },
          {
            id: '2',
            type: 'invalid_auth',
            ip: '10.0.0.50',
            timestamp: new Date(Date.now() - 600000),
            details: 'Multiple failed authentication attempts'
          },
          {
            id: '3',
            type: 'malformed_request',
            ip: '172.16.0.25',
            timestamp: new Date(Date.now() - 900000),
            details: 'Malformed GraphQL query detected'
          }
        ],
        topEndpoints: [
          { endpoint: '/api/graphql', count: 45230, avgResponseTime: 125 },
          { endpoint: '/api/protected/league-stats', count: 23450, avgResponseTime: 89 },
          { endpoint: '/api/auth/session', count: 18920, avgResponseTime: 45 },
          { endpoint: '/api/protected/user', count: 12340, avgResponseTime: 67 }
        ]
      });
      
      setLoading(false);
    };

    fetchMetrics();
    
    if (autoRefresh) {
      const interval = setInterval(fetchMetrics, 30000); // Refresh every 30 seconds
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
          <p className="text-white">Loading security metrics...</p>
        </div>
      </div>
    );
  }

  const blockRate = metrics ? (metrics.blockedRequests / metrics.totalRequests * 100).toFixed(2) : 0;

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
              <FaShieldAlt className="text-blue-500" />
              Security Dashboard
            </h1>
            <p className="text-gray-400 mt-2">Real-time security monitoring and threat detection</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4"
          >
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

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800"
          >
            <div className="flex items-center justify-between mb-4">
              <FaChartLine className="text-blue-500 text-2xl" />
              <span className="text-xs text-gray-500">Last 24h</span>
            </div>
            <h3 className="text-gray-400 text-sm mb-1">Total Requests</h3>
            <p className="text-3xl font-bold text-white">{metrics?.totalRequests.toLocaleString()}</p>
            <p className="text-sm text-green-400 mt-2">+12.5% from yesterday</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800"
          >
            <div className="flex items-center justify-between mb-4">
              <FaBan className="text-red-500 text-2xl" />
              <span className="text-xs text-gray-500">Last 24h</span>
            </div>
            <h3 className="text-gray-400 text-sm mb-1">Blocked Requests</h3>
            <p className="text-3xl font-bold text-white">{metrics?.blockedRequests.toLocaleString()}</p>
            <p className="text-sm text-orange-400 mt-2">{blockRate}% block rate</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800"
          >
            <div className="flex items-center justify-between mb-4">
              <FaUserShield className="text-purple-500 text-2xl" />
              <span className="text-xs text-gray-500">Last 24h</span>
            </div>
            <h3 className="text-gray-400 text-sm mb-1">Unique IPs</h3>
            <p className="text-3xl font-bold text-white">{metrics?.uniqueIPs.toLocaleString()}</p>
            <p className="text-sm text-blue-400 mt-2">Active users</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800"
          >
            <div className="flex items-center justify-between mb-4">
              <FaExclamationTriangle className="text-yellow-500 text-2xl" />
              <span className="text-xs text-gray-500">Last 24h</span>
            </div>
            <h3 className="text-gray-400 text-sm mb-1">Rate Limit Hits</h3>
            <p className="text-3xl font-bold text-white">{metrics?.rateLimitHits.toLocaleString()}</p>
            <p className="text-sm text-yellow-400 mt-2">Throttled requests</p>
          </motion.div>
        </div>

        {/* Suspicious Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800 mb-8"
        >
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <FaExclamationTriangle className="text-yellow-500" />
            Recent Suspicious Activity
          </h2>
          
          <div className="space-y-3">
            {metrics?.suspiciousActivity.map((activity) => (
              <div
                key={activity.id}
                className="bg-gray-800/50 rounded-lg p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-lg ${
                    activity.type === 'rate_limit' ? 'bg-yellow-500/20' :
                    activity.type === 'invalid_auth' ? 'bg-red-500/20' :
                    'bg-orange-500/20'
                  }`}>
                    {activity.type === 'rate_limit' && <FaExclamationTriangle className="text-yellow-500" />}
                    {activity.type === 'invalid_auth' && <FaTimesCircle className="text-red-500" />}
                    {activity.type === 'malformed_request' && <FaBan className="text-orange-500" />}
                  </div>
                  
                  <div>
                    <p className="text-white font-medium">{activity.details}</p>
                    <p className="text-sm text-gray-400">
                      IP: {activity.ip} • {new Date(activity.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
                
                <button className="px-3 py-1 bg-red-500/20 text-red-400 rounded-lg text-sm hover:bg-red-500/30 transition-colors">
                  Block IP
                </button>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Top Endpoints */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800"
        >
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <FaServer className="text-blue-500" />
            Top API Endpoints
          </h2>
          
          <div className="space-y-3">
            {metrics?.topEndpoints.map((endpoint, index) => (
              <div key={endpoint.endpoint} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-white font-medium">{endpoint.endpoint}</span>
                    <span className="text-sm text-gray-400">{endpoint.count.toLocaleString()} requests</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(endpoint.count / (metrics?.topEndpoints[0].count || 1)) * 100}%` }}
                      transition={{ duration: 0.5, delay: 0.7 + index * 0.1 }}
                      className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full"
                    />
                  </div>
                </div>
                <div className="ml-4 text-right">
                  <p className="text-sm text-gray-400">Avg Response</p>
                  <p className={`text-sm font-medium ${
                    endpoint.avgResponseTime < 100 ? 'text-green-400' :
                    endpoint.avgResponseTime < 200 ? 'text-yellow-400' :
                    'text-red-400'
                  }`}>
                    {endpoint.avgResponseTime}ms
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Security Status */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-8 bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-xl p-6 border border-green-500/30 text-center"
        >
          <FaCheckCircle className="text-5xl text-green-400 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-white mb-2">System Secure</h3>
          <p className="text-gray-300">All security measures are active and functioning properly</p>
        </motion.div>
      </div>
    </div>
  );
}