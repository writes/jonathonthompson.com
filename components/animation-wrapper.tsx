'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

interface AnimationWrapperProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export default function AnimationWrapper({ 
  children, 
  className = '', 
  delay = 0 
}: AnimationWrapperProps) {
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: false,
  });

  const variants = {
    hidden: {
      opacity: 0,
      y: 100,
      scale: 0.95,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.7,
        delay,
        ease: [0.6, -0.05, 0.01, 0.99],
      },
    },
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={variants}
    >
      {children}
    </motion.div>
  );
}