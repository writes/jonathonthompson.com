"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { HiShieldExclamation, HiArrowLeft } from "react-icons/hi";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-gray-900 to-gray-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full text-center"
      >
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="inline-flex items-center justify-center w-24 h-24 bg-red-500/20 rounded-full mb-4">
            <HiShieldExclamation className="w-12 h-12 text-red-500" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Access Denied</h1>
          <p className="text-gray-400">You don't have permission to access this page.</p>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="space-y-4"
        >
          <p className="text-gray-300">
            This area requires elevated permissions. If you believe this is an error, 
            please contact an administrator.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
            >
              <HiArrowLeft className="w-5 h-5" />
              Go Home
            </Link>
            <Link
              href="/profile"
              className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              View Profile
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}