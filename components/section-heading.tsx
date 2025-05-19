'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

type SectionHeadingProps = {
  children: React.ReactNode;
};

export default function SectionHeading({ children }: SectionHeadingProps) {
  const { ref, inView } = useInView({
    threshold: 0.5,
    triggerOnce: true,
  });

  return (
    <motion.h2 
      ref={ref}
      className="text-3xl font-medium capitalize mb-8 text-center"
      initial={{ opacity: 0, scale: 0, y: -50 }}
      animate={inView ? { 
        opacity: 1, 
        scale: 1, 
        y: 0 
      } : {
        opacity: 0,
        scale: 0,
        y: -50
      }}
      transition={{
        type: "spring",
        stiffness: 100,
        damping: 10,
        duration: 0.8,
      }}
    >
      <motion.span
        initial={{ display: "inline-block" }}
        animate={inView ? {
          display: "inline-block",
          rotate: [0, 5, -5, 0],
        } : {}}
        transition={{ 
          delay: 0.3,
          duration: 0.6,
          ease: "easeInOut"
        }}
      >
        {children}
      </motion.span>
    </motion.h2>
  );
}
