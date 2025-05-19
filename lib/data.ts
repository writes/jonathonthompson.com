import React from 'react';
import { CgWorkAlt } from 'react-icons/cg';
// import { FaReact } from 'react-icons/fa';
// import { LuGraduationCap } from 'react-icons/lu';
import rtwa from '@/public/rt-wa.png';
import solana from '@/public/solana.png';

export const links = [
  {
    name: 'Home',
    hash: '#home',
  },
  {
    name: 'About',
    hash: '#about',
  },
  {
    name: 'Projects',
    hash: '#projects',
  },
  {
    name: 'Skills',
    hash: '#skills',
  },
  {
    name: 'Experience',
    hash: '#experience',
  },
  {
    name: 'League Stats',
    hash: '/league',
  },
  {
    name: 'Contact',
    hash: '#contact',
  },
] as const;

export const experiencesData = [
  {
    title: 'Microsoft',
    location: 'Software Engineer III',
    description:
      'Frontend lead building applications to enable Microsoft employees through AI integration.',
    icon: React.createElement(CgWorkAlt),
    date: '2024 - present',
  },
  {
    title: 'TruStage',
    location: ' Software Engineer III',
    description:
      'Full-stack developer working primarily with Chart.js, React, Node.js, Express and Azure.',
    icon: React.createElement(CgWorkAlt),
    date: '2021 - 2024',
  },
  {
    title: 'Mailgun',
    location: 'Software Developer II',
    description:
      'Senior Front-end developer focusing on building out reusable components in Storybook with React and Redux connecting to a Python back-end',
    icon: React.createElement(CgWorkAlt),
    date: '2019 - 2021',
  },
  {
    title: 'Nike',
    location: 'Senior Software Engineer',
    description:
      'Full-stack developer working primarily with React, Redux, Node.js, Express and GraphQL. ',
    icon: React.createElement(CgWorkAlt),
    date: '2018 - 2019',
  },
] as const;

export const projectsData = [
  {
    title: 'Solana Trading Bot',
    description:
      'Architected an automated cryptocurrency trading bot, featuring real-time market analysis, smart contract integration, and automated trading strategies.',
    tags: ['TypeScript', 'Solana', 'Web3.js', 'Node.js', 'Quicknode'],
    imageUrl: solana,
  },
  {
    title: 'rt-wa.com',
    description:
      'Designed and developed a fully responsive marketing website for the Riley Thompson Wealth Management team.',
    tags: ['Next.js', 'Vercel', 'Resend'],
    imageUrl: rtwa,
  },
] as const;

export const skillsData = [
  'JavaScript',
  'TypeScript',
  'React',
  'Redux',
  'Next.js',
  'Node.js',
  'Express',
  'GraphQL',
  'AWS',
  'Azure',
  'HTML',
  'CSS',
  'TailWind',
  'Storybook',
] as const;
