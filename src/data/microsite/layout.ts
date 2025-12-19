import { programs } from './programs';
import { events } from './events';

const programItems = programs.map((program) => ({
  id: program.id,
  fields: {
    name: { value: program.name },
    ageRange: { value: program.ageRange },
    summary: { value: program.summary },
  },
}));

const eventItems = events.map((event) => ({
  id: event.id,
  fields: {
    title: { value: event.title },
    date: { value: event.date },
    summary: { value: event.summary },
  },
}));

export type MicrositeLayout = ReturnType<typeof buildMicrositeLayout>;

export function buildMicrositeLayout() {
  return {
    sitecore: {
      context: {
        language: 'en',
        site: {
          name: 'Microsite',
        },
      },
      route: {
        id: 'microsite-home',
        name: 'microsite',
        displayName: 'KinderCare Microsite',
        fields: {
          pageTitle: { value: 'KinderCare Microsite' },
        },
        placeholders: {
          'jss-main': [
            {
              componentName: 'ConsentBanner',
              fields: {},
            },
            {
              componentName: 'AnnouncementBar',
              fields: {
                title: { value: 'Enrollment for Fall is Open' },
                body: {
                  value:
                    '<p>Secure your spot today and meet our award-winning teachers.</p>',
                },
                severity: { value: 'info' },
              },
            },
            {
              componentName: 'Hero',
              fields: {
                title: { value: 'Welcome to KinderCare' },
                body: {
                  value: '<p>Providing quality childcare for families.</p>',
                },
                image: {
                  value: {
                    src: 'https://images.unsplash.com/photo-1544717297-fa95b6ee9643?auto=format&fit=crop&w=1400&q=80',
                    alt: 'Children playing together',
                  },
                },
                ctaText: { value: 'Get Started' },
                ctaLink: {
                  value: {
                    href: '/contact',
                    text: 'Get Started',
                    linktype: 'internal',
                  },
                },
              },
            },
            {
              componentName: 'ProgramsGrid',
              fields: {
                title: { value: 'Our Programs' },
                programs: { value: programItems },
              },
            },
            {
              componentName: 'CenterFinder',
              fields: {
                defaultZip: { value: '98102' },
              },
            },
            {
              componentName: 'LeadForm',
              fields: {
                title: { value: 'Connect with a Center Director' },
                submitText: { value: 'Send Message' },
              },
            },
            {
              componentName: 'CalendarList',
              fields: {
                title: { value: 'Upcoming Events' },
                events: { value: eventItems },
              },
            },
          ],
        },
      },
    },
  };
}
