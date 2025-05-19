"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { HiUsers, HiShieldCheck, HiChartBar, HiCog, HiDatabase, HiRefresh } from "react-icons/hi";
import { UserRole } from "@/lib/auth-advanced";

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState({
    totalUsers: 2,
    activeUsers: 1,
    totalSessions: 1,
    apiCalls: 0
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin?callbackUrl=/admin");
    } else if (session && session.user.role !== UserRole.ADMIN) {
      router.push("/auth/unauthorized");
    }
  }, [status, session, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!session || session.user.role !== UserRole.ADMIN) {
    return null;
  }

  const dashboardCards = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: HiUsers,
      color: "from-blue-500 to-blue-600",
      change: "+12%"
    },
    {
      title: "Active Sessions",
      value: stats.activeUsers,
      icon: HiShieldCheck,
      color: "from-green-500 to-green-600",
      change: "+5%"
    },
    {
      title: "Total Sessions",
      value: stats.totalSessions,
      icon: HiChartBar,
      color: "from-purple-500 to-purple-600",
      change: "+23%"
    },
    {
      title: "API Calls",
      value: stats.apiCalls,
      icon: HiDatabase,
      color: "from-orange-500 to-orange-600",
      change: "0%"
    }
  ];

  const recentActivity = [
    { user: "demo@leaguestats.com", action: "Signed in", time: "2 minutes ago", status: "success" },
    { user: "admin@portfolio.com", action: "Updated profile", time: "1 hour ago", status: "success" },
    { user: "demo@leaguestats.com", action: "Failed login attempt", time: "3 hours ago", status: "error" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Admin Dashboard</h1>
              <p className="text-gray-400">Welcome back, {session.user.name}</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <HiRefresh className="w-5 h-5" />
              Refresh
            </motion.button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {dashboardCards.map((card, index) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg bg-gradient-to-r ${card.color}`}>
                    <card.icon className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-green-400 text-sm font-semibold">{card.change}</span>
                </div>
                <h3 className="text-gray-400 text-sm mb-1">{card.title}</h3>
                <p className="text-3xl font-bold text-white">{card.value}</p>
              </motion.div>
            ))}
          </div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 p-6"
          >
            <h2 className="text-xl font-bold text-white mb-6">Recent Activity</h2>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-2 h-2 rounded-full ${
                      activity.status === "success" ? "bg-green-500" : "bg-red-500"
                    }`} />
                    <div>
                      <p className="text-white font-medium">{activity.user}</p>
                      <p className="text-gray-400 text-sm">{activity.action}</p>
                    </div>
                  </div>
                  <p className="text-gray-500 text-sm">{activity.time}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            <button className="bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 p-6 hover:bg-white/10 transition-colors text-left">
              <HiUsers className="w-8 h-8 text-purple-400 mb-4" />
              <h3 className="text-white font-semibold mb-2">Manage Users</h3>
              <p className="text-gray-400 text-sm">View and manage all user accounts</p>
            </button>

            <button className="bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 p-6 hover:bg-white/10 transition-colors text-left">
              <HiCog className="w-8 h-8 text-purple-400 mb-4" />
              <h3 className="text-white font-semibold mb-2">System Settings</h3>
              <p className="text-gray-400 text-sm">Configure application settings</p>
            </button>

            <button className="bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 p-6 hover:bg-white/10 transition-colors text-left">
              <HiChartBar className="w-8 h-8 text-purple-400 mb-4" />
              <h3 className="text-white font-semibold mb-2">Analytics</h3>
              <p className="text-gray-400 text-sm">View detailed usage analytics</p>
            </button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}