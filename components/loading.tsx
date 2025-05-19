'use client';

import { motion } from 'framer-motion';
import React from 'react';

const loadingContainerVariants = {
  start: {
    transition: {
      staggerChildren: 0.2,
    },
  },
  end: {
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const loadingCircleVariants = {
  start: {
    y: "0%",
  },
  end: {
    y: "100%",
  },
};

const loadingCircleTransition = {
  duration: 0.5,
  repeat: Infinity,
  repeatType: "reverse" as const,
  ease: 'easeInOut',
};

export default function Loading() {
  const [progress, setProgress] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prevProgress) => {
        if (prevProgress >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prevProgress + 2;
      });
    }, 30);

    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.5 }}
      transition={{ duration: 0.5, ease: 'easeInOut' }}
    >
      <motion.div
        variants={loadingContainerVariants}
        initial="start"
        animate="end"
        className="flex gap-2 mb-8"
      >
        {Array.from({ length: 5 }).map((_, index) => (
          <motion.span
            key={index}
            className="block h-4 w-4 rounded-full bg-gradient-to-r from-purple-500 to-blue-500"
            variants={loadingCircleVariants}
            transition={{
              ...loadingCircleTransition,
              delay: index * 0.1,
            }}
          />
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="text-center"
      >
        <motion.h1 
          className="text-3xl font-bold bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent mb-4"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ 
            type: "spring",
            stiffness: 260,
            damping: 20,
            delay: 0.5 
          }}
        >
          Jonathon Thompson
        </motion.h1>
        
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          className="h-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full mb-2 mx-auto"
          style={{ maxWidth: "200px" }}
        />
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-gray-600 dark:text-gray-300"
        >
          {progress < 100 ? `Loading... ${progress}%` : 'Welcome!'}
        </motion.p>
      </motion.div>
    </motion.div>
  );
}