'use client';

import React from 'react';
import SectionHeading from './section-heading';
import { motion } from 'framer-motion';
import { useSectionInView } from '@/lib/hooks';

export default function About() {
  const { ref } = useSectionInView('About');

  return (
    <motion.section
      ref={ref}
      className="mb-28 max-w-[45rem] text-center leading-8 sm:mb-40 scroll-mt-28"
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.175 }}
      id="about"
    >
      <SectionHeading>About me</SectionHeading>
      <p className="mb-10">
        Hello, and welcome to my slice of the digital world! I'm a seasoned full
        stack engineer with a decade-long journey in software development,
        starting as an eager intern in Addison, TX, where my fascination with
        technology transformed brochure websites into immersive experiences. My
        career is a tapestry of opportunities with esteemed names like
        Rackspace, Mailgun, Trustage, and Nike, where I've honed my skills and
        contributed to teams pushing the boundaries of what's possible.
      </p>
      <p className="mb-10">
        My professional ethos is anchored in three core tenets: hard work,
        continuous learning, and a relentless passion for innovation. These
        principles have not just shaped my career; they've become the keystones
        of my day-to-day approach to solving problems. Working with modern
        stacks such as React, Redux, and Node.js, I'm deeply versed in the
        rhythms of TDD, CI/CD, and Agile methodologies – essentials for crafting
        robust, scalable, and maintainable software.
      </p>
      <p className="mb-10">
        I thrive on collaboration, with a belief that the greatest triumphs come
        from being a dedicated team player. Whether it's learning a new stack or
        diving into uncharted business logic, my goal is to ensure that my team
        doesn't just succeed but excels.
      </p>
      <p className="mb-10">
        When I'm not decoding problems, you'll find me capturing life through
        the lens of my camera, exploring trails and the serenity of nature on
        hikes, vanquishing video game foes, or cherishing time with family and
        my playful dogs. Each of these passions, in their own way, reflects my
        love for exploration, story-telling, and unwavering commitment – be it
        in pixels or the real world.
      </p>
      <p className="mb-10">
        As I look to the horizon, my aspirations are clear: to lead a team of
        outstanding engineers, guiding a high-priority initiative to fruition. I
        envision a future where my leadership and technical skills converge to
        make impactful contributions to technology and to the people whose lives
        are shaped by it.
      </p>
      <p className="mb-10">
        I resonate deeply with the words of André Gide, "Believe those who are
        seeking the truth; doubt those who find it." It's a reminder to stay
        humble in our pursuit of knowledge and open-minded to the endless
        possibilities of what we may uncover. So, whether you're here for
        collaboration, to exchange insights, or just to say hello, I'm glad
        you're here. Let's build something great together.
      </p>
    </motion.section>
  );
}
