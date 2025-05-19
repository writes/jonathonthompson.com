'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

export default function AnimationDemo() {
  const [showDemo, setShowDemo] = useState(true);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100
      }
    }
  };

  const pathVariants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: {
        pathLength: { duration: 2, ease: "easeInOut" },
        opacity: { duration: 0.01 }
      }
    }
  };

  return (
    <AnimatePresence>
      {showDemo && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={() => setShowDemo(false)}
        >
          <motion.div
            className="bg-white dark:bg-gray-800 rounded-xl p-8 max-w-4xl mx-4 relative"
            onClick={(e) => e.stopPropagation()}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.button
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowDemo(false)}
            >
              ✕
            </motion.button>

            <motion.h2 
              className="text-3xl font-bold text-center mb-8"
              variants={itemVariants}
            >
              Framer Motion Showcase
            </motion.h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <motion.div variants={itemVariants} className="text-center">
                <h3 className="font-semibold mb-4">Spring Animation</h3>
                <motion.div
                  className="w-24 h-24 bg-purple-500 rounded-lg mx-auto"
                  animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 360],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                />
              </motion.div>

              <motion.div variants={itemVariants} className="text-center">
                <h3 className="font-semibold mb-4">Drag & Drop</h3>
                <motion.div
                  className="w-24 h-24 bg-blue-500 rounded-full mx-auto cursor-grab"
                  drag
                  dragConstraints={{ left: -50, right: 50, top: -50, bottom: 50 }}
                  whileHover={{ scale: 1.1 }}
                  whileDrag={{ scale: 1.2, cursor: "grabbing" }}
                />
              </motion.div>

              <motion.div variants={itemVariants} className="text-center">
                <h3 className="font-semibold mb-4">SVG Path Animation</h3>
                <svg 
                  width="96" 
                  height="96" 
                  viewBox="0 0 96 96" 
                  className="mx-auto"
                >
                  <motion.path
                    d="M48 16 L64 40 L48 64 L32 40 Z"
                    fill="none"
                    stroke="rgb(34 197 94)"
                    strokeWidth="4"
                    variants={pathVariants}
                    initial="hidden"
                    animate="visible"
                  />
                </svg>
              </motion.div>

              <motion.div variants={itemVariants} className="text-center">
                <h3 className="font-semibold mb-4">Gesture Recognition</h3>
                <motion.div
                  className="w-24 h-24 bg-gradient-to-r from-pink-500 to-orange-500 rounded-lg mx-auto"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                />
              </motion.div>
            </div>

            <motion.p 
              className="text-center mt-8 text-gray-600 dark:text-gray-300"
              variants={itemVariants}
            >
              Click anywhere outside to close
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}