"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { HiUser, HiMail, HiShieldCheck, HiClock, HiLogout, HiKey, HiDeviceMobile } from "react-icons/hi";
import { FaGithub, FaGoogle } from "react-icons/fa";

export default function ProfilePage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin?callbackUrl=/profile");
    }
  }, [status, router]);

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

  if (!session) {
    return null;
  }

  const handleSignOut = async () => {
    setIsLoading(true);
    await signOut({ callbackUrl: "/" });
  };

  const providerIcons: Record<string, React.ReactNode> = {
    github: <FaGithub className="w-5 h-5" />,
    google: <FaGoogle className="w-5 h-5" />,
    credentials: <HiKey className="w-5 h-5" />
  };

  const roleColors: Record<string, string> = {
    ADMIN: "text-red-400 bg-red-400/10 border-red-400/20",
    MODERATOR: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
    USER: "text-green-400 bg-green-400/10 border-green-400/20"
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Header */}
          <div className="text-center">
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl font-bold text-white mb-4"
            >
              Profile Settings
            </motion.h1>
            <p className="text-gray-400">Manage your account and preferences</p>
          </div>

          {/* Profile Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 overflow-hidden"
          >
            {/* Profile Header */}
            <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 p-8">
              <div className="flex items-center gap-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.2 }}
                  className="relative"
                >
                  {session.user?.image ? (
                    <img
                      src={session.user.image}
                      alt={session.user.name || "Profile"}
                      className="w-24 h-24 rounded-full border-4 border-white/20"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                      <HiUser className="w-12 h-12 text-white" />
                    </div>
                  )}
                  <motion.div
                    className="absolute -bottom-2 -right-2 bg-gray-900 rounded-full p-2 border-2 border-white/20"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    {providerIcons[session.user.provider]}
                  </motion.div>
                </motion.div>

                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-white mb-1">
                    {session.user.name || "User"}
                  </h2>
                  <p className="text-gray-400 mb-3">{session.user.email}</p>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${roleColors[session.user.role]}`}>
                      {session.user.role}
                    </span>
                    <span className="text-xs text-gray-500">
                      Provider: {session.user.provider}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Details */}
            <div className="p-8 space-y-6">
              {/* Account Information */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <HiShieldCheck className="w-5 h-5 text-purple-400" />
                  Account Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <p className="text-gray-400 text-sm mb-1">User ID</p>
                    <p className="text-white font-mono">{session.user.id}</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <p className="text-gray-400 text-sm mb-1">Email Verified</p>
                    <p className="text-white">
                      {session.user.email ? "Yes" : "No"}
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Session Information */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <HiClock className="w-5 h-5 text-purple-400" />
                  Session Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <p className="text-gray-400 text-sm mb-1">Last Active</p>
                    <p className="text-white">
                      {session.lastActive ? new Date(session.lastActive).toLocaleString() : "Just now"}
                    </p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <p className="text-gray-400 text-sm mb-1">Active Sessions</p>
                    <p className="text-white">{session.sessionCount || 1}</p>
                  </div>
                </div>
              </motion.div>

              {/* Security Settings */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <HiDeviceMobile className="w-5 h-5 text-purple-400" />
                  Security Settings
                </h3>
                <div className="space-y-3">
                  <button className="w-full text-left bg-white/5 rounded-lg p-4 border border-white/10 hover:bg-white/10 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white font-medium">Two-Factor Authentication</p>
                        <p className="text-gray-400 text-sm">Add an extra layer of security</p>
                      </div>
                      <span className="text-gray-500">Coming Soon</span>
                    </div>
                  </button>
                  
                  <button className="w-full text-left bg-white/5 rounded-lg p-4 border border-white/10 hover:bg-white/10 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white font-medium">Manage Sessions</p>
                        <p className="text-gray-400 text-sm">View and revoke active sessions</p>
                      </div>
                      <span className="text-gray-500">→</span>
                    </div>
                  </button>
                </div>
              </motion.div>

              {/* Actions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="pt-6 border-t border-white/10"
              >
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={handleSignOut}
                    disabled={isLoading}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-5 h-5 border-2 border-red-400 border-t-transparent rounded-full"
                      />
                    ) : (
                      <>
                        <HiLogout className="w-5 h-5" />
                        Sign Out
                      </>
                    )}
                  </button>
                  
                  {session.user.role === "ADMIN" && (
                    <button
                      onClick={() => router.push("/admin")}
                      className="flex items-center justify-center gap-2 px-6 py-3 bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-lg hover:bg-purple-500/30 transition-colors"
                    >
                      Admin Dashboard →
                    </button>
                  )}
                </div>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}