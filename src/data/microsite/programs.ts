export type Program = {
  id: string;
  name: string;
  ageRange: string;
  summary: string;
};

export const programs: Program[] = [
  {
    id: 'microsite-program-infant',
    name: 'Infant Care',
    ageRange: '6w-12m',
    summary:
      'Nurturing care for the youngest learners with a focus on bonding and sensory exploration.',
  },
  {
    id: 'microsite-program-toddler',
    name: 'Toddler Program',
    ageRange: '1-2 years',
    summary:
      'Encourages curiosity and confidence through music, movement, and language-rich play.',
  },
  {
    id: 'microsite-program-prek',
    name: 'Pre-K',
    ageRange: '3-5 years',
    summary:
      'Prepares children for kindergarten with hands-on STEAM lessons and social-emotional learning.',
  },
];
