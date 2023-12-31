import React from 'react';
import { CgWorkAlt } from 'react-icons/cg';
// import { FaReact } from 'react-icons/fa';
// import { LuGraduationCap } from 'react-icons/lu';
import nike from '@/public/nike.png';
import trustage from '@/public/trustage.png';
import mailgun from '@/public/mailgun.png';

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
    name: 'Contact',
    hash: '#contact',
  },
] as const;

export const experiencesData = [
  {
    title: 'TruStage',
    location: ' Software Engineer III',
    description:
      'Full-stack developer working primarily with Chart.js, React, Node.js, Express and Azure.',
    icon: React.createElement(CgWorkAlt),
    date: '2021 -  present',
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
    title: 'TruStage',
    description:
      "While working with TruStage I've worked as a full-stack developer focusing on developing data visualizations to provide Credit Unions with detailed analytics.",
    tags: ['React', 'Chart.js', 'Node.js', 'Express', 'MySQL', 'Azure'],
    imageUrl: trustage,
  },
  {
    title: 'Mailgun',
    description:
      'While working with Mailgun I worked on the public facing SaaS mail analytics dashboard providing detailed email insights for our customers.',
    tags: ['React', 'Redux', 'Storybook', 'Python', 'Flask'],
    imageUrl: mailgun,
  },
  {
    title: 'Nike',
    description:
      'While working with Nike I worked on the Member Access Dashboard for internal teams to create content for Member Access.',
    tags: ['React', 'Redux', 'Node.js', 'Express', 'GraphQL', 'AWS'],
    imageUrl: nike,
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
