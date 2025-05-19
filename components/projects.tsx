'use client';

import React from 'react';
import SectionHeading from './section-heading';
import { projectsData } from '@/lib/data';
import Project from './project';
import { useSectionInView } from '@/lib/hooks';
import { motion } from 'framer-motion';

export default function Projects() {
  const { ref } = useSectionInView('Projects', 0.5);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      }
    }
  };

  return (
    <section ref={ref} id="projects" className="scroll-mt-28 mb-28">
      <SectionHeading>My projects</SectionHeading>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
      >
        {projectsData.map((project, index) => (
          <motion.div
            key={index}
            className="mb-3 sm:mb-8 last:mb-0"
            variants={{
              hidden: { 
                opacity: 0, 
                x: index % 2 === 0 ? -100 : 100,
                rotate: index % 2 === 0 ? -5 : 5
              },
              visible: { 
                opacity: 1, 
                x: 0,
                rotate: 0,
                transition: {
                  type: "spring",
                  stiffness: 100,
                  damping: 12,
                  duration: 0.8
                }
              }
            }}
          >
            <Project {...project} />
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
