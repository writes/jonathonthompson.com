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
      <p className="mb-3">
        About me info Did you hear that? They've shut down the main reactor.
        We'll be destroyed for sure. This is madness! We're doomed! There'll be
        no escape for the Princess this time. What's that? Artoo! Artoo-Detoo,
        where are you? At last! Where have you been? They're heading in this
        direction. What are we going to do? We'll be sent to the spice mine of
        Kessel or smashed into who knows what! Wait a minute, where are you
        going? The Death Star plans are not in the main computer. Where are
        those transmissions you intercepted? What have you done with those
        plans? We intercepted no transmissions. Aaah., This is a consular ship.
        It is our only hope. Yes. We are approaching the planet Yavin. The Rebel
        base is on a moon on the far side. We are preparing to orbit the planet.
        Okay, hit it! We're coming up on the sentry ships. Hold 'em off! Angle
        the deflector shields while I charge up the main guns! I can't believe
        he's gone. There wasn't anything you could have done. Come on, buddy,
        we're not out of this yet! You in, kid? Okay, stay sharp! Here they
        come! They're coming in too fast! Oooh! We've lost lateral controls. You
        must do what you feel is right, of course. Until this battle station is
        fully operational we are vulnerable. The Rebel Alliance is too well
        equipped. They're more dangerous than you realize.
      </p>

      <p>
        <span className="italic">When I'm not coding</span>, I enjoy playing
        video games, watching movies, and playing with my dogß. I also enjoy{' '}
        <span className="font-medium">learning new things</span>. I am currently
        learning about{' '}
        <span className="font-medium">technology and the stock market</span>.
      </p>
    </motion.section>
  );
}
