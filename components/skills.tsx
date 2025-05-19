'use client';

import React from 'react';
import SectionHeading from './section-heading';
import { skillsData } from '@/lib/data';
import { useSectionInView } from '@/lib/hooks';
import { motion } from 'framer-motion';

const fadeInAnimationVariants = {
  initial: {
    opacity: 0,
    y: 100,
    scale: 0,
  },
  animate: (index: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 12,
      delay: 0.05 * index,
    },
  }),
  hover: {
    scale: 1.1,
    rotate: [0, 3, -3, 0],
    transition: {
      duration: 0.3,
    },
  },
};

export default function Skills() {
  const { ref } = useSectionInView('Skills');

  return (
    <section
      id="skills"
      ref={ref}
      className="mb-28 max-w-[53rem] scroll-mt-28 text-center sm:mb-40"
    >
      <SectionHeading>My skills</SectionHeading>
      <ul className="flex flex-wrap justify-center gap-2 text-lg text-gray-800">
        {skillsData.map((skill, index) => (
          <motion.li
            className="bg-white borderBlack rounded-xl px-5 py-3 dark:bg-white/10 dark:text-white/80 cursor-pointer"
            key={index}
            variants={fadeInAnimationVariants}
            initial="initial"
            whileInView="animate"
            whileHover="hover"
            viewport={{
              once: true,
            }}
            custom={index}
          >
            <motion.span
              initial={{ display: "inline-block" }}
              whileHover={{
                scale: [1, 1.2, 1],
                transition: { duration: 0.3 }
              }}
            >
              {skill}
            </motion.span>
          </motion.li>
        ))}
      </ul>
    </section>
  );
}
