import { Hero } from '../../components/organisms/Hero';
import { ProgramsGrid } from '../../components/organisms/ProgramsGrid';
import { CenterFinder } from '../../components/organisms/CenterFinder';
import { ConsentBanner } from '../../components/organisms/ConsentBanner';
import { PageShell } from '../../components/layouts/PageShell';
import Head from 'next/head';

export default function Microsite() {
  const heroFields = {
    title: { value: 'Welcome to KinderCare' },
    body: { value: '<p>Providing quality childcare for families.</p>' },
    image: {
      value: {
        src: 'https://images.unsplash.com/photo-1544717297-fa95b6ee9643',
        alt: 'Children playing',
      },
    },
    ctaText: { value: 'Get Started' },
    ctaUrl: { value: '/contact' },
  };

  const programsFields = {
    title: { value: 'Our Programs' },
    programs: [
      {
        name: { value: 'Infant Care' },
        ageRange: { value: '6w–12m' },
        summary: { value: 'Nurturing care for the youngest.' },
      },
      {
        name: { value: 'Toddler Program' },
        ageRange: { value: '1–2y' },
        summary: { value: 'Exploration and learning.' },
      },
      {
        name: { value: 'Pre-K' },
        ageRange: { value: '3–5y' },
        summary: { value: 'Preparing for school.' },
      },
    ],
  };

  return (
    <PageShell>
      <Head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'KinderCare',
              url: 'https://jonathonthompson.com/microsite',
              logo: 'https://images.unsplash.com/photo-1544717297-fa95b6ee9643',
              contactPoint: {
                '@type': 'ContactPoint',
                telephone: '+1-800-123-4567',
                contactType: 'customer service',
              },
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'ChildCare',
              name: 'KinderCare Capitol Hill',
              address: {
                '@type': 'PostalAddress',
                streetAddress: '123 Pine St',
                addressLocality: 'Seattle',
                addressRegion: 'WA',
                postalCode: '98102',
              },
              telephone: '+1-206-555-0100',
              openingHours: 'Mo-Fr 07:00-18:00',
            }),
          }}
        />
      </Head>
      <ConsentBanner />
      <Hero fields={heroFields} />
      <ProgramsGrid fields={programsFields} />
      <CenterFinder />
    </PageShell>
  );
}
